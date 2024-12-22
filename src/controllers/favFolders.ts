import { ServerException } from '@/exceptions';
import FavorisFolderServiceFile from '@/services/favFolders';
import FavorisServiceFile from '@/services/favoris';
import { logger } from '@/utils/logger';
import { ControllerMethods, ControllerWithParams, ExpressHandler, FoldersControllerCreate, FoldersControllerGet } from '@interfaces/controller';
import Container from 'typedi';

export default class FavFoldersControllerFile implements ControllerMethods<FavFoldersControllerFile> {
  private FavorisFolderService: FavorisFolderServiceFile;
  private FavorisService: FavorisServiceFile;

  constructor() {
    this.FavorisFolderService = Container.get(FavorisFolderServiceFile);
    this.FavorisService = Container.get(FavorisServiceFile);
  }

  protected createFavFolder: ExpressHandler<FoldersControllerCreate> = async ({
    locals: {
      body: { name },
    },
    session: { sessionId },
    res,
    next,
  }) => {
    try {
      const success = await this.FavorisFolderService.create(name, sessionId);
      res.status(201).send(success);
    } catch (error) {
      if (!(error instanceof ServerException)) {
        logger.error('FavFoldersControllerFile.createFavFolder => ', error);
      }
      next(error);
    }
  };

  protected deleteFavFolder: ExpressHandler<ControllerWithParams<'id'>> = async ({
    locals: {
      params: { id },
    },
    session: { sessionId },
    res,
    next,
  }) => {
    try {
      const folderId = await this.FavorisFolderService.delete(id, sessionId);
      if (id === folderId) {
        const success = await this.FavorisService.deleteFavorisFromFolder(folderId);
        res.status(success ? 204 : 201).send(success);
        return;
      }
      res.status(201).send(false);
    } catch (error) {
      if (!(error instanceof ServerException)) {
        logger.error('FavFoldersControllerFile.deleteFavFolder => ', error);
      }
      next(error);
    }
  };

  protected getFavFolders: ExpressHandler<FoldersControllerGet> = async ({
    locals: {
      query: { page, limit, name },
    },
    session: { sessionId },
    res,
    next,
  }) => {
    try {
      const foldersMeta = await this.FavorisFolderService.getContent(sessionId, { name, page, limit });
      res.send(foldersMeta);
    } catch (error) {
      if (!(error instanceof ServerException)) {
        logger.error('FavFoldersControllerFile.getFavFolders => ', error);
      }
      next(error);
    }
  };
}
