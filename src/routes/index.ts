import { Routes } from '@interfaces/routes';
import { Router } from 'express';
// import { TestRouter } from './test';
import { AuthRouter } from './auth';
import { FavFoldersRouter } from './favFolders';
import { FavorisRouter } from './favoris';
import { ScoreRouter } from './scores';
import { TestRouter } from './test';
import { UserRouter } from './users';
// import { ScrapperRouter } from './scrapper';

export default class ApiRouter implements Routes {
  public router: Router;

  constructor() {
    this.router = Router();
  }

  protected initializeRoutes() {
    // this.router.use('/scrapper', new ScrapperRouter().getRouter());
    this.router.use('/auth', new AuthRouter().getRouter());
    this.router.use('/users', new UserRouter().getRouter());
    this.router.use('/favFolders', new FavFoldersRouter().getRouter());
    this.router.use('/favoris', new FavorisRouter().getRouter());
    this.router.use('/scores', new ScoreRouter().getRouter());
    this.router.use('/test', new TestRouter().getRouter());
  }
}
