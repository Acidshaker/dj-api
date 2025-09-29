import { Sequelize, type Dialect } from "sequelize";
import { configs } from "./index";

const env = configs.api.nodeEnv;
const dbConfig = configs.db[env];
const dialect = dbConfig.dialect as Dialect;

const sequelize = new Sequelize({
  dialect,
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.database,
  define: dbConfig.define,
  logging: false,
  ...(env === "production" && {
    dialectOptions: configs.db.production.dialectOptions,
  }),
});

export default sequelize;