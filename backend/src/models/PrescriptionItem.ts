import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export interface PrescriptionItemAttributes {
  id: string;
  prescriptionId: string;
  medicineName: string;
  genericName?: string | null;
  dosageForm: "tablet" | "capsule" | "syrup" | "lotion" | "shampoo" | "injection" | "serum";
  strength?: string | null;
  frequency: string;
  durationValue: number;
  durationUnit: "days" | "weeks" | "months";
  timing: "before_food" | "after_food" | "with_food" | "at_bedtime" | "as_needed";
  instructions?: string | null;
  inventoryItemId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PrescriptionItemCreationAttributes
  extends Optional<
    PrescriptionItemAttributes,
    | "id"
    | "genericName"
    | "dosageForm"
    | "strength"
    | "durationUnit"
    | "timing"
    | "instructions"
    | "inventoryItemId"
  > {}

export class PrescriptionItem
  extends Model<PrescriptionItemAttributes, PrescriptionItemCreationAttributes>
  implements PrescriptionItemAttributes
{
  declare id: string;
  declare prescriptionId: string;
  declare medicineName: string;
  declare genericName: string | null;
  declare dosageForm: "tablet" | "capsule" | "syrup" | "lotion" | "shampoo" | "injection" | "serum";
  declare strength: string | null;
  declare frequency: string;
  declare durationValue: number;
  declare durationUnit: "days" | "weeks" | "months";
  declare timing: "before_food" | "after_food" | "with_food" | "at_bedtime" | "as_needed";
  declare instructions: string | null;
  declare inventoryItemId: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

PrescriptionItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    prescriptionId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    medicineName: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    genericName: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    dosageForm: {
      type: DataTypes.ENUM(
        "tablet",
        "capsule",
        "syrup",
        "lotion",
        "shampoo",
        "injection",
        "serum"
      ),
      allowNull: false,
      defaultValue: "tablet",
    },
    strength: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    frequency: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    durationValue: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    durationUnit: {
      type: DataTypes.ENUM("days", "weeks", "months"),
      allowNull: false,
      defaultValue: "days",
    },
    timing: {
      type: DataTypes.ENUM(
        "before_food",
        "after_food",
        "with_food",
        "at_bedtime",
        "as_needed"
      ),
      allowNull: false,
      defaultValue: "after_food",
    },
    instructions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    inventoryItemId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "prescription_items",
    timestamps: true,
    indexes: [
      { fields: ["prescriptionId"] },
      { fields: ["inventoryItemId"] },
    ],
  }
);
