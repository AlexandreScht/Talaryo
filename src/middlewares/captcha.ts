import { ctx, type reqCaptcha } from '@/interfaces/middleware';
import { SkipInTest } from '@/libs/decorators';
import ApiServiceFile from '@/services/api';
import { ServerException } from '@exceptions';
import Container from 'typedi';

const captchaTest = SkipInTest(
  () => {
    const apiService = Container.get(ApiServiceFile);
    return async (ctx: ctx) => {
      const { next, locals } = ctx;
      try {
        const {
          body: { token },
        } = locals as reqCaptcha;

        const isValid = await apiService.FetchRecaptchaIdentity(token);

        if (!isValid) {
          throw new Error();
        }

        next();
      } catch (error) {
        console.log(error);

        throw new ServerException(401, 'Activité suspecte détectée. Veuillez réessayez plus tard ou contactez le support.');
      }
    };
  },
  (ctx: ctx) => ctx.next(),
);

export default captchaTest;
