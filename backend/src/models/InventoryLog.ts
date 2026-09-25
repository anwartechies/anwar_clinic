import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export type InventoryAction =
  | "restock"
  | "used_procedure"
  | "broken"
  | "stolen"
  | "expired"
  | "adjustment"
  | "sold";

export interface InventoryLogAttributes {
  id: string;
  inventoryItemId: string;
  action: InventoryAction;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason?: string | null;
  performedById?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface InventoryLogCreationAttributes
  extends Optional<InventoryLogAttributes, "id" | "reason" | "performedById" | "createdAt" | "updatedAt"> {}

export class InventoryLog
  extends Model<InventoryLogAttributes, InventoryLogCreationAttributes>
  implements InventoryLogAttributes
{
  declare id: string;
  declare inventoryItemId: string;
  declare action: InventoryAction;
  declare quantity: number;
  declare previousStock: number;
  declare newStock: number;
  declare reason: string | null;
  declare performedById: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

InventoryLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    inventoryItemId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    action: {
      type: DataTypes.ENUM("restock", "used_procedure", "broken", "stolen", "expired", "adjustment", "sold"),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    previousStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    newStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    performedById: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "inventory_logs",
    timestamps: true,
  }
);
