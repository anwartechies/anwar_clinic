import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export type JobStatus = "published" | "draft" | "closed";
export type EmploymentType = "Full-time" | "Part-time" | "Consultant" | "Contract";

export interface JobAttributes {
  id: string;
  title: string;
  slug: string;
  department: string;
  location: string;
  employmentType: EmploymentType;
  experience: string;
  salaryRange?: string | null;
  openings: number;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  status: JobStatus;
  sortOrder: number;
  createdById?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface JobCreationAttributes
  extends Optional<
    JobAttributes,
    | "id"
    | "salaryRange"
    | "openings"
    | "responsibilities"
    | "requirements"
    | "benefits"
    | "status"
    | "sortOrder"
    | "createdById"
  > {}

export class Job
  extends Model<JobAttributes, JobCreationAttributes>
  implements JobAttributes
{
  declare id: string;
  declare title: string;
  declare slug: string;
  declare department: string;
  declare location: string;
  declare employmentType: EmploymentType;
  declare experience: string;
  declare salaryRange: string | null;
  declare openings: number;
  declare description: string;
  declare responsibilities: string[];
  declare requirements: string[];
  declare benefits: string[];
  declare status: JobStatus;
  declare sortOrder: number;
  declare createdById: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Job.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    department: { type: DataTypes.STRING, allowNull: false, defaultValue: "Medical / Surgical" },
    location: { type: DataTypes.STRING, allowNull: false, defaultValue: "Patna Clinic (Razabazar)" },
    employmentType: { type: DataTypes.STRING, allowNull: false, defaultValue: "Full-time" },
    experience: { type: DataTypes.STRING, allowNull: false, defaultValue: "1-3 Years" },
    salaryRange: { type: DataTypes.STRING, allowNull: true },
    openings: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    description: { type: DataTypes.TEXT, allowNull: false },
    responsibilities: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    requirements: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    benefits: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "published" },
    sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    createdById: { type: DataTypes.UUID, allowNull: true },
  },
  {
    sequelize,
    tableName: "jobs",
    timestamps: true,
  }
);
