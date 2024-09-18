import { totalFavorisSave } from '@/config/access';
import { InvalidArgumentError, InvalidRoleAccessError } from '@/exceptions';
import type { FavorisShape } from '@/models/pg/favoris';
import FavorisFolderServiceFile from '@/services/favFolders';
import FavorisServiceFile from '@/services/favoris';
import {
  ControllerMethods,
  ControllerWithBodyModel,
  ControllerWithPagination,
  ControllerWithParams,
  ExpressHandler,
  FavorisControllerLeastFavoris,
} from '@interfaces/controller';
import Container from 'typedi';

export default class FavorisControllerFile implements ControllerMethods<FavorisControllerFile> {
  private FavorisFolderService: FavorisFolderServiceFile;
  private FavorisService: FavorisServiceFile;

  constructor() {
    this.FavorisFolderService = Container.get(FavorisFolderServiceFile);
    this.FavorisService = Container.get(FavorisServiceFile);
  }

  protected createFavoris: ExpressHandler<ControllerWithBodyModel<FavorisShape, 'userId'>> = async ({
    locals: { body },
    session: { sessionId, sessionRole },
    res,
    next,
  }) => {
    try {
      if (sessionRole !== 'admin') {
        const limit = await this.FavorisService.getTotalCount(sessionId);
        if (sessionRole === 'business' && limit >= totalFavorisSave.business) {
          throw new InvalidRoleAccessError('Vous avez atteint la limite maximale de favoris enregistrés.');
        }
        if (sessionRole === 'free' && limit >= totalFavorisSave[sessionRole]) {
          throw new InvalidRoleAccessError(
            `Vous avez atteint la limite de favoris enregistrés avec votre abonnement ${sessionRole.toLocaleUpperCase}.`,
          );
        }
      }
      const createResult = await this.FavorisService.create(body, sessionId);
      res.send(createResult);
    } catch (error) {
      next(error);
    }
  };

  protected deleteFavoris: ExpressHandler<ControllerWithParams<'id'>> = async ({
    locals: {
      params: { id },
    },
    res,
    next,
  }) => {
    try {
      const success = await this.FavorisService.delete(id);
      res.send(success);
    } catch (error) {
      next(error);
    }
  };

  protected updateFavoris: ExpressHandler<ControllerWithBodyModel<FavorisShape>> = async ({ locals: { body }, res, next }) => {
    try {
      const { id, ...values } = body;
      if (id) throw new InvalidArgumentError();
      const update = await this.FavorisService.update(values, id);
      res.send(update);
    } catch (error) {
      next(error);
    }
  };

  protected getFavorites: ExpressHandler<ControllerWithPagination<'favFolderName'>> = async ({
    locals: {
      params: { favFolderName },
      query: { page, limit },
    },
    session: { sessionId },
    res,
    next,
  }) => {
    try {
      const { id } = await this.FavorisFolderService.search(decodeURIComponent(favFolderName), sessionId);
      if (id) throw new InvalidArgumentError();
      const favoris = await this.FavorisService.getFavorisFromFolder(limit, page, id);
      res.send(favoris);
    } catch (error) {
      next(error);
    }
  };

  protected lastFavoris: ExpressHandler<FavorisControllerLeastFavoris> = async ({
    locals: {
      query: { isCv, limit = 3 },
    },
    session: { sessionId },
    res,
    next,
  }) => {
    try {
      const foldersMeta = await this.FavorisService.get({ isCv, limit }, sessionId);
      res.send(foldersMeta);
    } catch (error) {
      next(error);
    }
  };
}
