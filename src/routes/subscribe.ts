import SubscribeControllerFile from '@/controllers/subscribe';
import { cancelSubscription, updateSubscription } from '@/libs/shemaValidate';
import auth from '@/middlewares/auth';
import mw from '@/middlewares/mw';
import Validator from '@/middlewares/validator';
import { stringValidator } from '@/utils/zodValidate';
import { Router } from 'express';
import { z } from 'zod';

export class SubscribeRouter extends SubscribeControllerFile {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.patch('/cancel', mw([auth(), Validator(cancelSubscription), this.cancel]));
    this.router.get('/get', mw([auth(), this.get]));
    this.router.patch('/update', mw([auth(), Validator(updateSubscription), this.update]));
    this.router.post('/new', mw([auth(), Validator({ body: z.object({ price_id: stringValidator }) }), this.create]));
    this.router.get('/invoices', mw([auth(), this.invoices]));
  }

  getRouter() {
    return this.router;
  }
}
