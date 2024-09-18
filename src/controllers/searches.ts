import { totalSearchSave } from '@/config/access';
import { InvalidArgumentError, InvalidRoleAccessError } from '@/exceptions';
import type { SearchesShape } from '@/models/pg/searches';
import SearchesServiceFile from '@/services/searches';
import SearchFolderServiceFile from '@/services/searchFolders';
import { ControllerMethods, ControllerWithBodyModel, ControllerWithPagination, ControllerWithParams, ExpressHandler } from '@interfaces/controller';
import Container from 'typedi';

export default class SearchesControllerFile implements ControllerMethods<SearchesControllerFile> {
  private SearchFolderService: SearchFolderServiceFile;
  private SearchService: SearchesServiceFile;

  constructor() {
    this.SearchFolderService = Container.get(SearchFolderServiceFile);
    this.SearchService = Container.get(SearchesServiceFile);
  }

  protected createSearch: ExpressHandler<ControllerWithBodyModel<SearchesShape, 'userId'>> = async ({
    locals: { body },
    session: { sessionId, sessionRole },
    res,
    next,
  }) => {
    try {
      if (sessionRole !== 'admin') {
        const limit = await this.SearchService.getTotalCount(sessionId);
        if (sessionRole === 'business' && limit >= totalSearchSave.business) {
          throw new InvalidRoleAccessError('Vous avez atteint la limite maximale de favoris enregistrés.');
        }
        if (sessionRole === 'free' && limit >= totalSearchSave[sessionRole]) {
          throw new InvalidRoleAccessError(
            `Vous avez atteint la limite de favoris enregistrés avec votre abonnement ${sessionRole.toLocaleUpperCase}.`,
          );
        }
      }
      const createResult = await this.SearchService.create(body, sessionId);
      res.send(createResult);
    } catch (error) {
      next(error);
    }
  };

  protected deleteSearch: ExpressHandler<ControllerWithParams<'id'>> = async ({
    locals: {
      params: { id },
    },
    res,
    next,
  }) => {
    try {
      const success = await this.SearchService.delete(id);
      res.send(success);
    } catch (error) {
      next(error);
    }
  };

  protected getSearches: ExpressHandler<ControllerWithPagination<'SearchFolderName'>> = async ({
    locals: {
      params: { SearchFolderName },
      query: { page, limit },
    },
    session: { sessionId },
    res,
    next,
  }) => {
    try {
      const { id } = await this.SearchFolderService.search(decodeURIComponent(SearchFolderName), sessionId);
      if (id) throw new InvalidArgumentError();
      const favoris = await this.SearchService.getSearchesFromFolder(limit, page, id);
      res.send(favoris);
    } catch (error) {
      next(error);
    }
  };
}
