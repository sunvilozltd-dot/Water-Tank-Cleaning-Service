export interface ProblemQaItem {
  id: string;
  slug: string;
  problemCategoryBn: string;
  problemCategoryEn: string;
  questionBn: string;
  questionEn: string;
  directAnswerBn: string;
  directAnswerEn: string;
  keyPointsBn: string[];
  keyPointsEn: string[];
  nonCleaningCausesBn: string;
  nonCleaningCausesEn: string;
  relatedServicePath: string;
  relatedServiceLabelBn: string;
  relatedServiceLabelEn: string;
}

export const PROBLEM_QA_ITEMS: ProblemQaItem[] = [
  {
    id: 'dirty-muddy-water',
    slug: 'dirty-muddy-water',
    problemCategoryBn: 'ট্যাংকের পানি ময়লা ও ঘোলা',
    problemCategoryEn: 'Dirty or Muddy Tank Water',
    questionBn: 'পানির ট্যাংক থেকে ময়লা বা ঘোলা পানি বের হওয়ার কারণ ও সমাধান কী?',
    questionEn: 'Why is muddy or cloudy water coming from the tank, and how is it solved?',
    directAnswerBn:
      'সরবরাহ লাইনের বালি, কাদা ও ক্ষুদ্র পলি দীর্ঘদিন রিজার্ভ এবং ওভারহেড ট্যাংকের তলদেশে জমে ঘোলা পানি তৈরি করে। মেকানাইজড স্লাজ পাম্প দিয়ে কাদা নিষ্কাশন ও হাই-প্রেসার রোটারি জেট ওয়াশের মাধ্যমে ট্যাংক পরিষ্কার করা সবচেয়ে কার্যকর পদ্ধতি।',
    directAnswerEn:
      'Sand, clay, and fine silt from supply lines settle at the bottom of reserve and overhead tanks, turning household water cloudy. Deep sludge pumping paired with high-pressure rotary jet washing effectively removes these deposits.',
    keyPointsBn: [
      'তলদেশে ১–৪ ইঞ্চি কাদা জমে থাকলে শুধু বালতি দিয়ে তুললে পলি পুরোপুরি যায় না',
      'আন্ডারগ্রাউন্ড ও ছাদের ট্যাংক দুটোই একসাথে পরিষ্কার করলে পুনরায় ময়লা মিশ্রণ কমে',
      'ভারী কাদার পর ফুড-গ্রেড স্যানিটাইজেশন ও পরিষ্কার পানিতে রিন্স করা জরুরি'
    ],
    keyPointsEn: [
      'Thick bottom silt cannot be completely cleared with manual buckets alone',
      'Cleaning both reserve and rooftop tanks together prevents cross-contamination',
      'Food-safe sanitization and clean rinsing should follow sludge extraction'
    ],
    nonCleaningCausesBn:
      'ময়লা পানি সবসময় শুধু ট্যাংকের কারণে হয় না—অনেক সময় মেইন সাপ্লাই লাইনের মেরামত, নতুন বোরিংয়ের বালু আসা, বা রিজার্ভারের ভাঙা ঢাকনার কারণেও পানি ঘোলা হতে পারে। পোর্টেবল টেস্ট ছাড়া আমরা পানির পানযোগ্যতা (potability) বা ল্যাব মানের কোনো গ্যারান্টি দিই না।',
    nonCleaningCausesEn:
      'Cloudy water is not always caused by the tank alone—municipal line repairs, borehole sand intrusion, or cracked tank covers can reintroduce dirt. Cleaning improves storage hygiene, though we do not provide drinking potability guarantees without certified lab testing.',
    relatedServicePath: '/services/water-tank-cleaning',
    relatedServiceLabelBn: 'পানির ট্যাংক পরিষ্কার সার্ভিস দেখুন',
    relatedServiceLabelEn: 'Explore Water Tank Cleaning Service'
  },
  {
    id: 'foul-smell-water',
    slug: 'foul-smell-water',
    problemCategoryBn: 'পানিতে দুর্গন্ধ',
    problemCategoryEn: 'Foul Smell in Stored Water',
    questionBn: 'ট্যাপের বা ট্যাংকের পানিতে দুর্গন্ধ কেন হয় এবং এটি কীভাবে দূর করা যায়?',
    questionEn: 'What causes foul odor in tank water and how can it be removed?',
    directAnswerBn:
      'ট্যাংকের কোনায় জমে থাকা জৈব পলি, শ্যাওলা, ব্যাকটেরিয়াল বায়োফিল্ম এবং আবদ্ধ বাতাসহীন পরিবেশের কারণে পানিতে ভ্যাপসা বা পচা গন্ধ তৈরি হয়। ভ্যাকুয়াম সাকশন, রোটারি স্ক্রাবিং এবং ক্ষতিকর গন্ধমুক্ত ফুড-গ্রেড স্যানিটাইজার ব্যবহার করলে দুর্গন্ধের উৎস দূর হয়।',
    directAnswerEn:
      'Decomposing organic sediment, algae biofilm, and stagnant moisture inside closed tanks produce stale or foul odors. Complete sludge vacuuming, wall scrubbing, and odor-free food-safe sanitization remove the odor source.',
    keyPointsBn: [
      'ছাদের ট্যাংকের ঢাকনা খোলা বা ফাটা থাকলে পোকামাকড় ও পাতা পড়ে গন্ধ ছড়াতে পারে',
      'কাঁচা এসিড বা অতিরিক্ত ব্লিচিং মেশালে পানিতে রাসায়নিক গন্ধ ও ত্বকের জ্বালা হতে পারে',
      'ক্লিনিং শেষে ঢাকনা সিল এবং ভেন্ট নেট ঠিক আছে কি না তা যাচাই করা উচিত'
    ],
    keyPointsEn: [
      'Loose or cracked rooftop lids allow insects, dust, and organic debris inside',
      'Never mix raw acids or excessive chlorine inside enclosed concrete tanks',
      'Verify lid sealing and vent mesh integrity right after cleaning'
    ],
    nonCleaningCausesBn:
      'ট্যাংক পরিষ্কারের পরও গন্ধ থাকলে সাপ্লাই পানিতে হাইড্রোজেন সালফাইড গ্যাস, পুরনো ওয়াটার হিটার বা অভ্যন্তরীণ পাইপলাইনে জমে থাকা জৈব আস্তরণ এর কারণ হতে পারে।',
    nonCleaningCausesEn:
      'If odor persists after tank cleaning, check incoming groundwater sulfide gases, aging water heaters, or internal pipe biofilm.',
    relatedServicePath: '/services/water-tank-cleaning',
    relatedServiceLabelBn: 'ট্যাংক স্যানিটাইজেশন সম্পর্কে জানুন',
    relatedServiceLabelEn: 'Learn About Tank Sanitization'
  },
  {
    id: 'green-algae-tank',
    slug: 'green-algae-tank',
    problemCategoryBn: 'ট্যাংকে সবুজ শেওলা',
    problemCategoryEn: 'Green Algae Buildup',
    questionBn: 'ছাদের পানির ট্যাংকে সবুজ শেওলা জমার কারণ কী এবং তা কীভাবে প্রতিরোধ করা যায়?',
    questionEn: 'Why does green algae grow inside rooftop tanks and how can it be prevented?',
    directAnswerBn:
      'ছাদের প্লাস্টিক বা কংক্রিট ট্যাংকে সরাসরি সূর্যের আলো প্রবেশ করলে এবং গরম পানিতে পুষ্টি কণা থাকলে দ্রুত সবুজ শেওলা (algae) ও পিচ্ছিল বায়োফিল্ম জমে। হাই-প্রেসার রোটারি জেট ওয়াশ দিয়ে দেয়ালের শ্যাওলা তুলে ফেলা এবং সূর্যালোক নিরোধক কালো/ট্রিপল-লেয়ার ঢাকনা ও শেড ব্যবহার করলে শেওলা ফিরে আসা কমে।',
    directAnswerEn:
      'Direct sunlight penetrating rooftop PVC or unsealed concrete tanks triggers rapid green algae and slimy biofilm growth. High-pressure rotary jet washing removes wall algae, while UV-opaque lids and shading help slow regrowth.',
    keyPointsBn: [
      'পাতলা হালকা রঙের প্লাস্টিক ট্যাংকের ভেতর আলো ঢুকে শেওলা বেশি হয়',
      'তারের ব্রাশ ব্যবহার করলে ট্যাংকের ভেতরের প্রলেপে আঁচড় পড়ে, যেখানে পরে আরও বেশি শেওলা আটকায়',
      'বছরে ২–৩ বার নিয়মিত পরিষ্কার ও ঢাকনা সিল রাখলে বায়োফিল্ম নিয়ন্ত্রণে থাকে'
    ],
    keyPointsEn: [
      'Thin or translucent plastic tanks let sunlight trigger faster algae bloom',
      'Abrasive wire brushes scratch tank linings, creating rough spots where algae grips faster',
      'Cleaning every 4–6 months and sealing the top lid keeps biofilm under control'
    ],
    nonCleaningCausesBn:
      'সূর্যালোক সরাসরি ট্যাংকে পড়লে বা ঢাকনা ফেটে আলো ঢুকলে শুধু ক্লিনিং দিয়ে স্থায়ীভাবে শেওলা বন্ধ করা সম্ভব নয়—এক্ষেত্রে ছায়া বা আলোক-নিরোধক কভার প্রয়োজন।',
    nonCleaningCausesEn:
      'If sunlight penetrates directly through thin tank walls or a broken lid, algae will return quickly unless shading or a UV-opaque cover is added.',
    relatedServicePath: '/services/overhead-tank-cleaning',
    relatedServiceLabelBn: 'ওভারহেড ট্যাংক ক্লিনিং দেখুন',
    relatedServiceLabelEn: 'View Overhead Tank Cleaning'
  },
  {
    id: 'dirty-shortly-after-cleaning',
    slug: 'dirty-shortly-after-cleaning',
    problemCategoryBn: 'পরিষ্কারের কিছুদিন পরই পানি ময়লা',
    problemCategoryEn: 'Water Getting Dirty Soon After Cleaning',
    questionBn: 'ট্যাংক পরিষ্কারের কিছুদিন পরই পানি আবার ময়লা হয়ে যাওয়ার কারণ কী?',
    questionEn: 'Why does tank water turn dirty again shortly after cleaning?',
    directAnswerBn:
      'ট্যাংক পরিষ্কারের পরও ওয়াসা বা ডিপ-টিউবওয়েলের পানিতে কাদা-বালু থাকলে, কেবল ছাদের ট্যাংক পরিষ্কার করে নিচের রিজার্ভার বাদ রাখলে, অথবা পাম্প-পাইপের পুরনো পলি বেরিয়ে এলে পানি দ্রুত আবার ঘোলা হতে পারে। তাই একই সেশনে রিজার্ভ ও ওভারহেড উভয় ট্যাংক এবং প্রয়োজনে পাইপলাইন পরীক্ষা করা জরুরি।',
    directAnswerEn:
      'Water can turn dirty again soon after cleaning if incoming municipal/borehole supply carries heavy silt, if only the overhead tank was cleaned while the underground reserve stayed dirty, or if residue flushes out of aging supply pipes.',
    keyPointsBn: [
      'উৎস লাইনে (ওয়াসা/বোরিং) প্রচুর পলি থাকলে ইনলেট ফিল্টার বা সেডিমেন্ট ট্র্যাপ প্রয়োজন হতে পারে',
      'আন্ডারগ্রাউন্ড রিজার্ভ ট্যাংক অপরিষ্কার থাকলে পাম্পের মাধ্যমে নতুন ময়লা ছাদের ট্যাংকে ওঠে',
      'ট্যাংকের ভাঙা ঢাকনা, খোলা ওভারফ্লো পাইপ বা দেয়ালের ফাটল দিয়ে ময়লা ঢুকতে পারে'
    ],
    keyPointsEn: [
      'High sediment in incoming supply may require an inlet sediment filter',
      'Leaving the underground reserve tank uncleaned pumps dirt straight back up',
      'Broken manhole covers, open overflow pipes, or wall cracks let dust and seepage in'
    ],
    nonCleaningCausesBn:
      'ইনকামিং সাপ্লাই দূষণ, সাবমারসিবল/রাইজার পাম্পের ফুট-ভালভ লিকেজ, অথবা ভূগর্ভস্থ দেয়ালে ভূ-পৃষ্ঠের পানি চুইয়ে ঢোকা (seepage) মিস্ত্রি দিয়ে মেরামত না করলে শুধু ক্লিনিংয়ে সমস্যার সমাধান হয় না।',
    nonCleaningCausesEn:
      'Incoming supply turbidity, leaking riser/foot valves, or groundwater seepage through cracked underground walls require plumbing or civil repair—not cleaning alone.',
    relatedServicePath: '/services/underground-water-tank-cleaning',
    relatedServiceLabelBn: 'রিজার্ভ ও ছাদের ট্যাংক প্যাকেজ দেখুন',
    relatedServiceLabelEn: 'View Reserve & Overhead Cleaning'
  },
  {
    id: 'rust-mud-pipeline',
    slug: 'rust-mud-pipeline',
    problemCategoryBn: 'পাইপে মরিচা বা কাদা জমা',
    problemCategoryEn: 'Rust & Mud Inside Water Pipelines',
    questionBn: 'বাড়ির পানির পাইপে মরিচা ও কাদা জমলে কী সমস্যা হয় এবং করণীয় কী?',
    questionEn: 'What happens when rust and mud build up inside water pipes, and what should be done?',
    directAnswerBn:
      'পানিতে আয়রন, খনিজ ও পলি থাকলে সময়ের সাথে সাথে ভেতরের পাইপলাইনে লালচে মরিচা ও কাদার স্তর জমে, যা পানিতে লালচে দাগ, দুর্গন্ধ এবং ট্যাপে ধীর প্রবাহ তৈরি করে। কনসিলড পিভিসি/সি-পিভিসি পাইপ না ভেঙে হাইড্রো-পালস বা এয়ার-ওয়াটার ফ্লাশিংয়ের মাধ্যমে এই জমে থাকা পলি বের করা যায়।',
    directAnswerEn:
      'Iron, minerals, and silt gradually deposit reddish rust and mud layers inside pipes, causing discolored water, odor, and weak tap flow. Non-destructive hydro-pulse air-water flushing clears buildup from concealed PVC/CPVC lines without breaking walls.',
    keyPointsBn: [
      'সকালে প্রথম ট্যাপ ছাড়লে লালচে বা বাদামি পানি পড়া পাইপে আয়রন-মরিচা জমার প্রধান লক্ষণ',
      'আগে ট্যাংক পরিষ্কার করে তারপর পাইপলাইন ফ্লাশ করলে পাইপে নতুন কাদা ঢোকে না',
      'অতিরিক্ত ক্ষয়প্রাপ্ত পুরনো জিআই (GI) লোহার পাইপে ফ্লাশিংয়ের আগে প্লাম্বিং অবস্থা যাচাই জরুরি'
    ],
    keyPointsEn: [
      'Brownish or reddish first-flush water in the morning signals iron and mud buildup',
      'Always clean the overhead tank before flushing pipelines to stop fresh silt entry',
      'Severely corroded old GI pipes should be inspected before high-pressure flushing'
    ],
    nonCleaningCausesBn:
      'যদি পুরনো লোহার (GI) পাইপ ভেতর থেকে সম্পূর্ণ পচে বা ঝাঁঝরা হয়ে যায়, তবে কোনো রাসায়নিক বা ফ্লাশিং তা মেরামত করতে পারে না—তখন প্লাম্বার দিয়ে পাইপ পরিবর্তনই নিরাপদ সমাধান।',
    nonCleaningCausesEn:
      'If aged galvanized iron (GI) pipes are structurally corroded or flaking apart, flushing cannot restore the metal—replacing affected pipe sections via a plumber is necessary.',
    relatedServicePath: '/services/pipeline-cleaning',
    relatedServiceLabelBn: 'পাইপলাইন ফ্লাশিং সার্ভিস দেখুন',
    relatedServiceLabelEn: 'Explore Pipeline Cleaning Service'
  },
  {
    id: 'low-water-pressure',
    slug: 'low-water-pressure',
    problemCategoryBn: 'ট্যাপে পানির প্রেশার কম',
    problemCategoryEn: 'Low Water Pressure at Taps & Showers',
    questionBn: 'বাথরুম বা কিচেনের ট্যাপে পানির প্রেশার কমে যাওয়ার কারণ এবং সমাধান কী?',
    questionEn: 'Why does water pressure drop in bathroom and kitchen taps, and how is it fixed?',
    directAnswerBn:
      'ট্যাংকের আউটলেট স্ট্রেইনার, ট্যাপ/শাওয়ার অ্যারিয়েটর এবং পাইপলাইনের বাঁকে কাদা, আয়রন স্কেল ও শ্যাওলার আস্তরণ জমে পানির প্রবাহ কমে যায়। ট্যাংক ও আউটলেট স্ক্রিন পরিষ্কার এবং এয়ার-ওয়াটার পালস পাইপলাইন ফ্লাশিং করলে জ্যাম হওয়া পলি বের হয়ে প্রবাহ উন্নত হয়।',
    directAnswerEn:
      'Mud, iron scale, and algae biofilm clog tank outlet strainers, faucet aerators, and pipe bends, reducing tap flow. Cleaning the tank outlet screen and flushing lines with controlled air-water pulses helps restore flow.',
    keyPointsBn: [
      'প্রথমে ট্যাপ ও শাওয়ারের মাথার জালি (aerator) খুলে বালু-ময়লা পরিষ্কার করে দেখুন',
      'একটি নির্দিষ্ট ট্যাপে প্রেশার কম হলে কল বা অ্যাঙ্গেল স্টপ কক-এ ময়লা আটকে থাকতে পারে',
      'পুরো ফ্ল্যাটে প্রেশার কম হলে মেইন আউটলেট, এয়ার-ভেন্ট বা রাইজার পাইপে ব্লকেজ থাকতে পারে'
    ],
    keyPointsEn: [
      'First unscrew and rinse faucet aerators and showerheads to check local grit',
      'Low flow at one tap often points to an angle stop valve or cartridge blockage',
      'Whole-floor low flow points to tank outlet strainers, airlocks, or main pipe scale'
    ],
    nonCleaningCausesBn:
      'কম প্রেশারের সব কারণ পাইপের ময়লা নয়—আংশিক বন্ধ গেট ভালভ, ত্রুটিপূর্ণ নন-রিটার্ন ভালভ, পাম্পের কম ডেলিভারি, বা ছাদের ট্যাংকের উচ্চতা কম থাকাও এর কারণ হতে পারে।',
    nonCleaningCausesEn:
      'Not all low pressure is due to dirt—partially closed gate valves, faulty check valves, weak booster pumps, or low rooftop tank elevation require plumbing/mechanical adjustments.',
    relatedServicePath: '/services/pipeline-cleaning',
    relatedServiceLabelBn: 'পাইপলাইন প্রেশার সমাধান দেখুন',
    relatedServiceLabelEn: 'See Pipeline Flow Solutions'
  },
  {
    id: 'non-destructive-pipe-check',
    slug: 'non-destructive-pipe-check',
    problemCategoryBn: 'পাইপ না ভেঙে পরিষ্কার যাচাই',
    problemCategoryEn: 'Cleaning Pipes Without Breaking Walls',
    questionBn: 'দেয়াল বা টাইলস না ভেঙে পানির পাইপলাইন পরিষ্কার করা কি সম্ভব?',
    questionEn: 'Can concealed water pipelines be cleaned without breaking walls or tiles?',
    directAnswerBn:
      'হ্যাঁ, অধিকাংশ আধুনিক ভবনের কনসিলড পিভিসি (PVC), সিপিভিসি (CPVC) বা পিপিআর (PPR) পাইপলাইন দেয়াল বা টাইলস না ভেঙে নিয়ন্ত্রিত হাইড্রো-পালস এয়ার-ওয়াটার ফ্লাশিংয়ের মাধ্যমে পরিষ্কার করা যায়। তবে কাজ শুরুর আগে পাইপের ধরন, বয়স ও জয়েন্টের অবস্থা পরীক্ষা করা আবশ্যক।',
    directAnswerEn:
      'Yes, most concealed PVC, CPVC, and PPR pipelines can be flushed using controlled hydro-pulse air-water pressure without breaking walls or tiles, provided the pipe material, age, and joint integrity are checked first.',
    keyPointsBn: [
      'নিয়ন্ত্রিত এয়ার ও পানির পালস প্রেশার পাইপের জয়েন্টের নিরাপদ সীমার মধ্যে রাখা হয়',
      'গলদ বা লিকেজযুক্ত পুরনো মরিচা ধরা লোহার পাইপে উচ্চ প্রেশার এড়িয়ে সতর্ক পরীক্ষা করা হয়',
      'অ্যাসিড ঢেলে পাইপ ভেজানোর ঝুঁকিপূর্ণ পদ্ধতি ব্যবহার না করাই উত্তম'
    ],
    keyPointsEn: [
      'Controlled air-water pulse flushing operates within safe limits for sound PVC/CPVC/PPR joints',
      'Older corroded metal lines or leaking joints are pre-checked before applying pulse pressure',
      'Harsh acid soaking inside household pipes should be avoided'
    ],
    nonCleaningCausesBn:
      'যেসব পাইপ ইতিমধ্যেই ফাটা, ছিদ্রযুক্ত বা সিমেন্ট/নির্মাণ বর্জ্যে সম্পূর্ণ জ্যাম হয়ে আছে, সেখানে ফ্লাশিং নয় বরং প্লাম্বার দ্বারা অংশ বিশেষ পরিবর্তন করা প্রয়োজন হয়।',
    nonCleaningCausesEn:
      'If a line is choked by hardened construction cement/grout or already has pinhole leaks, physical pipe replacement by a plumber is required.',
    relatedServicePath: '/services/pipeline-cleaning',
    relatedServiceLabelBn: 'নন-ডেস্ট্রাক্টিভ পাইপ ক্লিনিং বিস্তারিত',
    relatedServiceLabelEn: 'Pipeline Cleaning Details'
  },
  {
    id: 'pricing-factors',
    slug: 'pricing-factors',
    problemCategoryBn: 'সার্ভিসের খরচ নির্ধারণ',
    problemCategoryEn: 'How Cleaning Pricing Is Calculated',
    questionBn: 'পানির ট্যাংক ও পাইপলাইন পরিষ্কার সার্ভিসের খরচ কীভাবে নির্ধারণ হয়?',
    questionEn: 'How is the cost of water tank and pipeline cleaning calculated?',
    directAnswerBn:
      'সার্ভিসের খরচ কোনো স্থির একক রেটে নয়, বরং ট্যাংকের ধরন (ওভারহেড না আন্ডারগ্রাউন্ড), ধারণক্ষমতা (লিটার বা ফ্ল্যাট/তলা সংখ্যা), কাদা ও আয়রনের ঘনত্ব, পাইপলাইন ফ্লাশিংয়ের পয়েন্ট সংখ্যা এবং এলাকার দূরত্ব অনুযায়ী কাজ শুরুর আগেই লিখিতভাবে নির্ধারণ করা হয়।',
    directAnswerEn:
      'Pricing depends on tank type (overhead vs. underground reserve), capacity in liters or building floors, mud/iron buildup, pipeline point count, and area distance, and is confirmed upfront before work begins.',
    keyPointsBn: [
      'বুকিংয়ের সময় এলাকা, ট্যাংকের ধরন ও সাইজ জানালে WhatsApp-এ স্বচ্ছ কোটেশন দেওয়া হয়',
      'রিজার্ভ ও ওভারহেড উভয় ট্যাংক একসাথে পরিষ্কারে কম্বো রেট প্রযোজ্য হতে পারে',
      'অতিরিক্ত কাজ বা অপ্রত্যাশিত সারচার্জ কাজ শুরুর আগে না জানিয়ে যোগ করা হয় না'
    ],
    keyPointsEn: [
      'Share your area, tank type, and approximate capacity for a clear WhatsApp quote before work begins',
      'Combined rooftop + underground cleaning in one visit reduces setup overhead',
      'No hidden charges added without prior confirmation'
    ],
    nonCleaningCausesBn:
      'যদি পরিদর্শনের পর দেখা যায় ট্যাংকের বল-ভালভ, ঢাকনা বা পাম্পের প্লাম্বিং পার্টস পরিবর্তন করতে হবে, তার খরচ আলাদা এবং তা সাধারণত প্লাম্বারের কাজের আওতায় পড়ে।',
    nonCleaningCausesEn:
      'Plumbing spare parts such as float valves, manhole covers, or motor repairs are outside standard cleaning quotes.',
    relatedServicePath: '/get-quote',
    relatedServiceLabelBn: 'কোটেশন ফরমে হিসাব দেখুন',
    relatedServiceLabelEn: 'Request a Written Quotation'
  },
  {
    id: 'reserve-vs-overhead',
    slug: 'reserve-vs-overhead',
    problemCategoryBn: 'রিজার্ভ বনাম ওভারহেড ট্যাংক',
    problemCategoryEn: 'Reserve vs. Overhead Tank Cleaning',
    questionBn: 'রিজার্ভ (আন্ডারগ্রাউন্ড) ট্যাংক ও ওভারহেড (ছাদের) ট্যাংক পরিষ্কারের মধ্যে পার্থক্য কী?',
    questionEn: 'What is the difference between cleaning an underground reserve tank and a rooftop overhead tank?',
    directAnswerBn:
      'মাটির নিচের রিজার্ভ ট্যাংক আকারে বড় এবং কংক্রিটের তৈরি, যেখানে ওয়াসা লাইনের ভারী বালি ও স্লাজ জমে—তাই সাবমারসিবল স্লাজ পাম্প, ওয়েট ভ্যাকুয়াম এবং পর্যাপ্ত আলো-বাতাস ব্যবস্থার প্রয়োজন হয়। ছাদের ওভারহেড ট্যাংক রোদ ও শেওলায় বেশি আক্রান্ত হয়, যেখানে রোটারি জেট স্ক্রাবিং ও ওয়াটারপ্রুফিং অক্ষত রাখা গুরুত্বপূর্ণ।',
    directAnswerEn:
      'Underground concrete reserves collect heavier mud/sand and require submersible sludge pumps, wet vacuums, and ventilation gear, whereas rooftop tanks suffer more from sun-driven algae and require gentle rotary jet scrubbing.',
    keyPointsBn: [
      'আন্ডারগ্রাউন্ড রিজার্ভারে আবদ্ধ স্থানে প্রবেশের নিরাপত্তা গিয়ার ও এক্সট্র্যাকশন পাম্প আবশ্যক',
      'ওভারহেড পিভিসি/আরসিসি ট্যাংকে শ্যাওলা ও চুন-পলি তোলার পর পাম্প রিস্টার্টের আগে লাইন ফ্লাশ করা হয়',
      'সর্বোত্তম ফলের জন্য আগে নিচের রিজার্ভার ও পরে ছাদের ট্যাংক পরিষ্কার করা উচিত'
    ],
    keyPointsEn: [
      'Underground sumps collect denser mud and require slurry pumps, wet vacuums, and ventilation gear',
      'Rooftop tanks collect sun-driven algae and scale requiring non-abrasive rotary jet washing',
      'Best sequence: clean the underground reserve tank first, then clean the rooftop tanks'
    ],
    nonCleaningCausesBn:
      'কংক্রিট রিজার্ভ ট্যাংকের ভেতরে সিমেন্টের প্লাস্টার উঠে গেলে বা লিকেজ থাকলে ক্লিনিংয়ের সময় তা চিহ্নিত হয়, তবে স্থায়ী সমাধানের জন্য ওয়াটারপ্রুফিং মেরামত প্রয়োজন।',
    nonCleaningCausesEn:
      'Exposed concrete aggregate or peeling waterproofing inside underground tanks requires civil waterproofing repair after cleaning.',
    relatedServicePath: '/services/underground-water-tank-cleaning',
    relatedServiceLabelBn: 'আন্ডারগ্রাউন্ড রিজার্ভ ক্লিনিং দেখুন',
    relatedServiceLabelEn: 'View Underground Tank Cleaning'
  },
  {
    id: 'booking-info-needed',
    slug: 'booking-info-needed',
    problemCategoryBn: 'বুকিংয়ের প্রয়োজনীয় তথ্য',
    problemCategoryEn: 'Information Needed for Fast Booking',
    questionBn: 'পানির ট্যাংক বা পাইপলাইন পরিষ্কার বুক করার সময় কী কী তথ্য দিলে দ্রুত কোটেশন পাওয়া যায়?',
    questionEn: 'What details help you get a fast, accurate quotation when booking?',
    directAnswerBn:
      'সঠিক ও দ্রুত কোটেশনের জন্য কেবল তিনটি মূল তথ্যই যথেষ্ট: (১) আপনার সচল মোবাইল নম্বর, (২) এলাকা (যেমন ঢাকা, নারায়ণগঞ্জ, গাজীপুর বা সাভারের নির্দিষ্ট সেক্টর/ব্লক) এবং (৩) কোন সার্ভিস প্রয়োজন (ওভারহেড, রিজার্ভার, উভয় ট্যাংক বা পাইপলাইন)।',
    directAnswerEn:
      'Only three details are required for a fast quote: (1) an active mobile number, (2) your area (within Dhaka, Narayanganj, Gazipur, or Savar), and (3) the service needed (overhead, reserve, both tanks, or pipeline cleaning).',
    keyPointsBn: [
      'ট্যাংকের সংখ্যা, আনুমানিক লিটার বা ভবনের তলা/ফ্ল্যাট সংখ্যা দিলে হিসাব আরও নির্ভুল হয় (ঐচ্ছিক)',
      'ফর্মে ইমেইল বা কোনো একাউন্ট লগইন ছাড়াই মাত্র ৩০ সেকেন্ডে অনুরোধ পাঠানো যায়',
      'চাইলে সরাসরি WhatsApp বা কল করেও ট্যাংকের ছবি শেয়ার করে দ্রুত রেট জেনে নিতে পারেন'
    ],
    keyPointsEn: [
      'Tank count, capacity, or floors/flats help refine the quote quickly (optional)',
      'No email or account sign-in is required to submit a quotation request',
      'You can also send a photo directly via WhatsApp or call 01609-999612'
    ],
    nonCleaningCausesBn:
      'জরুরি পানি বন্ধের সময় নির্ধারণ করতে ভবনের কেয়ারটেকার বা ম্যানেজারের সাথে আগে থেকেই ২–৩ ঘণ্টার উইন্ডো সমন্বয় করে নেওয়া সুবিধাজনক।',
    nonCleaningCausesEn:
      'Coordinating a 2–3 hour water-off window with your building caretaker ahead of arrival helps ensure smooth completion.',
    relatedServicePath: '/get-quote',
    relatedServiceLabelBn: 'এখনই ফ্রি কোটেশন নিন',
    relatedServiceLabelEn: 'Get a Free Quote Now'
  }
];
