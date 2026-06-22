'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { MessageSquare, Mail, Send } from 'lucide-react';
import ContactModal from './ContactModal';

export default function ContactSection() {
  const { t, locale } = useLanguage();
  const isArabic = locale === 'ar';

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section id="section-contact" className="relative py-20 px-4">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(14,165,233,0.04), transparent 70%)',
        }}
      />

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Section header */}
        <motion.div
          className={`flex items-center gap-4 mb-12 ${isArabic ? 'flex-row-reverse' : ''}`}
          initial={{ opacity: 0, x: isArabic ? 30 : -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="p-3.5 rounded-2xl flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(14,165,233,0.1), rgba(30,64,175,0.08))',
              border: '1px solid rgba(14,165,233,0.15)',
              boxShadow: '0 0 24px rgba(14,165,233,0.06)',
            }}
          >
            <MessageSquare className="w-6 h-6" style={{ color: '#0ea5e9' }} />
          </div>
          <div className={isArabic ? 'text-right' : ''}>
            <h2
              className="text-2xl sm:text-3xl font-bold"
              style={{
                background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {t.contactTitle}
            </h2>
            <p
              className={`text-sm mt-1.5 ${isArabic ? 'font-arabic' : ''}`}
              style={{ color: 'rgba(192,192,192,0.4)' }}
            >
              {t.contactDescription}
            </p>
          </div>
        </motion.div>

        {/* Main CTA card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div
            className="p-8 sm:p-10 rounded-2xl flex flex-col items-center justify-center text-center"
            style={{
              background: 'rgba(26, 31, 54, 0.5)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(14,165,233,0.08)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.02)',
            }}
          >
            <div
              className="p-4 rounded-2xl mb-5"
              style={{
                background: 'linear-gradient(135deg, rgba(14,165,233,0.12), rgba(30,64,175,0.08))',
                border: '1px solid rgba(14,165,233,0.18)',
              }}
            >
              <Send className="w-7 h-7" style={{ color: '#0ea5e9' }} />
            </div>
            <h3
              className={`text-lg font-semibold mb-2 ${isArabic ? 'font-arabic' : ''}`}
              style={{ color: 'rgba(232,232,232,0.9)' }}
            >
              {isArabic ? 'عندك سؤال أو اقتراح؟' : 'Have a question or suggestion?'}
            </h3>
            <p
              className={`text-sm mb-6 max-w-sm ${isArabic ? 'font-arabic' : ''}`}
              style={{ color: 'rgba(192,192,192,0.45)' }}
            >
              {isArabic
                ? 'اضغط على زرار "اتصل بنا" واكتب لنا رسالتك بنفسك — هنتواصل معاك في أقرب وقت.'
                : 'Click "Contact Us" and write us your message — we\'ll get back to you as soon as possible.'}
            </p>

            <motion.button
              onClick={() => setIsModalOpen(true)}
              className={`flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 ${isArabic ? 'font-arabic' : ''}`}
              style={{
                background: 'linear-gradient(135deg, rgba(14,165,233,0.25), rgba(30,64,175,0.18))',
                border: '1px solid rgba(14,165,233,0.35)',
                color: '#0ea5e9',
                cursor: 'pointer',
              }}
              whileHover={{ scale: 1.04, boxShadow: '0 0 36px rgba(14,165,233,0.18)' }}
              whileTap={{ scale: 0.97 }}
            >
              <Mail className="w-4 h-4" />
              <span>{isArabic ? 'اتصل بنا' : 'Contact Us'}</span>
            </motion.button>

            {/* Response time indicator (inline, no email exposed) */}
            <div
              className={`flex items-center gap-2 mt-6 pt-6 w-full justify-center ${isArabic ? 'flex-row-reverse' : ''}`}
              style={{ borderTop: '1px solid rgba(192,192,192,0.06)' }}
            >
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  background: '#22c55e',
                  boxShadow: '0 0 8px rgba(34,197,94,0.4)',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                }}
              />
              <span
                className={`text-xs font-medium ${isArabic ? 'font-arabic' : ''}`}
                style={{ color: '#22c55e' }}
              >
                {isArabic ? 'متاح للتواصل — نرد خلال 24-48 ساعة' : 'Available — replies within 24-48h'}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Contact Modal */}
      <ContactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}
