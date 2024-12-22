import { ctx } from '@/interfaces/middleware';
import * as captchaMiddleWare from '@/middlewares/captcha';

export default function captchaMiddleWareMocked() {
  jest.spyOn(captchaMiddleWare, 'default').mockImplementation(() => (ctx: ctx) => ctx.next());
}
