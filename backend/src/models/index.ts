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
import { Patient } from "./Patient";
import { Appointment } from "./Appointment";
import { QueueEntry } from "./QueueEntry";
import { PatientVitals } from "./PatientVitals";
import { Consultation } from "./Consultation";
import { Prescription } from "./Prescription";
import { PrescriptionItem } from "./PrescriptionItem";
import { Invoice } from "./Invoice";
import { InvoiceItem } from "./InvoiceItem";

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

// -----------------------------------------------------------------------------
// Clinical Models Associations
// -----------------------------------------------------------------------------

// Patient <-> User
Patient.belongsTo(User, { foreignKey: "createdById", as: "createdBy" });
User.hasMany(Patient, { foreignKey: "createdById", as: "registeredPatients" });

// Patient <-> Appointments
Patient.hasMany(Appointment, { foreignKey: "patientId", as: "appointments" });
Appointment.belongsTo(Patient, { foreignKey: "patientId", as: "patient" });
Appointment.belongsTo(User, { foreignKey: "doctorId", as: "doctor" });
Appointment.belongsTo(User, { foreignKey: "createdById", as: "createdBy" });

// Patient & Doctor <-> QueueEntry
Patient.hasMany(QueueEntry, { foreignKey: "patientId", as: "queueEntries" });
QueueEntry.belongsTo(Patient, { foreignKey: "patientId", as: "patient" });
QueueEntry.belongsTo(User, { foreignKey: "doctorId", as: "doctor" });
QueueEntry.belongsTo(Appointment, { foreignKey: "appointmentId", as: "appointment" });
QueueEntry.belongsTo(User, { foreignKey: "createdById", as: "createdBy" });

// Patient & Queue <-> PatientVitals
Patient.hasMany(PatientVitals, { foreignKey: "patientId", as: "vitals" });
PatientVitals.belongsTo(Patient, { foreignKey: "patientId", as: "patient" });
PatientVitals.belongsTo(QueueEntry, { foreignKey: "queueEntryId", as: "queueEntry" });
QueueEntry.hasOne(PatientVitals, { foreignKey: "queueEntryId", as: "vitals" });
PatientVitals.belongsTo(Appointment, { foreignKey: "appointmentId", as: "appointment" });
PatientVitals.belongsTo(User, { foreignKey: "recordedById", as: "recordedBy" });

// Patient, Doctor & Queue <-> Consultation
Patient.hasMany(Consultation, { foreignKey: "patientId", as: "consultations" });
Consultation.belongsTo(Patient, { foreignKey: "patientId", as: "patient" });
Consultation.belongsTo(User, { foreignKey: "doctorId", as: "doctor" });
Consultation.belongsTo(QueueEntry, { foreignKey: "queueEntryId", as: "queueEntry" });
QueueEntry.hasOne(Consultation, { foreignKey: "queueEntryId", as: "consultation" });

// Consultation <-> Prescription & Items
Consultation.hasOne(Prescription, { foreignKey: "consultationId", as: "prescription" });
Prescription.belongsTo(Consultation, { foreignKey: "consultationId", as: "consultation" });
Prescription.belongsTo(Patient, { foreignKey: "patientId", as: "patient" });
Prescription.belongsTo(User, { foreignKey: "doctorId", as: "doctor" });

Prescription.hasMany(PrescriptionItem, { foreignKey: "prescriptionId", as: "items", onDelete: "CASCADE" });
PrescriptionItem.belongsTo(Prescription, { foreignKey: "prescriptionId", as: "prescription" });
PrescriptionItem.belongsTo(InventoryItem, { foreignKey: "inventoryItemId", as: "inventoryItem" });

// Consultation & Patient <-> Invoice & Items
Consultation.hasOne(Invoice, { foreignKey: "consultationId", as: "invoice" });
Invoice.belongsTo(Consultation, { foreignKey: "consultationId", as: "consultation" });
Patient.hasMany(Invoice, { foreignKey: "patientId", as: "invoices" });
Invoice.belongsTo(Patient, { foreignKey: "patientId", as: "patient" });
Invoice.belongsTo(User, { foreignKey: "billedById", as: "billedBy" });

Invoice.hasMany(InvoiceItem, { foreignKey: "invoiceId", as: "items", onDelete: "CASCADE" });
InvoiceItem.belongsTo(Invoice, { foreignKey: "invoiceId", as: "invoice" });
InvoiceItem.belongsTo(InventoryItem, { foreignKey: "inventoryItemId", as: "inventoryItem" });

export async function syncDatabase() {
  try {
    await sequelize.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_type typ WHERE typ.typname = 'enum_inventory_logs_action'
        ) THEN
          IF NOT EXISTS (
            SELECT 1 FROM pg_type typ
            INNER JOIN pg_enum enm ON enm.enumtypid = typ.oid
            WHERE typ.typname = 'enum_inventory_logs_action' AND enm.enumlabel = 'sold'
          ) THEN
            ALTER TYPE "enum_inventory_logs_action" ADD VALUE 'sold';
          END IF;
        END IF;

        IF EXISTS (
          SELECT 1 FROM pg_type typ WHERE typ.typname = 'enum_queue_entries_status'
        ) THEN
          IF NOT EXISTS (
            SELECT 1 FROM pg_type typ
            INNER JOIN pg_enum enm ON enm.enumtypid = typ.oid
            WHERE typ.typname = 'enum_queue_entries_status' AND enm.enumlabel = 'pending_pharmacy'
          ) THEN
            ALTER TYPE "enum_queue_entries_status" ADD VALUE 'pending_pharmacy';
          END IF;
        END IF;
      EXCEPTION
        WHEN others THEN NULL;
      END $$;
    `);
  } catch (_e) {
    // Ignore if not postgres or if enum doesn't exist yet
  }
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
  Patient,
  Appointment,
  QueueEntry,
  PatientVitals,
  Consultation,
  Prescription,
  PrescriptionItem,
  Invoice,
  InvoiceItem,
};

