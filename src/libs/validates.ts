import * as menuList from '@/config/SelectMenuItems';
import { roles } from '@/config/data';
import {
  SelectDownItems,
  SelectDownItemsContent,
} from '@/interfaces/components';
import * as yup from 'yup';

export type Schema = yup.ObjectSchema<
  {
    [x: string]: unknown;
  },
  yup.AnyObject,
  {
    [x: string]: unknown;
  },
  ''
>;

type CustomObjectType = {
  [key: string]: SelectDownItems;
};

const stringRule = [
  /<script>|<\/script>|"|;|--|<\?php/i,
  /(--|\/\*|\*\/|";|';|INSERT INTO|SELECT|DELETE|UPDATE|DROP TABLE|DROP DATABASE|CREATE TABLE|CREATE DATABASE|ALTER TABLE|EXEC|EXECUTE)/i,
  /--/,
  /";/,
];

const extractNames = (list: CustomObjectType) =>
  Object.values(list).reduce((acc, val: SelectDownItems) => {
    if (val.itemsList) {
      val.itemsList.forEach((item: SelectDownItemsContent) => {
        if (item.name) {
          acc.push(item.name);
        }
      });
    }
    return acc;
  }, [] as string[]);

const extractRoles = roles.map((v) => v.value);

export const stringValidator = yup
  .string()
  .test(
    'is-safe-string',
    'Cette chaîne contient des caractères ou des motifs non autorisée.',
    (value) => {
      return stringRule.every((pattern) => !pattern.test(value || ''));
    },
  );

export const keyValidator = yup.string();

export const limitValidator = yup.number().integer().min(1).max(50).defined();
export const pageValidator = yup.number().integer().min(1).defined();
export const linkValidator = yup.string().url();
export const imgValidator = yup
  .string()
  .matches(
    /^https:\/\/lh3\.googleusercontent\.com\//,
    'Le champ "img" doit être une URL valide ou une URL base64 d\'une image valide',
  );

export const idValidator = yup.number().integer().min(1);

export const stringOf = (v: string[]) => yup.string().oneOf(v);

export const roleValidator = yup.string().oneOf(extractRoles);

export const platformValidator = yup.lazy((value) => {
  const commonValidation = yup
    .string()
    .oneOf(extractNames(menuList), 'This value is not authorized');

  return Array.isArray(value)
    ? yup.array().of(commonValidation)
    : commonValidation;
});

export const booleanValidator = yup
  .mixed()
  .test('is-boolean', 'The value must be a boolean', function (value) {
    return (
      typeof value === 'undefined' ||
      typeof value === 'boolean' ||
      (typeof value === 'string' && (value === 'true' || value === 'false'))
    );
  });

export const stringOrBooleanValidator = yup
  .mixed()
  .test(
    'email-or-boolean',
    'La valeur doit être un string ou un booléen',
    (value) =>
      typeof value === 'undefined' ||
      typeof value === 'boolean' ||
      (!!value && yup.string().isValidSync(value)),
  );

export const timestampValidator = yup
  .date()
  .transform((value, originalValue) => {
    if (value.toISOString() === originalValue) {
      return new Date(originalValue);
    }
    return false;
  });

export const IdArrayValidator = yup.array().of(idValidator);

export const StringOrArrayStringValidator = yup.lazy((value) =>
  Array.isArray(value) ? yup.array().of(yup.string()) : stringValidator,
);

export const numberValidator = yup
  .number()
  .integer('Le nombre doit être un entier.');

export const yearValidator = yup
  .number()
  .typeError('La valeur doit être un nombre')
  .integer('La valeur doit être un entier')
  .min(1980, "L'année doit être supérieure ou égale à 1980")
  .max(new Date().getFullYear());

export const passwordValidator = yup
  .string()
  .test(
    'password-validation',
    'Le mot de passe doit inclure : une majuscule, une minuscule, un chiffre, un caractère spécial, au moins 8 caractères',
    function (value: string | undefined) {
      if (!value) {
        return;
      }
      const hasUppercase = /[A-Z]/.test(value);
      const hasLowercase = /[a-z]/.test(value);
      const hasDigit = /[0-9]/.test(value);
      const hasSpecial = /[^0-9A-Za-z]/.test(value);
      const hasMinimumLength = value && value.length >= 8;

      const errors = [];

      if (!hasUppercase) {
        errors.push('une majuscule');
      }
      if (!hasLowercase) {
        errors.push('une minuscule');
      }
      if (!hasDigit) {
        errors.push('un chiffre');
      }
      if (!hasSpecial) {
        errors.push('un caractère spécial');
      }
      if (!hasMinimumLength) {
        errors.push('au moins 8 caractères');
      }

      if (errors.length > 0) {
        return this.createError({
          message: `Le mot de passe doit inclure : ${errors.join(', ')}`,
        });
      }

      return true;
    },
  );

export const confirmPasswordValidator = yup
  .string()
  .oneOf([yup.ref('password')], 'Les mots de passe doivent être identiques');

export const emailValidator = yup.string().email();

export const cancelOptionSubValidator = yup.object().shape({
  feedback: yup.string(),
  comment: yup.string(),
});
