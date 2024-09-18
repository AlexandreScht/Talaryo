// Generated by ts-to-zod
import { z } from 'zod';

export const userSchemaSchema = z.object({
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
