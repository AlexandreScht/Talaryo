import SearchesControllerFile from '@/controllers/searches';
import { getSchema, getSearchesSchema } from '@/libs/shemaValidate';
import auth from '@/middlewares/auth';
import mw from '@/middlewares/mw';
import Validator from '@/middlewares/validator';
import { numberValidator, searchSchemaSchema } from '@/utils/zodValidate';
import { Router } from 'express';
import z from 'zod';
export class SearchesRouter extends SearchesControllerFile {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post(
      '/new',
      mw([auth(), Validator({ body: searchSchemaSchema({ required: ['searchFolderId', 'searchQueries', 'name'] }) }), this.createSearch]),
    );
    this.router.delete('/remove/:id', mw([auth(), Validator({ params: z.object({ id: numberValidator }) }), this.deleteSearch]));
    this.router.get('/get/:searchFolderName', mw([auth(), Validator(getSearchesSchema), this.getFolderSearches]));
    this.router.get('/get', mw([auth(), Validator(getSchema), this.getSearches]));
  }

  getRouter() {
    return this.router;
  }
}
