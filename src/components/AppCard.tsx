'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { App } from '@/lib/apps-data';
import { motion } from 'framer-motion';
import { ExternalLink, Lock } from 'lucide-react';

interface AppCardProps {
  app: App;
  index: number;
}

const categoryAccentColors: Record<string, { border: string; glow: string; badge: string; badgeText: string }> = {
  health: {
    border: 'rgba(16,185,129,0.2)',
    glow: '0 0 20px rgba(16,185,129,0.08)',
    badge: 'rgba(16,185,129,0.12)',
    badgeText: '#10b981',
  },
  outings: {
    border: 'rgba(245,158,11,0.2)',
    glow: '0 0 20px rgba(245,158,11,0.08)',
    badge: 'rgba(245,158,11,0.12)',
    badgeText: '#f59e0b',
  },
  ai: {
    border: 'rgba(139,92,246,0.2)',
    glow: '0 0 20px rgba(139,92,246,0.08)',
    badge: 'rgba(139,92,246,0.12)',
    badgeText: '#8b5cf6',
  },
  landmarks: {
    border: 'rgba(249,115,22,0.2)',
    glow: '0 0 20px rgba(249,115,22,0.08)',
    badge: 'rgba(249,115,22,0.12)',
    badgeText: '#f97316',
  },
};

export default function AppCard({ app, index }: AppCardProps) {
  const { t, locale } = useLanguage();
  const colors = categoryAccentColors[app.category];
  const isLive = app.status === 'live';

  return (
    <motion.div
      className="glass-card p-6 flex flex-col gap-4 relative overflow-hidden group"
      style={{
        borderColor: colors.border,
      }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{
        borderColor: isLive ? colors.border.replace('0.2', '0.4') : undefined,
        boxShadow: isLive ? colors.glow : undefined,
        y: -4,
      }}
    >
      {/* Shimmer overlay on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 shimmer pointer-events-none" />

      {/* App icon and status */}
      <div className="flex items-start justify-between">
        <span className="text-4xl">{app.icon}</span>
        <span
          className="text-xs font-medium px-3 py-1 rounded-full"
          style={{
            background: isLive ? colors.badge : 'rgba(255,255,255,0.05)',
            color: isLive ? colors.badgeText : 'rgba(192,192,192,0.5)',
          }}
        >
          {isLive ? t.live : t.comingSoon}
        </span>
      </div>

      {/* App name */}
      <div>
        <h3 className={`text-lg font-bold text-accent-silver ${locale === 'ar' ? 'font-arabic text-right' : ''}`}>
          {app.name[locale]}
        </h3>
        <p className={`mt-1 text-sm text-accent-silver/50 leading-relaxed ${locale === 'ar' ? 'font-arabic text-right' : ''}`}>
          {app.description[locale]}
        </p>
      </div>

      {/* Visit button */}
      <div className="mt-auto">
        {isLive ? (
          <motion.a
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold no-underline transition-all duration-300"
            style={{
              background: `linear-gradient(135deg, ${colors.badge}, rgba(14,165,233,0.1))`,
              border: `1px solid ${colors.border}`,
              color: colors.badgeText,
            }}
            whileHover={{ scale: 1.05, boxShadow: colors.glow }}
            whileTap={{ scale: 0.95 }}
          >
            {t.visit}
            <ExternalLink className="w-4 h-4" />
          </motion.a>
        ) : (
          <div
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium cursor-not-allowed"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(192,192,192,0.08)',
              color: 'rgba(192,192,192,0.4)',
            }}
          >
            <Lock className="w-4 h-4" />
            {t.comingSoon}
          </div>
        )}
      </div>
    </motion.div>
  );
}
