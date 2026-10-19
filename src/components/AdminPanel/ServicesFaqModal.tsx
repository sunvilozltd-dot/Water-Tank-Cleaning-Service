import React, { useState } from 'react';
import { ServiceFaqItem } from '../../utils/servicesFaqStore';
import { X, Save, HelpCircle, AlertCircle, Droplets, Wrench } from 'lucide-react';

interface ServicesFaqModalProps {
  faq: ServiceFaqItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<ServiceFaqItem, 'id'>, id?: string) => void;
}

export const ServicesFaqModal: React.FC<ServicesFaqModalProps> = ({
  faq,
  isOpen,
  onClose,
  onSave
}) => {
  const [category, setCategory] = useState<'water-tank-cleaning' | 'pipeline-cleaning'>(
    faq?.category || 'water-tank-cleaning'
  );
  const [questionBn, setQuestionBn] = useState(faq?.questionBn || '');
  const [questionEn, setQuestionEn] = useState(faq?.questionEn || '');
  const [answerBn, setAnswerBn] = useState(faq?.answerBn || '');
  const [answerEn, setAnswerEn] = useState(faq?.answerEn || '');
  const [order, setOrder] = useState<number>(faq?.order || 1);
  const [isActive, setIsActive] = useState<boolean>(faq?.isActive !== undefined ? faq.isActive : true);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionBn.trim()) {
      setError('অনুগ্রহ করে বাংলায় প্রশ্নটি লিখুন (Question in Bengali is required).');
      return;
    }
    if (!answerBn.trim()) {
      setError('অনুগ্রহ করে বাংলায় উত্তরটি লিখুন (Answer in Bengali is required).');
      return;
    }

    const categoryTitleBn = category === 'water-tank-cleaning' ? 'পানির ট্যাংক পরিষ্কার' : 'পাইপলাইন পরিষ্কার';
    const categoryTitleEn = category === 'water-tank-cleaning' ? 'Water Tank Cleaning' : 'Pipeline Cleaning';

    onSave({
      category,
      categoryTitleBn,
      categoryTitleEn,
      questionBn: questionBn.trim(),
      questionEn: questionEn.trim() || questionBn.trim(),
      answerBn: answerBn.trim(),
      answerEn: answerEn.trim() || answerBn.trim(),
      order: Number(order) || 1,
      isActive
    }, faq?.id);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {faq ? 'প্রশ্ন ও উত্তর সম্পাদনা করুন (Edit FAQ)' : 'নতুন প্রশ্ন ও উত্তর যোগ করুন (Add New FAQ)'}
              </h2>
              <p className="text-xs text-slate-400">
                পানির ট্যাংক পরিষ্কার ও পাইপলাইন পরিষ্কারের প্রশ্নোত্তর কাস্টমাইজেশন
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-950/50 border border-rose-800/80 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Service Category Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              সার্ভিস ক্যাটাগরি নির্বাচন করুন (Service Category) <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCategory('water-tank-cleaning')}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                  category === 'water-tank-cleaning'
                    ? 'bg-cyan-950/50 border-cyan-500 text-cyan-200 ring-1 ring-cyan-500'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Droplets className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-xs font-bold">পানির ট্যাংক পরিষ্কার</div>
                  <div className="text-[10px] opacity-75">Water Tank Cleaning</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setCategory('pipeline-cleaning')}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                  category === 'pipeline-cleaning'
                    ? 'bg-blue-950/50 border-blue-500 text-blue-200 ring-1 ring-blue-500'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Wrench className="w-4 h-4 text-blue-400" />
                <div>
                  <div className="text-xs font-bold">পাইপলাইন পরিষ্কার</div>
                  <div className="text-[10px] opacity-75">Pipeline Cleaning</div>
                </div>
              </button>
            </div>
          </div>

          {/* Bengali Question */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              প্রশ্ন (বাংলায়) <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={questionBn}
              onChange={(e) => setQuestionBn(e.target.value)}
              placeholder="যেমন: পানির ট্যাংক কত দিন পরপর পরিষ্কার করা উচিত?"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Bengali Answer */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              উত্তর (বাংলায়) <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={answerBn}
              onChange={(e) => setAnswerBn(e.target.value)}
              placeholder="বিস্তারিত উত্তর লিখুন..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* English Question & Answer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Question (English - Optional)
              </label>
              <input
                type="text"
                value={questionEn}
                onChange={(e) => setQuestionEn(e.target.value)}
                placeholder="e.g. How often should tanks be cleaned?"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Answer (English - Optional)
              </label>
              <textarea
                rows={3}
                value={answerEn}
                onChange={(e) => setAnswerEn(e.target.value)}
                placeholder="Detailed English answer..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Controls: Order & Active Status */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-400">সিরিয়াল বা ক্রম (Order):</label>
              <input
                type="number"
                min="1"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                className="w-20 px-2.5 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 text-center font-mono"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-slate-950 border-slate-700"
              />
              <span className="text-xs font-semibold text-slate-300">প্রকাশিত (Show on Website)</span>
            </label>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              বাতিল (Cancel)
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all flex items-center gap-1.5 shadow-lg shadow-blue-600/30 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{faq ? 'পরিবর্তন সংরক্ষণ করুন' : 'সংরক্ষণ করুন (Save)'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
