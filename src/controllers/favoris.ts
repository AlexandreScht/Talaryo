import { InvalidRoleAccessError } from '@/exceptions';
import auth from '@/middlewares/auth';
import FavorisFolderFile from '@/services/favFolders';
import FavorisServiceFile from '@/services/favoris';
import { idValidator, imgValidator, keyValidator, limitValidator, linkValidator, pageValidator, stringValidator } from '@libs/validate';
import mw from '@middlewares/mw';
import validator from '@middlewares/validator';
import Container from 'typedi';

const FavorisController = ({ app }) => {
  const FavorisServices = Container.get(FavorisServiceFile);
  const FavorisFolderServices = Container.get(FavorisFolderFile);
  app.post(
    '/create-fav',
    mw([
      auth(),
      validator({
        body: {
          link: linkValidator.required(),
          img: imgValidator.required(),
          fullName: stringValidator.required(),
          currentJob: stringValidator,
          currentCompany: stringValidator,
          desc: keyValidator.required(),
          favFolderId: idValidator.required(),
        },
      }),
      async ({
        locals: {
          body: { link, img, fullName, currentJob, currentCompany, desc, favFolderId },
        },
        session: { sessionId, sessionRole },
        res,
        next,
      }) => {
        try {
          if (!['business', 'admin'].includes(sessionRole)) {
            const limit = await FavorisServices.getTotalFavoris(sessionId);
            if (limit >= 10 && sessionRole !== 'pro') {
              throw new InvalidRoleAccessError('pro');
            }
            if (limit >= 100) {
              throw new InvalidRoleAccessError('business');
            }
          }
          const success = await FavorisServices.create({ link, img, fullName, currentJob, currentCompany, desc, favFolderId }, sessionId);
          res.send({ res: success });
        } catch (error) {
          next(error);
        }
      },
    ]),
  );
  app.delete(
    '/remove-fav',
    mw([
      auth(),
      validator({
        query: {
          link: linkValidator.required(),
          favFolderId: idValidator.required(),
        },
      }),
      async ({
        locals: {
          query: { link, favFolderId },
        },
        res,
        next,
      }) => {
        try {
          const success = await FavorisServices.remove({ link, favFolderId });
          res.send({ res: success });
        } catch (error) {
          next(error);
        }
      },
    ]),
  );
  app.get(
    '/get-favoris',
    mw([
      auth(),
      validator({
        query: {
          limit: limitValidator.default(10),
          page: pageValidator.default(1),
          favFolderName: stringValidator.required(),
        },
      }),
      async ({
        locals: {
          query: { limit, page, favFolderName },
        },
        session: { sessionId },
        res,
        next,
      }) => {
        try {
          const favFolderModel = await FavorisFolderServices.getFolderByName(favFolderName, sessionId);

          const { favoris, total } = await FavorisServices.getFavInFolder(limit, page, favFolderModel.id);

          res.send({ res: { list: favoris, meta: { total } } });
        } catch (error) {
          next(error);
        }
      },
    ]),
  );
  app.get(
    '/get-lastFavoris',
    mw([
      auth(),
      async ({ session: { sessionId }, res, next }) => {
        try {
          const favoris = await FavorisServices.getLatests(sessionId);

          res.send({ res: favoris });
        } catch (error) {
          next(error);
        }
      },
    ]),
  );
};
export default FavorisController;
