import config from '@/config';
import { accessUsers } from '@/config/access';
import { InvalidArgumentError, InvalidCredentialsError, InvalidSessionError, NotFoundError, ServerException, ServicesError } from '@/exceptions';
import { registerCredentials, registerOauth } from '@/interfaces/service';
import { codeToken, TokenUser, TwoFactorAuthenticateToken } from '@/interfaces/token';
import ApiServiceFile from '@/services/api';
import AuthServiceFile from '@/services/auth';
import MailerServiceFile from '@/services/mailer';
import UserServiceFile from '@/services/users';
import createSessionCookie from '@/utils/createCookie';
import { logger } from '@/utils/logger';
import * as tokenUtils from '@/utils/token';
import {
  AuthControllerActivate2FA,
  AuthControllerAskCode,
  AuthControllerAskResetPassword,
  AuthControllerLogin,
  AuthControllerOAuth,
  AuthControllerRegister,
  AuthControllerResetPassword,
  AuthControllerValidAccount,
  AuthControllerVerify2FA,
  ControllerMethods,
  ExpressHandler,
} from '@interfaces/controller';
import { transaction } from 'objection';
import Container from 'typedi';
import { v7 as uuid } from 'uuid';

export default class AuthControllerFile implements ControllerMethods<AuthControllerFile> {
  private AuthService: AuthServiceFile;
  private APIService: ApiServiceFile;
  private UserService: UserServiceFile;
  private MailerService: MailerServiceFile;

