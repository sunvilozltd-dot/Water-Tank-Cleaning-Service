import React, { useState } from 'react';
import { QuoteLead } from '../../types';
import { X, Download, FileSpreadsheet, Check } from 'lucide-react';
import { exportLeadsToCsv } from '../../services/leadService';

interface ExportCsvModalProps {
  leads: QuoteLead[];
  onClose: () => void;
}

export const ExportCsvModal: React.FC<ExportCsvModalProps> = ({ leads, onClose }) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const handleExport = () => {
    let filtered = [...leads];

    if (filterStatus !== 'all') {
      filtered = filtered.filter(l => l.status === filterStatus);
    }
    if (startDate) {
      filtered = filtered.filter(l => new Date(l.createdAt) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter(l => new Date(l.createdAt) <= new Date(endDate + 'T23:59:59'));
    }

    exportLeadsToCsv(filtered);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Export Leads to CSV</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Status Filter</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
            >
              <option value="all">All Statuses ({leads.length} leads)</option>
              <option value="new">New Only</option>
              <option value="contacted">Contacted Only</option>
              <option value="quoted">Quoted Only</option>
              <option value="confirmed">Confirmed Only</option>
              <option value="completed">Completed Only</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">From Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">To Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
              />
            </div>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
};
