import { z } from 'zod';

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

export const stringValidator = z.string();
export const numberValidator = z.number();

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
