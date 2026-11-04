import React from 'react';
import { SeoHead } from '../components/SeoHead';
import { HomepageDynamicRenderer } from '../components/HomepageDynamicRenderer';
import { BlogPost } from '../types/blog';

interface HomePageProps {
  onOpenQuoteModal: (serviceName?: string) => void;
  onOpenBlogModal: (post: BlogPost) => void;
  onNavigate?: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onOpenQuoteModal,
  onOpenBlogModal,
  onNavigate
}) => {
  return (
    <main className="min-h-screen bg-transparent text-white flex flex-col">
      <SeoHead
        title="Sunviloz Clean Care - Professional Water Tank Cleaning Service Dhaka"
        description="High-pressure hygienic water tank and pipeline cleaning across all areas in Dhaka. Underground & rooftop overhead water tank wash with German technology."
        canonicalUrl="https://sunvilozcleancare.com/"
      />
      <HomepageDynamicRenderer
        onOpenQuoteModal={onOpenQuoteModal}
        onOpenBlogModal={onOpenBlogModal}
        onNavigate={onNavigate}
      />
    </main>
  );
};
