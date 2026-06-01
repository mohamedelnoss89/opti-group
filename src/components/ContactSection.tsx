'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

export default function ContactSection() {
  const { t, locale } = useLanguage();

  const handleEmailClick = () => {
    const link = document.createElement('a');
    link.href = 'mailto:mohamed10.mohamed10@gmail.com';
    link.click();
  };

  return (
    <section id="section-contact" className="relative py-20 px-4">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(14,165,233,0.03), transparent 70%)',
        }}
      />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Section header */}
        <motion.div
          className={`flex items-center gap-4 mb-10 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}
          initial={{ opacity: 0, x: locale === 'ar' ? 30 : -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="p-3 rounded-2xl"
            style={{
              background: 'rgba(14,165,233,0.08)',
              border: '1px solid rgba(14,165,233,0.15)',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
          </div>
          <div className={locale === 'ar' ? 'text-right' : ''}>
            <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: '#0ea5e9' }}>
              {t.contactTitle}
            </h2>
            <p className={`text-sm mt-1 ${locale === 'ar' ? 'font-arabic' : ''}`} style={{ color: 'rgba(192,192,192,0.4)' }}>
              {t.contactDescription}
            </p>
          </div>
        </motion.div>

        {/* Email button */}
        <div className="max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -3 }}
          >
            <button
              onClick={handleEmailClick}
              className="w-full p-5 sm:p-6 rounded-2xl cursor-pointer text-left"
              style={{
                background: 'rgba(26, 31, 54, 0.6)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(14,165,233,0.12)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(14,165,233,0.3)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(14,165,233,0.1), 0 4px 24px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(14,165,233,0.12)';
                e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.2)';
              }}
            >
              <div className={`flex items-center gap-4 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                {/* Mail icon */}
                <div className="p-3 rounded-xl flex-shrink-0" style={{ background: 'rgba(14,165,233,0.1)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                </div>
                {/* Email text */}
                <div className={`flex-1 min-w-0 ${locale === 'ar' ? 'text-right' : ''}`}>
                  <p className={`text-xs mb-1 ${locale === 'ar' ? 'font-arabic' : ''}`} style={{ color: 'rgba(192,192,192,0.4)' }}>
                    {t.emailLabel}
                  </p>
                  <p className="text-sm sm:text-base font-medium" style={{ color: 'rgba(192,192,192,0.85)' }} dir="ltr">
                    mohamed10.mohamed10@gmail.com
                  </p>
                </div>
                {/* Send icon */}
                <div className="p-2.5 rounded-xl flex-shrink-0" style={{ background: 'rgba(14,165,233,0.1)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2L11 13"/>
                    <path d="M22 2L15 22L11 13L2 9L22 2Z"/>
                  </svg>
                </div>
              </div>
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
