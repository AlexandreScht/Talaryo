import config from '@/config';
import { InvalidArgumentError, InvalidSessionError, ServerException } from '@/exceptions';
import { TokenUser } from '@/interfaces/token';
import type { UserModel } from '@/models/pg/users';
import ApiServiceFile from '@/services/api';
import UserServiceFile from '@/services/users';
import createSessionCookie, { refreshSessionCookie } from '@/utils/createCookie';
import { logger } from '@/utils/logger';
import {
  ControllerMethods,
  ExpressHandler,
  UsersControllerGetAll,
  UsersControllerUpdateSelf,
  UsersControllerUpdateUser,
} from '@interfaces/controller';
import SocketManager from '@libs/socketManager';
import Container from 'typedi';
import { v7 as uuid } from 'uuid';

export default class UserControllerFile implements ControllerMethods<UserControllerFile> {
  private APIService: ApiServiceFile;
  private UserService: UserServiceFile;
  private SocketIo: SocketManager;

  constructor() {
    this.UserService = Container.get(UserServiceFile);
    this.APIService = Container.get(ApiServiceFile);
    this.SocketIo = SocketManager.getInstance();
  }

  protected updateCurrentUser: ExpressHandler<UsersControllerUpdateSelf> = async ({
    locals: {
      body: { society, role, firstName, lastName },
    },
    session: { sessionId, refreshToken, sessionRole },
    res,
    next,
  }) => {
    try {
      if (!society && !role && !firstName && !lastName) {
        throw new InvalidArgumentError('Une valeur au minimum est requise !');
      }
      const updateUser = (await this.UserService.updateUsers(
        {
          id: sessionId,
        },
        {
          ...(society ? { society } : {}),
          ...(role ? { role } : { role: sessionRole }),
          ...(firstName ? { firstName } : {}),
          ...(lastName ? { lastName } : {}),
        },
        ['email', 'id', 'firstName', 'lastName', 'society', 'role'],
      )) as UserModel;

      if (!updateUser) throw new InvalidSessionError();
      this.APIService.UpdateBrevoUser({
        email: updateUser.email,
        firstName: updateUser.firstName,
        lastName: updateUser.lastName,
        society: updateUser.society,
      });

      createSessionCookie<TokenUser>(res, { refreshToken, sessionId, sessionRole: updateUser.role, cookieName: config.COOKIE_NAME }, '31d');
      res.send({ role: updateUser.role, firstName: updateUser.firstName, lastName: updateUser.lastName, society: updateUser?.society });
    } catch (error) {
      if (!(error instanceof ServerException)) {
        logger.error('UserControllerFile.updateCurrentUser => ', error);
      }
      next(error);
    }
  };

  protected getAllUsers: ExpressHandler<UsersControllerGetAll> = async ({
    locals: {
      query: { firstName, lastName, limit, page, email, role },
    },
    res,
    next,
  }) => {
    try {
      const meta = await this.UserService.findUsers({ criteria: { firstName, lastName, email, role }, pagination: { limit, page } });
      res.status(201).send({ meta });
    } catch (error) {
      if (!(error instanceof ServerException)) {
        logger.error('UserControllerFile.getAllUsers => ', error);
      }
      next(error);
    }
  };

  private refreshUserCookies(user: UserModel) {
    const refreshCookie = refreshSessionCookie<TokenUser>(
      { sessionId: user.id, sessionRole: user.role, refreshToken: uuid(), cookieName: config.COOKIE_NAME },
      '31d',
    );

    this.SocketIo.ioSendTo(user.id, {
      eventName: 'refresh_cookie',
      body: { refreshCookie, role: user.role },
    });
  }

  protected updateUser: ExpressHandler<UsersControllerUpdateUser> = async ({ locals: { params, body }, res, next }) => {
    try {
      const hasAtLeastOneValue = Object.values(body).some(value => value !== null && value !== undefined);
      if (!hasAtLeastOneValue) {
        throw new InvalidArgumentError('Une valeur au minimum est requise !');
      }
      if (!isNaN(params.user as number)) {
        const updateUser = (await this.UserService.updateUsers({ id: params.user as number }, body, [
          'email',
          'id',
          'firstName',
          'lastName',
          'society',
          'role',
        ])) as UserModel;
        if (!updateUser) throw new InvalidArgumentError(`Aucun utilisateur trouvé avec id: ${params.user}`);
        this.APIService.UpdateBrevoUser({
          email: updateUser.email,
          firstName: updateUser.firstName,
          lastName: updateUser.lastName,
          society: updateUser.society,
        });
        this.refreshUserCookies(updateUser);
      } else {
        const updateUser = (await this.UserService.updateUsers({ email: params.user as string }, body, [
          'email',
          'id',
          'firstName',
          'lastName',
          'society',
          'role',
        ])) as UserModel;
        if (!updateUser) throw new InvalidArgumentError(`Aucun utilisateur trouvé avec le mail: ${params.user}`);
        this.APIService.UpdateBrevoUser({
          email: updateUser.email,
          firstName: updateUser.firstName,
          lastName: updateUser.lastName,
          society: updateUser.society,
        });
        this.refreshUserCookies(updateUser);
      }

      res.status(201).send(true);
    } catch (error) {
      if (!(error instanceof ServerException)) {
        logger.error('UserControllerFile.updateUser => ', error);
      }
      next(error);
    }
  };
}
