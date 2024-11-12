import { SelectDownItems } from '@/interfaces/components';

export const ProReseaux: SelectDownItems = {
  id: 1,
  title: 'Reseaux Sociaux',
  itemsList: [
    { name: 'LinkedIn' },
    { name: 'Viadeo', access: 'pro' },
    { name: 'Xing', access: 'pro' },
  ],
  type: 'unique',
};
export const ProSpecial: SelectDownItems = {
  id: 2,
  title: 'Reseaux Spéciales',
  itemsList: [
    // { name: 'PmeBTP' },
    { name: 'Batiactu' },
    { name: 'Dribble' },
    { name: 'Behance' },
    { name: 'Culinary agents' },
    { name: 'Symfony' },
  ],
  type: 'unique',
  access: 'pro',
};

export const ProAlumni: SelectDownItems = {
  id: 3,
  title: 'Alumnis',
  itemsList: [
    { name: 'HEC' },
    { name: 'Polytechnique' },
    { name: 'Ferrandi' },
    { name: 'UTC' },
    { name: 'Centrale Supélec' },
    { name: 'Centrale Lille' },
    { name: 'Essec' },
    { name: 'Neoma' },
  ],
  type: 'unique',
  access: 'business',
};

// export const ProSchool: SelectDownItems = {
//   id: 4,
//   title: 'Étudiants',
//   itemsList: [{ name: 'ESTP' }, { name: 'Mines Ales' }, { name: 'AIVP' }, { name: 'ENSG' }, { name: 'ICAM' }, { name: 'Skema' }],
//   disabled: true,
//   type: 'group',
// };
