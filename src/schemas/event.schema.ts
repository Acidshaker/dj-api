import { z } from 'zod';

const packageSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  max_songs_per_user: z.number().min(1),
  type: z.enum(['song', 'mention', 'both']),
  tip: z.number().min(0),
});

export const eventSchema = {
  create: z.object({
    date: z.string().datetime(),
    name: z.string().optional(),
    companyDataId: z.string().uuid().optional(),
    packages: z.array(packageSchema).min(1).max(4),
  }),
  update: z.object({
    date: z.string().datetime().optional(),
    name: z.string().optional(),
    companyDataId: z.string().uuid().optional(),
    packages: z.array(packageSchema).min(1).max(4).optional(),
  }),
};
