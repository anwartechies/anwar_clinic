import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import { Role } from "./Role";
import { Permission } from "./Permission";
import { User } from "./User";
import { MediaAsset } from "./MediaAsset";
import { Service } from "./Service";
import { Lead } from "./Lead";
import { Blog } from "./Blog";
import { Product } from "./Product";
import { Job } from "./Job";
import { JobApplication } from "./JobApplication";
import { Offer } from "./Offer";
import { Deployment } from "./Deployment";
import { InventoryItem } from "./InventoryItem";
import { InventoryLog } from "./InventoryLog";

// Role <-> Permission join table. A role's grants live entirely in here, which
// is what lets permissions be re-assigned at runtime from Settings > Roles
// without any code change or redeploy.
export const RolePermission = sequelize.define(
  "RolePermission",
  {
    roleId: { type: DataTypes.UUID, allowNull: false },
    permissionId: { type: DataTypes.UUID, allowNull: false },
  },
  { tableName: "role_permissions", timestamps: false }
);

Role.belongsToMany(Permission, { through: RolePermission, foreignKey: "roleId" });
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: "permissionId" });

// User <-> Role
User.belongsTo(Role, { foreignKey: "roleId", as: "role" });
Role.hasMany(User, { foreignKey: "roleId" });

// Media — uploader is nullable so an asset survives its uploader being removed.
MediaAsset.belongsTo(User, { foreignKey: "uploadedById", as: "uploadedBy" });
User.hasMany(MediaAsset, { foreignKey: "uploadedById", as: "uploads" });

// Leads — the owner is nullable and detaches on delete so a lead is never
// lost with the staff member who was following it up.
Lead.belongsTo(User, { foreignKey: "assignedToId", as: "assignedTo" });
User.hasMany(Lead, { foreignKey: "assignedToId", as: "assignedLeads" });

// Blogs — author / creator
Blog.belongsTo(User, { foreignKey: "createdById", as: "createdBy" });
User.hasMany(Blog, { foreignKey: "createdById", as: "blogs" });

// Products — creator
Product.belongsTo(User, { foreignKey: "createdById", as: "createdBy" });
User.hasMany(Product, { foreignKey: "createdById", as: "products" });

// Jobs & Applications
Job.belongsTo(User, { foreignKey: "createdById", as: "createdBy" });
User.hasMany(Job, { foreignKey: "createdById", as: "jobs" });

Job.hasMany(JobApplication, { foreignKey: "jobId", as: "applications", onDelete: "CASCADE" });
JobApplication.belongsTo(Job, { foreignKey: "jobId", as: "job" });

// Offers
Offer.belongsTo(User, { foreignKey: "createdById", as: "createdBy" });
User.hasMany(Offer, { foreignKey: "createdById", as: "offers" });

// Inventory
InventoryItem.belongsTo(User, { foreignKey: "createdById", as: "createdBy" });
User.hasMany(InventoryItem, { foreignKey: "createdById", as: "inventoryItems" });

InventoryItem.hasMany(InventoryLog, { foreignKey: "inventoryItemId", as: "logs", onDelete: "CASCADE" });
InventoryLog.belongsTo(InventoryItem, { foreignKey: "inventoryItemId", as: "item" });

InventoryLog.belongsTo(User, { foreignKey: "performedById", as: "performedBy" });
User.hasMany(InventoryLog, { foreignKey: "performedById", as: "inventoryLogs" });

export async function syncDatabase() {
  await sequelize.sync({ alter: true });
}

export {
  sequelize,
  Role,
  Permission,
  User,
  MediaAsset,
  Service,
  Lead,
  Blog,
  Product,
  Job,
  JobApplication,
  Offer,
  Deployment,
  InventoryItem,
  InventoryLog,
};

