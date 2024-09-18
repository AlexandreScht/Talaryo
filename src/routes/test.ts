import TestControllerFile from '@/controllers/test';
import { getTotalScoreSchema } from '@/libs/shemaValidate';
import mw from '@/middlewares/mw';
import Validator from '@/middlewares/validator';
import { Router } from 'express';

export class TestRouter extends TestControllerFile {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get('/get', mw([Validator(getTotalScoreSchema), this.testParamsValues]));
  }
  getRouter() {
    return this.router;
  }
}
