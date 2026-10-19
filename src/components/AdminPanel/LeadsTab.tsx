import React, { useState } from 'react';
import { 
  QuoteLead, 
  LeadStatus, 
  LeadPriority 
} from '../../types';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Phone, 
  MessageCircle, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet,
  AlertTriangle,
  Flame,
  ArrowRight,
  Trash2
} from 'lucide-react';
import { formatWhatsAppUrl, generateAbandonedLeadRecoveryWhatsAppUrl } from '../../utils/whatsapp';

interface LeadsTabProps {
  leads: QuoteLead[];
  onSelectLead: (lead: QuoteLead) => void;
  onUpdateStatus: (id: string, status: LeadStatus) => void;
  onOpenExportModal: () => void;
  onDeleteLead?: (id: string) => void;
}

export const LeadsTab: React.FC<LeadsTabProps> = ({
  leads,
  onSelectLead,
  onUpdateStatus,
  onOpenExportModal,
  onDeleteLead
}) => {
  const [leadToDelete, setLeadToDelete] = useState<QuoteLead | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [activeQuickTab, setActiveQuickTab] = useState<'all' | 'incomplete' | 'confirmed' | 'new'>('all');

  const incompleteCount = leads.filter(l => 
    l.isAbandoned || 
    l.status === 'Incomplete' || 
    l.status === 'incomplete' || 
    l.status === 'Abandoned' || 
    l.status === 'abandoned'
  ).length;

  const newCount = leads.filter(l => l.status === 'New' || l.status === 'new').length;
  const confirmedCount = leads.filter(l => l.status === 'Confirmed' || l.status === 'confirmed' || l.status === 'Booked').length;

  const filteredLeads = leads.filter(lead => {
    const isLeadIncomplete = 
      lead.isAbandoned || 
      lead.status === 'Incomplete' || 
      lead.status === 'incomplete' || 
      lead.status === 'Abandoned' || 
      lead.status === 'abandoned';

    // Quick Tab filter
    if (activeQuickTab === 'incomplete' && !isLeadIncomplete) return false;
    if (activeQuickTab === 'new' && lead.status !== 'New' && lead.status !== 'new') return false;
    if (activeQuickTab === 'confirmed' && lead.status !== 'Confirmed' && lead.status !== 'confirmed' && lead.status !== 'Booked') return false;

    // Search term
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm) ||
      (lead.leadNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.area || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.lastActiveStepName || '').toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    let matchesStatus = true;
    if (statusFilter === 'incomplete') {
      matchesStatus = isLeadIncomplete;
    } else if (statusFilter !== 'all') {
      matchesStatus = lead.status === statusFilter;
    }

    // Priority filter
    const matchesPriority = priorityFilter === 'all' || (lead.priority || 'medium') === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusBadge = (lead: QuoteLead) => {
    const isLeadIncomplete = 
      lead.isAbandoned || 
      lead.status === 'Incomplete' || 
      lead.status === 'incomplete' || 
      lead.status === 'Abandoned' || 
      lead.status === 'abandoned';

    if (isLeadIncomplete) {
      return (
        <span className="px-2.5 py-1 text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full flex items-center gap-1 w-max">
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          <span>Incomplete ({lead.lastActiveStepName || `Step ${lead.completionStep || 1}`})</span>
        </span>
      );
    }

    switch (lead.status) {
      case 'new':
      case 'New':
        return <span className="px-2.5 py-0.5 text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full">New</span>;
      case 'contacted':
      case 'Contacted':
        return <span className="px-2.5 py-0.5 text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full">Contacted</span>;
      case 'quoted':
      case 'Quoted':
        return <span className="px-2.5 py-0.5 text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-full">Quoted</span>;
      case 'confirmed':
      case 'Confirmed':
      case 'Booked':
        return <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">Confirmed</span>;
      case 'completed':
      case 'Completed':
        return <span className="px-2.5 py-0.5 text-xs font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-full">Completed</span>;
      case 'cancelled':
      case 'Cancelled':
        return <span className="px-2.5 py-0.5 text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full">Cancelled</span>;
      case 'lost':
      case 'Lost':
        return <span className="px-2.5 py-0.5 text-xs font-semibold bg-zinc-500/20 text-zinc-400 border border-zinc-500/30 rounded-full">Lost</span>;
      default:
        return <span className="px-2.5 py-0.5 text-xs font-semibold bg-slate-500/20 text-slate-400 rounded-full">{lead.status}</span>;
    }
  };

  const getPriorityBadge = (priority: LeadPriority) => {
    switch (priority) {
      case 'urgent':
        return <span className="px-2 py-0.5 text-xs font-medium bg-red-950/60 text-red-300 border border-red-800/60 rounded">Urgent</span>;
      case 'high':
        return <span className="px-2 py-0.5 text-xs font-medium bg-orange-950/60 text-orange-300 border border-orange-800/60 rounded">High</span>;
      case 'medium':
        return <span className="px-2 py-0.5 text-xs font-medium bg-blue-950/60 text-blue-300 border border-blue-800/60 rounded">Medium</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-medium bg-slate-800 text-slate-300 rounded">Standard</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* KPI / Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => {
            setActiveQuickTab('all');
            setStatusFilter('all');
          }}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            activeQuickTab === 'all'
              ? 'bg-blue-950/40 border-blue-500 ring-1 ring-blue-500'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Leads</span>
          <span className="text-xl font-extrabold text-white mt-0.5 block">{leads.length}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveQuickTab('incomplete');
            setStatusFilter('all');
          }}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            activeQuickTab === 'incomplete'
              ? 'bg-amber-950/40 border-amber-500 ring-1 ring-amber-500'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">Incomplete / Abandoned</span>
            <Flame className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <span className="text-xl font-extrabold text-amber-300 mt-0.5 block">{incompleteCount}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveQuickTab('new');
            setStatusFilter('all');
          }}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            activeQuickTab === 'new'
              ? 'bg-blue-950/40 border-blue-500 ring-1 ring-blue-500'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">New Quotes</span>
          <span className="text-xl font-extrabold text-blue-300 mt-0.5 block">{newCount}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveQuickTab('confirmed');
            setStatusFilter('all');
          }}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            activeQuickTab === 'confirmed'
              ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">Confirmed Orders</span>
          <span className="text-xl font-extrabold text-emerald-300 mt-0.5 block">{confirmedCount}</span>
        </button>
      </div>

      {/* Controls Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, phone, lead ID, area, step..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="incomplete">Incomplete / Abandoned Leads</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="quoted">Quoted</option>
            <option value="confirmed">Confirmed</option>
            <option value="Booked">Booked</option>
            <option value="Follow-up">Follow-up</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="lost">Lost</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Standard</option>
          </select>

          <button
            onClick={onOpenExportModal}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Lead #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Service Details</th>
                <th className="py-3 px-4">Area / Location</th>
                <th className="py-3 px-4">Est. Price</th>
                <th className="py-3 px-4">Status &amp; Stage</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4 text-right">Quick Recovery Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500 text-sm">
                    No leads found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const isIncomplete = 
                    lead.isAbandoned || 
                    lead.status === 'Incomplete' || 
                    lead.status === 'incomplete' || 
                    lead.status === 'Abandoned' || 
                    lead.status === 'abandoned';

                  return (
                    <tr 
                      key={lead.id} 
                      className={`hover:bg-slate-800/50 transition-colors ${
                        isIncomplete ? 'bg-amber-950/10' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-medium text-blue-400">
                        {lead.leadNumber || lead.id}
                        {isIncomplete && (
                          <span className="block text-[10px] text-amber-400 font-sans font-normal">
                            Drop-off Recovery
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          <span>{lead.name}</span>
                          {isIncomplete && (
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
                          )}
                        </div>
                        <div className="text-slate-400 text-[11px] flex items-center gap-2 mt-0.5">
                          <a 
                            href={`tel:${lead.phone}`} 
                            className="hover:text-blue-400 text-cyan-400 font-mono"
                            title="Call customer directly"
                          >
                            {lead.phone}
                          </a>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-200">{lead.serviceType || 'Water Tank Cleaning'}</div>
                        <div className="text-[11px] text-slate-400">
                          {lead.tankType || 'Tank not selected yet'} 
                          {lead.tankCapacity ? ` • ${lead.tankCapacity}` : ''}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <div>{lead.area || 'Dhaka'}</div>
                        {lead.address && (
                          <div className="text-[10px] text-slate-500 truncate max-w-[140px]">
                            {lead.address}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-emerald-400">
                        {lead.calculatedEstimate ? `৳${lead.calculatedEstimate.toLocaleString()}` : 'Custom / TBD'}
                      </td>
                      <td className="py-3.5 px-4">
                        {getStatusBadge(lead)}
                      </td>
                      <td className="py-3.5 px-4">{getPriorityBadge(lead.priority || 'medium')}</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Direct WhatsApp Action: customized for incomplete recovery */}
                          <a
                            href={isIncomplete 
                              ? generateAbandonedLeadRecoveryWhatsAppUrl(lead) 
                              : formatWhatsAppUrl(lead)
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`p-1.5 rounded border transition-colors flex items-center gap-1 text-[11px] font-semibold ${
                              isIncomplete
                                ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40 px-2'
                                : 'bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-400 border-emerald-800/40'
                            }`}
                            title={isIncomplete ? 'Send Drop-off Recovery Message on WhatsApp' : 'Chat on WhatsApp'}
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            {isIncomplete && <span>Recover</span>}
                          </a>

                          {/* Direct Call Button */}
                          <a
                            href={`tel:${lead.phone}`}
                            className="p-1.5 bg-blue-950/60 hover:bg-blue-900/60 text-blue-400 rounded border border-blue-800/40"
                            title="Call Customer"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>

                          {/* View Full Detail Modal */}
                          <button
                            type="button"
                            onClick={() => onSelectLead(lead)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 cursor-pointer"
                            title="View Details & Notes"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Delete Lead Button */}
                          {onDeleteLead && (
                            <button
                              type="button"
                              onClick={() => setLeadToDelete(lead)}
                              className="p-1.5 bg-rose-950/60 hover:bg-rose-900/60 text-rose-400 rounded border border-rose-800/40 cursor-pointer transition-colors"
                              title="Delete Lead"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* In-App Delete Confirmation Modal */}
      {leadToDelete && onDeleteLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-white">Delete Lead?</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Are you sure you want to delete lead <span className="text-white font-semibold">{leadToDelete.leadNumber || leadToDelete.id}</span> ({leadToDelete.name || 'Anonymous'})? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setLeadToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteLead(leadToDelete.id);
                  setLeadToDelete(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-lg shadow-rose-900/30 cursor-pointer"
              >
                Yes, Delete Lead
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsTab;
