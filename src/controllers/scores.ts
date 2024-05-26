import { totalFavorisSave, totalMailFind, totalSearch, totalSearchSave } from '@/config/access';
import { InvalidArgumentError } from '@/exceptions';
import { numberValidator, timestampValidator } from '@/libs/validate';
import auth from '@/middlewares/auth';
import validator from '@/middlewares/validator';
import FavorisServiceFile from '@/services/favoris';
import ScoreServiceFile from '@/services/scores';
import SearchesServiceFile from '@/services/searches';
import mw from '@middlewares/mw';
import { Container } from 'typedi';

const ScoreController = ({ app }) => {
  const ScoreServices = Container.get(ScoreServiceFile);
  const FavorisServices = Container.get(FavorisServiceFile);
  const SearchesServices = Container.get(SearchesServiceFile);
  app.patch(
    '/profils-consulted/:profils',
    mw([
      auth(),
      validator({
        params: {
          profils: numberValidator.required(),
        },
      }),
      async ({
        locals: {
          params: { profils },
        },
        session: { sessionId },
        res,
        next,
      }) => {
        try {
          const currentDate = new Date();
          await ScoreServices.improveProfilScore(
            { year: currentDate.getFullYear(), month: currentDate.getMonth() + 1, day: currentDate.getDate(), profils },
            sessionId,
          );
          res.status(201).send({ res: true });
        } catch (error) {
          next(error);
        }
      },
    ]),
  );
  app.get(
    '/get-user-score/:firstDate?/:lastDate?',
    mw([
      auth(),
      validator({
        params: {
          firstDate: timestampValidator,
          lastDate: timestampValidator,
        },
      }),
      async ({
        locals: {
          params: { firstDate, lastDate },
        },
        session: { sessionId },
        res,
        next,
      }) => {
        try {
          const sD = new Date(firstDate);
          const eD = new Date(lastDate);

          const startDate = {
            year: sD.getFullYear(),
            month: sD.getMonth() + 1,
            day: sD.getDate(),
          };
          const endDate = {
            year: eD.getFullYear(),
            month: eD.getMonth() + 1,
            day: eD.getDate(),
          };

          if (!startDate || !endDate) {
            throw new InvalidArgumentError('dates required');
          }
          const cDate = new Date();
          const currentDate = {
            year: cDate.getFullYear(),
            month: cDate.getMonth() + 1,
            day: cDate.getDate(),
          };
          if (
            currentDate.month === startDate.month &&
            currentDate.month === endDate.month &&
            currentDate.year === startDate.year &&
            currentDate.year === endDate.year
          ) {
            const { lastScores, currentScore } = await ScoreServices.getUserCurrentScores(currentDate, sessionId);
            const { totalProfiles, totalSearches } = (currentScore || []).reduce(
              (acc, score) => {
                acc.totalProfiles += score.profils || 0;
                acc.totalSearches += score.searches || 0;
                return acc;
              },
              { totalProfiles: 0, totalSearches: 0 },
            );

            return res.status(201).send({ res: { lastScores, fetchedScore: { scores: currentScore, meta: { totalProfiles, totalSearches } } } });
          }

          const scores = await ScoreServices.getUserRangeScores(startDate, endDate, sessionId);
          const { totalProfiles, totalSearches } = (scores || []).reduce(
            (acc, score) => {
              acc.totalProfiles += score.profils || 0;
              acc.totalSearches += score.searches || 0;
              return acc;
            },
            { totalProfiles: 0, totalSearches: 0 },
          );
          return res.status(201).send({ res: { fetchedScore: { scores, meta: { totalProfiles, totalSearches } } } });
        } catch (error) {
          console.log(error);

          next(error);
        }
      },
    ]),
  );
  app.get(
    '/get-total-scores',
    mw([
      auth(),
      async ({ session: { sessionId, sessionRole }, res, next }) => {
        try {
          const scoreResearches = await ScoreServices.getTotalMonthSearches(sessionId);
          const scoreMails = await ScoreServices.getTotalMonthMail(sessionId);
          const scoreFavoris = await FavorisServices.getTotalFavoris(sessionId);
          const scoreSearches = await SearchesServices.getTotalSearches(sessionId);
          console.log(scoreSearches);

          if (sessionRole === 'admin') {
            return res.send({
              res: {
                searches: { score: scoreSearches ?? 0, total: Infinity },
                reSearch: { score: scoreResearches ?? 0, total: Infinity },
                favoris: { score: scoreFavoris ?? 0, total: Infinity },
                mails: { score: scoreMails ?? 0, total: Infinity },
                sessionRole,
              },
            });
          }

          return res.send({
            res: {
              searches: { score: scoreSearches ?? 0, total: totalSearchSave[sessionRole] },
              reSearch: { score: scoreResearches ?? 0, total: totalSearch[sessionRole] },
              favoris: { score: scoreFavoris ?? 0, total: totalMailFind[sessionRole] },
              mails: { score: scoreMails ?? 0, total: totalFavorisSave[sessionRole] },
              sessionRole,
            },
          });
        } catch (error) {
          next(error);
        }
      },
    ]),
  );
  app.get(
    '/get-amount-score',
    mw([
      auth(),
      async ({ session: { sessionId, sessionRole }, res, next }) => {
        try {
          if (sessionRole === 'admin') {
            return res.send({ res: 'Infinity' });
          }
          const total = await ScoreServices.getTotalMonthSearches(sessionId);
          if (sessionRole === 'business') {
            return res.status(201).send({ res: String(totalSearch.business - total) });
          }
          if (sessionRole === 'pro') {
            return res.status(201).send({ res: String(totalSearch.pro - total) });
          }
          if (sessionRole === 'free') {
            return res.status(201).send({ res: String(totalSearch.free - total) });
          }
          res.status(201).send({ res: undefined });
        } catch (error) {
          next(error);
        }
      },
    ]),
  );
};

export default ScoreController;
