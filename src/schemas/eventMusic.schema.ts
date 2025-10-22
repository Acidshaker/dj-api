import { z } from 'zod';

export const eventMusicSchema = {
  prepare: z.object({
    applicant: z.string().min(1, 'Nombre del solicitante requerido'),
    eventId: z.string().uuid('ID de evento inválido'),
    eventPackageId: z.string().uuid('ID de paquete inválido'),
    type: z.enum(['song', 'mention', 'both']),
    description: z.string().optional(),
  }),
  confirm: z.object({
    applicant: z.string().min(1),
    eventId: z.string().uuid(),
    eventPackageId: z.string().uuid(),
    type: z.enum(['song', 'mention', 'both']),
    description: z.string().optional(),
  }),
};
