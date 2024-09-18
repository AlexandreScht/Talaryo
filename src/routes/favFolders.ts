import FavFoldersControllerFile from '@/controllers/favFolders';
import { getFoldersSchema } from '@/libs/shemaValidate';
import auth from '@/middlewares/auth';
import mw from '@/middlewares/mw';
import Validator from '@/middlewares/validator';
import { stringValidator } from '@/utils/zodValidate';
import { Router } from 'express';
import z from 'zod';
export class FavFoldersRouter extends FavFoldersControllerFile {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.patch('/new', mw([auth(), Validator({ body: z.object({ name: stringValidator }) }), this.createFavFolder]));
    this.router.delete('/remove/:id', mw([auth(), Validator({ params: z.object({ id: z.number().int() }) }), this.deleteFavFolder]));
    this.router.get('/get-folder/:name', mw([auth(), Validator(getFoldersSchema), this.getFavFolders]));
  }

  getRouter() {
    return this.router;
  }
}
