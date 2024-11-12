import { mainParams } from './components';
import { favCreate } from './services';

interface emailProps {
  email: string;
  color?: number;
  phone?: string;
}
export interface scrappingReseauProps {
  id?: string;
  link: string;
  fullName: string;
  currentJob?: string;
  diplome?: string;
  currentCompany?: string;
  resume: string;
  img: string;
  isFavoris?: boolean;
  email?: emailProps[];
  favFolderId?: number;
}
export interface scrappingCVProps {
  id?: string;
  fullName: string;
  resume: string;
  currentJob?: string;
  currentCompany?: string;
  isFavoris?: boolean;
  favFolderId?: number;
  diplome?: string;
  img: string;
  pdf: string;
  link?: string;
  isEnd?: boolean;
}

interface jsonPersonalProps {
  email: string;
  color: 1 | 2 | 3;
  phone: string;
}

interface personalDataProps {
  email?: string;
  json?: jsonPersonalProps[];
}

type scrappingInfos = scrappingReseauProps | scrappingCVProps;

interface candidateDataProps {
  start: number;
  index: number;
  total: number;
  inStream?: boolean;
}
interface searchParamsIA {
  fn: string[];
  industry?: string[];
  sector?: string[];
  skill?: string[];
  key?: string[];
  loc?: string[];
  Nindustry?: string[];
  Nskill?: string[];
  Nkey?: string[];
  current?: boolean;
  matching?: number;
  date?: number;
  formation?: string[];
}
interface convertParamsIA {
  company?: {
    lookFor?: string[];
    banned?: string[];
    current?: boolean;
  };
  sector?: string[];
  skill?: {
    lookFor?: string[];
    banned?: string[];
  };
  key?: {
    lookFor?: string[];
    banned?: string[];
  };
  loc?: string[];
  matching?: number;
  date?: number;
  formation?: string[];
}
interface trainingDataProps {
  start: number;
  index: number;
  total: number;
  searchParams: searchParamsIA;
}
type scrappingDataStorage = {
  search: mainParams;
  nPages?: number;
} & candidateDataProps;

export interface profils {
  res: scrappingInfos[];
  data: candidateDataProps;
}
interface train {
  system: string;
  prompt: string;
  link: string;
}
interface trainingData {
  res: train[];
  data: trainingDataProps;
}

export interface initializedStorage {
  pages: scrappingInfos[];
  data: scrappingDataStorage;
}
export interface scrappingStorage {
  pages: scrappingInfos[];
  pro?: {
    data: scrappingDataStorage;
  };
  cv?: {
    data: scrappingDataStorage;
  };
}
export interface trainingStorage {
  list: train[];
  data: trainingDataProps;
}

interface serializeCandidateProps {
  nPage: number;
  list: scrappingInfos[];
  lastPage: boolean;
  skippedCandidate: boolean;
  search: mainParams;
  total: number;
}

interface FolderAction {
  folderBack?: boolean;
  folderClosed?: boolean;
  selectFav?: favCreate;
}
