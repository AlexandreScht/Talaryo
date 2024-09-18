import SearchesControllerFile from '@/controllers/searches';
import { getSearchesSchema } from '@/libs/shemaValidate';
import auth from '@/middlewares/auth';
import mw from '@/middlewares/mw';
import Validator from '@/middlewares/validator';
import { FavorisShapeSchema, numberValidator } from '@/utils/zodValidate';
import { Router } from 'express';
import z from 'zod';
export class SearchesRouter extends SearchesControllerFile {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post('/new', mw([auth(), Validator({ body: FavorisShapeSchema() }), this.createSearch]));
    this.router.delete('/remove/:id', mw([auth(), Validator({ params: z.object({ id: numberValidator }) }), this.deleteSearch]));
    this.router.get('/get/:SearchFolderName', mw([auth(), Validator(getSearchesSchema), this.getSearches]));
  }

  getRouter() {
    return this.router;
  }
}
