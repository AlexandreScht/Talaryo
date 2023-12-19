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
      return await SearchFolderModel.query().findById(id).delete();
    } catch (error) {
      throw new ServicesError();
    }
  }

  public async getFolders(
    userId: number,
    { limit, page }: { limit: number; page: number },
  ): Promise<{ total: number; folders: SearchFolderModel[] }> {
    try {
      const query = SearchFolderModel.query().where('searchFolders.userId', userId);

      const [{ count }] = await query.clone().limit(1).offset(0).count();
      const total = Number.parseInt(count, 10);

      const folders = await query
        .clone()
        .select('searchFolders.id', 'searchFolders.name')
        .modifyGraph('searches', builder => {
          builder.select('id', 'searchQueries', 'name', 'society').orderBy('id', 'desc').limit(2);
        })
        .modify('paginate', limit, page)
        .withGraphFetched('searches');

      return { total, folders };
    } catch (error) {
      throw new ServicesError();
    }
  }
}

export default SearchFolderFile;
