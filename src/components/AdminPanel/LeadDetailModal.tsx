import React, { useState } from 'react';
import { QuoteLead, LeadStatus, LeadPriority } from '../../types';
import { 
  X, 
  Phone, 
  MessageCircle, 
  Calendar, 
  Clock, 
  MapPin, 
  Shield, 
  Save, 
  FileText,
  User,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { formatWhatsAppUrl } from '../../utils/whatsapp';

interface LeadDetailModalProps {
  lead: QuoteLead | null;
  onClose: () => void;
  onSave: (updatedLead: QuoteLead) => void;
  onDelete?: (id: string) => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  lead,
  onClose,
  onSave,
  onDelete
}) => {
  if (!lead) return null;

  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [priority, setPriority] = useState<LeadPriority>(lead.priority || 'medium');
  const [notes, setNotes] = useState(lead.adminNotes || '');
  const [quotedAmount, setQuotedAmount] = useState<number | undefined>(lead.quotedAmount || lead.calculatedEstimate);
  const [scheduledDate, setScheduledDate] = useState(lead.scheduledDate || '');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = () => {
    onSave({
      ...lead,
      status,
      priority,
      adminNotes: notes,
      quotedAmount: quotedAmount ? Number(quotedAmount) : undefined,
      scheduledDate
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-white">Lead Details</h2>
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
                {lead.leadNumber}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Created on {new Date(lead.createdAt).toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <span className="text-[11px] text-slate-400 block">Customer Name</span>
              <span className="text-sm font-semibold text-white">{lead.name}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Phone</span>
              <a href={`tel:${lead.phone}`} className="text-sm font-semibold text-blue-400 hover:underline">
                {lead.phone}
              </a>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Location / Area</span>
              <span className="text-sm text-slate-200">{lead.area}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Full Address</span>
              <span className="text-xs text-slate-300">{lead.address || 'Not specified'}</span>
            </div>
          </div>

          {(lead.isAbandoned || lead.status === 'Incomplete' || lead.status === 'incomplete') && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-amber-300 block">
                  ⚠️ Incomplete Order / Abandoned Lead: {lead.lastActiveStepName || `Step ${lead.completionStep || 1}`}
                </span>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  The customer captured their name &amp; phone at Step 1 and exited before final confirmation. Reach out to convert!
                </p>
              </div>
              <a
                href={`https://wa.me/${lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`আসসালামু আলাইকুম ${lead.name || 'গ্রাহক'} সাহেব, Sunviloz Clean Care থেকে যোগাযোগ করছি। আপনি আমাদের ওয়েবসাইটে ওয়াটার ট্যাংক ক্লিনিং বুকিং শুরু করেছিলেন। আপনাকে কিভাবে সহযোগিতা করতে পারি?`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-[#28C76F] hover:bg-[#22aa5e] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 shrink-0 shadow-md"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Recover via WhatsApp</span>
              </a>
            </div>
          )}

          {/* Service Specs */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Service Requirements</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block">Service</span>
                <span className="font-medium text-white">{lead.serviceType}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block">Tank Type</span>
                <span className="font-medium text-white">{lead.tankType}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block">Capacity</span>
                <span className="font-medium text-white">{lead.tankCapacity}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block">Quantity</span>
                <span className="font-medium text-white">{lead.numberOfTanks} tank(s)</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block">Calculated System Est.</span>
                <span className="font-bold text-emerald-400 font-mono">
                  {lead.calculatedEstimate ? `৳${lead.calculatedEstimate.toLocaleString()}` : 'Custom'}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block">Preferred Schedule</span>
                <span className="font-medium text-white">{lead.preferredDate || 'Earliest available'}</span>
              </div>
            </div>
          </div>

          {/* Custom Service Booking Form Answers */}
          {lead.customAnswers && Object.keys(lead.customAnswers).length > 0 && (
            <div className="space-y-3 p-4 bg-blue-950/20 border border-blue-800/40 rounded-xl">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  {lead.customFormTitle ? `${lead.customFormTitle} — সার্ভিসের স্পেসিফিক তথ্য` : 'কাস্টম বুকিং ফরমের উত্তর (Custom Form Answers)'}
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {Object.entries(lead.customAnswers).map(([k, v]) => (
                  <div key={k} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">{k}</span>
                    <span className="font-semibold text-white mt-0.5 block">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lead Details Message */}
          {lead.message && (
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <span className="text-[11px] text-slate-400 font-semibold block mb-1">গ্রাহকের রিকোয়েস্ট মেসেজ / বিবরণ:</span>
              <p className="text-slate-200 whitespace-pre-line leading-relaxed">{lead.message}</p>
            </div>
          )}

          {/* Marketing Campaign Attribution */}
          {(lead.source || lead.utm_source || lead.utm_campaign) && (
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
              <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">
                Marketing Source & Attribution:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Source / Channel</span>
                  <span className="font-semibold text-white">{lead.utm_source || lead.source || 'Direct Website'}</span>
                </div>
                {lead.utm_medium && (
                  <div>
                    <span className="text-slate-400 block">Medium</span>
                    <span className="font-semibold text-white">{lead.utm_medium}</span>
                  </div>
                )}
                {lead.utm_campaign && (
                  <div>
                    <span className="text-slate-400 block">Campaign</span>
                    <span className="font-semibold text-emerald-400">{lead.utm_campaign}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex gap-2">
            <a
              href={`tel:${lead.phone}`}
              className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Customer</span>
            </a>
            <a
              href={formatWhatsAppUrl(lead)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Message on WhatsApp</span>
            </a>
          </div>

          {/* Status & Priority Editor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as LeadStatus)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Incomplete">Incomplete (Drop-off Lead)</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="quoted">Quoted</option>
                <option value="Follow-up">Follow-up</option>
                <option value="confirmed">Confirmed</option>
                <option value="Booked">Booked</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="lost">Lost</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as LeadPriority)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="low">Standard</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Final Quoted Amount (৳)</label>
              <input
                type="number"
                value={quotedAmount || ''}
                onChange={(e) => setQuotedAmount(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Final price agreed"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Scheduled Work Date</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Admin notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Admin Follow-up Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Customer requested team at 10 AM, 4th floor rooftop tank..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Modal footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          {onDelete ? (
            confirmDelete ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onDelete(lead.id);
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Confirm Delete Lead
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="px-3 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg text-xs font-medium border border-rose-900/40 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Lead</span>
              </button>
            )
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
