import { InvalidArgumentError, ServicesError } from '@/exceptions';
import { FavFoldersModel } from '@/models/favFolders';
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
        const existingFavFolder = await FavFoldersModel.query().where({ name, userId, deleted: true }).first();
        if (existingFavFolder) {
          return await FavFoldersModel.query().patchAndFetchById(existingFavFolder.id, { deleted: false });
        }
        return false;
      }
      throw new ServicesError();
    }
  }

  public async removeFolder(id: number): Promise<boolean> {
    try {
      const success = await FavFoldersModel.query().where({ id }).patch({ deleted: true });
      return !!success;
    } catch (error) {
      console.log(error);

      throw new ServicesError();
    }
  }
  public async getFolderByName(name: string, userId: number): Promise<FavFoldersModel> {
    try {
      const folder = await FavFoldersModel.query().select('id').where({ name, userId, deleted: false }).first();
      if (!folder) {
        throw new InvalidArgumentError();
      }
      return folder;
    } catch (error) {
      throw new ServicesError();
    }
  }

  public async getFolders(
    userId: number,
    { limit, page, name }: { limit: number; page: number; name?: string },
  ): Promise<{ total: number; folders: FavFoldersModel[] }> {
    try {
      let query = FavFoldersModel.query().where('favFolders.userId', userId).andWhere('favFolders.deleted', false);

      if (name) {
        query = query.andWhereRaw('LOWER("name") LIKE LOWER(?)', [`${name}%`]);
      }

      const [{ count }] = await query.clone().limit(1).offset(0).count();
      const total = Number.parseInt(count, 10);

      const folders = await query
        .clone()
        .select('favFolders.id', 'favFolders.name')
        .leftJoin('favoris', function () {
          this.on('favFolders.id', '=', 'favoris.favFolderId').onVal('favoris.locked', false).andOnVal('favoris.deleted', false);
        })
        .groupBy('favFolders.id')
        .orderBy('favFolders.id', 'asc')
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
