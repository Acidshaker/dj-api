import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize';

export class CompanyData extends Model {
  public id!: string;
  public company_name!: string;
  public company_phone!: string;
  public company_email!: string;
  public is_active!: boolean;
  public logo!: string | null;
  public userId!: string;
}

CompanyData.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    company_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    company_phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    company_email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'CompanyData',
    tableName: 'CompanyData',
    timestamps: true,
  }
);
