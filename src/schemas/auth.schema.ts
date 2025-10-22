import { z } from 'zod';

export const authSchema = {
  register: z.object({
    email: z.string().email(),
    first_name: z.string(),
    last_name: z.string(),
    username: z.string(),
    roleId: z.number(),
    is_superuser: z.boolean().optional(), // ✅ puede omitirse
    password: z.string().min(6),
  }),

  login: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),

  requestPasswordReset: z.object({
    email: z.string().email(),
  }),

  resetPassword: z.object({
    token: z.string().min(10), // ✅ mínimo para evitar tokens vacíos
    newPassword: z.string().min(6),
  }),

  emailOnly: z.object({
    email: z.string().email(),
  }),
};
