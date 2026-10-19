import React, { useState } from 'react';
import { 
  ChevronDown, 
  Search, 
  MessageCircle, 
  Phone 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSiteConfig } from '../context/SiteConfigContext';

export const FaqSection: React.FC = () => {
  const { lang, t } = useLanguage();
  const { faqs, business } = useSiteConfig();
  const [openIds, setOpenIds] = useState<number[]>([1]); // First FAQ open by default
  const [searchFilter, setSearchFilter] = useState('');

  const toggleFaq = (id: number) => {
    setOpenIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const filteredFaqs = faqs.filter(faq => {
    const q = (lang === 'bn' ? faq.questionBn : faq.question).toLowerCase();
    const a = (lang === 'bn' ? faq.answerBn : faq.answer).toLowerCase();
    const term = searchFilter.toLowerCase();
    return q.includes(term) || a.includes(term);
  });

  return (
    <section className="py-14 sm:py-20 bg-slate-50 border-b border-slate-200" id="faq" aria-labelledby="faq-heading">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-800">
            {lang === 'bn' ? 'সাধারণ প্রশ্নোত্তর (FAQ)' : 'Frequently Asked Questions'}
          </span>
          <h2 id="faq-heading" className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0B2545] tracking-tight mt-1.5">
            {t('faq.h2')}
          </h2>
          <p className="mt-2.5 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            {t('faq.sub')}
          </p>
        </div>

        {/* Quick Filter Search */}
        <div className="relative mb-8 max-w-md mx-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder={lang === 'bn' ? 'প্রশ্ন খুঁজুন...' : 'Search questions or keywords...'}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:border-cyan-500 shadow-2xs"
            aria-label="Search FAQs"
          />
        </div>

        {/* Accordion List */}
        <div className="space-y-3" role="region" aria-label="Frequently Asked Questions list">
          {filteredFaqs.map((faq) => {
            const isOpen = openIds.includes(faq.id);
            const contentId = `faq-content-${faq.id}`;
            const buttonId = `faq-btn-${faq.id}`;

            return (
              <div
                key={faq.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all shadow-2xs"
              >
                <button
                  type="button"
                  id={buttonId}
                  aria-expanded={isOpen}
                  aria-controls={contentId}
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full min-h-[48px] p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 hover:text-[#0B2B5C] focus-visible:outline-2 focus-visible:outline-[#0B2545] cursor-pointer"
                >
                  <span className="text-sm sm:text-base flex items-start gap-2.5">
                    <span className="text-xs font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200 shrink-0 mt-0.5">
                      Q{faq.id}
                    </span>
                    <span>{lang === 'bn' ? faq.questionBn : faq.question}</span>
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'transform rotate-180 text-cyan-700' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>

                {isOpen && (
                  <div 
                    id={contentId}
                    role="region"
                    aria-labelledby={buttonId}
                    className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-700 leading-relaxed border-t border-slate-100 bg-slate-50/50"
                  >
                    <p>{lang === 'bn' ? faq.answerBn : faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still have questions banner */}
        <div className="mt-10 p-5 rounded-2xl bg-white border border-slate-200 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <h4 className="text-sm font-bold text-slate-900">
              {lang === 'bn' ? 'আরও কোনো বিষয়ে জানতে চান?' : 'Still have questions about your tank?'}
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              {lang === 'bn' ? 'আমাদের প্রতিনিধি আপনার প্রশ্নের উত্তর দিতে সর্বদা প্রস্তুত রয়েছে।' : 'Our support team in Dhaka is happy to discuss your specific tank size and requirements.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${business.phone}`}
              className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#0B2B5C] bg-slate-100 hover:bg-slate-200 rounded-xl focus-visible:outline-2 focus-visible:outline-[#0B2545]"
            >
              <Phone className="w-3.5 h-3.5 text-cyan-700" aria-hidden="true" />
              <span>কল করুন</span>
            </a>
            <a
              href={`https://wa.me/${business.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hello Sunviloz Clean Care, I have a question about tank cleaning.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl focus-visible:outline-2 focus-visible:outline-emerald-800"
            >
              <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
