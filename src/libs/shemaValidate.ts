import { emailValidator, numberValidator, passwordValidator, roleValidator, stringValidator, timestampValidator } from '@/utils/zodValidate';
import { z } from 'zod';

//> common

export const getSchema = {
  query: z.object({
    isCv: z.boolean().optional().default(false),
    limit: numberValidator.min(1).optional().default(10),
    page: numberValidator.min(1).optional().default(1),
  }),
};

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
  email: z.string().optional(),
  lastName: z.string().optional(),
  role: roleValidator.optional(),
});

export const updateUserSchema = z.object({
  user: z.string(),
});

//> FoldersSchema

export const getFoldersSchema = {
  params: z.object({
    name: stringValidator,
  }),
  query: z.object({
    limit: numberValidator.min(10).optional().default(10),
    page: numberValidator.min(1).optional().default(1),
  }),
};

//> favorisSchema

export const getFolderFavSchema = {
  params: z.object({
    favFolderName: stringValidator,
  }),
  query: z.object({
    limit: numberValidator.min(10).optional().default(10),
    page: numberValidator.min(1).optional().default(1),
  }),
};

//> searchesSchema

export const getSearchesSchema = {
  params: z.object({
    searchFolderName: stringValidator,
  }),
  query: z.object({
    limit: numberValidator.min(10).optional().default(10),
    page: numberValidator.min(1).optional().default(1),
  }),
};

//> scores

export const improveScoreSchema = {
  body: z.object({
    column: z.array(z.enum(['mails', 'profils', 'searches', 'cv'])),
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

//> scrapping

export const scrapingCandidateSchemaSchema = {
  query: z.object({
    platform: z.enum([
      'LinkedIn',
      'Viadeo',
      'Xing',
      'Batiactu',
      'Dribble',
      'Behance',
      'Culinary agents',
      'Symfony',
      'HEC',
      'Polytechnique',
      'Ferrandi',
      'UTC',
      'Centrale Supélec',
      'Centrale Lille',
      'Essec',
      'Neoma',
    ]),
    fn: z.array(stringValidator).optional(),
    industry: z.array(stringValidator).optional(),
    sector: z.array(stringValidator).optional(),
    time: z.boolean().optional().default(true),
    key: z.array(stringValidator).optional(),
    skill: z.array(stringValidator).optional(),
    Nindustry: z.array(stringValidator).optional(),
    Nskill: z.array(stringValidator).optional(),
    Nkey: z.array(stringValidator).optional(),
    zone: z.boolean().optional().default(false),
    loc: z.array(stringValidator).optional(),
    start: numberValidator.default(0),
    index: numberValidator.default(50),
  }),
};

export const scrapingCvSchemaSchema = {
  query: z.object({
    fn: z.array(stringValidator).optional(),
    date: timestampValidator.default(() => new Date().toISOString()),
    matching: numberValidator.min(20).max(80).default(50),
    industry: z.array(stringValidator).optional(),
    formation: z.array(stringValidator).optional(),
    sector: z.array(stringValidator).optional(),
    skill: z.array(stringValidator).optional(),
    key: z.array(stringValidator).optional(),
    loc: z.array(stringValidator).optional(),
    Nindustry: z.array(stringValidator).optional(),
    Nskill: z.array(stringValidator).optional(),
    Nkey: z.array(stringValidator).optional(),
    time: z.boolean().optional().default(true),
    zone: z.boolean().optional().default(false),
    start: numberValidator.default(0),
    index: numberValidator.default(50),
  }),
};

export const scrapingPersonalDataSchema = {
  query: z.object({
    firstName: stringValidator,
    lastName: stringValidator,
    company: stringValidator,
    link: stringValidator.optional(),
  }),
};

//> subscribe

export const cancelSubscription = {
  body: z.object({
    subId: stringValidator,
    option: z
      .object({
        feedback: stringValidator,
        comment: stringValidator,
      })
      .optional(),
  }),
};

export const updateSubscription = {
  body: z.object({
    price_id: stringValidator,
    itemSub: stringValidator,
    subId: stringValidator,
  }),
};
