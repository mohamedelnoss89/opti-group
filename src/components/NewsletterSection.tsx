'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function NewsletterSection() {
  const { t, locale } = useLanguage();
  const isArabic = locale === 'ar';
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'already' | 'error'>('idle');
  const [emailError, setEmailError] = useState('');

  // Auto-fill email when user is logged in
  useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email);
    }
  }, [user, email]);

  // Auto-fill email from browser's password manager (works even if user
  // is NOT logged in to our app, as long as they saved credentials for
  // this site before — Chrome/Firefox/Safari all support this).
  useEffect(() => {
    let cancelled = false;
    if (email) return; // Already filled (logged-in user or manual entry)
    if (!('credentials' in navigator)) return; // Browser doesn't support
    if (!window.isSecureContext) return; // Only works on HTTPS

    // Slight delay so it doesn't compete with the auth context fill
    const timer = setTimeout(async () => {
      try {
        // @ts-expect-error - PasswordCredential is not in TS DOM lib by default
        const cred = await navigator.credentials.get({ password: true });
        if (cancelled) return;
        if (cred?.id && !email) {
          setEmail(cred.id);
        }
      } catch {
        // User dismissed the credential selector — silently ignore
      }
    }, 800);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [email]);

  const validateEmail = (emailStr: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailStr);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');

    if (!email.trim()) {
      setEmailError(isArabic ? 'البريد الإلكتروني مطلوب' : 'Email is required');
      return;
    }

    if (!validateEmail(email.trim())) {
      setEmailError(isArabic ? 'البريد الإلكتروني غير صحيح' : 'Invalid email address');
      return;
    }

    setStatus('sending');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.status === 409) {
        setStatus('already');
      } else if (response.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const statusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5" style={{ color: '#22c55e' }} />;
      case 'already':
        return <AlertCircle className="w-5 h-5" style={{ color: '#eab308' }} />;
      case 'error':
        return <AlertCircle className="w-5 h-5" style={{ color: '#ef4444' }} />;
      default:
        return null;
    }
  };

  const statusMessage = () => {
    switch (status) {
      case 'success':
        return t.newsletterSuccess;
      case 'already':
        return t.newsletterAlready;
      case 'error':
        return t.newsletterError;
      default:
        return '';
    }
  };

  return (
    <section className="relative py-16 px-4">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(14,165,233,0.04), transparent 70%)',
        }}
      />

      <div className="max-w-2xl mx-auto relative z-10">
        <motion.div
          className="rounded-3xl p-8 sm:p-10"
          style={{
            background: 'rgba(26, 31, 54, 0.5)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(14,165,233,0.12)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.2), 0 0 40px rgba(14,165,233,0.04)',
          }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Icon */}
          <div className="text-center mb-6">
            <motion.div
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
              style={{
                background: 'rgba(14,165,233,0.1)',
                border: '1px solid rgba(14,165,233,0.15)',
              }}
              initial={{ scale: 0.8 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Mail className="w-7 h-7" style={{ color: '#0ea5e9' }} />
            </motion.div>

            <h2
              className={`text-xl sm:text-2xl font-bold mb-3 ${isArabic ? 'font-arabic' : ''}`}
              style={{
                background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {t.newsletterTitle}
            </h2>

            <p
              className={`text-sm leading-relaxed max-w-md mx-auto ${isArabic ? 'font-arabic' : ''}`}
              style={{ color: 'rgba(192,192,192,0.5)' }}
            >
              {t.newsletterDescription}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status !== 'idle') setStatus('idle');
                    if (emailError) setEmailError('');
                  }}
                  placeholder={t.newsletterPlaceholder}
                  dir={isArabic ? 'rtl' : 'ltr'}
                  autoComplete="email"
                  name="email"
                  id="newsletter-email"
                  className={`w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all ${isArabic ? 'font-arabic text-right' : ''}`}
                  style={{
                    background: 'rgba(10, 14, 26, 0.6)',
                    border: emailError
                      ? '1px solid rgba(239,68,68,0.4)'
                      : '1px solid rgba(14,165,233,0.12)',
                    color: 'rgba(232,232,232,0.9)',
                  }}
                  onFocus={(e) => {
                    if (!emailError) {
                      e.currentTarget.style.borderColor = 'rgba(14,165,233,0.3)';
                      e.currentTarget.style.boxShadow = '0 0 20px rgba(14,165,233,0.08)';
                    }
                  }}
                  onBlur={(e) => {
                    if (!emailError) {
                      e.currentTarget.style.borderColor = 'rgba(14,165,233,0.12)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                  disabled={status === 'sending'}
                />
              </div>

              <motion.button
                type="submit"
                disabled={status === 'sending'}
                className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${isArabic ? 'font-arabic' : ''}`}
                style={{
                  background: status === 'sending'
                    ? 'rgba(14,165,233,0.3)'
                    : 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                  color: '#fff',
                  border: 'none',
                  minWidth: isArabic ? '120px' : '140px',
                }}
                whileHover={status !== 'sending' ? { scale: 1.02, boxShadow: '0 4px 20px rgba(14,165,233,0.3)' } : {}}
                whileTap={status !== 'sending' ? { scale: 0.98 } : {}}
              >
                {status === 'sending' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t.newsletterSending}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{t.newsletterButton}</span>
                  </>
                )}
              </motion.button>
            </div>

            {/* Email error */}
            <AnimatePresence>
              {emailError && (
                <motion.p
                  className={`text-xs ${isArabic ? 'font-arabic text-right' : ''}`}
                  style={{ color: 'rgba(239,68,68,0.8)' }}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                >
                  {emailError}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Status message */}
            <AnimatePresence>
              {status !== 'idle' && status !== 'sending' && (
                <motion.div
                  className={`flex items-center gap-2 p-3 rounded-xl ${isArabic ? 'flex-row-reverse font-arabic' : ''}`}
                  style={{
                    background: status === 'success'
                      ? 'rgba(34,197,94,0.08)'
                      : status === 'already'
                      ? 'rgba(234,179,8,0.08)'
                      : 'rgba(239,68,68,0.08)',
                    border: `1px solid ${
                      status === 'success'
                        ? 'rgba(34,197,94,0.2)'
                        : status === 'already'
                        ? 'rgba(234,179,8,0.2)'
                        : 'rgba(239,68,68,0.2)'
                    }`,
                  }}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                >
                  {statusIcon()}
                  <span
                    className={`text-xs ${isArabic ? 'text-right' : ''}`}
                    style={{
                      color: status === 'success'
                        ? 'rgba(34,197,94,0.9)'
                        : status === 'already'
                        ? 'rgba(234,179,8,0.9)'
                        : 'rgba(239,68,68,0.9)',
                    }}
                  >
                    {statusMessage()}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
