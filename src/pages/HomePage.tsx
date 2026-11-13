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
  const homeFaqs = [
    {
      question: 'How often should water tanks be cleaned in Dhaka?',
      answer: 'Due to municipal water sedimentation and heat, overhead and underground reserve water tanks in Dhaka should be deep cleaned every 4 to 6 months.'
    },
    {
      question: 'How long does water tank cleaning take?',
      answer: 'Standard 1,000 to 3,000-liter rooftop tanks take 2 to 3 hours. Large residential or commercial underground reserve tanks take approximately 3 to 5 hours.'
    },
    {
      question: 'How is the water tank cleaning price calculated?',
      answer: 'Pricing depends on tank type (overhead PVC/RCC or underground reserve), storage capacity in liters, accessibility, and sediment volume. Overhead tanks start from BDT 1,200.'
    },
    {
      question: 'What cleaning technology and disinfectants are used?',
      answer: 'We use modern high-pressure rotary jet washers, submersible sludge extraction pumps, and safe, food-grade non-toxic water tank sanitizers.'
    },
    {
      question: 'Can the water be used immediately after tank cleaning?',
      answer: 'Yes. After deep scrubbing and complete chemical-free freshwater rinsing, the tank is refilled with fresh supply water and ready for immediate domestic use.'
    },
    {
      question: 'Do you need to break walls or tiles for water pipeline cleaning?',
      answer: 'No. Our specialized hydro-pulse pressurized flushing machine connects directly to existing faucet connections, flushing all internal rust and sludge without any wall damage.'
    },
    {
      question: 'Will pipeline cleaning eliminate iron, rust, and foul tap odor?',
      answer: 'Yes. Heavy iron oxidation, mineral scales, rust, and bio-slime inside pipes are dislodged and thoroughly flushed out, restoring clear water flow.'
    },
    {
      question: 'Which areas in Dhaka and surrounding cities do you serve?',
      answer: 'We serve Dhaka (including Uttara, Gulshan, Banani, Mirpur, Dhanmondi, Bashundhara, Mohammadpur, Badda, Baridhara, Khilkhet) as well as Narayanganj, Gazipur, and Savar.'
    }
  ];

  return (
    <main className="min-h-screen bg-transparent text-white flex flex-col">
      {/* Semantic H1 for search engines and accessibility without altering hero visual design */}
      <h1 className="sr-only">
        Water Tank Cleaning Service in Dhaka, Narayanganj, Gazipur &amp; Savar — SUNVILOZ CLEAN CARE
      </h1>

      <SeoHead
        title="Water Tank Cleaning Service in Dhaka | পানির ট্যাংক পরিষ্কার সার্ভিস — SUNVILOZ CLEAN CARE"
        description="Professional water tank cleaning service in Dhaka, Narayanganj, Gazipur & Savar. Specialized overhead, underground reserve tank & water pipeline cleaning. Call 01609999612."
        canonicalUrl="https://sunvilozcleancare.com/"
        breadcrumbs={[{ name: 'Home', path: '/' }]}
        faqSchema={homeFaqs}
      />
      <HomepageDynamicRenderer
        onOpenQuoteModal={onOpenQuoteModal}
        onOpenBlogModal={onOpenBlogModal}
        onNavigate={onNavigate}
      />
    </main>
  );
};
