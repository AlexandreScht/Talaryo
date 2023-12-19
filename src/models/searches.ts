import { searches } from '@interfaces/models';
import { Model, ModelObject, QueryBuilder } from 'objection';

export class SearchesModel extends Model implements searches {
  id: number;
  userId: number;
  searchFolderId: number;
  searchQueries: string;
  name: string;
  society?: string;
  count?: string;

  static tableName = 'searches';
  static idColumn = 'id';

  static modifiers = {
    paginate: (query: QueryBuilder<SearchesModel, SearchesModel[]>, limit: number, page: number) => query.limit(limit).offset((page - 1) * limit),
  };
}

export type FavoriShape = ModelObject<SearchesModel>;
