import { getErrorMessage } from '@/exceptions/errorMessage';
import type { ResponseType } from '@/interfaces/services';
import {
  createFolderSchemaValidator,
  getFolderSchemaValidator,
  removeFolderSchemaValidator,
} from '@/libs/valideModules';
import validator from '@/middlewares/validator';
import routes from '@/routes';
import revalidatePaths from '@/utils/revalidateCache';
import type { AxiosInstance } from 'axios';

const {
  api: { favFolders: router },
} = routes;

export const createFavFolderService =
  ({ axios }: { axios: AxiosInstance }) =>
  async (name: string): Promise<ResponseType<newFolderType>> => {
    try {
      validator(createFolderSchemaValidator, { name });
      const { data } = await axios.post(router.addFavFolder(), { name });
      revalidatePaths([routes.pages.favoris()]);

      return { res: data };
    } catch (err: unknown) {
      return getErrorMessage(err);
    }
  };

export const removeFavFolderService =
  ({ axios }: { axios: AxiosInstance }) =>
  async (id: number): Promise<ResponseType<boolean>> => {
    try {
      validator(removeFolderSchemaValidator, { id });

      await axios.delete(router.removeFavFolder([id]));

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

export const getFavFoldersService =
  ({ axios }: { axios: AxiosInstance }) =>
  async ({
    name,
    limit,
    page,
  }: {
    name?: string;
    limit?: number;
    page?: number;
  }): Promise<ResponseType<getFolderType>> => {
    try {
      validator(getFolderSchemaValidator, { name, limit, page });
      const { data } = await axios.get(
        router.getFavFolders({
          ...(limit ? { limit } : {}),
          ...(name ? { name } : {}),
          ...(page ? { page } : {}),
        }),
      );

      return { res: data };
    } catch (err: unknown) {
      return getErrorMessage(err);
    }
  };
