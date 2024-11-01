import { ctx } from '@/interfaces/middleware';
import { ExpiredSessionError, InvalidAccessError, InvalidRoleAccessError } from '@exceptions';

const auth = (role?: role | role[]) => {
  return async (ctx: ctx) => {
    const { next, session } = ctx;

    const { sessionId, refreshToken, sessionRole } = session || {};

    if (!sessionId || !refreshToken || !sessionRole) {
      throw new ExpiredSessionError();
    }

    if (role && sessionRole !== role && !role.includes(sessionRole)) {
      if (role === 'admin') {
        throw new InvalidAccessError("Requiert les droits d'un compte administrateur.");
      }
      throw new InvalidRoleAccessError();
    }

    next();
  };
};

export default auth;
