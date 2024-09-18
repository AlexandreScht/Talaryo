import config from '@/config';
import { accessUsers } from '@/config/access';
import { InvalidArgumentError, InvalidCredentialsError, InvalidSessionError, ServerException, ServicesError } from '@/exceptions';
import { registerCredentials, registerOauth } from '@/interfaces/service';
import { codeToken, TokenUser, TwoFactorAuthenticateToken } from '@/interfaces/token';
import MemoryServerCache from '@/libs/memoryCache';
import ApiServiceFile from '@/services/api';
import AuthServiceFile from '@/services/auth';
import MailerServiceFile from '@/services/mailer';
import UserServiceFile from '@/services/users';
import createSessionCookie from '@/utils/createCookie';
import { verifyAuthenticator2FA } from '@/utils/token';
import {
  AuthControllerActivate2FA,
  AuthControllerAskCode,
  AuthControllerLogin,
  AuthControllerOAuth,
  AuthControllerRegister,
  AuthControllerValidAccount,
  AuthControllerVerify2FA,
  ControllerMethods,
  ExpressHandler,
} from '@interfaces/controller';
import { transaction } from 'objection';
import Container from 'typedi';

export default class AuthControllerFile implements ControllerMethods<AuthControllerFile> {
  private AuthService: AuthServiceFile;
  private APIService: ApiServiceFile;
  private UserService: UserServiceFile;
  private MailerService: MailerServiceFile;
  private MemoryServerCache: MemoryServerCache;

  constructor() {
    this.AuthService = Container.get(AuthServiceFile);
    this.UserService = Container.get(UserServiceFile);
    this.MailerService = Container.get(MailerServiceFile);
    this.MemoryServerCache = Container.get(MemoryServerCache);
    this.APIService = Container.get(ApiServiceFile);
  }

  protected register: ExpressHandler<AuthControllerRegister> = async ({
    locals: {
      body: { email, password, firstName, lastName },
    },
    res,
    next,
  }) => {
    try {
      if (new URL(config.ORIGIN).hostname === 'test.talaryo.com' && !accessUsers.includes(email)) {
        throw new InvalidCredentialsError('Seul les comptes développeur peuvent ce connecter sur ce site');
      }

      const userData = await this.UserService.getUser({ email, oAuthAccount: false }, ['id', 'validate']);

      if (userData) {
        const { id: userId, validate } = userData;
        if (!validate) {
          const { accessCode, accessToken } = await this.UserService.generateCodeAccess(userId);
          await this.MailerService.Registration(email, firstName, accessCode as number);
          createSessionCookie<codeToken>(res, { id: userId, accessToken, cookieName: 'access_cookie' }, '15m', true);
        } else {
          //? fake access token
          createSessionCookie<codeToken>(res, { id: null, accessToken: null, cookieName: 'access_cookie' }, '15m', true);
        }

        res.status(201).send(true);
        return;
      }

      await transaction(this.UserService.getModel, async trx => {
        const { id, accessCode, accessToken } = await this.AuthService.register<registerCredentials>(
          { email, password, firstName, lastName, ...(accessUsers.includes(email) ? { role: 'admin' } : {}) },
          trx,
        );
        if (!id || !accessToken || !accessCode) {
          throw new ServicesError('Une erreur est survenue lors de votre enregistrement');
        }

        await this.APIService.CreateBrevoUser({ email, firstName, lastName, google: false });
        await this.MailerService.Registration(email, firstName, accessCode);
        createSessionCookie<codeToken>(res, { id, accessToken, cookieName: 'access_cookie' }, '15m', true);
      });

      res.status(201).send(true);
    } catch (error) {
      next(error);
    }
  };

  protected askCode: ExpressHandler<AuthControllerAskCode> = async ({
    locals: {
      cookie: { access_cookie },
    },
    session: { sessionId },
    res,
    next,
  }) => {
    try {
      if (sessionId) {
        //? part used for 2FA
        const { accessCode, email, firstName } = await this.UserService.generateCodeAccess(sessionId, 6, true);
        await this.MailerService.TwoFactorAuthenticate(email, firstName, accessCode as number);
        res.send(true);
        return;
      }
      if (!access_cookie) throw new InvalidArgumentError("Votre code d'accès est introuvable, veuillez vous réinscrire");
      if (!access_cookie.id || !access_cookie.accessToken) {
        res.status(201).send("Un email contenant votre code d'activation de compte vous a été renvoyé");
      }
      const { id } = access_cookie;
      const { accessCode, accessToken, email, firstName } = await this.UserService.generateCodeAccess(id);
      await this.MailerService.Registration(email, firstName, accessCode as number);

      createSessionCookie<codeToken>(res, { id, accessToken, cookieName: 'access_cookie' }, '15m', true);
      res.status(201).send("Un email contenant votre code d'activation de compte vous a été renvoyé");
    } catch (error) {
      next(error);
    }
  };

  protected validateAccount: ExpressHandler<AuthControllerValidAccount> = async ({
    locals: {
      body: { access_cookie },
      params: { code },
    },
    res,
    next,
  }) => {
    try {
      if (!access_cookie || access_cookie.expired) throw new InvalidArgumentError("Votre code d'accès a expiré, veuillez en demander un nouveau.");

      if (!access_cookie.id || !access_cookie.accessToken) {
        throw new InvalidArgumentError("Impossible de valider votre compte. Code d'accès incorrect");
      }
      const { id, accessToken } = access_cookie;
      const user = await this.UserService.updateUsers(
        {
          id,
          accessToken,
          accessCode: code,
        },
        { accessToken: null, accessCode: null, validate: true },
      );
      if (!user) {
        throw new InvalidArgumentError("Impossible de valider votre compte. Code d'accès incorrect");
      }
      res.clearCookie('access_cookie', {
        signed: true,
        httpOnly: true,
        domain: new URL(config.ORIGIN).hostname,
        secure: config.ORIGIN.startsWith('https'),
      });

      res.status(201).send('Votre compte a été validé. Vous allez être redirigé vers la page de connexion.');
    } catch (error) {
      next(error);
    }
  };

