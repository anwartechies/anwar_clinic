import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export interface PrescriptionAttributes {
  id: string;
  prescriptionNumber: string;
  consultationId: string;
  patientId: string;
  doctorId: string;
  generalAdvice?: string | null;
  status: "active" | "dispensed" | "cancelled";
  signedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PrescriptionCreationAttributes
  extends Optional<PrescriptionAttributes, "id" | "generalAdvice" | "status" | "signedAt"> {}

export class Prescription
  extends Model<PrescriptionAttributes, PrescriptionCreationAttributes>
  implements PrescriptionAttributes
{
  declare id: string;
  declare prescriptionNumber: string;
  declare consultationId: string;
  declare patientId: string;
  declare doctorId: string;
  declare generalAdvice: string | null;
  declare status: "active" | "dispensed" | "cancelled";
  declare signedAt: Date;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Prescription.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    prescriptionNumber: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: true,
    },
    consultationId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    patientId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    doctorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    generalAdvice: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("active", "dispensed", "cancelled"),
      allowNull: false,
      defaultValue: "active",
    },
    signedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "prescriptions",
    timestamps: true,
    indexes: [
      { fields: ["prescriptionNumber"] },
      { fields: ["consultationId"] },
      { fields: ["patientId"] },
      { fields: ["doctorId"] },
      { fields: ["status"] },
    ],
  }
);
