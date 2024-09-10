import { ctx, LocalsCTX } from './middleware';
import { codeToken, cookiesValues, TwoFactorAuthenticateToken } from './token';
import { twoFactorType } from './users';

// export type ExpressHandler = ({ locals, res, next }: ctx) => Promise<void>;
type ExpressHandler<T extends LocalsCTX = LocalsCTX> = (ctx: ctx<T>) => Promise<void>;
export type ControllerMethods<T> = {
  [K in keyof T]: ExpressHandler;
};

//> Auth Controller

interface AuthControllerRegister {
  body: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  };
}

interface AuthControllerAskCode {
  cookie: { access_cookie: cookiesValues<codeToken> };
}

interface AuthControllerValidAccount {
  body: { access_cookie: cookiesValues<codeToken> };
  params: { code: number };
}

interface AuthControllerAuthenticate {
  body: {
    email: string;
    password: string;
  };
}

interface AuthControllerOAuth {
  query: {
    email: string;
    firstName: string;
    lastName: string;
  };
}

interface AuthControllerActivate2FA {
  body: {
    twoFactorType: twoFactorType;
    otp: number;
  };
  token?: string;
}

interface AuthControllerVerify2FA {
  params: {
    otp: number;
  };
  cookie: { TwoFA_cookie: cookiesValues<TwoFactorAuthenticateToken> };
}
