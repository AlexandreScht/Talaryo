import { totalFavorisSave, totalMailFind, totalSearch } from '@/config/access';
import FavorisServiceFile from '@/services/favoris';
import ScoreServiceFile from '@/services/scores';
import { ControllerMethods, ControllerWithParams, ExpressHandler, ScoreControllerGetByUser, ScoreControllerImprove } from '@interfaces/controller';
import Container from 'typedi';

export default class ScoresControllerFile implements ControllerMethods<ScoresControllerFile> {
  protected ScoreService: ScoreServiceFile;
  protected FavorisService: FavorisServiceFile;

  constructor() {
    this.ScoreService = Container.get(ScoreServiceFile);
    this.FavorisService = Container.get(FavorisServiceFile);
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
      res.send(true);
    } catch (error) {
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

      const result = isCurrentDate
        ? await this.ScoreService.getUserCurrentScores(sessionId)
        : await this.ScoreService.getUserRangeScores(startDateValue, lastDateValue, sessionId);

      if ('currentScore' in result) {
        res.send({ isCurrentData: true, score: result.currentScore, meta: { ...result.prevScores } });
        return;
      }

      res.send({ isCurrentData: false, score: result });
    } catch (error) {
      next(error);
    }
  };

  protected getTotalScores: ExpressHandler<ControllerWithParams<{ keys: scoreServiceNames }>> = async ({
    locals: {
      params: { keys },
    },
    session: { sessionId, sessionRole },
    res,
    next,
  }) => {
    try {
      const requestedTotalsKeys = keys.split(',').map(key => key.trim());
      const totalServices: { [key: string]: { service: () => Promise<number>; totalLimit: number | string } } = {
        searches: {
          service: () => this.ScoreService.getTotalMonthValues(sessionId, 'searches'),
          totalLimit: totalSearch[sessionRole],
        },
        mails: {
          service: () => this.ScoreService.getTotalMonthValues(sessionId, 'mails'),
          totalLimit: totalMailFind[sessionRole],
        },
        favorisSave: {
          service: () => this.FavorisService.getTotal(sessionId),
          totalLimit: totalFavorisSave[sessionRole],
        },
        searchSave: {
          service: () => this.FavorisService.getTotal(sessionId),
          totalLimit: totalFavorisSave[sessionRole],
        },
      };

      const response: any = {};
      await Promise.all(
        requestedTotalsKeys.map(async totalName => {
          const totalService = totalServices[totalName];
          if (totalService) {
            return totalService.service().then(totalValue => {
              response[totalName] = {
                score: totalValue ?? 0,
                total: totalService.totalLimit,
              };
            });
          }
        }),
      );

      res.send(response);
    } catch (error) {
      next(error);
    }
  };
}
