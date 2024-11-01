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
      logger.error('SearchFolderService.create => ', error);
      throw new ServicesError();
    }
  }

  public async delete(id: number, userId: number): Promise<number> {
    try {
      return await SearchFolderModel.query()
        .where({ userId })
        .patch({ deleted: true })
        .returning('id')
        .findById(id)
        .then(v => (v?.id ? Number.parseInt(String(v?.id)) : undefined));
    } catch (error) {
      logger.error('SearchFolderService.delete => ', error);

      throw new ServicesError();
    }
  }
  public async search(name: string, userId: number): Promise<SearchFolderShape> {
    try {
      return await SearchFolderModel.query().select('id').where({ name, userId, deleted: false }).first();
    } catch (error) {
      logger.error('SearchFolderService.search => ', error);
      throw new ServicesError();
    }
  }

  public async getContent(userId: number, { limit, page, name }: { limit: number; page: number; name?: string }): Promise<Page<SearchFolderModel>> {
    try {
      let query = SearchFolderModel.query().alias('sf').where('sf.userId', userId).andWhere('sf.deleted', false);

      if (name) {
        query = query.andWhereRaw('LOWER(sf.name) LIKE LOWER(?)', [`${name.toLowerCase()}%`]);
      }

      return await query
        .select('sf.id', 'sf.name')
        .leftJoin('searches', function () {
          this.on('sf.id', '=', 'searches.searchFolderId').onVal('searches.locked', false).andOnVal('searches.deleted', false);
        })
        .groupBy('sf.id')
        .orderBy('sf.id', 'asc')
        .count('searches.id as itemsCount')
        .page(page - 1, limit);
    } catch (error) {
      logger.error('SearchFolderService.getContent => ', error);
      throw new ServicesError();
    }
  }
}
