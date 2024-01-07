import { searchFolders } from '@interfaces/models';
import { Model, ModelObject, QueryBuilder } from 'objection';

export class SearchFolderModel extends Model implements searchFolders {
  id: number;
  userId: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  count?: string;

  static tableName = 'searchFolders';
  static idColumn = 'id';

  static modifiers = {
    paginate: (query: QueryBuilder<SearchFolderModel, SearchFolderModel[]>, limit: number, page: number) =>
      query.limit(limit).offset((page - 1) * limit),
  };
}

export type FavoriShape = ModelObject<SearchFolderModel>;
