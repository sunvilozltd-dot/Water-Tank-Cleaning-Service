import React, { useState } from 'react';
import { 
  ChevronDown, 
  Search, 
  MessageCircle, 
  Phone,
  ArrowRight,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { PROBLEM_QA_ITEMS } from '../data/problemQaData';
import { trackPhoneClick, trackWhatsAppClick } from '../utils/tracking';

interface FaqSectionProps {
  onNavigate?: (path: string) => void;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ onNavigate }) => {
  const { lang, t } = useLanguage();
  const { faqs, business } = useSiteConfig();
  const [openIds, setOpenIds] = useState<number[]>([1]);
  const [openProblemId, setOpenProblemId] = useState<string | null>(PROBLEM_QA_ITEMS[0].id);
  const [searchFilter, setSearchFilter] = useState('');

  const handleGo = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.scrollTo(0, 0);
    }
  };

  const toggleFaq = (id: number) => {
    setOpenIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const term = searchFilter.trim().toLowerCase();

  const filteredFaqs = faqs.filter(faq => {
    const q = (lang === 'bn' ? faq.questionBn : faq.question).toLowerCase();
    const a = (lang === 'bn' ? faq.answerBn : faq.answer).toLowerCase();
    return q.includes(term) || a.includes(term);
  });

  const filteredProblems = PROBLEM_QA_ITEMS.filter(item => {
    const q = (lang === 'bn' ? item.questionBn : item.questionEn).toLowerCase();
    const a = (lang === 'bn' ? item.directAnswerBn : item.directAnswerEn).toLowerCase();
    const cat = (lang === 'bn' ? item.problemCategoryBn : item.problemCategoryEn).toLowerCase();
    return !term || q.includes(term) || a.includes(term) || cat.includes(term);
  });

  return (
    <section className="py-14 sm:py-20 bg-transparent border-b border-[#E2E8F0]" id="faq" aria-labelledby="faq-heading">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0D9488] bg-[#E8F5F3] px-3 py-1 rounded-full border border-[#0D9488]/30 inline-block">
            {lang === 'bn' ? 'সমস্যাভিত্তিক প্রশ্নোত্তর (AI Overview Ready)' : 'Problem-Based Q&A & FAQ'}
          </span>
          <h2 id="faq-heading" className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#123047] tracking-tight mt-3">
            {t('faq.h2')}
          </h2>
          <p className="mt-2.5 text-sm sm:text-base text-[#64748B] leading-relaxed max-w-2xl mx-auto">
            {t('faq.sub')}
          </p>
        </div>

        {/* Quick Filter Search */}
        <div className="relative max-w-md mx-auto">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder={lang === 'bn' ? 'সমস্যা বা প্রশ্ন খুঁজুন (যেমন: ময়লা, শেওলা, দুর্গন্ধ, প্রেশার)...' : 'Search water problems or questions...'}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-[#172B3A] text-sm focus:outline-none focus:border-[#0D9488] shadow-sm"
            aria-label="Search FAQs"
          />
        </div>

        {/* Problem-Based Direct Answers Block (All 10 Customer Problems) */}
        {filteredProblems.length > 0 && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-lg sm:text-xl font-extrabold text-[#123047]">
                {lang === 'bn'
                  ? 'পানির ট্যাংক ও পাইপলাইনের ১০টি সাধারণ সমস্যা ও সরাসরি উত্তর'
                  : '10 Common Tank & Pipeline Water Problems — Direct Answers'}
              </h3>
              <span className="text-xs font-semibold text-[#0D9488]">
                {filteredProblems.length}টি সমস্যাভিত্তিক সমাধান
              </span>
            </div>

            <div className="space-y-3">
              {filteredProblems.map((item, idx) => {
                const isOpen = openProblemId === item.id;
                const question = lang === 'bn' ? item.questionBn : item.questionEn;
                const directAnswer = lang === 'bn' ? item.directAnswerBn : (item.directAnswerEn || item.directAnswerBn);
                const keyPoints = lang === 'bn' ? item.keyPointsBn : (item.keyPointsEn || item.keyPointsBn);
                const nonCleaning = lang === 'bn' ? item.nonCleaningCausesBn : (item.nonCleaningCausesEn || item.nonCleaningCausesBn);

                return (
                  <article
                    key={item.id}
                    className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm"
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpenProblemId(isOpen ? null : item.id)}
                      className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-[#123047] hover:text-[#0D9488] cursor-pointer"
                    >
                      <div className="space-y-1">
                        <span className="inline-block text-[11px] font-bold text-[#0D9488] bg-[#E8F5F3] px-2.5 py-0.5 rounded-full border border-[#0D9488]/20">
                          {idx + 1}. {lang === 'bn' ? item.problemCategoryBn : item.problemCategoryEn}
                        </span>
                        <h4 className="text-sm sm:text-base font-bold text-[#123047]">
                          {question}
                        </h4>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-[#64748B] shrink-0 transition-transform ${
                          isOpen ? 'rotate-180 text-[#0D9488]' : ''
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 pt-3 border-t border-[#E2E8F0] bg-[#F5FAFC]/60 space-y-3 text-xs sm:text-sm text-[#475569] leading-relaxed">
                        <p className="font-medium text-[#172B3A]">
                          {directAnswer}
                        </p>

                        {keyPoints.length > 0 && (
                          <ul className="space-y-1.5">
                            {keyPoints.map((pt, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-[#0D9488] shrink-0 mt-0.5" />
                                <span>{pt}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {nonCleaning && (
                          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-slate-700 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <span>
                              <strong>{lang === 'bn' ? 'কখন শুধু পরিষ্কার যথেষ্ট নয়:' : 'Important technical note:'}</strong>{' '}
                              {nonCleaning}
                            </span>
                          </div>
                        )}

                        <div className="pt-1">
                          <a
                            href={item.relatedServicePath}
                            onClick={(e) => {
                              if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                                e.preventDefault();
                                handleGo(item.relatedServicePath);
                              }
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0D9488] hover:underline"
                          >
                            <span>{lang === 'bn' ? item.relatedServiceLabelBn : item.relatedServiceLabelEn}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* Standard Accordion List */}
        <div className="space-y-3" role="region" aria-label="Frequently Asked Questions list">
          <h3 className="text-lg font-extrabold text-[#123047]">
            {lang === 'bn' ? 'সেবা ও বুকিং সংক্রান্ত সাধারণ প্রশ্ন' : 'General Service & Booking Questions'}
          </h3>
          {filteredFaqs.map((faq) => {
            const isOpen = openIds.includes(faq.id);
            const contentId = `faq-content-${faq.id}`;
            const buttonId = `faq-btn-${faq.id}`;

            return (
              <div
                key={faq.id}
                className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden transition-all shadow-sm"
              >
                <button
                  type="button"
                  id={buttonId}
                  aria-expanded={isOpen}
                  aria-controls={contentId}
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full min-h-[48px] p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-[#123047] hover:text-[#0D9488] focus-visible:outline-2 focus-visible:outline-[#0D9488] cursor-pointer"
                >
                  <span className="text-sm sm:text-base flex items-start gap-2.5">
                    <span className="text-xs font-bold text-[#0D9488] bg-[#E8F5F3] px-2 py-0.5 rounded-lg border border-[#0D9488]/30 shrink-0 mt-0.5">
                      Q{faq.id}
                    </span>
                    <span>{lang === 'bn' ? faq.questionBn : faq.question}</span>
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#64748B] transition-transform duration-200 shrink-0 ${
                      isOpen ? 'transform rotate-180 text-[#0D9488]' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>

                {isOpen && (
                  <div 
                    id={contentId}
                    role="region"
                    aria-labelledby={buttonId}
                    className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#64748B] leading-relaxed border-t border-[#E2E8F0] bg-[#F5FAFC]/50"
                  >
                    <p>{lang === 'bn' ? faq.answerBn : faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still have questions banner */}
        <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] text-center flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="text-left">
            <h4 className="text-sm font-bold text-[#123047]">
              {lang === 'bn' ? 'আরও কোনো বিষয়ে জানতে চান?' : 'Still have questions about your tank?'}
            </h4>
            <p className="text-xs text-[#64748B] mt-0.5">
              {lang === 'bn' ? 'ঢাকা, নারায়ণগঞ্জ, গাজীপুর ও সাভারের গ্রাহকদের সহায়তায় আমাদের টিম প্রস্তুত।' : 'Our support team in Dhaka, Narayanganj, Gazipur & Savar is ready to assist.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${business.phone}`}
              onClick={() => trackPhoneClick({ source: 'faq_banner_call' })}
              className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#123047] hover:bg-[#1b4363] rounded-xl shadow-sm"
            >
              <Phone className="w-3.5 h-3.5 text-[#38BDF8]" aria-hidden="true" />
              <span>{lang === 'bn' ? 'সরাসরি কল করুন' : 'Call Direct'}</span>
            </a>
            <a
              href={`https://wa.me/${business.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('আসসালামু আলাইকুম। আমি পানির ট্যাংক বা পাইপলাইন পরিষ্কার সার্ভিসের কোটেশন জানতে চাই।')}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick({ source: 'faq_banner_whatsapp' })}
              className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#25D366] hover:bg-[#20ba5a] rounded-xl shadow-sm"
            >
              <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{lang === 'bn' ? 'WhatsApp-এ কোটেশন নিন' : 'Get WhatsApp Quote'}</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};

export default FaqSection;
