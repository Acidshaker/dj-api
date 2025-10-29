import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize';

export class EventPackage extends Model {
  public id!: string;
  public name!: string;
  public max_songs_per_user!: number;
  public type!: string;
  public tip!: number;
  public is_optional_tip!: boolean;
  public is_active!: boolean;
  public userId!: string;
}

EventPackage.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    max_songs_per_user: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('song', 'mention', 'both'),
      allowNull: false,
    },
    tip: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    is_optional_tip: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'EventPackage',
    tableName: 'EventPackages',
    timestamps: true,
  }
);
