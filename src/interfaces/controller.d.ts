import type { UserShape } from '@/models/pg/users';
import type { ctx, LocalsCTX } from './middleware';
import { candidateScrapingForm, cvScrapingForm } from './scrapping';
import { Feedback } from './stripe';
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

//> common
interface getLeastController {
  query: {
    limit: number;
    isCv?: boolean;
    page?: number;
  };
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
interface AuthControllerResetPassword {
  cookie: { reset_access: cookiesValues<codeToken> };
  body: {
    password: string;
  };
  token: string;
}

interface AuthControllerAskResetPassword {
  params: { email: string };
}
interface AuthControllerValidAccount {
  cookie: { access_cookie: cookiesValues<codeToken> };
  body: { code: number };
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
  params: { user: string | number };
  body: Partial<Omit<UserShape, 'id' | 'email'>>;
}

//> Folders

interface FoldersControllerCreate {
  body: {
    name: string;
  };
}

//> scores

interface ScoreControllerImprove {
  body: {
    column: Exclude<scoreColumn, 'searchAndCv'>[];
    count: number;
  };
}
interface ScoreControllerGetByUser {
  query: {
    startDate: Date;
    endDate: Date;
  };
}

//> scrapping

interface ScrappingControllerCandidate {
  query: candidateScrapingForm & {
    start: number;
    index: number;
  };
}

interface ScrappingControllerCv {
  query: cvScrapingForm & {
    start: number;
    index: number;
  };
}
interface ScrappingControllerCvContent {
  params: {
    link: string;
  };
}

interface ScrappingControllerGetPersonalDetails {
  query: {
    firstName: string;
    lastName: string;
    company: string;
    link?: string;
  };
}

//> subscribe
interface SubscribeControllerCancel {
  body: {
    subId: string;
    option?: {
      feedback: Feedback;
      comment: string;
    };
  };
}

interface SubscribeControllerUpdate {
  body: {
    price_id: string;
    itemSub: string;
    subId: string;
  };
}
interface SubscribeControllerCreate {
  body: {
    price_id: string;
  };
}
