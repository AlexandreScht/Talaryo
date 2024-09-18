import SearchFolderServiceFile from '@/services/searchFolders';
import { ControllerMethods, ControllerWithPagination, ControllerWithParams, ExpressHandler, FoldersControllerCreate } from '@interfaces/controller';
import Container from 'typedi';

export default class SearchesFolderControllerFile implements ControllerMethods<SearchesFolderControllerFile> {
  private SearchFolderService: SearchFolderServiceFile;

  constructor() {
    this.SearchFolderService = Container.get(SearchFolderServiceFile);
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
      res.send(success);
    } catch (error) {
      next(error);
    }
  };

  protected deleteSearchFolder: ExpressHandler<ControllerWithParams<'id'>> = async ({
    locals: {
      params: { id },
    },
    res,
    next,
  }) => {
    try {
      const success = await this.SearchFolderService.delete(id);
      res.send(success);
    } catch (error) {
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
      next(error);
    }
  };
}
