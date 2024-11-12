import { getErrorMessage } from '@/exceptions/errorMessage';
import type { ResponseType } from '@/interfaces/services';
import { createFolderSchemaValidator, getFolderSchemaValidator, removeFolderSchemaValidator } from '@/libs/valideModules';
import validator from '@/middlewares/validator';
import routes from '@/routes';
import revalidatePaths from '@/utils/revalidateCache';
import type { AxiosInstance } from 'axios';

const {
  api: { searchFolder: router },
} = routes;

export const createSearchFolderService =
  ({ axios }: { axios: AxiosInstance }) =>
  async (name: string): Promise<ResponseType<newFolderType>> => {
    try {
      validator(createFolderSchemaValidator, { name });
      const { data } = await axios.post(router.addSearchFolder(), { name });

      revalidatePaths([routes.pages.searches()]);

      return { res: data };
    } catch (err: unknown) {
      return getErrorMessage(err);
    }
  };

export const removeSearchFolderService =
  ({ axios }: { axios: AxiosInstance }) =>
  async (id: number): Promise<ResponseType<boolean>> => {
    try {
      validator(removeFolderSchemaValidator, { id });
      await axios.delete(router.removeSearchFolder([id]));

      return { res: true };
    } catch (err: unknown) {
      return getErrorMessage(err);
    }
  };

export const getSearchFoldersService =
  ({ axios }: { axios: AxiosInstance }) =>
  async ({ name, limit, page }: { name?: string; limit?: number; page?: number }): Promise<ResponseType<getFolderType>> => {
    try {
      validator(getFolderSchemaValidator, { name, limit, page });
      const { data } = await axios.get(
        router.getSearchFolders({
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
