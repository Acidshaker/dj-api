import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize';
import { User } from './User';
import { Group } from './Group';
import { EventMusic } from './EventMusic';

export class Event extends Model {
  public id!: string;
  public date!: Date;
  public folio!: string;
  public name!: string | null;
  public is_active!: boolean;
  public status!: string;
  public max_songs_per_user!: number;
  public userId!: string;
  public companyDataId!: string | null;
  public groupId!: string;
  public started_at!: Date | null;
  public finished_at!: Date | null;
  public qr_url!: string | null;
  public user?: User;
  public group?: Group;
  public eventMusics?: EventMusic[];
}

Event.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    folio: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'finished', 'not_started'),
      allowNull: false,
      defaultValue: 'active',
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    companyDataId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    groupId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    started_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    finished_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    qr_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Event',
    tableName: 'Events',
    timestamps: true,
  }
);
