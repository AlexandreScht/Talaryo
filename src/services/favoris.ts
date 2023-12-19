import { ServicesError } from '@/exceptions';
import { favorisData, findFav } from '@/interfaces/favoris';
import { cheerioInfos } from '@/interfaces/scrapping';
import { FavoriModel } from '@models/favoris';
import type { Knex } from 'knex';
import { ConstraintViolationError } from 'objection';
import { Service } from 'typedi';

@Service()
class FavorisServiceFile {
  get getModel(): Knex<any, any[]> {
    return FavoriModel.knex();
  }

  // ! A refaire
  public async findAllUserFav(id: number, objects: cheerioInfos[]): Promise<Map<string, number>> {
    try {
      const links = [...new Set(objects.map(obj => obj.link))];
      const favorites = await FavoriModel.query().where({ userId: id }).whereIn('link', links).select('link', 'favFolderId');

      return new Map(favorites.map(fav => [fav.link, fav.favFolderId]));
    } catch (error) {
      throw new ServicesError();
    }
  }

  public async getFavInFolder(limit: number, page: number, favFolderId: number): Promise<{ total: number; favoris: FavoriModel[] }> {
    try {
      const query = FavoriModel.query().where({ favFolderId });
      const [{ count }] = await query.clone().limit(1).offset(0).count();
      const total = Number.parseInt(count, 10);

      const favoris = await query.modify('paginate', limit, page);
      return { total, favoris };
    } catch (error) {
      throw new ServicesError();
    }
  }
  public async getLatests(userId: number): Promise<FavoriModel[]> {
    try {
      return await FavoriModel.query().where({ userId }).orderBy('id', 'desc').limit(3);
    } catch (error) {
      throw new ServicesError();
    }
  }

  public async create(fav: favorisData, id: number): Promise<FavoriModel | boolean> {
    try {
      return await FavoriModel.query().insert({ ...fav, userId: id });
    } catch (error) {
      if (error instanceof ConstraintViolationError) {
        return false;
      }
      throw new ServicesError();
    }
  }

  public async remove({ favFolderId, link }: findFav): Promise<boolean> {
    try {
      const deletedRows = await FavoriModel.query().delete().where({
        favFolderId,
        link,
      });
      return !isNaN(deletedRows) && deletedRows > 0;
    } catch (error) {
      throw new ServicesError();
    }
  }
}

export default FavorisServiceFile;
