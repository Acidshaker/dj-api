import { z } from 'zod';

export const musicTemplatesSchema = {
  createList: z.object({
    name: z.string().min(1, 'Nombre requerido'),
  }),

  createPackage: z.object({
    name: z.string().min(1),
    max_songs_per_user: z.number().min(1),
    type: z.enum(['song', 'mention', 'both']),
    tip: z.number().min(0),
    listEventMusicId: z.string().uuid(),
  }),
};
