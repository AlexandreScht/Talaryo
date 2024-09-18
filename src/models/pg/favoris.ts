import { Favoris } from '@/interfaces/models';
import { Model, ModelObject } from 'objection';
import { FavFoldersModel } from './favFolders';

export class FavorisModel extends Model implements Favoris {
  id: number;
  userId: number;
  link?: string;
  pdf?: string;
  resume: string;
  img: string;
  fullName: string;
  currentJob?: string;
  email?: string;
  currentCompany?: string;
  disabled: boolean;
  favFolderId: number;
  isFavoris: boolean;
  createdAt: string;
  updatedAt: string;
  locked: boolean;
  deleted: boolean;
  count?: string;

  static tableName = 'favoris';
  static idColumn = 'id';

  static get relationMappings() {
    return {
      folderRelation: {
        relation: Model.BelongsToOneRelation,
        modelClass: FavFoldersModel,
        join: {
          from: 'favoris.favFolderId',
          to: 'favFolders.id',
        },
      },
    };
  }
}

export type FavorisShape = ModelObject<FavorisModel>;
