export interface App {
  id: string;
  name: { ar: string; en: string };
  description: { ar: string; en: string };
  category: 'health' | 'outings' | 'ai' | 'landmarks';
  icon: string;
  url: string;
  status: 'live' | 'coming_soon';
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
  },
];

export const categories = [
  { id: 'health' as const, sectionId: 'section-health' },
  { id: 'outings' as const, sectionId: 'section-outings' },
  { id: 'ai' as const, sectionId: 'section-ai' },
  { id: 'landmarks' as const, sectionId: 'section-landmarks' },
];

export function getAppsByCategory(category: App['category']): App[] {
  return apps.filter(app => app.category === category);
}

export function getAppCountByCategory(category: App['category']): number {
  return apps.filter(app => app.category === category).length;
}
