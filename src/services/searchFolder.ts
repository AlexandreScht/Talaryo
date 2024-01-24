import { ServicesError } from '@/exceptions';
import { SearchFolderModel } from '@/models/searchFolders';
import { SearchesModel } from '@/models/searches';
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
        return false;
      }
      throw new ServicesError();
    }
  }

  public async removeFolder(id: number): Promise<number> {
    try {
      await SearchesModel.query().where('searchFolderId', id).delete();
      return await SearchFolderModel.query().deleteById(id);
    } catch (error) {
      throw new ServicesError();
    }
  }

  public async getFolders(
    userId: number,
    { limit, page, name }: { limit: number; page: number; name?: string },
  ): Promise<{ total: number; folders: SearchFolderModel[] }> {
    try {
      let query = SearchFolderModel.query().where('searchFolders.userId', userId);

      if (name) {
        query = query.andWhereRaw('LOWER("searchFolders"."name") LIKE LOWER(?)', [`${name}%`]);
      }

      const totalQuery = query.clone().count('* as count').first();
      const totalResult = await totalQuery;
      const total = parseInt(totalResult.count, 10);

      const folders = await query
        .clone()
        .select('searchFolders.id', 'searchFolders.name')
        .leftJoin('searches', 'searchFolders.id', 'searches.searchFolderId')
        .groupBy('searchFolders.id')
        .count('searches.id as itemsCount')
        .orderBy('searchFolders.id', 'desc')
        .modify('paginate', limit, page);

      return { total, folders };
    } catch (error) {
      console.log(error);

      throw new ServicesError();
    }
  }
}

export default SearchFolderFile;
