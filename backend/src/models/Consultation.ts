import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export interface ConsultationAttributes {
  id: string;
  consultationNumber: string;
  patientId: string;
  doctorId: string;
  queueEntryId?: string | null;
  symptoms?: string | null;
  examinationFindings?: string | null;
  diagnosis: string;
  secondaryDiagnosis?: string | null;
  clinicalNotes?: string | null;
  proceduresRecommended?: string[] | null;
  investigationsAdvised?: string[] | null;
  followUpDate?: string | null;
  followUpInstructions?: string | null;
  status: "draft" | "finalized";
  consultationFee: number;
  startedAt?: Date;
  finalizedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ConsultationCreationAttributes
  extends Optional<
    ConsultationAttributes,
    | "id"
    | "queueEntryId"
    | "symptoms"
    | "examinationFindings"
    | "secondaryDiagnosis"
    | "clinicalNotes"
    | "proceduresRecommended"
    | "investigationsAdvised"
    | "followUpDate"
    | "followUpInstructions"
    | "status"
    | "consultationFee"
    | "startedAt"
    | "finalizedAt"
  > {}

export class Consultation
  extends Model<ConsultationAttributes, ConsultationCreationAttributes>
  implements ConsultationAttributes
{
  declare id: string;
  declare consultationNumber: string;
  declare patientId: string;
  declare doctorId: string;
  declare queueEntryId: string | null;
  declare symptoms: string | null;
  declare examinationFindings: string | null;
  declare diagnosis: string;
  declare secondaryDiagnosis: string | null;
  declare clinicalNotes: string | null;
  declare proceduresRecommended: string[] | null;
  declare investigationsAdvised: string[] | null;
  declare followUpDate: string | null;
  declare followUpInstructions: string | null;
  declare status: "draft" | "finalized";
  declare consultationFee: number;
  declare startedAt: Date;
  declare finalizedAt: Date | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Consultation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    consultationNumber: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: true,
    },
    patientId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    doctorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    queueEntryId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    symptoms: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    examinationFindings: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    diagnosis: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    secondaryDiagnosis: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    clinicalNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    proceduresRecommended: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
    investigationsAdvised: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
    followUpDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    followUpInstructions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("draft", "finalized"),
      allowNull: false,
      defaultValue: "draft",
    },
    consultationFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    startedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    finalizedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "consultations",
    timestamps: true,
    indexes: [
      { fields: ["consultationNumber"] },
      { fields: ["patientId"] },
      { fields: ["doctorId"] },
      { fields: ["queueEntryId"] },
      { fields: ["status"] },
    ],
  }
);
