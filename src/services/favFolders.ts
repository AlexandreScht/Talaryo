import { InvalidCredentialsError, ServicesError } from '@/exceptions';
import { FavFoldersModel } from '@/models/favFolders';
import { FavoriModel } from '@/models/favoris';
import type { Knex } from 'knex';
import { ConstraintViolationError } from 'objection';
import { Service } from 'typedi';

@Service()
class FavorisFolderFile {
  get getModel(): Knex<any, any[]> {
    return FavFoldersModel.knex();
  }

  public async createFolder(name: string, userId: number): Promise<FavFoldersModel | boolean> {
    try {
      return await FavFoldersModel.query().insert({ name, userId });
    } catch (error) {
      if (error instanceof ConstraintViolationError) {
        return false;
      }
      throw new ServicesError();
    }
  }

  public async removeFavFolder(id: number): Promise<number> {
    try {
      await FavoriModel.query().where('favFolderId', id).delete();
      return await FavFoldersModel.query().findById(id).delete();
    } catch (error) {
      console.log(error);

      throw new ServicesError();
    }
  }
  public async getFolderByName(name: string, userId: number): Promise<FavFoldersModel> {
    try {
      const folder = await FavFoldersModel.query().select('id').where({ name, userId }).first();
      if (folder) {
        return folder;
      }
    } catch (error) {
      throw new ServicesError();
    }
    throw new InvalidCredentialsError();
  }

  public async getFavInFolders(
    userId: number,
    { limit, page, name }: { limit: number; page: number; name?: string },
  ): Promise<{ total: number; folders: FavFoldersModel[] }> {
    try {
      let query = FavFoldersModel.query().where('favFolders.userId', userId);

      if (name) {
        query = query.where('name', 'like', `${name}%`);
      }

      const [{ count }] = await query.clone().limit(1).offset(0).count();
      const total = Number.parseInt(count, 10);

      const folders = await query
        .clone()
        .select('favFolders.id', 'favFolders.name')
        .leftJoin('favoris', 'favFolders.id', 'favoris.favFolderId')
        .andWhere(function () {
          this.where('favoris.disabled', false).orWhereNull('favoris.disabled');
        })
        .groupBy('favFolders.id')
        .count('favoris.id as itemsCount')
        .modify('paginate', limit, page);

      return { total, folders };
    } catch (error) {
      console.log(error);

      throw new ServicesError();
    }
  }
}

export default FavorisFolderFile;
