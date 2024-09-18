import config from '@/config';
import { InvalidSessionError } from '@/exceptions';
import { TokenUser } from '@/interfaces/token';
import MemoryServerCache from '@/libs/memoryCache';
import type { UserModel } from '@/models/pg/users';
import ApiServiceFile from '@/services/api';
import UserServiceFile from '@/services/users';
import createSessionCookie from '@/utils/createCookie';
import {
  ControllerMethods,
  ExpressHandler,
  UsersControllerGetAll,
  UsersControllerUpdateSelf,
  UsersControllerUpdateUser,
} from '@interfaces/controller';
import Container from 'typedi';

export default class UserControllerFile implements ControllerMethods<UserControllerFile> {
  private APIService: ApiServiceFile;
  private UserService: UserServiceFile;
  private MemoryServerCache: MemoryServerCache;

  constructor() {
    this.UserService = Container.get(UserServiceFile);
    this.MemoryServerCache = Container.get(MemoryServerCache);
    this.APIService = Container.get(ApiServiceFile);
  }

  protected updateCurrentUser: ExpressHandler<UsersControllerUpdateSelf> = async ({
    locals: {
      body: { society, role, firstName, lastName },
    },
    session: { sessionId },
    res,
    next,
  }) => {
    try {
      const updateUser = (await this.UserService.updateUsers(
        {
          id: sessionId,
        },
        { ...(society ? { society } : {}), ...(role ? { role } : {}), ...(firstName ? { firstName } : {}), ...(lastName ? { lastName } : {}) },
        ['email', 'id'],
      )) as UserModel;

      if (!updateUser) throw new InvalidSessionError();
      this.APIService.UpdateBrevoUser({ email: updateUser.email, firstName, lastName, society });

      const refreshToken = await this.MemoryServerCache.newUserAccessToken(updateUser.id);
      createSessionCookie<TokenUser>(res, { refreshToken, sessionId: updateUser.id, sessionRole: role, cookieName: config.COOKIE_NAME }, '31d');
      res.send({ role });
    } catch (error) {
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
      next(error);
    }
  };

  protected updateUser: ExpressHandler<UsersControllerUpdateUser> = async ({ locals: { params, body }, res, next }) => {
    try {
      if ('id' in params) {
        await this.UserService.updateUsers({ id: params.id }, body);
        res.status(201).send(true);
        return;
      } else {
        await this.UserService.updateUsers({ email: params.email, password: { ...(params.oAuthAccount ? { are: null } : { not: null }) } }, body);
        res.status(201).send(true);
        return;
      }
    } catch (error) {
      next(error);
    }
  };
}
