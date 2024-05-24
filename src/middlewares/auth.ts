import { role } from '@/interfaces/models';
import UsersServiceFile from '@/services/users';
import { ExpiredSessionError, InvalidRoleAccessError } from '@exceptions';
import type { ctx } from '@interfaces/request';
import Container from 'typedi';

const auth = (role?: role | role[]) => {
  const UserServices = Container.get(UsersServiceFile);
  return async (ctx: ctx) => {
    const { next, session } = ctx;

    const { sessionId, refreshToken, sessionRole } = session || {};

    if (!sessionId || !refreshToken || !sessionRole) {
      throw new ExpiredSessionError();
    }

    await UserServices.checkRefreshToken(sessionId, refreshToken);

    if (role && sessionRole !== role && !role.includes(sessionRole) && process.env.NODE_ENV !== 'development') {
      throw new InvalidRoleAccessError(Array.isArray(role) ? role[0] : role);
    }

    next();
  };
};

export default auth;
