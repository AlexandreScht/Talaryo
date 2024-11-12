import { getErrorMessage } from '@/exceptions/errorMessage';
import type {
  favoris,
  getFavorisParams,
  getFavorites,
  ResponseType,
} from '@/interfaces/services';
import {
  createFavorisSchemaValidator,
  getFavorisSchemaValidator,
  removeFavorisSchemaValidator,
  updateFavorisSchemaValidator,
} from '@/libs/valideModules';
import validator from '@/middlewares/validator';
import routes from '@/routes';
import revalidatePaths from '@/utils/revalidateCache';
import type { AxiosInstance } from 'axios';
const {
  api: { favoris: router },
} = routes;
export const createFavorisService =
  ({ axios }: { axios: AxiosInstance }) =>
  async (values: favoris): Promise<ResponseType<`${number}`>> => {
    try {
      validator(createFavorisSchemaValidator, values);
      const {
        data: { id },
      } = await axios.post(router.addFavori(), values);

      revalidatePaths([
        routes.pages.home(),
        routes.pages.pro(),
        routes.pages.cv(),
      ]);

      return { res: id };
    } catch (err: unknown) {
      return getErrorMessage(err);
    }
  };
export const updateFavorisService =
  ({ axios }: { axios: AxiosInstance }) =>
  async (
    values: MakeKeyRequired<favoris, 'id'>,
  ): Promise<ResponseType<true>> => {
    try {
      validator(updateFavorisSchemaValidator, values as object);
      const { id, ...fav } = values;
      await axios.put(router.updateFavori([id]), fav);

      revalidatePaths([
        routes.pages.home(),
        routes.pages.pro(),
        routes.pages.cv(),
      ]);

      return { res: true };
    } catch (err: unknown) {
      return getErrorMessage(err);
    }
  };

export const removeFavorisService =
  ({ axios }: { axios: AxiosInstance }) =>
  async (id: number): Promise<ResponseType<true>> => {
    try {
      validator(removeFavorisSchemaValidator, { id });
      await axios.delete(router.removeFavoris([id]));

      revalidatePaths([
        routes.pages.home(),
        routes.pages.pro(),
        routes.pages.cv(),
      ]);

      return { res: true };
    } catch (err: unknown) {
      return getErrorMessage(err);
    }
  };

export const getFavorisService =
  ({ axios }: { axios: AxiosInstance }) =>
  async (props: getFavorisParams): Promise<ResponseType<getFavorites>> => {
    try {
      validator(getFavorisSchemaValidator, props);
      const { favFolderName, limit, page, isCv } = props as unknown as any;
      const { data } = await axios.get(
        router.getFavoris([favFolderName as string], {
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

// export const getLastFavorisService =
//   ({ axios }: { axios: AxiosInstance }) =>
//   async (values: unknown): Promise<ResponseType> => {
//     try {
//       validator(getLastFavorisSchemaValidator, values as object);
//       const {
//         data: { res },
//       } = await axios.get(routes.api.getLastFavoris(values));

//       return { res: data };
//     } catch (err: unknown) {
//       return getErrorMessage(err);
//     }
//   };
