import type { Favoris } from '@interfaces/models';
import { Model, ModelObject, QueryBuilder } from 'objection';
import { FavFoldersModel } from './favFolders';

export class FavoriModel extends Model implements Favoris {
  id: number;
  userId: number;
  link: string;
  desc: string;
  img: string;
  fullName: string;
  currentJob?: string;
  currentCompany?: string;
  disabled: boolean;
  favFolderId: number;
  count?: string;

  static tableName = 'favoris';
  static idColumn = 'id';

  static get relationMappings() {
    return {
      folder: {
        relation: Model.BelongsToOneRelation,
        modelClass: FavFoldersModel,
        join: {
          from: 'favoris.favFolderId',
          to: 'favFolders.id',
        },
      },
    };
  }

  static modifiers = {
    paginate: (query: QueryBuilder<FavoriModel, FavoriModel[]>, limit: number, page: number) => query.limit(limit).offset((page - 1) * limit),
  };
}

export type FavoriShape = ModelObject<FavoriModel>;
