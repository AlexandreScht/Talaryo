export interface favorisData {
  link: string;
  desc: string;
  img: string;
  fullName: string;
  currentJob?: string;
  currentCompany?: string;
  favFolderId: number;
}

export type findFav = {
  link: string;
  favFolderId: number;
};
