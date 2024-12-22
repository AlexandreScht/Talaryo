import AuthControllerFile from '@/controllers/auth';
import { activate2FASchema, askCodeSchema, loginSchema, registerSchema, resetPasswordSchema, verify2FASchema } from '@/libs/shemaValidate';
import auth from '@/middlewares/auth';
import captchaMw from '@/middlewares/captcha';
import googleOAuthMw from '@/middlewares/checkOAuth';
import cookieValues from '@/middlewares/cookie';
import mw from '@/middlewares/mw';
import slowDown from '@/middlewares/slowDown';
import Validator from '@/middlewares/validator';
import { stringValidator } from '@/utils/zodValidate';
import { Router } from 'express';
import { z } from 'zod';

export class AuthRouter extends AuthControllerFile {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post('/register', mw([Validator({ body: registerSchema }), captchaMw(), this.register]));
    this.router.get('/askCode', mw([cookieValues({ names: 'access_cookie', acceptError: true }), this.askCode]));
    this.router.patch(
      '/reset-password',
      mw([cookieValues({ names: 'reset_access' }), Validator({ body: resetPasswordSchema, token: stringValidator }), this.resetPassword]),
    );
    this.router.patch('/reset-password/:email', mw([Validator({ params: z.object({ email: stringValidator }) }), this.askResetPassword]));
    this.router.patch(
      '/validate-account/:code',
      mw([Validator({ params: askCodeSchema }), cookieValues({ names: 'access_cookie', acceptError: true }), this.validateAccount]),
    );
    this.router.post('/login', mw([Validator({ body: loginSchema }), captchaMw(), slowDown({ onError: 750 }), this.login]));
    this.router.get('/oAuth', mw([Validator({ token: stringValidator }), googleOAuthMw(), this.oAuthConnect]));
    this.router.patch('/active2FA', mw([auth(), Validator({ body: activate2FASchema, token: stringValidator.optional() }), this.activate2FA]));
    this.router.get('/verify2FA/:otp', mw([Validator({ params: verify2FASchema }), cookieValues({ names: 'TwoFA_cookie' }), this.verify2FA]));
  }

  getRouter() {
    return this.router;
  }
}
