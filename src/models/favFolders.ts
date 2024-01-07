import { favFolders } from '@interfaces/models';
import { Model, ModelObject, QueryBuilder, QueryBuilderType } from 'objection';
import { FavoriModel } from './favoris';

export class FavFoldersModel extends Model implements favFolders {
  id: number;
  userId: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  count?: string;

  static tableName = 'favFolders';
  static idColumn = 'id';

  static get relationMappings() {
    return {
      favoris: {
        relation: Model.HasManyRelation,
        modelClass: FavoriModel,
        join: {
          from: 'favFolders.id',
          to: 'favoris.favFolderId',
        },
        modify: (query: QueryBuilderType<FavFoldersModel>) => {
          query.where({ disabled: false }).select('id');
        },
      },
    };
  }

  static modifiers = {
    paginate: (query: QueryBuilder<FavFoldersModel, FavFoldersModel[]>, limit: number, page: number) => query.limit(limit).offset((page - 1) * limit),
  };
}

export type FavoriShape = ModelObject<FavFoldersModel>;
