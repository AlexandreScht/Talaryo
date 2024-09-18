import { ServicesError } from '@/exceptions';
import { SearchesModel, type SearchesShape } from '@/models/pg/searches';
import { logger } from '@/utils/logger';
import { ConstraintViolationError, Page } from 'objection';
import { Service } from 'typedi';

@Service()
export default class SearchesServiceFile {
  public async create(values: Partial<Omit<SearchesShape, 'userId'>>, userId: number): Promise<false | { id: number }> {
    try {
      return await SearchesModel.query()
        .insert({ ...values, userId })
        .returning('id');
    } catch (error) {
      if (error instanceof ConstraintViolationError) {
        const { name, searchQueries } = values;

        const existingSearch = await SearchesModel.query().where({ userId, name, searchQueries }).first();

        if (existingSearch) {
          return await existingSearch
            .$query()
            .updateAndFetch({
              ...values,
              deleted: false,
              locked: false,
            })
            .returning('id');
        }
        return false;
      }
      logger.error(error);
      throw new ServicesError();
    }
  }

  public async delete(id: number): Promise<boolean> {
    try {
      return await SearchesModel.query()
        .findById(id)
        .patch({ deleted: true })
        .then(v => !!v);
    } catch (error) {
      logger.error(error);
      throw new ServicesError();
    }
  }

  public async update(values: Partial<Omit<SearchesShape, 'userId'>>, id: number): Promise<boolean> {
    try {
      return await SearchesModel.query()
        .findById(id)
        .patch({ ...values })
        .then(v => !!v);
    } catch (error) {
      logger.error(error);
      throw new ServicesError();
    }
  }

  public async deleteSearchesFromFolder(searchFolderId: number): Promise<boolean> {
    try {
      return await SearchesModel.query()
        .where({ searchFolderId })
        .patch({ deleted: true })
        .then(v => !!v);
    } catch (error) {
      logger.error(error);
      throw new ServicesError();
    }
  }

  public async getTotalCount(userId: number): Promise<number> {
    try {
      return await SearchesModel.query()
        .where({ userId, locked: false, deleted: false })
        .count()
        .then(v => {
          const [{ count }] = v;
          return Number.parseInt(count, 10);
        });
    } catch (error) {
      throw new ServicesError();
    }
  }

  public async getSearchesFromFolder(limit: number, page: number, searchFolderId: number): Promise<Page<SearchesModel>> {
    try {
      return await SearchesModel.query()
        .where({ searchFolderId, locked: false, deleted: false })
        .page(page - 1, limit);
    } catch (error) {
      logger.error(error);
      throw new ServicesError();
    }
  }

  public async get({ limit = 10, page = 1, isCv }: { limit?: number; isCv?: boolean; page?: number }, userId: number): Promise<Page<SearchesModel>> {
    try {
      return SearchesModel.query()
        .where({ userId, deleted: false, locked: false, ...(isCv !== undefined ? { isCv } : {}) })
        .orderBy('id', 'desc')
        .page(page - 1, limit);
    } catch (error) {
      logger.error(error);
      throw new ServicesError();
    }
  }

  public async lockIn(userId: number, n: number): Promise<void> {
    try {
      if (n === Infinity) {
        await SearchesModel.query().where({ userId, locked: true, deleted: false }).patch({ locked: false });
        return;
      }

      await SearchesModel.query()
        .where({ userId })
        .orderBy('id', 'asc')
        .modify(qb => {
          qb.where({ locked: true }).limit(n).patch({ locked: false });
        })
        .modify(qb => {
          qb.offset(n).patch({ locked: true });
        });
    } catch (error) {
      logger.error(error);
      throw new ServicesError();
    }
  }
}
