import config from '@/config';
import { InvalidArgumentError, InvalidCredentialsError, InvalidSessionError, ServerException, ServicesError } from '@/exceptions';
import { ctx } from '@/interfaces/middleware';
import { registerCredentials, registerOauth } from '@/interfaces/service';
import { codeToken, TokenUser, TwoFactorAuthenticateToken } from '@/interfaces/token';
import MemoryServerCache from '@/libs/memoryCache';
import AuthServiceFile from '@/services/auth';
import MailerServiceFile from '@/services/mailer';
import { UserServiceFile } from '@/services/users';
import { createSessionToken, verifyAuthenticator2FA } from '@/utils/token';
import {
  AuthControllerActivate2FA,
  AuthControllerAskCode,
  AuthControllerAuthenticate,
  AuthControllerOAuth,
  AuthControllerRegister,
  AuthControllerValidAccount,
  AuthControllerVerify2FA,
  ControllerMethods,
  ExpressHandler,
} from '@interfaces/controller';
import type { Response } from 'express';
import parse from 'parse-duration';
import Container from 'typedi';

export default class AuthControllerFile implements ControllerMethods<AuthControllerFile> {
  private AuthService: AuthServiceFile;
  private UserService: UserServiceFile;
  private MailerService: MailerServiceFile;
  private MemoryServerCache: MemoryServerCache;

  constructor() {
    this.AuthService = Container.get(AuthServiceFile);
    this.UserService = Container.get(UserServiceFile);
    this.MailerService = Container.get(MailerServiceFile);
    this.MemoryServerCache = Container.get(MemoryServerCache);
  }

  private createSessionCookie<T extends object>(
    res: Response,
    values: T & { cookieName: string },
    timer: string = '15m',
    eternalCookie?: boolean,
  ): void {
    const { cookieName, ...other } = values;
    const sessionToken = createSessionToken<T>(other as T, timer);
    res.cookie(cookieName, sessionToken, {
      signed: true,
      httpOnly: true,
      sameSite: 'strict',
      domain: new URL(config.ORIGIN).hostname,
      secure: config.ORIGIN.startsWith('https'),
      ...(eternalCookie ? {} : { maxAge: parse(timer) }),
    });
  }

  protected register: ExpressHandler = async ({
    locals: {
      body: { email, password, firstName, lastName },
    },
    res,
    next,
  }: ctx<AuthControllerRegister>) => {
    try {
      const userData = await this.UserService.getUser({ email, oAuthAccount: false }, ['_id', 'validateAccount']);

      if (userData) {
        const { _id: userId, validateAccount } = userData;
        if (!validateAccount) {
          const { accessCode, accessToken } = await this.UserService.generateCodeAccess(userId);
          await this.MailerService.Registration(email, firstName, accessCode);
          this.createSessionCookie<codeToken>(res, { id: userId, accessToken, cookieName: 'access_cookie' }, '15m', true);
        } else {
          //? fake access token
          this.createSessionCookie<codeToken>(res, { id: null, accessToken: null, cookieName: 'access_cookie' }, '15m', true);
        }

        res.status(201).send(true);
        return;
      }

      const {
        _id: id,
        accessToken,
        accessCode,
        save,
      } = await this.AuthService.register<registerCredentials>({ email, password, firstName, lastName });

      if (!id || !accessToken || !accessCode) {
        throw new ServicesError('Une erreur est survenue lors de votre enregistrement');
      }
      await this.MailerService.Registration(email, firstName, accessCode);
      await save();

      this.createSessionCookie<codeToken>(res, { id, accessToken, cookieName: 'access_cookie' }, '15m', true);
      res.status(201).send(true);
    } catch (error) {
      next(error);
    }
  };

  protected askCode: ExpressHandler = async ({
    locals: {
      cookie: { access_cookie },
    },
    session: { sessionId },
    res,
    next,
  }: ctx<AuthControllerAskCode>) => {
    try {
      console.log(sessionId);

      if (sessionId) {
        //? part used for 2FA
        const { accessCode, email, firstName } = await this.UserService.generateCodeAccess(sessionId, 6, true);
        await this.MailerService.TwoFactorAuthenticate(email, firstName, accessCode);
        res.send(true);
        return;
      }
      if (!access_cookie) throw new InvalidArgumentError("Votre code d'accès est introuvable, veuillez vous réinscrire");
      if (!access_cookie.id || !access_cookie.accessToken) {
        res.status(201).send("Un email contenant votre code d'activation de compte vous a été renvoyé");
      }
      const { id } = access_cookie;
      const { accessCode, accessToken, email, firstName } = await this.UserService.generateCodeAccess(id);
      await this.MailerService.Registration(email, firstName, accessCode);

      this.createSessionCookie<codeToken>(res, { id, accessToken, cookieName: 'access_cookie' }, '15m', true);
      res.status(201).send("Un email contenant votre code d'activation de compte vous a été renvoyé");
    } catch (error) {
      next(error);
    }
  };

