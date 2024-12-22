import FavorisControllerFile from '@/controllers/favoris';
import { getFolderFavSchema, getSchema } from '@/libs/shemaValidate';
import auth from '@/middlewares/auth';
import mw from '@/middlewares/mw';
import Validator from '@/middlewares/validator';
import { FavorisShapeSchema, numberValidator } from '@/utils/zodValidate';
import { Router } from 'express';
import z from 'zod';
export class FavorisRouter extends FavorisControllerFile {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post('/new', mw([auth(), Validator({ body: FavorisShapeSchema({ required: ['favFolderId', 'img'] }) }), this.createFavoris]));
    this.router.delete('/remove/:id', mw([auth(), Validator({ params: z.object({ id: numberValidator }) }), this.deleteFavoris]));
    this.router.put(
      '/update/:id',
      mw([auth(), Validator({ params: z.object({ id: numberValidator }), body: FavorisShapeSchema() }), this.updateFavoris]),
    );
    this.router.get('/get/:favFolderName', mw([auth(), Validator(getFolderFavSchema), this.getFolderFavorites]));
    this.router.get('/get', mw([auth(), Validator(getSchema), this.getFavorites]));
  }

  getRouter() {
    return this.router;
  }
}