  constructor() {
    this.AuthService = Container.get(AuthServiceFile);
    this.UserService = Container.get(UserServiceFile);
    this.MailerService = Container.get(MailerServiceFile);
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
          const { accessCode, accessToken } = await this.UserService.generateCodeAccess(userId, 4, true);
          await this.MailerService.Registration(email, firstName, accessCode as number);
          createSessionCookie<codeToken>(res, { id: userId, accessToken, cookieName: 'access_cookie' }, '15m');
        } else {
          //? fake access token
          createSessionCookie<codeToken>(res, { id: null, accessToken: null, cookieName: 'access_cookie' }, '15m');
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
        createSessionCookie<codeToken>(res, { id, accessToken, cookieName: 'access_cookie' }, '15m');
      });

      res.status(201).send(true);
    } catch (error) {
      if (!(error instanceof ServerException)) {
        logger.error('AuthControllerFile.register => ', error);
      }
      next(error);
    }
  };

  protected askResetPassword: ExpressHandler<AuthControllerAskResetPassword> = async ({
    locals: {
      params: { email },
    },
    res,
    next,
  }) => {
    try {
      const { id: userId, validate } = (await this.UserService.getUser({ email, oAuthAccount: false }, ['id', 'validate'])) || {};
      if (!userId) {
        res.status(204).send(true);
        return;
      }
      if (!validate) throw new InvalidSessionError('Veuillez valider votre compte par e-mail.');
      const { accessToken, passwordAccess } = await this.UserService.presetNewPassword(userId);
      await this.MailerService.ResetPassword(email, passwordAccess);

      createSessionCookie<codeToken>(res, { id: userId, accessToken, cookieName: 'reset_access' }, '15m');
      res.status(204).send(true);
    } catch (error) {
      if (!(error instanceof ServerException)) {
        logger.error('AuthControllerFile.askCode => ', error);
      }
      next(error);
    }
  };

  protected resetPassword: ExpressHandler<AuthControllerResetPassword> = async ({
    locals: {
      cookie: { reset_access },
      body: { password },
      token: passwordAccess,
    },
    res,
    next,
  }) => {
    try {
      if (!reset_access) throw new NotFoundError("Votre code d'accès est introuvable. Veuillez refaire votre demande.");
      if (!reset_access?.id || !reset_access?.accessToken)
        throw new InvalidArgumentError("Votre code d'accès est incorrect. Veuillez refaire votre demande.");
      const { id, accessToken } = reset_access;
      const success = await this.UserService.updateUsers(
        { id, accessToken, password: { not: null }, passwordAccess },
        { password, passwordAccess: null },
      );

      if (!success) throw new ServicesError('Impossible de mettre à jour votre mot de passe. Veuillez contacter le support.');
      res.clearCookie('reset_access', {
        signed: true,
        httpOnly: true,
        domain: new URL(config.ORIGIN).hostname,
        secure: config.ORIGIN.startsWith('https'),
      });
      res.status(204).send(true);
    } catch (error) {
      if (!(error instanceof ServerException)) {
        logger.error('AuthControllerFile.askCode => ', error);
      }
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
      if (!access_cookie) throw new NotFoundError("Votre code d'accès est introuvable, veuillez vous réinscrire");
      if (!access_cookie?.id || !access_cookie?.accessToken) {
        res.send(true);
        return;
      }
      const { id } = access_cookie;
      const { accessCode, accessToken, email, firstName } = await this.UserService.generateCodeAccess(id, 4, true);
      await this.MailerService.Registration(email, firstName, accessCode as number);

      createSessionCookie<codeToken>(res, { id, accessToken, cookieName: 'access_cookie' }, '15m');
      res.send(true);
    } catch (error) {
      if (!(error instanceof ServerException)) {
        logger.error('AuthControllerFile.askCode => ', error);
      }
      next(error);
    }
  };

  protected validateAccount: ExpressHandler<AuthControllerValidAccount> = async ({
    locals: {
      cookie: { access_cookie },
      params: { code },
    },
    res,
    next,
  }) => {
    try {
      if (!access_cookie || access_cookie?.expired) throw new InvalidArgumentError("Votre code d'accès a expiré, veuillez en demander un nouveau.");

      if (!access_cookie.id || !access_cookie.accessToken) {
        throw new InvalidArgumentError("Impossible de valider votre compte. Code d'accès incorrect.");
      }

      const { id, accessToken } = access_cookie;

      const user = await this.UserService.updateUsers(
        {
          id,
          accessToken,
          accessCode: String(code),
        },
        { accessToken: null, accessCode: null, validate: true },
      );

      if (!user) {
        throw new InvalidArgumentError("Impossible de valider votre compte. Code d'accès incorrect.");
      }
      res.clearCookie('access_cookie', {
        signed: true,
        httpOnly: true,
        domain: new URL(config.ORIGIN).hostname,
        secure: config.ORIGIN.startsWith('https'),
      });

      res.status(201).send('Votre compte a été validé. Vous allez être redirigé vers la page de connexion.');
    } catch (error) {
      if (!(error instanceof ServerException)) {
        logger.error('AuthControllerFile.validateAccount => ', error);
      }
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
        'createdAt',
        'twoFactorType',
        'firstName',
        'lastName',
      ]);

      if (!userData) {
        throw new InvalidCredentialsError(`Email ou mot de passe incorrect !`);
      }
      const { id: userId, validate, role, twoFactorType, firstName, createdAt, lastName } = userData;

      await this.AuthService.login(userData, password);
      if (!validate) {
        throw new InvalidSessionError('Veuillez valider votre compte par e-mail.');
      }

      //; credentials required 2FA
      if (twoFactorType) {
        const { accessCode, accessToken } =
          twoFactorType === 'email' ? await this.UserService.generateCodeAccess(userId, 6) : await this.UserService.generateTokenAccess(userId);

        if (accessCode) {
          await this.MailerService.TwoFactorAuthenticate(email, firstName, accessCode as number);
        }

        createSessionCookie<TwoFactorAuthenticateToken>(res, { id: userId, accessToken, twoFA: twoFactorType, cookieName: 'TwoFA_cookie' }, '15m');
        res.send({ TwoFA: twoFactorType });
        return;
      }

      createSessionCookie<TokenUser>(res, { refreshToken: uuid(), sessionId: userId, sessionRole: role, cookieName: config.COOKIE_NAME }, '31d');
      res.send({ role, email, createdAt, firstName, lastName });
    } catch (error) {
      if (!(error instanceof ServerException)) {
        logger.error('AuthControllerFile.login => ', error);
      }
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
      const userFound = await this.UserService.getUser({ email, oAuthAccount: true }, ['id', 'role', 'createdAt']);

      const {
        id: userId,
        role,
        createdAt,
      } = userFound
        ? userFound
        : await transaction(this.UserService.getModel, async trx => {
            const user = await this.AuthService.register<registerOauth>({ email, ...(accessUsers.includes(email) ? { role: 'admin' } : {}) }, trx);
            if (!user) {
              throw new ServicesError('Une erreur est survenue lors de votre connexion');
            }

            await this.APIService.CreateBrevoUser({ email, firstName, lastName, google: false });

            return user;
          });

      createSessionCookie<TokenUser>(res, { refreshToken: uuid(), sessionId: userId, sessionRole: role, cookieName: config.COOKIE_NAME }, '31d');
      res.send({ role, email, createdAt });
    } catch (error) {
      if (!(error instanceof ServerException)) {
        logger.error('AuthControllerFile.oAuthConnect => ', error);
      }
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
            password: { not: null },
            accessCode: String(otp),
          },
          { twoFactorType: 'email' },
        );
        if (!user) throw new InvalidCredentialsError("Le code d'accès est incorrect");
        res.send(true);
        return;
      }

      if (!token) throw new ServerException();
      const success = tokenUtils.verifyAuthenticator2FA(token as string, String(otp));

      if (!success) throw new InvalidCredentialsError("Le code d'accès est incorrect");

      await this.UserService.updateUsers(
        {
          id: sessionId,
        },
        { twoFactorType: 'authenticator', accessCode: token },
      );
      res.send(true);
    } catch (error) {
      if (!(error instanceof ServerException)) {
        logger.error('AuthControllerFile.activate2FA => ', error);
      }
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
          ...(twoFA === 'email' ? { accessCode: String(otp) } : { accessCode: { not: null } }),
        },
        returning: ['accessCode', 'email', 'role', 'createdAt', 'firstName', 'lastName'],
      });

      if (!userFind) throw new InvalidCredentialsError('Échec de la vérification à deux facteurs. Le code que vous avez saisi est incorrect.');

      const { accessCode, email, role, createdAt, firstName, lastName } = userFind;

      if (twoFA === 'authenticator') {
        const success = tokenUtils.verifyAuthenticator2FA(accessCode as string, String(otp));
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
      createSessionCookie<TokenUser>(res, { refreshToken: uuid(), sessionId: id, sessionRole: role, cookieName: config.COOKIE_NAME }, '31d');
      res.send({ role, email, createdAt, firstName, lastName });
    } catch (error) {
      if (!(error instanceof ServerException)) {
        logger.error('AuthControllerFile.verify2FA => ', error);
      }
      next(error);
    }
  };
}
