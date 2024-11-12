// import merge from 'deepmerge';
import * as yup from 'yup';
import {
  IdArrayValidator,
  StringOrArrayStringValidator,
  booleanValidator,
  cancelOptionSubValidator,
  confirmPasswordValidator,
  emailValidator,
  idValidator,
  imgValidator,
  keyValidator,
  limitValidator,
  linkValidator,
  numberValidator,
  pageValidator,
  passwordValidator,
  platformValidator,
  roleValidator,
  stringOf,
  stringOrBooleanValidator,
  stringValidator,
  timestampValidator,
  yearValidator,
} from './validates';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createValidator = (object: any) => yup.object().shape(object);

//? register schema

export const registerSchemaValidator = createValidator({
  email: emailValidator.required('Ce champ est requis'),
  password: passwordValidator.required('Ce champ est requis'),
  firstName: stringValidator.required('Ce champ est requis'),
  lastName: stringValidator.required('Ce champ est requis'),
  confirm: confirmPasswordValidator.required('Ce champ est requis'),
});

export const fullRegisterSchemaValidator = createValidator({
  email: emailValidator.required('Ce champ est requis'),
  password: stringValidator.required('Ce champ est requis'),
  firstName: stringValidator.required('Ce champ est requis'),
  lastName: stringValidator.required('Ce champ est requis'),
  confirm: confirmPasswordValidator.required('Ce champ est requis'),
  token: keyValidator.required('Ce champ est requis'),
});

//? login schema
export const loginSchemaValidator = createValidator({
  email: emailValidator.required('Ce champ est requis'),
  password: stringValidator.required('Ce champ est requis'),
});

export const fullLoginSchemaValidator = createValidator({
  email: emailValidator.required('Ce champ est requis'),
  password: stringValidator.required('Ce champ est requis'),
  token: keyValidator.required('Ce champ est requis'),
});

//? 2FA schema
export const validAccountSchemaValidator = createValidator({
  code: numberValidator.min(1000, 'Le nombre doit être au moins 1000').max(9999, 'Le nombre doit être au plus 9999'),
});

export const activate2FASchema = createValidator({
  twoFactorType: yup.mixed().oneOf(['email', 'authenticator'], 'Type de double authentification invalide'),
  otp: numberValidator,
});

//? password reset schema
export const AskResetPasswordSchemaValidator = createValidator({
  email: emailValidator.required('Ce champ est requis'),
});

export const NewPasswordSchemaValidator = createValidator({
  password: passwordValidator.required('Ce champ est requis'),
  confirm: confirmPasswordValidator.required('Ce champ est requis'),
});

// ? user account schema

export const getAllUsersSchemaValidator = createValidator({
  limit: limitValidator.default(10),
  page: pageValidator.default(1),
  firstName: stringValidator,
  lastName: stringValidator,
  email: stringValidator,
  role: roleValidator,
});

export const UserUpdateSchemaValidator = createValidator({
  firstName: stringValidator,
  lastName: stringValidator,
  society: stringValidator,
  role: roleValidator,
});

export const DistantUserUpdateSchemaValidator = createValidator({
  user: {
    email: stringValidator,
    validate: booleanValidator,
    firstName: stringValidator,
    lastName: stringValidator,
    society: stringValidator,
    subscribe_status: stringOf(['active', 'pending', 'disable', 'waiting']),
    twoFactorType: stringOf(['authenticator', 'email']).nullable(),
    role: roleValidator,
  },
  selector: yup.lazy(value => {
    if (value && typeof value === 'object') {
      if ('id' in value) {
        return yup.object({
          id: idValidator.required(),
        });
      } else if ('email' in value) {
        return yup.object({
          email: emailValidator.required(),
        });
      }
    }
    return yup.mixed().notRequired();
  }),
});

//? scrapping schema

export const scrappingSearchSchemaValidator = createValidator({
  platform: platformValidator,
  fn: StringOrArrayStringValidator,
  industry: StringOrArrayStringValidator,
  sector: StringOrArrayStringValidator,
  skill: StringOrArrayStringValidator,
  key: StringOrArrayStringValidator,
  loc: StringOrArrayStringValidator,
  Nindustry: StringOrArrayStringValidator,
  Nskill: StringOrArrayStringValidator,
  Nkey: StringOrArrayStringValidator,
  time: booleanValidator,
  zone: StringOrArrayStringValidator,
  start: numberValidator,
  index: numberValidator,
});

