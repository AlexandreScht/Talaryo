import { emailValidator, numberValidator, passwordValidator, roleValidator, stringValidator, timestampValidator } from '@/utils/zodValidate';
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
  code: numberValidator,
});

export const verify2FASchema = z.object({
  otp: numberValidator,
});

export const activate2FASchema = z.object({
  twoFactorType: z.enum(['email', 'authenticator']),
  otp: numberValidator,
});

//> UserSchema

export const updateSchema = z.object({
  society: z.string().optional(),
  role: roleValidator.optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export const getAllUsersSchema = z.object({
  limit: numberValidator.min(10).optional().default(10),
  page: numberValidator.min(1).optional().default(1),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: roleValidator.optional(),
});

export const updateUserSchema = z.object({
  name: z.union([
    z.object({
      email: emailValidator,
      oAuthAccount: z.boolean().optional(),
    }),
    z.object({
      id: z.number(),
    }),
  ]),
});

//> favFoldersSchema

export const getFavFoldersSchema = {
  params: z.object({
    name: stringValidator,
  }),
  query: z.object({
    limit: numberValidator.min(10).optional().default(10),
    page: numberValidator.min(1).optional().default(1),
  }),
};

//> favorisSchema

export const getFavorisSchema = {
  params: z.object({
    favFolderName: stringValidator,
  }),
  query: z.object({
    limit: numberValidator.min(10).optional().default(10),
    page: numberValidator.min(1).optional().default(1),
  }),
};

export const getLeastFavorisSchema = z.object({
  isCv: z.boolean().optional().default(false),
  limit: numberValidator.min(3).optional().default(3),
});

//> scores

export const improveScoreSchema = {
  body: z.object({
    column: z.enum(['mails', 'profils', 'searches', 'cv']),
    count: numberValidator.min(1),
  }),
};

export const getScoreSchema = {
  query: z.object({
    startDate: timestampValidator,
    endDate: timestampValidator,
  }),
};

export const getTotalScoreSchema = {
  params: z.object({
    keys: z.array(z.enum(['searches', 'mails', 'favorisSave', 'searchSave'])),
  }),
};
