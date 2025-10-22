import { z } from 'zod';

export const userSchema = {
  updateName: z.object({
    first_name: z.string().min(1, 'Nombre requerido'),
    last_name: z.string().min(1, 'Apellido requerido'),
  }),
};
