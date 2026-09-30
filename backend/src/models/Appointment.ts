import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export interface AppointmentAttributes {
  id: string;
  appointmentNumber: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  timeSlot: string;
  type: "new_consultation" | "follow_up" | "procedure" | "review";
  channel: "website" | "walk_in" | "phone" | "whatsapp";
  status: "scheduled" | "checked_in" | "cancelled" | "completed" | "no_show";
  reason?: string | null;
  cancellationReason?: string | null;
  createdById?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AppointmentCreationAttributes
  extends Optional<
    AppointmentAttributes,
    "id" | "type" | "channel" | "status" | "reason" | "cancellationReason" | "createdById"
  > {}

export class Appointment
  extends Model<AppointmentAttributes, AppointmentCreationAttributes>
  implements AppointmentAttributes
{
  declare id: string;
  declare appointmentNumber: string;
  declare patientId: string;
  declare doctorId: string;
  declare appointmentDate: string;
  declare timeSlot: string;
  declare type: "new_consultation" | "follow_up" | "procedure" | "review";
  declare channel: "website" | "walk_in" | "phone" | "whatsapp";
  declare status: "scheduled" | "checked_in" | "cancelled" | "completed" | "no_show";
  declare reason: string | null;
  declare cancellationReason: string | null;
  declare createdById: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Appointment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    appointmentNumber: {
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
    appointmentDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    timeSlot: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("new_consultation", "follow_up", "procedure", "review"),
      allowNull: false,
      defaultValue: "new_consultation",
    },
    channel: {
      type: DataTypes.ENUM("website", "walk_in", "phone", "whatsapp"),
      allowNull: false,
      defaultValue: "walk_in",
    },
    status: {
      type: DataTypes.ENUM("scheduled", "checked_in", "cancelled", "completed", "no_show"),
      allowNull: false,
      defaultValue: "scheduled",
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cancellationReason: {
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
    tableName: "appointments",
    timestamps: true,
    indexes: [
      { fields: ["appointmentNumber"] },
      { fields: ["patientId"] },
      { fields: ["doctorId"] },
      { fields: ["appointmentDate"] },
      { fields: ["status"] },
    ],
  }
);
