import { ServiceBookingFormConfig, CustomFormField } from '../types/customBookingForm';

export const DEFAULT_SERVICE_BOOKING_FORMS: Record<string, ServiceBookingFormConfig> = {
  // 1. Sofa Cleaning Service
  'service-sofa-cleaning': {
    enabled: true,
    titleBn: 'সোফা ক্লিনিং সার্ভিস বুকিং ফরম',
    titleEn: 'Sofa Cleaning Service Booking Form',
    subtitleBn: 'আপনার সোফার আসন সংখ্যা, মেটেরিয়াল ও অবস্থা জানান — আমরা সঠিক কোটেশন প্রদান করব।',
    subtitleEn: 'Tell us about your sofa size, fabric, and stain condition for an exact quote.',
    submitButtonTextBn: 'সোফা ক্লিনিং বুকিং নিশ্চিত করুন',
    submitButtonTextEn: 'Confirm Sofa Cleaning Booking',
    estimatedPriceNoteBn: 'সোফার সিট সংখ্যা ও ফ্যাব্রিকের গভীর ময়লার ওপর ভিত্তি করে চূড়ান্ত রেট নির্ধারিত হবে।',
    estimatedPriceNoteEn: 'Final price is determined based on seat count and fabric stain level.',
    fields: [
      {
        id: 'f_sofa_type',
        name: 'sofa_type',
        labelBn: 'সোফার সিট ও ধরন',
        labelEn: 'Sofa Type & Seats',
        type: 'select',
        required: true,
        placeholderBn: 'সোফার সাইজ নির্বাচন করুন',
        placeholderEn: 'Select sofa size',
        options: ['1 Seater (Single)', '2 Seater', '3 Seater', '5 Seater Set (3+1+1)', '7 Seater Set', 'L-Shape Corner Sofa', 'Custom / Other'],
        optionsBn: ['১ সিটার (সিঙ্গেল)', '২ সিটার', '৩ সিটার', '৫ সিটার সেট (৩+১+১)', '৭ সিটার সেট', 'এল-শেপ কর্নার সোফা', 'কাস্টম / অন্যান্য']
      },
      {
        id: 'f_fabric_type',
        name: 'fabric_type',
        labelBn: 'সোফার কাপড় / মেটেরিয়াল',
        labelEn: 'Sofa Material / Fabric',
        type: 'select',
        required: true,
        placeholderBn: 'মেটেরিয়াল নির্বাচন করুন',
        placeholderEn: 'Select material',
        options: ['Standard Fabric / কটন বা জ্যাকার্ড', 'Leather / লেদার বা কৃত্রিম চামড়া', 'Velvet / ভেলভেট ফেব্রিক', 'Suede / সোয়েড', 'Not Sure / নিশ্চিত নই'],
        optionsBn: ['স্ট্যান্ডার্ড ফেব্রিক / কটন', 'লেদার / আর্টিফিশিয়াল চামড়া', 'ভেলভেট বা রেশমি কাপড়', 'সোয়েড ফেব্রিক', 'নিশ্চিত নই']
      },
      {
        id: 'f_stain_level',
        name: 'stain_level',
        labelBn: 'দাগ বা ময়লার অবস্থা',
        labelEn: 'Stain & Dirt Condition',
        type: 'radio',
        required: true,
        options: ['Light Dust & Regular Wash', 'Tea/Coffee or Food Stains', 'Deep Grime & Strong Odor'],
        optionsBn: ['সাধারণ ধুলাবালি (নিয়মিত ওয়াশ)', 'চা/কফি বা খাবারের তেলতেলে দাগ', 'গভীর ময়লা ও দুর্গন্ধযুক্ত']
      },
      {
        id: 'f_cushions',
        name: 'extra_cushions',
        labelBn: 'অতিরিক্ত কুশন আছে কি? (সংখ্যা)',
        labelEn: 'Extra Cushions Count',
        type: 'number',
        required: false,
        placeholderBn: 'যেমন: ৩',
        placeholderEn: 'e.g. 3'
      },
      {
        id: 'f_special_notes',
        name: 'special_notes',
        labelBn: 'কোনো বিশেষ নির্দেশনা',
        labelEn: 'Special Instructions',
        type: 'textarea',
        required: false,
        placeholderBn: 'সোফার কোনো সংবেদনশীল অংশ বা নির্দিষ্ট দাগের বিবরণ লিখুন...',
        placeholderEn: 'Mention any sensitive spots or specific stain instructions...'
      }
    ]
  },

  // 2. Home Deep Cleaning Service
  'service-home-cleaning': {
    enabled: true,
    titleBn: 'হোম ডিপ ক্লিনিং বুকিং ফরম',
    titleEn: 'Home Deep Cleaning Booking Form',
    subtitleBn: 'আপনার ফ্ল্যাট বা বাসার সাইজ ও পরিচ্ছন্নতার চাহিদা অনুযায়ী তথ্য প্রদান করুন।',
    subtitleEn: 'Provide your apartment size and cleaning requirements for a tailored quote.',
    submitButtonTextBn: 'হোম ক্লিনিং বুকিং রিকোয়েস্ট পাঠান',
    submitButtonTextEn: 'Submit Home Cleaning Request',
    estimatedPriceNoteBn: 'ফ্ল্যাটের আয়তন, বেডরুম ও বাথরুমের সংখ্যার ওপর ভিত্তি করে নির্ধারিত হবে।',
    estimatedPriceNoteEn: 'Pricing depends on property area, bedroom count, and bathroom count.',
    fields: [
      {
        id: 'f_home_size',
        name: 'property_size',
        labelBn: 'বাসা বা ফ্ল্যাটের আনুমানিক আয়তন (বর্গফুট)',
        labelEn: 'Approx. Apartment Area (Sq. Ft.)',
        type: 'select',
        required: true,
        options: ['Under 800 sq ft', '800 - 1,200 sq ft', '1,200 - 1,800 sq ft', '1,800 - 2,500 sq ft', '2,500+ sq ft / Duplex'],
        optionsBn: ['৮০০ বর্গফুটের নিচে', '৮০০ - ১,২০০ বর্গফুট', '১,২০০ - ১,৮০০ বর্গফুট', '১,৮০০ - ২,৫০০ বর্গফুট', '২,৫০০+ বর্গফুট / ডুপ্লেক্স']
      },
      {
        id: 'f_bed_count',
        name: 'bedroom_count',
        labelBn: 'বেডরুমের সংখ্যা',
        labelEn: 'Number of Bedrooms',
        type: 'select',
        required: true,
        options: ['1 Bedroom', '2 Bedrooms', '3 Bedrooms', '4 Bedrooms', '5+ Bedrooms'],
        optionsBn: ['১টি বেডরুম', '২টি বেডরুম', '৩টি বেডরুম', '৪টি বেডরুম', '৫টি বা তার বেশি']
      },
      {
        id: 'f_bath_count',
        name: 'bathroom_count',
        labelBn: 'বাথরুমের সংখ্যা',
        labelEn: 'Number of Bathrooms',
        type: 'select',
        required: true,
        options: ['1 Bathroom', '2 Bathrooms', '3 Bathrooms', '4 Bathrooms', '5+ Bathrooms'],
        optionsBn: ['১টি বাথরুম', '২টি বাথরুম', '৩টি বাথরুম', '৪টি বাথরুম', '৫টি বা তার বেশি']
      },
      {
        id: 'f_occupancy',
        name: 'occupancy_status',
        labelBn: 'বাসার বর্তমান অবস্থা',
        labelEn: 'Property Occupancy Status',
        type: 'radio',
        required: true,
        options: ['Empty / New Shift-in', 'Currently Occupied & Furnished', 'Post-Renovation / Construction Dust'],
        optionsBn: ['খালি ফ্ল্যাট (নতুন শিফটিং)', 'ফার্নিচারসহ বসবাসরত বাসা', 'রং বা সংস্কারের পর (কনস্ট্রাকশন ডাস্ট)']
      },
      {
        id: 'f_deep_focus',
        name: 'deep_focus',
        labelBn: 'নির্দিষ্ট কোনো প্রধান জায়গা',
        labelEn: 'Primary Cleaning Focus',
        type: 'select',
        required: false,
        options: ['Entire Apartment Complete Deep Clean', 'Kitchen & Bathrooms Only', 'Floor Scrubbing & Polishing', 'Balcony & Thai Glass Deep Wash'],
        optionsBn: ['পুরো ফ্ল্যাট সম্পূর্ণ ডিপ ক্লিন', 'শুধু কিচেন ও বাথরুম ডিপ ক্লিন', 'ফ্লোর ও টাইলস মেকানাইজড স্কাফিং', 'ব্যালকনি ও থাই গ্লাস ডিপ ওয়াশ']
      }
    ]
  },

  // 3. Office & Commercial Cleaning
  'service-office-cleaning': {
    enabled: true,
    titleBn: 'অফিস ক্লিনিং সার্ভিস বুকিং ফরম',
    titleEn: 'Office Cleaning Service Booking Form',
    subtitleBn: 'অফিস বা বাণিজ্যিক স্থানের পরিচ্ছন্নতার স্পেসিফিকেশন জানান।',
    subtitleEn: 'Specify your office space and cleaning requirements.',
    submitButtonTextBn: 'অফিস কোটেশন রিকোয়েস্ট পাঠান',
    submitButtonTextEn: 'Request Office Quotation',
    fields: [
      {
        id: 'f_office_area',
        name: 'office_area',
        labelBn: 'অফিসের আনুমানিক আয়তন (বর্গফুট)',
        labelEn: 'Approx. Office Area (Sq. Ft.)',
        type: 'text',
        required: true,
        placeholderBn: 'যেমন: ১৫০০ বর্গফুট',
        placeholderEn: 'e.g. 1500 sq ft'
      },
      {
        id: 'f_desks',
        name: 'workstations_count',
        labelBn: 'ওয়ার্কস্টেশন / ডেস্কের সংখ্যা',
        labelEn: 'Number of Desks / Workstations',
        type: 'number',
        required: false,
        placeholderBn: 'যেমন: ২৫',
        placeholderEn: 'e.g. 25'
      },
      {
        id: 'f_frequency',
        name: 'cleaning_frequency',
        labelBn: 'সার্ভিসের ধরন',
        labelEn: 'Service Type / Frequency',
        type: 'select',
        required: true,
        options: ['One-Time Deep Clean', 'Weekly Scheduled Clean', 'Monthly Contract (AMC)', 'Floor Scrubbing Only'],
        optionsBn: ['এককালীন ডিপ ক্লিনিং (One-time)', 'সাপ্তাহিক রুটিন ক্লিন', 'মাসিক চুক্তি (Annual AMC)', 'শুধু ফ্লোর মেকানাইজড স্কাফিং']
      },
      {
        id: 'f_shift',
        name: 'preferred_shift',
        labelBn: 'পছন্দের কাজের সময়সূচি',
        labelEn: 'Preferred Work Shift',
        type: 'radio',
        required: true,
        options: ['Daytime / Working Hours', 'After Office Hours / Evening', 'Weekend / Friday'],
        optionsBn: ['অফিস চলাকালীন সময়ে', 'অফিসের পর (সন্ধ্যা বা রাতে)', 'ছুটির দিনে (শুক্রবার/শনিবার)']
      }
    ]
  },

  // 4. Carpet Cleaning Service
  'service-carpet-cleaning': {
    enabled: true,
    titleBn: 'কার্পেট ক্লিনিং সার্ভিস বুকিং ফরম',
    titleEn: 'Carpet Cleaning Booking Form',
    subtitleBn: 'আপনার কার্পেটের পরিমাপ, সংখ্যা ও অবস্থা নির্বাচন করুন।',
    subtitleEn: 'Select your carpet size, quantity, and cleaning requirements.',
    submitButtonTextBn: 'কার্পেট ক্লিনিং বুক করুন',
    submitButtonTextEn: 'Book Carpet Cleaning',
    fields: [
      {
        id: 'f_carpet_type',
        name: 'carpet_type',
        labelBn: 'কার্পেটের ধরন ও সাইজ',
        labelEn: 'Carpet Size & Type',
        type: 'select',
        required: true,
        options: ['Small Area Rug / জায়নামাজ (under 4x6 ft)', 'Medium Living Room Carpet (5x7 or 6x9 ft)', 'Large Carpet (8x11 ft+)', 'Wall-to-Wall Office Carpeting'],
        optionsBn: ['ছোট কার্পেট / জায়নামাজ (৪x৬ ফুটের নিচে)', 'মাঝারি ড্রয়িংরুম কার্পেট (৫x৭ বা ৬x৯ ফুট)', 'বড় কার্পেট (৮x১১ ফুট বা বড়)', 'পুরো ফ্লোর কার্পেটিং (ওয়াল-টু-ওয়াল)']
      },
      {
        id: 'f_carpet_qty',
        name: 'carpet_quantity',
        labelBn: 'কার্পেটের সংখ্যা (পিস)',
        labelEn: 'Quantity (Pieces)',
        type: 'number',
        required: true,
        placeholderBn: 'যেমন: ২',
        placeholderEn: 'e.g. 2',
        defaultValue: '1'
      },
      {
        id: 'f_carpet_condition',
        name: 'carpet_condition',
        labelBn: 'কার্পেটের অবস্থা',
        labelEn: 'Carpet Condition',
        type: 'radio',
        required: true,
        options: ['Regular Dust & Freshening', 'Stained with Spots / Spills', 'Water Damage / Musty Odor'],
        optionsBn: ['নিয়মিত ধুলাবালি ওয়াশ', 'দাগ বা খাবারের আস্তরণ যুক্ত', 'পানি লেগে ভ্যাপসা গন্ধ হওয়া']
      }
    ]
  },

  // 5. Pest Control Service
  'service-pest-control': {
    enabled: true,
    titleBn: 'পেস্ট কন্ট্রোল সার্ভিস বুকিং ফরম',
    titleEn: 'Pest Control Service Booking Form',
    subtitleBn: 'পোকা-মাকড়ের ধরন ও আক্রান্ত স্থানের তথ্য জানিয়ে বুকিং দিন।',
    subtitleEn: 'Select target pests and property details for targeted treatment.',
    submitButtonTextBn: 'পেস্ট কন্ট্রোল বুকিং করুন',
    submitButtonTextEn: 'Book Pest Control',
    fields: [
      {
        id: 'f_pest_type',
        name: 'pest_type',
        labelBn: 'কোন ধরনের পোকা-মাকড়ের উপদ্রব?',
        labelEn: 'Target Pest Type',
        type: 'select',
        required: true,
        options: ['Cockroaches (তেলাপোকা)', 'Bedbugs (ছাড়পোকা)', 'Termites (উইপোকা)', 'Rodents / Rats (ইঁদুর)', 'Ants & Crawling Insects (পিঁপড়া)', 'All-in-One Multi Pest Control'],
        optionsBn: ['তেলাপোকা দমন', 'ছাড়পোকা নিধন', 'উইপোকার প্রতিরোধ', 'ইঁদুরের উপদ্রব', 'পিঁপড়া ও সাধারণ কীট-পতঙ্গ', 'অল-ইন-ওয়ান মাল্টি পেস্ট কন্ট্রোল']
      },
      {
        id: 'f_pest_property',
        name: 'property_type',
        labelBn: 'স্থাপনার ধরন',
        labelEn: 'Property Type',
        type: 'select',
        required: true,
        options: ['Residential Flat / Apartment', 'Commercial Office', 'Restaurant / Commercial Kitchen', 'Warehouse / Factory', 'Full Building'],
        optionsBn: ['আবাসিক ফ্ল্যাট / বাসা', 'বাণিজ্যিক অফিস', 'রেস্টুরেন্ট বা বাণিজ্যিক রান্নাঘর', 'গোডাউন বা কারখানা', 'সম্পূর্ণ ভবন']
      },
      {
        id: 'f_pest_severity',
        name: 'infestation_severity',
        labelBn: 'উপদ্রবের মাত্রা',
        labelEn: 'Infestation Level',
        type: 'radio',
        required: true,
        options: ['Mild / Early Signs', 'Moderate', 'Severe / Longstanding'],
        optionsBn: ['প্রাথমিক লক্ষণ (কম)', 'মাঝারি উপদ্রব', 'তীব্র ও দীর্ঘদিনের আক্রমণ']
      }
    ]
  },

  // 6. Water Pipeline Cleaning Service
  'service-pipeline-cleaning': {
    enabled: true,
    titleBn: 'পানির পাইপলাইন ক্লিনিং বুকিং ফরম',
    titleEn: 'Water Pipeline Cleaning Booking Form',
    subtitleBn: 'দেয়াল না ভেঙে হাইড্রো-পালস মেশিনে পাইপের আয়রন ও মরিচা দূরীকরণ।',
    subtitleEn: 'Non-invasive hydro-pulse pipeline flushing to clear iron scale and rust.',
    submitButtonTextBn: 'পাইপলাইন ফ্লাশিং বুক করুন',
    submitButtonTextEn: 'Book Pipeline Flushing',
    fields: [
      {
        id: 'f_pipe_property',
        name: 'building_type',
        labelBn: 'ভবন বা ফ্ল্যাটের ধরন',
        labelEn: 'Property Type',
        type: 'select',
        required: true,
        options: ['Single Apartment Flat', 'Full Multi-Story Building', 'Commercial Building / Office'],
        optionsBn: ['নির্দিষ্ট একটি ফ্ল্যাট', 'সম্পূর্ণ বহুতল ভবন', 'বাণিজ্যিক ভবন / অফিস']
      },
      {
        id: 'f_pipe_bathrooms',
        name: 'bathroom_lines',
        labelBn: 'বাথরুম ও কিচেন লাইনের সংখ্যা',
        labelEn: 'Number of Bathrooms & Kitchens',
        type: 'number',
        required: true,
        placeholderBn: 'যেমন: ৩টি বাথরুম ও ১টি কিচেন = ৪',
        placeholderEn: 'e.g. 4'
      },
      {
        id: 'f_pipe_problem',
        name: 'water_problem',
        labelBn: 'পাইপলাইনের প্রধান সমস্যা',
        labelEn: 'Primary Water Problem',
        type: 'radio',
        required: true,
        options: ['Reddish / Rusty Iron Water', 'Very Low Water Flow & Shower Pressure', 'Foul Plumbing Odor in Taps'],
        optionsBn: ['লালচে বা বাদামি আয়রনযুক্ত পানি', 'শাওয়ার ও কলের পানির প্রেশার কমে যাওয়া', 'পানির লাইনে দুর্গন্ধযুক্ত পানি']
      }
    ]
  },

  // 7. Bathroom Deep Cleaning Service
  'service-bathroom-cleaning': {
    enabled: true,
    titleBn: 'বাথরুম ডিপ ক্লিনিং বুকিং ফরম',
    titleEn: 'Bathroom Deep Cleaning Booking Form',
    subtitleBn: 'বাথরুমের সংখ্যা ও টাইলসের আয়রন/হলুদ দাগের ধরন নির্বাচন করুন।',
    subtitleEn: 'Specify number of bathrooms and scaling/staining condition.',
    submitButtonTextBn: 'বাথরুম ক্লিনিং বুক করুন',
    submitButtonTextEn: 'Book Bathroom Cleaning',
    fields: [
      {
        id: 'f_bath_qty',
        name: 'bathroom_quantity',
        labelBn: 'বাথরুমের সংখ্যা',
        labelEn: 'Number of Bathrooms',
        type: 'select',
        required: true,
        options: ['1 Bathroom', '2 Bathrooms', '3 Bathrooms', '4 Bathrooms', '5+ Bathrooms'],
        optionsBn: ['১টি বাথরুম', '২টি বাথরুম', '৩টি বাথরুম', '৪টি বাথরুম', '৫টি বা তার বেশি']
      },
      {
        id: 'f_bath_tiles_stain',
        name: 'stain_type',
        labelBn: 'টাইলস ও ফিটিংসের দাগের মাত্রা',
        labelEn: 'Tiles & Fittings Stain Level',
        type: 'radio',
        required: true,
        options: ['Normal Dirt & Mild Scaling', 'Hard Water Yellow / Iron Stains', 'Severe Black Mold & Grout Calcification'],
        optionsBn: ['স্বাভাবিক ময়লা ও হালকা দাগ', 'কঠিন পানির হলুদ বা লালচে আয়রনের দাগ', 'টাইলসের খাঁজে কালো ফাঙ্গাস ও দীর্ঘদিনের দাগ']
      },
      {
        id: 'f_bath_glass',
        name: 'glass_shower_enclosure',
        labelBn: 'গ্লাস শাওয়ার পার্টিশন আছে কি?',
        labelEn: 'Glass Shower Partition Present?',
        type: 'select',
        required: false,
        options: ['No Glass Partition', '1 Glass Partition / Enclosure', '2+ Glass Partitions'],
        optionsBn: ['কোনো গ্লাস পার্টিশন নেই', '১টি গ্লাস পার্টিশন আছে', '২টি বা ততোধিক গ্লাস পার্টিশন']
      }
    ]
  },

  // 8. Kitchen Deep Cleaning Service
  'service-kitchen-cleaning': {
    enabled: true,
    titleBn: 'কিচেন ডিপ ক্লিনিং বুকিং ফরম',
    titleEn: 'Kitchen Deep Cleaning Booking Form',
    subtitleBn: 'রান্নাঘরের গ্রিজ, তেলচিটে দাগ ও কিচেন হুডের তথ্য জানান।',
    subtitleEn: 'Tell us about your kitchen grease level and exhaust hood cleaning needs.',
    submitButtonTextBn: 'কিচেন ক্লিনিং বুক করুন',
    submitButtonTextEn: 'Book Kitchen Cleaning',
    fields: [
      {
        id: 'f_kitchen_size',
        name: 'kitchen_type',
        labelBn: 'রান্নাঘরের সাইজ ও ক্যাবিনেট',
        labelEn: 'Kitchen Size & Cabinetry',
        type: 'select',
        required: true,
        options: ['Standard Apartment Kitchen (with top & bottom cabinets)', 'Compact / Studio Kitchen', 'Large / Open Island Kitchen'],
        optionsBn: ['স্ট্যান্ডার্ড ফ্ল্যাট কিচেন (উপর ও নিচের কেবিনেটসহ)', 'ছোট / স্টুডিও কিচেন', 'বড় সাইজ / ওপেন আইল্যান্ড কিচেন']
      },
      {
        id: 'f_kitchen_hood',
        name: 'exhaust_hood_cleaning',
        labelBn: 'কিচেন হুড ও এক্সহস্ট ডিপ ডিগ্রিজ করবেন?',
        labelEn: 'Exhaust Hood Deep Degreasing Needed?',
        type: 'radio',
        required: true,
        options: ['Yes, Hood & Filters Need Heavy Degreasing', 'Exhaust Fan Only', 'No Hood Service Needed'],
        optionsBn: ['হ্যাঁ, কিচেন হুড ও ফিল্টার ডিপ ডিগ্রিজ প্রয়োজন', 'শুধু সাধারণ এক্সহস্ট ফ্যান', 'হুড সার্ভিসের প্রয়োজন নেই']
      },
      {
        id: 'f_grease_level',
        name: 'grease_level',
        labelBn: 'দেয়াল ও টাইলসে তেলের দাগের অবস্থা',
        labelEn: 'Wall & Tile Grease Severity',
        type: 'radio',
        required: true,
        options: ['Moderate Cooking Oil Splatter', 'Heavy Sticky Layer / Long Uncleaned'],
        optionsBn: ['মাঝারি রান্নার তেলের ছিটা দাগ', 'ভারী ও আঠালো তেলচিটে স্তর (দীর্ঘদিনের)']
      }
    ]
  },

  // 9. Glass & Window Cleaning Service
  'service-glass-window-cleaning': {
    enabled: true,
    titleBn: 'গ্লাস ও উইন্ডো ক্লিনিং বুকিং ফরম',
    titleEn: 'Glass & Window Cleaning Booking Form',
    subtitleBn: 'জানালা বা গ্লাস পার্টিশনের আনুমানিক সংখ্যা ও উচ্চতা নির্বাচন করুন।',
    subtitleEn: 'Specify number of window panes, height, and access details.',
    submitButtonTextBn: 'গ্লাস ক্লিনিং বুক করুন',
    submitButtonTextEn: 'Book Glass Cleaning',
    fields: [
      {
        id: 'f_window_count',
        name: 'window_count',
        labelBn: 'মোট জানালার আনুমানিক সংখ্যা (থাই গ্লাস)',
        labelEn: 'Approx. Number of Windows (Thai Glass)',
        type: 'select',
        required: true,
        options: ['1 - 5 Windows', '6 - 10 Windows', '11 - 20 Windows', 'Entire Building / Commercial Facade'],
        optionsBn: ['১ - ৫টি জানালা', '৬ - ১০টি জানালা', '১১ - ২০টি জানালা', 'পুরো ভবন বা বাণিজ্যিক গ্লাস ফাসাদ']
      },
      {
        id: 'f_floor_level',
        name: 'floor_level',
        labelBn: 'কত তলায় অবস্থিত?',
        labelEn: 'Floor Level / Height',
        type: 'text',
        required: true,
        placeholderBn: 'যেমন: ৩য় তলা / ৫ তলা ও ব্যালকনি',
        placeholderEn: 'e.g. 3rd Floor / 5th Floor'
      },
      {
        id: 'f_glass_type',
        name: 'cleaning_scope',
        labelBn: 'পরিচ্ছন্নতার পরিধি',
        labelEn: 'Cleaning Scope',
        type: 'radio',
        required: true,
        options: ['Interior & Balcony Glass Only', 'Both Interior & Safe Exterior Sides'],
        optionsBn: ['শুধু ভেতর ও ব্যালকনির দিক', 'ভেতর ও নিরাপদ বাইরের দিক উভয়ই']
      }
    ]
  },

  // 10. Commercial Cleaning Service
  'service-commercial-cleaning': {
    enabled: true,
    titleBn: 'কমার্শিয়াল ক্লিনিং সার্ভিস বুকিং ফরম',
    titleEn: 'Commercial Cleaning Service Booking Form',
    subtitleBn: 'বাণিজ্যিক প্রতিষ্ঠান, শপিং মল বা শিক্ষাপ্রতিষ্ঠানের তথ্য দিন।',
    subtitleEn: 'Commercial space, mall, hospital, or industrial facility cleaning requirements.',
    submitButtonTextBn: 'কমার্শিয়াল কোটেশন রিকোয়েস্ট পাঠান',
    submitButtonTextEn: 'Request Commercial Quote',
    fields: [
      {
        id: 'f_comm_type',
        name: 'facility_type',
        labelBn: 'প্রতিষ্ঠানের ধরন',
        labelEn: 'Facility Type',
        type: 'select',
        required: true,
        options: ['Shopping Mall / Retail Store', 'School / College / University', 'Hospital / Clinic / Diagnostic', 'Factory / Warehouse / Industrial', 'Restaurant / Hotel'],
        optionsBn: ['শপিং মল / রিটেইল শপ বা শো-রুম', 'স্কুল / কলেজ / বিশ্ববিদ্যালয়', 'হাসপাতাল / ক্লিনিক / ডায়াগনস্টিক', 'ফ্যাক্টরি / গোডাউন বা কারখানা', 'রেস্টুরেন্ট বা হোটেল']
      },
      {
        id: 'f_comm_area',
        name: 'facility_area_sqft',
        labelBn: 'আনুমানিক আয়তন (বর্গফুট)',
        labelEn: 'Approx. Total Area (Sq. Ft.)',
        type: 'text',
        required: true,
        placeholderBn: 'যেমন: ৩,০০০ - ৫,০০০ বর্গফুট',
        placeholderEn: 'e.g. 3,000 - 5,000 sq ft'
      },
      {
        id: 'f_comm_timing',
        name: 'service_timing',
        labelBn: 'কাজের পছন্দের সময়',
        labelEn: 'Preferred Execution Timing',
        type: 'radio',
        required: true,
        options: ['Night Shift (After Business Hours)', 'Daytime Working Hours', 'Weekend / Public Holiday'],
        optionsBn: ['রাতের শিফটে (ব্যবসা বন্ধের পর)', 'দিনের সাধারণ সময়ে', 'ছুটির দিনে']
      }
    ]
  }
};

