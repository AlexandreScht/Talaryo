import { ServerException } from '@/exceptions';
import SearchesServiceFile from '@/services/searches';
import SearchFolderServiceFile from '@/services/searchFolders';
import { logger } from '@/utils/logger';
import { ControllerMethods, ControllerWithPagination, ControllerWithParams, ExpressHandler, FoldersControllerCreate } from '@interfaces/controller';
import Container from 'typedi';

export default class SearchesFolderControllerFile implements ControllerMethods<SearchesFolderControllerFile> {
  private SearchFolderService: SearchFolderServiceFile;
  private SearchService: SearchesServiceFile;

  constructor() {
    this.SearchFolderService = Container.get(SearchFolderServiceFile);
    this.SearchService = Container.get(SearchesServiceFile);
  }

  protected createSearchFolder: ExpressHandler<FoldersControllerCreate> = async ({
    locals: {
      body: { name },
    },
    session: { sessionId },
    res,
    next,
  }) => {
    try {
      const success = await this.SearchFolderService.create(name, sessionId);
      res.status(201).send(success);
    } catch (error) {
      if (!(error instanceof ServerException)) {
        logger.error('SearchesFolderControllerFile.createSearchFolder =>' + error);
      }
      next(error);
    }
  };

  protected deleteSearchFolder: ExpressHandler<ControllerWithParams<'id'>> = async ({
    locals: {
      params: { id },
    },
    session: { sessionId },
    res,
    next,
  }) => {
    try {
      const folderId = await this.SearchFolderService.delete(id, sessionId);
      if (id === folderId) {
        const success = await this.SearchService.deleteSearchesFromFolder(folderId);
        res.status(success ? 204 : 201).send(success);
        return;
      }
      res.status(201).send(false);
    } catch (error) {
      if (!(error instanceof ServerException)) {
        logger.error('SearchesFolderControllerFile.deleteSearchFolder =>' + error);
      }
      next(error);
    }
  };

  protected getSearchFolders: ExpressHandler<ControllerWithPagination<'name'>> = async ({
    locals: {
      params: { name },
      query: { page, limit },
    },
    session: { sessionId },
    res,
    next,
  }) => {
    try {
      const foldersMeta = await this.SearchFolderService.getContent(sessionId, { name, page, limit });
      res.send(foldersMeta);
    } catch (error) {
      if (!(error instanceof ServerException)) {
        logger.error('SearchesFolderControllerFile.getSearchFolders =>' + error);
      }
      next(error);
    }
  };
}
