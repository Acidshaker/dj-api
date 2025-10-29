import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize';

export class Music extends Model {
  public id!: string;
  public name!: string;
  public author!: string;
  public is_played!: boolean;
  public album_logo!: string;
  public duration!: string;
  public spotify_url!: string;
  public eventMusicId!: string | null;
}

Music.init(
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
    author: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_played: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    album_logo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    duration: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    spotify_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    eventMusicId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Music',
    tableName: 'Music',
    timestamps: true,
  }
);
