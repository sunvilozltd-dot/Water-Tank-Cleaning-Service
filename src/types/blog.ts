export interface BlogPost {
  id: string;
  slug: string;
  category: string;
  categoryBn?: string;
  title: string;
  titleBn?: string;
  excerpt: string;
  excerptBn?: string;
  content: string;
  contentBn?: string;
  imageUrl?: string;
  author: string;
  publishedAt: string;
  readTime: string;
  readTimeBn?: string;
  featured?: boolean;
  published: boolean;
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    canonicalUrl?: string;
  };
}
