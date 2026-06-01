'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, User, LogOut, Mail, ChevronDown } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  onMenuToggle: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const { t, locale } = useLanguage();
  const { user, signOut } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setShowProfile(false);
    await signOut();
  };

  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.user_metadata?.name) return user.user_metadata.name;
    return user?.email?.split('@')[0] || 'مستخدم';
  };

  const getUserInitial = () => {
    const name = getUserDisplayName();
    return name.charAt(0).toUpperCase();
  };

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-30"
      style={{
        background: 'rgba(10, 14, 26, 0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(192,192,192,0.05)',
      }}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Menu toggle */}
          <motion.button
            onClick={onMenuToggle}
            className="p-2 rounded-xl transition-colors cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.03)' }}
            whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.06)' }}
            whileTap={{ scale: 0.9 }}
            aria-label={t.menu}
          >
            <Menu className="w-5 h-5" style={{ color: 'rgba(192,192,192,0.7)' }} />
          </motion.button>

          {/* Brand - minimal */}
          <div className="flex items-center gap-1.5">
            <span 
              style={{
                fontSize: '15px',
                fontWeight: 800,
                letterSpacing: '0.2em',
                background: 'linear-gradient(135deg, #e8e8e8, #a0a0a0)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              OPTI
            </span>
            <span style={{ fontSize: '11px', fontWeight: 300, letterSpacing: '0.3em', color: 'rgba(192,192,192,0.4)' }}>
              GROUP
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            {user ? (
              <div className="relative" ref={profileRef}>
                <motion.button
                  onClick={() => setShowProfile(!showProfile)}
                  className="flex items-center gap-1.5 cursor-pointer"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(14,165,233,0.15)', border: '1px solid rgba(14,165,233,0.2)' }}>
                    <span style={{ color: '#0ea5e9', fontSize: '11px', fontWeight: 700 }}>
                      {getUserInitial()}
                    </span>
                  </div>
                  <ChevronDown 
                    className="w-3 h-3 transition-transform" 
                    style={{ 
                      color: 'rgba(192,192,192,0.4)',
                      transform: showProfile ? 'rotate(180deg)' : 'rotate(0deg)' 
                    }} 
                  />
                </motion.button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {showProfile && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full mt-2 right-0 w-72 rounded-2xl overflow-hidden"
                      style={{
                        background: 'rgba(16, 20, 38, 0.98)',
                        backdropFilter: 'blur(24px)',
                        border: '1px solid rgba(192,192,192,0.08)',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(14,165,233,0.05)',
                      }}
                    >
                      {/* User Info Header */}
                      <div 
                        className="p-4"
                        style={{ 
                          background: 'linear-gradient(135deg, rgba(14,165,233,0.08), rgba(14,165,233,0.02))',
                          borderBottom: '1px solid rgba(192,192,192,0.06)'
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ 
                              background: 'rgba(14,165,233,0.15)', 
                              border: '1px solid rgba(14,165,233,0.25)' 
                            }}
                          >
                            <span style={{ color: '#0ea5e9', fontSize: '16px', fontWeight: 700 }}>
                              {getUserInitial()}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold truncate" style={{ color: 'rgba(232,232,232,0.95)' }}>
                              {getUserDisplayName()}
                            </p>
                            <p className="text-xs truncate mt-0.5" style={{ color: 'rgba(192,192,192,0.5)' }} dir="ltr">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Account Details */}
                      <div className="p-3 space-y-1">
                        {/* Provider badge */}
                        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
                          <div className="p-1.5 rounded-lg" style={{ background: 'rgba(14,165,233,0.08)' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="rgba(192,192,192,0.3)"/>
                              <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z" fill="rgba(14,165,233,0.3)"/>
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs" style={{ color: 'rgba(192,192,192,0.4)' }}>
                              {locale === 'ar' ? 'نوع الحساب' : 'Account Type'}
                            </p>
                            <p className="text-xs font-medium" style={{ color: 'rgba(192,192,192,0.7)' }}>
                              {user.app_metadata?.provider === 'google' 
                                ? (locale === 'ar' ? 'حساب جوجل' : 'Google Account')
                                : (locale === 'ar' ? 'بريد إلكتروني' : 'Email Account')
                              }
                            </p>
                          </div>
                        </div>

                        {/* Member since */}
                        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
                          <div className="p-1.5 rounded-lg" style={{ background: 'rgba(14,165,233,0.08)' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(14,165,233,0.5)" strokeWidth="2">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                              <line x1="16" y1="2" x2="16" y2="6"/>
                              <line x1="8" y1="2" x2="8" y2="6"/>
                              <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs" style={{ color: 'rgba(192,192,192,0.4)' }}>
                              {locale === 'ar' ? 'تاريخ الانضمام' : 'Member Since'}
                            </p>
                            <p className="text-xs font-medium" style={{ color: 'rgba(192,192,192,0.7)' }}>
                              {user.created_at 
                                ? new Date(user.created_at).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                                : '-'
                              }
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="mx-4 h-px" style={{ background: 'rgba(192,192,192,0.06)' }} />

                      {/* Logout */}
                      <div className="p-2">
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all cursor-pointer"
                          style={{ background: 'rgba(239,68,68,0.05)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(239,68,68,0.05)';
                          }}
                        >
                          <LogOut className="w-4 h-4" style={{ color: 'rgba(239,68,68,0.7)' }} />
                          <span className="text-xs font-medium" style={{ color: 'rgba(239,68,68,0.8)' }}>
                            {t.logout}
                          </span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <a href="/login" className="p-2 rounded-xl transition-colors" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <User className="w-4 h-4" style={{ color: 'rgba(192,192,192,0.5)' }} />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
