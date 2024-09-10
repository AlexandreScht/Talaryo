import AuthControllerFile from '@/controllers/auth';
import { activate2FASchema, askCodeSchema, emailsSchema, loginSchema, registerSchema, verify2FASchema } from '@/libs/shemaValidate';
import auth from '@/middlewares/auth';
import captchaTest from '@/middlewares/captcha';
import { googleOAuthToken } from '@/middlewares/checkOAuth';
import cookieValues from '@/middlewares/cookie';
import mw from '@/middlewares/mw';
import slowDown from '@/middlewares/slowDown';
import Validator from '@/middlewares/validator';
import { stringValidator } from '@/utils/zodValidate';
import { Router } from 'express';

export class AuthRouter extends AuthControllerFile {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post('/register', mw([Validator({ body: registerSchema }), captchaTest(), this.register]));
    this.router.get('/askCode', mw([cookieValues({ names: 'access_cookie', acceptError: true }), this.askCode]));
    this.router.patch(
      '/validate-account',
      mw([Validator({ body: askCodeSchema }), cookieValues({ names: 'access_cookie', acceptError: true }), this.validateAccount]),
    );
    this.router.post('/login', mw([Validator({ body: loginSchema }), captchaTest(), slowDown({ onError: 750 }), this.authenticate]));
    this.router.get('/oAuth', mw([Validator({ token: stringValidator }), googleOAuthToken(), this.oAuthConnect]));
    this.router.patch('/active2FA', mw([auth(), Validator({ body: activate2FASchema, token: stringValidator.optional() }), this.activate2FA]));
    this.router.get('/verify2FA/:otp', mw([Validator({ params: verify2FASchema }), cookieValues({ names: 'TwoFA_cookie' }), this.verify2FA]));
    this.router.get('/emails', mw([Validator({ query: emailsSchema }), this.verify2FA]));
  }

  getRouter() {
    return this.router;
  }
}
