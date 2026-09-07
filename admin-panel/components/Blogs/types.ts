export type BlogStatus = "draft" | "published";

export interface BlogFaq {
  question: string;
  answer: string;
}

export interface BlogItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  authorName: string;
  authorRole: string;
  authorAvatar?: string | null;
  coverImage?: string | null;
  readTime: string;
  publishedAt: string;
  status: BlogStatus;
  featured: boolean;
  views?: number;
  sortOrder?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BlogDetail extends BlogItem {
  content: string;
  contentBlocks?: any[];
  faqs: BlogFaq[];
  metaTitle?: string | null;
  metaDescription?: string | null;
}

export interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  authorName: string;
  authorRole: string;
  authorAvatar?: string | null;
  coverImage?: string | null;
  readTime: string;
  publishedAt: string;
  status: BlogStatus;
  featured: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  faqs: BlogFaq[];
}
