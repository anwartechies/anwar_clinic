import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export type InventoryCategory =
  | "surgical_instruments"
  | "anesthetics_meds"
  | "prp_meso"
  | "clinical_consumables"
  | "post_op_care"
  | "general";

export interface InventoryItemAttributes {
  id: string;
  sku: string;
  name: string;
  category: InventoryCategory;
  unit: string;
  stockQuantity: number;
  minStockLevel: number;
  broken: number;
  stolen: number;
  batchNumber?: string | null;
  expiryDate?: string | null;
  costPrice: number;
  sellingPrice?: number | null;
  storageLocation?: string | null;
  supplierName?: string | null;
  supplierContact?: string | null;
  isSterile: boolean;
  notes?: string | null;
  createdById?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface InventoryItemCreationAttributes
  extends Optional<
    InventoryItemAttributes,
    | "id"
    | "unit"
    | "stockQuantity"
    | "minStockLevel"
    | "broken"
    | "stolen"
    | "batchNumber"
    | "expiryDate"
    | "costPrice"
    | "sellingPrice"
    | "storageLocation"
    | "supplierName"
    | "supplierContact"
    | "isSterile"
    | "notes"
    | "createdById"
    | "createdAt"
    | "updatedAt"
  > {}

export class InventoryItem
  extends Model<InventoryItemAttributes, InventoryItemCreationAttributes>
  implements InventoryItemAttributes
{
  declare id: string;
  declare sku: string;
  declare name: string;
  declare category: InventoryCategory;
  declare unit: string;
  declare stockQuantity: number;
  declare minStockLevel: number;
  declare broken: number;
  declare stolen: number;
  declare batchNumber: string | null;
  declare expiryDate: string | null;
  declare costPrice: number;
  declare sellingPrice: number | null;
  declare storageLocation: string | null;
  declare supplierName: string | null;
  declare supplierContact: string | null;
  declare isSterile: boolean;
  declare notes: string | null;
  declare createdById: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

InventoryItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    sku: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM(
        "surgical_instruments",
        "anesthetics_meds",
        "prp_meso",
        "clinical_consumables",
        "post_op_care",
        "general"
      ),
      allowNull: false,
      defaultValue: "surgical_instruments",
    },
    unit: {
      type: DataTypes.STRING(32),
      allowNull: false,
      defaultValue: "pcs",
    },
    stockQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    minStockLevel: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
    },
    broken: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    stolen: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    batchNumber: {
      type: DataTypes.STRING(128),
      allowNull: true,
    },
    expiryDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    costPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
      get() {
        const val = this.getDataValue("costPrice");
        return val ? parseFloat(val as any) : 0;
      },
    },
    sellingPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      get() {
        const val = this.getDataValue("sellingPrice");
        return val !== null && val !== undefined ? parseFloat(val as any) : null;
      },
    },
    storageLocation: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    supplierName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    supplierContact: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    isSterile: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdById: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "inventory_items",
    timestamps: true,
  }
);
