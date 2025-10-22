import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize';
import { Mention } from './Mention';
import { Music } from './Music';

export class EventMusic extends Model {
  public id!: string;
  public applicant!: string;
  public is_payed!: boolean;
  public is_played!: boolean;
  public tip!: number | null;
  public application_date!: Date;
  public application_number!: number;
  public music?: Music;
  public mention?: Mention;
  public type!: string;
  public eventId!: string;
  public event?: Event;
}

EventMusic.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    applicant: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'cliente',
    },
    is_paid: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_played: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    type: {
      type: DataTypes.ENUM('mention', 'song'),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tip: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    application_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    application_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    eventId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'EventMusic',
    tableName: 'EventMusics',
    timestamps: true,
  }
);