export const scrappingCVSchemaValidator = createValidator({
  fn: StringOrArrayStringValidator,
  formation: StringOrArrayStringValidator,
  date: yearValidator.default(new Date().getFullYear() - 1),
  matching: numberValidator.min(20).max(80).default(50).required(),
  industry: StringOrArrayStringValidator,
  sector: StringOrArrayStringValidator,
  skill: StringOrArrayStringValidator,
  key: StringOrArrayStringValidator,
  loc: StringOrArrayStringValidator,
  Nindustry: StringOrArrayStringValidator,
  Nskill: StringOrArrayStringValidator,
  Nkey: StringOrArrayStringValidator,
  time: booleanValidator,
  zone: StringOrArrayStringValidator,
  start: numberValidator,
  index: numberValidator,
});

export const cvContentValidator = createValidator({
  link: linkValidator.required('Ce champ est requis'),
});

export const scrappingEmailSchemaValidator = createValidator({
  firstName: stringValidator.required('Ce champ est requis'),
  lastName: stringValidator.required('Ce champ est requis'),
  industry: stringValidator.required('Ce champ est requis'),
  link: stringValidator,
});

// ? favoris
export const getFavorisSchemaValidator = createValidator({
  limit: limitValidator.default(10),
  page: pageValidator.default(1),
  favFolderName: stringValidator,
  isCv: booleanValidator.default(false),
});

export const removeFavorisSchemaValidator = createValidator({
  id: idValidator.required('Ce champ est requis'),
});

export const createFavorisSchemaValidator = createValidator({
  link: linkValidator.nullable(),
  pdf: linkValidator.nullable(),
  img: imgValidator.required('Ce champ est requis'),
  email: stringOrBooleanValidator,
  fullName: stringValidator.required('Ce champ est requis'),
  currentJob: stringValidator.nullable(),
  currentCompany: stringValidator.nullable(),
  resume: keyValidator.required('Ce champ est requis'),
  favFolderId: idValidator.required('Ce champ est requis'),
});

export const updateFavorisSchemaValidator = createValidator({
  link: linkValidator,
  img: imgValidator,
  email: stringOrBooleanValidator,
  fullName: stringValidator,
  currentJob: stringValidator,
  currentCompany: stringValidator,
  resume: keyValidator,
  favFolderId: idValidator,
  id: idValidator.required('Ce champ est requis'),
});

// ? searches

export const SearchSchemaValidator = createValidator({
  name: stringValidator.required('Ce champ est requis'),
  society: stringValidator,
});

export const createSearchFolderService = createValidator({
  search: keyValidator.required('Ce champ est requis'),
  searchFolderId: idValidator.required('Ce champ est requis'),
  name: stringValidator.required('Ce champ est requis'),
  society: stringValidator,
  pageType: stringOf(['cv', 'pro']).required('Ce champ est requis'),
});

export const removeSearchSchemaValidator = createValidator({
  id: IdArrayValidator.required('Ce champ est requis'),
});

export const getSearchSchemaValidator = createValidator({
  limit: limitValidator.default(10),
  page: pageValidator.default(1),
  name: stringValidator,
  searchFolderId: idValidator,
  isCv: booleanValidator,
});

export const getTotalSearchSchemaValidator = createValidator({
  isCv: booleanValidator,
});

// ? Folders
export const createFolderSchemaValidator = createValidator({
  name: stringValidator.required('Ce champ est requis'),
});
export const removeFolderSchemaValidator = createValidator({
  id: IdArrayValidator.required('Ce champ est requis'),
});
export const getFolderSchemaValidator = createValidator({
  limit: limitValidator.default(10),
  page: pageValidator.default(1),
  name: stringValidator,
});

// ? localisation API
export const localisationValidator = createValidator({
  search: stringValidator.required('Ce champ est requis'),
  zone: stringOf(['Région(s)', 'Commune(s)', 'Département(s)']).required('Ce champ est requis'),
});

//? score
export const addingScoreValidator = createValidator({
  column: stringOf(['mails', 'profils', 'searches', 'cv']).required('Le champ column est requis'),
  count: numberValidator.default(1),
});
export const getScoreValidator = createValidator({
  startDate: timestampValidator,
  endDate: timestampValidator,
});

//? subscription
export const cancelSubscribeValidator = createValidator({
  subId: stringValidator.required('Ce champ est requis'),
  option: cancelOptionSubValidator,
});

export const updateSubscribeValidator = createValidator({
  price_id: stringValidator.required('Ce champ est requis'),
  itemSub: stringValidator.required('Ce champ est requis'),
  subId: stringValidator.required('Ce champ est requis'),
});

export const createSubscribeValidator = createValidator({
  price_id: stringValidator.required('Ce champ est requis'),
});

//? contactUs
export const contactUsValidator = createValidator({
  firstName: stringValidator.required('Ce champ est requis'),
  lastName: stringValidator.required('Ce champ est requis'),
  email: stringValidator.required('Ce champ est requis'),
  message: stringValidator.required('Ce champ est requis'),
});
