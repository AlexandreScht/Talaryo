import { ExpiredSessionError } from '@/exceptions';
import config from '@config';
import type { DataStoredInToken, TokenUser } from '@interfaces/auth';
import type { RequestWithAuth, ctx } from '@interfaces/request';
import UsersServiceFile from '@services/users';
import deepmerge from 'deepmerge';
import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';
import Container from 'typedi';
const { security } = config;

const getAuthorization = (req: Request) => {
  const coockie = req.cookies['Profiilo-Session'];
  if (coockie) return coockie;

  const header = req.header('Authorization');
  if (header) return header.split('Bearer ')[1];

  return null;
};

const getUser = (Authorization: string): [boolean | Error, TokenUser?] => {
  try {
    const data = verify(Authorization, security.session.SESSION_SECRET) as DataStoredInToken;
    const user = {
      ...data.user,
      sessionId: Number.parseInt(data.user.sessionId),
    };
    return [false, user];
  } catch (error) {
    return [error];
  }
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
      const UserServices = Container.get(UsersServiceFile);
      const Authorization = getAuthorization(req);

      if (Authorization) {
        const [err, user] = getUser(Authorization);
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
