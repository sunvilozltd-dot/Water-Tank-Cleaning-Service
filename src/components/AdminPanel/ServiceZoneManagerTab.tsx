import React, { useEffect, useState } from 'react';
import {
  MapPin,
  Plus,
  Save,
  Send,
  Eye,
  EyeOff,
  Trash2,
  ArrowUp,
  ArrowDown,
  History,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  RefreshCw,
  Layers,
  Globe,
  ShieldAlert
} from 'lucide-react';
import {
  ServiceZoneRecord,
  ZoneAreaRecord,
  ZoneAreaContent,
  ContentRevisionRecord,
  VerifiedFinding,
  ZoneAreaFaq,
  fetchZonesAndAreas,
  saveZoneDraft,
  publishZone,
  saveAreaDraft,
  publishArea,
  toggleAreaVisibility,
  deleteZoneArea,
  reorderZones,
  listContentRevisions
} from '../../services/zoneContentService';

export const ServiceZoneManagerTab: React.FC = () => {
  const [zones, setZones] = useState<ServiceZoneRecord[]>([]);
  const [areas, setAreas] = useState<ZoneAreaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState<'zones' | 'areas'>('areas');

  const [selectedZoneFilter, setSelectedZoneFilter] = useState<string>('all');
  const [areaSearch, setAreaSearch] = useState('');

  // Zone Editor state
  const [editingZone, setEditingZone] = useState<ServiceZoneRecord | null>(null);

  // Area Editor state
  const [editingArea, setEditingArea] = useState<ZoneAreaRecord | null>(null);
  const [originalAreaSlug, setOriginalAreaSlug] = useState<string>('');
  const [isCreatingArea, setIsCreatingArea] = useState(false);

  // Revisions Drawer state
  const [revisionsOpen, setRevisionsOpen] = useState(false);
  const [revisionsLoading, setRevisionsLoading] = useState(false);
  const [revisionsList, setRevisionsList] = useState<ContentRevisionRecord[]>([]);
  const [revisionsTargetLabel, setRevisionsTargetLabel] = useState('');

  // Delete Confirmation Modal
  const [areaToDelete, setAreaToDelete] = useState<ZoneAreaRecord | null>(null);

  // Feedback Banner
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [statusBanner, setStatusBanner] = useState<{ type: 'success' | 'error'; text: string; sub?: string } | null>(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const res = await fetchZonesAndAreas({ includeDrafts: true });
      setZones(res.zones);
      setAreas(res.areas);
    } catch (err: any) {
      setStatusBanner({ type: 'error', text: err?.message || 'সার্ভিস জোন ডেটা লোড করা যায়নি।' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const showSuccess = (text: string, sub?: string) => {
    setStatusBanner({ type: 'success', text, sub });
  };

  const showError = (text: string) => {
    setStatusBanner({ type: 'error', text });
  };

  // ================= ZONE HANDLERS =================
  const handleSelectZoneForEdit = (zone: ServiceZoneRecord) => {
    setEditingZone(JSON.parse(JSON.stringify(zone)));
    setStatusBanner(null);
  };

  const handleSaveZoneDraft = async () => {
    if (!editingZone) return;
    setSaving(true);
    setStatusBanner(null);
    const res = await saveZoneDraft(editingZone);
    setSaving(false);
    if (!res.success) {
      showError(res.error || 'জোন ড্রাফট সেভ করা যায়নি।');
      return;
    }
    if (res.zone) setEditingZone(res.zone);
    await loadAll();
    showSuccess('জোনের ড্রাফট সফলভাবে সংরক্ষিত হয়েছে। পাবলিক সাইটে দেখাতে Publish বাটনে ক্লিক করুন।');
  };

  const handlePublishZone = async () => {
    if (!editingZone) return;
    setPublishing(true);
    setStatusBanner(null);
    const saveFirst = await saveZoneDraft(editingZone);
    if (!saveFirst.success || !saveFirst.zone) {
      setPublishing(false);
      showError(saveFirst.error || 'পাবলিশের আগে ড্রাফট সেভ ব্যর্থ হয়েছে।');
      return;
    }
    const pubRes = await publishZone(saveFirst.zone);
    setPublishing(false);
    if (!pubRes.success) {
      showError(pubRes.error || 'জোন পাবলিশ ব্যর্থ হয়েছে।');
      return;
    }
    await loadAll();
    if (pubRes.publicVerified === true) {
      showSuccess(
        `${editingZone.nameBn} পাবলিক ওয়েবসাইটে প্রকাশিত ও HTTP 200 হিসেবে যাচাইকৃত হয়েছে।`,
        pubRes.indexNowNote
      );
    } else {
      showSuccess(
        `${editingZone.nameBn} ডাটাবেজে সেভ হয়েছে, তবে এখনো পাবলিক পেজ দৃশ্যমান/যাচাইকৃত নয়।`,
        pubRes.indexNowNote || 'পাবলিক সাইটে দেখাতে Visible চালু আছে কি না এবং সরাসরি URL রিটার্ন 200 দিচ্ছে কি না যাচাই করুন।'
      );
    }
  };

  const handleMoveZone = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= zones.length) return;
    const copy = [...zones];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    const updated = copy.map((z, idx) => ({ ...z, sortOrder: idx + 1 }));
    setZones(updated);
    const ok = await reorderZones(updated);
    if (ok) {
      showSuccess('জোনের ক্রম আপডেট করা হয়েছে।');
      await loadAll();
    } else {
      showError('জোন রিঅর্ডার করতে সমস্যা হয়েছে।');
    }
  };

  // ================= AREA HANDLERS =================
  const handleStartNewArea = () => {
    const defaultZone = zones[0];
    const blankContent: ZoneAreaContent = {
      title: 'Water Tank Cleaning Service in New Area | SUNVILOZ CLEAN CARE',
      titleBn: 'নতুন এলাকায় পানির ট্যাংক পরিষ্কার সার্ভিস',
      metaDesc: 'Professional overhead and underground water tank cleaning and pipeline flushing service.',
      seoTitle: 'Water Tank Cleaning Service in New Area | SUNVILOZ CLEAN CARE',
      ogTitle: 'Water Tank Cleaning Service in New Area | SUNVILOZ CLEAN CARE',
      ogDescription: 'Professional overhead and underground water tank cleaning and pipeline flushing service.',
      intro: '',
      introBn: '',
      waterProblemsBn: '',
      waterProblemsEn: '',
      potentialCausesBn: '',
      potentialCausesEn: '',
      waterConditionNote: '',
      waterConditionNoteBn: '',
      practicalAdviceBn: '',
      practicalAdviceEn: '',
      verifiedFindings: [],
      coverageDetails: ['সকল আবাসিক বাসাবাড়ি, অ্যাপার্টমেন্ট ও কমার্শিয়াল ভবন'],
      pricingFactors: ['ট্যাংকের ধরন (ওভারহেড / আন্ডারগ্রাউন্ড)', 'ধারণক্ষমতা (লিটার)', 'পলি ও ময়লার মাত্রা'],
      faqs: []
    };

    setIsCreatingArea(true);
    setOriginalAreaSlug('');
    setEditingArea({
      id: `new-area-${Date.now()}`,
      zoneId: defaultZone?.id || '',
      zoneSlug: defaultZone?.slug || 'north-dhaka-zone',
      slug: '',
      areaName: '',
      areaNameBn: '',
      isCoreCity: false,
      isVisible: true,
      status: 'draft',
      sortOrder: areas.length + 1,
      version: 1,
      draftData: blankContent,
      publishedData: blankContent
    });
    setStatusBanner(null);
  };

  const handleSelectAreaForEdit = (area: ZoneAreaRecord) => {
    setIsCreatingArea(false);
    setOriginalAreaSlug(area.slug);
    setEditingArea(JSON.parse(JSON.stringify(area)));
    setStatusBanner(null);
  };

  const handleSaveAreaDraft = async () => {
    if (!editingArea) return;
    if (!editingArea.areaName.trim() || !editingArea.areaNameBn.trim() || !editingArea.slug.trim()) {
      showError('এরিয়ার ইংরেজি নাম, বাংলা নাম এবং URL Slug অবশ্যই পূরণ করতে হবে।');
      return;
    }
    setSaving(true);
    setStatusBanner(null);
    const res = await saveAreaDraft(editingArea, isCreatingArea ? undefined : originalAreaSlug);
    setSaving(false);
    if (!res.success || !res.area) {
      showError(res.error || 'এরিয়া ড্রাফট সংরক্ষণ ব্যর্থ হয়েছে।');
      return;
    }
    setIsCreatingArea(false);
    setOriginalAreaSlug(res.area.slug);
    setEditingArea(res.area);
    await loadAll();
    showSuccess('এরিয়ার ড্রাফট সংরক্ষিত হয়েছে। ওয়েবসাইটে লাইভ করতে Publish বাটনে ক্লিক করুন।');
  };

  const handlePublishArea = async () => {
    if (!editingArea) return;
    if (!editingArea.areaName.trim() || !editingArea.areaNameBn.trim() || !editingArea.slug.trim()) {
      showError('পাবলিশ করার আগে এরিয়ার নাম ও Slug সঠিকভাবে দিন।');
      return;
    }
    setPublishing(true);
    setStatusBanner(null);
    const saveRes = await saveAreaDraft(editingArea, isCreatingArea ? undefined : originalAreaSlug);
    if (!saveRes.success || !saveRes.area) {
      setPublishing(false);
      showError(saveRes.error || 'ড্রাফট সেভ করতে না পারায় পাবলিশ করা যায়নি।');
      return;
    }
    const pubRes = await publishArea(saveRes.area);
    setPublishing(false);
    if (!pubRes.success) {
      showError(pubRes.error || 'এরিয়া পাবলিশ ব্যর্থ হয়েছে।');
      return;
    }
    setIsCreatingArea(false);
    setOriginalAreaSlug(saveRes.area.slug);
    setEditingArea({ ...saveRes.area, status: 'published' });
    await loadAll();
    if (pubRes.publicVerified === true) {
      showSuccess(
        `${saveRes.area.areaNameBn} (/service-areas/${saveRes.area.slug}) প্রকাশিত ও পাবলিক HTTP 200 যাচাইকৃত হয়েছে।`,
        pubRes.indexNowNote
      );
    } else {
      showSuccess(
        `${saveRes.area.areaNameBn} ডাটাবেজে প্রকাশিত অবস্থায় সেভ হয়েছে, কিন্তু পাবলিক প্রাপ্যতা (HTTP 200) এখনো নিশ্চিত নয়।`,
        pubRes.indexNowNote || 'পেজটি Hidden অবস্থায় থাকলে বা লোকাল প্রিভিউতে থাকলে পাবলিক যাচাই সম্পূর্ণ না হওয়া পর্যন্ত IndexNow লাইভ পিং অপেক্ষায় থাকবে।'
      );
    }
  };

  const handleToggleAreaVisibility = async (area: ZoneAreaRecord) => {
    const nextVis = !area.isVisible;
    const ok = await toggleAreaVisibility(area, nextVis);
    if (ok) {
      await loadAll();
      showSuccess(`${area.areaNameBn} এখন ${nextVis ? 'দৃশ্যমান (Visible)' : 'লুকানো (Hidden)'} অবস্থায় আছে।`);
    } else {
      showError('ভিজিবিলিটি পরিবর্তন করা যায়নি।');
    }
  };

  const handleConfirmDeleteArea = async () => {
    if (!areaToDelete) return;
    const target = areaToDelete;
    setAreaToDelete(null);
    const ok = await deleteZoneArea(target);
    if (ok) {
      if (editingArea?.id === target.id) setEditingArea(null);
      await loadAll();
      showSuccess(`${target.areaNameBn} তালিকা থেকে মুছে ফেলা হয়েছে।`);
    } else {
      showError('এরিয়া মুছতে সমস্যা হয়েছে।');
    }
  };

  // ================= REVISION HISTORY & ROLLBACK =================
  const handleOpenRevisions = async (entityType: 'service_zone' | 'zone_area', entityId: string, label: string) => {
    setRevisionsTargetLabel(label);
    setRevisionsOpen(true);
    setRevisionsLoading(true);
    const list = await listContentRevisions(entityType, entityId);
    setRevisionsList(list);
    setRevisionsLoading(false);
  };

  const handleRollbackRevision = (rev: ContentRevisionRecord) => {
    if (rev.entityType === 'zone_area' && rev.snapshot) {
      const restoredContent: ZoneAreaContent = rev.snapshot.publishedData || rev.snapshot.area?.publishedData || rev.snapshot.area?.draftData;
      if (editingArea && restoredContent) {
        setEditingArea({
          ...editingArea,
          draftData: restoredContent
        });
        setRevisionsOpen(false);
        showSuccess(`ভার্সন v${rev.version} ড্রাফটে ফিরিয়ে আনা হয়েছে। নিশ্চিত করতে Save Draft বা Publish করুন।`);
      }
    } else if (rev.entityType === 'service_zone' && rev.snapshot) {
      const restoredZoneData = rev.snapshot.publishedData || rev.snapshot.zone?.publishedData;
      if (editingZone && restoredZoneData) {
        setEditingZone({
          ...editingZone,
          draftData: restoredZoneData
        });
        setRevisionsOpen(false);
        showSuccess(`জোন ভার্সন v${rev.version} ড্রাফটে লোড করা হয়েছে। Save Draft বা Publish করুন।`);
      }
    }
  };

  const updateDraftField = <K extends keyof ZoneAreaContent>(key: K, val: ZoneAreaContent[K]) => {
    if (!editingArea) return;
    setEditingArea({
      ...editingArea,
      draftData: {
        ...editingArea.draftData,
        [key]: val
      }
    });
  };

  const filteredAreas = areas.filter(a => {
    const matchesZone = selectedZoneFilter === 'all' || a.zoneSlug === selectedZoneFilter || a.zoneId === selectedZoneFilter;
    const q = areaSearch.toLowerCase().trim();
    const matchesQuery = !q || a.areaName.toLowerCase().includes(q) || a.areaNameBn.includes(q) || a.slug.toLowerCase().includes(q);
    return matchesZone && matchesQuery;
  });

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-400" />
            <span>Service Zone Content Manager</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            হোমপেজের ৫টি জোন কার্ড ও &quot;এরিয়া বিস্তারিত দেখুন&quot; লোকেশন পেজের বাংলা/ইংরেজি কনটেন্ট, SEO, FAQ এবং পানির সমস্যা সংক্রান্ত তথ্য এখান থেকে সম্পাদনা ও প্রকাশ করুন।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => { setSubTab('areas'); setEditingZone(null); }}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              subTab === 'areas'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Location Detail Pages ({areas.length})
          </button>
          <button
            type="button"
            onClick={() => { setSubTab('zones'); setEditingArea(null); }}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              subTab === 'zones'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            5 Service Zones ({zones.length})
          </button>
          <button
            type="button"
            onClick={loadAll}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 cursor-pointer"
            title="Refresh from Supabase"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {statusBanner && (
        <div className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs ${
          statusBanner.type === 'success'
            ? 'bg-emerald-950/60 border-emerald-700 text-emerald-200'
            : 'bg-rose-950/60 border-rose-700 text-rose-200'
        }`}>
          {statusBanner.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <div className="font-semibold">{statusBanner.text}</div>
            {statusBanner.sub && <div className="text-[11px] opacity-90 mt-0.5">{statusBanner.sub}</div>}
          </div>
        </div>
      )}

      {/* ================= SUB-TAB 1: 5 SERVICE ZONES ================= */}
      {subTab === 'zones' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-400" />
                <span>Service Zones (Order &amp; Visibility)</span>
              </h3>
            </div>

            {zones.map((z, idx) => (
              <div
                key={z.id}
                className={`p-3 rounded-xl border transition-all ${
                  editingZone?.id === z.id
                    ? 'bg-blue-950/40 border-blue-500'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectZoneForEdit(z)}
                    className="text-left flex-1 cursor-pointer"
                  >
                    <div className="text-sm font-bold text-white">{z.nameBn}</div>
                    <div className="text-[11px] text-slate-400">{z.nameEn} • /{z.featuredSlug}</div>
                    <div className="text-[10px] text-slate-500 mt-1 line-clamp-1">{z.placesText}</div>
                  </button>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleMoveZone(idx, -1)}
                      disabled={idx === 0}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded text-slate-300 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveZone(idx, 1)}
                      disabled={idx === zones.length - 1}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded text-slate-300 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5">
            {!editingZone ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                বাম দিকের তালিকা থেকে যেকোনো একটি সার্ভিস জোন নির্বাচন করে সম্পাদনা শুরু করুন।
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-white">{editingZone.nameBn}</h3>
                    <span className="text-[11px] text-slate-400">
                      Slug: {editingZone.slug} • Version v{editingZone.version} • Status: {editingZone.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenRevisions('service_zone', editingZone.slug, editingZone.nameBn)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>History</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveZoneDraft}
                      disabled={saving}
                      className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{saving ? 'Saving...' : 'Save Draft'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handlePublishZone}
                      disabled={publishing}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{publishing ? 'Publishing...' : 'Publish Zone'}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Zone Name (বাংলা)</label>
                    <input
                      type="text"
                      value={editingZone.nameBn}
                      onChange={e => setEditingZone({ ...editingZone, nameBn: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Zone Name (English)</label>
                    <input
                      type="text"
                      value={editingZone.nameEn}
                      onChange={e => setEditingZone({ ...editingZone, nameEn: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Places Covered Text (কার্ডে প্রদর্শিত এলাকা তালিকা)</label>
                  <input
                    type="text"
                    value={editingZone.draftData.placesText}
                    onChange={e => setEditingZone({
                      ...editingZone,
                      draftData: { ...editingZone.draftData, placesText: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Featured Target Area Slug (&quot;এরিয়া বিস্তারিত দেখুন&quot;)</label>
                    <input
                      type="text"
                      value={editingZone.draftData.featuredSlug}
                      onChange={e => setEditingZone({
                        ...editingZone,
                        draftData: { ...editingZone.draftData, featuredSlug: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs font-mono"
                    />
                  </div>
                  <div className="flex items-end pb-1.5">
                    <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingZone.isVisible}
                        onChange={e => setEditingZone({ ...editingZone, isVisible: e.target.checked })}
                        className="rounded border-slate-600"
                      />
                      <span>পাবলিক ওয়েবসাইটে দৃশ্যমান রাখুন (Visible)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Zone Summary (বাংলা)</label>
                  <textarea
                    rows={2}
                    value={editingZone.draftData.summaryBn}
                    onChange={e => setEditingZone({
                      ...editingZone,
                      draftData: { ...editingZone.draftData, summaryBn: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Zone Summary (English)</label>
                  <textarea
                    rows={2}
                    value={editingZone.draftData.summaryEn}
                    onChange={e => setEditingZone({
                      ...editingZone,
                      draftData: { ...editingZone.draftData, summaryEn: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= SUB-TAB 2: LOCATION DETAIL PAGES ================= */}
      {subTab === 'areas' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: Area Selector */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-white">Areas ({filteredAreas.length})</h3>
              <button
                type="button"
                onClick={handleStartNewArea}
                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Area</span>
              </button>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="Search area or slug..."
                value={areaSearch}
                onChange={e => setAreaSearch(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
              />
              <select
                value={selectedZoneFilter}
                onChange={e => setSelectedZoneFilter(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
              >
                <option value="all">All Service Zones</option>
                {zones.map(z => (
                  <option key={z.id} value={z.slug}>{z.nameBn}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
              {filteredAreas.map(area => (
                <div
                  key={area.id}
                  className={`p-2.5 rounded-lg border transition-all flex items-center justify-between gap-2 ${
                    editingArea?.id === area.id
                      ? 'bg-emerald-950/40 border-emerald-500'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleSelectAreaForEdit(area)}
                    className="text-left flex-1 min-w-0 cursor-pointer"
                  >
                    <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                      <span>{area.areaNameBn}</span>
                      {area.isCoreCity && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          Core City
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      /service-areas/{area.slug} • v{area.version} • {area.status}
                    </div>
                  </button>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleAreaVisibility(area)}
                      className={`p-1.5 rounded border cursor-pointer ${
                        area.isVisible
                          ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                      title={area.isVisible ? 'Visible (Click to Hide)' : 'Hidden (Click to Show)'}
                    >
                      {area.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAreaToDelete(area)}
                      className="p-1.5 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/40 cursor-pointer"
                      title="Delete Area"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Rich Area Content Editor */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5">
            {!editingArea ? (
              <div className="py-20 text-center text-slate-400 text-xs space-y-2">
                <MapPin className="w-8 h-8 text-slate-600 mx-auto" />
                <div>বাম তালিকা থেকে যেকোনো একটি লোকেশন নির্বাচন করুন অথবা &quot;Add Area&quot; বাটনে ক্লিক করে নতুন এরিয়া যোগ করুন।</div>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Editor Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {isCreatingArea ? 'নতুন লোকেশন এরিয়া তৈরি' : `${editingArea.areaNameBn} (${editingArea.areaName})`}
                    </h3>
                    <div className="text-[11px] text-slate-400 font-mono">
                      /service-areas/{editingArea.slug || '...'} • Status: {editingArea.status} • v{editingArea.version}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {!isCreatingArea && editingArea.slug && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpenRevisions('zone_area', editingArea.slug, editingArea.areaNameBn)}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                        >
                          <History className="w-3.5 h-3.5" />
                          <span>History</span>
                        </button>
                        <a
                          href={`/service-areas/${editingArea.slug}?preview=1`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold rounded-lg flex items-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </a>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={handleSaveAreaDraft}
                      disabled={saving}
                      className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{saving ? 'Saving...' : 'Save Draft'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handlePublishArea}
                      disabled={publishing}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{publishing ? 'Publishing...' : 'Publish'}</span>
                    </button>
                  </div>
                </div>

                {/* Core Identification */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Area Name (বাংলা) *</label>
                    <input
                      type="text"
                      value={editingArea.areaNameBn}
                      onChange={e => setEditingArea({ ...editingArea, areaNameBn: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Area Name (English) *</label>
                    <input
                      type="text"
                      value={editingArea.areaName}
                      onChange={e => setEditingArea({ ...editingArea, areaName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">URL Slug * (স্বয়ংক্রিয় 301 রিডাইরেক্ট)</label>
                    <input
                      type="text"
                      value={editingArea.slug}
                      onChange={e => setEditingArea({ ...editingArea, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Parent Zone</label>
                    <select
                      value={editingArea.zoneSlug}
                      onChange={e => {
                        const matched = zones.find(z => z.slug === e.target.value);
                        setEditingArea({
                          ...editingArea,
                          zoneSlug: e.target.value,
                          zoneId: matched?.id || editingArea.zoneId
                        });
                      }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
                    >
                      {zones.map(z => (
                        <option key={z.id} value={z.slug}>{z.nameBn}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap gap-5 pt-1">
                  <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingArea.isVisible}
                      onChange={e => setEditingArea({ ...editingArea, isVisible: e.target.checked })}
                    />
                    <span>পাবলিক পেজ দৃশ্যমান রাখুন (Visible)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingArea.isCoreCity}
                      onChange={e => setEditingArea({ ...editingArea, isCoreCity: e.target.checked })}
                    />
                    <span>৪ মূল শহরের অংশ (Core Service City)</span>
                  </label>
                </div>

                {/* Page Headings & Intro */}
                <div className="space-y-3 bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">Page Headings &amp; Intro</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">H1 / Title (বাংলা)</label>
                      <input
                        type="text"
                        value={editingArea.draftData.titleBn}
                        onChange={e => updateDraftField('titleBn', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Title (English)</label>
                      <input
                        type="text"
                        value={editingArea.draftData.title}
                        onChange={e => updateDraftField('title', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Intro Summary (বাংলা)</label>
                      <textarea
                        rows={3}
                        value={editingArea.draftData.introBn}
                        onChange={e => updateDraftField('introBn', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Intro Summary (English)</label>
                      <textarea
                        rows={3}
                        value={editingArea.draftData.intro}
                        onChange={e => updateDraftField('intro', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Water Problems, Causes, Quality Notes, Practical Advice */}
                <div className="space-y-3 bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                      Water Problems, Causes &amp; Practical Maintenance
                    </h4>
                    <span className="text-[10px] text-amber-300 flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>কোনো কাল্পনিক ল্যাব/TDS সংখ্যা লিখবেন না</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Water Tank &amp; Pipeline Problems (বাংলা)</label>
                      <textarea
                        rows={3}
                        value={editingArea.draftData.waterProblemsBn}
                        onChange={e => updateDraftField('waterProblemsBn', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Water Tank &amp; Pipeline Problems (English)</label>
                      <textarea
                        rows={3}
                        value={editingArea.draftData.waterProblemsEn}
                        onChange={e => updateDraftField('waterProblemsEn', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Potential Causes (নন-ক্লিনিং কারণসহ — বাংলা)</label>
                      <textarea
                        rows={3}
                        value={editingArea.draftData.potentialCausesBn}
                        onChange={e => updateDraftField('potentialCausesBn', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Potential Causes (incl. plumbing/supply — English)</label>
                      <textarea
                        rows={3}
                        value={editingArea.draftData.potentialCausesEn}
                        onChange={e => updateDraftField('potentialCausesEn', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Iron &amp; Local Water Condition Note (বাংলা)</label>
                      <textarea
                        rows={3}
                        value={editingArea.draftData.waterConditionNoteBn}
                        onChange={e => updateDraftField('waterConditionNoteBn', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Iron &amp; Local Water Condition Note (English)</label>
                      <textarea
                        rows={3}
                        value={editingArea.draftData.waterConditionNote}
                        onChange={e => updateDraftField('waterConditionNote', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Practical Advice / Prevention (বাংলা)</label>
                      <textarea
                        rows={3}
                        value={editingArea.draftData.practicalAdviceBn}
                        onChange={e => updateDraftField('practicalAdviceBn', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Practical Advice / Prevention (English)</label>
                      <textarea
                        rows={3}
                        value={editingArea.draftData.practicalAdviceEn}
                        onChange={e => updateDraftField('practicalAdviceEn', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Verified Findings (With Mandatory Source & Date) */}
                <div className="space-y-3 bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Verified Water Findings (ঐচ্ছিক যাচাইকৃত তথ্য)</h4>
                      <p className="text-[11px] text-slate-400">শুধু প্রকৃত ফিল্ড পর্যবেক্ষণ বা অনুমোদিত ল্যাব রিপোর্ট থাকলে উৎস ও তারিখসহ যোগ করুন।</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const next: VerifiedFinding[] = [
                          ...(editingArea.draftData.verifiedFindings || []),
                          { summary: '', source: '', testedDate: '' }
                        ];
                        updateDraftField('verifiedFindings', next);
                      }}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold rounded-lg cursor-pointer"
                    >
                      + Add Finding
                    </button>
                  </div>

                  {(editingArea.draftData.verifiedFindings || []).map((vf, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
                      <input
                        type="text"
                        placeholder="Observation / Finding summary"
                        value={vf.summary}
                        onChange={e => {
                          const list = [...editingArea.draftData.verifiedFindings];
                          list[idx] = { ...list[idx], summary: e.target.value };
                          updateDraftField('verifiedFindings', list);
                        }}
                        className="sm:col-span-5 px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-white"
                      />
                      <input
                        type="text"
                        placeholder="Source (e.g., Field Check / Lab)"
                        value={vf.source}
                        onChange={e => {
                          const list = [...editingArea.draftData.verifiedFindings];
                          list[idx] = { ...list[idx], source: e.target.value };
                          updateDraftField('verifiedFindings', list);
                        }}
                        className="sm:col-span-4 px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-white"
                      />
                      <input
                        type="text"
                        placeholder="Date (YYYY-MM-DD)"
                        value={vf.testedDate}
                        onChange={e => {
                          const list = [...editingArea.draftData.verifiedFindings];
                          list[idx] = { ...list[idx], testedDate: e.target.value };
                          updateDraftField('verifiedFindings', list);
                        }}
                        className="sm:col-span-2 px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const list = editingArea.draftData.verifiedFindings.filter((_, i) => i !== idx);
                          updateDraftField('verifiedFindings', list);
                        }}
                        className="sm:col-span-1 p-1.5 bg-rose-950/60 text-rose-400 rounded hover:bg-rose-900/60 flex items-center justify-center cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Coverage Details & Pricing Factors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
                    <label className="block text-xs font-bold text-white">Sub-Areas / Coverage List (প্রতি লাইনে একটি)</label>
                    <textarea
                      rows={4}
                      value={(editingArea.draftData.coverageDetails || []).join('\n')}
                      onChange={e => updateDraftField('coverageDetails', e.target.value.split('\n').filter(Boolean))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                    />
                  </div>
                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
                    <label className="block text-xs font-bold text-white">Pricing Factors (প্রতি লাইনে একটি)</label>
                    <textarea
                      rows={4}
                      value={(editingArea.draftData.pricingFactors || []).join('\n')}
                      onChange={e => updateDraftField('pricingFactors', e.target.value.split('\n').filter(Boolean))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                    />
                  </div>
                </div>

                {/* Area FAQs */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Location FAQs ({(editingArea.draftData.faqs || []).length})</h4>
                    <button
                      type="button"
                      onClick={() => {
                        const next: ZoneAreaFaq[] = [
                          ...(editingArea.draftData.faqs || []),
                          { question: '', answer: '' }
                        ];
                        updateDraftField('faqs', next);
                      }}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-semibold rounded-lg cursor-pointer"
                    >
                      + Add FAQ
                    </button>
                  </div>

                  {(editingArea.draftData.faqs || []).map((faq, idx) => (
                    <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Question"
                          value={faq.question}
                          onChange={e => {
                            const list = [...editingArea.draftData.faqs];
                            list[idx] = { ...list[idx], question: e.target.value };
                            updateDraftField('faqs', list);
                          }}
                          className="flex-1 px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const list = editingArea.draftData.faqs.filter((_, i) => i !== idx);
                            updateDraftField('faqs', list);
                          }}
                          className="p-1.5 bg-rose-950/60 text-rose-400 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        placeholder="Answer"
                        value={faq.answer}
                        onChange={e => {
                          const list = [...editingArea.draftData.faqs];
                          list[idx] = { ...list[idx], answer: e.target.value };
                          updateDraftField('faqs', list);
                        }}
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-white"
                      />
                    </div>
                  ))}
                </div>

                {/* SEO & Open Graph Metadata */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    <span>Area SEO, Hero Image &amp; Open Graph Tags</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">SEO Meta Title</label>
                      <input
                        type="text"
                        value={editingArea.draftData.seoTitle || ''}
                        onChange={e => updateDraftField('seoTitle', e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">OG Title</label>
                      <input
                        type="text"
                        value={editingArea.draftData.ogTitle || ''}
                        onChange={e => updateDraftField('ogTitle', e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Meta Description</label>
                      <textarea
                        rows={2}
                        value={editingArea.draftData.metaDesc}
                        onChange={e => updateDraftField('metaDesc', e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">OG Description</label>
                      <textarea
                        rows={2}
                        value={editingArea.draftData.ogDescription || ''}
                        onChange={e => updateDraftField('ogDescription', e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">OG Image URL (1200x630 HTTPS)</label>
                      <input
                        type="url"
                        value={editingArea.draftData.ogImage || ''}
                        onChange={e => updateDraftField('ogImage', e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">OG / Hero Image Alt Text</label>
                      <input
                        type="text"
                        value={editingArea.draftData.ogImageAlt || ''}
                        onChange={e => updateDraftField('ogImageAlt', e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Revision History Modal */}
      {revisionsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-lg w-full max-h-[80vh] flex flex-col space-y-3 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-cyan-400" />
                <span>Revision History: {revisionsTargetLabel}</span>
              </h3>
              <button
                type="button"
                onClick={() => setRevisionsOpen(false)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="overflow-y-auto space-y-2 flex-1 pr-1">
              {revisionsLoading ? (
                <div className="py-8 text-center text-xs text-slate-400">রিভিশন লোড হচ্ছে...</div>
              ) : revisionsList.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">কোনো পূর্ববর্তী রিভিশন পাওয়া যায়নি।</div>
              ) : (
                revisionsList.map(rev => (
                  <div key={rev.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-white">Version v{rev.version}</div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(rev.createdAt).toLocaleString()} {rev.createdBy ? `• ${rev.createdBy}` : ''}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRollbackRevision(rev)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Load Draft</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Area Confirmation Modal */}
      {areaToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Delete Service Area?</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              আপনি কি নিশ্চিতভাবে <strong>{areaToDelete.areaNameBn}</strong> (`/service-areas/{areaToDelete.slug}`) ডিলিট করতে চান?
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setAreaToDelete(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteArea}
                className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 cursor-pointer"
              >
                Yes, Delete Area
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceZoneManagerTab;
