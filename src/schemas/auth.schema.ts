import { z } from "zod";

export const authSchema = {
  register: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
  login: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
};
