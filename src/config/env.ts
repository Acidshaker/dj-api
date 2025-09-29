import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();

const envSchema = z.object({
  PORT: z.preprocess((val) => Number(val), z.number().default(3000)),
  HOST: z.string().default("http://localhost:3000"),
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  JWT_SECRET: z.string(),

  DB_DIALECT: z
    .enum(["postgres", "mysql", "sqlite", "mariadb", "mssql"])
    .default("postgres"),
  DB_HOST: z.string(),
  DB_PORT: z.string().transform(Number),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),

  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_REGION: z.string(),
  AWS_BUCKET_NAME: z.string(),

  FIREBASE_API_KEY: z.string().optional(),
  FIREBASE_AUTH_DOM: z.string().optional(),
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_STORAGE_BUCKET: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
});

export const env = envSchema.parse(process.env);
