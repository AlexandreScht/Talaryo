import { validatorsProps } from '@interfaces/request';
import * as yup from 'yup';

export const createValidator = (object: validatorsProps) => yup.object().shape(object);

export const stringValidator = yup.string();
export const emailValidator = yup.string().email();
export const roleValidator = yup.string().oneOf(['admin', 'business', 'advanced', 'pro', 'free', undefined]);

export const numberValidator = yup.number().integer();
export const limitValidator = yup.number().integer().min(1).max(50).defined();
export const pageValidator = yup.number().integer().min(1).defined();

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
  .matches(/^data:image\/(jpeg|jpg|png);base64,/, 'Le champ "img" doit être une URL base64 d\'une image valide');

export const idValidator = yup.number().min(1);

export const passwordValidator = yup
  .string()
  .min(8)
  .matches(
    /^(?=.*[\p{Ll}])(?=.*[\p{Lu}])(?=.*[0-9])(?=.*[^0-9\p{Lu}\p{Ll}]).*$/gu,
    'Password must contain at least 1 upper & 1 lower case letters, 1 digit, 1 spe. character',
  );

export const confirmPasswordValidator = yup.string().oneOf([yup.ref('password')], 'Passwords must be identical');
