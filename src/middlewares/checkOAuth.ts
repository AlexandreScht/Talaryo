import config from '@/config';
import { ctx } from '@/interfaces/middleware';
import { ServerException } from '@exceptions';
import { OAuth2Client } from 'google-auth-library';

export const googleOAuthToken = () => {
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
      console.log(error);

      throw new ServerException(401, 'Activité suspecte détectée. Veuillez réessayez plus tard ou contactez le support.');
    }
  };
};
