import { InvalidArgumentError, ServicesError } from '@/exceptions';
import { FavorisModel, type FavorisShape } from '@/models/pg/favoris';
import { logger } from '@/utils/logger';
import { ConstraintViolationError, ForeignKeyViolationError, Page } from 'objection';
import { Service } from 'typedi';

@Service()
export default class FavorisServiceFile {
  public async create(values: Partial<Omit<FavorisShape, 'userId'>>, userId: number): Promise<false | { id: number }> {
    const email = typeof values?.email === 'boolean' ? 'false' : values?.email;
    try {
      return await FavorisModel.query()
        .insert({ ...values, userId, email })
        .returning('id');
    } catch (error) {
      if (error instanceof ForeignKeyViolationError) {
        throw new InvalidArgumentError("Le dossier assigné au favori n'existe pas.");
      }
      if (error instanceof ConstraintViolationError) {
        const { link, pdf, favFolderId } = values;

        const existingFav = link
          ? await FavorisModel.query().where({ userId, link, favFolderId, deleted: true }).first()
          : await FavorisModel.query().where({ userId, pdf, favFolderId, deleted: true }).first();

        if (existingFav) {
          return await existingFav
            .$query()
            .updateAndFetch({
              ...values,
              deleted: false,
              locked: false,
              email,
            })
            .returning('id');
        }
        return false;
      }

      logger.error('FavorisService.create => ', error);
      throw new ServicesError();
    }
  }

  public async delete(id: number, userId: number): Promise<boolean> {
    try {
      return await FavorisModel.query()
        .findById(id)
        .where({ userId })
        .patch({ deleted: true })
        .then(v => !!v);
    } catch (error) {
      logger.error('FavorisService.delete => ', error);
      throw new ServicesError();
    }
  }

  public async update(values: Partial<Omit<FavorisShape, 'userId'>>, id: number, userId: number): Promise<boolean> {
    try {
      return await FavorisModel.query()
        .findById(id)
        .where({ userId })
        .patch({ ...values, email: typeof values.email === 'boolean' ? 'false' : values.email })
        .then(v => !!v);
    } catch (error) {
      logger.error('FavorisService.update => ', error);
      throw new ServicesError();
    }
  }

  public async deleteFavorisFromFolder(favFolderId: number): Promise<boolean> {
    try {
      return await FavorisModel.query()
        .where({ favFolderId })
        .patch({ deleted: true })
        .then(v => !!v);
    } catch (error) {
      logger.error('FavorisService.deleteFavorisFromFolder => ', error);
      throw new ServicesError();
    }
  }

  public async getTotalCount(userId: number): Promise<number> {
    try {
      return await FavorisModel.query()
        .where({ userId, locked: false, deleted: false })
        .count()
        .then(v => {
          const [{ count }] = v;
          return Number.parseInt(count, 10);
        });
    } catch (error) {
      logger.error('FavorisService.getTotalCount => ', error);
      throw new ServicesError();
    }
  }

  public async userCandidateFavoris(userId: number, cvFav: boolean = false): Promise<Map<string, number | undefined>> {
    try {
      return await FavorisModel.query()
        .where({ userId, deleted: false })
        .modify(query =>
          cvFav ? query.whereNot({ pdf: 'none' }).andWhereNot({ pdf: null }) : query.whereNot({ link: 'none' }).andWhereNot({ link: null }),
        )
        .select('link', 'favFolderId')
        .then(v => (v?.length ? new Map(v.map(fav => [cvFav ? fav.pdf : fav.link, fav.favFolderId])) : undefined));
    } catch (error) {
      logger.error('FavorisService.UserFavoris => ', error);
      throw new ServicesError();
    }
  }

  public async getFavorisFromFolder(limit: number, page: number, favFolderId: number): Promise<Page<FavorisModel>> {
    try {
      return await FavorisModel.query()
        .where({ favFolderId, locked: false, deleted: false })
        .orderBy('id', 'desc')
        .page(page - 1, limit)
        .then(({ results, total }) => {
          const favoris = results.map(favorite => {
            if (favorite.email === 'false') {
              favorite.email = null;
            } else if (!favorite.email) {
              favorite.email = undefined;
            }
            if (favorite.pdf === 'none') {
              delete favorite.pdf;
            }
            if (favorite.link === 'none') {
              delete favorite.link;
            }

            return { ...favorite, isFavoris: true };
          });
          return { results: favoris as FavorisModel[], total };
        });
    } catch (error) {
      logger.error('FavorisService.getFavorisFromFolder => ', error);
      throw new ServicesError();
    }
  }

  public async get({ limit = 10, page = 1, isCv }: { limit?: number; isCv?: boolean; page?: number }, userId: number): Promise<Page<FavorisModel>> {
    try {
      return FavorisModel.query()
        .where({ userId, deleted: false, locked: false })
        .modify(query =>
          typeof isCv === 'boolean' && isCv === true
            ? query.whereNot({ pdf: 'none' }).andWhereNot({ pdf: null })
            : query.whereNot({ link: 'none' }).andWhereNot({ link: null }),
        )
        .orderBy('id', 'desc')
        .page(page - 1, limit);
    } catch (error) {
      logger.error('FavorisService.get => ', error);
      throw new ServicesError();
    }
  }

  public async lockIn(userId: number, n: number): Promise<void> {
    try {
      if (n === Infinity) {
        await FavorisModel.query().where({ userId, locked: true, deleted: false }).patch({ locked: false });
        return;
      }

      await FavorisModel.query()
        .where({ userId })
        .orderBy('id', 'asc')
        .modify(qb => {
          qb.where({ locked: true }).limit(n).patch({ locked: false });
        })
        .modify(qb => {
          qb.offset(n).patch({ locked: true });
        });
    } catch (error) {
      logger.error('FavorisService.lockIn => ', error);
      throw new ServicesError();
    }
  }
}
