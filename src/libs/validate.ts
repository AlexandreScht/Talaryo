import { validatorsProps } from '@interfaces/request';
import * as yup from 'yup';

const stringRule = [
  /<script>|<\/script>|"|;|--|<\?php/i,
  /(--|\/\*|\*\/|";|';|INSERT INTO|SELECT|DELETE|UPDATE|DROP TABLE|DROP DATABASE|CREATE TABLE|CREATE DATABASE|ALTER TABLE|EXEC|EXECUTE)/i,
  /--/,
  /";/,
];

export const createValidator = (object: validatorsProps) => yup.object().shape(object);

export const stringValidator = yup.string().test('is-safe-string', 'Cette chaîne contient des caractères ou des motifs non autorisée.', value => {
  return stringRule.every(pattern => !pattern.test(value || ''));
});
export const keyValidator = yup.string();

export const emailValidator = yup.string().email();
export const roleValidator = yup.string().oneOf(['admin', 'business', 'pro', 'free']);

export const numberValidator = yup.number().integer();
export const limitValidator = yup.number().integer().min(1).max(50).defined();
export const pageValidator = yup.number().integer().min(1).defined();
export const booleanValidator = yup.boolean();
export const timestampValidator = yup.date().transform((value, originalValue) => {
  if (value.toISOString() === originalValue) {
    return new Date(originalValue);
  }
  return false;
});

//? favoris
export const linkValidator = yup.string().url();
export const imgValidator = yup
  .string()
  .matches(/^https:\/\/lh3\.googleusercontent\.com\//, 'Le champ "img" doit être une URL valide ou une URL base64 d\'une image valide');

export const idValidator = yup.number().min(1);

export const passwordValidator = yup
  .string()
  .min(8)
  .matches(
    /^(?=.*[\p{Ll}])(?=.*[\p{Lu}])(?=.*[0-9])(?=.*[^0-9\p{Lu}\p{Ll}]).*$/gu,
    'Password must contain at least 1 upper & 1 lower case letters, 1 digit, 1 spe. character',
  );

export const emailOrBooleanValidator = yup
  .mixed()
  .test(
    'email-or-boolean',
    'La valeur doit être un e-mail valide ou un booléen',
    value => typeof value === 'undefined' || typeof value === 'boolean' || (!!value && yup.string().email().isValidSync(value)),
  );

export const confirmPasswordValidator = yup.string().oneOf([yup.ref('password')], 'Passwords must be identical');

// users

const userSchema = yup.object().shape({
  firstName: stringValidator.required(),
  lastName: stringValidator.required(),
  email: emailValidator.required(),
  role: roleValidator,
});

export const usersValidator = yup.array().of(userSchema);

export const cancelOptionSubValidator = yup.object().shape({
  feedback: yup.string(),
  comment: yup.string(),
});
