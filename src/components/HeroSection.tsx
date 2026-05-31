'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import Logo from './Logo';
import { ChevronDown } from 'lucide-react';

export default function HeroSection() {
  const { t, locale } = useLanguage();

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Radial gradient from center */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(14,165,233,0.06), transparent 70%)',
          }}
        />
        {/* Top left orb */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-[150px]" style={{ background: 'rgba(30,64,175,0.05)' }} />
        {/* Bottom right orb */}
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[150px]" style={{ background: 'rgba(14,165,233,0.04)' }} />
        {/* Center subtle glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full blur-[200px]" style={{ background: 'rgba(59,130,246,0.03)' }} />
      </div>

      {/* Logo - pushed up higher */}
      <div className="relative z-10 -mt-16">
        <Logo size="large" />
      </div>

      {/* Tagline */}
      <motion.h2
        className={`relative z-10 mt-8 text-xl sm:text-2xl md:text-3xl font-bold text-center leading-relaxed ${locale === 'ar' ? 'font-arabic' : ''}`}
        style={{
          background: 'linear-gradient(135deg, #e8e8e8 0%, #a0a0a0 50%, #e8e8e8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        {t.heroSubtitle}
      </motion.h2>

      {/* Description */}
      <motion.p
        className={`relative z-10 mt-4 max-w-xl text-center text-sm sm:text-base leading-relaxed ${locale === 'ar' ? 'font-arabic' : ''}`}
        style={{ color: 'rgba(192,192,192,0.5)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        {t.heroDescription}
      </motion.p>

      {/* CTA Button */}
      <motion.a
        href="#section-health"
        className={`relative z-10 mt-8 px-8 py-3.5 rounded-2xl text-sm font-semibold tracking-wider uppercase no-underline transition-all duration-300 ${locale === 'ar' ? 'font-arabic' : ''}`}
        style={{
          background: 'linear-gradient(135deg, rgba(30,64,175,0.25), rgba(14,165,233,0.25))',
          border: '1px solid rgba(14,165,233,0.2)',
          color: '#c0c0c0',
          boxShadow: '0 0 30px rgba(14,165,233,0.08), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
        whileHover={{ 
          scale: 1.05, 
          boxShadow: '0 0 40px rgba(14,165,233,0.15), inset 0 1px 0 rgba(255,255,255,0.08)',
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
        <ChevronDown className="w-5 h-5" style={{ color: 'rgba(192,192,192,0.2)' }} />
      </motion.div>
    </section>
  );
}
