import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Edit3, 
  ArrowUp, 
  ArrowDown, 
  Save, 
  Eye, 
  RotateCcw, 
  CheckCircle2, 
  Sparkles, 
  Wrench, 
  AlertCircle,
  HelpCircle,
  Sliders,
  Check,
  X,
  Layers,
  Copy
} from 'lucide-react';
import { ServiceItem } from '../../types';
import { CustomFormField, ServiceBookingFormConfig, FieldType } from '../../types/customBookingForm';
import { useServices, updateService } from '../../utils/servicesStore';
import { getServiceBookingForm, DEFAULT_SERVICE_BOOKING_FORMS, createDefaultGenericForm } from '../../data/defaultServiceBookingForms';
import { recordAuditLog } from '../../services/auditService';
import { useAdminAuth } from '../../context/AdminAuthContext';

export const ServiceFormBuilderTab: React.FC = () => {
  const { services } = useServices();
  const { adminUser } = useAdminAuth();

  // Selected service to configure
  const [selectedServiceId, setSelectedServiceId] = useState<string>(() => {
    // Prefer other services first
    const other = services.find(s => s.slug !== 'water-tank-cleaning' && s.slug !== 'overhead-water-tank-cleaning');
    return other?.id || services[0]?.id || '';
  });

  const selectedService = services.find(s => s.id === selectedServiceId) || services[0];

  // Active form configuration being edited
  const [config, setConfig] = useState<ServiceBookingFormConfig>(() => {
    return selectedService ? getServiceBookingForm(selectedService) : createDefaultGenericForm('সার্ভিস', 'Service');
  });

  // When service changes, update config
  const handleSelectService = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    const s = services.find(item => item.id === serviceId);
    if (s) {
      setConfig(getServiceBookingForm(s));
    }
  };

  React.useEffect(() => {
    if (!selectedServiceId && services.length > 0) {
      const other = services.find(s => s.slug !== 'water-tank-cleaning' && s.slug !== 'overhead-water-tank-cleaning');
      const targetId = other?.id || services[0]?.id || '';
      setSelectedServiceId(targetId);
      const s = services.find(item => item.id === targetId);
      if (s) {
        setConfig(getServiceBookingForm(s));
      }
    }
  }, [services, selectedServiceId]);

  // Field Edit Modal State
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
  const [previewLang, setPreviewLang] = useState<'bn' | 'en'>('bn');
  const [saveSuccessToast, setSaveSuccessToast] = useState<string | null>(null);

  // Field CRUD operations
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

  // Preset quick adders
  const handleAddPresetField = (presetType: string) => {
    let preset: CustomFormField;

    switch (presetType) {
      case 'rooms':
        preset = {
          id: `f_rooms_${Date.now()}`,
          name: 'number_of_rooms',
          labelBn: 'রুমের সংখ্যা',
          labelEn: 'Number of Rooms',
          type: 'select',
          required: true,
          options: ['1 Room', '2 Rooms', '3 Rooms', '4 Rooms', '5+ Rooms'],
          optionsBn: ['১টি রুম', '২টি রুম', '৩টি রুম', '৪টি রুম', '৫টি বা তার বেশি']
        };
        break;
      case 'sqft':
        preset = {
          id: `f_sqft_${Date.now()}`,
          name: 'area_sqft',
          labelBn: 'আনুমানিক আয়তন (বর্গফুট)',
          labelEn: 'Approx. Area (Sq. Ft.)',
          type: 'text',
          required: true,
          placeholderBn: 'যেমন: ১২৫০ বর্গফুট',
          placeholderEn: 'e.g. 1250 sq ft'
        };
        break;
      case 'seats':
        preset = {
          id: `f_seats_${Date.now()}`,
          name: 'seating_count',
          labelBn: 'সিট বা বসার আসন সংখ্যা',
          labelEn: 'Number of Seats',
          type: 'select',
          required: true,
          options: ['1 Seater', '2 Seater', '3 Seater', '5 Seater Set', '7+ Seater'],
          optionsBn: ['১ সিটার', '২ সিটার', '৩ সিটার', '৫ সিটার সেট', '৭ বা ততোধিক সিট']
        };
        break;
      case 'problem':
        preset = {
          id: `f_problem_${Date.now()}`,
          name: 'problem_description',
          labelBn: 'সমস্যা বা বিশেষ রিকোয়ারমেন্টের বিবরণ',
          labelEn: 'Specific Problem or Requirements',
          type: 'textarea',
          required: false,
          placeholderBn: 'কোনো নির্দিষ্ট দাগ, গন্ধ বা কাজের জরুরি নির্দেশনা লিখুন...',
          placeholderEn: 'Mention any specific stain, odor or urgency details...'
        };
        break;
      default:
        return;
    }

    setConfig(prev => ({
      ...prev,
      fields: [...prev.fields, preset]
    }));
  };

  // Save changes to servicesStore
  const handleSaveFormConfig = () => {
    if (!selectedService) return;

    try {
      updateService(selectedService.id, {
        bookingFormConfig: config
      });

      recordAuditLog(
        adminUser?.email || 'admin@sunviloz.com',
        'Updated Service Booking Form',
        'FormBuilder',
        selectedService.id,
        `Configured ${config.fields.length} custom fields for ${selectedService.title}`
      );

      setSaveSuccessToast(`"${selectedService.titleBn || selectedService.title}" এর কাস্টম বুকিং ফরম সফলভাবে সংরক্ষিত হয়েছে!`);
      setTimeout(() => setSaveSuccessToast(null), 4000);
    } catch (err) {
      console.error('Failed to save booking form:', err);
      alert('বুকিং ফরম সংরক্ষণ করতে সমস্যা হয়েছে।');
    }
  };

  // Reset to default template
  const handleResetToDefaultTemplate = () => {
    if (!selectedService) return;
    const matchKey = Object.keys(DEFAULT_SERVICE_BOOKING_FORMS).find(k => 
      selectedService.id === k || 
      selectedService.slug?.includes(k.replace('service-', ''))
    );
      const defaultForm = matchKey 
        ? DEFAULT_SERVICE_BOOKING_FORMS[matchKey] 
        : createDefaultGenericForm(selectedService.titleBn || selectedService.title, selectedService.title);

      setConfig(defaultForm);
  };

  return (
    <div className="space-y-6">
      
      {/* Toast */}
      {saveSuccessToast && (
        <div className="fixed top-20 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-xs sm:text-sm font-bold">{saveSuccessToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <FileText className="w-5 h-5" />
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              সার্ভিস বুকিং ফরম বিল্ডার (Booking Forms Builder)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
            কোন সার্ভিসের জন্য গ্রাহকের কাছ থেকে কী কী তথ্য লাগবে তা এখান থেকে কাস্টমাইজ করুন (যেমন: সোফা ক্লিনিংয়ের আসন সংখ্যা, হোম ক্লিনিংয়ের স্কয়ার ফিট ইত্যাদি)।
          </p>
        </div>

        {/* Save Button in Top Header */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetToDefaultTemplate}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
            title="Reset to recommended default template"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ডিফল্ট টেমপ্লেট</span>
          </button>

          <button
            type="button"
            onClick={handleSaveFormConfig}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>সংরক্ষণ করুন (Save Form)</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Service Selector & Builder Controls on Left, Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN: BUILDER (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">

          {/* 1. SELECT SERVICE */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
              <span>১. কোন সার্ভিসের জন্য বুকিং ফরম তৈরি করবেন? (Select Service)</span>
              <span className="text-blue-400 font-mono text-[11px]">{services.length} Services Available</span>
            </label>

            <select
              value={selectedServiceId}
              onChange={(e) => handleSelectService(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl text-xs sm:text-sm text-white font-medium focus:outline-none cursor-pointer"
            >
              {services.map(s => (
                <option key={s.id} value={s.id}>
                  {s.titleBn ? `${s.titleBn} (${s.title})` : s.title}
                </option>
              ))}
            </select>

            {/* Enable/Disable Custom Form Switch */}
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-white block">
                  এই সার্ভিসে কাস্টম বুকিং ফরম চালু রাখুন (Enable Form)
                </span>
                <span className="text-[11px] text-slate-400">
                  চালু থাকলে ওয়েবসাইট থেকে বুকিং ক্লিকের সময় এই কাস্টম ফরমটি প্রদর্শিত হবে।
                </span>
              </div>
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => setConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                className="w-5 h-5 accent-blue-500 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* 2. FORM HEADER SETTINGS */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              ২. ফরমের শিরোনাম ও সাবটাইটেল (Form Header)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">ফরম শিরোনাম (বাংলা)</label>
                <input
                  type="text"
                  value={config.titleBn || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, titleBn: e.target.value }))}
                  placeholder="যেমন: সোফা ক্লিনিং সার্ভিস বুকিং ফরম"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Form Title (English)</label>
                <input
                  type="text"
                  value={config.titleEn || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, titleEn: e.target.value }))}
                  placeholder="e.g. Sofa Cleaning Booking Form"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-medium mb-1">সাবটাইটেল / নির্দেশনামূলক বার্তা (বাংলা)</label>
                <input
                  type="text"
                  value={config.subtitleBn || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, subtitleBn: e.target.value }))}
                  placeholder="যেমন: আপনার সোফার সাইজ ও কাপড়ের ধরন জানান..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">সাবমিট বাটন টেক্সট</label>
                <input
                  type="text"
                  value={config.submitButtonTextBn || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, submitButtonTextBn: e.target.value }))}
                  placeholder="যেমন: বুকিং রিকোয়েস্ট পাঠান"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">মূল্য বিষয়ক বিশেষ নোট (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={config.estimatedPriceNoteBn || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, estimatedPriceNoteBn: e.target.value }))}
                  placeholder="যেমন: কাজের পরিধি দেখে চূড়ান্ত রেট চূড়ান্ত হবে"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* 3. FIELD MANAGER */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  ৩. প্রয়োজনীয় তথ্য ফিল্ডসমূহ ({config.fields.length} Fields)
                </h3>
                <p className="text-[11px] text-slate-400">
                  গ্রাহক এই সার্ভিসের জন্য কী কী পূরণ করবে তা এখান থেকে নির্ধারণ ও সাজিয়ে নিন।
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddField}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>নতুন ফিল্ড যোগ করুন</span>
              </button>
            </div>

            {/* Quick Preset Buttons */}
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[11px] text-slate-400 font-semibold block">
                ⚡ দ্রুত সাধারণ ফিল্ড যোগ করুন (Quick Presets):
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleAddPresetField('rooms')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-blue-900/40 text-slate-200 text-xs border border-slate-700 hover:border-blue-500 cursor-pointer"
                >
                  + রুমের সংখ্যা
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPresetField('sqft')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-blue-900/40 text-slate-200 text-xs border border-slate-700 hover:border-blue-500 cursor-pointer"
                >
                  + আয়তন (Sq. Ft.)
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPresetField('seats')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-blue-900/40 text-slate-200 text-xs border border-slate-700 hover:border-blue-500 cursor-pointer"
                >
                  + সিট সংখ্যা
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPresetField('problem')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-blue-900/40 text-slate-200 text-xs border border-slate-700 hover:border-blue-500 cursor-pointer"
                >
                  + বিস্তারিত বিবরণ বক্স
                </button>
              </div>
            </div>

            {/* Fields List */}
            {config.fields.length === 0 ? (
              <div className="py-8 text-center p-4 bg-slate-950 rounded-xl border border-dashed border-slate-800">
                <p className="text-xs text-slate-400">বর্তমানে কোনো কাস্টম ফিল্ড নেই।</p>
                <button
                  type="button"
                  onClick={handleOpenAddField}
                  className="mt-2 text-xs font-semibold text-blue-400 hover:underline"
                >
                  একটি ফিল্ড যোগ করুন
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {config.fields.map((field, idx) => (
                  <div
                    key={field.id}
                    className="p-3.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-between gap-3 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-slate-900 text-slate-400 text-xs font-mono font-bold flex items-center justify-center shrink-0 border border-slate-800">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-bold text-white truncate">
                            {field.labelBn} {field.labelEn ? `(${field.labelEn})` : ''}
                          </h4>
                          {field.required ? (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/40">
                              বাধ্যতামূলক
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                              ঐচ্ছিক
                            </span>
                          )}
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-900">
                            {field.type}
                          </span>
                        </div>

                        {/* Options preview for select / radio */}
                        {(field.type === 'select' || field.type === 'radio') && field.options && field.options.length > 0 && (
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            অপশন ({field.options.length}): {field.optionsBn?.join(', ') || field.options.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions: Reorder, Edit, Delete */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveField(idx, 'up')}
                        className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-900 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === config.fields.length - 1}
                        onClick={() => handleMoveField(idx, 'down')}
                        className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-900 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditField(idx)}
                        className="p-1.5 text-blue-400 hover:text-blue-300 rounded hover:bg-blue-950/40 cursor-pointer"
                        title="Edit Field"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteField(idx)}
                        className="p-1.5 text-rose-400 hover:text-rose-300 rounded hover:bg-rose-950/40 cursor-pointer"
                        title="Delete Field"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: LIVE INTERACTIVE PREVIEW (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 sticky top-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  সরাসরি প্রিভিউ (Live Preview)
                </h3>
              </div>

              {/* Language Switch for preview */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
                <button
                  type="button"
                  onClick={() => setPreviewLang('bn')}
                  className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                    previewLang === 'bn' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  বাংলা
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewLang('en')}
                  className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                    previewLang === 'en' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* Rendered Preview Card as Customer will see */}
            <div className="p-4 bg-[#08172C] rounded-2xl border border-cyan-900/50 shadow-inner space-y-4">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                  {previewLang === 'bn' ? 'কাস্টম বুকিং ফরম' : 'Custom Booking'}
                </span>
                <h4 className="text-sm font-extrabold text-white mt-1">
                  {previewLang === 'bn'
                    ? (config.titleBn || `${selectedService.titleBn || selectedService.title} বুকিং`)
                    : (config.titleEn || `${selectedService.title} Booking`)}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {previewLang === 'bn' ? config.subtitleBn : config.subtitleEn}
                </p>
              </div>

              {/* Contact Info (Always present) */}
              <div className="p-3 bg-[#040D1A] rounded-xl border border-cyan-950 space-y-2 text-[11px]">
                <span className="font-bold text-cyan-400 block">
                  {previewLang === 'bn' ? '১. যোগাযোগের তথ্য (Contact Info)' : '1. Contact Details'}
                </span>
                <div className="space-y-1.5 text-slate-300">
                  <div className="h-6 bg-[#08172C] rounded border border-cyan-900/30 px-2 flex items-center text-[10px] text-slate-400">
                    {previewLang === 'bn' ? 'গ্রাহকের নাম *' : 'Customer Name *'}
                  </div>
                  <div className="h-6 bg-[#08172C] rounded border border-cyan-900/30 px-2 flex items-center text-[10px] text-slate-400">
                    {previewLang === 'bn' ? 'মোবাইল নম্বর * (017XXXXXXXX)' : 'Mobile Phone * (01XXXXXXXXX)'}
                  </div>
                  <div className="h-6 bg-[#08172C] rounded border border-cyan-900/30 px-2 flex items-center text-[10px] text-slate-400">
                    {previewLang === 'bn' ? 'ঢাকা শহরের এলাকা *' : 'Area in Dhaka *'}
                  </div>
                </div>
              </div>

              {/* Dynamic Service Questions */}
              <div className="p-3 bg-[#040D1A] rounded-xl border border-cyan-950 space-y-3 text-[11px]">
                <span className="font-bold text-cyan-400 block">
                  {previewLang === 'bn' ? '২. সার্ভিসের প্রয়োজনীয় তথ্যাবলী' : '2. Service Requirements'}
                </span>

                {config.fields.length === 0 ? (
                  <p className="text-slate-500 italic text-[10px]">কোনো কাস্টম ফিল্ড যোগ করা হয়নি</p>
                ) : (
                  <div className="space-y-3">
                    {config.fields.map((field, idx) => (
                      <div key={idx} className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-200 block">
                          {previewLang === 'bn' ? field.labelBn : field.labelEn}
                          {field.required && <span className="text-rose-400 ml-0.5">*</span>}
                        </label>

                        {field.type === 'select' && (
                          <div className="h-7 bg-[#08172C] rounded border border-cyan-900/40 px-2 flex items-center justify-between text-[10px] text-slate-400">
                            <span>
                              {previewLang === 'bn'
                                ? (field.placeholderBn || field.optionsBn?.[0] || 'অপশন নির্বাচন করুন')
                                : (field.placeholderEn || field.options?.[0] || 'Select option')}
                            </span>
                            <span className="text-xs">▼</span>
                          </div>
                        )}

                        {field.type === 'radio' && (
                          <div className="space-y-1 pt-0.5">
                            {(field.options || []).map((opt, i) => (
                              <div key={i} className="flex items-center gap-1.5 text-[10px] text-slate-300">
                                <div className="w-3 h-3 rounded-full border border-cyan-500/60" />
                                <span>{(previewLang === 'bn' && field.optionsBn?.[i]) ? field.optionsBn[i] : opt}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {(field.type === 'text' || field.type === 'number') && (
                          <div className="h-7 bg-[#08172C] rounded border border-cyan-900/40 px-2 flex items-center text-[10px] text-slate-500">
                            {previewLang === 'bn' ? (field.placeholderBn || 'লিখুন...') : (field.placeholderEn || 'Type here...')}
                          </div>
                        )}

                        {field.type === 'textarea' && (
                          <div className="h-14 bg-[#08172C] rounded border border-cyan-900/40 p-1.5 text-[10px] text-slate-500">
                            {previewLang === 'bn' ? (field.placeholderBn || 'বিস্তারিত লিখুন...') : (field.placeholderEn || 'Detailed description...')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button Preview */}
              <div className="h-9 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow">
                <span>
                  {previewLang === 'bn'
                    ? (config.submitButtonTextBn || 'বুকিং রিকোয়েস্ট পাঠান')
                    : (config.submitButtonTextEn || 'Submit Booking Request')}
                </span>
              </div>
            </div>

            <div className="p-3 bg-blue-950/30 border border-blue-800/30 rounded-xl text-[11px] text-blue-300 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>
                গ্রাহক যখন ওয়েবসাইটে এই সার্ভিসে &quot;বুকিং করুন&quot; বাটনে ক্লিক করবেন, তখন স্বয়ংক্রিয়ভাবে এই কাস্টম ফরমটি ওপেন হবে।
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* FIELD EDIT / ADD MODAL */}
      {isFieldModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-400" />
                <span>{editingFieldIndex !== null ? 'ফিল্ড এডিট করুন' : 'নতুন ফিল্ড তৈরি করুন'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsFieldModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              
              {/* Field Label (BN & EN) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-200 font-semibold mb-1">
                    ফিল্ডের লেবেল (বাংলা) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={fieldModalData.labelBn}
                    onChange={(e) => setFieldModalData(prev => ({ ...prev, labelBn: e.target.value }))}
                    placeholder="যেমন: সোফার সিট সংখ্যা"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-200 font-semibold mb-1">
                    Field Label (English)
                  </label>
                  <input
                    type="text"
                    value={fieldModalData.labelEn}
                    onChange={(e) => setFieldModalData(prev => ({ ...prev, labelEn: e.target.value }))}
                    placeholder="e.g. Number of Sofa Seats"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Field Type & Required Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-200 font-semibold mb-1">
                    ফিল্ডের ধরন (Field Type)
                  </label>
                  <select
                    value={fieldModalData.type}
                    onChange={(e) => setFieldModalData(prev => ({ ...prev, type: e.target.value as FieldType }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="text">Text (এক লাইনের লেখা)</option>
                    <option value="number">Number (সংখ্যা)</option>
                    <option value="select">Dropdown Select (ড্রপডাউন তালিকা)</option>
                    <option value="radio">Radio Buttons (রেডিও অপশন)</option>
                    <option value="textarea">Textarea (বড় প্যারাগ্রাফ বক্স)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="chk_req"
                    checked={fieldModalData.required}
                    onChange={(e) => setFieldModalData(prev => ({ ...prev, required: e.target.checked }))}
                    className="w-4 h-4 accent-blue-500 cursor-pointer"
                  />
                  <label htmlFor="chk_req" className="text-slate-200 font-semibold cursor-pointer">
                    বাধ্যতামূলক ফিল্ড? (Required)
                  </label>
                </div>
              </div>

              {/* Placeholder text */}
              {(fieldModalData.type === 'text' || fieldModalData.type === 'number' || fieldModalData.type === 'textarea') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1">প্লেসহোল্ডার টেক্সট (বাংলা)</label>
                    <input
                      type="text"
                      value={fieldModalData.placeholderBn || ''}
                      onChange={(e) => setFieldModalData(prev => ({ ...prev, placeholderBn: e.target.value }))}
                      placeholder="যেমন: ৩ সেট"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Placeholder (English)</label>
                    <input
                      type="text"
                      value={fieldModalData.placeholderEn || ''}
                      onChange={(e) => setFieldModalData(prev => ({ ...prev, placeholderEn: e.target.value }))}
                      placeholder="e.g. 3 sets"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Options Builder for Select or Radio */}
              {(fieldModalData.type === 'select' || fieldModalData.type === 'radio') && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                  <label className="block font-semibold text-white">
                    অপশন তালিকা তৈরি করুন (Options List):
                  </label>

                  {/* Add option row */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={optionInputBn}
                      onChange={(e) => setOptionInputBn(e.target.value)}
                      placeholder="অপশন নাম (বাংলা, যেমন: ২ সিটার)"
                      className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none"
                    />
                    <input
                      type="text"
                      value={optionInputEn}
                      onChange={(e) => setOptionInputEn(e.target.value)}
                      placeholder="Option (English, e.g. 2 Seater)"
                      className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddOptionToField}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold cursor-pointer shrink-0"
                    >
                      + যোগ করুন
                    </button>
                  </div>

                  {/* Current options */}
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pt-1">
                    {(fieldModalData.options || []).map((opt, i) => (
                      <div
                        key={i}
                        className="px-2.5 py-1.5 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <span className="text-white">
                          {fieldModalData.optionsBn?.[i] || opt} {fieldModalData.optionsBn?.[i] !== opt ? `(${opt})` : ''}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveOptionFromField(i)}
                          className="text-rose-400 hover:text-rose-300 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsFieldModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleSaveFieldModal}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow cursor-pointer"
              >
                ফিল্ড সংরক্ষণ করুন
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
