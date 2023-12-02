import { InvalidArgumentError, ServerException } from '@/exceptions';
import { ctx, validators } from '@/interfaces/request';
import * as yup from 'yup';

const validator = ({ body, params, query }: validators) => {
  const validator = yup.object().shape({
    ...(body ? { body: yup.object().shape(body) } : {}),
    ...(query ? { query: yup.object().shape(query) } : {}),
    ...(params ? { params: yup.object().shape(params) } : {}),
  });

  return async (ctx: ctx) => {
    const { req, next } = ctx;

    try {
      const { body, params, query } = await validator.validate(
        {
          body: req.body,
          params: req.params,
          query: req.query,
        },
        { abortEarly: false },
      );

      ctx.locals = {
        body,
        params,
        query,
      };
      await next();
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        throw new InvalidArgumentError(err.errors);
      }

      throw new ServerException();
    }
  };
};

export default validator;
