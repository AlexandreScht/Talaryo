import { paramsKey } from './scrapping';
import { pageType } from './services';
import { role, userPayload } from './users';

interface mainParams {
  platform?: string;
  fn?: string;
  industry?: string;
  sector?: string;
  skill?: string;
  key?: string;
  loc?: string;
  Nindustry?: string;
  Nskill?: string;
  Nkey?: string;
  time?: boolean;
  zone?: boolean;
  start?: number;
  index?: number;
  matching?: number;
  date?: number;
  formation?: string;
}
export interface SelectDownItemsContent {
  startContent?: ReactNode;
  disabled?: boolean;
  access?: role;
  name: string;
}
export type SelectDownItemsType = 'unique' | 'group' | 'multiple';
export interface SelectDownItems {
  id: number;
  title: string;
  itemsList: SelectDownItemsContent[];
  type?: SelectDownItemsType;
  disabled?: boolean;
  access?: role;
}

// export type SelectDownItems = Record<string, SelectDownItemsContent[]> & { type?: 'unique' | 'group' } & { disabled?: boolean };

export interface SelectDown {
  label: string;
  maxItems: number;
  items: SelectDownItems[];
  multiple: boolean;
  className?: string;
  User: userPayload;
  searchParams?: mainParams;
}

export type KeyDown = [string, SelectDownItemsType, string];

//* input
type paramsKey = keyof Omit<mainParams, 'start' | 'index'>;
export interface InputParams {
  props: mainParams;
  params: paramsKey;
}
export interface InputProps {
  className?: string;
  maxItems?: boolean;
  label: string;
  searchParams: InputParams;
}

//* buttons choices view
export interface ToastProps {
  rtl: undefined | boolean;
  position: string;
  type: string;
  defaultClassName: string;
}
export interface StartButtonProps {
  children: React.ReactNode;
  className?: string;
  searchParams: mainParams;
  page: pageType;
  training?: true;
}

//* fav search save
export type favSearch = Record<'title' | 'subtitle' | 'link', sting | number>;

//* choice select
export type SelectChoiceClassName = {
  wrapper: string;
  label: string;
  input: Text;
};

type callBack = {
  callBackValue: true;
  callBackFn: Dispatch<SetStateAction<unknown[]>>;
};

export interface loc {
  nom: string;
  code: string;
  codesPostaux?: string;
  departement?: { code: string; nom: string };
  region?: { code: string; nom: string };
}

export type items = Record<'label' | 'value', string>;

export type SelectChoice = {
  classNames?: Partial<SelectChoiceClassName>;
  label: string;
  limit: number;
  message?: string;
  placeholder?: string;
  searchParams: InputParams;
};
