import sequelize from '../config/sequelize';
import { getAppVersion } from '../utils/version';
import { getModelCount } from '../utils/db';

export const getSystemStatus = async () => {
  let dbStatus = '❌ Desconectada';
  try {
    await sequelize.authenticate();
    dbStatus = '✅ Conectada';
  } catch {
    dbStatus = '❌ Error de conexión';
  }

  const uptime = `${Math.floor(process.uptime() / 60)} min`;
  const version = getAppVersion();
  const models = getModelCount();

  return { dbStatus, uptime, version, models };
};
