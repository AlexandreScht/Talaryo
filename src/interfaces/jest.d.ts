import type MemoryServerCache from '@/libs/memoryCache';
import type { ApiPuppeteer } from '@/libs/puppeteer';
import type SocketManager from '@/libs/socketManager';
import type StreamManager from '@/libs/streamManager';
import type ApiServiceFile from '@/services/api';
import type AuthServiceFile from '@/services/auth';
import type FavorisFolderServiceFile from '@/services/favFolders';
import type FavorisServiceFile from '@/services/favoris';
import type MailerServiceFile from '@/services/mailer';
import type ScoreServiceFile from '@/services/scores';
import type SearchesServiceFile from '@/services/searches';
import type SearchFolderServiceFile from '@/services/searchFolders';
import type UserServiceFile from '@/services/users';
import type ScrapperServiceFile from '@/strategys/scrapper';
import type { AxiosRequestConfig } from 'axios';
import type Tesseract from 'tesseract.js';
import type { eventData } from './webSocket';

//; modules
interface AxiosJest {
  get: jest.SpyInstance<Promise<unknown>, [url: string, config?: AxiosRequestConfig<unknown>], any>;
  del: jest.SpyInstance<Promise<unknown>, [url: string, config?: AxiosRequestConfig<unknown>], any>;
  patch: jest.SpyInstance<Promise<unknown>, [url: string, data?: unknown, config?: AxiosRequestConfig<unknown>], any>;
  put: jest.SpyInstance<Promise<unknown>, [url: string, data?: unknown, config?: AxiosRequestConfig<unknown>], any>;
  post: jest.SpyInstance<Promise<unknown>, [url: string, data?: unknown, config?: AxiosRequestConfig<unknown>], any>;
}

// eslint-disable-next-line prettier/prettier
type tesseractJest = jest.SpiedFunction<(typeof Tesseract)['recognize']>;
//; Libs

interface StreamManagerJest {
  getStreamUser: jest.SpiedFunction<StreamManager['getStreamUser']>;
  init: jest.SpiedFunction<StreamManager['init']>;
  newStream: jest.SpiedFunction<StreamManager['newStream']>;
  checkStream: jest.SpiedFunction<StreamManager['checkStream']>;
  process: jest.SpiedFunction<StreamManager['process']>;
  execute: jest.SpiedFunction<StreamManager['execute']>;
  streamStrategies: jest.SpiedFunction<StreamManager['streamStrategies']>;
}
interface MemoryCacheJest {
  setMemory: jest.SpiedFunction<MemoryServerCache['setMemory']>;
  getMemory: jest.SpiedFunction<MemoryServerCache['getMemory']>;
  clearMemory: jest.SpiedFunction<MemoryServerCache['clearMemory']>;
  delMemory: jest.SpiedFunction<MemoryServerCache['delMemory']>;
  memoryData: MemoryServerCache['memory'];
}

interface SocketManagerJest {
  socketUserList: Map<string, unknown>;
  socketEmitted: eventData[];
  socketEventInQueue: { idUser: string | number; eventData: eventData }[];
  ioSendTo: jest.SpiedFunction<SocketManager['ioSendTo']>;
}

interface PuppeteerJest {
  check: jest.SpiedFunction<ApiPuppeteer['check']>;
  scrapePage: jest.SpiedFunction<ApiPuppeteer['scrapePage']>;
  open: jest.SpiedFunction<ApiPuppeteer['open']>;
  configurePage: jest.SpiedFunction<ApiPuppeteer['configurePage']>;
  scrapperReseaux: jest.SpiedFunction<ApiPuppeteer['scrapperReseaux']>;
  scrapperCv: jest.SpiedFunction<ApiPuppeteer['scrapperCV']>;
  close: jest.SpiedFunction<ApiPuppeteer['close']>;
  getNumber: jest.SpiedFunction<ApiPuppeteer['getNumber']>;
  init: jest.SpiedFunction<ApiPuppeteer['init']>;
  testProxy: jest.SpiedFunction<ApiPuppeteer['testProxy']>;
}
//; services

//> API
interface APIServicesJest {
  updateBrevoUser: jest.SpiedFunction<ApiServiceFile['UpdateBrevoUser']>;
  createBrevoUser: jest.SpiedFunction<ApiServiceFile['CreateBrevoUser']>;
  FetchMailRequestId: jest.SpiedFunction<ApiServiceFile['FetchMailRequestId']>;
  FetchMailData: jest.SpiedFunction<ApiServiceFile['FetchMailData']>;
  SendSignalHireRequest: jest.SpiedFunction<ApiServiceFile['SendSignalHireRequest']>;
  checkSignalHireCredit: jest.SpiedFunction<ApiServiceFile['checkSignalHireCredit']>;
}

//> auth
interface AuthServicesJest {
  login: jest.SpiedFunction<AuthServiceFile['login']>;
  register: jest.SpiedFunction<AuthServiceFile['register']>;
}

