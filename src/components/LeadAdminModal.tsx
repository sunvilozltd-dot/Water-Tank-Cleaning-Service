import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Trash2, 
  Phone, 
  CheckCircle, 
  Clock, 
  Search, 
  ExternalLink,
  MessageCircle,
  Plus,
  Edit2,
  Sparkles,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import { QuoteLead, ServiceItem } from '../types';
import { getStoredLeads, updateLeadStatus, exportLeadsToCsv } from '../utils/storage';
import { useServices } from '../utils/servicesStore';

interface LeadAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToService?: (slug: string) => void;
}

const PRESET_IMAGES = [
  { label: 'PVC Rooftop Tank', url: 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=800&q=75' },
  { label: 'RCC Underground Reserve', url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=75' },
  { label: 'Hygienic Clean Interior', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=75' }
];

export const LeadAdminModal: React.FC<LeadAdminModalProps> = ({ 
  isOpen, 
  onClose,
  onNavigateToService
}) => {
  const [activeTab, setActiveTab] = useState<'leads' | 'services'>('leads');
  const [leads, setLeads] = useState<QuoteLead[]>([]);
  const [filterText, setFilterText] = useState('');
  const { services, addNewService, updateService, deleteService, resetServicesToDefault } = useServices();
  const [isEditingService, setIsEditingService] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  const [serviceForm, setServiceForm] = useState({
    title: '',
    titleBn: '',
    slug: '',
    shortDesc: '',
    shortDescBn: '',
    fullDesc: '',
    startingPrice: 'Starting From ৳ 1,500',
    startingPriceBn: 'শুরু ৳ ১,৫০০ থেকে',
    image: PRESET_IMAGES[0].url,
    videoUrl: 'https://www.youtube-nocookie.com/embed/ScMzIvxBSi4?rel=0',
    benefits: 'রোটারি জেট ওয়াশ, ফুড-গ্রেড স্যানিটাইজার, দ্রুত সার্ভিস',
    isPrimary: false
  });

  const [confirmDialog, setConfirmDialog] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLeads(getStoredLeads());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStatusChange = (id: string, newStatus: QuoteLead['status']) => {
    updateLeadStatus(id, newStatus);
    setLeads(getStoredLeads());
  };

  const handleDownloadCsv = () => {
    const csv = exportLeadsToCsv();
    if (!csv) return;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sunviloz_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearAllLeads = () => {
    setConfirmDialog({
      title: 'Clear All Leads History?',
      message: 'Are you sure you want to permanently clear stored lead history? This cannot be undone.',
      onConfirm: () => {
        localStorage.removeItem('sunviloz_quote_leads_v1');
        setLeads([]);
        setConfirmDialog(null);
      }
    });
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceForm.title.trim()) {
      setFormError('Please provide a service title');
      return;
    }
    setFormError(null);

    const benefitsArray = serviceForm.benefits
      .split(',')
      .map(b => b.trim())
      .filter(Boolean);

    if (editingServiceId) {
      updateService(editingServiceId, {
        title: serviceForm.title,
        titleBn: serviceForm.titleBn || serviceForm.title,
        slug: serviceForm.slug,
        shortDesc: serviceForm.shortDesc,
        shortDescBn: serviceForm.shortDescBn || serviceForm.shortDesc,
        fullDesc: serviceForm.fullDesc || serviceForm.shortDesc,
        startingPrice: serviceForm.startingPrice,
        startingPriceBn: serviceForm.startingPriceBn,
        image: serviceForm.image,
        videoUrl: serviceForm.videoUrl,
        benefits: benefitsArray,
        isPrimary: serviceForm.isPrimary
      });
    } else {
      addNewService({
        title: serviceForm.title,
        titleBn: serviceForm.titleBn || serviceForm.title,
        slug: serviceForm.slug,
        shortDesc: serviceForm.shortDesc || 'Professional Water Tank Cleaning Service in Dhaka and regional areas.',
        shortDescBn: serviceForm.shortDescBn || serviceForm.titleBn,
        fullDesc: serviceForm.fullDesc || serviceForm.shortDesc,
        iconName: 'Droplets',
        startingPrice: serviceForm.startingPrice,
        startingPriceBn: serviceForm.startingPriceBn,
        isPrimary: serviceForm.isPrimary,
        image: serviceForm.image,
        videoUrl: serviceForm.videoUrl,
        videoTitle: `${serviceForm.title} Demonstration Video`,
        videoTitleBn: `${serviceForm.titleBn || serviceForm.title} কাজের সরাসরি ভিডিও`,
        benefits: benefitsArray,
        process: [
          'গ্রাহকের সাথে তথ্য যাচাই ও পরিদর্শন',
          'সাবমারসিবল পাম্পে পানি নিষ্কাশন',
          '১৫০ বার রোটারি জেটে পরিষ্কার',
          'ফুড-গ্রেড জীবাণুমুক্তকরণ'
        ],
        idealFor: ['আবাসিক বাড়ি', 'ফ্ল্যাট ভবন', 'বাণিজ্যিক প্রতিষ্ঠান']
      });
    }

    setIsEditingService(false);
    setEditingServiceId(null);
  };

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(filterText.toLowerCase()) ||
    l.phone.includes(filterText) ||
    l.area.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn" role="dialog" aria-modal="true" aria-labelledby="lead-admin-title">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold" aria-hidden="true">
              S
            </div>
            <div>
              <h2 id="lead-admin-title" className="text-base sm:text-lg font-black text-white">
                Sunviloz Clean Care • Business Admin Panel
              </h2>
              <p className="text-xs text-slate-400">
                Manage quotation leads and customize services in real-time
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-cyan-400"
            aria-label="Close Admin Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 px-6 py-2 border-b border-slate-200 flex items-center justify-between" role="tablist">
          <div className="flex gap-2">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'leads'}
              onClick={() => { setActiveTab('leads'); setIsEditingService(false); }}
              className={`min-h-[40px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'leads'
                  ? 'bg-white text-[#0B2B5C] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>কোটেশন লিডসমূহ (Leads)</span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 text-[11px]">
                {leads.length}
              </span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'services'}
              onClick={() => setActiveTab('services')}
              className={`min-h-[40px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'services'
                  ? 'bg-white text-[#0B2B5C] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>সার্ভিস কাস্টমাইজেশন (Manage Services)</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px]">
                {services.length}
              </span>
            </button>
          </div>
        </div>

        {/* Tab 1: Leads View */}
        {activeTab === 'leads' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  placeholder="নাম, ফোন বা এলাকা খুঁজুন..."
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-cyan-500 bg-white"
                  aria-label="Filter leads"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleDownloadCsv}
                  disabled={leads.length === 0}
                  className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearAllLeads}
                  disabled={leads.length === 0}
                  className="min-h-[40px] px-3.5 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
              {filteredLeads.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="font-semibold text-sm">কোনো কোটেশন লিড পাওয়া যায়নি</p>
                  <p className="text-xs">গ্রাহক ওয়েবসাইটে ফর্ম পূরণ করলে তা এখানে দেখা যাবে।</p>
                </div>
              ) : (
                filteredLeads.map((lead) => (
                  <div 
                    key={lead.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-cyan-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-[#0B2B5C]">{lead.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          lead.status === 'New' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                          lead.status === 'Contacted' ? 'bg-blue-100 text-blue-900' :
                          lead.status === 'Confirmed' ? 'bg-purple-100 text-purple-900' :
                          lead.status === 'Completed' ? 'bg-emerald-100 text-emerald-900' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {lead.status}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(lead.createdAt).toLocaleDateString()} {new Date(lead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span>ফোন: <strong>{lead.phone}</strong></span>
                        <span>এলাকা: {lead.area}</span>
                        <span>ট্যাংক: {lead.tankType}</span>
                        <span>ধারণক্ষমতা: {lead.tankCapacity || (lead.floors ? `${lead.floors} তলা, ${lead.flats} ফ্ল্যাট` : 'N/A')}</span>
                      </div>

                      {(lead.notes || lead.serviceType) && (
                        <p className="text-xs text-slate-500 italic mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          {lead.serviceType ? `সার্ভিস: ${lead.serviceType} • ` : ''}
                          {lead.notes || ''}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value as any)}
                        className="text-xs font-semibold py-1.5 px-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:border-cyan-500 cursor-pointer min-h-[36px]"
                        aria-label="Update lead status"
                      >
                        <option value="New">New (নতুন)</option>
                        <option value="Contacted">Contacted (যোগাযোগকৃত)</option>
                        <option value="Booked">Booked (বুকড)</option>
                        <option value="Completed">Completed (সম্পন্ন)</option>
                      </select>
                      <a
                        href={`tel:${lead.phone}`}
                        className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        title="Call Customer"
                      >
                        <Phone className="w-4 h-4 text-emerald-600" />
                      </a>
                      <a
                        href={`https://wa.me/88${lead.phone.replace(/[^0-9]/g, '').slice(-11)}?text=Hello%20${encodeURIComponent(lead.name)},%20thank%20you%20for%20contacting%20Sunviloz%20Clean%20Care.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Services View */}
        {activeTab === 'services' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    ওয়েবসাইটের সার্ভিস তালিকা ({services.length} টি)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={resetServicesToDefault}
                  className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Defaults</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((srv) => (
                  <div 
                    key={srv.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-cyan-300 transition-all flex flex-col justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={srv.image}
                        alt={srv.title}
                        width="64"
                        height="64"
                        className="w-16 h-16 rounded-xl object-cover bg-slate-100 shrink-0"
                        loading="lazy"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-extrabold text-sm text-[#0B2B5C] truncate">
                          {srv.title}
                        </h4>
                        <p className="text-xs text-slate-600 font-medium">
                          {srv.titleBn}
                        </p>
                        <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                          <span>/{srv.slug}</span>
                          <span>•</span>
                          <span className="font-bold text-emerald-700">{srv.startingPrice}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          if (onNavigateToService) {
                            onNavigateToService(srv.slug);
                            onClose();
                          }
                        }}
                        className="text-xs font-bold text-cyan-700 hover:text-cyan-900 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>সার্ভিস পেজ দেখুন</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
