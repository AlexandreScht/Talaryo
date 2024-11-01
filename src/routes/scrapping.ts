import ScrappingController from '@/controllers/scraping';
import { scrapingCandidateSchemaSchema, scrapingCvSchemaSchema, scrapingPersonalDataSchema } from '@/libs/shemaValidate';
import auth from '@/middlewares/auth';
import mw from '@/middlewares/mw';
import Validator from '@/middlewares/validator';
import { stringValidator } from '@/utils/zodValidate';
import { Router } from 'express';
import { z } from 'zod';

export class ScrappingRouter extends ScrappingController {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get('/candidate', mw([auth(), Validator(scrapingCandidateSchemaSchema), this.candidate]));
    this.router.get('/cv', mw([auth(['admin', 'business', 'pro']), Validator(scrapingCvSchemaSchema), this.cv]));
    this.router.get(
      '/cv/:link',
      mw([auth(['admin', 'business', 'pro']), Validator({ params: z.object({ link: stringValidator }) }), this.cv_content]),
    );
    this.router.get('/personal-data', mw([auth(), Validator(scrapingPersonalDataSchema), this.get_personal_details]));
  }

  getRouter() {
    return this.router;
  }
}