/**
 * Creates a generic fallback custom booking form for any service that doesn't have an explicit template.
 */
export function createDefaultGenericForm(serviceTitleBn: string, serviceTitleEn: string): ServiceBookingFormConfig {
  return {
    enabled: true,
    titleBn: `${serviceTitleBn} বুকিং ফরম`,
    titleEn: `${serviceTitleEn} Booking Form`,
    subtitleBn: `আপনার ${serviceTitleBn} এর প্রয়োজনীয় তথ্য জানিয়ে রিকোয়েস্ট করুন।`,
    subtitleEn: `Provide details for your ${serviceTitleEn} to receive an accurate quote.`,
    submitButtonTextBn: 'বুকিং রিকোয়েস্ট নিশ্চিত করুন',
    submitButtonTextEn: 'Confirm Booking Request',
    fields: [
      {
        id: `f_${Date.now()}_req`,
        name: 'requirement_details',
        labelBn: 'কাজের সুনির্দিষ্ট বিবরণ বা চাহিদা',
        labelEn: 'Specific Requirement Details',
        type: 'textarea',
        required: true,
        placeholderBn: 'যেমন: কী ধরনের কাজ করাতে চান, কোনো বিশেষ সমস্যা আছে কি না...',
        placeholderEn: 'Describe what you need, any specific issues or instructions...'
      },
      {
        id: `f_${Date.now()}_prop`,
        name: 'property_type',
        labelBn: 'স্থাপনার ধরন',
        labelEn: 'Property Type',
        type: 'select',
        required: true,
        options: ['Residential Flat / Apartment', 'Independent House / Duplex', 'Commercial Office', 'Restaurant / Commercial', 'Other'],
        optionsBn: ['আবাসিক ফ্ল্যাট', 'স্বতন্ত্র বাড়ি / ডুপ্লেক্স', 'বাণিজ্যিক অফিস', 'রেস্টুরেন্ট বা শপ', 'অন্যান্য']
      },
      {
        id: `f_${Date.now()}_size`,
        name: 'estimated_size',
        labelBn: 'আনুমানিক সাইজ বা পরিমাণ',
        labelEn: 'Estimated Size / Quantity',
        type: 'text',
        required: false,
        placeholderBn: 'যেমন: ২ সেট / ১০০০ বর্গফুট / ৩টি রুম',
        placeholderEn: 'e.g. 2 sets / 1000 sq ft / 3 rooms'
      },
      {
        id: `f_${Date.now()}_urgency`,
        name: 'urgency_level',
        labelBn: 'কবে নাগাদ সার্ভিস প্রয়োজন?',
        labelEn: 'When is service required?',
        type: 'radio',
        required: true,
        options: ['Immediately / Urgent', 'Within 1-2 Days', 'This Weekend', 'Flexible Timing'],
        optionsBn: ['আজকেই জরুরি', '১-২ দিনের মধ্যে', 'এই ছুটির দিনে', 'সুবিধাজনক সময়ে']
      }
    ]
  };
}

/**
 * Resolve effective booking form config for a service.
 */
export function getServiceBookingForm(service: { id: string; slug?: string; title: string; titleBn?: string; bookingFormConfig?: ServiceBookingFormConfig }): ServiceBookingFormConfig {
  // If service has explicit bookingFormConfig saved by admin, return it
  if (service.bookingFormConfig) {
    return service.bookingFormConfig;
  }

  // Look up matching default template by id or slug
  const matchKey = Object.keys(DEFAULT_SERVICE_BOOKING_FORMS).find(k => 
    service.id === k || 
    service.slug?.includes(k.replace('service-', '')) ||
    (service.title && k.includes(service.title.toLowerCase().replace(/\s+/g, '-')))
  );

  if (matchKey && DEFAULT_SERVICE_BOOKING_FORMS[matchKey]) {
    return DEFAULT_SERVICE_BOOKING_FORMS[matchKey];
  }

  // Generate a generic default form
  return createDefaultGenericForm(service.titleBn || service.title, service.title);
}
