import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize';

export const GroupEventPackage = sequelize.define(
  'GroupEventPackage',
  {
    groupId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    eventPackageId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    tableName: 'GroupEventPackages',
    timestamps: true,
  }
);
