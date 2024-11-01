import type { SearchFolderServicesJest } from '@/interfaces/jest';
import SearchFolderServiceFile from '@/services/searchFolders';
import Container from 'typedi';

export default function searchFolderMockedService(): SearchFolderServicesJest {
  const SearchFolderService = Container.get(SearchFolderServiceFile);

  const create = jest.spyOn(SearchFolderService, 'create');
  const getContent = jest.spyOn(SearchFolderService, 'getContent');
  const deleteSearchFolder = jest.spyOn(SearchFolderService, 'delete');
  const search = jest.spyOn(SearchFolderService, 'search');

  return {
    create,
    getContent,
    deleteSearchFolder,
    search,
  };
}
