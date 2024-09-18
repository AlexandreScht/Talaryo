import { searches } from '@/interfaces/models';
import { Model, ModelObject } from 'objection';

export class SearchesModel extends Model implements searches {
  id: number;
  userId: number;
  searchFolderId: number;
  searchQueries: string;
  name: string;
  society?: string;
  createdAt: string;
  updatedAt: string;
  locked: boolean;
  deleted: boolean;
  count?: string;
  isCv?: boolean;

  static tableName = 'searches';
  static idColumn = 'id';
}

export type SearchesShape = ModelObject<SearchesModel>;
