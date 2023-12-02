import config from '@/config';
import type { ctx } from '@/interfaces/request';
import { InvalidIdentityError, ServerException } from '@exceptions';
import fetch from 'node-fetch';
type isHumainLocals = { body: { token: string } };

const isHumain = () => {
  return async (ctx: ctx) => {
    const { next, locals } = ctx;

    try {
      const {
        body: { token },
      } = locals as isHumainLocals;

      const response = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${config.reCaptcha}&response=${token}`, {
        method: 'POST',
      });

      const data: { success?: boolean } = await response.json();

      if (!data.success) {
        throw new InvalidIdentityError();
      }

      next();
    } catch (error) {
      throw new ServerException(500, error);
    }
  };
};

export default isHumain;
