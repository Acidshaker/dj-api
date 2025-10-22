import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize';

export class EmailVerificationToken extends Model {
  public token!: string;
  public userId!: string;
  public expiresAt!: Date;
  public is_used!: boolean;
}

EmailVerificationToken.init(
  {
    token: { type: DataTypes.STRING, allowNull: false },
    userId: { type: DataTypes.UUID, allowNull: false },
    expiresAt: { type: DataTypes.DATE, allowNull: false },
    is_used: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    sequelize,
    modelName: 'EmailVerificationToken',
    tableName: 'EmailVerificationTokens',
    timestamps: true,
  }
);
