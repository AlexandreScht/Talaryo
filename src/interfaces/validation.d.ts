import type yup from 'yup';
import { mainParams } from './components';

export type validatorsProps = yup.ObjectSchema<
  Record<string, yup.Schema<unknown, unknown, unknown, unknown>>
>;

// ? SearchFolder
export interface createSearchFolderType {
  search: mainParams;
  searchFolderId: number;
  name: string;
  society?: string;
}