//> Users
interface UserServicesJest {
  findUsers: jest.SpiedFunction<UserServiceFile['findUsers']>;
  updateUsers: jest.SpiedFunction<UserServiceFile['updateUsers']>;
  getUser: jest.SpiedFunction<UserServiceFile['getUser']>;
  presetNewPassword: jest.SpiedFunction<UserServiceFile['presetNewPassword']>;
  generateCodeAccess: jest.SpiedFunction<UserServiceFile['generateCodeAccess']>;
  generateTokenAccess: jest.SpiedFunction<UserServiceFile['generateTokenAccess']>;
}

//> searchFolders
interface SearchFolderServicesJest {
  create: jest.SpiedFunction<SearchFolderServiceFile['create']>;
  getContent: jest.SpiedFunction<SearchFolderServiceFile['getContent']>;
  deleteSearchFolder: jest.SpiedFunction<SearchFolderServiceFile['delete']>;
  search: jest.SpiedFunction<SearchFolderServiceFile['search']>;
}

//> search
interface SearchServicesJest {
  deleteSearchesFromFolder: jest.SpiedFunction<SearchesServiceFile['deleteSearchesFromFolder']>;
  getTotalSearchCount: jest.SpiedFunction<SearchesServiceFile['getTotalCount']>;
  create: jest.SpiedFunction<SearchesServiceFile['create']>;
  get: jest.SpiedFunction<SearchesServiceFile['get']>;
  getSearchesFromFolder: jest.SpiedFunction<SearchesServiceFile['getSearchesFromFolder']>;
  deleteFav: jest.SpiedFunction<SearchesServiceFile['delete']>;
  lockIn: jest.SpiedFunction<SearchesServiceFile['lockIn']>;
}

//> scores
interface ScoresServicesJest {
  getUserCurrentScores: jest.SpiedFunction<ScoreServiceFile['getUserCurrentScores']>;
  getUserRangeScores: jest.SpiedFunction<ScoreServiceFile['getUserRangeScores']>;
  getTotalMonthValues: jest.SpiedFunction<ScoreServiceFile['getTotalMonthValues']>;
  improveScore: jest.SpiedFunction<ScoreServiceFile['improveScore']>;
  decrementCv: jest.SpiedFunction<ScoreServiceFile['decrementCv']>;
}

//> scraper
interface ScraperServicesJest {
  scrapeCV: jest.SpiedFunction<ScrapperServiceFile['scrapeCV']>;
  scrapeCandidate: jest.SpiedFunction<ScrapperServiceFile['scrapeCandidate']>;
  cvStrategy: jest.SpiedFunction<ScrapperServiceFile['cvStrategy']>;
}

//> favoris
interface FavorisServicesJest {
  getTotalFavorisCount: jest.SpiedFunction<FavorisServiceFile['getTotalCount']>;
  updateFav: jest.SpiedFunction<FavorisServiceFile['update']>;
  deleteFav: jest.SpiedFunction<FavorisServiceFile['delete']>;
  getFavorisFromFolder: jest.SpiedFunction<FavorisServiceFile['getFavorisFromFolder']>;
  get: jest.SpiedFunction<FavorisServiceFile['get']>;
  create: jest.SpiedFunction<FavorisServiceFile['create']>;
  deleteFavorisFromFolder: jest.SpiedFunction<FavorisServiceFile['deleteFavorisFromFolder']>;
  userCandidateFavoris: jest.SpiedFunction<FavorisServiceFile['userCandidateFavoris']>;
  lockIn: jest.SpiedFunction<FavorisServiceFile['lockIn']>;
}

//> favFolder
interface FavFolderServicesJest {
  search: jest.SpiedFunction<FavorisFolderServiceFile['search']>;
  create: jest.SpiedFunction<FavorisFolderServiceFile['create']>;
  getContent: jest.SpiedFunction<FavorisFolderServiceFile['getContent']>;
  deleteFavFolder: jest.SpiedFunction<FavorisFolderServiceFile['delete']>;
}

//> mailer
interface MailerServicesJest {
  Registration: jest.SpiedFunction<MailerServiceFile['Registration']>;
  TwoFactorAuthenticate: jest.SpiedFunction<MailerServiceFile['TwoFactorAuthenticate']>;
  Invoice: jest.SpiedFunction<MailerServiceFile['Invoice']>;
  Update_subscription: jest.SpiedFunction<MailerServiceFile['Update_subscription']>;
  Delete_subscription: jest.SpiedFunction<MailerServiceFile['Delete_subscription']>;
  New_invoice: jest.SpiedFunction<MailerServiceFile['New_invoice']>;
  Failed_subscription: jest.SpiedFunction<MailerServiceFile['Failed_subscription']>;
  Cancel_request: jest.SpiedFunction<MailerServiceFile['Cancel_request']>;
  ResetPassword: jest.SpiedFunction<MailerServiceFile['ResetPassword']>;
}
