import { ServerException } from '@/exceptions';
import { ctx } from '@/interfaces/middleware';
import * as checkOAuthMiddleWare from '@/middlewares/checkOAuth';

export default function checkOAuthMiddleWareMocked() {
  jest.spyOn(checkOAuthMiddleWare, 'default').mockImplementation(() => (ctx: ctx) => {
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
  });
}
