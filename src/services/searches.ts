import { ServicesError } from '@/exceptions';
import { searches } from '@/interfaces/models';
import { SearchesModel } from '@/models/searches';
import type { Knex } from 'knex';
import { ConstraintViolationError } from 'objection';
import { Service } from 'typedi';

@Service()
class SearchesServiceFile {
  get getModel(): Knex<any, any[]> {
    return SearchesModel.knex();
  }

  public async create(searches: searches, id: number): Promise<SearchesModel | boolean> {
    try {
      return await SearchesModel.query().insert({ ...searches, userId: id });
    } catch (error) {
      if (error instanceof ConstraintViolationError) {
        return false;
      }
      throw new ServicesError();
    }
  }

  public async remove(id: number): Promise<boolean> {
    try {
      const deletedRows = await SearchesModel.query().deleteById(id);
      return !isNaN(deletedRows) && deletedRows > 0;
    } catch (error) {
      throw new ServicesError();
    }
  }

  public async getLatests(userId: number, { limit, page }: { limit: number; page: number }): Promise<SearchesModel[]> {
    try {
      const query = SearchesModel.query().where({ userId }).orderBy('id', 'desc').select('id', 'searchQueries', 'name', 'society');
      return await query.modify('paginate', limit, page);
    } catch (error) {
      throw new ServicesError();
    }
  }

  public async getSearchInFolder(searchFolderId: number, { limit, page }: { limit: number; page: number }): Promise<SearchesModel[]> {
    try {
      const query = SearchesModel.query().where({ searchFolderId }).orderBy('id', 'desc').select('id', 'searchQueries', 'name', 'society');
      return await query.modify('paginate', limit, page);
    } catch (error) {
      throw new ServicesError();
    }
  }
}

export default SearchesServiceFile;
