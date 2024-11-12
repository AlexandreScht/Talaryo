import { getErrorMessage } from '@/exceptions/errorMessage';
import { searches } from '@/interfaces/searches';
import type {
  getSearches,
  getSearchesParams,
  ResponseType,
} from '@/interfaces/services';
import {
  createSearchFolderService,
  getSearchSchemaValidator,
  removeSearchSchemaValidator,
} from '@/libs/valideModules';
import validator from '@/middlewares/validator';
import routes from '@/routes';
import revalidatePaths from '@/utils/revalidateCache';
import type { AxiosInstance } from 'axios';
const {
  api: { searches: router },
} = routes;
export const createSearchService =
  ({ axios }: { axios: AxiosInstance }) =>
  async (
    props: MakeKeyRequired<
      searches,
      'searchFolderId' | 'name' | 'searchQueries'
    >,
  ): Promise<ResponseType<`${number}`>> => {
    try {
      validator(createSearchFolderService, props);

      const {
        data: { id },
      } = await axios.post(router.addSearch(), props);

      revalidatePaths([routes.pages.searches()]);

      return { res: id };
    } catch (err: unknown) {
      return getErrorMessage(err);
    }
  };

export const removeSearchService =
  ({ axios }: { axios: AxiosInstance }) =>
  async (id: number): Promise<ResponseType<true>> => {
    try {
      validator(removeSearchSchemaValidator, { id });

      await axios.delete(router.removeSearch([id]));

      revalidatePaths([routes.pages.home()]);

      return { res: true };
    } catch (err: unknown) {
      return getErrorMessage(err);
    }
  };

export const getSearchesService =
  ({ axios }: { axios: AxiosInstance }) =>
  async (props: getSearchesParams): Promise<ResponseType<getSearches>> => {
    try {
      validator(getSearchSchemaValidator, props);
      const { searchFolderName, limit, page, isCv } = props as unknown as any;
      const { data } = await axios.get(
        router.getSearches([searchFolderName as string], {
          ...(limit ? { limit } : {}),
          ...(page ? { page } : {}),
          ...(isCv ? { isCv } : {}),
        }),
      );

      return { res: data };
    } catch (err: unknown) {
      return getErrorMessage(err);
    }
  };

// export const getTotalSearchesService =
//   ({ axios }: { axios: AxiosInstance }) =>
//   async (value: unknown): Promise<ResponseType> => {
//     try {
//       validator(getTotalSearchSchemaValidator, value as object);

//       const {
//         data: { res },
//       } = await axios.get(
//         routes.api.getTotalSearches(
//           Object.values(value as object).map((v) => v?.toString()),
//         ),
//       );

//       return { res: data };
//     } catch (err: unknown) {
//       return getErrorMessage(err);
//     }
//   };
