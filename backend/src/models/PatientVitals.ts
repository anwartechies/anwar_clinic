import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export interface PatientVitalsAttributes {
  id: string;
  patientId: string;
  queueEntryId?: string | null;
  appointmentId?: string | null;
  bpSystolic?: number | null;
  bpDiastolic?: number | null;
  pulseRate?: number | null;
  temperature?: number | null;
  spO2?: number | null;
  bloodSugar?: number | null;
  sugarTestType?: "fasting" | "random" | "post_prandial";
  weightKg?: number | null;
  heightCm?: number | null;
  bmi?: number | null;
  chiefComplaint?: string | null;
  triageNotes?: string | null;
  recordedById: string;
  recordedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PatientVitalsCreationAttributes
  extends Optional<
    PatientVitalsAttributes,
    | "id"
    | "queueEntryId"
    | "appointmentId"
    | "bpSystolic"
    | "bpDiastolic"
    | "pulseRate"
    | "temperature"
    | "spO2"
    | "bloodSugar"
    | "sugarTestType"
    | "weightKg"
    | "heightCm"
    | "bmi"
    | "chiefComplaint"
    | "triageNotes"
    | "recordedAt"
  > {}

export class PatientVitals
  extends Model<PatientVitalsAttributes, PatientVitalsCreationAttributes>
  implements PatientVitalsAttributes
{
  declare id: string;
  declare patientId: string;
  declare queueEntryId: string | null;
  declare appointmentId: string | null;
  declare bpSystolic: number | null;
  declare bpDiastolic: number | null;
  declare pulseRate: number | null;
  declare temperature: number | null;
  declare spO2: number | null;
  declare bloodSugar: number | null;
  declare sugarTestType: "fasting" | "random" | "post_prandial";
  declare weightKg: number | null;
  declare heightCm: number | null;
  declare bmi: number | null;
  declare chiefComplaint: string | null;
  declare triageNotes: string | null;
  declare recordedById: string;
  declare recordedAt: Date;
  declare createdAt: Date;
  declare updatedAt: Date;
}

PatientVitals.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    patientId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    queueEntryId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    appointmentId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    bpSystolic: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    bpDiastolic: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    pulseRate: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    temperature: {
      type: DataTypes.DECIMAL(4, 1),
      allowNull: true,
    },
    spO2: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    bloodSugar: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    sugarTestType: {
      type: DataTypes.ENUM("fasting", "random", "post_prandial"),
      defaultValue: "random",
    },
    weightKg: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    heightCm: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    bmi: {
      type: DataTypes.DECIMAL(4, 1),
      allowNull: true,
    },
    chiefComplaint: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    triageNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    recordedById: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    recordedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "patient_vitals",
    timestamps: true,
    indexes: [
      { fields: ["patientId"] },
      { fields: ["queueEntryId"] },
      { fields: ["recordedAt"] },
    ],
  }
);
