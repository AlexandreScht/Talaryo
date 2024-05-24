import { totalFavorisSave } from '@/config/access';
import { InvalidRoleAccessError } from '@/exceptions';
import auth from '@/middlewares/auth';
import FavorisFolderFile from '@/services/favFolders';
import FavorisServiceFile from '@/services/favoris';
import {
  emailOrBooleanValidator,
  idValidator,
  imgValidator,
  keyValidator,
  limitValidator,
  linkValidator,
  pageValidator,
  stringValidator,
} from '@libs/validate';
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
          email: emailOrBooleanValidator,
          fullName: stringValidator.required(),
          currentJob: stringValidator.nullable(),
          currentCompany: stringValidator.nullable(),
          desc: keyValidator.required(),
          favFolderId: idValidator.required(),
        },
      }),
      async ({
        locals: {
          body: { link, img, fullName, email, currentJob, currentCompany, desc, favFolderId },
        },
        session: { sessionId, sessionRole },
        res,
        next,
      }) => {
        try {
          if (sessionRole !== 'admin') {
            const limit = await FavorisServices.getTotalFavoris(sessionId);
            if (sessionRole === 'free' && limit >= totalFavorisSave.free) {
              throw new InvalidRoleAccessError('Limite de favoris enregistrer atteinte avec votre abonnement FREE.');
            }
            if (sessionRole === 'pro' && limit >= totalFavorisSave.pro) {
              throw new InvalidRoleAccessError('Limite de favoris enregistrer atteinte avec votre abonnement PRO.');
            }
            if (sessionRole === 'business' && limit >= totalFavorisSave.business) {
              throw new InvalidRoleAccessError('Limite maximale de favoris enregistrer atteinte.');
            }
          }
          const success = await FavorisServices.create({ link, img, fullName, email, currentJob, currentCompany, desc, favFolderId }, sessionId);
          res.send({ res: success });
        } catch (error) {
          next(error);
        }
      },
    ]),
  );
  app.delete(
    '/remove-fav/:id',
    mw([
      auth(),
      validator({
        params: {
          id: idValidator.required(),
        },
      }),
      async ({
        locals: {
          params: { id },
        },
        res,
        next,
      }) => {
        try {
          const success = await FavorisServices.remove(id);
          res.send({ res: success });
        } catch (error) {
          next(error);
        }
      },
    ]),
  );
  app.put(
    '/update-fav',
    mw([
      auth(),
      validator({
        body: {
          link: linkValidator,
          img: imgValidator,
          email: emailOrBooleanValidator,
          fullName: stringValidator,
          currentJob: stringValidator,
          currentCompany: stringValidator,
          desc: keyValidator,
          favFolderId: idValidator,
          id: idValidator.required(),
        },
      }),
      async ({ locals: { body }, res, next }) => {
        try {
          const success = await FavorisServices.update(body, body.id);
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
      validator({
        query: {
          limit: limitValidator.default(3),
        },
      }),
      async ({
        locals: {
          query: { limit },
        },
        session: { sessionId },
        res,
        next,
      }) => {
        try {
          const favoris = await FavorisServices.getLatests(limit, sessionId);

          res.send({ res: favoris });
        } catch (error) {
          next(error);
        }
      },
    ]),
  );
};
export default FavorisController;
