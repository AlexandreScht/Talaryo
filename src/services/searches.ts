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
        const { name, searchQueries } = searches;
        const existingSearch = await SearchesModel.query().where({ userId: id, name, searchQueries }).first();
        if (existingSearch) {
          const update = await SearchesModel.query()
            .update({ ...searches, locked: false, deleted: false })
            .where({ id: existingSearch.id });
          return !!update;
        }
        return false;
      }
      throw new ServicesError();
    }
  }

  public async remove(id: number): Promise<boolean> {
    try {
      const deletedRows = await SearchesModel.query().patch({ deleted: true }).where({ id });
      return !isNaN(deletedRows) && deletedRows > 0;
    } catch (error) {
      throw new ServicesError();
    }
  }

  public async removeListFolder(id: number): Promise<boolean> {
    try {
      const deletedRows = await SearchesModel.query().where({ searchFolderId: id }).patch({ deleted: true });
      return !!deletedRows;
    } catch (error) {
      console.log(error);
      throw new ServicesError();
    }
  }

  public async getSearch(
    userId: number,
    { limit, page, name, searchFolderId }: { limit: number; page: number; name?: string; searchFolderId: number },
  ): Promise<{ total: number; searches: SearchesModel[] }> {
    try {
      let query = SearchesModel.query().where({ userId, locked: false, deleted: false });

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
      throw new ServicesError();
    }
  }

  public async getTotalSearches(userId: number): Promise<number> {
    try {
      const [{ count }] = await SearchesModel.query().where({ userId, locked: false, deleted: false }).limit(1).offset(0).count();
      const total = Number.parseInt(count, 10);
      return total;
    } catch (error) {
      throw new ServicesError();
    }
  }

  public async lockSearches(userId: number, n: number): Promise<void> {
    try {
      if (n === Infinity) {
        await SearchesModel.query().where({ userId, locked: true, deleted: false }).patch({ locked: false });
        return;
      }
      const unlockSearches = await SearchesModel.query().select('id').where({ userId, locked: true, deleted: false }).orderBy('id', 'asc').limit(n);
      const unlockIds = unlockSearches.map(search => search.id);

      const lockSearches = await SearchesModel.query().select('id').where({ userId }).orderBy('id', 'asc').offset(n);
      const lockIds = lockSearches.map(search => search.id);

      await SearchesModel.query().whereIn('id', unlockIds).patch({ locked: false });
      await SearchesModel.query().whereIn('id', lockIds).patch({ locked: true });
    } catch (error) {
      throw new ServicesError();
    }
  }
}

export default SearchesServiceFile;
