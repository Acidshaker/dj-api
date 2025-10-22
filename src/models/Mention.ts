import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize';

export class Mention extends Model {
  public id!: string;
  public text!: string;
  public eventMusicId!: string;
}

Mention.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    eventMusicId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Mention',
    tableName: 'Mentions',
    timestamps: true,
  }
);
