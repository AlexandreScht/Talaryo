import { idValidator, limitValidator, pageValidator, stringValidator } from '@/libs/validate';
import auth from '@/middlewares/auth';
import validator from '@/middlewares/validator';
import FavorisFolderFile from '@/services/favFolders';
import mw from '@middlewares/mw';
import Container from 'typedi';

const FavFoldersController = ({ app }) => {
  const FavorisFolderServices = Container.get(FavorisFolderFile);
  app.post(
    '/create-favFolders',
    mw([
      auth(),
      validator({
        body: { name: stringValidator.required() },
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
          const success = await FavorisFolderServices.createFolder(name, sessionId);

          res.send({ res: success });
        } catch (error) {
          next(error);
        }
      },
    ]),
  );
  app.delete(
    '/remove-favFolders',
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
          const countDeleted = await FavorisFolderServices.removeFolder(id);
          res.send({ res: countDeleted });
        } catch (error) {
          next(error);
        }
      },
    ]),
  );
  app.get(
    '/get-favFolders',
    mw([
      auth(),
      validator({
        query: {
          limit: limitValidator.default(10),
          page: pageValidator.default(1),
          name: stringValidator,
        },
      }),
      async ({
        locals: {
          query: { name, page, limit },
        },
        session: { sessionId },
        res,
        next,
      }) => {
        try {
          const { folders, total } = await FavorisFolderServices.getFolders(sessionId, { limit, page, name });
          res.send({ res: { folders, meta: { total } } });
        } catch (error) {
          next(error);
        }
      },
    ]),
  );
};
export default FavFoldersController;
