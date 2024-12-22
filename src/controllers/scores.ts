import { ROLE_FAVORIS_SAVE_LIMIT, ROLE_MAIL_FOUND_LIMIT, ROLE_SEARCH_LIMIT } from '@/config/access';
import { ServerException } from '@/exceptions';
import FavorisServiceFile from '@/services/favoris';
import ScoreServiceFile from '@/services/scores';
import SearchesServiceFile from '@/services/searches';
import { logger } from '@/utils/logger';
import { ControllerMethods, ControllerWithParams, ExpressHandler, ScoreControllerGetByUser, ScoreControllerImprove } from '@interfaces/controller';
import Container from 'typedi';

export default class ScoresControllerFile implements ControllerMethods<ScoresControllerFile> {
  private ScoreService: ScoreServiceFile;
  private FavorisService: FavorisServiceFile;
  private SearchesService: SearchesServiceFile;

  constructor() {
    this.ScoreService = Container.get(ScoreServiceFile);
    this.FavorisService = Container.get(FavorisServiceFile);
    this.SearchesService = Container.get(SearchesServiceFile);
  }

  protected improveScore: ExpressHandler<ScoreControllerImprove> = async ({
    locals: {
      body: { column, count },
    },
    session: { sessionId },
    res,
    next,
  }) => {
    try {
      await this.ScoreService.improveScore(column, count, sessionId);
      res.status(204).send();
    } catch (error) {
      if (!(error instanceof ServerException)) {
        logger.error('ScoresControllerFile.improveScore => ', error);
      }
      next(error);
    }
  };

  protected getUserScore: ExpressHandler<ScoreControllerGetByUser> = async ({
    locals: {
      query: { startDate, endDate },
    },
    session: { sessionId },
    res,
    next,
  }) => {
    try {
      const startDateValue = new Date(startDate);
      const lastDateValue = new Date(endDate);
      const currentDateValue = this.ScoreService.currentDate;

      startDateValue.setHours(0, 0, 0, 0);
      lastDateValue.setHours(0, 0, 0, 0);
      currentDateValue.setHours(0, 0, 0, 0);

      const isCurrentDate = startDateValue.getTime() === lastDateValue.getTime() && startDateValue.getTime() === currentDateValue.getTime();

      if (isCurrentDate) {
        const { lastScores, currentScore, totalCurrentSearches, totalCurrentProfiles } = await this.ScoreService.getUserCurrentScores(sessionId);
        res.send({
          lastScores,
          fetchedScore: { scores: currentScore, meta: { totalProfiles: totalCurrentSearches, totalSearches: totalCurrentProfiles } },
        });
        return;
      }
      const { scores, totalProfiles, totalSearches } = await this.ScoreService.getUserRangeScores(startDateValue, lastDateValue, sessionId);

      res.status(201).send({ fetchedScore: { scores, meta: { totalProfiles, totalSearches } } });
      return;
    } catch (error) {
      if (!(error instanceof ServerException)) {
        logger.error('ScoresControllerFile.getUserScore => ', error);
      }
      next(error);
    }
  };

  protected getTotalScores: ExpressHandler<ControllerWithParams<{ keys: scoreServiceNames[] }>> = async ({
    locals: {
      params: { keys },
    },
    session: { sessionId, sessionRole },
    res,
    next,
  }) => {
    try {
      const requestedTotalsKeys = keys.map(key => key.trim());

      const totalServices: { [key: string]: { service: () => Promise<Record<string, number>>; totalLimit: number | string } } = {
        searches: {
          service: () => this.ScoreService.getTotalMonthValues(sessionId, ['searches']),
          totalLimit: ROLE_SEARCH_LIMIT[sessionRole],
        },
        mails: {
          service: () => this.ScoreService.getTotalMonthValues(sessionId, ['mails']),
          totalLimit: ROLE_MAIL_FOUND_LIMIT[sessionRole],
        },
        favorisSave: {
          service: () => this.FavorisService.getTotalCount(sessionId).then(count => ({ favorisSave: count })),
          totalLimit: ROLE_FAVORIS_SAVE_LIMIT[sessionRole],
        },
        searchSave: {
          service: () => this.SearchesService.getTotalCount(sessionId).then(count => ({ searchSave: count })),
          totalLimit: ROLE_FAVORIS_SAVE_LIMIT[sessionRole],
        },
      };

      const response = await requestedTotalsKeys.reduce(async (accPromise, totalName) => {
        const acc = await accPromise;
        const totalService = totalServices[totalName];
        if (totalService) {
          try {
            const totalValue = await totalService.service();
            acc[totalName] = {
              score: totalValue[totalName] ?? 0,
              total: totalService.totalLimit === Infinity ? 'Infinity' : totalService.totalLimit,
            };
          } catch (error) {
            acc[totalName] = {
              score: 0,
              total: totalService.totalLimit === Infinity ? 'Infinity' : totalService.totalLimit,
            };
          }
        }
        return acc;
      }, Promise.resolve({}));

      res.send(response);
    } catch (error) {
      if (!(error instanceof ServerException)) {
        logger.error('ScoresControllerFile.getTotalScores => ', error);
      }
      next(error);
    }
  };
}
