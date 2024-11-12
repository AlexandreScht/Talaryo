export interface searches {
  id: string;
  searchFolderId?: string;
  searchQueries: string;
  name: string;
  society?: string;
  isCv: boolean;
}

export interface searchFoldersType {
  id: string;
  name: string;
  itemsCount: string;
  isCv: boolean;
}
