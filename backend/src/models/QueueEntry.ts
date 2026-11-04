import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export interface QueueEntryAttributes {
  id: string;
  tokenNumber: string;
  queueDate: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string | null;
  priority: "normal" | "follow_up" | "emergency" | "vip";
  status: "waiting" | "in_consultation" | "in_procedure" | "pending_billing" | "pending_pharmacy" | "completed" | "cancelled";
  queuedAt?: Date;
  calledAt?: Date | null;
  completedAt?: Date | null;
  createdById?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface QueueEntryCreationAttributes
  extends Optional<
    QueueEntryAttributes,
    "id" | "appointmentId" | "priority" | "status" | "queuedAt" | "calledAt" | "completedAt" | "createdById"
  > {}

export class QueueEntry
  extends Model<QueueEntryAttributes, QueueEntryCreationAttributes>
  implements QueueEntryAttributes
{
  declare id: string;
  declare tokenNumber: string;
  declare queueDate: string;
  declare patientId: string;
  declare doctorId: string;
  declare appointmentId: string | null;
  declare priority: "normal" | "follow_up" | "emergency" | "vip";
  declare status: "waiting" | "in_consultation" | "in_procedure" | "pending_billing" | "pending_pharmacy" | "completed" | "cancelled";
  declare queuedAt: Date;
  declare calledAt: Date | null;
  declare completedAt: Date | null;
  declare createdById: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

QueueEntry.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    tokenNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    queueDate: {
      type: DataTypes.DATEONLY,
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
    appointmentId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    priority: {
      type: DataTypes.ENUM("normal", "follow_up", "emergency", "vip"),
      allowNull: false,
      defaultValue: "normal",
    },
    status: {
      type: DataTypes.ENUM(
        "waiting",
        "in_consultation",
        "in_procedure",
        "pending_billing",
        "pending_pharmacy",
        "completed",
        "cancelled"
      ),
      allowNull: false,
      defaultValue: "waiting",
    },
    queuedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    calledAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdById: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "queue_entries",
    timestamps: true,
    indexes: [
      { fields: ["queueDate", "doctorId"] },
      { fields: ["patientId"] },
      { fields: ["status"] },
      { fields: ["tokenNumber"] },
    ],
  }
);
