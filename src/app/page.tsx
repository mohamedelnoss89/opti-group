'use client';

import { useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import SideMenu from '@/components/SideMenu';
import HeroSection from '@/components/HeroSection';
import AppSection from '@/components/AppSection';
import ContactSection from '@/components/ContactSection';
import AdBanner from '@/components/AdBanner';
import { categories } from '@/lib/apps-data';
import { motion } from 'framer-motion';

export default function HomePage() {
  const { t, locale, dir } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuToggle = useCallback(() => {
    setIsMenuOpen(prev => !prev);
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

  const handleContactClick = useCallback(() => {
    const element = document.getElementById('section-contact');
    if (element) {
      const offset = 80;
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }, []);

  return (
    <div dir={dir} className="min-h-screen flex flex-col">
      <Header onMenuToggle={handleMenuToggle} />
      <SideMenu
        isOpen={isMenuOpen}
        onClose={handleMenuClose}
        onNavigate={handleNavigate}
        onContactClick={handleContactClick}
      />

      <main className="flex-1 pt-16">
        {/* Hero */}
        <HeroSection />

        {/* Ad Banner - After Hero */}
        <div className="max-w-5xl mx-auto px-4 py-4">
          <AdBanner adSlot="1234567890" adFormat="horizontal" />
        </div>

        {/* App sections with ads between them */}
        {categories.map((cat, index) => (
          <div key={cat.id}>
            {/* Divider between sections */}
            {index > 0 && (
              <div className="max-w-7xl mx-auto px-4">
                <div className="h-px bg-gradient-to-r from-transparent via-accent-silver/10 to-transparent" />
              </div>
            )}
            <AppSection category={cat.id} sectionId={cat.sectionId} />

            {/* Ad Banner - After each section (except last) */}
            {index < categories.length - 1 && (
              <div className="max-w-5xl mx-auto px-4 py-6">
                <AdBanner adSlot={`234567890${index + 1}`} adFormat="auto" />
              </div>
            )}
          </div>
        ))}

        {/* Contact section */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-accent-silver/10 to-transparent" />
        </div>
        <ContactSection />

        {/* Ad Banner - Before Footer */}
        <div className="max-w-5xl mx-auto px-4 py-6">
          <AdBanner adSlot="3456789012" adFormat="horizontal" />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative py-12 px-4" style={{ background: 'rgba(10, 14, 26, 0.9)', borderTop: '1px solid rgba(192,192,192,0.06)' }}>
        {/* Subtle glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at center bottom, rgba(14,165,233,0.03), transparent 70%)',
        }} />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col items-center gap-6">
            {/* Logo text */}
            <motion.div
              className="flex flex-col items-center gap-1"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <span className="text-metallic text-lg tracking-[0.3em] font-bold">OPTI GROUP</span>
              <span className="font-arabic text-xs text-accent-silver/40">مجموعة أوبتي</span>
            </motion.div>

            {/* Section links */}
            <div className={`flex flex-wrap justify-center gap-6 text-xs text-accent-silver/30 ${locale === 'ar' ? 'font-arabic' : ''}`}>
              <span className="hover:text-section-health transition-colors cursor-pointer" onClick={() => handleNavigate('section-health')}>{t.healthSection}</span>
              <span className="text-accent-silver/10">•</span>
              <span className="hover:text-section-outings transition-colors cursor-pointer" onClick={() => handleNavigate('section-outings')}>{t.outingsSection}</span>
              <span className="text-accent-silver/10">•</span>
              <span className="hover:text-section-ai transition-colors cursor-pointer" onClick={() => handleNavigate('section-ai')}>{t.aiSection}</span>
              <span className="text-accent-silver/10">•</span>
              <span className="hover:text-section-landmarks transition-colors cursor-pointer" onClick={() => handleNavigate('section-landmarks')}>{t.landmarksSection}</span>
            </div>

            {/* Legal links */}
            <div className={`flex flex-wrap justify-center gap-4 text-xs ${locale === 'ar' ? 'font-arabic' : ''}`}>
              <a href="/about" className="text-accent-silver/25 hover:text-accent-silver/50 transition-colors no-underline">{t.aboutUs}</a>
              <span className="text-accent-silver/10">•</span>
              <a href="/privacy" className="text-accent-silver/25 hover:text-accent-silver/50 transition-colors no-underline">{t.privacyPolicy}</a>
              <span className="text-accent-silver/10">•</span>
              <a href="/terms" className="text-accent-silver/25 hover:text-accent-silver/50 transition-colors no-underline">{t.termsOfService}</a>
            </div>

            {/* Divider */}
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-accent-silver/20 to-transparent" />

            {/* Copyright */}
            <p className={`text-xs text-accent-silver/20 ${locale === 'ar' ? 'font-arabic' : ''}`}>
              {t.footerText}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
