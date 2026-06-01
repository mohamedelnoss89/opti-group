'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export default function BackToTop() {
  const { locale } = useLanguage();
  const isArabic = locale === 'ar';
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          className={`fixed bottom-6 ${isArabic ? 'left-6' : 'right-6'} z-40 p-3 rounded-xl cursor-pointer`}
          style={{
            background: 'rgba(14,165,233,0.15)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(14,165,233,0.25)',
            boxShadow: '0 4px 24px rgba(14,165,233,0.15), 0 0 0 1px rgba(14,165,233,0.05)',
          }}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          whileHover={{
            scale: 1.1,
            boxShadow: '0 8px 32px rgba(14,165,233,0.25), 0 0 0 1px rgba(14,165,233,0.1)',
          }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          aria-label={isArabic ? 'العودة للأعلى' : 'Back to top'}
        >
          <ArrowUp className="w-5 h-5" style={{ color: '#0ea5e9' }} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
