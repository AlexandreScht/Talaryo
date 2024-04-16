import { sources } from '@/interfaces/scrapping';

export const sourcesPro: sources[] = ['Viadeo', 'Xing', 'Batiactu', 'Dribble', 'Behance', 'Culinary agents', 'Symfony'];

export const sourcesBusiness: sources[] = ['HEC', 'Polytechnique', 'Ferrandi', 'UTC', 'Centrale Supélec', 'Centrale Lille', 'Essec', 'Neoma'];

export const totalSearch = {
  free: 10,
  pro: 100,
  business: Infinity,
};

export const totalMailFind = {
  free: 10,
  pro: 200,
  business: 500,
};

export const totalFavorisSave = {
  free: 10,
  pro: 100,
  business: Infinity,
};

export const totalSearchSave = {
  free: 3,
  pro: 10,
  business: Infinity,
};
