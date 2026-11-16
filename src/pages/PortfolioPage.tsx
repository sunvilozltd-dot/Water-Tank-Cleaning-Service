import React, { useState } from 'react';
import { SeoHead } from '../components/SeoHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { OurWorkVideosSection } from '../components/OurWorkVideosSection';
import { useLanguage } from '../context/LanguageContext';
import { usePortfolioProjects, isPublicPublishedCaseStudy } from '../utils/portfolioStore';
import { useSiteConfig } from '../context/SiteConfigContext';
import { MapPin, Calendar, ArrowRight, Phone, MessageCircle, Layers } from 'lucide-react';
import {
  resolveAuthoritativeHotline,
  resolveAuthoritativeHotlineDisplay
} from '../seo/seoResolver';

interface PortfolioPageProps {
  onNavigate?: (path: string) => void;
  onOpenQuoteModal?: (serviceName?: string) => void;
}

export const PortfolioPage: React.FC<PortfolioPageProps> = ({ onNavigate, onOpenQuoteModal }) => {
  const { lang } = useLanguage();
  const { business } = useSiteConfig();
  const { projects } = usePortfolioProjects();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const publishedProjects = projects.filter(isPublicPublishedCaseStudy);
  const categories = Array.from(new Set(publishedProjects.map(p => p.category).filter(Boolean))) as string[];
  const filtered =
    selectedCategory === 'ALL'
      ? publishedProjects
      : publishedProjects.filter(p => p.category === selectedCategory);

  const displayPhone = resolveAuthoritativeHotlineDisplay(business?.displayPhone, business?.phone);
  const telHref = `tel:${resolveAuthoritativeHotline(business?.phone)}`;
  const waDigits = (business?.whatsappNumber || '8801609999612').replace(/[^0-9]/g, '');
  const waText =
    lang === 'bn'
      ? 'আসসালামু আলাইকুম, পানির ট্যাংক/পাইপলাইন পরিষ্কারের কোটেশন নিতে চাই।'
      : 'Hello, I would like a quote for water tank/pipeline cleaning.';
  const whatsappHref = `https://wa.me/${waDigits}?text=${encodeURIComponent(waText)}`;

  const handleLinkClick = (e: React.MouseEvent, targetPath: string) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(targetPath);
    }
  };

  return (
    <main className="min-h-screen bg-[#F5FAFC] text-[#172B3A] pb-14">
      <SeoHead
        canonicalPath="/portfolio"
        canonicalUrl="https://sunvilozcleancare.com/portfolio"
        breadcrumbs={[
          { name: lang === 'bn' ? 'হোম' : 'Home', path: '/' },
          { name: lang === 'bn' ? 'কাজের কেস স্টাডি ও পোর্টফোলিও' : 'Portfolio & Case Studies', path: '/portfolio' }
        ]}
      />

      <section className="bg-[#123047] text-white py-10 sm:py-14 border-b border-[#0D9488]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
          <Breadcrumbs
            items={[{ label: lang === 'bn' ? 'কাজের কেস স্টাডি ও পোর্টফোলিও' : 'Portfolio & Case Studies', href: '/portfolio' }]}
            onNavigate={onNavigate}
          />
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold">
            {lang === 'bn'
              ? 'সম্পন্ন পানির ট্যাংক ও পাইপলাইন পরিষ্কার কাজের কেস স্টাডি (Portfolio)'
              : 'Completed Water Tank & Pipeline Cleaning Case Studies'}
          </h1>
          <p className="text-sm sm:text-base text-slate-200 max-w-3xl">
            {lang === 'bn'
              ? 'ঢাকা, গাজীপুর, সাভার ও নারায়ণগঞ্জে গ্রাহকের সম্মতিক্রমে প্রকাশিত আমাদের বাস্তব কাজের আগে ও পরের নমুনা, সমস্যা ও ফলাফল দেখুন।'
              : 'Real before-and-after cleaning cases published with customer consent across Dhaka, Gazipur, Savar, and Narayanganj.'}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-12">
        {/* Case Studies Section */}
        <section className="space-y-6">
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategory('ALL')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  selectedCategory === 'ALL'
                    ? 'bg-[#0D9488] text-white'
                    : 'bg-white border border-[#E2E8F0] text-[#475569] hover:border-[#0D9488]'
                }`}
              >
                {lang === 'bn' ? `সকল কাজ (${publishedProjects.length})` : `All (${publishedProjects.length})`}
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#0D9488] text-white'
                      : 'bg-white border border-[#E2E8F0] text-[#475569] hover:border-[#0D9488]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 sm:p-10 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E8F5F3] text-[#0D9488] flex items-center justify-center mx-auto">
                <Layers className="w-6 h-6" />
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#123047]">
                {lang === 'bn'
                  ? 'ভেরিফায়েড ও সম্মতিপ্রাপ্ত কেস স্টাডি শীঘ্রই প্রকাশ করা হবে'
                  : 'Verified Case Studies Coming Soon'}
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] max-w-xl mx-auto leading-relaxed">
                {lang === 'bn'
                  ? 'আমরা কেবল গ্রাহকের লিখিত/মৌখিক অনুমতি সাপেক্ষে বাস্তব কাজের আগে-পরের ছবি প্রকাশ করি। আপনার ভবনের ট্যাংক বা পাইপলাইনের কাজের বিবরণ দিয়ে সরাসরি কোটেশন ও কাজের ভিডিও নমুনা দেখতে পারেন।'
                  : 'We publish real project photos strictly with customer privacy consent. Explore our work videos below or request a direct quotation for your building.'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <a
                  href={telHref}
                  className="px-5 py-2.5 rounded-xl bg-[#123047] hover:bg-[#1E3A5F] text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <Phone className="w-4 h-4" />
                  <span>{displayPhone}</span>
                </a>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Quote</span>
                </a>
                {onOpenQuoteModal ? (
                  <button
                    type="button"
                    onClick={() => onOpenQuoteModal('Water Tank Cleaning')}
                    className="px-5 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#123047] text-xs font-extrabold cursor-pointer"
                  >
                    {lang === 'bn' ? 'কোটেশন নিন' : 'Get Quote'}
                  </button>
                ) : (
                  <a
                    href="/get-quote"
                    onClick={(e) => handleLinkClick(e, '/get-quote')}
                    className="px-5 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#123047] text-xs font-extrabold"
                  >
                    {lang === 'bn' ? 'কোটেশন নিন' : 'Get Quote'}
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((proj) => {
                const detailHref = `/portfolio/${proj.slug || proj.id}`;
                const beforeSrc = proj.beforeImage || proj.beforeImg || '';
                const afterSrc = proj.afterImage || proj.afterImg || '';
                const projTitle = lang === 'bn' ? proj.titleBn || proj.title : proj.title;
                const projArea = lang === 'bn' ? proj.locationBn || proj.area || proj.location : proj.area || proj.location;
                const projDesc = lang === 'bn'
                  ? proj.workDoneBn || proj.summaryBn || proj.descriptionBn || proj.description
                  : proj.workDone || proj.summary || proj.description;

                return (
                  <article
                    key={proj.id}
                    className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm hover:border-[#0D9488] hover:shadow-md transition-all"
                  >
                    <a
                      href={detailHref}
                      onClick={(e) => handleLinkClick(e, detailHref)}
                      className="grid grid-cols-2 h-44 bg-slate-100 border-b border-[#E2E8F0] block"
                    >
                      <div className="relative h-full overflow-hidden">
                        {beforeSrc && (
                          <img
                            src={beforeSrc}
                            alt={`${projTitle} - Before`}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                          />
                        )}
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold">
                          Before
                        </span>
                      </div>
                      <div className="relative h-full overflow-hidden border-l border-white">
                        {afterSrc && (
                          <img
                            src={afterSrc}
                            alt={`${projTitle} - After`}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                          />
                        )}
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold">
                          After
                        </span>
                      </div>
                    </a>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-[#0D9488]">
                          {projArea && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{projArea}</span>
                            </span>
                          )}
                          {proj.serviceDate && (
                            <span className="text-[#64748B] flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{proj.serviceDate}</span>
                            </span>
                          )}
                        </div>
                        <h2 className="text-base font-extrabold text-[#123047] leading-snug">
                          <a
                            href={detailHref}
                            onClick={(e) => handleLinkClick(e, detailHref)}
                            className="hover:text-[#0D9488] transition-colors"
                          >
                            {projTitle}
                          </a>
                        </h2>
                        {projDesc && (
                          <p className="text-xs text-[#475569] line-clamp-2 leading-relaxed">{projDesc}</p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs font-bold">
                        <span className="text-[#64748B]">{proj.tankType}</span>
                        <a
                          href={detailHref}
                          onClick={(e) => handleLinkClick(e, detailHref)}
                          className="text-[#0D9488] hover:text-[#123047] inline-flex items-center gap-1"
                        >
                          <span>{lang === 'bn' ? 'বিস্তারিত দেখুন' : 'View Case Study'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Video Work Documentation */}
        <OurWorkVideosSection />
      </div>
    </main>
  );
};

export default PortfolioPage;
