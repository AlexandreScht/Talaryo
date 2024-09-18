import FavorisControllerFile from '@/controllers/favoris';
import { getFavorisSchema, getLeastFavorisSchema } from '@/libs/shemaValidate';
import auth from '@/middlewares/auth';
import mw from '@/middlewares/mw';
import Validator from '@/middlewares/validator';
import { FavorisShapeSchema } from '@/utils/zodValidate';
import { Router } from 'express';
import z from 'zod';
export class FavorisRouter extends FavorisControllerFile {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post('/new', mw([auth(), Validator({ body: FavorisShapeSchema() }), this.createFavoris]));
    this.router.delete('/remove/:id', mw([auth(), Validator({ params: z.object({ id: z.number().int() }) }), this.deleteFavoris]));
    this.router.patch('/update', mw([auth(), Validator({ body: FavorisShapeSchema({ required: ['id'] }) }), this.updateFavoris]));
    this.router.get('/get/:favFolderName', mw([auth(), Validator(getFavorisSchema), this.getFavorites]));
    this.router.get('/get', mw([auth(), Validator({ query: getLeastFavorisSchema }), this.lastFavoris]));
  }

  getRouter() {
    return this.router;
  }
}
