import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize';

export class Subscription extends Model {
  public id!: string;
  public userId!: string;
  public planId!: number; // ej: 'free', 'pro', 'enterprise'
  public status!: 'active' | 'inactive' | 'cancelled' | 'expired';
  public start_date!: Date;
  public end_date!: Date | null;
  public events_remaining!: number | null;
  public renewal_date!: Date | null;
  public stripeSubscriptionId!: string | null;
}

Subscription.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    planId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'cancelled', 'expired'),
      allowNull: false,
      defaultValue: 'inactive',
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    renewal_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    events_remaining: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    stripeSubscriptionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Subscription',
    tableName: 'Subscriptions',
    timestamps: true,
  }
);
