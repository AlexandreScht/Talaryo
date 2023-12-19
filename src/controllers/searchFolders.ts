import { idValidator, limitValidator, pageValidator, stringValidator } from '@/libs/validate';
import auth from '@/middlewares/auth';
import validator from '@/middlewares/validator';
import SearchFolderFile from '@/services/searchFolder';
import mw from '@middlewares/mw';
import Container from 'typedi';

const SearchFoldersController = ({ app }) => {
  const SearchFolderServices = Container.get(SearchFolderFile);
  app.post(
    '/create-searchFolders',
    mw([
      auth(),
      validator({
        body: {
          name: stringValidator.required(),
        },
      }),
      async ({
        locals: {
          body: { name },
        },
        session: { sessionId },
        res,
        next,
      }) => {
        try {
          const success = await SearchFolderServices.createFolder(name, sessionId);
          res.send({ res: success });
        } catch (error) {
          next(error);
        }
      },
    ]),
  );
  app.delete(
    '/remove-searchFolders',
    mw([
      auth(),
      validator({
        query: {
          id: idValidator.required(),
        },
      }),
      async ({
        locals: {
          query: { id },
        },
        res,
        next,
      }) => {
        try {
          const countDeleted = await SearchFolderServices.removeFolder(id);
          res.send({ res: countDeleted });
        } catch (error) {
          next(error);
        }
      },
    ]),
  );
  app.get(
    '/get-searchFolders',
    mw([
      auth(),
      validator({
        query: {
          limit: limitValidator.default(10),
          page: pageValidator.default(1),
        },
      }),
      async ({
        locals: {
          query: { page, limit },
        },
        session: { sessionId },
        res,
        next,
      }) => {
        try {
          const { folders, total } = await SearchFolderServices.getFolders(sessionId, { limit, page });
          res.send({ res: { folders, meta: { total } } });
        } catch (error) {
          next(error);
        }
      },
    ]),
  );
};
export default SearchFoldersController;
