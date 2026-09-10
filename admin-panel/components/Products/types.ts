export type FieldType = "text" | "textarea" | "image" | "stringList" | "objectList";

export interface ItemField {
  name: string;
  label: string;
  type: "text" | "textarea" | "image" | "stringList";
}

export interface SchemaField {
  name: string;
  label: string;
  type: FieldType;
  help?: string;
  placeholder?: string;
  itemFields?: ItemField[];
}

export interface SectionSchema {
  key: string;
  label: string;
  component: string;
  description: string;
  fields: SchemaField[];
}

export type SectionData = Record<string, Record<string, unknown>>;

export interface ProductSummary {
  id: string;
  slug: string;
  name: string;
  category: string;
  concern: string;
  price: number;
  originalPrice: number | null;
  isSale: boolean;
  badge: string | null;
  rating: number;
  reviewsCount: number;
  image: string;
  description: string;
  inStock: boolean;
  stockQuantity: number;
  isKit: boolean;
  status: "draft" | "published";
  sortOrder: number;
  seoTitle: string | null;
  seoDescription: string | null;
  hiddenSections: string[];
}

export interface ProductDetail extends ProductSummary {
  sections: SectionData;
}
