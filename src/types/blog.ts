export interface ArticleImage {
  id: string;
  url: string;
  storagePath?: string;
  alt: string;
  caption?: string;
  position?: 'inline' | 'below-subheading' | 'gallery';
  order: number;
}

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
  imageAlt?: string;
  imageCaption?: string;
  images?: ArticleImage[];
  author: string;
  publishedAt: string;
  updatedAt?: string;
  readTime: string;
  readTimeBn?: string;
  featured?: boolean;
  published: boolean;
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    canonicalUrl?: string;
    imageAlt?: string;
    imageCaption?: string;
    images?: ArticleImage[];
  };
}
