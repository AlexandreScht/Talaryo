import ScoresControllerFile from '@/controllers/scores';
import { getScoreSchema, getTotalScoreSchema, improveScoreSchema } from '@/libs/shemaValidate';
import auth from '@/middlewares/auth';
import mw from '@/middlewares/mw';
import Validator from '@/middlewares/validator';
import { Router } from 'express';

export class ScoreRouter extends ScoresControllerFile {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.patch('/improve', mw([auth(), Validator(improveScoreSchema), this.improveScore]));
    this.router.get('/get', mw([auth(), Validator(getScoreSchema), this.getUserScore]));
    this.router.get('/get/:keys', mw([auth(), Validator(getTotalScoreSchema), this.getTotalScores]));
  }

  getRouter() {
    return this.router;
  }
}
