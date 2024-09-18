import { searchFolders } from '@/interfaces/models';
import { Model, ModelObject } from 'objection';

export class SearchFolderModel extends Model implements searchFolders {
  id: number;
  userId: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
  count?: string;

  static tableName = 'searchFolders';
  static idColumn = 'id';
}

export type SearchFolderShape = ModelObject<SearchFolderModel>;
