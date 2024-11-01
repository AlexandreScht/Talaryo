import { Routes } from '@interfaces/routes';
import { Router } from 'express';
import { AuthRouter } from './auth';
import { FavFoldersRouter } from './favFolders';
import { FavorisRouter } from './favoris';
import { ScoreRouter } from './scores';
import { ScrappingRouter } from './scrapping';
import { SearchesRouter } from './searches';
import { SearchesFoldersRouter } from './searchFolders';
import { SubscribeRouter } from './subscribe';
import { TestRouter } from './test';
import { UserRouter } from './users';
import { WebhookRouter } from './webhook';

export default class ApiRouter implements Routes {
  public router: Router;

  constructor() {
    this.router = Router();
  }

  protected initializeRoutes() {
    this.router.use('/scrapping', new ScrappingRouter().getRouter());
    this.router.use('/auth', new AuthRouter().getRouter());
    this.router.use('/users', new UserRouter().getRouter());
    this.router.use('/favFolders', new FavFoldersRouter().getRouter());
    this.router.use('/favoris', new FavorisRouter().getRouter());
    this.router.use('/scores', new ScoreRouter().getRouter());
    this.router.use('/searches', new SearchesRouter().getRouter());
    this.router.use('/searchFolder', new SearchesFoldersRouter().getRouter());
    this.router.use('/subscribe', new SubscribeRouter().getRouter());
    this.router.use('/webhook', new WebhookRouter().getRouter());
    this.router.use('/test', new TestRouter().getRouter());
  }
}
