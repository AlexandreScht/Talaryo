interface newFolderType {
  id: `${number}`;
  name: string;
  userId: number;
}

interface folderType {
  id: `${number}`;
  name: string;
  itemsCount: `${number}`;
}

interface getFolderType {
  results: Array<searchFoldersType>;
  total: number;
}
