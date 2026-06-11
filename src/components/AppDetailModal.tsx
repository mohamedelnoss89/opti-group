'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { App } from '@/lib/apps-data';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Lock, CheckCircle2, Heart } from 'lucide-react';
import LoginPrompt from './LoginPrompt';

interface AppDetailModalProps {
  app: App | null;
  isOpen: boolean;
  onClose: () => void;
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
};

const categoryLabels: Record<string, { ar: string; en: string }> = {
  health: { ar: 'الصحة', en: 'Health' },
  outings: { ar: 'الخروجات', en: 'Outings' },
  ai: { ar: 'الذكاء الاصطناعي', en: 'AI' },
  landmarks: { ar: 'المعالم السياحية', en: 'Landmarks' },
};

export default function AppDetailModal({ app, isOpen, onClose }: AppDetailModalProps) {
  const { t, locale } = useLanguage();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [showLogin, setShowLogin] = useState(false);
  const [heartAnimating, setHeartAnimating] = useState(false);
  const isArabic = locale === 'ar';

  if (!app) return null;

  const colors = categoryAccentColors[app.category];
  const isLive = app.status === 'live';
  const favorited = isFavorite(app.id);

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
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />

            {/* Modal container */}
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="relative max-w-lg w-full rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
                style={{
                  background: 'rgba(16, 20, 38, 0.98)',
                  backdropFilter: 'blur(24px)',
                  border: `1px solid ${colors.border}`,
                  boxShadow: `0 25px 80px rgba(0,0,0,0.5), ${colors.glow}`,
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(255,255,255,0.05) transparent',
                }}
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close button */}
                <button
                  onClick={onClose}
                  className={`absolute top-4 ${isArabic ? 'left-4' : 'right-4'} p-2 rounded-xl cursor-pointer z-10 transition-colors`}
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  <X className="w-4 h-4" style={{ color: 'rgba(192,192,192,0.6)' }} />
                </button>

                {/* Top accent gradient */}
                <div
                  className="h-1.5 w-full"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${colors.badgeText}, transparent)`,
                    opacity: 0.6,
                  }}
                />

                <div className="p-6 sm:p-8">
                  {/* Header: Icon + Name + Badges + Heart */}
                  <motion.div
                    className={`flex items-start gap-4 mb-6 ${isArabic ? 'flex-row-reverse text-right' : ''}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                  >
                    {/* Icon */}
                    <div
                      className="text-4xl p-3 rounded-2xl flex-shrink-0"
                      style={{
                        background: colors.badge,
                        border: `1px solid ${colors.border}`,
                      }}
                    >
                      {app.icon}
                    </div>

                    {/* Name, Heart & Badges */}
                    <div className={`flex-1 min-w-0 ${isArabic ? 'text-right' : ''}`}>
                      <div className={`flex items-center gap-2 mb-2 ${isArabic ? 'flex-row-reverse' : ''}`}>
                        <h2
                          className={`text-xl font-bold ${isArabic ? 'font-arabic' : ''}`}
                          style={{ color: 'rgba(232,232,232,0.95)' }}
                        >
                          {app.name[locale]}
                        </h2>
                        {/* Heart/Favorite Button */}
                        <motion.button
                          onClick={handleHeartClick}
                          className="p-1.5 rounded-lg cursor-pointer transition-colors flex-shrink-0"
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
                            className="w-4 h-4"
                            style={{
                              color: favorited ? '#ef4444' : 'rgba(192,192,192,0.4)',
                              fill: favorited ? '#ef4444' : 'none',
                            }}
                          />
                        </motion.button>
                      </div>
                      <div className={`flex flex-wrap gap-2 ${isArabic ? 'justify-end' : ''}`}>
                        {/* Category Badge */}
                        <span
                          className="text-[10px] font-medium px-2.5 py-1 rounded-full uppercase tracking-wider"
                          style={{
                            background: colors.badge,
                            color: colors.badgeText,
                            border: `1px solid ${colors.border}`,
                          }}
                        >
                          {categoryLabels[app.category][locale]}
                        </span>
                        {/* Status Badge */}
                        <span
                          className="text-[10px] font-medium px-2.5 py-1 rounded-full uppercase tracking-wider"
                          style={{
                            background: isLive ? colors.badge : 'rgba(255,255,255,0.03)',
                            color: isLive ? colors.badgeText : 'rgba(192,192,192,0.35)',
                            border: isLive ? `1px solid ${colors.border}` : '1px solid rgba(192,192,192,0.06)',
                          }}
                        >
                          {isLive ? t.live : t.comingSoon}
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Description */}
                  <motion.div
                    className="mb-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h3
                      className={`text-sm font-semibold mb-2 uppercase tracking-wider ${isArabic ? 'font-arabic text-right' : ''}`}
                      style={{ color: colors.badgeText }}
                    >
                      {isArabic ? 'الوصف' : 'Description'}
                    </h3>
                    <p
                      className={`text-sm leading-relaxed ${isArabic ? 'font-arabic text-right' : ''}`}
                      style={{ color: 'rgba(192,192,192,0.6)' }}
                    >
                      {app.fullDescription[locale]}
                    </p>
                  </motion.div>

                  {/* Features */}
                  <motion.div
                    className="mb-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <h3
                      className={`text-sm font-semibold mb-3 uppercase tracking-wider ${isArabic ? 'font-arabic text-right' : ''}`}
                      style={{ color: colors.badgeText }}
                    >
                      {isArabic ? 'المميزات' : 'Features'}
                    </h3>
                    <ul className={`space-y-2.5 ${isArabic ? 'text-right' : ''}`}>
                      {app.features[locale].map((feature, i) => (
                        <motion.li
                          key={i}
                          className={`flex items-start gap-2.5 ${isArabic ? 'flex-row-reverse' : ''}`}
                          initial={{ opacity: 0, x: isArabic ? 10 : -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + i * 0.04 }}
                        >
                          <CheckCircle2
                            className="w-4 h-4 mt-0.5 flex-shrink-0"
                            style={{ color: colors.badgeText }}
                          />
                          <span
                            className={`text-sm leading-relaxed ${isArabic ? 'font-arabic' : ''}`}
                            style={{ color: 'rgba(192,192,192,0.55)' }}
                          >
                            {feature}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>

                  {/* CTA Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    {isLive ? (
                      user ? (
                        <motion.a
                          href={app.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-semibold no-underline cursor-pointer"
                          style={{
                            background: `linear-gradient(135deg, ${colors.badge}, rgba(14,165,233,0.1))`,
                            border: `1px solid ${colors.hoverBorder}`,
                            color: colors.badgeText,
                          }}
                          whileHover={{ scale: 1.02, boxShadow: colors.glow }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {isArabic ? 'تحميل التطبيق' : 'Download App'}
                          <Download className="w-4 h-4" />
                        </motion.a>
                      ) : (
                        <div
                          className="text-center p-4 rounded-xl"
                          style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(192,192,192,0.08)',
                          }}
                        >
                          <p
                            className={`text-sm mb-3 ${isArabic ? 'font-arabic' : ''}`}
                            style={{ color: 'rgba(192,192,192,0.5)' }}
                          >
                            {isArabic
                              ? 'سجّل دخولك لتحميل التطبيق والاستفادة من جميع الميزات'
                              : 'Sign in to download the app and enjoy all features'}
                          </p>
                          <motion.a
                            href="/login"
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium no-underline cursor-pointer"
                            style={{
                              background: `linear-gradient(135deg, ${colors.badge}, rgba(14,165,233,0.1))`,
                              border: `1px solid ${colors.border}`,
                              color: colors.badgeText,
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Lock className="w-3.5 h-3.5" />
                            {isArabic ? 'تسجيل الدخول' : 'Sign In'}
                          </motion.a>
                        </div>
                      )
                    ) : (
                      <div
                        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl"
                        style={{
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(192,192,192,0.06)',
                          color: 'rgba(192,192,192,0.3)',
                        }}
                      >
                        <Lock className="w-4 h-4" />
                        <span className={`text-sm font-medium ${isArabic ? 'font-arabic' : ''}`}>
                          {t.comingSoon}
                        </span>
                      </div>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Login Prompt Modal */}
      <LoginPrompt
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        messageAr="سجّل دخولك لإضافة تطبيقات إلى المفضلة"
        message="Sign in to add apps to your favorites"
      />
    </>
  );
}
