import React from 'react';
import {
  MapPin,
  Calendar,
  Clock,
  Droplets,
  ArrowLeft,
  Phone,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Wrench,
  ArrowRight
} from 'lucide-react';
import { SeoHead } from '../components/SeoHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { useLanguage } from '../context/LanguageContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { usePortfolioProjects, isPublicPublishedCaseStudy } from '../utils/portfolioStore';
import { NotFoundPage } from './NotFoundPage';
import {
  resolveAuthoritativeHotline,
  resolveAuthoritativeHotlineDisplay
} from '../seo/seoResolver';

interface CaseStudyDetailPageProps {
  slug: string;
  onNavigate?: (path: string) => void;
  onOpenQuoteModal?: (serviceName?: string) => void;
}

export const CaseStudyDetailPage: React.FC<CaseStudyDetailPageProps> = ({
  slug,
  onNavigate,
  onOpenQuoteModal
}) => {
  const { lang } = useLanguage();
  const { business } = useSiteConfig();
  const { projects } = usePortfolioProjects();

  const publishedProjects = projects.filter(isPublicPublishedCaseStudy);
  const project = publishedProjects.find(p => (p.slug || p.id) === slug);

  if (!project) {
    return <NotFoundPage onNavigate={onNavigate} />;
  }

  const displayPhone = resolveAuthoritativeHotlineDisplay(business?.displayPhone, business?.phone);
  const telHref = `tel:${resolveAuthoritativeHotline(business?.phone)}`;
  const waDigits = (business?.whatsappNumber || '8801609999612').replace(/[^0-9]/g, '');
  const waText =
    lang === 'bn'
      ? `আসসালামু আলাইকুম, "${project.titleBn || project.title}" (${project.locationBn || project.area}) কাজের মতো আমাদের ভবনের ট্যাংক পরিষ্কারের কোটেশন প্রয়োজন।`
      : `Hello, I saw your "${project.title}" case study and would like a quotation.`;
  const whatsappHref = `https://wa.me/${waDigits}?text=${encodeURIComponent(waText)}`;

  const relatedCases = publishedProjects.filter(p => p.id !== project.id).slice(0, 3);
  const serviceSlug = project.relatedServiceSlug || 'water-tank-cleaning';
  const beforeSrc = project.beforeImage || project.beforeImg || '';
  const afterSrc = project.afterImage || project.afterImg || '';
  const titleText = lang === 'bn' ? project.titleBn || project.title : project.title;
  const areaText = lang === 'bn' ? project.locationBn || project.area || project.location : project.area || project.location;
  const problemText = lang === 'bn' ? project.customerProblemBn || project.customerProblem : project.customerProblem || project.customerProblemBn;
  const workText = lang === 'bn' ? project.workDoneBn || project.workDone || project.descriptionBn || project.description : project.workDone || project.description || project.summary;
  const resultText = lang === 'bn' ? project.actualResultBn || project.actualResult : project.actualResult || project.actualResultBn;

  const metaTitle =
    project.metaTitle?.trim() || `${titleText} | Case Study | SUNVILOZ CLEAN CARE`;
  const metaDesc =
    project.metaDescription?.trim() ||
    `${areaText || 'Dhaka'} — ${project.tankType || 'Water Tank'}: ${(workText || project.summaryBn || project.summary || '').slice(0, 145)}`;

  const handleLinkClick = (e: React.MouseEvent, targetPath: string) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(targetPath);
    }
  };

  return (
    <main className="min-h-screen bg-[#F5FAFC] text-[#172B3A] pb-16">
      <SeoHead
        title={metaTitle}
        description={metaDesc}
        canonicalPath={`/portfolio/${project.slug || project.id}`}
        canonicalUrl={`https://sunvilozcleancare.com/portfolio/${project.slug || project.id}`}
        ogImage={afterSrc || beforeSrc || undefined}
        breadcrumbs={[
          { name: lang === 'bn' ? 'হোম' : 'Home', path: '/' },
          { name: lang === 'bn' ? 'কাজের কেস স্টাডি ও পোর্টফোলিও' : 'Portfolio & Case Studies', path: '/portfolio' },
          { name: titleText, path: `/portfolio/${project.slug || project.id}` }
        ]}
      />

      {/* Dark Navy Hero */}
      <section className="bg-[#123047] text-white py-10 sm:py-14 border-b border-[#0D9488]/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-4">
          <Breadcrumbs
            items={[
              { label: lang === 'bn' ? 'কেস স্টাডি ও পোর্টফোলিও' : 'Portfolio', href: '/portfolio' },
              { label: titleText, href: `/portfolio/${project.slug || project.id}` }
            ]}
            onNavigate={onNavigate}
          />

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {project.category && (
              <span className="px-3 py-1 rounded-full bg-[#0D9488]/20 text-[#38BDF8] border border-[#0D9488]/40 font-semibold">
                {project.category}
              </span>
            )}
            {areaText && (
              <span className="px-3 py-1 rounded-full bg-white/10 text-slate-100 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>{areaText}</span>
              </span>
            )}
            {project.serviceDate && (
              <span className="px-3 py-1 rounded-full bg-white/10 text-slate-100 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>{project.serviceDate}</span>
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight">
            {titleText}
          </h1>

          <div className="flex flex-wrap gap-4 pt-2 text-xs sm:text-sm text-slate-200">
            {project.tankType && (
              <span className="flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-[#0D9488]" />
                <span>{project.tankType}</span>
              </span>
            )}
            {project.capacity && (
              <span>• {lang === 'bn' ? 'ধারণক্ষমতা:' : 'Capacity:'} {project.capacity}</span>
            )}
            {project.duration && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-[#38BDF8]" />
                <span>{project.duration}</span>
              </span>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-6 space-y-8">
        {/* Before / After Comparison Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-white p-4 sm:p-6 rounded-2xl border border-[#E2E8F0] shadow-lg">
          <figure className="space-y-2">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border border-[#E2E8F0]">
              {beforeSrc ? (
                <img
                  src={beforeSrc}
                  alt={project.beforeCaptionBn || project.beforeCaption || `${titleText} - Before Cleaning`}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">Before Photo</div>
              )}
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded bg-rose-600 text-white text-xs font-bold shadow">
                {lang === 'bn' ? 'কাজের পূর্বে (Before)' : 'Before'}
              </span>
            </div>
            {(project.beforeCaptionBn || project.beforeCaption) && (
              <figcaption className="text-xs text-[#64748B] leading-relaxed">
                {lang === 'bn' ? project.beforeCaptionBn || project.beforeCaption : project.beforeCaption || project.beforeCaptionBn}
              </figcaption>
            )}
          </figure>

          <figure className="space-y-2">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border border-[#E2E8F0]">
              {afterSrc ? (
                <img
                  src={afterSrc}
                  alt={project.afterCaptionBn || project.afterCaption || `${titleText} - After Cleaning`}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">After Photo</div>
              )}
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded bg-emerald-600 text-white text-xs font-bold shadow">
                {lang === 'bn' ? 'কাজের পরে (After)' : 'After'}
              </span>
            </div>
            {(project.afterCaptionBn || project.afterCaption) && (
              <figcaption className="text-xs text-[#64748B] leading-relaxed">
                {lang === 'bn' ? project.afterCaptionBn || project.afterCaption : project.afterCaption || project.afterCaptionBn}
              </figcaption>
            )}
          </figure>
        </section>

        {/* Detailed Work Breakdown */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {problemText && (
            <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] space-y-2">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <h2>{lang === 'bn' ? 'পূর্বের অবস্থা ও সমস্যা' : 'Initial Condition'}</h2>
              </div>
              <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">{problemText}</p>
            </div>
          )}

          <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] space-y-2">
            <div className="flex items-center gap-2 text-[#0D9488] font-bold text-sm">
              <Wrench className="w-4 h-4 shrink-0" />
              <h2>{lang === 'bn' ? 'সম্পাদিত পরিষ্কার প্রক্রিয়া' : 'Cleaning Process Applied'}</h2>
            </div>
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">{workText}</p>
          </div>

          {resultText && (
            <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <h2>{lang === 'bn' ? 'চূড়ান্ত ফলাফল' : 'Observed Result'}</h2>
              </div>
              <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">{resultText}</p>
            </div>
          )}
        </section>

        {/* Internal Links: Related Service + Area */}
        <section className="bg-white p-6 rounded-2xl border border-[#E2E8F0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-base font-extrabold text-[#123047]">
              {lang === 'bn' ? 'সংশ্লিষ্ট সার্ভিস ও এলাকার তথ্য' : 'Related Service & Coverage Area'}
            </h2>
            <div className="flex flex-wrap gap-3 text-xs font-bold">
              <a
                href={`/services/${serviceSlug}`}
                onClick={(e) => handleLinkClick(e, `/services/${serviceSlug}`)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#E8F5F3] text-[#0D9488] hover:bg-[#0D9488] hover:text-white transition-colors"
              >
                <span>{lang === 'bn' ? 'মূল সার্ভিস পেজ দেখুন' : 'View Service Page'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
              {project.areaSlug && (
                <a
                  href={`/service-areas/${project.areaSlug}`}
                  onClick={(e) => handleLinkClick(e, `/service-areas/${project.areaSlug}`)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F1F5F9] text-[#123047] hover:bg-[#123047] hover:text-white transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{areaText} {lang === 'bn' ? 'সার্ভিস এরিয়া' : 'Service Area'}</span>
                </a>
              )}
              <a
                href="/portfolio"
                onClick={(e) => handleLinkClick(e, '/portfolio')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E2E8F0] text-[#475569] hover:text-[#123047]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'সব কেস স্টাডি দেখুন' : 'All Case Studies'}</span>
              </a>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <a
              href={telHref}
              className="px-4 py-2.5 rounded-xl bg-[#123047] hover:bg-[#1E3A5F] text-white text-xs font-bold flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{displayPhone}</span>
            </a>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold flex items-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp Quote</span>
            </a>
            {onOpenQuoteModal && (
              <button
                type="button"
                onClick={() => onOpenQuoteModal(project.tankType || 'Water Tank Cleaning')}
                className="px-4 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#123047] text-xs font-extrabold cursor-pointer"
              >
                {lang === 'bn' ? 'ফ্রি কোটেশন নিন' : 'Get Free Quote'}
              </button>
            )}
          </div>
        </section>

        {/* Related Published Case Studies */}
        {relatedCases.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-extrabold text-[#123047]">
              {lang === 'bn' ? 'অন্যান্য সম্পন্ন কাজের কেস স্টাডি' : 'More Completed Case Studies'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedCases.map(rc => (
                <a
                  key={rc.id}
                  href={`/portfolio/${rc.slug || rc.id}`}
                  onClick={(e) => handleLinkClick(e, `/portfolio/${rc.slug || rc.id}`)}
                  className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden hover:border-[#0D9488] transition-all block"
                >
                  <div className="aspect-[16/10] bg-slate-100">
                    {(rc.afterImage || rc.afterImg) && (
                      <img
                        src={rc.afterImage || rc.afterImg}
                        alt={rc.titleBn || rc.title}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="p-4 space-y-1">
                    <div className="text-[11px] font-bold text-[#0D9488]">
                      {lang === 'bn' ? rc.locationBn || rc.area : rc.area}
                    </div>
                    <h3 className="text-sm font-bold text-[#123047] line-clamp-2">
                      {lang === 'bn' ? rc.titleBn || rc.title : rc.title}
                    </h3>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default CaseStudyDetailPage;
