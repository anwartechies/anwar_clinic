import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export interface InvoiceItemAttributes {
  id: string;
  invoiceId: string;
  itemType: "consultation" | "procedure" | "medicine" | "lab_test" | "other";
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  inventoryItemId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface InvoiceItemCreationAttributes
  extends Optional<InvoiceItemAttributes, "id" | "quantity" | "inventoryItemId"> {}

export class InvoiceItem
  extends Model<InvoiceItemAttributes, InvoiceItemCreationAttributes>
  implements InvoiceItemAttributes
{
  declare id: string;
  declare invoiceId: string;
  declare itemType: "consultation" | "procedure" | "medicine" | "lab_test" | "other";
  declare description: string;
  declare quantity: number;
  declare unitPrice: number;
  declare totalPrice: number;
  declare inventoryItemId: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

InvoiceItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    invoiceId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    itemType: {
      type: DataTypes.ENUM("consultation", "procedure", "medicine", "lab_test", "other"),
      allowNull: false,
      defaultValue: "consultation",
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    inventoryItemId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "invoice_items",
    timestamps: true,
    indexes: [
      { fields: ["invoiceId"] },
      { fields: ["inventoryItemId"] },
    ],
  }
);
