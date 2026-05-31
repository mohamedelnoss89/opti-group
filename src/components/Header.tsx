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
        background: 'rgba(10, 14, 26, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(192,192,192,0.06)',
      }}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Menu toggle */}
          <motion.button
            onClick={onMenuToggle}
            className="p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label={t.menu}
          >
            <Menu className="w-6 h-6 text-accent-silver" />
          </motion.button>

          {/* Brand */}
          <div className={`flex items-center gap-2 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
            <span className="text-metallic text-lg font-bold tracking-wider">OPTI</span>
            <span className="text-accent-silver/40 text-sm">GROUP</span>
          </div>

          {/* Right side: language switcher + user */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            {user ? (
              <motion.div 
                className="flex items-center gap-2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="w-8 h-8 rounded-full bg-accent-blue/20 flex items-center justify-center">
                  <span className="text-accent-cyan text-xs font-bold">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              </motion.div>
            ) : (
              <a href="/login" className="p-2 rounded-xl hover:bg-white/5 transition-colors">
                <User className="w-5 h-5 text-accent-silver/60" />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
