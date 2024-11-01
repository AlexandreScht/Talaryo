import config from '@/config';
import { ROLE_FAVORIS_SAVE_LIMIT } from '@/config/access';
import { InvalidRoleAccessError, ServerException } from '@/exceptions';
import type { FavorisShape } from '@/models/pg/favoris';
import FavorisFolderServiceFile from '@/services/favFolders';
import FavorisServiceFile from '@/services/favoris';
import { logger } from '@/utils/logger';
import {
  ControllerMethods,
  ControllerWithBodyModel,
  ControllerWithPagination,
  ControllerWithParams,
  ExpressHandler,
  getLeastController,
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
        if (sessionRole === 'business' && limit >= ROLE_FAVORIS_SAVE_LIMIT.business) {
          throw new InvalidRoleAccessError('Vous avez atteint la limite maximale de favoris enregistrés.');
        }
        if (sessionRole === 'free' && limit >= (config.NODE_ENV === 'test' ? 3 : ROLE_FAVORIS_SAVE_LIMIT[sessionRole])) {
          throw new InvalidRoleAccessError(
            `Vous avez atteint la limite de favoris enregistrés avec votre abonnement ${sessionRole.toLocaleUpperCase()}.`,
          );
        }
      }

      const createResult = await this.FavorisService.create(body, sessionId);

      res.status(201).send(createResult);
    } catch (error) {
      if (!(error instanceof ServerException)) {
        logger.error('FavorisControllerFile.createFavoris => ', error);
      }
      next(error);
    }
  };

  protected deleteFavoris: ExpressHandler<ControllerWithParams<'id'>> = async ({
    locals: {
      params: { id },
    },
    session: { sessionId },
    res,
    next,
  }) => {
    try {
      const success = await this.FavorisService.delete(id, sessionId);
      res.status(success ? 204 : 201).send(success);
    } catch (error) {
      if (!(error instanceof ServerException)) {
        logger.error('FavorisControllerFile.deleteFavoris => ', error);
      }
      next(error);
    }
  };

  protected updateFavoris: ExpressHandler<ControllerWithBodyModel<FavorisShape> & ControllerWithParams<'id'>> = async ({
    locals: {
      body,
      params: { id },
    },
    session: { sessionId },
    res,
    next,
  }) => {
    try {
      const update = await this.FavorisService.update(body, id, sessionId);
      res.status(update ? 204 : 201).send(update);
    } catch (error) {
      if (!(error instanceof ServerException)) {
        logger.error('FavorisControllerFile.updateFavoris => ', error);
      }
      next(error);
    }
  };

  protected getFolderFavorites: ExpressHandler<ControllerWithPagination<'favFolderName'>> = async ({
    locals: {
      params: { favFolderName },
      query: { page, limit },
    },
    session: { sessionId },
    res,
    next,
  }) => {
    try {
      const folder = await this.FavorisFolderService.search(decodeURIComponent(favFolderName), sessionId);
      if (!folder?.id) {
        res.send(false);
        return;
      }
      const favorisInFolder = await this.FavorisService.getFavorisFromFolder(limit, page, folder.id);
      res.send(favorisInFolder);
    } catch (error) {
      if (!(error instanceof ServerException)) {
        logger.error('FavorisControllerFile.getFolderFavorites => ', error);
      }
      next(error);
    }
  };

  protected getFavorites: ExpressHandler<getLeastController> = async ({
    locals: {
      query: { isCv, limit, page },
    },
    session: { sessionId },
    res,
    next,
  }) => {
    try {
      const favoris = await this.FavorisService.get({ isCv, limit, page }, sessionId);
      res.send(favoris);
    } catch (error) {
      if (!(error instanceof ServerException)) {
        logger.error('FavorisControllerFile.getFavorites => ', error);
      }
      next(error);
    }
  };
}
