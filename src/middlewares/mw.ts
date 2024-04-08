import { ExpiredSessionError, InvalidAccessError } from '@/exceptions';
import { decryptUserToken } from '@/libs/token';
import config from '@config';
import type { TokenUser } from '@interfaces/auth';
import type { RequestWithAuth, ctx } from '@interfaces/request';
import UsersServiceFile from '@services/users';
import deepmerge from 'deepmerge';
import { NextFunction, Request, Response } from 'express';
import Container from 'typedi';
const { COOKIE_NAME, ONLY_HTTPS } = config;

const getAuthorization = (req: Request) => {
  const coockie = req.cookies[COOKIE_NAME];
  if (coockie) return coockie;

  const header = req.header('Authorization');
  if (header) return header.split('Bearer ')[1];

  return null;
};

const mw =
  (middlewaresHandler: any[]) =>
  async (req: RequestWithAuth, res: Response, nextExpress: NextFunction): Promise<void> => {
    const locals = {};
    const session: Partial<TokenUser> = {};
    let handlerIndex = 0;
    const ctx: ctx = {
      req,
      res,
      get locals() {
        return locals;
      },
      set locals(newLocals) {
        Object.assign(locals, deepmerge(locals, newLocals));
      },
      get session() {
        return session;
      },
      set session(newSession) {
        Object.assign(session, deepmerge(session, newSession));
      },
      next: async err => {
        try {
          if (err && err instanceof Error) {
            nextExpress(err);
          } else {
            const handler = middlewaresHandler[handlerIndex];
            handlerIndex += 1;
            await handler(ctx);
          }
        } catch (error) {
          nextExpress(error);
        }
      },
    };
    try {
      // if (ONLY_HTTPS && !req.secure) {
      //   throw new InvalidAccessError();
      // }
      const UserServices = Container.get(UsersServiceFile);
      const Authorization = getAuthorization(req);

      if (Authorization) {
        const [err, user] = decryptUserToken(Authorization);
        if (err) {
          throw new ExpiredSessionError();
        }

        await UserServices.checkRefreshToken(user);
        ctx.session = user;
      }

      await ctx.next();
    } catch (err) {
      nextExpress(err);
    }
  };

export default mw;
