import { ctx } from '@/interfaces/middleware';
import { role } from '@/interfaces/users';
import { ExpiredSessionError, InvalidRoleAccessError } from '@exceptions';

const auth = (role?: role | role[]) => {
  return async (ctx: ctx) => {
    const { next, session } = ctx;

    const { sessionId, refreshToken, sessionRole } = session || {};

    if (!sessionId || !refreshToken || !sessionRole) {
      throw new ExpiredSessionError();
    }

    if (role && sessionRole !== role && !role.includes(sessionRole)) {
      throw new InvalidRoleAccessError(Array.isArray(role) ? role[0] : role);
    }

    next();
  };
};

export default auth;
