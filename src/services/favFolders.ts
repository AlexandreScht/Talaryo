import { ServicesError } from '@/exceptions';
import { FavFoldersModel, type FavFoldersShape } from '@/models/pg/favFolders';
import { logger } from '@/utils/logger';
// import { normalizeString } from '@/utils/serializer';
import { ConstraintViolationError, Page } from 'objection';
import { Service } from 'typedi';
@Service()
export default class FavorisFolderServiceFile {
  public async create(name: string, userId: number): Promise<FavFoldersShape | boolean> {
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
      logger.error('FavorisFolderService.create => ', error);
      throw new ServicesError();
    }
  }

  public async delete(id: number, userId: number): Promise<number> {
    try {
      return await FavFoldersModel.query()
        .where({ userId })
        .patch({ deleted: true })
        .returning('id')
        .findById(id)
        .then(v => (v?.id ? Number.parseInt(String(v?.id)) : undefined));
    } catch (error) {
      logger.error('FavorisFolderService.delete => ', error);
      throw new ServicesError();
    }
  }
  public async search(name: string, userId: number): Promise<FavFoldersShape> {
    try {
      return await FavFoldersModel.query().select('id').where({ name, userId, deleted: false }).first();
    } catch (error) {
      logger.error('FavorisFolderService.search => ', error);
      throw new ServicesError();
    }
  }

  public async getContent(userId: number, { limit, page, name }: { limit: number; page: number; name?: string }): Promise<Page<FavFoldersModel>> {
    try {
      let query = FavFoldersModel.query().where('favFolders.userId', userId).andWhere('favFolders.deleted', false);

      if (name) {
        query = query.andWhereRaw('LOWER("name") LIKE LOWER(?)', [`${name.toLocaleLowerCase()}%`]);
      }

      return await query
        .select('favFolders.id', 'favFolders.name')
        .leftJoin('favoris', function () {
          this.on('favFolders.id', '=', 'favoris.favFolderId').onVal('favoris.locked', false).andOnVal('favoris.deleted', false);
        })
        .groupBy('favFolders.id')
        .orderBy('favFolders.id', 'asc')
        .count('favoris.id as itemsCount')
        .page(page - 1, limit);
    } catch (error) {
      logger.error('FavorisFolderService.getContent => ', error);
      throw new ServicesError();
    }
  }
}
