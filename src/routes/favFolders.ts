import FavFoldersControllerFile from '@/controllers/favFolders';
import { getFoldersSchema } from '@/libs/shemaValidate';
import auth from '@/middlewares/auth';
import mw from '@/middlewares/mw';
import Validator from '@/middlewares/validator';
import { numberValidator, stringValidator } from '@/utils/zodValidate';
import { Router } from 'express';
import z from 'zod';
export class FavFoldersRouter extends FavFoldersControllerFile {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post('/new', mw([auth(), Validator({ body: z.object({ name: stringValidator }) }), this.createFavFolder]));
    this.router.delete('/remove/:id', mw([auth(), Validator({ params: z.object({ id: numberValidator.min(1) }) }), this.deleteFavFolder]));
    this.router.get('/get-folder/:name', mw([auth(), Validator(getFoldersSchema), this.getFavFolders]));
  }

  getRouter() {
    return this.router;
  }
}
