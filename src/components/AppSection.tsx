'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { getAppsByCategory } from '@/lib/apps-data';
import { motion } from 'framer-motion';
import AppCard from './AppCard';
import { Heart, MapPin, Brain, Landmark } from 'lucide-react';

interface AppSectionProps {
  category: 'health' | 'outings' | 'ai' | 'landmarks';
  sectionId: string;
}

const categoryConfig = {
  health: {
    icon: Heart,
    color: '#10b981',
    bgGlow: 'rgba(16,185,129,0.06)',
    gradientFrom: 'from-section-health/5',
  },
  outings: {
    icon: MapPin,
    color: '#f59e0b',
    bgGlow: 'rgba(245,158,11,0.06)',
    gradientFrom: 'from-section-outings/5',
  },
  ai: {
    icon: Brain,
    color: '#8b5cf6',
    bgGlow: 'rgba(139,92,246,0.06)',
    gradientFrom: 'from-section-ai/5',
  },
  landmarks: {
    icon: Landmark,
    color: '#f97316',
    bgGlow: 'rgba(249,115,22,0.06)',
    gradientFrom: 'from-section-landmarks/5',
  },
};

const categoryTitleKeys = {
  health: 'healthSection' as const,
  outings: 'outingsSection' as const,
  ai: 'aiSection' as const,
  landmarks: 'landmarksSection' as const,
};

const categoryDescKeys = {
  health: 'healthDesc' as const,
  outings: 'outingsDesc' as const,
  ai: 'aiDesc' as const,
  landmarks: 'landmarksDesc' as const,
};

export default function AppSection({ category, sectionId }: AppSectionProps) {
  const { t, locale } = useLanguage();
  const apps = getAppsByCategory(category);
  const config = categoryConfig[category];
  const Icon = config.icon;

  return (
    <section
      id={sectionId}
      className="relative py-20 px-4"
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
          className={`flex items-center gap-4 mb-12 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}
          initial={{ opacity: 0, x: locale === 'ar' ? 30 : -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="p-3 rounded-2xl"
            style={{
              background: `${config.color}15`,
              border: `1px solid ${config.color}30`,
            }}
          >
            <Icon className="w-7 h-7" style={{ color: config.color }} />
          </div>
          <div className={locale === 'ar' ? 'text-right' : ''}>
            <h2 className={`text-2xl sm:text-3xl font-bold ${locale === 'ar' ? 'font-arabic' : ''}`} style={{ color: config.color }}>
              {t[categoryTitleKeys[category]]}
            </h2>
            <p className={`text-sm text-accent-silver/50 mt-1 ${locale === 'ar' ? 'font-arabic' : ''}`}>
              {t[categoryDescKeys[category]]}
            </p>
          </div>
        </motion.div>

        {/* Apps grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app, index) => (
            <AppCard key={app.id} app={app} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
