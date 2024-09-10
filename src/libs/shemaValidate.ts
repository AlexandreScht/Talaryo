import { emailValidator, passwordValidator, searchSchema, stringValidator, WebsiteEnum } from '@/utils/zodValidate';
import { z } from 'zod';

//> authSchema
export const loginSchema = z.object({
  email: emailValidator,
  password: stringValidator,
  token: stringValidator,
});

export const registerSchema = z
  .object({
    password: passwordValidator,
    email: emailValidator,
    token: stringValidator,
    confirm: stringValidator,
    firstName: stringValidator,
    lastName: stringValidator,
  })
  .superRefine((data, ctx) => {
    if (data.confirm !== data.password) {
      ctx.addIssue({
        path: ['confirm'],
        message: 'Les mots de passe doivent être identiques',
        code: z.ZodIssueCode.custom,
      });
    }
  });

export const askCodeSchema = z.object({
  code: z.number().int({ message: 'Le nombre doit être un entier.' }),
});

export const verify2FASchema = z.object({
  otp: z.number().int({ message: 'Le nombre doit être un entier.' }),
});

export const emailsSchema = z.object({
  firstName: stringValidator.optional(),
  lastName: stringValidator.optional(),
});

export const activate2FASchema = z.object({
  twoFactorType: z.enum(['email', 'authenticator']),
  otp: z.number().int({ message: 'Le nombre doit être un entier.' }),
});

//> searchSchema
export const searchJobsSchema = z.object({
  websites: WebsiteEnum.array(),
  search: searchSchema,
});
