import { DataTypes, Model } from "sequelize";
import sequelize from "../config/sequelize";

export class User extends Model {
  public id!: number;
  public email!: string;
  public password!: string;
}

User.init(
  {
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
  },
  { sequelize, modelName: "User" }
);
