'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import Logo from './Logo';
import { ChevronDown } from 'lucide-react';

export default function HeroSection() {
  const { t, locale } = useLanguage();

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-16 overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-blue/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-cyan/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-section-health/3 rounded-full blur-[150px]" />
      </div>

      {/* Logo */}
      <div className="relative z-10">
        <Logo size="large" />
      </div>

      {/* Tagline */}
      <motion.h2
        className={`relative z-10 mt-6 text-2xl sm:text-3xl md:text-4xl font-bold text-metallic ${locale === 'ar' ? 'font-arabic' : ''}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        {t.heroSubtitle}
      </motion.h2>

      {/* Description */}
      <motion.p
        className={`relative z-10 mt-4 max-w-2xl text-center text-accent-silver/60 text-base sm:text-lg leading-relaxed ${locale === 'ar' ? 'font-arabic' : ''}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        {t.heroDescription}
      </motion.p>

      {/* CTA Button */}
      <motion.a
        href="#section-health"
        className={`relative z-10 mt-8 px-8 py-3 rounded-xl text-sm font-semibold tracking-wider uppercase no-underline transition-all duration-300 ${
          locale === 'ar' ? 'font-arabic' : ''
        }`}
        style={{
          background: 'linear-gradient(135deg, rgba(30,64,175,0.3), rgba(14,165,233,0.3))',
          border: '1px solid rgba(14,165,233,0.3)',
          color: '#e8e8e8',
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        whileHover={{ 
          scale: 1.05, 
          boxShadow: '0 0 30px rgba(14,165,233,0.2)',
        }}
        whileTap={{ scale: 0.95 }}
      >
        {t.exploreApps}
      </motion.a>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 z-10"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ChevronDown className="w-6 h-6 text-accent-silver/30" />
      </motion.div>
    </section>
  );
}
