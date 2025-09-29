import { env } from "./env";

export const configs = {
  api: {
    port: env.PORT,
    host: env.HOST,
    nodeEnv: env.NODE_ENV,
    secretOrKey: env.JWT_SECRET,
    firebase: {
      apiKey: env.FIREBASE_API_KEY,
      authDomain: env.FIREBASE_AUTH_DOM,
      projectId: env.FIREBASE_PROJECT_ID,
      storageBucket: env.FIREBASE_STORAGE_BUCKET,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    aws: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      region: env.AWS_REGION,
      bucketName: env.AWS_BUCKET_NAME,
    },
  },
  db: {
    development: {
      dialect: env.DB_DIALECT,
      host: env.DB_HOST,
      port: env.DB_PORT,
      username: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
      define: {
        timestamps: true,
        underscored: false,
        underscoredAll: true,
      },
    },
    production: {
      dialect: env.DB_DIALECT,
      host: env.DB_HOST,
      port: env.DB_PORT,
      username: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
      define: {
        timestamps: true,
        underscored: false,
        underscoredAll: true,
      },
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    },
  },
};
