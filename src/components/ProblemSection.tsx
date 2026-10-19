import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  Layers, 
  Droplet, 
  Wind, 
  Eye,
  CheckCircle2
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ProblemSectionProps {
  onCheckPrice?: () => void;
}

export const ProblemSection: React.FC<ProblemSectionProps> = ({ onCheckPrice = () => {} }) => {
  const { lang, t } = useLanguage();
  const [sliderPos, setSliderPos] = useState(50);

  const problemPoints = [
    {
      icon: Layers,
      titleEn: 'Sediment & Dirt',
      titleBn: 'ওয়াসার বালু ও তলদেশের পলি',
      descEn: 'Suspended silt and municipal sediment gradually form a thick layer at the base of the tank.',
      descBn: 'ওয়াসা লাইন থেকে আসা সূক্ষ্ম বালুকণা ও কাদামাটি ধীরে ধীরে ট্যাংকের তলায় পুরু স্তরে রূপ নেয়।'
    },
    {
      icon: Droplet,
      titleEn: 'Mud & Heavy Slurry',
      titleBn: 'ভারী কাদা ও বিষাক্ত স্লাজ',
      descEn: 'Over months, settled silt turns into thick mud that gets drawn into taps when water levels get low.',
      descBn: 'মাস পর মাস পরিষ্কার না করলে তলদেশে জমে থাকা পলি দুর্গন্ধযুক্ত বিষাক্ত স্লাজে পরিণত হয়।'
    },
    {
      icon: Sparkles,
      titleEn: 'Algae Buildup',
      titleBn: 'দেয়ালে পিচ্ছিল শ্যাওলার আস্তরণ',
      descEn: 'Sunlight on rooftop tanks promotes green and brown algae coating the interior walls.',
      descBn: 'ছাদে সূর্যের তীব্র তাপে পিভিসি ট্যাংকের ভেতরের অংশে দ্রুত ক্ষতিকর সবুজ শ্যাওলা জন্ম নেয়।'
    },
    {
      icon: AlertTriangle,
      titleEn: 'Unwanted Deposits',
      titleBn: 'আয়রন ও রাসায়নিক স্তর',
      descEn: 'Hard water minerals and iron leave stubborn stains and sticky biofilm on tank surfaces.',
      descBn: 'পানিতে থাকা খনিজ আয়রন ট্যাংকের দেয়ালে লালচে-হলুদ দাগ ও দুর্গন্ধযুক্ত আস্তরণ তৈরি করে।'
    },
    {
      icon: Wind,
      titleEn: 'Bad Smell',
      titleBn: 'পানিতে দুর্গন্ধ ও অস্বস্তি',
      descEn: 'Stagnant residue and organic matter in bottom sediment create unpleasant odors in household water.',
      descBn: 'তলদেশের কাদায় ব্যাকটেরিয়া জন্মানোর কারণে ব্যবহারের পানিতে দুর্গন্ধ ও মুখে অস্বস্তি লাগে।'
    },
    {
      icon: Eye,
      titleEn: 'Visible Contamination',
      titleBn: 'ট্যাপ ও শাওয়ারে ঘোলা পানি',
      descEn: 'Discolored, brownish, or cloudy water from showers, kitchen sinks, and washing machines.',
      descBn: 'বেসিন, বাথরুমের কল ও ওয়াশিং মেশিনে লালচে, হলুদ বা ঘোলা পানি পড়তে দেখা যায়।'
    }
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      setSliderPos(pos => Math.max(5, pos - 5));
    } else if (e.key === 'ArrowRight') {
      setSliderPos(pos => Math.min(95, pos + 5));
    }
  };

  return (
    <section className="py-14 sm:py-20 bg-white border-b border-slate-200" id="problem" aria-labelledby="problem-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold uppercase tracking-wider border border-amber-200 mb-3">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-700" aria-hidden="true" />
            {t('problem.tag')}
          </span>
          <h2 id="problem-heading" className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0B2B5C] tracking-tight">
            {t('problem.h2')}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            {t('problem.sub')}
          </p>
        </div>

        {/* Visual Comparison: Uncleaned vs Cleaned Tank Slider */}
        <div className="mb-14 max-w-4xl mx-auto">
          <div className="bg-slate-900 rounded-3xl p-3 sm:p-5 shadow-2xl overflow-hidden border border-slate-800">
            
            <div className="flex items-center justify-between px-2 mb-3 text-white text-xs sm:text-sm font-semibold">
              <span className="flex items-center gap-1.5 text-amber-300">
                <span className="w-2 h-2 rounded-full bg-amber-400" aria-hidden="true" />
                {lang === 'bn' ? 'পূর্বে: শ্যাওলা, কাদা ও আয়রন' : 'Before: Mud, Algae & Sediment'}
              </span>
              <span className="text-slate-400 hidden sm:inline">|</span>
              <span className="flex items-center gap-1.5 text-cyan-300">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                {lang === 'bn' ? 'পরে: সম্পূর্ণ পরিষ্কার ও স্যানিটাইজড' : 'After: Hygienic Deep Clean'}
              </span>
            </div>

            {/* Interactive Before/After Split */}
            <div 
              className="relative w-full aspect-[16/10] sm:h-96 rounded-2xl overflow-hidden cursor-ew-resize select-none touch-none focus-visible:outline-2 focus-visible:outline-cyan-400"
              tabIndex={0}
              role="slider"
              aria-label="Before and after tank cleaning image comparison slider"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(sliderPos)}
              onKeyDown={handleKeyDown}
              onMouseMove={(e) => {
                if (e.buttons === 1) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pos = ((e.clientX - rect.left) / rect.width) * 100;
                  setSliderPos(Math.min(Math.max(pos, 5), 95));
                }
              }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = ((e.clientX - rect.left) / rect.width) * 100;
                setSliderPos(Math.min(Math.max(pos, 5), 95));
              }}
              onTouchMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const touch = e.touches[0];
                const pos = ((touch.clientX - rect.left) / rect.width) * 100;
                setSliderPos(Math.min(Math.max(pos, 5), 95));
              }}
            >
              {/* After Image (Full background) */}
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=75')`
                }}
              >
                <div className="absolute top-4 right-4 bg-cyan-950/90 backdrop-blur-md text-cyan-200 text-xs font-extrabold px-3 py-1.5 rounded-full border border-cyan-400/40 shadow-lg">
                  {lang === 'bn' ? 'সানভিলোজ ক্লিনের পর' : 'Clean & Decontaminated'}
                </div>
              </div>

              {/* Before Image (Clipped Left overlay) */}
              <div 
                className="absolute inset-0 bg-cover bg-center overflow-hidden border-r-2 border-white filter contrast-125"
                style={{
                  width: `${sliderPos}%`,
                  backgroundImage: `url('https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=1200&q=75')`
                }}
              >
                <div className="absolute inset-0 bg-amber-950/40 mix-blend-multiply" />
                <div className="absolute top-4 left-4 bg-amber-950/90 backdrop-blur-md text-amber-200 text-xs font-extrabold px-3 py-1.5 rounded-full border border-amber-500/40 shadow-lg">
                  {lang === 'bn' ? 'অপরিচ্ছন্ন নোংরা ট্যাংক' : 'Uncleaned Neglected Tank'}
                </div>
              </div>

              {/* Slider Handle Divider */}
              <div 
                className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl flex items-center justify-center pointer-events-none"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="w-8 h-8 rounded-full bg-white text-[#0B2B5C] font-bold text-xs shadow-xl flex items-center justify-center border-2 border-cyan-500" aria-hidden="true">
                  ↔
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-slate-400 mt-3">
              {lang === 'bn' 
                ? 'স্লাইডারটি ডানে-বামে টেনে পরিষ্কারের দৃশ্যমান পার্থক্য দেখুন'
                : 'Slide left and right or use arrow keys to inspect the transformation achieved by our pressure-jet system'}
            </p>
          </div>
        </div>

        {/* 6 Problem Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {problemPoints.map((item, i) => {
            const IconComponent = item.icon;
            return (
              <div 
                key={i}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100/70 text-[#0B2B5C] group-hover:bg-[#0B2B5C] group-hover:text-cyan-300 transition-colors flex items-center justify-center mb-3" aria-hidden="true">
                  <IconComponent className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0B2B5C] transition-colors">
                  {lang === 'bn' ? item.titleBn : item.titleEn}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                  {lang === 'bn' ? item.descBn : item.descEn}
                </p>
              </div>
            );
          })}
        </div>

        {/* Section Conversion CTA Button */}
        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={onCheckPrice}
            className="min-h-[44px] inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#0B2B5C] hover:bg-[#0E3A75] text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all transform active:scale-95 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#0B2B5C]"
          >
            <span>{t('problem.cta')}</span>
            <ArrowRight className="w-4 h-4 text-cyan-300" aria-hidden="true" />
          </button>
        </div>

      </div>
    </section>
  );
};
