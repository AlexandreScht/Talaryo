import FavorisFolderServiceFile from '@/services/favFolders';
import { ControllerMethods, ControllerWithPagination, ControllerWithParams, ExpressHandler, FoldersControllerCreate } from '@interfaces/controller';
import Container from 'typedi';

export default class FavFoldersControllerFile implements ControllerMethods<FavFoldersControllerFile> {
  private FavorisFolderService: FavorisFolderServiceFile;

  constructor() {
    this.FavorisFolderService = Container.get(FavorisFolderServiceFile);
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
      res.send(success);
    } catch (error) {
      next(error);
    }
  };

  protected deleteFavFolder: ExpressHandler<ControllerWithParams<'id'>> = async ({
    locals: {
      params: { id },
    },
    res,
    next,
  }) => {
    try {
      const success = await this.FavorisFolderService.delete(id);
      res.send(success);
    } catch (error) {
      next(error);
    }
  };

  protected getFavFolders: ExpressHandler<ControllerWithPagination<'name'>> = async ({
    locals: {
      params: { name },
      query: { page, limit },
    },
    session: { sessionId },
    res,
    next,
  }) => {
    try {
      const foldersMeta = await this.FavorisFolderService.getContent(sessionId, { name, page, limit });
      res.send(foldersMeta);
    } catch (error) {
      next(error);
    }
  };
}