  protected validateAccount: ExpressHandler = async ({
    locals: {
      body: { access_cookie },
      params: { code },
    },
    res,
    next,
  }: ctx<AuthControllerValidAccount>) => {
    try {
      if (!access_cookie || access_cookie.expired) throw new InvalidArgumentError("Votre code d'accès a expiré, veuillez en demander un nouveau.");

      if (!access_cookie.id || !access_cookie.accessToken) {
        throw new InvalidArgumentError("Impossible de valider votre compte. Code d'accès incorrect");
      }
      const { id, accessToken } = access_cookie;
      const user = await this.UserService.updateUsers(
        {
          _id: id,
          accessToken: { $ne: null, $eq: accessToken },
          accessCode: { $ne: null, $eq: code },
        },
        { accessToken: null, accessCode: null, validateAccount: true },
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

  protected authenticate: ExpressHandler = async ({
    locals: {
      body: { email, password },
    },
    res,
    next,
  }: ctx<AuthControllerAuthenticate>) => {
    try {
      const userData = await this.UserService.getUser({ email, oAuthAccount: false }, [
        '_id',
        'validateAccount',
        'role',
        'twoFactorType',
        'firstName',
      ]);
      if (!userData) {
        throw new InvalidCredentialsError(`Email ou mot de passe invalide`);
      }
      const { _id: userId, validateAccount, role, twoFactorType, firstName } = userData;

      await this.AuthService.login({ id: userId, password });
      if (!validateAccount) {
        throw new InvalidSessionError('Veuillez valider votre compte par e-mail');
      }

      //; credentials required 2FA
      if (twoFactorType) {
        const { accessCode, accessToken } =
          twoFactorType === 'email' ? await this.UserService.generateCodeAccess(userId, 6) : await this.UserService.generateTokenAccess(userId);

        if (accessCode) {
          await this.MailerService.Registration(email, firstName, accessCode);
        }

        this.createSessionCookie<TwoFactorAuthenticateToken>(
          res,
          { id: userId, accessToken, twoFA: twoFactorType, cookieName: 'TwoFA_cookie' },
          '15m',
        );
        res.send({ role, TwoFA: twoFactorType });
        return;
      }

      const refreshToken = await this.MemoryServerCache.newUserAccessToken(userId);

      this.createSessionCookie<TokenUser>(res, { refreshToken, sessionId: userId, sessionRole: role, cookieName: config.COOKIE_NAME }, '31d');
      res.send({ role });
    } catch (error) {
      next(error);
    }
  };

  protected oAuthConnect: ExpressHandler = async ({
    locals: {
      query: { email, firstName, lastName },
    },
    res,
    next,
  }: ctx<AuthControllerOAuth>) => {
    try {
      const userFound = await this.UserService.getUser({ email, oAuthAccount: true }, ['_id', 'role']);
      const { _id: userId, role } = userFound ? userFound : await this.AuthService.register<registerOauth>({ email, firstName, lastName });

      const refreshToken = await this.MemoryServerCache.newUserAccessToken(userId);

      this.createSessionCookie<TokenUser>(res, { refreshToken, sessionId: userId, sessionRole: role, cookieName: config.COOKIE_NAME }, '31d');
      res.send({ role });
    } catch (error) {
      next(error);
    }
  };

  protected activate2FA: ExpressHandler = async ({
    locals: {
      body: { twoFactorType, otp },
      token,
    },
    session: { sessionId },
    res,
    next,
  }: ctx<AuthControllerActivate2FA>) => {
    try {
      if (twoFactorType === 'email') {
        const user = await this.UserService.updateUsers(
          {
            _id: sessionId,
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
          _id: sessionId,
        },
        { twoFactorType: 'authenticator', accessCode: token },
      );
      res.send(true);
    } catch (error) {
      next(error);
    }
  };

  protected verify2FA: ExpressHandler = async ({
    locals: {
      params: { otp },
      cookie: {
        TwoFA_cookie: { id, accessToken, twoFA },
      },
    },
    res,
    next,
  }: ctx<AuthControllerVerify2FA>) => {
    try {
      const [userFind] = await this.UserService.findUsers(
        {
          _id: id,
          password: { $ne: null },
          accessToken,
          ...(twoFA === 'email' ? { accessCode: { $ne: null, $eq: otp } } : { accessCode: { $ne: null } }),
        },
        ['accessCode', 'email', 'role'],
      );

      if (!userFind) throw new InvalidCredentialsError('Échec de la vérification à deux facteurs. Le code que vous avez saisi est incorrect.');

      const { accessCode, email, role } = userFind;

      if (twoFA === 'authenticator') {
        const success = verifyAuthenticator2FA(accessCode as string, String(otp));
        if (!success) throw new InvalidCredentialsError('Échec de la vérification à deux facteurs. Le code que vous avez saisi est incorrect.');
      }

      await this.UserService.updateUsers(
        {
          _id: id,
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

      this.createSessionCookie<TokenUser>(res, { refreshToken, sessionId: id, sessionRole: role, cookieName: config.COOKIE_NAME }, '31d');
      res.send({ email, role });
    } catch (error) {
      next(error);
    }
  };
}
