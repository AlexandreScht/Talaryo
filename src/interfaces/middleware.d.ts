import type { Request, Response } from 'express';
import { z, type ZodNumber, type ZodOptional, type ZodString } from 'zod';
import { TokenUser } from './token';

interface validators {
  body?: z.ZodSchema<any>;
  params?: z.ZodSchema<any>;
  query?: z.ZodSchema<any>;
  token?: ZodString | ZodNumber | ZodOptional<ZodString> | ZodOptional<ZodNumber>;
}

type LocalsCTX =
  | {
      body: Record<string, unknown>;
      params: Record<string, unknown>;
      query: Record<string, unknown>;
      cookie: Record<string, unknown>;
      token: string;
    }
  | Record<string, any>;

interface ctx<T extends LocalsCTX = LocalsCTX> {
  req: Request;
  res: Response;
  locals: T;
  onError: (() => Promise<void> | void)[];
  session: Partial<TokenUser> | null;
  next: (err?: unknown) => Promise<void>;
}

interface reqCaptcha {
  body: {
    token: string;
  };
}

interface googleOAuth {
  body: {
    access_token: string;
  };
}

type slowDown = number | { onError: number };
