import { ServicesError } from '@/exceptions';
import { favorisData } from '@/interfaces/favoris';
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
      const favorites = await FavoriModel.query().where({ userId: id, deleted: false }).whereIn('link', links).select('link', 'favFolderId');

      return new Map(favorites.map(fav => [fav.link, fav.favFolderId]));
    } catch (error) {
      console.log(error);

      throw new ServicesError();
    }
  }

  public async getFavInFolder(limit: number, page: number, favFolderId: number): Promise<{ total: number; favoris: FavoriModel[] }> {
    try {
      const query = FavoriModel.query().where({ favFolderId, locked: false, deleted: false });
      const [{ count }] = await query.clone().limit(1).offset(0).count();
      const total = Number.parseInt(count, 10);

      const favorisFetched = await query.modify('paginate', limit, page);
      const favoris = favorisFetched?.map(fav => {
        if (fav.email === 'false') {
          return { ...fav, email: null };
        }
        if (!fav.email) {
          return { ...fav, email: undefined };
        }
        return fav;
      }) as FavoriModel[];
      return { total, favoris };
    } catch (error) {
      throw new ServicesError();
    }
  }

  public async getLatests(userId: number): Promise<FavoriModel[]> {
    try {
      return await FavoriModel.query().where({ userId, deleted: false, locked: false }).orderBy('id', 'desc').limit(3);
    } catch (error) {
      throw new ServicesError();
    }
  }

  public async create(fav: favorisData, id: number): Promise<FavoriModel | boolean> {
    try {
      return await FavoriModel.query().insert({ ...fav, userId: id, email: typeof fav.email === 'boolean' ? 'false' : fav.email });
    } catch (error) {
      if (error instanceof ConstraintViolationError) {
        const { link, favFolderId } = fav;
        const existingFav = await FavoriModel.query().where({ userId: id, link, favFolderId }).first();
        if (existingFav) {
          return await existingFav.$query().updateAndFetch({
            ...fav,
            deleted: false,
            locked: false,
            email: typeof fav.email === 'boolean' ? 'false' : fav.email,
          });
        }
        return false;
      }
      throw new ServicesError();
    }
  }

  public async update(fav: favorisData, id: number): Promise<boolean> {
    try {
      const update = await FavoriModel.query().updateAndFetchById(id, { ...fav, email: typeof fav.email === 'boolean' ? 'false' : fav.email });
      return !!update;
    } catch (error) {
      console.log(error);
      throw new ServicesError();
    }
  }

  public async remove(id: number): Promise<boolean> {
    try {
      const deletedRows = await FavoriModel.query().patchAndFetchById(id, { deleted: true });
      return !!deletedRows;
    } catch (error) {
      console.log(error);
      throw new ServicesError();
    }
  }

  public async removeListFolder(id: number): Promise<boolean> {
    try {
      const deletedRows = await FavoriModel.query().where({ favFolderId: id }).patch({ deleted: true });
      return !!deletedRows;
    } catch (error) {
      console.log(error);
      throw new ServicesError();
    }
  }

  public async getTotalFavoris(userId: number): Promise<number> {
    try {
      const [{ count }] = await FavoriModel.query().where({ userId, locked: false, deleted: false }).limit(1).offset(0).count();
      const total = Number.parseInt(count, 10);
      return total;
    } catch (error) {
      throw new ServicesError();
    }
  }

  public async lockFavoris(userId: number, n: number): Promise<void> {
    try {
      if (n === Infinity) {
        await FavoriModel.query().where({ userId, locked: true, deleted: false }).patch({ locked: false });
        return;
      }
      const unlockFavoris = await FavoriModel.query().select('id').where({ userId, locked: true, deleted: false }).orderBy('id', 'asc').limit(n);
      const unlockIds = unlockFavoris.map(favori => favori.id);

      const lockFavoris = await FavoriModel.query().select('id').where({ userId }).orderBy('id', 'asc').offset(n);
      const lockIds = lockFavoris.map(favori => favori.id);

      await FavoriModel.query().whereIn('id', unlockIds).patch({ locked: false });
      await FavoriModel.query().whereIn('id', lockIds).patch({ locked: true });
    } catch (error) {
      throw new ServicesError();
    }
  }
}

export default FavorisServiceFile;
