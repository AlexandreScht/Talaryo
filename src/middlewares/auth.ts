import { role } from '@/interfaces/models';
import { ExpiredSessionError, InvalidRoleAccessError } from '@exceptions';
import type { ctx } from '@interfaces/request';

const auth = (role?: role | role[]) => {
  return async (ctx: ctx) => {
    const { next, session } = ctx;

    if (!session?.sessionId) {
      throw new ExpiredSessionError();
    }

    if (role && session.sessionRole !== role && !role.includes(session.sessionRole) && process.env.NODE_ENV !== 'development') {
      throw new InvalidRoleAccessError(Array.isArray(role) ? role[0] : role);
    }

    next();
  };
};

export default auth;
