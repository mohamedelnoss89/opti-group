'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, User } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { motion } from 'framer-motion';

interface HeaderProps {
  onMenuToggle: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const { t, locale } = useLanguage();
  const { user } = useAuth();

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
              <motion.div 
                className="flex items-center gap-2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(14,165,233,0.15)', border: '1px solid rgba(14,165,233,0.2)' }}>
                  <span style={{ color: '#0ea5e9', fontSize: '11px', fontWeight: 700 }}>
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              </motion.div>
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
