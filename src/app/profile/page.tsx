'use client';

import { useEffect, useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import Header from '@/components/Header';
import SideMenu from '@/components/SideMenu';
import BackToTop from '@/components/BackToTop';
import { apps } from '@/lib/apps-data';
import { motion } from 'framer-motion';
import { Heart, Mail, Calendar, Shield, Download, Lock, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { t, locale, dir } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isArabic = locale === 'ar';

  const handleMenuToggle = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  const handleMenuClose = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const handleNavigate = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/login';
    }
  }, [user, authLoading]);

  if (authLoading) {
    return (
      <div dir={dir} className="min-h-screen flex items-center justify-center" style={{ background: '#0a0e1a' }}>
        <div className="animate-spin w-8 h-8 rounded-full border-2 border-transparent border-t-cyan-400" />
      </div>
    );
  }

  if (!user) return null;

  const getUserDisplayName = () => {
    if (user.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user.user_metadata?.name) return user.user_metadata.name;
    return user.email?.split('@')[0] || 'User';
  };

  const getUserInitial = () => {
    const name = getUserDisplayName();
    return name.charAt(0).toUpperCase();
  };

  const favoriteApps = apps.filter((app) => isFavorite(app.id));

  const categoryAccentColors: Record<string, { badgeText: string; border: string; badge: string }> = {
    health: { badgeText: '#10b981', border: 'rgba(16,185,129,0.12)', badge: 'rgba(16,185,129,0.1)' },
    outings: { badgeText: '#f59e0b', border: 'rgba(245,158,11,0.12)', badge: 'rgba(245,158,11,0.1)' },
    ai: { badgeText: '#8b5cf6', border: 'rgba(139,92,246,0.12)', badge: 'rgba(139,92,246,0.1)' },
    landmarks: { badgeText: '#f97316', border: 'rgba(249,115,22,0.12)', badge: 'rgba(249,115,22,0.1)' },
  };

  return (
    <div dir={dir} className="min-h-screen flex flex-col" style={{ background: '#0a0e1a' }}>
      <Header onMenuToggle={handleMenuToggle} />
      <SideMenu
        isOpen={isMenuOpen}
        onClose={handleMenuClose}
        onNavigate={handleNavigate}
        onContactClick={() => handleNavigate('section-contact')}
      />

      <main className="flex-1 pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Page header */}
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1
              className={`text-2xl sm:text-3xl font-bold mb-3 ${isArabic ? 'font-arabic' : ''}`}
              style={{
                background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {t.profileTitle}
            </h1>
          </motion.div>

          {/* User Info Card */}
          <motion.div
            className="rounded-2xl p-6 sm:p-8 mb-8"
            style={{
              background: 'rgba(26, 31, 54, 0.5)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(14,165,233,0.1)',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className={`flex items-center gap-5 ${isArabic ? 'flex-row-reverse text-right' : ''}`}>
              {/* Avatar */}
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'rgba(14,165,233,0.15)',
                  border: '2px solid rgba(14,165,233,0.3)',
                }}
              >
                <span style={{ color: '#0ea5e9', fontSize: '24px', fontWeight: 700 }}>
                  {getUserInitial()}
                </span>
              </div>

              {/* User info */}
              <div className={`flex-1 min-w-0 ${isArabic ? 'text-right' : ''}`}>
                <h2
                  className={`text-xl font-bold mb-1 ${isArabic ? 'font-arabic' : ''}`}
                  style={{ color: 'rgba(232,232,232,0.95)' }}
                >
                  {getUserDisplayName()}
                </h2>

                <div className={`flex flex-wrap gap-4 mt-3 ${isArabic ? 'justify-end' : ''}`}>
                  <div className={`flex items-center gap-2 ${isArabic ? 'flex-row-reverse' : ''}`}>
                    <Mail className="w-3.5 h-3.5" style={{ color: 'rgba(14,165,233,0.6)' }} />
                    <span className="text-xs" style={{ color: 'rgba(192,192,192,0.5)' }} dir="ltr">
                      {user.email}
                    </span>
                  </div>
                  <div className={`flex items-center gap-2 ${isArabic ? 'flex-row-reverse' : ''}`}>
                    <Shield className="w-3.5 h-3.5" style={{ color: 'rgba(14,165,233,0.6)' }} />
                    <span className={`text-xs ${isArabic ? 'font-arabic' : ''}`} style={{ color: 'rgba(192,192,192,0.5)' }}>
                      {user.app_metadata?.provider === 'google'
                        ? (isArabic ? 'حساب جوجل' : 'Google Account')
                        : (isArabic ? 'بريد إلكتروني' : 'Email Account')
                      }
                    </span>
                  </div>
                  <div className={`flex items-center gap-2 ${isArabic ? 'flex-row-reverse' : ''}`}>
                    <Calendar className="w-3.5 h-3.5" style={{ color: 'rgba(14,165,233,0.6)' }} />
                    <span className={`text-xs ${isArabic ? 'font-arabic' : ''}`} style={{ color: 'rgba(192,192,192,0.5)' }}>
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                        : '-'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Favorite Apps Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className={`flex items-center gap-3 mb-6 ${isArabic ? 'flex-row-reverse' : ''}`}>
              <Heart className="w-5 h-5" style={{ color: '#ef4444', fill: '#ef4444' }} />
              <h2
                className={`text-lg font-bold ${isArabic ? 'font-arabic' : ''}`}
                style={{ color: 'rgba(232,232,232,0.9)' }}
              >
                {t.profileFavorites}
              </h2>
              <span
                className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  color: '#ef4444',
                  border: '1px solid rgba(239,68,68,0.2)',
                }}
              >
                {favoriteApps.length}
              </span>
            </div>

            {favoriteApps.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoriteApps.map((app, index) => {
                  const colors = categoryAccentColors[app.category];
                  const isLive = app.status === 'live';
                  return (
                    <motion.div
                      key={app.id}
                      className="rounded-2xl p-5"
                      style={{
                        background: 'rgba(26, 31, 54, 0.4)',
                        backdropFilter: 'blur(12px)',
                        border: `1px solid ${colors.border}`,
                      }}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.06 }}
                    >
                      <div className={`flex items-start justify-between mb-3 ${isArabic ? 'flex-row-reverse' : ''}`}>
                        <span className="text-2xl">{app.icon}</span>
                        <motion.button
                          onClick={() => toggleFavorite(app.id)}
                          className="p-1.5 rounded-lg cursor-pointer"
                          style={{
                            background: 'rgba(239,68,68,0.08)',
                            border: '1px solid rgba(239,68,68,0.15)',
                          }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.85 }}
                          title={t.profileRemoveFavorite}
                        >
                          <Trash2 className="w-3.5 h-3.5" style={{ color: 'rgba(239,68,68,0.7)' }} />
                        </motion.button>
                      </div>

                      <h3
                        className={`text-sm font-bold mb-1 ${isArabic ? 'font-arabic text-right' : ''}`}
                        style={{ color: 'rgba(232,232,232,0.9)' }}
                      >
                        {app.name[locale]}
                      </h3>
                      <p
                        className={`text-xs leading-relaxed mb-3 ${isArabic ? 'font-arabic text-right' : ''}`}
                        style={{ color: 'rgba(192,192,192,0.45)' }}
                      >
                        {app.description[locale]}
                      </p>

                      {isLive ? (
                        <Link
                          href={app.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium no-underline ${isArabic ? 'flex-row-reverse' : ''}`}
                          style={{
                            background: colors.badge,
                            border: `1px solid ${colors.border}`,
                            color: colors.badgeText,
                          }}
                        >
                          {t.visit}
                          <Download className="w-3 h-3" />
                        </Link>
                      ) : (
                        <div
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs ${isArabic ? 'flex-row-reverse' : ''}`}
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
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <motion.div
                className="text-center py-16 rounded-2xl"
                style={{
                  background: 'rgba(26, 31, 54, 0.3)',
                  border: '1px solid rgba(192,192,192,0.05)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{
                    background: 'rgba(239,68,68,0.05)',
                    border: '1px solid rgba(239,68,68,0.1)',
                  }}
                >
                  <Heart className="w-7 h-7" style={{ color: 'rgba(239,68,68,0.3)' }} />
                </div>
                <p
                  className={`text-base font-semibold mb-2 ${isArabic ? 'font-arabic' : ''}`}
                  style={{ color: 'rgba(192,192,192,0.5)' }}
                >
                  {t.profileNoFavorites}
                </p>
                <p
                  className={`text-sm ${isArabic ? 'font-arabic' : ''}`}
                  style={{ color: 'rgba(192,192,192,0.3)' }}
                >
                  {t.profileNoFavoritesDesc}
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl text-sm font-medium no-underline"
                  style={{
                    background: 'rgba(14,165,233,0.1)',
                    border: '1px solid rgba(14,165,233,0.2)',
                    color: '#0ea5e9',
                  }}
                >
                  {isArabic ? 'استكشف التطبيقات' : 'Explore Apps'}
                </Link>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="py-8 px-4"
        style={{
          background: 'rgba(10, 14, 26, 0.9)',
          borderTop: '1px solid rgba(192,192,192,0.06)',
        }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <p
            className={`text-xs ${isArabic ? 'font-arabic' : ''}`}
            style={{ color: 'rgba(192,192,192,0.2)' }}
          >
            {t.footerText}
          </p>
        </div>
      </footer>

      <BackToTop />
    </div>
  );
}
