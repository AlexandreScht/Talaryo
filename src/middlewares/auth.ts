import { ExpiredSessionError, InvalidAccessError } from '@exceptions';
import type { ctx } from '@interfaces/request';

const auth = (role?: string | string[]) => {
  return async (ctx: ctx) => {
    const { next, session } = ctx;

    if (!session?.sessionId) {
      throw new ExpiredSessionError();
    }

    if (role && session.sessionRole !== role && !role.includes(session.sessionRole)) {
      throw new InvalidAccessError();
    }

    next();
  };
};

export default auth;
