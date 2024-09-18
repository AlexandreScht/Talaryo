import { FavorisShape } from '@/models/pg/favoris';
import { UserShape } from '@/models/pg/users';
import { z, ZodNullable, ZodObject, ZodOptional, ZodRawShape } from 'zod';

export const WebsiteEnum = z.enum([
  'FranceTravail',
  'HelloWork',
  'Indeed',
  'JobTeaser',
  'LesJeudis',
  'LinkedIn',
  'Monster',
  'TheJungler',
  'MeteoJob',
]);
const ContractEnum = z.enum(['CDI', 'alternance', 'freelance', 'stage', 'CDD', 'interim']);
const GraduationEnum = z.enum(['doctorat', 'master', 'licence', 'bac+', 'bac', 'cap/bep']);
const HomeWorkEnum = z.union([z.enum(['full', 'medium', 'low']), z.literal(false)]);

export const salarySchema = z.object({
  mensural: z.number().int().optional(),
  annual: z.number().int().optional(),
});

export const roleValidator = z.enum(['admin', 'business', 'pro', 'free']);

export const stringValidator = z.string({ message: 'Le type attendu est un string' });
export const numberValidator = z.number().int({ message: 'Le nombre doit être un entier.' });

export const timestampValidator = z.string().refine(
  val => {
    const date = new Date(val);
    return !isNaN(date.getTime()) && date.toISOString() === val;
  },
  {
    message: 'La date doit être une chaîne ISO valide.',
  },
);

export const emailValidator = stringValidator.email({ message: 'Adresse e-mail invalide' });

export const passwordValidator = z
  .string()
  .min(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).*$/u,
    'Le mot de passe doit contenir au moins 1 lettre majuscule, 1 lettre minuscule et 1 caractère spécial',
  );

export const localizationSchema = z.object({
  label: stringValidator,
  letterCode: z.enum(['C', 'D', 'R']),
  postal: z.number().int(),
  code: z.number().int(),
  lat: z.number().min(-90, { message: 'Latitude must be at least -90' }).max(90, { message: 'Latitude must be at most 90' }),
  lng: z.number().min(-180, { message: 'Longitude must be at least -180' }).max(180, { message: 'Longitude must be at most 180' }),
  parentZone: z
    .object({
      region: z.object({
        label: stringValidator,
        postal: z.number().int(),
      }),
      department: z
        .object({
          label: stringValidator,
          postal: z.number().int(),
        })
        .optional(),
    })
    .optional(),
});

export const searchSchema = z.object({
  jobName: z.string(),
  homeWork: z.array(HomeWorkEnum).optional(),
  rayon: z.number().int().optional(),
  salary: salarySchema.optional(),
  page: z.number().int().default(1),
  limit: z.number().int().default(10),
  experience: z.number().int().optional(),
  partTime: z.boolean().optional(),
  contract: z.array(ContractEnum).optional(),
  nightWork: z.boolean().optional(),
  graduations: z.array(GraduationEnum).optional(),
  loc: localizationSchema.optional(),
});

//> shape schema
const createShapeSchema = <T extends ZodRawShape>(baseSchema: ZodObject<T>, required: string[]): ZodObject<T> => {
  if (!required?.length) return baseSchema;
  const schema = Object.keys(baseSchema.shape).reduce((acc, key) => {
    const zodKey = key as keyof T;
    const field = baseSchema.shape[zodKey];

    if (required.includes(zodKey as string) && 'optional' in field) {
      if (field instanceof ZodOptional || field instanceof ZodNullable) {
        acc[zodKey] = field.unwrap();
      } else {
        acc[zodKey] = field;
      }
    } else {
      acc[zodKey] = field;
    }
    return acc;
  }, {} as T);

  return z.object(schema);
};

export const UserShapeSchema = (props?: { required?: (keyof UserShape)[] }) => {
  const schema = z.object({
    id: z.number().optional(),
    email: z.string().optional(),
    role: roleValidator.optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    password: z.string().optional(),
    validate: z.boolean().optional(),
    society: z.string().optional(),
    accessToken: z.string().optional(),
    twoFactorType: z.enum(['authenticator', 'email']).optional().nullable(),
    accessCode: z.union([z.string(), z.number()]).optional(),
    stripeCustomer: z.string().optional(),
    subscribe_status: z.enum(['active', 'pending', 'disable', 'waiting']).optional(),
    subscribe_start: z.date().optional(),
    subscribe_end: z.date().optional(),
    passwordReset: z.boolean().optional(),
  });

  // eslint-disable-next-line prettier/prettier
  return createShapeSchema<(typeof schema)['shape']>(schema, props?.required);
};

export const FavorisShapeSchema = (props?: { required?: (keyof FavorisShape)[] }) => {
  const schema = z.object({
    id: z.number().optional(),
    userId: z.number().optional(),
    link: z.string().optional(),
    pdf: z.string().optional(),
    resume: z.string().optional(),
    img: z.string().optional(),
    fullName: z.string().optional(),
    currentJob: z.string().optional(),
    email: z.string().optional(),
    currentCompany: z.string().optional(),
    disabled: z.boolean().optional(),
    favFolderId: z.number().optional(),
    isFavoris: z.boolean().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    locked: z.boolean().optional(),
    deleted: z.boolean().optional(),
    count: z.string().optional(),
  });
  // eslint-disable-next-line prettier/prettier
  return createShapeSchema<(typeof schema)['shape']>(schema, props?.required);
};
