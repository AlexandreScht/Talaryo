import { ServicesError } from '@/exceptions';
import { SearchFolderModel } from '@/models/searchFolders';
import type { Knex } from 'knex';
import { ConstraintViolationError } from 'objection';
import { Service } from 'typedi';

@Service()
class SearchFolderFile {
  get getModel(): Knex<any, any[]> {
    return SearchFolderModel.knex();
  }

  public async createFolder(name: string, userId: number): Promise<SearchFolderModel | boolean> {
    try {
      const success = await SearchFolderModel.query().insert({ name, userId });
      return success;
    } catch (error) {
      if (error instanceof ConstraintViolationError) {
        const existingSearchFolder = await SearchFolderModel.query().where({ name, userId, deleted: true }).first();
        if (existingSearchFolder) {
          const update = await SearchFolderModel.query().update({ name, deleted: false }).where({ id: existingSearchFolder.id });
          return !!update;
        }
        return false;
      }
      throw new ServicesError();
    }
  }

  public async removeFolder(id: number): Promise<boolean> {
    try {
      const success = await SearchFolderModel.query().where({ id }).patch({ deleted: true });
      return !!success;
    } catch (error) {
      throw new ServicesError();
    }
  }

  public async getFolders(
    userId: number,
    { limit, page, name }: { limit: number; page: number; name?: string },
  ): Promise<{ total: number; folders: SearchFolderModel[] }> {
    try {
      let query = SearchFolderModel.query().where('searchFolders.userId', userId).andWhere('searchFolders.deleted', false);

      if (name) {
        query = query.andWhereRaw('LOWER("searchFolders"."name") LIKE LOWER(?)', [`${name}%`]);
      }

      const totalQuery = query.clone().count('* as count').first();
      const totalResult = await totalQuery;
      const total = parseInt(totalResult.count, 10);

      const folders = await query
        .clone()
        .select('searchFolders.id', 'searchFolders.name')
        .leftJoin('searches', function () {
          this.on('searchFolders.id', '=', 'searches.searchFolderId').onVal('searches.locked', false).andOnVal('searches.deleted', false);
        })
        .groupBy('searchFolders.id')
        .count('searches.id as itemsCount')
        .orderBy('searchFolders.id', 'desc')
        .modify('paginate', limit, page);

      return { total, folders };
    } catch (error) {
      throw new ServicesError();
    }
  }
}

export default SearchFolderFile;
