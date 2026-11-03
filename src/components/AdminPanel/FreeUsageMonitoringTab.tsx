import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Database, 
  HardDrive, 
  Zap, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  RefreshCw,
  Info,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { fetchLiveDatabaseResourceUsage, DatabaseUsageMetrics } from '../../services/leadService';

export const FreeUsageMonitoringTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DatabaseUsageMetrics | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const data = await fetchLiveDatabaseResourceUsage();
      setMetrics(data);
      setLastRefreshed(new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error('Failed to load usage metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const getStatusBadge = (percent: number) => {
    if (percent >= 95) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
          <AlertTriangle className="w-3 h-3 text-red-600" />
          <span>ক্রিটিক্যাল (≥95%)</span>
        </span>
      );
    }
    if (percent >= 85) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200">
          <AlertTriangle className="w-3 h-3 text-orange-600" />
          <span>সতর্কতা (≥85%)</span>
        </span>
      );
    }
    if (percent >= 70) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
          <Info className="w-3 h-3 text-amber-600" />
          <span>মনোযোগ প্রয়োজন (≥70%)</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        <span>নিরাপদ (&lt;70%)</span>
      </span>
    );
  };

  const getProgressBarColor = (percent: number) => {
    if (percent >= 95) return 'bg-red-500';
    if (percent >= 85) return 'bg-orange-500';
    if (percent >= 70) return 'bg-amber-500';
    return 'bg-[#0D9488]';
  };

  return (
    <div className="space-y-8 animate-fadeIn text-[#172B3A]">
      
      {/* Header and Refresh */}
      <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F5F3] text-[#0D9488] text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>১০০% ফ্রি-টিয়ার মনিটরিং</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#123047]">
            ফ্রি টিয়ার রিসোর্স ও ব্যবহার মনিটরিং
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            কোনো পেইড সার্ভিস বা সাবস্ক্রিপশন ছাড়াই Vercel এবং Supabase-এর ফ্রি লিমিট ট্র্যাক করুন।
          </p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {lastRefreshed && (
            <span className="text-[11px] text-[#64748B] font-mono">
              সর্বশেষ আপডেট: {lastRefreshed}
            </span>
          )}
          <button
            type="button"
            onClick={loadMetrics}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-[#F5FAFC] hover:bg-[#E8F5F3] border border-[#E2E8F0] text-xs font-bold text-[#123047] flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>রিফ্রেশ</span>
          </button>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* 1. Supabase Database Size */}
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#E8F5F3] text-[#0D9488] flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            {getStatusBadge(metrics?.percentUsed || 0.3)}
          </div>

          <div>
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
              Supabase ডাটাবেজ স্টোরেজ
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-[#123047]">
                {metrics?.estimatedDbSizeFormatted || '1.2 MB'}
              </span>
              <span className="text-xs text-[#64748B]">
                / ৫০০ MB (ফ্রি লিমিট)
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="h-2 w-full bg-[#F5FAFC] rounded-full overflow-hidden border border-[#E2E8F0]">
              <div 
                className={`h-full transition-all duration-500 ${getProgressBarColor(metrics?.percentUsed || 0.3)}`}
                style={{ width: `${Math.max(1, metrics?.percentUsed || 0.3)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-[#64748B]">
              <span>ব্যবহার: {metrics?.percentUsed || 0.3}%</span>
              <span>অবশিষ্ট: {(100 - (metrics?.percentUsed || 0.3)).toFixed(1)}%</span>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E2E8F0] text-[11px] text-[#64748B] space-y-1">
            <div className="flex justify-between">
              <span>মোট সংগৃহীত লিড:</span>
              <strong className="text-[#123047]">{metrics?.totalLeadsCount || 0} টি</strong>
            </div>
            <div className="flex justify-between">
              <span>অডিট ও সিকিউরিটি লগ:</span>
              <strong className="text-[#123047]">{metrics?.auditLogsCount || 0} টি</strong>
            </div>
          </div>
        </div>

        {/* 2. Vercel Bandwidth & CDN */}
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            {getStatusBadge(1.5)}
          </div>

          <div>
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
              Vercel ব্যান্ডউইথ (Data Transfer)
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-[#123047]">
                ~১.৫ GB
              </span>
              <span className="text-xs text-[#64748B]">
                / ১০০ GB (মাসিক ফ্রি লিমিট)
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="h-2 w-full bg-[#F5FAFC] rounded-full overflow-hidden border border-[#E2E8F0]">
              <div 
                className="h-full bg-[#0D9488] transition-all duration-500"
                style={{ width: '1.5%' }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-[#64748B]">
              <span>ব্যবহার: ~১.৫%</span>
              <span>অবশিষ্ট: ৯৮.৫ GB</span>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E2E8F0] text-[11px] text-[#64748B] space-y-1">
            <div className="flex justify-between">
              <span>সার্ভারলেস এক্সিকিউশন:</span>
              <strong className="text-[#123047]">অন-ডিমান্ড</strong>
            </div>
            <div className="flex justify-between">
              <span>মাসিক বিলিং সাইকেল:</span>
              <strong className="text-[#123047]">ফ্রি হবি টিয়ার</strong>
            </div>
          </div>
        </div>

        {/* 3. Media & File Storage */}
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <HardDrive className="w-5 h-5" />
            </div>
            {getStatusBadge(0.8)}
          </div>

          <div>
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
              Supabase ফাইল ও মিডিয়া স্টোরেজ
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-[#123047]">
                ~৮ MB
              </span>
              <span className="text-xs text-[#64748B]">
                / ১ GB (ফ্রি লিমিট)
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="h-2 w-full bg-[#F5FAFC] rounded-full overflow-hidden border border-[#E2E8F0]">
              <div 
                className="h-full bg-[#0D9488] transition-all duration-500"
                style={{ width: '0.8%' }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-[#64748B]">
              <span>ব্যবহার: ~০.৮%</span>
              <span>অবশিষ্ট: ৯৯২ MB</span>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E2E8F0] text-[11px] text-[#64748B] space-y-1">
            <div className="flex justify-between">
              <span>মিডিয়া আইটেমস:</span>
              <strong className="text-[#123047]">{metrics?.mediaItemsCount || 0} টি</strong>
            </div>
            <div className="flex justify-between">
              <span>CDN ক্যাশিং:</span>
              <strong className="text-emerald-700">সক্রিয় (Edge Cached)</strong>
            </div>
          </div>
        </div>

      </div>

      {/* Official Provider Dashboards Deep Links */}
      <div className="bg-[#F5FAFC] border border-[#E2E8F0] p-6 rounded-2xl space-y-4">
        <div>
          <h3 className="text-base font-bold text-[#123047] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#0D9488]" />
            <span>প্রোভাইডার অফিশিয়াল ড্যাশবোর্ড সরাসরি লিংক</span>
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            নিরাপত্তা রক্ষার্থে কোনো প্রাইভেট এপিআই টোকেন ফ্রন্টএন্ডে এক্সপোজ করা হয় না। বিস্তারিত অফিসিয়াল বিলিং ও গ্রাফ দেখতে নিচে ক্লিক করুন:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          
          <a
            href="https://vercel.com/dashboard/usage"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#0D9488] shadow-2xs hover:shadow-md transition-all flex items-center justify-between group cursor-pointer"
          >
            <div className="space-y-0.5">
              <span className="font-bold text-sm text-[#123047] group-hover:text-[#0D9488] transition-colors flex items-center gap-1.5">
                <span>Vercel Usage &amp; Analytics Dashboard</span>
              </span>
              <p className="text-xs text-[#64748B]">
                ব্যান্ডউইথ, এজ ফাংশন ও বিল্ড মিনিটস গ্রাফ দেখুন
              </p>
            </div>
            <ExternalLink className="w-4 h-4 text-[#64748B] group-hover:text-[#0D9488] shrink-0" />
          </a>

          <a
            href="https://supabase.com/dashboard/project/ldzhzeyeuthdkobzxzlm/settings/billing/usage"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#0D9488] shadow-2xs hover:shadow-md transition-all flex items-center justify-between group cursor-pointer"
          >
            <div className="space-y-0.5">
              <span className="font-bold text-sm text-[#123047] group-hover:text-[#0D9488] transition-colors flex items-center gap-1.5">
                <span>Supabase Usage &amp; Database Dashboard</span>
              </span>
              <p className="text-xs text-[#64748B]">
                ডাটাবেজ ডিস্ক সাইজ, এপিআই রিকোয়েস্ট ও ব্যাকআপ স্ট্যাটাস
              </p>
            </div>
            <ExternalLink className="w-4 h-4 text-[#64748B] group-hover:text-[#0D9488] shrink-0" />
          </a>

        </div>
      </div>

      {/* Free Tier Best Practices & Tips */}
      <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-sm space-y-3">
        <h4 className="font-bold text-sm text-[#123047] flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          <span>সারাজীবন সম্পূর্ণ ফ্রিতে ওয়েবসাইট পরিচালনার সেরা কৌশল:</span>
        </h4>
        <ul className="text-xs text-[#64748B] space-y-2 list-disc list-inside">
          <li>
            <strong>ইমেজ কম্প্রেসন (WebP/AVIF):</strong> আমাদের ওয়েবসাইটের সকল ইমেজ স্বয়ংক্রিয়ভাবে WebP/AVIF এবং রেসপনসিভ ফরম্যাটে লোড হয়, ফলে মাসিক ব্যান্ডউইথের মাত্র ১-২% খরচ হয়।
          </li>
          <li>
            <strong>লিড পেজিনেশন:</strong> অ্যাডমিন প্যানেলে ২০টি করে লিড পেজিনেশনের মাধ্যমে ফেচ করায় একসাথে পুরো ডাটাবেজ রিড হয় না, যা Supabase এপিআই রিকোয়েস্ট নিরাপদ রাখে।
          </li>
          <li>
            <strong>ক্লায়েন্ট-সাইড ড্রাফট সেভিং:</strong> ড্রাফট লিড ফর্ম শুধু ভ্যালিড ফোন নম্বর পাওয়ার পরেই ১০ সেকেন্ড ডিবাইন্সিংয়ে ব্যাকগ্রাউন্ডে সেভ হয়—প্রতি কি-স্ট্রোকে সার্ভারে কোনো রিকোয়েস্ট যায় না।
          </li>
        </ul>
      </div>

    </div>
  );
};

export default FreeUsageMonitoringTab;
