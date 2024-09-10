import { Routes } from '@interfaces/routes';
import { Router } from 'express';
import { AuthRouter } from './auth';
// import { ScrapperRouter } from './scrapper';

export default class ApiRouter implements Routes {
  public router: Router;

  constructor() {
    this.router = Router();
  }

  protected initializeRoutes() {
    // this.router.use('/scrapper', new ScrapperRouter().getRouter());
    this.router.use('/auth', new AuthRouter().getRouter());
  }
}
