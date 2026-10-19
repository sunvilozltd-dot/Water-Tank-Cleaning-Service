import React, { useState, useRef } from 'react';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { useHeaderNav } from '../../context/HeaderNavContext';
import { Settings, Save, Check, Video, Phone, Mail, MapPin, Upload, Droplets, RefreshCw } from 'lucide-react';
import { compressImageFile } from '../../utils/imageCompressor';

interface SettingsTabProps {
  onGoToHeroVideo?: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ onGoToHeroVideo }) => {
  const { business, hero, images, updateBusinessConfig, updateHeroConfig, updateSiteImages } = useSiteConfig();
  const { headerConfig, saveHeader } = useHeaderNav();
  const [phone, setPhone] = useState(business.phone);
  const [email, setEmail] = useState(business.email);
  const [address, setAddress] = useState(business.address);
  const [headlineBn, setHeadlineBn] = useState(hero.headingBn || 'ঢাকায় প্রফেশনাল ওয়াটার ট্যাংক ক্লিনিং সার্ভিস');
  const [saved, setSaved] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoMessage, setLogoMessage] = useState('');
  const logoFileRef = useRef<HTMLInputElement>(null);

  const activeLogo = headerConfig.logoUrl || images?.logo || '';

  const handleSave = () => {
    updateBusinessConfig({ phone, email, address });
    updateHeroConfig({ headingBn: headlineBn });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setLogoMessage('Please select a PNG, SVG, JPG, or WebP image.');
      return;
    }

    setUploadingLogo(true);
    setLogoMessage('');

    try {
      const dataUrl = await compressImageFile(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.9,
        preserveTransparency: true
      });
      await saveHeader({ ...headerConfig, logoUrl: dataUrl, logoEnabled: true });
      updateSiteImages({ logo: dataUrl });
      setLogoMessage('Logo updated successfully!');
      setTimeout(() => setLogoMessage(''), 4000);
    } catch (err) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const url = event.target?.result as string;
        await saveHeader({ ...headerConfig, logoUrl: url, logoEnabled: true });
        updateSiteImages({ logo: url });
        setLogoMessage('Logo updated successfully!');
        setTimeout(() => setLogoMessage(''), 4000);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingLogo(false);
      if (logoFileRef.current) logoFileRef.current.value = '';
    }
  };

  const handleRemoveLogo = async () => {
    await saveHeader({ ...headerConfig, logoUrl: '', logoEnabled: true });
    updateSiteImages({ logo: '' });
    setLogoMessage('Logo removed. Default droplet icon restored.');
    setTimeout(() => setLogoMessage(''), 4000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            <span>Site General Settings</span>
          </h2>
          <p className="text-xs text-slate-400">Manage business contacts, branding logo, hotline numbers, and basic defaults.</p>
        </div>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow transition-colors cursor-pointer"
        >
          {saved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
          <span>{saved ? 'Saved!' : 'Save Settings'}</span>
        </button>
      </div>

      {/* Brand Logo Upload Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-400" />
              <span>Brand Logo (ওয়েবসাইট লোগো)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Upload your company logo (PNG, SVG, or JPG). Transparent PNG or SVG is recommended.
            </p>
          </div>
          {logoMessage && (
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-800">
              {logoMessage}
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-5 pt-2">
          {/* Logo Visual Preview */}
          <div className="w-24 h-24 rounded-2xl bg-slate-950 border-2 border-slate-700 p-2 flex items-center justify-center shrink-0">
            {activeLogo ? (
              <img
                src={activeLogo}
                alt="Brand Logo"
                className="max-w-full max-h-full object-contain"
                style={{ width: `${headerConfig.logoWidth || 40}px` }}
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Droplets className="w-5 h-5" />
              </div>
            )}
          </div>

          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap gap-2">
              <input
                ref={logoFileRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => logoFileRef.current?.click()}
                disabled={uploadingLogo}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>{uploadingLogo ? 'Uploading...' : 'Upload Logo File'}</span>
              </button>

              {activeLogo && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="px-3 py-2 bg-rose-950/40 hover:bg-rose-950/70 text-rose-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-rose-900/30 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Restore Default</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span>Display Width:</span>
              <div className="flex gap-1.5 font-mono">
                {[36, 40, 48, 56, 64].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => saveHeader({ ...headerConfig, logoWidth: size, logoHeight: size })}
                    className={`px-2 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                      (headerConfig.logoWidth || 40) === size
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {size}px
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Video Banner Link */}
      <div className="bg-blue-950/40 border border-blue-800/50 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue-600 text-white">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Homepage Hero Video Settings</h4>
            <p className="text-xs text-blue-300">
              Customize full-width cleaning service background video, mobile video, poster, and overlay opacity.
            </p>
          </div>
        </div>
        {onGoToHeroVideo && (
          <button
            onClick={onGoToHeroVideo}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg cursor-pointer"
          >
            Customize Hero Video →
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white">Contact Information</h3>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Hotline / Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Official Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Office Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
            />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white">Bengali Headline</h3>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Hero Main Heading (Bengali)</label>
            <input
              type="text"
              value={headlineBn}
              onChange={(e) => setHeadlineBn(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
            />
            <p className="text-[11px] text-slate-500 mt-1">Default: &quot;ঢাকায় প্রফেশনাল ওয়াটার ট্যাংক ক্লিনিং সার্ভিস&quot;</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
