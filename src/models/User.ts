import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize';

export class User extends Model {
  public id!: string;
  public first_name!: string;
  public last_name!: string;
  public username!: string;
  public email!: string;
  public password!: string;
  public is_demo!: boolean;
  public is_verified!: boolean;
  public events_remaining!: number | null;
  public stripeAccountId!: string | null;
  public isStripeVerified!: boolean;
  public subscription_status!: 'active' | 'expired' | 'cancelled' | 'none';
  public subscription_end!: Date | null;
  public is_active!: boolean;
  public is_superuser!: boolean;
  public roleId!: number;
}

User.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    first_name: { type: DataTypes.STRING, allowNull: false },
    last_name: { type: DataTypes.STRING, allowNull: false },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    subscription_status: {
      type: DataTypes.ENUM('active', 'expired', 'cancelled', 'none'),
      defaultValue: 'none',
    },
    subscription_end: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    events_remaining: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    is_demo: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    is_superuser: { type: DataTypes.BOOLEAN, defaultValue: false },
    roleId: { type: DataTypes.INTEGER, allowNull: false },
    stripeAccountId: { type: DataTypes.STRING, allowNull: true },
    isStripeVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'Users',
    timestamps: true,
  }
);
