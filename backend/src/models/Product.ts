import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export type ProductStatus = "draft" | "published";

/** Per-section content overrides, keyed by section keys (hero, whatsInside, keyBenefits, howToUse, faqs, reviews). */
export type ProductSections = Record<string, Record<string, unknown>>;

export interface ProductAttributes {
  id: string;
  slug: string;
  name: string;
  category: string;
  concern: string;
  price: number;
  originalPrice?: number | null;
  isSale: boolean;
  badge?: string | null;
  rating: number;
  reviewsCount: number;
  image: string;
  description: string;
  inStock: boolean;
  stockQuantity: number;
  isKit: boolean;
  status: ProductStatus;
  sortOrder: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  sections: ProductSections;
  hiddenSections: string[];
  createdById?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductCreationAttributes
  extends Optional<
    ProductAttributes,
    | "id"
    | "originalPrice"
    | "isSale"
    | "badge"
    | "rating"
    | "reviewsCount"
    | "inStock"
    | "stockQuantity"
    | "isKit"
    | "status"
    | "sortOrder"
    | "seoTitle"
    | "seoDescription"
    | "sections"
    | "hiddenSections"
    | "createdById"
  > {}

export class Product
  extends Model<ProductAttributes, ProductCreationAttributes>
  implements ProductAttributes
{
  declare id: string;
  declare slug: string;
  declare name: string;
  declare category: string;
  declare concern: string;
  declare price: number;
  declare originalPrice: number | null;
  declare isSale: boolean;
  declare badge: string | null;
  declare rating: number;
  declare reviewsCount: number;
  declare image: string;
  declare description: string;
  declare inStock: boolean;
  declare stockQuantity: number;
  declare isKit: boolean;
  declare status: ProductStatus;
  declare sortOrder: number;
  declare seoTitle: string | null;
  declare seoDescription: string | null;
  declare sections: ProductSections;
  declare hiddenSections: string[];
  declare createdById: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Product.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "Kits & Combos",
    },
    concern: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "Daily Maintenance",
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      get() {
        const val = this.getDataValue("price");
        return val !== null && val !== undefined ? Number(val) : 0;
      },
    },
    originalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      get() {
        const val = this.getDataValue("originalPrice");
        return val !== null && val !== undefined ? Number(val) : null;
      },
    },
    isSale: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    badge: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 4.8,
      get() {
        const val = this.getDataValue("rating");
        return val !== null && val !== undefined ? Number(val) : 4.8;
      },
    },
    reviewsCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "",
    },
    inStock: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    stockQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 100,
    },
    isKit: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM("draft", "published"),
      allowNull: false,
      defaultValue: "draft",
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    seoTitle: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    seoDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    sections: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    hiddenSections: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    createdById: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "products",
    timestamps: true,
    indexes: [
      { fields: ["slug"], unique: true },
      { fields: ["category"] },
      { fields: ["concern"] },
      { fields: ["status"] },
      { fields: ["price"] },
    ],
  }
);
