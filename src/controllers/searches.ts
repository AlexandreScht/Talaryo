import config from '@/config';
import { ROLE_SEARCH_SAVE_LIMIT } from '@/config/access';
import { InvalidRoleAccessError, ServerException } from '@/exceptions';
import type { SearchesShape } from '@/models/pg/searches';
import SearchesServiceFile from '@/services/searches';
import SearchFolderServiceFile from '@/services/searchFolders';
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
        if (sessionRole === 'business' && limit >= ROLE_SEARCH_SAVE_LIMIT.business) {
          throw new InvalidRoleAccessError('Vous avez atteint la limite maximale de favoris enregistrés.');
        }
        if (sessionRole === 'free' && limit >= (config.NODE_ENV === 'test' ? 4 : ROLE_SEARCH_SAVE_LIMIT[sessionRole])) {
          throw new InvalidRoleAccessError(
            `Vous avez atteint la limite de favoris enregistrés avec votre abonnement ${sessionRole.toLocaleUpperCase()}.`,
          );
        }
      }
      const createResult = await this.SearchService.create(body, sessionId);
      res.status(201).send(createResult);
    } catch (error) {
      if (!(error instanceof ServerException)) {
        logger.error('SearchesControllerFile.createSearch =>' + error);
      }
      next(error);
    }
  };

  protected deleteSearch: ExpressHandler<ControllerWithParams<'id'>> = async ({
    locals: {
      params: { id },
    },
    session: { sessionId },
    res,
    next,
  }) => {
    try {
      const success = await this.SearchService.delete(id, sessionId);
      res.status(success ? 204 : 201).send(success);
    } catch (error) {
      if (!(error instanceof ServerException)) {
        logger.error('SearchesControllerFile.deleteSearch =>' + error);
      }
      next(error);
    }
  };

  protected getFolderSearches: ExpressHandler<ControllerWithPagination<'searchFolderName'>> = async ({
    locals: {
      params: { searchFolderName },
      query: { page, limit },
    },
    session: { sessionId },
    res,
    next,
  }) => {
    try {
      const folder = await this.SearchFolderService.search(decodeURIComponent(searchFolderName), sessionId);
      if (!folder?.id) {
        res.send(false);
        return;
      }
      const favoris = await this.SearchService.getSearchesFromFolder(limit, page, folder.id);
      res.send(favoris);
    } catch (error) {
      if (!(error instanceof ServerException)) {
        logger.error('SearchesControllerFile.getFolderSearches =>' + error);
      }
      next(error);
    }
  };

  protected getSearches: ExpressHandler<getLeastController> = async ({
    locals: {
      query: { isCv, limit, page },
    },
    session: { sessionId },
    res,
    next,
  }) => {
    try {
      const favoris = await this.SearchService.get({ isCv, limit, page }, sessionId);
      res.send(favoris);
    } catch (error) {
      if (!(error instanceof ServerException)) {
        logger.error('SearchesControllerFile.getSearches =>' + error);
      }
      next(error);
    }
  };
}
