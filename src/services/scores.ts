import { getErrorMessage } from '@/exceptions/errorMessage';
import { graphScore, scoreKeySearchType, scoreProps, scoreType } from '@/interfaces/scores';
import type { ResponseType } from '@/interfaces/services';
import { addingScoreValidator, getScoreValidator } from '@/libs/valideModules';
import validator from '@/middlewares/validator';
import routes from '@/routes';
import revalidatePaths from '@/utils/revalidateCache';
import type { AxiosInstance } from 'axios';
const {
  api: { scores: router },
} = routes;

export const AddingScoreService =
  ({ axios }: { axios: AxiosInstance }) =>
  async (props: scoreProps): Promise<ResponseType<{ [key in scoreType]: number }>> => {
    try {
      validator(addingScoreValidator, props);
      const { data } = await axios.patch(router.addingScore());
      revalidatePaths([routes.pages.home()]);

      return { res: data };
    } catch (err: unknown) {
      return getErrorMessage(err);
    }
  };
export const GetUserScoreService =
  ({ axios }: { axios: AxiosInstance }) =>
  async ({ startDate, endDate }: { startDate: string; endDate: string }): Promise<ResponseType<graphScore>> => {
    try {
      validator(getScoreValidator, { startDate, endDate });

      const { data } = await axios.get(router.getScores({ startDate, endDate }));

      return { res: data };
    } catch (err: unknown) {
      return getErrorMessage(err);
    }
  };

export const GetTotalUserScoreService =
  ({ axios }: { axios: AxiosInstance }) =>
  async (
    keys: scoreKeySearchType[],
  ): Promise<
    ResponseType<{
      [key in scoreKeySearchType]: { score: number; total: number };
    }>
  > => {
    try {
      const { data } = await axios.get(router.getTotalScores([JSON.stringify(keys)]));

      const replaceInfinityStrings = function (obj: Record<string, any>) {
        for (const key in obj) {
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            replaceInfinityStrings(obj[key]);
          } else if (obj[key] === 'Infinity') {
            obj[key] = Infinity;
          }
        }
      };

      replaceInfinityStrings(data);

      return { res: data };
    } catch (err: unknown) {
      return getErrorMessage(err);
    }
  };
// export const GetUserAmountScoreService =
//   ({ axios }: { axios: AxiosInstance }) =>
//   async (): Promise<ResponseType> => {
//     try {
//       const {
//         data: { res },
//       } = await axios.get(routes.api.getAmountScores());

//       return { res: data };
//     } catch (err: unknown) {
//       return getErrorMessage(err);
//     }
//   };
