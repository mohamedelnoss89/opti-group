'use client';

import { useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import SideMenu from '@/components/SideMenu';
import HeroSection from '@/components/HeroSection';
import StatsSection from '@/components/StatsSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import AppSection from '@/components/AppSection';
import ContactSection from '@/components/ContactSection';
import FAQSection from '@/components/FAQSection';
import NewsletterSection from '@/components/NewsletterSection';
import BlogPreviewSection from '@/components/BlogPreviewSection';
import BackToTop from '@/components/BackToTop';
import { categories } from '@/lib/apps-data';
import SocialLinks from '@/components/SocialLinks';
import AdsterraAd from '@/components/AdsterraAd';
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

        {/* Stats Section */}
        <StatsSection />

        {/* إعلان 1 - Native Banner - بعد الأرقام */}
        <div className="max-w-7xl mx-auto px-4 py-4">
          <AdsterraAd type="native" />
        </div>

        {/* Testimonials Section */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-accent-silver/10 to-transparent" />
        </div>
        <TestimonialsSection />

        {/* إعلان 2 - Banner 728x90 - بعد الآراء */}
        <div className="max-w-7xl mx-auto px-4 py-4">
          <AdsterraAd type="banner728" />
        </div>

        {/* إعلان 3 - Smart Link - في النص */}
        <div className="max-w-7xl mx-auto px-4 py-2">
          <AdsterraAd type="smartlink" />
        </div>

        {/* App sections */}
        {categories.map((cat, index) => (
          <div key={cat.id}>
            {/* Divider between sections */}
            {index > 0 && (
              <div className="max-w-7xl mx-auto px-4">
                <div className="h-px bg-gradient-to-r from-transparent via-accent-silver/10 to-transparent" />
              </div>
            )}
            <AppSection category={cat.id} sectionId={cat.sectionId} />
          </div>
        ))}

        {/* إعلان 4 - Popunder - في النص بعد التطبيقات */}
        <div className="max-w-7xl mx-auto px-4 py-4">
          <AdsterraAd type="popunder" />
        </div>

        {/* إعلان 5 - Smart Link تاني - في النص */}
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-center gap-4">
          <a
            href="https://www.effectivecpmnetwork.com/hvq6pns0s?key=13cfbf9de4a2ae8eb7789a2fd62da57c"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-2.5 rounded-xl text-sm font-semibold"
            style={{
              background: 'linear-gradient(135deg, rgba(14,165,233,0.15), rgba(30,64,175,0.1))',
              border: '1px solid rgba(14,165,233,0.2)',
              color: '#0ea5e9',
              textDecoration: 'none',
            }}
          >
            🔥 عرض حصري - اضغط هنا
          </a>
        </div>

        {/* Contact section */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-accent-silver/10 to-transparent" />
        </div>
        <ContactSection />

        {/* إعلان 6 - Banner 728x90 - بعد التواصل */}
        <div className="max-w-7xl mx-auto px-4 py-4">
          <AdsterraAd type="banner728" />
        </div>

        {/* FAQ Section */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-accent-silver/10 to-transparent" />
        </div>
        <FAQSection />

        {/* إعلان 7 - Native - بعد الأسئلة */}
        <div className="max-w-7xl mx-auto px-4 py-4">
          <AdsterraAd type="native" />
        </div>

        {/* Newsletter Section */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-accent-silver/10 to-transparent" />
        </div>
        <NewsletterSection />

        {/* إعلان 8 - Smart Link - بعد النشرة */}
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-center gap-4">
          <a
            href="https://www.effectivecpmnetwork.com/hvq6pns0s?key=13cfbf9de4a2ae8eb7789a2fd62da57c"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-2.5 rounded-xl text-sm font-semibold"
            style={{
              background: 'linear-gradient(135deg, rgba(14,165,233,0.15), rgba(30,64,175,0.1))',
              border: '1px solid rgba(14,165,233,0.2)',
              color: '#0ea5e9',
              textDecoration: 'none',
            }}
          >
            ⭐ عروض مميزة - اكتشف الآن
          </a>
        </div>

        {/* Blog Preview Section */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-accent-silver/10 to-transparent" />
        </div>
        <BlogPreviewSection />

        {/* إعلان 9 - Banner 728x90 - تحت المدونة */}
        <div className="max-w-7xl mx-auto px-4 py-4">
          <AdsterraAd type="banner728" />
        </div>

        {/* إعلان 10 - Smart Link أخير - تحت جداً */}
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-center gap-4">
          <a
            href="https://www.effectivecpmnetwork.com/hvq6pns0s?key=13cfbf9de4a2ae8eb7789a2fd62da57c"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-3 rounded-xl text-sm font-bold"
            style={{
              background: 'linear-gradient(135deg, rgba(14,165,233,0.2), rgba(30,64,175,0.15))',
              border: '1px solid rgba(14,165,233,0.3)',
              color: '#0ea5e9',
              textDecoration: 'none',
            }}
          >
            🎁 لا تفوّت العروض الحصرية - اضغط الآن
          </a>
        </div>
      </main>

      {/* Follow Us Section */}
      <section className="relative py-16 px-4">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(14,165,233,0.03), transparent 70%)',
        }} />
        <div className="max-w-3xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2
              className={`text-xl sm:text-2xl font-bold mb-3 ${locale === 'ar' ? 'font-arabic' : ''}`}
              style={{
                background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {locale === 'ar' ? 'تابعنا على السوشيال ميديا' : 'Follow Us on Social Media'}
            </h2>
            <p
              className={`text-sm leading-relaxed mb-8 ${locale === 'ar' ? 'font-arabic' : ''}`}
              style={{ color: 'rgba(192,192,192,0.5)' }}
            >
              {locale === 'ar'
                ? 'تابعنا على منصات التواصل الاجتماعي لتبقى على اطلاع بآخر التحديثات والمحتوى الحصري.'
                : 'Follow us on social media to stay updated with the latest news and exclusive content.'}
            </p>
            <div className="flex justify-center">
              <SocialLinks size="large" isArabic={locale === 'ar'} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-4" style={{ background: 'rgba(10, 14, 26, 0.9)', borderTop: '1px solid rgba(192,192,192,0.06)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at center bottom, rgba(14,165,233,0.03), transparent 70%)',
        }} />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col items-center gap-6">
            <motion.div
              className="flex flex-col items-center gap-1"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <span className="text-metallic text-lg tracking-[0.3em] font-bold">OPTI GROUP</span>
              <span className="font-arabic text-xs text-accent-silver/40">مجموعة أوبتي</span>
            </motion.div>

            <div className={`flex flex-wrap justify-center gap-6 text-xs text-accent-silver/30 ${locale === 'ar' ? 'font-arabic' : ''}`}>
              <span className="hover:text-section-health transition-colors cursor-pointer" onClick={() => handleNavigate('section-health')}>{t.healthSection}</span>
              <span className="text-accent-silver/10">•</span>
              <span className="hover:text-section-outings transition-colors cursor-pointer" onClick={() => handleNavigate('section-outings')}>{t.outingsSection}</span>
              <span className="text-accent-silver/10">•</span>
              <span className="hover:text-section-ai transition-colors cursor-pointer" onClick={() => handleNavigate('section-ai')}>{t.aiSection}</span>
              <span className="text-accent-silver/10">•</span>
              <span className="hover:text-section-landmarks transition-colors cursor-pointer" onClick={() => handleNavigate('section-landmarks')}>{t.landmarksSection}</span>
              <span className="text-accent-silver/10">•</span>
              <span className="hover:text-section-islamic transition-colors cursor-pointer" onClick={() => handleNavigate('section-islamic')}>{t.islamicSection}</span>
              <span className="text-accent-silver/10">•</span>
              <span className="hover:text-section-sports transition-colors cursor-pointer" onClick={() => handleNavigate('section-sports')}>{t.sportsSection}</span>
            </div>

            <div className={`flex flex-wrap justify-center gap-4 text-xs ${locale === 'ar' ? 'font-arabic' : ''}`}>
              <a href="/about" className="text-accent-silver/25 hover:text-accent-silver/50 transition-colors no-underline">{t.aboutUs}</a>
              <span className="text-accent-silver/10">•</span>
              <a href="/blog" className="text-accent-silver/25 hover:text-accent-silver/50 transition-colors no-underline">{t.blog}</a>
              <span className="text-accent-silver/10">•</span>
              <a href="/status" className="text-accent-silver/25 hover:text-accent-silver/50 transition-colors no-underline">{t.statusPage}</a>
              <span className="text-accent-silver/10">•</span>
              <a href="/privacy" className="text-accent-silver/25 hover:text-accent-silver/50 transition-colors no-underline">{t.privacyPolicy}</a>
              <span className="text-accent-silver/10">•</span>
              <a href="/terms" className="text-accent-silver/25 hover:text-accent-silver/50 transition-colors no-underline">{t.termsOfService}</a>
            </div>

            <SocialLinks isArabic={locale === 'ar'} />

            <div className="w-24 h-px bg-gradient-to-r from-transparent via-accent-silver/20 to-transparent" />

            <p className={`text-xs text-accent-silver/20 ${locale === 'ar' ? 'font-arabic' : ''}`}>
              {t.footerText}
            </p>
          </div>
        </div>
      </footer>

      <BackToTop />
    </div>
  );
}
