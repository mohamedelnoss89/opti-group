export interface App {
  id: string;
  name: { ar: string; en: string };
  description: { ar: string; en: string };
  category: 'health' | 'outings' | 'ai' | 'landmarks' | 'islamic' | 'sports';
  icon: string;
  url: string;
  status: 'live' | 'coming_soon';
  fullDescription: { ar: string; en: string };
  features: { ar: string[]; en: string[] };
  imageUrl?: string;
}

export const apps: App[] = [
  {
    id: 'optisize',
    name: { ar: 'أوبتي سايز', en: 'OptiSize' },
    description: { 
      ar: 'مركز صحة العين الشامل - قياس مسافة البؤبؤ، اختبارات النظر، ومعرض النظارات', 
      en: 'Comprehensive Eye Health Center - PD Measurement, Vision Tests & Glasses Gallery' 
    },
    category: 'health',
    icon: '👁️',
    url: 'https://optisize-nine.vercel.app',
    status: 'live',
    fullDescription: {
      ar: 'أوبتي سايز هو تطبيق متكامل لصحة العين يجمع بين التقنية الحديثة والبساطة في الاستخدام. يتيح لك قياس مسافة البؤبؤ (PD) بدقة عالية باستخدام كاميرا هاتفك، وإجراء اختبارات نظر شاملة تشمل اختبار حدة البصر واختبار عمى الألوان واختبار الاستجماتيزم. كما يضم معرض نظارات تفاعلي يمكنك من تجربة النظارات افتراضياً قبل الشراء، مع توصيات ذكية بناءً على شكل وجهك ووصفتك الطبية.',
      en: 'OptiSize is a comprehensive eye health app that combines modern technology with user-friendly design. It allows you to measure your Pupillary Distance (PD) with high accuracy using your phone camera, and conduct thorough vision tests including visual acuity, color blindness, and astigmatism tests. It also features an interactive glasses gallery where you can virtually try on glasses before purchasing, with smart recommendations based on your face shape and prescription.'
    },
    features: {
      ar: [
        'قياس مسافة البؤبؤ (PD) بدقة عالية عبر الكاميرا',
        'اختبارات نظر شاملة: حدة البصر، عمى الألوان، الاستجماتيزم',
        'معرض نظارات تفاعلي مع تجربة افتراضية',
        'توصيات ذكية للنظارات بناءً على شكل الوجه',
        'حفظ وتتبع نتائج الفحوصات',
        'واجهة سهلة الاستخدام باللغتين العربية والإنجليزية'
      ],
      en: [
        'High-accuracy Pupillary Distance (PD) measurement via camera',
        'Comprehensive vision tests: visual acuity, color blindness, astigmatism',
        'Interactive glasses gallery with virtual try-on',
        'Smart glasses recommendations based on face shape',
        'Save and track your test results over time',
        'User-friendly bilingual interface (Arabic & English)'
      ]
    },
  },
  {
    id: 'optifit',
    name: { ar: 'أوبتي فيت', en: 'OptiFit' },
    description: { 
      ar: 'مدرب لياقة بدنية شخصي بالذكاء الاصطناعي', 
      en: 'AI-powered personal fitness trainer' 
    },
    category: 'health',
    icon: '🏋️',
    url: '#',
    status: 'coming_soon',
    fullDescription: {
      ar: 'أوبتي فيت هو مدربك الشخصي الذكي الذي يصمم برامج تدريبية مخصصة بناءً على أهدافك ومستواك البدني. باستخدام تقنيات الذكاء الاصطناعي، يتابع تقدمك ويعدل خطتك تلقائياً لضمان أفضل النتائج. سواء كنت مبتدئاً أو محترفاً، ستجد برنامجاً يناسبك.',
      en: 'OptiFit is your smart personal trainer that designs customized workout programs based on your goals and fitness level. Using AI technology, it tracks your progress and automatically adjusts your plan to ensure optimal results. Whether you are a beginner or a pro, you will find a program that suits you.'
    },
    features: {
      ar: [
        'برامج تدريبية مخصصة بالذكاء الاصطناعي',
        'تتبع التقدم والإنجازات يومياً',
        'تعديل تلقائي لخطة التدريب',
        'تمارين مصورة مع شرح تفصيلي',
        'تكامل مع الأجهزة الذكية',
        'دعم التغذية والنصائح الصحية'
      ],
      en: [
        'AI-customized workout programs',
        'Daily progress and achievement tracking',
        'Automatic workout plan adjustments',
        'Illustrated exercises with detailed instructions',
        'Smart device integration',
        'Nutrition support and health tips'
      ]
    },
  },
  {
    id: 'optinutrition',
    name: { ar: 'أوبتي نيوتريشن', en: 'OptiNutrition' },
    description: { 
      ar: 'تخطيط وجبات ذكي و تتبع تغذية', 
      en: 'Smart meal planning and nutrition tracking' 
    },
    category: 'health',
    icon: '🥗',
    url: '#',
    status: 'coming_soon',
    fullDescription: {
      ar: 'أوبتي نيوتريشن يساعدك على التغذية السليمة من خلال تخطيط وجبات مخصصة وتتبع العناصر الغذائية. يقدم نصائح غذائية مبنية على أهدافك الصحية ويحلل وجباتك لضمان حصولك على كل ما يحتاجه جسمك.',
      en: 'OptiNutrition helps you eat healthy through personalized meal planning and nutrient tracking. It provides dietary advice based on your health goals and analyzes your meals to ensure your body gets everything it needs.'
    },
    features: {
      ar: [
        'تخطيط وجبات أسبوعية مخصص',
        'تتبع السعرات الحرارية والعناصر الغذائية',
        'قاعدة بيانات واسعة من الأطعمة',
        'نصائح غذائية ذكية حسب الأهداف',
        'قوائم تسوق تلقائية',
        'دعم الحميات الخاصة والتحسسات'
      ],
      en: [
        'Custom weekly meal planning',
        'Calorie and nutrient tracking',
        'Extensive food database',
        'Smart dietary advice based on goals',
        'Automatic shopping lists',
        'Special diet and allergy support'
      ]
    },
  },
  {
    id: 'optitrip',
    name: { ar: 'أوبتي ترِب', en: 'OptiTrip' },
    description: { 
      ar: 'خطط لخروجاتك المثالية مع توصيات مخصصة', 
      en: 'Plan your perfect outings with personalized recommendations' 
    },
    category: 'outings',
    icon: '🗺️',
    url: '#',
    status: 'coming_soon',
    fullDescription: {
      ar: 'أوبتي ترب هو رفيقك المثالي لتخطيط الخروجات والرحلات. يقدم توصيات مخصصة لأفضل المطاعم والحدائق والأماكن الترفيهية بناءً على اهتماماتك وموقعك. خطط رحلاتك بسهولة واكتشف أماكن جديدة لم تكن لتعرفها.',
      en: 'OptiTrip is your ideal companion for planning outings and trips. It provides personalized recommendations for the best restaurants, parks, and entertainment venues based on your interests and location. Plan your trips easily and discover new places you never knew existed.'
    },
    features: {
      ar: [
        'توصيات مخصصة بناءً على الاهتمامات',
        'تخطيط مسارات الرحلات الذكية',
        'تقييمات ومراجعات حقيقية',
        'خرائط تفاعلية مع إرشادات',
        'حجز مطاعم وتذاكر',
        'وضع أوفلاين للرحلات'
      ],
      en: [
        'Personalized recommendations based on interests',
        'Smart trip route planning',
        'Real ratings and reviews',
        'Interactive maps with directions',
        'Restaurant and ticket reservations',
        'Offline mode for trips'
      ]
    },
  },
  {
    id: 'optievent',
    name: { ar: 'أوبتي إيفنت', en: 'OptiEvent' },
    description: { 
      ar: 'اكتشف الفعاليات والأنشطة القريبة منك', 
      en: 'Discover events and activities near you' 
    },
    category: 'outings',
    icon: '🎉',
    url: '#',
    status: 'coming_soon',
    fullDescription: {
      ar: 'أوبتي إيفنت يتيح لك اكتشاف الفعاليات والأنشطة المحلية القريبة منك. من الحفلات الموسيقية والمعارض الفنية إلى الورش التعليمية والفعاليات الرياضية، لن تفوتك أي فرصة للترفيه والتواصل.',
      en: 'OptiEvent lets you discover local events and activities near you. From concerts and art exhibitions to educational workshops and sports events, you will never miss an opportunity for entertainment and socializing.'
    },
    features: {
      ar: [
        'اكتشاف فعاليات قريبة بناءً على الموقع',
        'تصنيفات متعددة: فن، رياضة، تعليم، ترفيه',
        'تذاكر إلكترونية وحجز فوري',
        'تذكيرات بالفعاليات القادمة',
        'مشاركة الفعاليات مع الأصدقاء',
        'تقويم شخصي للفعاليات'
      ],
      en: [
        'Discover nearby events based on location',
        'Multiple categories: art, sports, education, entertainment',
        'E-tickets and instant booking',
        'Reminders for upcoming events',
        'Share events with friends',
        'Personal event calendar'
      ]
    },
  },
  {
    id: 'optichat',
    name: { ar: 'أوبتي شات', en: 'OptiChat' },
    description: { 
      ar: 'مساعد ذكي يجيب على جميع أسئلتك', 
      en: 'Smart AI assistant that answers all your questions' 
    },
    category: 'ai',
    icon: '🤖',
    url: '#',
    status: 'coming_soon',
    fullDescription: {
      ar: 'أوبتي شات هو مساعدك الذكي المحادث الذي يجيب على أسئلتك في مختلف المجالات. من المساعدة في الدراسة إلى كتابة المحتوى وحل المشكلات، يقدم لك إجابات دقيقة وسريعة بأسلوب محادثة طبيعي.',
      en: 'OptiChat is your smart conversational assistant that answers your questions across various domains. From study help to content writing and problem solving, it provides accurate and fast answers in a natural conversation style.'
    },
    features: {
      ar: [
        'محادثة ذكية بأسلوب طبيعي',
        'دعم متعدد اللغات بما فيها العربية',
        'مساعدة في الكتابة والترجمة',
        'حل المسائل الرياضية والعلمية',
        'حفظ سجل المحادثات',
        'تخصيص نمط المحادثة'
      ],
      en: [
        'Smart natural-style conversation',
        'Multi-language support including Arabic',
        'Writing and translation assistance',
        'Math and science problem solving',
        'Conversation history saving',
        'Customizable conversation style'
      ]
    },
  },
  {
    id: 'optivision',
    name: { ar: 'أوبتي فيجن', en: 'OptiVision' },
    description: { 
      ar: 'تحليل الصور بالذكاء الاصطناعي', 
      en: 'AI-powered image analysis and recognition' 
    },
    category: 'ai',
    icon: '👁️',
    url: '#',
    status: 'coming_soon',
    fullDescription: {
      ar: 'أوبتي فيجن يستخدم أحدث تقنيات الذكاء الاصطناعي لتحليل وفهم الصور. ارفع أي صورة واحصل على وصف تفصيلي وتحليل محتواها، مع إمكانية التعرف على النصوص والكائنات والأشخاص في الصورة.',
      en: 'OptiVision uses the latest AI technology to analyze and understand images. Upload any image and get a detailed description and content analysis, with the ability to recognize text, objects, and people in the image.'
    },
    features: {
      ar: [
        'وصف وتحليل الصور بالذكاء الاصطناعي',
        'التعرف على النصوص في الصور (OCR)',
        'كشف الكائنات والعناصر',
        'تحليل الألوان والتركيب البصري',
        'مشاركة النتائج بسهولة',
        'دعم صيغ صور متعددة'
      ],
      en: [
        'AI-powered image description and analysis',
        'Text recognition in images (OCR)',
        'Object and element detection',
        'Color and visual composition analysis',
        'Easy results sharing',
        'Multiple image format support'
      ]
    },
  },
  {
    id: 'optipyr',
    name: { ar: 'أوبتي باير', en: 'OptiPyr' },
    description: { 
      ar: 'جولة افتراضية داخل الأهرامات المصرية', 
      en: 'Virtual tour inside the Egyptian Pyramids' 
    },
    category: 'landmarks',
    icon: '🏛️',
    url: '#',
    status: 'coming_soon',
    fullDescription: {
      ar: 'أوبتي باير يأخذك في رحلة افتراضية مذهلة داخل أهرامات الجيزة. استكشف الغرف السرية والممرات القديمة بتقنية ثلاثية الأبعاد عالية الدقة، مع شرح تفصيلي لتاريخ كل جزء وأسرار البناء الفرعوني.',
      en: 'OptiPyr takes you on an amazing virtual tour inside the Giza Pyramids. Explore secret chambers and ancient passages in high-resolution 3D technology, with detailed explanations of the history of each part and the secrets of Pharaonic construction.'
    },
    features: {
      ar: [
        'جولة ثلاثية الأبعاد داخل الأهرامات',
        'استكشاف الغرف والممرات السرية',
        'شرح صوتي تفصيلي بالعربية',
        'صور ومعلومات تاريخية غنية',
        'وضع الواقع الافتراضي (VR)',
        'خرائط تفاعلية للمواقع الأثرية'
      ],
      en: [
        '3D tour inside the Pyramids',
        'Explore secret chambers and passages',
        'Detailed Arabic audio narration',
        'Rich historical images and information',
        'Virtual Reality (VR) mode',
        'Interactive archaeological site maps'
      ]
    },
  },
  {
    id: 'optinile',
    name: { ar: 'أوبتي نايل', en: 'OptiNile' },
    description: { 
      ar: 'اكتشف معالم النيل وجولة في أجمل الأماكن', 
      en: 'Discover Nile landmarks and tour the most beautiful places' 
    },
    category: 'landmarks',
    icon: '🌊',
    url: '#',
    status: 'coming_soon',
    fullDescription: {
      ar: 'أوبتي نايل يرشدك لاكتشاف أجمل معالم نهر النيل من الأقصر إلى القاهرة. جولات افتراضية على سفن النيل، استكشاف المعابد الفرعونية، والتعرف على الحضارة المصرية القديمة عبر تجربة تفاعلية فريدة.',
      en: 'OptiNile guides you to discover the most beautiful landmarks of the Nile River from Luxor to Cairo. Virtual Nile cruise tours, exploration of Pharaonic temples, and learning about ancient Egyptian civilization through a unique interactive experience.'
    },
    features: {
      ar: [
        'جولات افتراضية على سفن النيل',
        'استكشاف المعابد الفرعونية',
        'خرائط تفاعلية لنهر النيل',
        'محتوى تاريخي غني بالصور والفيديو',
        'توصيات لأفضل الأماكن السياحية',
        'دعم الواقع المعزز (AR)'
      ],
      en: [
        'Virtual Nile cruise tours',
        'Pharaonic temple exploration',
        'Interactive Nile River maps',
        'Rich historical content with photos and videos',
        'Recommendations for best tourist spots',
        'Augmented Reality (AR) support'
      ]
    },
  },
  {
    id: 'optipray',
    name: { ar: 'أوبتي صلاة', en: 'OptiPray' },
    description: { 
      ar: 'مواقيت الصلاة واتجاه القبلة بدقة عالية', 
      en: 'Accurate prayer times & Qibla direction' 
    },
    category: 'islamic',
    icon: '🕌',
    url: '#',
    status: 'coming_soon',
    fullDescription: {
      ar: 'أوبتي صلاة هو تطبيق مواقيت الصلاة الأكثر دقة، يحدد أوقات الصلوات الخمس بناءً على موقعك الجغرافي بدقة عالية. يضم بوصلة قبلة ذكية تساعدك على تحديد اتجاه الكعبة المشرفة من أي مكان في العالم، مع تنبيهات ذكية قبل الأذان وإشعارات لأوقات الصلاة والسحر. يدعم عدة طرق حسابية لمواقيت الصلاة ليناسب جميع البلدان.',
      en: 'OptiPray is the most accurate prayer times app, determining the five daily prayer times based on your geographic location with high precision. It features a smart Qibla compass that helps you find the direction of the Holy Kaaba from anywhere in the world, with smart alerts before Adhan and notifications for prayer and Suhoor times. It supports multiple calculation methods to suit all countries.'
    },
    features: {
      ar: [
        'مواقيت الصلاة بدقة عالية حسب الموقع',
        'بوصلة قبلة ذكية ثلاثية الأبعاد',
        'تنبيهات قبل الأذان وبعده',
        'إشعارات أوقات السحر والإمساك',
        'دعم طرق حسابية متعددة للمواقيت',
        'وضع صامت تلقائي أثناء الصلاة'
      ],
      en: [
        'High-accuracy prayer times based on location',
        'Smart 3D Qibla compass',
        'Alerts before and after Adhan',
        'Suhoor and Imsak time notifications',
        'Multiple prayer time calculation methods',
        'Automatic silent mode during prayer'
      ]
    },
  },
  {
    id: 'optiquran',
    name: { ar: 'أوبتي قرآن', en: 'OptiQuran' },
    description: { 
      ar: 'القرآن الكريم مع تلاوات وتفسير وترجمة', 
      en: 'Holy Quran with recitations, tafseer & translation' 
    },
    category: 'islamic',
    icon: '📖',
    url: '#',
    status: 'coming_soon',
    fullDescription: {
      ar: 'أوبتي قرآن يقدم لك القرآن الكريم كاملاً بخط واضح وجميل مع إمكانية الاستماع لتلاوات أشهر القراء من حول العالم. يضم تفسير ابن كثير وترجمة معاني القرآن لعدة لغات، مع خاصية البحث السريع في الآيات والسور وميزة حفظ العلامات والمراجعات لمتابعة خطة الحفظ.',
      en: 'OptiQuran offers the complete Holy Quran in clear and beautiful font with the ability to listen to recitations by the most famous reciters worldwide. It includes Ibn Kathir tafseer and Quran translations in multiple languages, with fast search in verses and surahs, and bookmark and review features to track your memorization plan.'
    },
    features: {
      ar: [
        'القرآن الكريم كاملاً بخط عثماني واضح',
        'تلاوات صوتية لأشهر القراء',
        'تفسير ابن كثير وترجمة معاني متعددة',
        'بحث سريع في الآيات والسور',
        'خطة حفظ ومتابعة المراجعات',
        'وضع القراءة الليلية المريحة للعين'
      ],
      en: [
        'Complete Holy Quran in clear Uthmani script',
        'Audio recitations by famous reciters',
        'Ibn Kathir tafseer & multiple translations',
        'Fast search in verses and surahs',
        'Memorization plan & review tracking',
        'Comfortable night reading mode'
      ]
    },
  },
  {
    id: 'optiazkar',
    name: { ar: 'أوبتي أذكار', en: 'OptiAzkar' },
    description: { 
      ar: 'أذكار الصباح والمساء وأدعية يومية ميسرة', 
      en: 'Morning & evening azkar and daily duas' 
    },
    category: 'islamic',
    icon: '🤲',
    url: '#',
    status: 'coming_soon',
    fullDescription: {
      ar: 'أوبتي أذكار رفيقك اليومي للأذكار والأدعية الشرعية. يقدم أذكار الصباح والمساء كاملة مع العد والتتبع، وأدعية يومية لكل مناسبة من النوم والأكل والسفر والصلاة على النبي. يتميز بتصميم بسيط ومريح مع تذكيرات ذكية في الأوقات المناسبة وخاصية المشاركة.',
      en: 'OptiAzkar is your daily companion for authentic azkar and duas. It offers complete morning and evening azkar with counting and tracking, and daily duas for every occasion including sleep, eating, travel, and Salawat. It features a simple and comfortable design with smart reminders at the right times and sharing capability.'
    },
    features: {
      ar: [
        'أذكار الصباح والمساء مع عدّ التكرار',
        'أدعية يومية لكل مناسبة',
        'تذكيرات ذكية في الأوقات المناسبة',
        'تتبع ورد الأذكار اليومي',
        'تصميم بسيط ومريح للقراءة',
        'مشاركة الأذكار والأدعية بسهولة'
      ],
      en: [
        'Morning & evening azkar with repetition counter',
        'Daily duas for every occasion',
        'Smart reminders at the right times',
        'Daily azkar tracker and progress',
        'Simple and comfortable reading design',
        'Easy sharing of azkar and duas'
      ]
    },
  },
  {
    id: 'optiscore',
    name: { ar: 'أوبتي سكور', en: 'OptiScore' },
    description: { 
      ar: 'نتائج المباريات المباشرة وأخبار الرياضة', 
      en: 'Live match scores & sports news' 
    },
    category: 'sports',
    icon: '⚽',
    url: '#',
    status: 'coming_soon',
    fullDescription: {
      ar: 'أوبتي سكور تطبيقك الأول لمتابعة نتائج المباريات المباشرة لحظة بلحظة. يغطي جميع الرياضات من كرة القدم والكرة السلة إلى التنس والكريكت. إشعارات فورية للأهداف والبطاقات والتغييرات، مع تحليلات إحصائية شاملة وأخبار رياضية عاجلة من حول العالم.',
      en: 'OptiScore is your go-to app for following live match scores moment by moment. It covers all sports from football and basketball to tennis and cricket. Instant notifications for goals, cards, and substitutions, with comprehensive statistical analysis and breaking sports news from around the world.'
    },
    features: {
      ar: [
        'نتائج مباشرة لأكثر من ٣٠ رياضة',
        'إشعارات فورية للأهداف والأحداث',
        'ترتيب الدوريات والبطولات',
        'إحصائيات وتحليلات مفصلة',
        'أخبار رياضية عاجلة ومقالات',
        'تخصيص فرقك المفضلة للمتابعة'
      ],
      en: [
        'Live scores for 30+ sports',
        'Instant notifications for goals & events',
        'League and tournament standings',
        'Detailed statistics and analysis',
        'Breaking sports news and articles',
        'Customize favorite teams to follow'
      ]
    },
  },
  {
    id: 'optileague',
    name: { ar: 'أوبتي ليغ', en: 'OptiLeague' },
    description: { 
      ar: 'تتبع الدوريات والبطولات وتشكيلات الفرق', 
      en: 'Track leagues, tournaments & team lineups' 
    },
    category: 'sports',
    icon: '🏆',
    url: '#',
    status: 'coming_soon',
    fullDescription: {
      ar: 'أوبتي ليغ يمنحك تجربة شاملة لمتابعة الدوريات والبطولات العالمية والمحلية. جدول مباريات كامل مع تشكيلات الفرق قبل المباراة، تصريحات المدربين واللاعبين، وأداء الفرق التاريخي. تابع دوري أبطال أفريقيا والدوري المصري والدوريات الأوروبية الكبرى في مكان واحد.',
      en: 'OptiLeague gives you a comprehensive experience for following global and local leagues and tournaments. Full match schedule with team lineups before the match, coach and player statements, and historical team performance. Follow the CAF Champions League, Egyptian Premier League, and major European leagues all in one place.'
    },
    features: {
      ar: [
        'جداول مباريات كاملة مع التوقيت',
        'تشكيلات الفرق قبل بداية المباراة',
        'ترتيب الهدافين وصناع الألعاب',
        'مقارنة الأداء بين الفرق',
        'تغطية الدوري المصري والأفريقي',
        'تذكيرات بمواعيد المباريات'
      ],
      en: [
        'Complete match schedules with timings',
        'Team lineups before match kick-off',
        'Top scorers and assist makers rankings',
        'Performance comparison between teams',
        'Egyptian & African league coverage',
        'Match time reminders'
      ]
    },
  },
  {
    id: 'optiplay',
    name: { ar: 'أوبتي بلاي', en: 'OptiPlay' },
    description: { 
      ar: 'احجز ملاعب ومرافق رياضية بالقرب منك', 
      en: 'Book sports courts & facilities near you' 
    },
    category: 'sports',
    icon: '🏟️',
    url: '#',
    status: 'coming_soon',
    fullDescription: {
      ar: 'أوبتي بلاي يساعدك على العثور على ملاعب ومرافق رياضية قريبة وحجزها بسهولة. سواء كنت تبحث عن ملعب كرة قدم أو ملعب كرة سلة أو صالة جيم أو مسبح، ستجده مع إمكانية الحجز الفوري والدفع الإلكتروني. كما يتيح لك تنظيم مباريات مع أصدقائك أو الانضمام لمباريات جماعية قريبة.',
      en: 'OptiPlay helps you find and book nearby sports courts and facilities with ease. Whether you are looking for a football pitch, basketball court, gym, or swimming pool, you will find it with instant booking and electronic payment. It also lets you organize matches with friends or join nearby group games.'
    },
    features: {
      ar: [
        'بحث عن ملاعب ومرافق رياضية قريبة',
        'حجز فوري مع الدفع الإلكتروني',
        'تنظيم مباريات مع الأصدقاء',
        'الانضمام لمباريات جماعية مفتوحة',
        'تقييمات ومراجعات للمرافق',
        'عروض وخصومات على الحجوزات'
      ],
      en: [
        'Find nearby sports courts & facilities',
        'Instant booking with e-payment',
        'Organize matches with friends',
        'Join open group games',
        'Facility ratings and reviews',
        'Deals and discounts on bookings'
      ]
    },
  },
];

export const categories = [
  { id: 'health' as const, sectionId: 'section-health' },
  { id: 'outings' as const, sectionId: 'section-outings' },
  { id: 'ai' as const, sectionId: 'section-ai' },
  { id: 'landmarks' as const, sectionId: 'section-landmarks' },
  { id: 'islamic' as const, sectionId: 'section-islamic' },
  { id: 'sports' as const, sectionId: 'section-sports' },
];

export function getAppsByCategory(category: App['category']): App[] {
  return apps.filter(app => app.category === category);
}

export function getAppCountByCategory(category: App['category']): number {
  return apps.filter(app => app.category === category).length;
}
