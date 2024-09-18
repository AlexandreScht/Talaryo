import { ctx } from '@/interfaces/middleware';
import { ControllerMethods, ExpressHandler } from '@interfaces/controller';

export default class TestControllerFile implements ControllerMethods<TestControllerFile> {
  protected testParamsValues: ExpressHandler = async ({
    locals: {
      query: { keys },
    },
    res,
    next,
  }: ctx) => {
    try {
      res.status(201).send(keys);
    } catch (error) {
      next(error);
    }
  };
}
