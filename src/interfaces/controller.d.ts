import type { UserShape } from '@/models/pg/users';
import type { ctx, LocalsCTX } from './middleware';
import type { codeToken, cookiesValues, TwoFactorAuthenticateToken } from './token';

type ExpressHandler<T extends LocalsCTX = LocalsCTX> = (ctx: ctx<T>) => Promise<void>;
export type ControllerMethods<T> = {
  [K in keyof T]: ExpressHandler;
};

//> Globals

interface ControllerWithParams<T extends string | object> {
  params: T extends 'id' ? { id: number } : T extends string ? { [key in T]: string } : T;
}
interface ControllerWithPagination<T extends string> {
  query: {
    limit: number;
    page: number;
  };
  params?: T extends 'id' ? { id: number } : { [key in T]: string };
}
interface ControllerWithBodyModel<T extends object, V extends keyof T | undefined = undefined> {
  body: V extends string ? Partial<Omit<T, V>> : Partial<T>;
}
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

interface AuthControllerLogin {
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

//> users

interface UsersControllerUpdateSelf {
  body: {
    society?: string;
    firstName?: string;
    lastName?: string;
    role?: role;
  };
}
interface UsersControllerGetAll {
  query: {
    limit: number;
    page: number;
    lastName?: string;
    firstName?: string;
    email?: string;
    role?: role;
  };
}
interface UsersControllerUpdateUser {
  params: FindUserProps;
  body: Partial<Omit<UserShape, 'id' | 'email'>>;
}

//> Folders

interface FoldersControllerCreate {
  body: {
    name: string;
  };
}

//> Favoris

interface FavorisControllerLeastFavoris {
  query: {
    limit: number;
    isCv?: boolean;
  };
}

//> scores

interface ScoreControllerImprove {
  body: {
    column: scoreColumn;
    count: number;
  };
}
interface ScoreControllerGetByUser {
  query: {
    startDate: Date;
    endDate: Date;
  };
}
