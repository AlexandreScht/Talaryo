import { ServerException } from '@/exceptions';
import { ctx, slowDown } from '@/interfaces/middleware';

const slowDown = (timer: slowDown) => {
  return async (ctx: ctx) => {
    const { next, onError } = ctx;
    try {
      if (typeof timer === 'object') {
        onError.push(() => new Promise(resolve => setTimeout(resolve, timer.onError)));
      } else {
        await new Promise(resolve => setTimeout(resolve, timer));
      }
      await next();
    } catch (err) {
      throw new ServerException();
    }
  };
};

export default slowDown;
