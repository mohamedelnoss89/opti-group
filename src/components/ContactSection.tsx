'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

export default function ContactSection() {
  const { t, locale } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleContactClick = () => {
    // Try multiple methods to open email
    // Method 1: Try opening Gmail directly
    const gmailUrl = 'https://mail.google.com/mail/?view=cm&fs=1&to=mohamed10.mohamed10@gmail.com';
    
    // Try to open in new window
    const newWindow = window.open(gmailUrl, '_blank');
    
    // If popup was blocked, try mailto as fallback
    if (!newWindow || newWindow.closed) {
      window.location.href = 'mailto:mohamed10.mohamed10@gmail.com';
    }
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText('mohamed10.mohamed10@gmail.com');
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = 'mohamed10.mohamed10@gmail.com';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
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

        {/* Email card */}
        <div className="max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="p-5 sm:p-6 rounded-2xl"
              style={{
                background: 'rgba(26, 31, 54, 0.6)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(14,165,233,0.12)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
              }}
            >
              <div className={`flex items-center gap-4 mb-4 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
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
              </div>

              {/* Buttons */}
              <div className={`flex gap-3 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                {/* Send email button */}
                <button
                  onClick={handleContactClick}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl cursor-pointer"
                  style={{
                    background: 'rgba(14,165,233,0.12)',
                    border: '1px solid rgba(14,165,233,0.2)',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(14,165,233,0.2)';
                    e.currentTarget.style.borderColor = 'rgba(14,165,233,0.35)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(14,165,233,0.12)';
                    e.currentTarget.style.borderColor = 'rgba(14,165,233,0.2)';
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2L11 13"/>
                    <path d="M22 2L15 22L11 13L2 9L22 2Z"/>
                  </svg>
                  <span className={`text-xs font-medium ${locale === 'ar' ? 'font-arabic' : ''}`} style={{ color: '#0ea5e9' }}>
                    {locale === 'ar' ? 'إرسال رسالة' : 'Send Message'}
                  </span>
                </button>

                {/* Copy email button */}
                <button
                  onClick={handleCopyEmail}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl cursor-pointer"
                  style={{
                    background: copied ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.03)',
                    border: copied ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(192,192,192,0.08)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {copied ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      <span className={`text-xs font-medium ${locale === 'ar' ? 'font-arabic' : ''}`} style={{ color: '#22c55e' }}>
                        {locale === 'ar' ? 'تم النسخ!' : 'Copied!'}
                      </span>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(192,192,192,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                      </svg>
                      <span className={`text-xs font-medium ${locale === 'ar' ? 'font-arabic' : ''}`} style={{ color: 'rgba(192,192,192,0.5)' }}>
                        {locale === 'ar' ? 'نسخ' : 'Copy'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
