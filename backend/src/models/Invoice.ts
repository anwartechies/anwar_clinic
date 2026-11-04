import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export interface InvoiceAttributes {
  id: string;
  invoiceNumber: string;
  patientId: string;
  consultationId?: string | null;
  subtotal: number;
  discountAmount: number;
  discountReason?: string | null;
  taxAmount: number;
  netTotal: number;
  paidAmount: number;
  balanceDue: number;
  paymentStatus: "paid" | "partial" | "pending" | "refunded";
  paymentMethod: "cash" | "card" | "upi" | "net_banking" | "split";
  paymentNotes?: string | null;
  billedById: string;
  billedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface InvoiceCreationAttributes
  extends Optional<
    InvoiceAttributes,
    | "id"
    | "consultationId"
    | "subtotal"
    | "discountAmount"
    | "discountReason"
    | "taxAmount"
    | "netTotal"
    | "paidAmount"
    | "balanceDue"
    | "paymentStatus"
    | "paymentMethod"
    | "paymentNotes"
    | "billedAt"
  > {}

export class Invoice
  extends Model<InvoiceAttributes, InvoiceCreationAttributes>
  implements InvoiceAttributes
{
  declare id: string;
  declare invoiceNumber: string;
  declare patientId: string;
  declare consultationId: string | null;
  declare subtotal: number;
  declare discountAmount: number;
  declare discountReason: string | null;
  declare taxAmount: number;
  declare netTotal: number;
  declare paidAmount: number;
  declare balanceDue: number;
  declare paymentStatus: "paid" | "partial" | "pending" | "refunded";
  declare paymentMethod: "cash" | "card" | "upi" | "net_banking" | "split";
  declare paymentNotes: string | null;
  declare billedById: string;
  declare billedAt: Date;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Invoice.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    invoiceNumber: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: true,
    },
    patientId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    consultationId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    discountReason: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    taxAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    netTotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    paidAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    balanceDue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    paymentStatus: {
      type: DataTypes.ENUM("paid", "partial", "pending", "refunded"),
      allowNull: false,
      defaultValue: "pending",
    },
    paymentMethod: {
      type: DataTypes.ENUM("cash", "card", "upi", "net_banking", "split"),
      allowNull: false,
      defaultValue: "cash",
    },
    paymentNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    billedById: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    billedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "invoices",
    timestamps: true,
    indexes: [
      { fields: ["invoiceNumber"] },
      { fields: ["patientId"] },
      { fields: ["consultationId"] },
      { fields: ["paymentStatus"] },
      { fields: ["billedAt"] },
    ],
  }
);
