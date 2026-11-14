import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  HelpCircle, 
  ArrowRight, 
  Droplets, 
  Wrench, 
  ChevronDown, 
  Search, 
  CheckCircle2, 
  Phone 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useServicesFaqs } from '../utils/servicesFaqStore';
import { useSiteConfig } from '../context/SiteConfigContext';

interface AllServicesFaqSectionProps {
  onNavigate?: (path: string) => void;
  onVisibleFaqsChange?: (visibleFaqs: { question: string; answer: string }[]) => void;
}

export const AllServicesFaqSection: React.FC<AllServicesFaqSectionProps> = ({
  onNavigate,
  onVisibleFaqsChange
}) => {
  const { lang } = useLanguage();
  const { business } = useSiteConfig();
  const { faqs, tankFaqs, pipelineFaqs } = useServicesFaqs();

  const [activeCategory, setActiveCategory] = useState<'all' | 'water-tank-cleaning' | 'pipeline-cleaning'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIds, setOpenIds] = useState<string[]>(['faq-tank-1', 'faq-pipe-1']);

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  };

  const toggleAccordion = (id: string) => {
    setOpenIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const relevantFaqs = useMemo(
    () =>
      faqs.filter(
        f =>
          (f.category === 'water-tank-cleaning' || f.category === 'pipeline-cleaning') &&
          f.isActive !== false
      ),
    [faqs]
  );

  const filteredFaqs = useMemo(
    () =>
      relevantFaqs.filter(faq => {
        if (activeCategory !== 'all' && faq.category !== activeCategory) {
          return false;
        }
        if (!searchQuery.trim()) return true;

        const query = searchQuery.toLowerCase();
        const qBn = faq.questionBn.toLowerCase();
        const qEn = faq.questionEn.toLowerCase();
        const aBn = faq.answerBn.toLowerCase();
        const aEn = faq.answerEn.toLowerCase();

        return qBn.includes(query) || qEn.includes(query) || aBn.includes(query) || aEn.includes(query);
      }),
    [relevantFaqs, activeCategory, searchQuery]
  );

  const visibleFaqSchemaItems = useMemo(
    () =>
      filteredFaqs
        .map(faq => ({
          question: lang === 'bn' ? faq.questionBn || faq.questionEn : faq.questionEn || faq.questionBn,
          answer: lang === 'bn' ? faq.answerBn || faq.answerEn : faq.answerEn || faq.answerBn
        }))
        .filter(item => Boolean(item.question && item.answer)),
    [filteredFaqs, lang]
  );

  const onVisibleFaqsChangeRef = useRef(onVisibleFaqsChange);
  onVisibleFaqsChangeRef.current = onVisibleFaqsChange;
  const lastEmittedFaqsKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const serialized = JSON.stringify(visibleFaqSchemaItems);
    if (lastEmittedFaqsKeyRef.current === serialized) {
      return;
    }
    lastEmittedFaqsKeyRef.current = serialized;
    onVisibleFaqsChangeRef.current?.(visibleFaqSchemaItems);
  }, [visibleFaqSchemaItems]);

  const tankCount = tankFaqs.length;
  const pipeCount = pipelineFaqs.length;

  return (
    <section 
      id="homepage-all-faq" 
      aria-labelledby="homepage-faq-heading"
      className="py-16 sm:py-24 bg-white border-b border-[#E2E8F0]"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Centered Heading */}
        <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-[#0D9488] uppercase mb-2.5 bg-[#E8F5F3] px-3.5 py-1 rounded-full border border-[#0D9488]/30">
            <HelpCircle className="w-4 h-4 text-[#0D9488]" aria-hidden="true" />
            <span>{lang === 'bn' ? 'সার্ভিস প্রশ্নোত্তর ডিরেক্টরি' : 'Services FAQ Directory'}</span>
          </div>

          <h2 
            id="homepage-faq-heading" 
            className="text-2xl sm:text-3xl md:text-4xl font-black text-[#123047] tracking-tight"
          >
            সকল সার্ভিসের সচরাচর জিজ্ঞাসিত প্রশ্নাবলী
          </h2>

          <div className="w-20 h-1 bg-gradient-to-r from-transparent via-[#0D9488] to-transparent mx-auto my-3.5 rounded-full" />

          <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
            {lang === 'bn' 
              ? 'পানির ট্যাংক পরিষ্কার ও পাইপলাইন ফ্লাশিং সংক্রান্ত পদ্ধতি, খরচ, সময়সূচি ও প্রয়োজনীয় তথ্য।'
              : 'Detailed answers regarding Water Tank Cleaning and Water Pipeline Flushing methods, pricing, and timelines.'}
          </p>
        </div>

        {/* Filter Tabs for Water Tank & Pipeline Cleaning */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-1.5 p-1 bg-[#F5FAFC] border border-[#E2E8F0] rounded-xl w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-[#0D9488] text-white shadow-xs'
                  : 'text-[#172B3A] hover:bg-[#E8F5F3]'
              }`}
            >
              {lang === 'bn' ? 'সকল প্রশ্নোত্তর' : 'All FAQs'} ({tankCount + pipeCount})
            </button>

            <button
              type="button"
              onClick={() => setActiveCategory('water-tank-cleaning')}
              className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeCategory === 'water-tank-cleaning'
                  ? 'bg-[#0D9488] text-white shadow-xs'
                  : 'text-[#172B3A] hover:bg-[#E8F5F3]'
              }`}
            >
              <Droplets className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'পানির ট্যাংক' : 'Water Tank'}</span>
              <span className="text-[11px] opacity-80">({tankCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCategory('pipeline-cleaning')}
              className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeCategory === 'pipeline-cleaning'
                  ? 'bg-[#0D9488] text-white shadow-xs'
                  : 'text-[#172B3A] hover:bg-[#E8F5F3]'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'পাইপলাইন' : 'Pipeline'}</span>
              <span className="text-[11px] opacity-80">({pipeCount})</span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'bn' ? 'প্রশ্ন বা বিষয় খুঁজুন...' : 'Search question...'}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white border border-[#E2E8F0] text-xs sm:text-sm text-[#172B3A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0D9488]"
            />
          </div>
        </div>

        {/* Questions and Answers Accordion List */}
        <div className="space-y-3 mb-10">
          {filteredFaqs.length === 0 ? (
            <div className="p-8 text-center bg-[#F5FAFC] rounded-2xl border border-[#E2E8F0]">
              <HelpCircle className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#172B3A]">
                {lang === 'bn' ? 'কোনো প্রশ্ন পাওয়া যায়নি' : 'No matching questions found'}
              </p>
              <p className="text-xs text-[#64748B] mt-1">
                {lang === 'bn' ? 'ভিন্ন কোনো কী-ওয়ার্ড দিয়ে সার্চ করুন।' : 'Try searching with different keywords.'}
              </p>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = openIds.includes(faq.id);
              const isTank = faq.category === 'water-tank-cleaning';
              const question = lang === 'bn' ? faq.questionBn : faq.questionEn;
              const answer = lang === 'bn' ? faq.answerBn : faq.answerEn;

              return (
                <div
                  key={faq.id}
                  className={`rounded-2xl transition-all duration-200 border ${
                    isOpen 
                      ? 'bg-[#F5FAFC] border-[#0D9488]/40 shadow-xs' 
                      : 'bg-white border-[#E2E8F0] hover:border-[#0D9488]/30 shadow-2xs'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(faq.id)}
                    className="w-full p-4 sm:p-5 text-left flex items-start justify-between gap-4 cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 bg-[#E8F5F3] text-[#0D9488]">
                        {isTank ? <Droplets className="w-4 h-4" /> : <Wrench className="w-4 h-4" />}
                      </span>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E8F5F3] text-[#0D9488] border border-[#0D9488]/20">
                            {lang === 'bn' 
                              ? (isTank ? 'পানির ট্যাংক পরিষ্কার' : 'পাইপলাইন পরিষ্কার')
                              : (isTank ? 'Water Tank Cleaning' : 'Pipeline Cleaning')}
                          </span>
                        </div>
                        <h3 className={`text-sm sm:text-base font-bold transition-colors leading-snug ${
                          isOpen ? 'text-[#0D9488]' : 'text-[#123047]'
                        }`}>
                          {question}
                        </h3>
                      </div>
                    </div>

                    <div className={`p-1.5 rounded-full border border-[#E2E8F0] transition-transform duration-200 mt-1 flex-shrink-0 ${
                      isOpen ? 'rotate-180 bg-[#0D9488] border-[#0D9488] text-white' : 'text-[#64748B] bg-white'
                    }`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-5 sm:px-5 sm:pb-6 pt-1 text-[#64748B] text-xs sm:text-sm leading-relaxed border-t border-[#E2E8F0]">
                      <div className="pl-11 pr-2 pt-2">
                        <p className="bg-white p-4 rounded-xl border border-[#E2E8F0] text-[#172B3A]">
                          {answer}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Action Bar / Contact & All FAQ Buttons */}
        <div className="p-6 rounded-2xl bg-[#F5FAFC] border border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h4 className="text-sm sm:text-base font-bold text-[#123047] flex items-center justify-center sm:justify-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0D9488]" />
              <span>{lang === 'bn' ? 'আরও কোনো প্রশ্ন বা বিশেষ জিজ্ঞাসা আছে?' : 'Have more questions about our cleaning?'}</span>
            </h4>
            <p className="text-xs text-[#64748B] mt-1">
              {lang === 'bn' 
                ? 'আমাদের টেকনিক্যাল এক্সপার্টরা সার্বক্ষণিক পরামর্শ ও ফ্রি কোটেশন দিতে প্রস্তুত।'
                : 'Our technical specialists are always available for consultation and free quotations.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <a
              href={`tel:${business?.phone || '+8809649112288'}`}
              className="px-4 py-2.5 rounded-xl bg-[#123047] hover:bg-[#0f2638] text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Phone className="w-4 h-4 text-[#38BDF8]" />
              <span>{lang === 'bn' ? 'সরাসরি কল করুন' : 'Call Now'}</span>
            </a>

            <a
              href="/get-quote"
              onClick={(e) => {
                if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                  e.preventDefault();
                  handleNavigate('/get-quote');
                }
              }}
              className="px-5 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <span>{lang === 'bn' ? 'ফ্রি কোটেশন নিন' : 'Get Free Quote'}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};

export default AllServicesFaqSection;
