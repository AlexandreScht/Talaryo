import { scrappingReseauProps } from './scrapping';
import { role } from './users';
export interface Meta {
  total?: number;
  maxIdx?: boolean;
}
type loginForm = {
  email: string;
  password: string;
};

interface fullLoginForm extends loginForm {
  token: string;
}

interface registerForm extends loginForm {
  firstName: string;
  lastName: string;
  confirm: string;
}
export interface AuthFormType extends registerForm {
  token?: string;
}

interface fullLoginForm extends loginForm {
  token: string;
}

export interface ResetFormType {
  email: string;
}
export interface NewPasswordFormType {
  password: string;
  confirm: string;
  token?: string;
}

export interface ConfirmAccountType {
  accessToken: string;
}

export interface ServicesRoutesType {
  [key: string]: {
    [key: string]: (value?: object | params) => string;
  };
}

export interface ServicesPagination {
  limit?: number;
  page?: number;
  name?: string;
}

type ResponseType<T> = {
  err?: unknown;
  res?: T;
  code?: number | string;
};

export type locZone = 'Région(s)' | 'Commune(s)' | 'Département(s)';
export interface Zone {
  search: string | number;
  zone: locZone;
}

//? Auth
interface activate2FAType {
  twoFactorType: Required<twoFactorType>;
  otp: number;
}

type twoFactorType = 'authenticator' | 'email' | undefined;

interface ParamsWithFavFolderName {
  favFolderName: string;
  limit?: number;
  page?: number;
}
interface ParamsWithoutFolderName {
  limit?: number;
  page?: number;
  isCv?: boolean;
}

type getFavorisParams = ParamsWithFavFolderName | ParamsWithoutFolderName;

interface getFavorites {
  results: scrappingReseauProps[];
  total: number;
}

interface searchesFetch {
  id: `${number}`;
  searchQueries: string;
  searchFolderId: number;
  userId: number;
}
interface getSearches {
  results: searchesFetch[];
  total: number;
}

export interface favoris {
  id?: string;
  link: string;
  desc?: string;
  img: string;
  email?: string | boolean;
  platform: string;
  fullName: string;
  currentJob?: string;
  currentCompany?: string;
  favFolderId?: number;
}

export interface foldersList {
  id: string;
  name?: string;
  itemsCount?: string;
}

interface formValues {
  name: string;
  society?: string;
}
interface foldersChoose {
  folderType: 'favoris' | 'search';
  formValues?: formValues;
  folder: foldersList;
}

interface returnProps {
  id: number;
  itemsCount: number;
}

interface favCreate {
  folder: foldersList;
  returnProps?: (values: returnProps | false) => void;
  fav?: scrappingInfos;
}

export interface folders {
  meta: Meta;
  folders: foldersList[];
}

//  ? general
export interface pagination {
  limit?: number;
  page?: number;
}

export interface FetchSearch {
  search?: number;
  limit?: number;
  page?: number;
}

// ? users

export type UsersType = {
  id: number;
  lastName: string;
  firstName: string;
  email: string;
  role?: role;
};

export type getUsersType = UsersType & pagination;

// ? score
type pageType = 'pro' | 'cv';

export interface getScores {
  firstDate?: boolean;
  lastDate?: number;
}

interface userContact {
  firstName: string;
  lastName: string;
  email: string;
}

export type contactUs = userContact & { message: string };

//? search

interface ParamsWithSearchFolderName {
  searchFolderName: string;
  limit?: number;
  page?: number;
}

type getSearchesParams = ParamsWithSearchFolderName | ParamsWithoutFolderName;
