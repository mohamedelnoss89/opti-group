'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { App } from '@/lib/apps-data';
import { motion } from 'framer-motion';
import { ExternalLink, Lock, Heart } from 'lucide-react';
import LoginPrompt from './LoginPrompt';
import AppDetailModal from './AppDetailModal';

interface AppCardProps {
  app: App;
  index: number;
}

const categoryAccentColors: Record<string, { border: string; glow: string; badge: string; badgeText: string; hoverBorder: string }> = {
  health: {
    border: 'rgba(16,185,129,0.12)',
    glow: '0 8px 32px rgba(16,185,129,0.06)',
    badge: 'rgba(16,185,129,0.1)',
    badgeText: '#10b981',
    hoverBorder: 'rgba(16,185,129,0.3)',
  },
  outings: {
    border: 'rgba(245,158,11,0.12)',
    glow: '0 8px 32px rgba(245,158,11,0.06)',
    badge: 'rgba(245,158,11,0.1)',
    badgeText: '#f59e0b',
    hoverBorder: 'rgba(245,158,11,0.3)',
  },
  ai: {
    border: 'rgba(139,92,246,0.12)',
    glow: '0 8px 32px rgba(139,92,246,0.06)',
    badge: 'rgba(139,92,246,0.1)',
    badgeText: '#8b5cf6',
    hoverBorder: 'rgba(139,92,246,0.3)',
  },
  landmarks: {
    border: 'rgba(249,115,22,0.12)',
    glow: '0 8px 32px rgba(249,115,22,0.06)',
    badge: 'rgba(249,115,22,0.1)',
    badgeText: '#f97316',
    hoverBorder: 'rgba(249,115,22,0.3)',
  },
  islamic: {
    border: 'rgba(5,150,105,0.12)',
    glow: '0 8px 32px rgba(5,150,105,0.06)',
    badge: 'rgba(5,150,105,0.1)',
    badgeText: '#059669',
    hoverBorder: 'rgba(5,150,105,0.3)',
  },
  sports: {
    border: 'rgba(239,68,68,0.12)',
    glow: '0 8px 32px rgba(239,68,68,0.06)',
    badge: 'rgba(239,68,68,0.1)',
    badgeText: '#ef4444',
    hoverBorder: 'rgba(239,68,68,0.3)',
  },
};

export default function AppCard({ app, index }: AppCardProps) {
  const { t, locale } = useLanguage();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const colors = categoryAccentColors[app.category];
  const isLive = app.status === 'live';
  const [showLogin, setShowLogin] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [heartAnimating, setHeartAnimating] = useState(false);
  const favorited = isFavorite(app.id);

  const handleVisitClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      setShowLogin(true);
    }
  };

  const handleCardClick = () => {
    setShowDetail(true);
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      setShowLogin(true);
      return;
    }
    setHeartAnimating(true);
    setTimeout(() => setHeartAnimating(false), 400);
    toggleFavorite(app.id);
  };

  return (
    <>
      <motion.div
        className="relative overflow-hidden group rounded-2xl cursor-pointer"
        style={{
          background: 'rgba(26, 31, 54, 0.4)',
          backdropFilter: 'blur(12px)',
          border: `1px solid ${colors.border}`,
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-30px' }}
        transition={{ duration: 0.4, delay: index * 0.08 }}
        whileHover={{
          borderColor: isLive ? colors.hoverBorder : colors.border,
          boxShadow: isLive ? colors.glow : 'none',
          y: -2,
        }}
        onClick={handleCardClick}
      >
        {/* Top row: icon + heart + status */}
        <div className="flex items-start justify-between">
          <span className="text-3xl">{app.icon}</span>
          <div className="flex items-center gap-2">
            {/* Heart/Favorite Button */}
            <motion.button
              onClick={handleHeartClick}
              className="p-1.5 rounded-lg cursor-pointer transition-colors relative"
              style={{
                background: favorited ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.03)',
                border: favorited ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(255,255,255,0.05)',
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.85 }}
              animate={heartAnimating ? { scale: [1, 1.3, 1] } : {}}
              transition={heartAnimating ? { duration: 0.3 } : {}}
              aria-label={favorited ? t.favoriteRemoved : t.favoriteAdded}
            >
              <Heart
                className="w-3.5 h-3.5"
                style={{
                  color: favorited ? '#ef4444' : 'rgba(192,192,192,0.4)',
                  fill: favorited ? '#ef4444' : 'none',
                }}
              />
            </motion.button>

            {/* Status Badge */}
            <span
              className="text-[10px] font-medium px-2.5 py-1 rounded-full uppercase tracking-wider"
              style={{
                background: isLive ? colors.badge : 'rgba(255,255,255,0.03)',
                color: isLive ? colors.badgeText : 'rgba(192,192,192,0.35)',
                border: isLive ? 'none' : '1px solid rgba(192,192,192,0.06)',
              }}
            >
              {isLive ? t.live : t.comingSoon}
            </span>
          </div>
        </div>

        {/* App name + desc */}
        <div style={{ flex: 1 }}>
          <h3 
            className={`text-base font-bold mb-1 ${locale === 'ar' ? 'font-arabic text-right' : ''}`}
            style={{ color: 'rgba(232,232,232,0.9)' }}
          >
            {app.name[locale]}
          </h3>
          <p 
            className={`text-xs leading-relaxed ${locale === 'ar' ? 'font-arabic text-right' : ''}`}
            style={{ color: 'rgba(192,192,192,0.45)' }}
          >
            {app.description[locale]}
          </p>
        </div>

        {/* Action button */}
        <div>
          {isLive ? (
            <motion.a
              href={user ? app.url : '#'}
              target={user ? '_blank' : undefined}
              rel={user ? 'noopener noreferrer' : undefined}
              onClick={handleVisitClick}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold no-underline transition-all duration-300 cursor-pointer"
              style={{
                background: colors.badge,
                border: `1px solid ${colors.border}`,
                color: colors.badgeText,
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {user ? t.visit : (locale === 'ar' ? 'سجّل للوصول' : 'Sign in to access')}
              {user ? <ExternalLink className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
            </motion.a>
          ) : (
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(192,192,192,0.06)',
                color: 'rgba(192,192,192,0.3)',
              }}
            >
              <Lock className="w-3 h-3" />
              {t.comingSoon}
            </div>
          )}
        </div>
      </motion.div>

      {/* Login Prompt Modal */}
      <LoginPrompt
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        messageAr="سجّل دخولك لإضافة تطبيقات إلى المفضلة"
        message="Sign in to add apps to your favorites"
      />

      {/* App Detail Modal */}
      <AppDetailModal
        app={app}
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
      />
    </>
  );
}
