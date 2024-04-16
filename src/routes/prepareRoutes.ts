// apiRouter.ts
import EventController from '@/controllers/events';
import FavFoldersController from '@/controllers/favFolders';
import FavorisController from '@/controllers/favoris';
import ScoreController from '@/controllers/scores';
import SearchFoldersController from '@/controllers/searchFolders';
import SearchController from '@/controllers/searches';
import SubscriptionController from '@/controllers/subscribe';
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
    FavorisController({ app: this.router });
    FavFoldersController({ app: this.router });
    SearchFoldersController({ app: this.router });
    SearchController({ app: this.router });
    ScoreController({ app: this.router });
    SubscriptionController({ app: this.router });
    EventController({ app: this.router });
    StripeWebhook({ app: this.router });
  }
}
