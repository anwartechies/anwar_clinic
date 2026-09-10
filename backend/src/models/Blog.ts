import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export type BlogStatus = "draft" | "published";

export type BlogBlock =
  | { id: string; type: "paragraph"; html: string }
  | { id: string; type: "image"; url: string; alt?: string; credit?: string }
  | { id: string; type: "video"; url: string; caption?: string }
  | { id: string; type: "youtube"; url: string; caption?: string };

export interface BlogFaq {
  question: string;
  answer: string;
}

interface BlogAttributes {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  contentBlocks: BlogBlock[];
  faqs: BlogFaq[];
  category: string;
  tags: string[];
  authorName: string;
  authorRole: string;
  authorAvatar?: string | null;
  coverImage?: string | null;
  readTime: string;
  publishedAt: Date;
  status: BlogStatus;
  featured: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  views: number;
  sortOrder: number;
  createdById?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface BlogCreationAttributes
  extends Optional<
    BlogAttributes,
    | "id"
    | "contentBlocks"
    | "faqs"
    | "category"
    | "tags"
    | "authorName"
    | "authorRole"
    | "authorAvatar"
    | "coverImage"
    | "readTime"
    | "publishedAt"
    | "status"
    | "featured"
    | "metaTitle"
    | "metaDescription"
    | "views"
    | "sortOrder"
    | "createdById"
  > {}

export class Blog
  extends Model<BlogAttributes, BlogCreationAttributes>
  implements BlogAttributes
{
  declare id: string;
  declare slug: string;
  declare title: string;
  declare excerpt: string;
  declare content: string;
  declare contentBlocks: BlogBlock[];
  declare faqs: BlogFaq[];
  declare category: string;
  declare tags: string[];
  declare authorName: string;
  declare authorRole: string;
  declare authorAvatar: string | null;
  declare coverImage: string | null;
  declare readTime: string;
  declare publishedAt: Date;
  declare status: BlogStatus;
  declare featured: boolean;
  declare metaTitle: string | null;
  declare metaDescription: string | null;
  declare views: number;
  declare sortOrder: number;
  declare createdById: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Blog.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    title: { type: DataTypes.STRING, allowNull: false },
    excerpt: { type: DataTypes.TEXT, allowNull: false, defaultValue: "" },
    content: { type: DataTypes.TEXT, allowNull: false, defaultValue: "" },
    contentBlocks: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
    faqs: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
    category: { type: DataTypes.STRING, allowNull: false, defaultValue: "Hair Transplant" },
    tags: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
    authorName: { type: DataTypes.STRING, allowNull: false, defaultValue: "Dr. Anwar" },
    authorRole: { type: DataTypes.STRING, allowNull: false, defaultValue: "Lead Surgeon & Hair Specialist" },
    authorAvatar: { type: DataTypes.TEXT, allowNull: true },
    coverImage: { type: DataTypes.TEXT, allowNull: true },
    readTime: { type: DataTypes.STRING, allowNull: false, defaultValue: "5 min read" },
    publishedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    status: {
      type: DataTypes.ENUM("draft", "published"),
      allowNull: false,
      defaultValue: "draft",
    },
    featured: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    metaTitle: { type: DataTypes.STRING, allowNull: true },
    metaDescription: { type: DataTypes.TEXT, allowNull: true },
    views: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    createdById: { type: DataTypes.UUID, allowNull: true },
  },
  { sequelize, tableName: "blogs", timestamps: true }
);
