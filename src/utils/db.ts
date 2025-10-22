import sequelize from '../config/sequelize';

export const getModelCount = (): number => {
  return Object.keys(sequelize.models).length;
};