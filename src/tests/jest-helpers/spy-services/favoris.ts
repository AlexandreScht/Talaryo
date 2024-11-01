import type { FavorisServicesJest } from '@/interfaces/jest';
import FavorisServiceFile from '@/services/favoris';
import Container from 'typedi';

export default function favorisMockedService(): FavorisServicesJest {
  const FavoriteService = Container.get(FavorisServiceFile);

  const getTotalFavorisCount = jest.spyOn(FavoriteService, 'getTotalCount');
  const updateFav = jest.spyOn(FavoriteService, 'update');
  const deleteFav = jest.spyOn(FavoriteService, 'delete');
  const getFavorisFromFolder = jest.spyOn(FavoriteService, 'getFavorisFromFolder');
  const get = jest.spyOn(FavoriteService, 'get');
  const create = jest.spyOn(FavoriteService, 'create');
  const deleteFavorisFromFolder = jest.spyOn(FavoriteService, 'deleteFavorisFromFolder');
  const userCandidateFavoris = jest.spyOn(FavoriteService, 'userCandidateFavoris');

  return {
    getTotalFavorisCount,
    updateFav,
    deleteFav,
    getFavorisFromFolder,
    get,
    create,
    deleteFavorisFromFolder,
    userCandidateFavoris,
  };
}
