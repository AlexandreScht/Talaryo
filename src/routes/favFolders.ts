import FavFoldersControllerFile from '@/controllers/favFolders';
import { getFavFoldersSchema } from '@/libs/shemaValidate';
import auth from '@/middlewares/auth';
import mw from '@/middlewares/mw';
import Validator from '@/middlewares/validator';
import { Router } from 'express';
import z from 'zod';
export class FavFoldersRouter extends FavFoldersControllerFile {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.patch('/new', mw([auth(), Validator({ body: z.object({ name: z.string() }) }), this.createFavFolder]));
    this.router.delete('/remove/:id', mw([auth(), Validator({ params: z.object({ id: z.number().int() }) }), this.deleteFavFolder]));
    this.router.get('/getAll/:name', mw([auth(), Validator(getFavFoldersSchema), this.getFavFolders]));
  }

  getRouter() {
    return this.router;
  }
}
