import sequelize from "../config/sequelize";
import { getAppVersion } from "../utlis/version";
import { getModelCount } from "../utlis/db";

export const getSystemStatus = async () => {
  let dbStatus = "❌ Desconectada";
  try {
    await sequelize.authenticate();
    dbStatus = "✅ Conectada";
  } catch {
    dbStatus = "❌ Error de conexión";
  }

  const uptime = `${Math.floor(process.uptime() / 60)} min`;
  const version = getAppVersion();
  const models = getModelCount();

  return { dbStatus, uptime, version, models };
};
