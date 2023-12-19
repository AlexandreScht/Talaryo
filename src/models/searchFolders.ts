import { searchFolders } from '@interfaces/models';
import { Model, ModelObject, QueryBuilder, QueryBuilderType } from 'objection';
import { SearchesModel } from './searches';

export class SearchFolderModel extends Model implements searchFolders {
  id: number;
  userId: number;
  name: string;
  count?: string;

  static tableName = 'searchFolders';
  static idColumn = 'id';

  static get relationMappings() {
    return {
      searches: {
        relation: Model.HasManyRelation,
        modelClass: SearchesModel,
        join: {
          from: 'searchFolders.id',
          to: 'searches.searchFolderId',
        },
        modify: (query: QueryBuilderType<SearchFolderModel>) => {
          query.select('id', 'searchQueries', 'name', 'society');
        },
      },
    };
  }

  static modifiers = {
    paginate: (query: QueryBuilder<SearchFolderModel, SearchFolderModel[]>, limit: number, page: number) =>
      query.limit(limit).offset((page - 1) * limit),
  };
}

export type FavoriShape = ModelObject<SearchFolderModel>;
