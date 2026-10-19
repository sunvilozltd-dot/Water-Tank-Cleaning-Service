import React, { useState } from 'react';
import { 
  X, 
  Save, 
  Plus, 
  Trash2, 
  Edit3, 
  ArrowUp, 
  ArrowDown, 
  RotateCcw, 
  CheckCircle2, 
  Sparkles, 
  Wrench, 
  Eye, 
  Sliders, 
  FileText 
} from 'lucide-react';
import { ServiceItem } from '../../types';
import { CustomFormField, ServiceBookingFormConfig, FieldType } from '../../types/customBookingForm';
import { getServiceBookingForm, DEFAULT_SERVICE_BOOKING_FORMS, createDefaultGenericForm } from '../../data/defaultServiceBookingForms';
import { updateService } from '../../utils/servicesStore';
import { recordAuditLog } from '../../services/auditService';
import { useAdminAuth } from '../../context/AdminAuthContext';

interface ServiceFormBuilderModalProps {
  service: ServiceItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const ServiceFormBuilderModal: React.FC<ServiceFormBuilderModalProps> = ({
  service,
  isOpen,
  onClose,
  onSaved
}) => {
  const { adminUser } = useAdminAuth();

  if (!isOpen || !service) return null;

  const [config, setConfig] = useState<ServiceBookingFormConfig>(() => {
    return getServiceBookingForm(service);
  });

  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [fieldModalData, setFieldModalData] = useState<CustomFormField>({
    id: '',
    name: '',
    labelEn: '',
    labelBn: '',
    type: 'text',
    required: false,
    placeholderEn: '',
    placeholderBn: '',
    options: [],
    optionsBn: []
  });

  const [optionInputEn, setOptionInputEn] = useState('');
  const [optionInputBn, setOptionInputBn] = useState('');
  const [saveSuccessToast, setSaveSuccessToast] = useState<string | null>(null);

  const handleOpenAddField = () => {
    setFieldModalData({
      id: `field_${Date.now()}`,
      name: `field_${Date.now().toString(36)}`,
      labelEn: '',
      labelBn: '',
      type: 'text',
      required: true,
      placeholderEn: '',
      placeholderBn: '',
      options: [],
      optionsBn: []
    });
    setEditingFieldIndex(null);
    setOptionInputEn('');
    setOptionInputBn('');
    setIsFieldModalOpen(true);
  };

  const handleOpenEditField = (index: number) => {
    const f = config.fields[index];
    setFieldModalData({ ...f });
    setEditingFieldIndex(index);
    setOptionInputEn('');
    setOptionInputBn('');
    setIsFieldModalOpen(true);
  };

  const handleSaveFieldModal = () => {
    if (!fieldModalData.labelBn.trim() && !fieldModalData.labelEn.trim()) {
      alert('ফিল্ডের নাম / লেবেল দেওয়া আবশ্যক');
      return;
    }

    const cleanedName = fieldModalData.name.trim() 
      ? fieldModalData.name.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_')
      : `field_${Date.now().toString(36)}`;

    const newField: CustomFormField = {
      ...fieldModalData,
      name: cleanedName,
      labelBn: fieldModalData.labelBn.trim() || fieldModalData.labelEn.trim(),
      labelEn: fieldModalData.labelEn.trim() || fieldModalData.labelBn.trim()
    };

    let updatedFields = [...config.fields];
    if (editingFieldIndex !== null) {
      updatedFields[editingFieldIndex] = newField;
    } else {
      updatedFields.push(newField);
    }

    setConfig(prev => ({ ...prev, fields: updatedFields }));
    setIsFieldModalOpen(false);
  };

  const handleDeleteField = (index: number) => {
    const updated = config.fields.filter((_, i) => i !== index);
    setConfig(prev => ({ ...prev, fields: updated }));
  };

  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= config.fields.length) return;

