import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export interface PatientAttributes {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string | null;
  gender: "male" | "female" | "other";
  dob?: string | null;
  age?: number | null;
  bloodGroup?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-" | null;
  allergies?: string[] | null;
  chronicConditions?: string[] | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  address?: string | null;
  city?: string | null;
  notes?: string | null;
  createdById?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PatientCreationAttributes
  extends Optional<
    PatientAttributes,
    | "id"
    | "email"
    | "dob"
    | "age"
    | "bloodGroup"
    | "allergies"
    | "chronicConditions"
    | "emergencyContactName"
    | "emergencyContactPhone"
    | "address"
    | "city"
    | "notes"
    | "createdById"
  > {}

export class Patient
  extends Model<PatientAttributes, PatientCreationAttributes>
  implements PatientAttributes
{
  declare id: string;
  declare mrn: string;
  declare firstName: string;
  declare lastName: string;
  declare phone: string;
  declare email: string | null;
  declare gender: "male" | "female" | "other";
  declare dob: string | null;
  declare age: number | null;
  declare bloodGroup: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-" | null;
  declare allergies: string[] | null;
  declare chronicConditions: string[] | null;
  declare emergencyContactName: string | null;
  declare emergencyContactPhone: string | null;
  declare address: string | null;
  declare city: string | null;
  declare notes: string | null;
  declare createdById: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Patient.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    mrn: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: true,
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    gender: {
      type: DataTypes.ENUM("male", "female", "other"),
      allowNull: false,
      defaultValue: "male",
    },
    dob: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    bloodGroup: {
      type: DataTypes.ENUM("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"),
      allowNull: true,
    },
    allergies: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
    chronicConditions: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
    emergencyContactName: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    emergencyContactPhone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
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
    tableName: "patients",
    timestamps: true,
    indexes: [
      { fields: ["mrn"] },
      { fields: ["phone"] },
      { fields: ["firstName", "lastName"] },
    ],
  }
);
