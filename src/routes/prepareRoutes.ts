// apiRouter.ts
import FoldersController from '@/controllers/favFolders';
import FavorisController from '@/controllers/favoris';
import StripeWebhook from '@/webhooks/stripe';
import AuthController from '@controllers/auth';
import ScrappingController from '@controllers/scrapping';
import UsersController from '@controllers/users';
import { Routes } from '@interfaces/routes';
import { Router } from 'express';
export class ApiRouter implements Routes {
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    AuthController({ app: this.router });
    UsersController({ app: this.router });
    ScrappingController({ app: this.router });
    StripeWebhook({ app: this.router });
    FavorisController({ app: this.router });
    FoldersController({ app: this.router });
  }
}
