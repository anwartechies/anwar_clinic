import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export type ApplicationStatus =
  | "new"
  | "reviewing"
  | "shortlisted"
  | "interviewed"
  | "offered"
  | "rejected";

export interface JobApplicationAttributes {
  id: string;
  jobId: string;
  fullName: string;
  email: string;
  phone: string;
  experienceYears: string;
  currentCompany?: string | null;
  noticePeriod?: string | null;
  resumeUrl: string;
  resumeFileName: string;
  coverNote?: string | null;
  status: ApplicationStatus;
  adminNotes?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface JobApplicationCreationAttributes
  extends Optional<
    JobApplicationAttributes,
    | "id"
    | "currentCompany"
    | "noticePeriod"
    | "coverNote"
    | "status"
    | "adminNotes"
  > {}

export class JobApplication
  extends Model<JobApplicationAttributes, JobApplicationCreationAttributes>
  implements JobApplicationAttributes
{
  declare id: string;
  declare jobId: string;
  declare fullName: string;
  declare email: string;
  declare phone: string;
  declare experienceYears: string;
  declare currentCompany: string | null;
  declare noticePeriod: string | null;
  declare resumeUrl: string;
  declare resumeFileName: string;
  declare coverNote: string | null;
  declare status: ApplicationStatus;
  declare adminNotes: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

JobApplication.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    jobId: { type: DataTypes.UUID, allowNull: false },
    fullName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    experienceYears: { type: DataTypes.STRING, allowNull: false, defaultValue: "0" },
    currentCompany: { type: DataTypes.STRING, allowNull: true },
    noticePeriod: { type: DataTypes.STRING, allowNull: true },
    resumeUrl: { type: DataTypes.TEXT, allowNull: false },
    resumeFileName: { type: DataTypes.STRING, allowNull: false },
    coverNote: { type: DataTypes.TEXT, allowNull: true },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "new" },
    adminNotes: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    sequelize,
    tableName: "job_applications",
    timestamps: true,
  }
);
