import { numberValidator, timestampValidator } from '@/libs/validate';
import auth from '@/middlewares/auth';
import validator from '@/middlewares/validator';
import ScoreServiceFile from '@/services/scores';
import mw from '@middlewares/mw';
import { Container } from 'typedi';

const ScoreController = ({ app }) => {
  const ScoreServices = Container.get(ScoreServiceFile);
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
    '/get-user-score/:dateSearch?/:rangeDate?',
    mw([
      auth(),
      validator({
        params: {
          dateSearch: timestampValidator,
          rangeDate: timestampValidator,
        },
      }),
      async ({
        locals: {
          params: { dateSearch, rangeDate },
        },
        session: { sessionId },
        res,
        next,
      }) => {
        try {
          if (!dateSearch && !rangeDate) {
            const currentDate = new Date();
            const dateNow = {
              year: currentDate.getFullYear(),
              month: currentDate.getMonth() + 1,
              day: currentDate.getDate(),
            };
            const score = await ScoreServices.getUserScores(dateNow, sessionId);
            return res.status(201).send({ res: score ?? null });
          }

          const selectDate = new Date(dateSearch);
          const dateSelect = {
            year: selectDate.getFullYear(),
            month: selectDate.getMonth() + 1,
            day: selectDate.getDate(),
          };

          if (rangeDate) {
            const rangeDateConverted = new Date(rangeDate);
            const dateRange = {
              RgYear: rangeDateConverted.getFullYear(),
              RgMonth: rangeDateConverted.getMonth() + 1,
              RgDay: rangeDateConverted.getDate(),
            };
            const scores = await ScoreServices.getUserRangeScores(dateSelect, dateRange, sessionId);
            return res.status(201).send({ res: scores ?? null });
          }

          const score = await ScoreServices.getUserScores(dateSelect, sessionId);
          res.status(201).send({ res: score ?? null });
        } catch (error) {
          next(error);
        }
      },
    ]),
  );
};

export default ScoreController;
