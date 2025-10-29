import { z } from 'zod';

export const companyDataSchema = {
  create: z.object({
    company_name: z.string().min(1),
    company_phone: z.string().min(1),
    company_email: z.string().email(),
    logo: z.string().optional(),
  }),

  update: z.object({
    company_name: z.string().min(1).optional(),
    company_phone: z.string().min(1).optional(),
    company_email: z.string().email().optional(),
    replace_logo: z.boolean().optional(),
  }),
};
