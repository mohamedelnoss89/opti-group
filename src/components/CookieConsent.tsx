'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';

const CONSENT_KEY = 'optigroup-cookie-consent';

export default function CookieConsent() {
  const { t, locale } = useLanguage();
  const [showConsent, setShowConsent] = useState(false);
  const isArabic = locale === 'ar';

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      // Show banner after a short delay
      const timer = setTimeout(() => setShowConsent(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setShowConsent(false);
    // Enable personalized ads
    try {
      // @ts-expect-error adsbygoogle is injected by the AdSense script
      (window.adsbygoogle = window.adsbygoogle || []).push({
        google_ad_client: "ca-pub-2715535111154362",
        enable_page_level_ads: true
      });
    } catch (e) {
      // Silently fail
    }
  };

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, 'declined');
    setShowConsent(false);
  };

  return (
    <AnimatePresence>
      {showConsent && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-50 p-4"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          <div
            className="max-w-3xl mx-auto rounded-2xl p-5"
            style={{
              background: 'rgba(16, 20, 38, 0.98)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(14,165,233,0.15)',
              boxShadow: '0 -10px 40px rgba(0,0,0,0.3), 0 0 30px rgba(14,165,233,0.05)',
            }}
          >
            <div className={`flex items-start gap-4 ${isArabic ? 'flex-row-reverse' : ''}`}>
              <div className="p-2.5 rounded-xl flex-shrink-0" style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.15)' }}>
                <Cookie className="w-5 h-5" style={{ color: '#0ea5e9' }} />
              </div>
              <div className={`flex-1 ${isArabic ? 'text-right' : ''}`}>
                <h3 className={`text-sm font-bold mb-1 ${isArabic ? 'font-arabic' : ''}`} style={{ color: 'rgba(232,232,232,0.9)' }}>
                  {t.cookieTitle}
                </h3>
                <p className={`text-xs leading-relaxed mb-4 ${isArabic ? 'font-arabic' : ''}`} style={{ color: 'rgba(192,192,192,0.5)' }}>
                  {t.cookieDescription}
                </p>
                <div className={`flex gap-3 ${isArabic ? 'flex-row-reverse justify-start' : ''}`}>
                  <button
                    onClick={handleAccept}
                    className="px-5 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                    style={{
                      background: 'linear-gradient(135deg, rgba(14,165,233,0.2), rgba(30,64,175,0.15))',
                      border: '1px solid rgba(14,165,233,0.25)',
                      color: '#0ea5e9',
                    }}
                  >
                    {t.cookieAccept}
                  </button>
                  <button
                    onClick={handleDecline}
                    className="px-5 py-2 rounded-xl text-xs font-medium cursor-pointer"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(192,192,192,0.1)',
                      color: 'rgba(192,192,192,0.5)',
                    }}
                  >
                    {t.cookieDecline}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
