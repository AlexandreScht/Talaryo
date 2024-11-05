import type { SearchServicesJest } from '@/interfaces/jest';
import SearchesServiceFile from '@/services/searches';

import Container from 'typedi';

export default function searchMockedService(): SearchServicesJest {
  const SearchService = Container.get(SearchesServiceFile);

  const deleteSearchesFromFolder = jest.spyOn(SearchService, 'deleteSearchesFromFolder');
  const getTotalSearchCount = jest.spyOn(SearchService, 'getTotalCount');
  const create = jest.spyOn(SearchService, 'create');
  const get = jest.spyOn(SearchService, 'get');
  const getSearchesFromFolder = jest.spyOn(SearchService, 'getSearchesFromFolder');
  const deleteFav = jest.spyOn(SearchService, 'delete');
  const lockIn = jest.spyOn(SearchService, 'lockIn');

  return {
    deleteSearchesFromFolder,
    getTotalSearchCount,
    create,
    get,
    getSearchesFromFolder,
    deleteFav,
    lockIn,
  };
}
