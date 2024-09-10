import { InvalidArgumentError, ServerException } from '@/exceptions';
import { ctx, validators } from '@/interfaces/middleware';
import type { Request } from 'express';
import { z, ZodError, ZodObject } from 'zod';

const Validator = ({ body, params: iniParams, query, token: tokenShame }: validators) => {
  const validator = z.object({
    ...(body ? { body: body } : {}),
    ...(query ? { query: query } : {}),
    ...(iniParams ? { params: iniParams } : {}),
  });

  const tokenValidate = (req: Request) => {
    const tokenValue = req.header('Authorization')?.split('Bearer ')[1];
    const tokenValidator = z.object({
      token: tokenShame,
    });
    const { token } = tokenValidator.parse({ token: tokenValue });
    return token;
  };

  return async (ctx: ctx) => {
    const { req, next } = ctx;
    try {
      const convertedParams: Record<string, any> = { ...req.params };
      if (iniParams && iniParams instanceof ZodObject) {
        for (const paramKey in req.params) {
          if (iniParams.shape[paramKey]?._def?.typeName === 'ZodNumber') {
            convertedParams[paramKey] = Number(req.params[paramKey]);
          }
        }
      }

      const { body, params, query } = validator.parse({
        body: req.body,
        params: convertedParams,
        query: req.query,
      });
      const token = tokenShame ? tokenValidate(req) : undefined;
      ctx.locals = {
        body,
        params,
        query,
        ...(token ? { token } : {}),
      };
      await next();
    } catch (error) {
      if (error instanceof ZodError) {
        const combinedErrorMessage = error.errors
          .map(err => {
            const path = err.path.join('.');
            if (err.message === 'Required') {
              return `${path}: Required ${(err as any).expected}`;
            }
            return `${path}: ${err.message}`;
          })
          .join(' - ');
        throw new InvalidArgumentError(`Invalid type for keys: ${combinedErrorMessage}`);
      }
      throw new ServerException(error.message);
    }
  };
};

export default Validator;
