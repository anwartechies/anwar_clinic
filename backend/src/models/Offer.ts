import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export type OfferStatus = "draft" | "active" | "completed";

export interface OfferTimelineEvent {
  id: string;
  status: OfferStatus;
  timestamp: string;
  userId?: string | null;
  userName?: string | null;
  note?: string;
}

export interface OfferAttributes {
  id: string;
  badge: string;
  title: string;
  highlightText?: string | null;
  perks: string[];
  couponCode?: string | null;
  ctaText: string;
  link?: string | null;
  status: OfferStatus;
  activatedAt?: Date | null;
  completedAt?: Date | null;
  timeline: OfferTimelineEvent[];
  createdById?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OfferCreationAttributes
  extends Optional<
    OfferAttributes,
    | "id"
    | "badge"
    | "highlightText"
    | "perks"
    | "couponCode"
    | "ctaText"
    | "link"
    | "status"
    | "activatedAt"
    | "completedAt"
    | "timeline"
    | "createdById"
  > {}

export class Offer
  extends Model<OfferAttributes, OfferCreationAttributes>
  implements OfferAttributes
{
  declare id: string;
  declare badge: string;
  declare title: string;
  declare highlightText: string | null;
  declare perks: string[];
  declare couponCode: string | null;
  declare ctaText: string;
  declare link: string | null;
  declare status: OfferStatus;
  declare activatedAt: Date | null;
  declare completedAt: Date | null;
  declare timeline: OfferTimelineEvent[];
  declare createdById: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Offer.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    badge: { type: DataTypes.STRING, allowNull: false, defaultValue: "Special Offer" },
    title: { type: DataTypes.STRING, allowNull: false },
    highlightText: { type: DataTypes.STRING, allowNull: true },
    perks: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    couponCode: { type: DataTypes.STRING, allowNull: true },
    ctaText: { type: DataTypes.STRING, allowNull: false, defaultValue: "Claim Consultation" },
    link: { type: DataTypes.STRING, allowNull: true, defaultValue: "/offer" },
    status: {
      type: DataTypes.ENUM("draft", "active", "completed"),
      allowNull: false,
      defaultValue: "draft",
    },
    activatedAt: { type: DataTypes.DATE, allowNull: true },
    completedAt: { type: DataTypes.DATE, allowNull: true },
    timeline: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    createdById: { type: DataTypes.UUID, allowNull: true },
  },
  {
    sequelize,
    tableName: "offers",
    timestamps: true,
  }
);
