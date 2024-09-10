import ScrapperControllerFile from '@/controllers/scrapper';
import { searchJobsSchema } from '@/libs/shemaValidate';
import mw from '@/middlewares/mw';
import Validator from '@/middlewares/validator';
import { Router } from 'express';

export class ScrapperRouter extends ScrapperControllerFile {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  initializeRoutes() {
    try {
      this.router.post('/searchJobs', mw([Validator({ body: searchJobsSchema }), this.getJobs]));
    } catch (error) {
      console.log(error);
    }
  }

  getRouter() {
    return this.router;
  }
}
