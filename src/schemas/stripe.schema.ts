import { z } from 'zod';

export const stripeSchema = {
  // Si en el futuro quieres permitir reemplazo de datos vía body
  onboardingRequest: z.object({
    forceRefresh: z.boolean().optional(), // ejemplo de parámetro opcional
  }),

  // Para futuras verificaciones manuales
  verifyRequest: z.object({
    manualCheck: z.boolean().optional(),
  }),
};
