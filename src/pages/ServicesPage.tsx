import React from 'react';
import { ArrowRight } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ServicesSection } from '../components/ServicesSection';
import { SolutionProcessSection } from '../components/SolutionProcessSection';
import { FinalCtaSection } from '../components/FinalCtaSection';
import { useLanguage } from '../context/LanguageContext';
import { useServices } from '../utils/servicesStore';

interface ServicesPageProps {
  onOpenQuoteModal: () => void;
  onNavigate?: (path: string) => void;
}

const CORE_HIGHLIGHT_SLUGS = new Set([
  'overhead-water-tank-cleaning',
  'overhead-tank-cleaning',
  'underground-water-tank-cleaning',
  'water-pipeline-cleaning',
  'pipeline-cleaning',
  'water-tank-cleaning'
]);

export const ServicesPage: React.FC<ServicesPageProps> = ({ onOpenQuoteModal, onNavigate }) => {
  const { lang } = useLanguage();
  const { services } = useServices();

  const activeServices = services.filter(s => s.is_active !== false);
  const additionalServices = activeServices.filter(s => !CORE_HIGHLIGHT_SLUGS.has(s.slug.toLowerCase()));

  const handleServiceLink = (path: string, e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (onNavigate) {
      e.preventDefault();
      onNavigate(path);
    }
  };

  return (
    <main className="min-h-screen bg-transparent text-[#172B3A] py-8 px-4 sm:px-6 max-w-7xl mx-auto space-y-12">
      <SeoHead
        canonicalPath="/services"
        canonicalUrl="https://sunvilozcleancare.com/services"
        breadcrumbs={[
          { name: lang === 'bn' ? 'হোম' : 'Home', path: '/' },
          { name: lang === 'bn' ? 'সার্ভিসসমূহ' : 'Services', path: '/services' }
        ]}
      />
      <Breadcrumbs items={[{ label: lang === 'bn' ? 'সার্ভিসসমূহ' : 'Services', href: '/services' }]} />

      <ServicesSection onOpenQuoteModal={onOpenQuoteModal} onNavigate={onNavigate} />

      {additionalServices.length > 0 && (
        <section className="space-y-6" aria-labelledby="more-services-heading">
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0D9488]">
              {lang === 'bn' ? 'অন্যান্য বিশেষায়িত সেবা' : 'Additional Specialized Services'}
            </span>
            <h2 id="more-services-heading" className="text-2xl sm:text-3xl font-extrabold text-[#123047]">
              {lang === 'bn' ? 'সম্পূর্ণ সার্ভিস ডিরেক্টরি' : 'More Water Hygiene Services'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalServices.map((srv) => {
              const title = lang === 'bn' && srv.titleBn ? srv.titleBn : srv.title;
              const desc = lang === 'bn' && srv.shortDescBn ? srv.shortDescBn : srv.shortDesc;
              const targetPath = `/services/${srv.slug}`;
              return (
                <a
                  key={srv.id}
                  href={targetPath}
                  onClick={(e) => handleServiceLink(targetPath, e)}
                  className="group bg-white rounded-2xl border border-[#E2E8F0] hover:border-[#0D9488]/40 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between no-underline text-inherit"
                >
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-[#123047] group-hover:text-[#0D9488] transition-colors">
                      {title}
                    </h3>
                    {desc && (
                      <p className="text-xs sm:text-sm text-[#64748B] line-clamp-3 leading-relaxed">
                        {desc}
                      </p>
                    )}
                  </div>
                  <div className="pt-4 mt-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs font-bold text-[#0D9488]">
                    <span>{lang === 'bn' ? 'বিস্তারিত দেখুন' : 'View Service Details'}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      )}

      <SolutionProcessSection onBookService={onOpenQuoteModal} />
      <FinalCtaSection onOpenQuoteModal={onOpenQuoteModal} />
    </main>
  );
};

export default ServicesPage;
