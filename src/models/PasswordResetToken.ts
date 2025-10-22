import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize';

export class PasswordResetToken extends Model {
  public token!: string;
  public userId!: string;
  public is_used!: boolean;
  public expiresAt!: Date;
}

PasswordResetToken.init(
  {
    token: { type: DataTypes.STRING, allowNull: false, unique: true },
    userId: { type: DataTypes.UUID, allowNull: false },
    is_used: { type: DataTypes.BOOLEAN, defaultValue: false },
    expiresAt: { type: DataTypes.DATE, allowNull: false },
  },
  {
    sequelize,
    modelName: 'PasswordResetToken',
    tableName: 'PasswordResetTokens',
    timestamps: true,
  }
);
