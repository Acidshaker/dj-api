import { z } from 'zod';

export const userSchema = {
  updateName: z.object({
    firstName: z.string().min(1, 'Nombre requerido'),
    lastName: z.string().min(1, 'Apellido requerido'),
  }),
};
