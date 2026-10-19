import React, { useState } from 'react';
import { 
  HelpCircle, 
  ArrowRight, 
  Droplets, 
  Wrench, 
  ChevronDown,
  Search,
  CheckCircle2,
  Phone,
  MessageCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useServicesFaqs } from '../utils/servicesFaqStore';
import { useSiteConfig } from '../context/SiteConfigContext';

interface AllServicesFaqSectionProps {
  onNavigate?: (path: string) => void;
}

export const AllServicesFaqSection: React.FC<AllServicesFaqSectionProps> = ({ onNavigate }) => {
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

  // Filter only water tank cleaning and pipeline cleaning FAQs
  const relevantFaqs = faqs.filter(f => 
    (f.category === 'water-tank-cleaning' || f.category === 'pipeline-cleaning') && 
    f.isActive !== false
  );

  const filteredFaqs = relevantFaqs.filter(faq => {
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
  });

  const tankCount = tankFaqs.length;
  const pipeCount = pipelineFaqs.length;

  return (
    <section 
      id="homepage-all-faq" 
      aria-labelledby="homepage-faq-heading"
      className="py-16 sm:py-24 bg-[#080A0D] border-b border-[#303743]"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Centered Heading */}
        <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-[#2585FF] uppercase mb-2.5 bg-[#2585FF]/10 px-3 py-1 rounded-full border border-[#2585FF]/20">
            <HelpCircle className="w-4 h-4 text-[#2585FF]" aria-hidden="true" />
            <span>{lang === 'bn' ? 'সার্ভিস প্রশ্নোত্তর ডিরেক্টরি' : 'Services FAQ Directory'}</span>
          </div>

          <h2 
            id="homepage-faq-heading" 
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight"
          >
            সকল সার্ভিসের সচরাচর জিজ্ঞাসিত প্রশ্নাবলী
          </h2>

          <div className="w-20 h-1 bg-gradient-to-r from-transparent via-[#2585FF] to-transparent mx-auto my-3.5 rounded-full" />

          <p className="text-sm sm:text-base text-[#B8C0CC] leading-relaxed">
            {lang === 'bn' 
              ? 'পানির ট্যাংক পরিষ্কার ও পাইপলাইন ফ্লাশিং সংক্রান্ত পদ্ধতি, খরচ, সময়সূচি ও প্রয়োজনীয় তথ্য।'
              : 'Detailed answers regarding Water Tank Cleaning and Water Pipeline Flushing methods, pricing, and timelines.'}
          </p>
        </div>

        {/* Filter Tabs for Water Tank & Pipeline Cleaning */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 p-1 bg-[#171C24] border border-[#303743] rounded-xl w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-[#2585FF] text-white shadow-md shadow-[#2585FF]/30'
                  : 'text-[#B8C0CC] hover:text-white hover:bg-[#202630]'
              }`}
            >
              {lang === 'bn' ? 'সকল প্রশ্নোত্তর' : 'All FAQs'} ({tankCount + pipeCount})
            </button>

            <button
              type="button"
              onClick={() => setActiveCategory('water-tank-cleaning')}
              className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeCategory === 'water-tank-cleaning'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                  : 'text-[#B8C0CC] hover:text-white hover:bg-[#202630]'
              }`}
            >
              <Droplets className="w-3.5 h-3.5 text-cyan-300" />
              <span>{lang === 'bn' ? 'পানির ট্যাংক পরিষ্কার' : 'Water Tank Cleaning'}</span>
              <span className="text-[11px] opacity-80">({tankCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCategory('pipeline-cleaning')}
              className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeCategory === 'pipeline-cleaning'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-[#B8C0CC] hover:text-white hover:bg-[#202630]'
              }`}
            >
              <Wrench className="w-3.5 h-3.5 text-blue-300" />
              <span>{lang === 'bn' ? 'পাইপলাইন পরিষ্কার' : 'Pipeline Cleaning'}</span>
              <span className="text-[11px] opacity-80">({pipeCount})</span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#8A94A6] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'bn' ? 'প্রশ্ন বা বিষয় খুঁজুন...' : 'Search question...'}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#171C24] border border-[#303743] text-xs sm:text-sm text-white placeholder-[#8A94A6] focus:outline-none focus:border-[#2585FF]"
            />
          </div>
        </div>

        {/* Questions and Answers Accordion List */}
        <div className="space-y-3 mb-10">
          {filteredFaqs.length === 0 ? (
            <div className="p-8 text-center bg-[#171C24] rounded-2xl border border-[#303743]">
              <HelpCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">
                {lang === 'bn' ? 'কোনো প্রশ্ন পাওয়া যায়নি' : 'No matching questions found'}
              </p>
              <p className="text-xs text-[#8A94A6] mt-1">
                {lang === 'bn' ? 'ভিন্ন কোনো কী-ওয়ার্ড দিয়ে সার্চ করুন।' : 'Try searching with different keywords.'}
              </p>
            </div>
          ) : (
            filteredFaqs.map((faq, index) => {
              const isOpen = openIds.includes(faq.id);
              const isTank = faq.category === 'water-tank-cleaning';
              const question = lang === 'bn' ? faq.questionBn : faq.questionEn;
              const answer = lang === 'bn' ? faq.answerBn : faq.answerEn;

              return (
                <div
                  key={faq.id}
                  className={`rounded-2xl transition-all duration-200 border ${
                    isOpen 
                      ? 'bg-[#171C24] border-[#2585FF]/50 shadow-lg shadow-blue-950/20' 
                      : 'bg-[#13171F] border-[#303743] hover:border-slate-600'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(faq.id)}
                    className="w-full p-4 sm:p-5 text-left flex items-start justify-between gap-4 cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-start gap-3">
                      {/* Category Badge Icon */}
                      <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 border ${
                        isTank 
                          ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' 
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {isTank ? <Droplets className="w-4 h-4" /> : <Wrench className="w-4 h-4" />}
                      </span>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            isTank 
                              ? 'bg-cyan-950/60 text-cyan-300 border-cyan-800/40' 
                              : 'bg-blue-950/60 text-blue-300 border-blue-800/40'
                          }`}>
                            {lang === 'bn' 
                              ? (isTank ? 'পানির ট্যাংক পরিষ্কার' : 'পাইপলাইন পরিষ্কার')
                              : (isTank ? 'Water Tank Cleaning' : 'Pipeline Cleaning')}
                          </span>
                        </div>
                        <h3 className={`text-sm sm:text-base font-bold transition-colors leading-snug ${
                          isOpen ? 'text-[#2585FF]' : 'text-white'
                        }`}>
                          {question}
                        </h3>
                      </div>
                    </div>

                    <div className={`p-1.5 rounded-full border border-slate-700 transition-transform duration-200 mt-1 flex-shrink-0 ${
                      isOpen ? 'rotate-180 bg-[#2585FF] border-[#2585FF] text-white' : 'text-slate-400 bg-[#202630]'
                    }`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-5 sm:px-5 sm:pb-6 pt-1 text-[#B8C0CC] text-xs sm:text-sm leading-relaxed border-t border-[#303743]/60">
                      <div className="pl-11 pr-2 pt-2">
                        <p className="bg-[#0C0F14] p-4 rounded-xl border border-[#202630] text-slate-200">
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
        <div className="p-6 rounded-2xl bg-[#171C24] border border-[#303743] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h4 className="text-sm sm:text-base font-bold text-white flex items-center justify-center sm:justify-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'bn' ? 'আরও কোনো প্রশ্ন বা বিশেষ জিজ্ঞাসা আছে?' : 'Have more questions about our cleaning?'}</span>
            </h4>
            <p className="text-xs text-[#8A94A6] mt-1">
              {lang === 'bn' 
                ? 'আমাদের টেকনিক্যাল এক্সপার্টরা সার্বক্ষণিক পরামর্শ ও ফ্রি কোটেশন দিতে প্রস্তুত।'
                : 'Our technical specialists are always available for consultation and free quotations.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <a
              href={`tel:${business?.phone || '01712345678'}`}
              className="px-4 py-2.5 rounded-xl bg-[#202630] hover:bg-[#2c3442] border border-[#303743] text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors"
            >
              <Phone className="w-4 h-4 text-[#2585FF]" />
              <span>{lang === 'bn' ? 'সরাসরি কল করুন' : 'Call Now'}</span>
            </a>

            <button
              type="button"
              onClick={() => handleNavigate('/get-quote')}
              className="px-5 py-2.5 rounded-xl bg-[#2585FF] hover:bg-[#1a73e8] text-white text-xs sm:text-sm font-extrabold flex items-center gap-1.5 transition-all shadow-md shadow-[#2585FF]/20 cursor-pointer"
            >
              <span>{lang === 'bn' ? 'ফ্রি কোটেশন নিন' : 'Get Free Quote'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};

export default AllServicesFaqSection;
