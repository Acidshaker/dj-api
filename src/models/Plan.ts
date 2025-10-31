import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize';

export class Plan extends Model {
  public id!: number;
  public name!: string; // Ej: 'Demo', 'Pro', 'Enterprise'
  public description!: string | null; // Opcional para mostrar en el panel
  public days!: number | null; // Duración en días
  public price!: number; // Precio si decides monetizar
  public events!: number | null; // Cantidad de eventos
  public is_demo!: boolean; // Marca si es un plan de prueba
  public is_active!: boolean;
  public stripePriceId!: string | null;
}

Plan.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    days: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    events: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    is_demo: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    stripePriceId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Plan',
    tableName: 'Plans',
    timestamps: true,
  }
);
