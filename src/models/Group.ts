import { Association, DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize';
import { EventPackage } from './EventPackage';

export class Group extends Model {
  public id!: string;
  public name!: string;
  public is_active!: boolean;
  public userId!: string;
  public eventPackages?: EventPackage[];

  // Métodos de asociación
  public addEventPackages!: (packages: string[] | EventPackage[]) => Promise<void>;
  public setEventPackages!: (packages: string[] | EventPackage[]) => Promise<void>;
  public getEventPackages!: () => Promise<EventPackage[]>;

  public static associations: {
    eventPackages: Association<Group, EventPackage>;
  };
}

Group.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Group',
    tableName: 'Groups',
    timestamps: true,
  }
);
