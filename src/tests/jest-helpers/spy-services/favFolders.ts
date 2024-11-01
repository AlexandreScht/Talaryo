import type { FavFolderServicesJest } from '@/interfaces/jest';
import FavorisFolderServiceFile from '@/services/favFolders';

import Container from 'typedi';

export default function favFoldersMockedService(): FavFolderServicesJest {
  const FavFoldersService = Container.get(FavorisFolderServiceFile);

  const search = jest.spyOn(FavFoldersService, 'search');
  const create = jest.spyOn(FavFoldersService, 'create');
  const getContent = jest.spyOn(FavFoldersService, 'getContent');
  const deleteFavFolder = jest.spyOn(FavFoldersService, 'delete');

  return {
    search,
    create,
    getContent,
    deleteFavFolder,
  };
}
