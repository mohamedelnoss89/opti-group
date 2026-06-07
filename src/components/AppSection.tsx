'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { getAppsByCategory } from '@/lib/apps-data';
import { motion } from 'framer-motion';
import AppCard from './AppCard';
import { Heart, MapPin, Brain, Landmark, Moon, Trophy, AlertTriangle } from 'lucide-react';

interface AppSectionProps {
  category: 'health' | 'outings' | 'ai' | 'landmarks' | 'islamic' | 'sports';
  sectionId: string;
}

const categoryConfig = {
  health: {
    icon: Heart,
    color: '#10b981',
    bgGlow: 'rgba(16,185,129,0.03)',
  },
  outings: {
    icon: MapPin,
    color: '#f59e0b',
    bgGlow: 'rgba(245,158,11,0.03)',
  },
  ai: {
    icon: Brain,
    color: '#8b5cf6',
    bgGlow: 'rgba(139,92,246,0.03)',
  },
  landmarks: {
    icon: Landmark,
    color: '#f97316',
    bgGlow: 'rgba(249,115,22,0.03)',
  },
  islamic: {
    icon: Moon,
    color: '#059669',
    bgGlow: 'rgba(5,150,105,0.03)',
  },
  sports: {
    icon: Trophy,
    color: '#ef4444',
    bgGlow: 'rgba(239,68,68,0.03)',
  },
};

const categoryTitleKeys = {
  health: 'healthSection' as const,
  outings: 'outingsSection' as const,
  ai: 'aiSection' as const,
  landmarks: 'landmarksSection' as const,
  islamic: 'islamicSection' as const,
  sports: 'sportsSection' as const,
};

const categoryDescKeys = {
  health: 'healthDesc' as const,
  outings: 'outingsDesc' as const,
  ai: 'aiDesc' as const,
  landmarks: 'landmarksDesc' as const,
  islamic: 'islamicDesc' as const,
  sports: 'sportsDesc' as const,
};

export default function AppSection({ category, sectionId }: AppSectionProps) {
  const { t, locale } = useLanguage();
  const apps = getAppsByCategory(category);
  const config = categoryConfig[category];
  const Icon = config.icon;

  return (
    <section
      id={sectionId}
      className="relative py-16 px-4"
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, ${config.bgGlow}, transparent 70%)`,
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section header */}
        <motion.div
          className={`flex items-center gap-3 mb-8 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}
          initial={{ opacity: 0, x: locale === 'ar' ? 20 : -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <div
            className="p-2.5 rounded-xl"
            style={{
              background: `${config.color}10`,
              border: `1px solid ${config.color}20`,
            }}
          >
            <Icon className="w-5 h-5" style={{ color: config.color }} />
          </div>
          <div className={locale === 'ar' ? 'text-right' : ''}>
            <h2 
              className={`text-lg sm:text-xl font-bold ${locale === 'ar' ? 'font-arabic' : ''}`} 
              style={{ color: config.color }}
            >
              {t[categoryTitleKeys[category]]}
            </h2>
            <p className={`text-xs mt-0.5 ${locale === 'ar' ? 'font-arabic' : ''}`} style={{ color: 'rgba(192,192,192,0.35)' }}>
              {t[categoryDescKeys[category]]}
            </p>
          </div>
        </motion.div>

        {/* Medical Disclaimer - Health section only */}
        {category === 'health' && (
          <motion.div
            className={`mb-6 p-5 rounded-xl text-center ${locale === 'ar' ? 'font-arabic' : ''}`}
            style={{
              background: 'rgba(245, 158, 11, 0.06)',
              border: '1px solid rgba(245, 158, 11, 0.15)',
            }}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4" style={{ color: '#f59e0b' }} />
              <p className="text-xs font-bold" style={{ color: '#f59e0b' }}>
                {locale === 'ar' ? 'تنبيه طبي هام' : 'Important Medical Disclaimer'}
              </p>
              <AlertTriangle className="w-4 h-4" style={{ color: '#f59e0b' }} />
            </div>
            <p className="text-xs leading-relaxed max-w-2xl mx-auto" style={{ color: 'rgba(192,192,192,0.6)' }}>
              {locale === 'ar'
                ? 'المحتوى المقدم في هذا القسم هو لأغراض المعلومات والتوعية فقط ولا يُغني عن استشارة الطبيب المختص. لا تُعتبر المعلومات بديلاً عن التشخيص أو العلاج الطبي المهني. يُرجى استشارة طبيبك قبل اتخاذ أي قرار طبي.'
                : 'The content provided in this section is for informational and educational purposes only and does not replace professional medical advice. This information is not a substitute for professional diagnosis or treatment. Please consult your doctor before making any medical decisions.'
              }
            </p>
          </motion.div>
        )}

        {/* Apps grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {apps.map((app, index) => (
            <AppCard key={app.id} app={app} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
