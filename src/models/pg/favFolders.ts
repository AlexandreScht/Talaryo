import { favFolders } from '@/interfaces/models';
import { Model, ModelObject, QueryBuilderType } from 'objection';
import { FavorisModel } from './favoris';

export class FavFoldersModel extends Model implements favFolders {
  id: number;
  userId: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  count?: string;
  itemsCount?: string;
  deleted: boolean;
  lock?: number | true;

  static tableName = 'favFolders';
  static idColumn = 'id';

  static get relationMappings() {
    return {
      favorisRelation: {
        relation: Model.HasManyRelation,
        modelClass: FavorisModel,
        join: {
          from: 'favFolders.id',
          to: 'favoris.favFolderId',
        },
        modify: (query: QueryBuilderType<FavFoldersModel>) => {
          query.where({ disabled: false });
        },
      },
    };
  }
}

export type FavFoldersShape = ModelObject<FavFoldersModel>;
