import React, { useState } from 'react';
import { 
  useServicesFaqs, 
  ServiceFaqItem 
} from '../../utils/servicesFaqStore';
import { 
  HelpCircle, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Droplets, 
  Wrench, 
  RotateCcw, 
  CheckCircle2, 
  Eye, 
  EyeOff,
  AlertTriangle
} from 'lucide-react';
import { ServicesFaqModal } from './ServicesFaqModal';

export const ServicesFaqTab: React.FC = () => {
  const { 
    faqs, 
    tankFaqs, 
    pipelineFaqs, 
    addServiceFaq, 
    updateServiceFaq, 
    deleteServiceFaq, 
    resetServicesFaqsToDefault 
  } = useServicesFaqs();

  const [filterCategory, setFilterCategory] = useState<'all' | 'water-tank-cleaning' | 'pipeline-cleaning'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<ServiceFaqItem | null>(null);
  const [faqToDelete, setFaqToDelete] = useState<ServiceFaqItem | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenAddModal = () => {
    setEditingFaq(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (faq: ServiceFaqItem) => {
    setEditingFaq(faq);
    setIsModalOpen(true);
  };

  const handleSaveFaq = (data: Omit<ServiceFaqItem, 'id'>, id?: string) => {
    if (id) {
      updateServiceFaq(id, data);
      showToast('প্রশ্নোত্তর সফলভাবে আপডেট করা হয়েছে।');
    } else {
      addServiceFaq(data);
      showToast('নতুন প্রশ্নোত্তর সফলভাবে যোগ করা হয়েছে।');
    }
  };

  const handleConfirmDelete = () => {
    if (faqToDelete) {
      deleteServiceFaq(faqToDelete.id);
      setFaqToDelete(null);
      showToast('প্রশ্নোত্তর মুছে ফেলা হয়েছে।');
    }
  };

  const handleResetDefaults = () => {
    resetServicesFaqsToDefault();
    setShowResetConfirm(false);
    showToast('সকল প্রশ্নোত্তর ডিফল্ট অবস্থায় ফিরিয়ে আনা হয়েছে।');
  };

  const handleToggleActive = (faq: ServiceFaqItem) => {
    updateServiceFaq(faq.id, { isActive: !faq.isActive });
    showToast(faq.isActive ? 'প্রশ্নটি অপ্রকাশিত করা হয়েছে।' : 'প্রশ্নটি ওয়েবসাইটে প্রকাশিত হয়েছে।');
  };

  const filteredFaqs = faqs
    .filter(faq => {
      if (filterCategory !== 'all' && faq.category !== filterCategory) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        faq.questionBn.toLowerCase().includes(q) ||
        faq.questionEn.toLowerCase().includes(q) ||
        faq.answerBn.toLowerCase().includes(q) ||
        faq.answerEn.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner / Description */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white">
              সার্ভিস প্রশ্নোত্তর ব্যবস্থাপনা (FAQ Management)
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            এখানে শুধুমাত্র <span className="text-cyan-400 font-semibold">পানির ট্যাংক পরিষ্কার</span> ও <span className="text-blue-400 font-semibold">পাইপলাইন পরিষ্কার</span> সার্ভিসের প্রশ্নোত্তর সাজানো হয়েছে। এডমিন যেকোনো প্রশ্ন ও উত্তর সহজেই পরিবর্তন, পরিমার্জন বা নতুন প্রশ্ন যোগ করতে পারবেন।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            title="Restore original default questions"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ডিফল্ট রিস্টোর</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন প্রশ্ন যোগ করুন</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-2xl">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilterCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterCategory === 'all'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white bg-slate-800/60'
            }`}
          >
            সকল ({faqs.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterCategory('water-tank-cleaning')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterCategory === 'water-tank-cleaning'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-white bg-slate-800/60'
            }`}
          >
            <Droplets className="w-3 h-3 text-cyan-300" />
            <span>পানির ট্যাংক পরিষ্কার ({tankFaqs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterCategory('pipeline-cleaning')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterCategory === 'pipeline-cleaning'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white bg-slate-800/60'
            }`}
          >
            <Wrench className="w-3 h-3 text-blue-300" />
            <span>পাইপলাইন পরিষ্কার ({pipelineFaqs.length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="প্রশ্ন বা উত্তর খুঁজুন..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* FAQs Cards List */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl">
            <HelpCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">কোনো প্রশ্নোত্তর পাওয়া যায়নি</p>
            <p className="text-xs text-slate-400 mt-1">
              নতুন প্রশ্ন যোগ করতে উপরের &quot;নতুন প্রশ্ন যোগ করুন&quot; বাটনে চাপ দিন।
            </p>
          </div>
        ) : (
          filteredFaqs.map((faq, index) => {
            const isTank = faq.category === 'water-tank-cleaning';

            return (
              <div
                key={faq.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  faq.isActive !== false
                    ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-950/50 border-slate-800/50 opacity-60'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  
                  {/* Left Content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        isTank
                          ? 'bg-cyan-950/60 text-cyan-300 border-cyan-800/50'
                          : 'bg-blue-950/60 text-blue-300 border-blue-800/50'
                      }`}>
                        {isTank ? <Droplets className="w-3 h-3" /> : <Wrench className="w-3 h-3" />}
                        <span>{isTank ? 'পানির ট্যাংক পরিষ্কার' : 'পাইপলাইন পরিষ্কার'}</span>
                      </span>

                      <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        ক্রম: {faq.order || index + 1}
                      </span>

                      {!faq.isActive && (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                          লুকানো (Hidden)
                        </span>
                      )}
                    </div>

                    {/* Bengali Question & Answer */}
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                        {faq.questionBn}
                      </h3>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
                        {faq.answerBn}
                      </p>
                    </div>

                    {/* English Preview (if exists) */}
                    {(faq.questionEn || faq.answerEn) && (
                      <div className="text-[11px] text-slate-400 pt-1">
                        <span className="font-semibold text-slate-500">English: </span>
                        <span>{faq.questionEn} — </span>
                        <span className="italic">{faq.answerEn}</span>
                      </div>
                    )}
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center md:flex-col justify-end gap-1.5 flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                    {/* Toggle Active Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(faq)}
                      className={`p-2 rounded-xl border transition-colors ${
                        faq.isActive !== false
                          ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800/50 hover:bg-emerald-900/50'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                      }`}
                      title={faq.isActive !== false ? 'Hide from Website' : 'Show on Website'}
                    >
                      {faq.isActive !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(faq)}
                      className="p-2 bg-blue-950/50 hover:bg-blue-900/50 text-blue-400 rounded-xl border border-blue-800/50 transition-colors cursor-pointer"
                      title="Edit Question & Answer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => setFaqToDelete(faq)}
                      className="p-2 bg-rose-950/50 hover:bg-rose-900/50 text-rose-400 rounded-xl border border-rose-800/50 transition-colors cursor-pointer"
                      title="Delete Question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit / Add Modal */}
      {isModalOpen && (
        <ServicesFaqModal
          faq={editingFaq}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingFaq(null);
          }}
          onSave={handleSaveFaq}
        />
      )}

      {/* Delete Confirmation Modal (In-App, safe in iframe) */}
      {faqToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-white">প্রশ্নটি মুছে ফেলতে চান?</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  আপনি কি নিশ্চিত যে <span className="text-white font-semibold">&quot;{faqToDelete.questionBn}&quot;</span> মুছে ফেলতে চান?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setFaqToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                না, বাতিল
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-lg shadow-rose-900/30 cursor-pointer"
              >
                হ্যাঁ, মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset to Defaults Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-white">ডিফল্ট প্রশ্নাবলি রিস্টোর করবেন?</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  এটি পানির ট্যাংক ও পাইপলাইন পরিষ্কারের সকল প্রশ্নোত্তর ডিফল্ট ভেরিফাইড তথ্যে ফিরিয়ে নিয়ে আসবে।
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 transition-colors shadow-lg shadow-amber-900/30 cursor-pointer"
              >
                হ্যাঁ, রিস্টোর করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesFaqTab;
