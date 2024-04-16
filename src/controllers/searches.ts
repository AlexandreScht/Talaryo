import { totalSearchSave } from '@/config/access';
import { InvalidRoleAccessError } from '@/exceptions';
import auth from '@/middlewares/auth';
import SearchesServiceFile from '@/services/searches';
import { idValidator, keyValidator, limitValidator, pageValidator, stringValidator } from '@libs/validate';
import mw from '@middlewares/mw';
import validator from '@middlewares/validator';
import Container from 'typedi';

const SearchController = ({ app }) => {
  const SearchServices = Container.get(SearchesServiceFile);
  app.post(
    '/create-search',
    mw([
      auth(),
      validator({
        body: {
          search: keyValidator.required(),
        },
        query: {
          searchFolderId: idValidator.required(),
          name: stringValidator.required(),
          society: stringValidator,
        },
      }),
      async ({
        locals: {
          body: { search },
          query: { searchFolderId, name, society },
        },
        session: { sessionId, sessionRole },
        res,
        next,
      }) => {
        try {
          if (sessionRole !== 'admin') {
            const limit = await SearchServices.getTotalSearches(sessionId);
            if (sessionRole === 'free' && limit >= totalSearchSave.free) {
              throw new InvalidRoleAccessError('Limite de recherche enregistrer atteinte avec votre abonnement FREE.');
            }
            if (sessionRole === 'pro' && limit >= totalSearchSave.pro) {
              throw new InvalidRoleAccessError('Limite de recherche enregistrer atteinte avec votre abonnement PRO.');
            }
            if (sessionRole === 'business' && limit >= totalSearchSave.business) {
              throw new InvalidRoleAccessError('Limite maximale de recherche enregistrer atteinte.');
            }
          }
          const success = await SearchServices.create({ name, society, searchQueries: search, searchFolderId }, sessionId);
          res.send({ res: success });
        } catch (error) {
          next(error);
        }
      },
    ]),
  );
  app.delete(
    '/remove-search/:id',
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
          const success = await SearchServices.remove(id);
          res.send({ res: success });
        } catch (error) {
          next(error);
        }
      },
    ]),
  );
  app.get(
    '/get-searches',
    mw([
      auth(),
      validator({
        query: {
          limit: limitValidator.default(5),
          page: pageValidator.default(1),
          searchFolderId: idValidator,
          name: stringValidator,
        },
      }),
      async ({
        locals: {
          query: { limit, page, name, searchFolderId },
        },
        session: { sessionId },
        res,
        next,
      }) => {
        try {
          const { total, searches } = await SearchServices.getSearch(sessionId, { limit, page, name, searchFolderId });

          res.send({ res: { total, searches } });
        } catch (error) {
          next(error);
        }
      },
    ]),
  );
  app.get(
    '/get-totalSearches',
    mw([
      auth(),
      async ({ session: { sessionId }, res, next }) => {
        try {
          const total = await SearchServices.getTotalSearches(sessionId);
          res.send({ res: total });
        } catch (error) {
          next(error);
        }
      },
    ]),
  );
};
export default SearchController;
