import config from '@/config';
import type { ctx } from '@/interfaces/request';
import { ServerException } from '@exceptions';
import fetch from 'node-fetch';
type isHumanLocals = { body: { token: string } };

const isHuman = () => {
  return async (ctx: ctx) => {
    const { next, locals } = ctx;

    try {
      const {
        body: { token },
      } = locals as isHumanLocals;

      const response = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${config.reCaptcha}&response=${token}`, {
        method: 'POST',
      });

      const data: { success?: boolean } = await response.json();

      if (!data.success) {
        throw new ServerException(401, 'Échec de la vérification Recaptcha');
      }

      next();
    } catch (error) {
      throw new ServerException(500, error);
    }
  };
};

export default isHuman;
