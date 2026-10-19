import React from 'react';
import { 
  ShieldCheck, 
  Layers, 
  Building, 
  Wrench, 
  CheckCircle2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface SupportedTankMaterialsSectionProps {
  onOpenQuoteModal?: (serviceName?: string) => void;
  onNavigate?: (path: string) => void;
}

export const SupportedTankMaterialsSection: React.FC<SupportedTankMaterialsSectionProps> = ({
  onOpenQuoteModal,
  onNavigate
}) => {
  const { lang } = useLanguage();

  const materials = [
    {
      id: 'plastic',
      nameEn: 'Plastic & PVC Tanks',
      nameBn: 'প্লাস্টিক ও পিভিসি ট্যাংক',
      type: 'Overhead Rooftop',
      typeBn: 'ছাদের ওভারহেড ট্যাংক',
      descriptionEn: 'Safe high-pressure jet cleaning specifically calibrated to prevent wall erosion, stress cracks, or seam breakage on PVC & rotomold tanks.',
      descriptionBn: 'বিশেষভাবে ক্যালিব্রেটেড ওয়াটার জেটে পিভিসি ও প্লাস্টিক ট্যাংকের দেয়াল সম্পূর্ণ অক্ষত রেখে সব ধরনের শ্যাওলা ও কাদা দূর করা হয়।',
      featuresEn: ['Zero surface scratching', 'Algae & biofilm eradication', 'Lid and valve seal check'],
      featuresBn: ['সারফেসে কোনো দাগ বা স্ক্র্যাচ পড়ে না', 'সবুজ শ্যাওলা ও পিচ্ছিল বায়োফিল্ম দূরীকরণ', 'ঢাকনা ও আউটলেট সিলিং পরীক্ষা'],
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
    },
    {
      id: 'concrete',
      nameEn: 'Concrete & RCC Tanks',
      nameBn: 'কংক্রিট ও আরসিসি ট্যাংক',
      type: 'Underground & Rooftop',
      typeBn: 'আন্ডারগ্রাউন্ড ও ছাদের পাকা ট্যাংক',
      descriptionEn: 'Deep mechanical descaling, sump pit evacuation, and food-grade sanitization for high-capacity subterranean concrete reservoirs and apartment roof tanks.',
      descriptionBn: 'মাটির নিচের পাকা আরসিসি রিজার্ভারের তলদেশের ভারী ওয়াসা কাদা, স্লাজ ও শ্যাওলা গভীর ভ্যাকুমিং ও স্যানিটাইজেশন।',
      featuresEn: ['Heavy slurry mud evacuation', 'Floor & wall rotary scouring', 'Seepage & crack inspection'],
      featuresBn: ['সাবমারসিবল পাম্পে ভারী কাদা নিস্কাশন', 'দেয়াল ও মেঝের রোটারি জেট স্ক্রাবিং', 'ওয়াল ক্র্যাক ও পানি চুইয়ে পড়া নিরীক্ষা'],
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    },
    {
      id: 'steel',
      nameEn: 'Stainless Steel Tanks',
      nameBn: 'স্টেইনলেস স্টিল ট্যাংক',
      type: 'Overhead & Commercial',
      typeBn: 'ছাদের ও বাণিজ্যিক স্টিল ট্যাংক',
      descriptionEn: 'Gentle non-abrasive food-grade sanitization for modern SS water tanks, preventing oxidation and preserving mirror-finish hygiene.',
      descriptionBn: 'আধুনিক স্টেইনলেস স্টিল ট্যাংকের ফিনিশিং অক্ষত রেখে সম্পূর্ণ খাদ্য-বান্ধব নিরাপদ জীবাণুমুক্তকরণ ও রিন্সিং।',
      featuresEn: ['Non-scratch microfiber washing', 'Scale and rust prevention', 'Spotless potable water handover'],
      featuresBn: ['নন-স্ক্র্যাচ বিশেষ ওয়াশ', 'আয়রন ও চুন জমার বিরুদ্ধে কার্যকর', '১০০% বিশুদ্ধ পানি সংরক্ষণের প্রস্তুতি'],
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
    },
    {
      id: 'pipeline',
      nameEn: 'Water Distribution Pipelines',
      nameBn: 'পানির সরবরাহ পাইপলাইন',
      type: 'CPVC, PPR, PVC & GI',
      typeBn: 'সিপিভিসি, পিপিআর, পিভিসি ও জিআই লাইন',
      descriptionEn: 'Non-invasive hydro-pulse air-water flushing directly through tap fixtures. Zero wall breaking, zero tile damage.',
      descriptionBn: 'কোনো দেয়াল বা টাইলস না কেটে বিদ্যমান কলের মুখ থেকেই প্রেসারাইজড পালসিং পদ্ধতিতে পাইপের ভেতরের জমে থাকা আয়রন পরিষ্কার।',
      featuresEn: ['Restores shower & tap flow', 'Clears reddish iron water', 'Zero wall cutting or damage'],
      featuresBn: ['শাওয়ার ও কলের পানির স্পিড বৃদ্ধি', 'ট্যাপে লালচে বা দুর্গন্ধযুক্ত পানি দূরীকরণ', 'কোনো দেয়াল বা টাইলস ভাঙতে হয় না'],
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    }
  ];

  return (
    <section 
      id="supported-materials"
      aria-labelledby="supported-materials-heading"
      className="py-14 sm:py-20 bg-gradient-to-b from-[#051122] via-[#071932] to-[#06152B] border-b border-cyan-900/35 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-cyan-400 uppercase mb-2.5">
            <Layers className="w-4 h-4 text-cyan-400" aria-hidden="true" />
            <span>{lang === 'bn' ? 'ট্যাংকের উপাদান ও ধরন' : 'Supported Tank Types & Materials'}</span>
          </div>

          <h2 
            id="supported-materials-heading"
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight"
          >
            {lang === 'bn' 
              ? 'প্লাস্টিক, আরসিসি কংক্রিট ও স্টিল — সব ধরনের ট্যাংকে নিরাপদ' 
              : 'Safe for Plastic, Concrete, and Steel Water Tanks'}
          </h2>

          <div className="w-20 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent mx-auto my-3.5 rounded-full" />

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {lang === 'bn'
              ? 'আমাদের বিশেষায়িত সরঞ্জাম ও পদ্ধতি ট্যাংকের উপাদানের ক্ষতি না করে গভীর জীবাণুমুক্তকরণ নিশ্চিত করে।'
              : 'Our calibrated equipment and non-toxic food-grade agents protect your tank structure while completely eradicating slime and bacteria.'}
          </p>
        </div>

        {/* 4 Materials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {materials.map((item) => (
            <div 
              key={item.id}
              className="bg-[#07172C]/90 rounded-2xl p-6 border border-cyan-800/40 hover:border-cyan-400/60 transition-all flex flex-col justify-between shadow-lg group hover:-translate-y-1"
            >
              <div className="space-y-3">
                <span className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-md border ${item.badgeColor}`}>
                  {lang === 'bn' ? item.typeBn : item.type}
                </span>

                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {lang === 'bn' ? item.nameBn : item.nameEn}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {lang === 'bn' ? item.descriptionBn : item.descriptionEn}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-cyan-900/40">
                  {(lang === 'bn' ? item.featuresBn : item.featuresEn).map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-1.5 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-cyan-900/30">
                <button
                  type="button"
                  onClick={() => onOpenQuoteModal && onOpenQuoteModal(item.nameEn)}
                  className="w-full py-2 px-3 rounded-lg bg-cyan-950/60 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-800/50 hover:border-cyan-500 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>{lang === 'bn' ? 'কোটেশন জানুন' : 'Get Quote'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