    const updated = [...config.fields];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    setConfig(prev => ({ ...prev, fields: updated }));
  };

  const handleAddOptionToField = () => {
    if (!optionInputBn.trim() && !optionInputEn.trim()) return;
    const en = optionInputEn.trim() || optionInputBn.trim();
    const bn = optionInputBn.trim() || optionInputEn.trim();

    setFieldModalData(prev => ({
      ...prev,
      options: [...(prev.options || []), en],
      optionsBn: [...(prev.optionsBn || []), bn]
    }));
    setOptionInputEn('');
    setOptionInputBn('');
  };

  const handleRemoveOptionFromField = (optIdx: number) => {
    setFieldModalData(prev => ({
      ...prev,
      options: (prev.options || []).filter((_, i) => i !== optIdx),
      optionsBn: (prev.optionsBn || []).filter((_, i) => i !== optIdx)
    }));
  };

  const handleSave = () => {
    try {
      updateService(service.id, {
        bookingFormConfig: config
      });

      recordAuditLog(
        adminUser?.email || 'admin@sunviloz.com',
        'Updated Service Booking Form',
        'FormBuilder',
        service.id,
        `Configured ${config.fields.length} custom fields for ${service.title}`
      );

      setSaveSuccessToast('কাস্টম বুকিং ফরম সফলভাবে সংরক্ষিত হয়েছে!');
      setTimeout(() => {
        setSaveSuccessToast(null);
        if (onSaved) onSaved();
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Failed to save booking form:', err);
      alert('বুকিং ফরম সংরক্ষণ করতে সমস্যা হয়েছে।');
    }
  };

  const handleResetToDefault = () => {
    const matchKey = Object.keys(DEFAULT_SERVICE_BOOKING_FORMS).find(k => 
      service.id === k || 
      service.slug?.includes(k.replace('service-', ''))
    );
      const defaultForm = matchKey 
        ? DEFAULT_SERVICE_BOOKING_FORMS[matchKey] 
        : createDefaultGenericForm(service.titleBn || service.title, service.title);

      setConfig(defaultForm);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 uppercase">
                  বুকিং ফরম বিল্ডার
                </span>
                <span className="text-xs text-slate-400 font-medium">{service.title}</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {service.titleBn || service.title} — কাস্টম বুকিং ফরম
              </h3>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success toast */}
        {saveSuccessToast && (
          <div className="p-3 bg-emerald-600 text-white text-xs font-bold text-center">
            {saveSuccessToast}
          </div>
        )}

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* Enable Toggle & Reset */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-white block">
                এই সার্ভিসের জন্য কাস্টম বুকিং ফরম সক্রিয় রাখুন
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                গ্রাহক যখন এই সার্ভিসে বুকিং করবেন, তখন নির্দিষ্ট এই ফিল্ডগুলো পূরণ করতে হবে।
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleResetToDefault}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg flex items-center gap-1 border border-slate-700 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ডিফল্ট টেমপ্লেট</span>
              </button>
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => setConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                className="w-5 h-5 accent-blue-500 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Form Header Info */}
          <div className="space-y-3 p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <span className="font-bold text-slate-200 block uppercase tracking-wider text-[11px]">
              ফরমের শিরোনাম ও বার্তা
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">ফরম শিরোনাম (বাংলা)</label>
                <input
                  type="text"
                  value={config.titleBn || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, titleBn: e.target.value }))}
                  placeholder="যেমন: সোফা ক্লিনিং সার্ভিস বুকিং ফরম"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">সাবমিট বাটন টেক্সট</label>
                <input
                  type="text"
                  value={config.submitButtonTextBn || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, submitButtonTextBn: e.target.value }))}
                  placeholder="যেমন: বুকিং রিকোয়েস্ট পাঠান"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-slate-400 mb-1">নির্দেশনামূলক সাবটাইটেল</label>
                <input
                  type="text"
                  value={config.subtitleBn || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, subtitleBn: e.target.value }))}
                  placeholder="যেমন: আপনার সোফার সিট সংখ্যা ও অবস্থা জানান..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Fields List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                সার্ভিস স্পেসিফিক ফিল্ডসমূহ ({config.fields.length})
              </span>
              <button
                type="button"
                onClick={handleOpenAddField}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>নতুন ফিল্ড যোগ করুন</span>
              </button>
            </div>

            <div className="space-y-2">
              {config.fields.map((field, idx) => (
                <div
                  key={field.id}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded bg-slate-900 text-slate-400 text-[11px] font-mono flex items-center justify-center shrink-0 border border-slate-800">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-white truncate">
                          {field.labelBn}
                        </span>
                        {field.required ? (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-rose-950/60 text-rose-300">
                            বাধ্যতামূলক
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            ঐচ্ছিক
                          </span>
                        )}
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-900">
                          {field.type}
                        </span>
                      </div>
                      {(field.type === 'select' || field.type === 'radio') && field.options && (
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          অপশনসমূহ: {field.optionsBn?.join(', ') || field.options.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveField(idx, 'up')}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-30 rounded cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === config.fields.length - 1}
                      onClick={() => handleMoveField(idx, 'down')}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-30 rounded cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEditField(idx)}
                      className="p-1 text-blue-400 hover:text-blue-300 rounded cursor-pointer"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteField(idx)}
                      className="p-1 text-rose-400 hover:text-rose-300 rounded cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
          >
            বাতিল
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-lg shadow-blue-600/30 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>বুকিং ফরম সংরক্ষণ করুন</span>
          </button>
        </div>

      </div>

      {/* Field Add/Edit Modal */}
      {isFieldModalOpen && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="text-xs font-bold text-white">
                {editingFieldIndex !== null ? 'ফিল্ড এডিট করুন' : 'নতুন ফিল্ড যোগ করুন'}
              </h4>
              <button onClick={() => setIsFieldModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-200 font-semibold mb-1">
                  ফিল্ডের নাম (বাংলা) *
                </label>
                <input
                  type="text"
                  value={fieldModalData.labelBn}
                  onChange={(e) => setFieldModalData(prev => ({ ...prev, labelBn: e.target.value }))}
                  placeholder="যেমন: সোফার সিট সংখ্যা"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-200 font-semibold mb-1">ফিল্ডের ধরন</label>
                  <select
                    value={fieldModalData.type}
                    onChange={(e) => setFieldModalData(prev => ({ ...prev, type: e.target.value as FieldType }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
                  >
                    <option value="text">Text (লেখা)</option>
                    <option value="number">Number (সংখ্যা)</option>
                    <option value="select">Dropdown (তালিকা)</option>
                    <option value="radio">Radio (অপশন বাটন)</option>
                    <option value="textarea">Textarea (বক্স)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="chk_modal_req"
                    checked={fieldModalData.required}
                    onChange={(e) => setFieldModalData(prev => ({ ...prev, required: e.target.checked }))}
                    className="w-4 h-4 accent-blue-500 cursor-pointer"
                  />
                  <label htmlFor="chk_modal_req" className="text-slate-200 font-semibold cursor-pointer">
                    বাধ্যতামূলক?
                  </label>
                </div>
              </div>

              {/* Options */}
              {(fieldModalData.type === 'select' || fieldModalData.type === 'radio') && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <label className="block font-semibold text-white">অপশন তালিকা তৈরি করুন:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={optionInputBn}
                      onChange={(e) => setOptionInputBn(e.target.value)}
                      placeholder="অপশন নাম (যেমন: ২ সিটার)"
                      className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddOptionToField}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold cursor-pointer shrink-0"
                    >
                      + যোগ
                    </button>
                  </div>

                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {(fieldModalData.options || []).map((opt, i) => (
                      <div
                        key={i}
                        className="px-2 py-1 bg-slate-900 rounded border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <span className="text-white">{fieldModalData.optionsBn?.[i] || opt}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveOptionFromField(i)}
                          className="text-rose-400 p-0.5"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsFieldModalOpen(false)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleSaveFieldModal}
                className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded-lg text-xs shadow"
              >
                সংরক্ষণ
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
