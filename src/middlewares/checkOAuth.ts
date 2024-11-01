import config from '@/config';
import { ctx } from '@/interfaces/middleware';
import { SkipInTest } from '@/libs/decorators';
import { logger } from '@/utils/logger';
import { ServerException } from '@exceptions';
import { OAuth2Client } from 'google-auth-library';

export const googleOAuthToken = SkipInTest(
  () => {
    return async (ctx: ctx) => {
      const { next, locals } = ctx;
      try {
        const CLIENT_ID = config.oAuth.clientID;

        const client = new OAuth2Client(CLIENT_ID);
        const { token } = locals;

        const ticket = await client.verifyIdToken({
          idToken: token,
          audience: CLIENT_ID,
        });

        const { given_name: firstName, family_name: lastName, email } = ticket.getPayload();

        locals.query = { firstName, lastName, email };

        next();
      } catch (error) {
        logger.error(error);
        throw new ServerException(401, "La connexion OAuth n'a pas été validée par Google");
      }
    };
  },
  (ctx: ctx) => {
    const {
      req: {
        query: { email },
      },
      locals,
      next,
    } = ctx;
    if (email === 'providerAccount@gmail.com') {
      locals.query = { firstName: 'user', lastName: 'tree', email: 'providerAccount@gmail.com' };
      return next();
    }
    if (email === 'NewproviderAccount@gmail.com') {
      locals.query = { firstName: 'new', lastName: 'provider', email: 'NewproviderAccount@gmail.com' };
      return next();
    }
    throw new ServerException(401, "La connexion OAuth n'a pas été validée par Google");
  },
);
