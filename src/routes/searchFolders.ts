import SearchesFolderControllerFile from '@/controllers/searchFolders';
import { getFoldersSchema } from '@/libs/shemaValidate';
import auth from '@/middlewares/auth';
import mw from '@/middlewares/mw';
import Validator from '@/middlewares/validator';
import { numberValidator, stringValidator } from '@/utils/zodValidate';
import { Router } from 'express';
import z from 'zod';
export class SearchesFoldersRouter extends SearchesFolderControllerFile {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.patch('/new', mw([auth(), Validator({ body: z.object({ name: stringValidator }) }), this.createSearchFolder]));
    this.router.delete('/remove/:id', mw([auth(), Validator({ params: z.object({ id: numberValidator }) }), this.deleteSearchFolder]));
    this.router.get('/get-folder/:name', mw([auth(), Validator(getFoldersSchema), this.getSearchFolders]));
  }

  getRouter() {
    return this.router;
  }
}
