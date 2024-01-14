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

  public async getSearch(
    userId: number,
    { limit, page, name, searchFolderId }: { limit: number; page: number; name?: string; searchFolderId: number },
  ): Promise<{ total: number; searches: SearchesModel[] }> {
    try {
      let query = SearchesModel.query().where({ userId });

      if (searchFolderId) {
        query = query.where({ searchFolderId });
      }

      if (name) {
        query = query.andWhereRaw('LOWER("name") LIKE LOWER(?)', [`${name}%`]);
      }
      const [{ count }] = await query.clone().limit(1).offset(0).count();
      const total = Number.parseInt(count, 10);
      const searches = await query.orderBy('id', 'desc').select('id', 'searchQueries', 'name', 'society').modify('paginate', limit, page);
      return { total, searches };
    } catch (error) {
      console.log(error);

      throw new ServicesError();
    }
  }

  public async getTotalSearches(userId: number): Promise<number> {
    try {
      const [{ count }] = await SearchesModel.query().where({ userId }).limit(1).offset(0).count();
      const total = Number.parseInt(count, 10);
      return total;
    } catch (error) {
      throw new ServicesError();
    }
  }
}

export default SearchesServiceFile;
