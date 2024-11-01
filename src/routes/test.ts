import TestControllerFile from '@/controllers/test';
import mw from '@/middlewares/mw';
import { Router } from 'express';

export class TestRouter extends TestControllerFile {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get('/test', mw([this.test]));
  }

  getRouter() {
    return this.router;
  }
}
