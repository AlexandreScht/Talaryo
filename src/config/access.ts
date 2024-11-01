import { platforms } from '@/interfaces/scrapping';

export const accessUsers = ['alexandreschecht@gmail.com', 'guideofdofus@gmail.com'];

export const platformsPro: platforms[] = ['Viadeo', 'Xing', 'Batiactu', 'Dribble', 'Behance', 'Culinary agents', 'Symfony'];

export const platformsBusiness: platforms[] = ['HEC', 'Polytechnique', 'Ferrandi', 'UTC', 'Centrale Supélec', 'Centrale Lille', 'Essec', 'Neoma'];

export const ROLE_SEARCH_LIMIT = {
  free: 10,
  pro: 100,
  business: Infinity,
  admin: Infinity,
};

export const ROLE_CV_SEARCH_LIMIT = {
  free: 10,
  pro: 100,
  business: Infinity,
  admin: Infinity,
};

export const ROLE_MAIL_FOUND_LIMIT = {
  free: 10,
  pro: 200,
  business: 500,
  admin: Infinity,
};

export const ROLE_FAVORIS_SAVE_LIMIT = {
  free: 10,
  pro: 100,
  business: Infinity,
  admin: Infinity,
};

export const ROLE_SEARCH_SAVE_LIMIT = {
  free: 3,
  pro: 10,
  business: Infinity,
  admin: Infinity,
};
