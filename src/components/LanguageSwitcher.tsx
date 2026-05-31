'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Languages } from 'lucide-react';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  const toggleLocale = () => {
    setLocale(locale === 'ar' ? 'en' : 'ar');
  };

  return (
    <motion.button
      onClick={toggleLocale}
      className="flex items-center gap-2 px-3 py-2 rounded-xl glass-card glass-card-hover transition-all duration-300 cursor-pointer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Switch language"
    >
      <Languages className="w-4 h-4 text-accent-silver" />
      <span className="text-sm font-medium text-accent-silver">
        {locale === 'ar' ? 'EN' : 'عربي'}
      </span>
    </motion.button>
  );
}