  protected login: ExpressHandler<AuthControllerLogin> = async ({
    locals: {
      body: { email, password },
    },
    res,
    next,
  }) => {
    try {
      const userData = await this.UserService.getUser({ email, oAuthAccount: false }, [
        'id',
        'validate',
        'password',
        'role',
        'twoFactorType',
        'firstName',
        'checkPassword',
      ]);

      if (!userData) {
        throw new InvalidCredentialsError(`Email ou mot de passe invalide`);
      }
      const { id: userId, validate, role, twoFactorType, firstName } = userData;

      await this.AuthService.login(userData, password);
      if (!validate) {
        throw new InvalidSessionError('Veuillez valider votre compte par e-mail');
      }

      //; credentials required 2FA
      if (twoFactorType) {
        const { accessCode, accessToken } =
          twoFactorType === 'email' ? await this.UserService.generateCodeAccess(userId, 6) : await this.UserService.generateTokenAccess(userId);

        if (accessCode) {
          await this.MailerService.Registration(email, firstName, accessCode as number);
        }

        createSessionCookie<TwoFactorAuthenticateToken>(res, { id: userId, accessToken, twoFA: twoFactorType, cookieName: 'TwoFA_cookie' }, '15m');
        res.send({ role, TwoFA: twoFactorType });
        return;
      }

      const refreshToken = await this.MemoryServerCache.newUserAccessToken(userId);

      createSessionCookie<TokenUser>(res, { refreshToken, sessionId: userId, sessionRole: role, cookieName: config.COOKIE_NAME }, '31d');
      res.send({ role });
    } catch (error) {
      next(error);
    }
  };

  protected oAuthConnect: ExpressHandler<AuthControllerOAuth> = async ({
    locals: {
      query: { email, firstName, lastName },
    },
    res,
    next,
  }) => {
    try {
      const userFound = await this.UserService.getUser({ email, oAuthAccount: true }, ['id', 'role']);

      const { id: userId, role } = userFound
        ? userFound
        : await transaction(this.UserService.getModel, async trx => {
            const user = await this.AuthService.register<registerOauth>(
              { email, firstName, lastName, ...(accessUsers.includes(email) ? { role: 'admin' } : {}) },
              trx,
            );
            if (!user) {
              throw new ServicesError('Une erreur est survenue lors de votre connexion');
            }

            await this.APIService.CreateBrevoUser({ email, firstName, lastName, google: false });

            return user;
          });

      const refreshToken = await this.MemoryServerCache.newUserAccessToken(userId);

      createSessionCookie<TokenUser>(res, { refreshToken, sessionId: userId, sessionRole: role, cookieName: config.COOKIE_NAME }, '31d');
      res.send({ role });
    } catch (error) {
      next(error);
    }
  };

  protected activate2FA: ExpressHandler<AuthControllerActivate2FA> = async ({
    locals: {
      body: { twoFactorType, otp },
      token,
    },
    session: { sessionId },
    res,
    next,
  }) => {
    try {
      if (twoFactorType === 'email') {
        const user = await this.UserService.updateUsers(
          {
            id: sessionId,
            accessCode: otp,
          },
          { twoFactorType: 'email' },
        );
        if (!user) throw new InvalidCredentialsError("Le code d'accès est incorrect");
        res.send(true);
        return;
      }
      if (!token) throw new ServerException();
      const success = verifyAuthenticator2FA(token as string, String(otp));
      if (!success) throw new InvalidCredentialsError("Le code d'accès est incorrect");

      await this.UserService.updateUsers(
        {
          id: sessionId,
        },
        { twoFactorType: 'authenticator', accessCode: token },
      );
      res.send(true);
    } catch (error) {
      next(error);
    }
  };

  protected verify2FA: ExpressHandler<AuthControllerVerify2FA> = async ({
    locals: {
      params: { otp },
      cookie: {
        TwoFA_cookie: { id, accessToken, twoFA },
      },
    },
    res,
    next,
  }) => {
    try {
      const {
        results: [userFind],
      } = await this.UserService.findUsers({
        criteria: {
          id: id,
          password: { not: null },
          accessToken,
          ...(twoFA === 'email' ? { accessCode: otp } : { accessCode: { not: null } }),
        },
        returning: ['accessCode', 'email', 'role'],
      });

      if (!userFind) throw new InvalidCredentialsError('Échec de la vérification à deux facteurs. Le code que vous avez saisi est incorrect.');

      const { accessCode, email, role } = userFind;

      if (twoFA === 'authenticator') {
        const success = verifyAuthenticator2FA(accessCode as string, String(otp));
        if (!success) throw new InvalidCredentialsError('Échec de la vérification à deux facteurs. Le code que vous avez saisi est incorrect.');
      }

      await this.UserService.updateUsers(
        {
          id,
        },
        { ...(twoFA === 'email' ? { accessCode: null } : {}), accessToken: null },
      );

      res.clearCookie('TwoFA_cookie', {
        signed: true,
        httpOnly: true,
        domain: new URL(config.ORIGIN).hostname,
        secure: config.ORIGIN.startsWith('https'),
      });
      const refreshToken = await this.MemoryServerCache.newUserAccessToken(id);

      createSessionCookie<TokenUser>(res, { refreshToken, sessionId: id, sessionRole: role, cookieName: config.COOKIE_NAME }, '31d');
      res.send({ email, role });
    } catch (error) {
      next(error);
    }
  };
}
