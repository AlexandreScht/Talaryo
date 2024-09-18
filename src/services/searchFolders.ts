import { ServicesError } from '@/exceptions';
import { SearchFolderModel, type SearchFolderShape } from '@/models/pg/searchFolders';
import { logger } from '@/utils/logger';
import { ConstraintViolationError, Page } from 'objection';
import { Service } from 'typedi';

@Service()
export default class SearchFolderServiceFile {
  public async create(name: string, userId: number): Promise<SearchFolderShape | boolean> {
    try {
      return await SearchFolderModel.query().insert({ name, userId });
    } catch (error) {
      if (error instanceof ConstraintViolationError) {
        const existingFavFolder = await SearchFolderModel.query().where({ name, userId, deleted: true }).first();
        if (existingFavFolder) {
          return await SearchFolderModel.query().patchAndFetchById(existingFavFolder.id, { deleted: false });
        }
        return false;
      }
      logger.error(error);
      throw new ServicesError();
    }
  }

  public async delete(id: number): Promise<boolean> {
    try {
      return await SearchFolderModel.query()
        .where({ id })
        .patch({ deleted: true })
        .then(v => !!v);
    } catch (error) {
      logger.error(error);

      throw new ServicesError();
    }
  }
  public async search(name: string, userId: number): Promise<SearchFolderShape> {
    try {
      return await SearchFolderModel.query().select('id').where({ name, userId, deleted: false }).first();
    } catch (error) {
      logger.error(error);
      throw new ServicesError();
    }
  }

  public async getContent(userId: number, { limit, page, name }: { limit: number; page: number; name?: string }): Promise<Page<SearchFolderModel>> {
    try {
      let query = SearchFolderModel.query().where('searchFolders.userId', userId).andWhere('searchFolders.deleted', false);

      if (name) {
        query = query.andWhereRaw('LOWER(unaccent("name")) LIKE LOWER(unaccent(?))', [`${name}%`]);
      }

      return await query
        .select('searchFolders.id', 'searchFolders.name')
        .leftJoin('searches', function () {
          this.on('searchFolders.id', '=', 'searches.favFolderId').onVal('searches.locked', false).andOnVal('searches.deleted', false);
        })
        .groupBy('searchFolders.id')
        .orderBy('searchFolders.id', 'asc')
        .count('searches.id as itemsCount')
        .page(page - 1, limit);
    } catch (error) {
      logger.error(error);
      throw new ServicesError();
    }
  }
}
