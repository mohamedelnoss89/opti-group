'use client';

import React, { useState, useEffect, FormEvent, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle, AlertCircle, Mail, User, AtSign, FileText, X, Lock } from 'lucide-react';
import LoginPrompt from './LoginPrompt';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FormStatus = 'idle' | 'sending' | 'success' | 'error';

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const { t, locale } = useLanguage();
  const { user } = useAuth();
  const isArabic = locale === 'ar';

  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errors, setErrors] = useState<FormErrors>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // ===== Auto-fill email from auth user or Credential Management API =====
  useEffect(() => {
    if (!isOpen) return;
    // 1) If user is logged in via Supabase, use their email
    if (user?.email) {
      setEmail(user.email);
      return;
    }
    // 2) Otherwise try browser credential manager (Chrome/Edge auto-fill)
    if (typeof navigator !== 'undefined' && navigator.credentials?.get) {
      navigator.credentials
        .get({ password: true } as CredentialRequestOptions)
        .then((cred) => {
          if (cred && 'password' in cred && cred.password) {
            // PasswordCredential has id (=email typically for Google accounts)
            const c = cred as unknown as { id?: string };
            if (c.id && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.id)) {
              setEmail(c.id);
            }
          }
        })
        .catch(() => {
          /* user dismissed / not supported — silent */
        });
    }
  }, [isOpen, user]);

  // Lock body scroll while modal open
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && status !== 'sending') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose, status]);

  const validateEmail = (emailStr: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailStr);
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!name.trim()) newErrors.name = t.contactNameRequired;
    if (!email.trim()) {
      newErrors.email = t.contactEmailRequired;
    } else if (!validateEmail(email.trim())) {
      newErrors.email = t.contactEmailInvalid;
    }
    if (!message.trim()) newErrors.message = t.contactMessageRequired;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    if (!validate()) return;

    setStatus('sending');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim() || undefined,
          message: message.trim(),
        }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setStatus('success');
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
        setErrors({});
        setTimeout(() => {
          setStatus('idle');
          onClose();
        }, 1800);
      } else {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 5000);
      }
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  const clearNameError = useCallback(() => setErrors((prev) => ({ ...prev, name: undefined })), []);
  const clearEmailError = useCallback(() => setErrors((prev) => ({ ...prev, email: undefined })), []);
  const clearMessageError = useCallback(() => setErrors((prev) => ({ ...prev, message: undefined })), []);

  const inputStyle = (hasError: boolean, isFocused: boolean) => ({
    background: 'rgba(10,14,26,0.7)',
    border: `1px solid ${hasError ? 'rgba(239,68,68,0.4)' : isFocused ? 'rgba(14,165,233,0.4)' : 'rgba(192,192,192,0.1)'}`,
    borderRadius: '10px',
    color: 'rgba(232,232,232,0.95)',
    boxShadow: isFocused ? '0 0 16px rgba(14,165,233,0.08)' : 'none',
  });

  const labelStyle = (hasError: boolean, isFocused: boolean) => ({
    color: hasError ? '#ef4444' : isFocused ? '#0ea5e9' : 'rgba(192,192,192,0.55)',
  });

  const iconStyle = (hasError: boolean, isFocused: boolean) => ({
    color: hasError ? '#ef4444' : isFocused ? '#0ea5e9' : 'rgba(192,192,192,0.35)',
  });

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/75 backdrop-blur-sm"
              style={{ zIndex: 10000 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => status !== 'sending' && onClose()}
            />

            {/* Modal */}
            <motion.div
              className="fixed inset-0 flex items-center justify-center p-4"
              style={{ zIndex: 10001 }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.2 }}
            >
              <div
                className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl"
                style={{
                  background: 'rgba(26, 31, 54, 0.95)',
                  backdropFilter: 'blur(24px)',
                  border: '1px solid rgba(14,165,233,0.15)',
                  boxShadow: '0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
                }}
              >
                {/* Header */}
                <div
                  className="sticky top-0 flex items-center justify-between p-5 border-b"
                  style={{
                    background: 'rgba(26, 31, 54, 0.98)',
                    borderColor: 'rgba(14,165,233,0.1)',
                  }}
                >
                  <div className={`flex items-center gap-3 ${isArabic ? 'flex-row-reverse' : ''}`}>
                    <div
                      className="p-2 rounded-xl"
                      style={{
                        background: 'linear-gradient(135deg, rgba(14,165,233,0.15), rgba(30,64,175,0.1))',
                        border: '1px solid rgba(14,165,233,0.2)',
                      }}
                    >
                      <Mail className="w-4 h-4" style={{ color: '#0ea5e9' }} />
                    </div>
                    <h3
                      className={`text-base font-semibold ${isArabic ? 'font-arabic' : ''}`}
                      style={{ color: 'rgba(232,232,232,0.95)' }}
                    >
                      {t.contactTitle}
                    </h3>
                  </div>
                  <button
                    onClick={() => status !== 'sending' && onClose()}
                    className="p-1.5 rounded-lg transition-colors"
                    style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(192,192,192,0.6)' }}
                    aria-label="close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Body */}
                <div className="p-5">
                  {!user && (
                    <div
                      className={`flex items-center gap-2 mb-4 p-3 rounded-xl ${isArabic ? 'flex-row-reverse' : ''}`}
                      style={{
                        background: 'rgba(14,165,233,0.07)',
                        border: '1px solid rgba(14,165,233,0.15)',
                      }}
                    >
                      <Lock className="w-3.5 h-3.5" style={{ color: '#0ea5e9' }} />
                      <span
                        className={`text-xs ${isArabic ? 'font-arabic' : ''}`}
                        style={{ color: 'rgba(14,165,233,0.85)' }}
                      >
                        {isArabic ? 'يجب تسجيل الدخول لإرسال رسالة' : 'Sign in required to send a message'}
                      </span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name + Email row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name */}
                      <div className="relative">
                        <label
                          htmlFor="cm-name"
                          className={`block text-xs font-medium mb-1.5 ${isArabic ? 'font-arabic text-right' : ''}`}
                          style={labelStyle(!!errors.name, focusedField === 'name')}
                        >
                          {t.contactName}
                          <span style={{ color: '#ef4444' }}> *</span>
                        </label>
                        <div className="relative">
                          <div
                            className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
                            style={{ ...(isArabic ? { right: '12px' } : { left: '12px' }), ...iconStyle(!!errors.name, focusedField === 'name') }}
                          >
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <input
                            id="cm-name"
                            type="text"
                            name="name"
                            autoComplete="name"
                            value={name}
                            onChange={(e) => {
                              setName(e.target.value);
                              if (errors.name) clearNameError();
                            }}
                            onFocus={() => setFocusedField('name')}
                            onBlur={() => setFocusedField(null)}
                            placeholder={t.contactNamePlaceholder}
                            className={`w-full py-2.5 text-sm outline-none transition-all duration-200 ${isArabic ? 'pr-10 pl-3 text-right font-arabic' : 'pl-10 pr-3'}`}
                            style={inputStyle(!!errors.name, focusedField === 'name')}
                            dir={isArabic ? 'rtl' : 'ltr'}
                          />
                        </div>
                        {errors.name && (
                          <p className={`text-xs mt-1 ${isArabic ? 'font-arabic text-right' : ''}`} style={{ color: '#ef4444' }}>
                            {errors.name}
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      <div className="relative">
                        <label
                          htmlFor="cm-email"
                          className={`block text-xs font-medium mb-1.5 ${isArabic ? 'font-arabic text-right' : ''}`}
                          style={labelStyle(!!errors.email, focusedField === 'email')}
                        >
                          {t.contactEmail}
                          <span style={{ color: '#ef4444' }}> *</span>
                        </label>
                        <div className="relative">
                          <div
                            className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
                            style={{ ...(isArabic ? { right: '12px' } : { left: '12px' }), ...iconStyle(!!errors.email, focusedField === 'email') }}
                          >
                            <AtSign className="w-3.5 h-3.5" />
                          </div>
                          <input
                            id="cm-email"
                            type="email"
                            name="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              if (errors.email) clearEmailError();
                            }}
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => setFocusedField(null)}
                            placeholder={t.contactEmailPlaceholder}
                            className={`w-full py-2.5 text-sm outline-none transition-all duration-200 ${isArabic ? 'pr-10 pl-3 text-right font-arabic' : 'pl-10 pr-3'}`}
                            style={inputStyle(!!errors.email, focusedField === 'email')}
                            dir="ltr"
                          />
                        </div>
                        {errors.email && (
                          <p className={`text-xs mt-1 ${isArabic ? 'font-arabic text-right' : ''}`} style={{ color: '#ef4444' }}>
                            {errors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Subject */}
                    <div className="relative">
                      <label
                        htmlFor="cm-subject"
                        className={`block text-xs font-medium mb-1.5 ${isArabic ? 'font-arabic text-right' : ''}`}
                        style={labelStyle(false, focusedField === 'subject')}
                      >
                        {t.contactSubject}
                      </label>
                      <div className="relative">
                        <div
                          className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
                          style={{ ...(isArabic ? { right: '12px' } : { left: '12px' }), ...iconStyle(false, focusedField === 'subject') }}
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <input
                          id="cm-subject"
                          type="text"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          onFocus={() => setFocusedField('subject')}
                          onBlur={() => setFocusedField(null)}
                          placeholder={t.contactSubjectPlaceholder}
                          className={`w-full py-2.5 text-sm outline-none transition-all duration-200 ${isArabic ? 'pr-10 pl-3 text-right font-arabic' : 'pl-10 pr-3'}`}
                          style={inputStyle(false, focusedField === 'subject')}
                          dir={isArabic ? 'rtl' : 'ltr'}
                        />
                      </div>
                    </div>

                    {/* Message */}
                    <div className="relative">
                      <label
                        htmlFor="cm-message"
                        className={`block text-xs font-medium mb-1.5 ${isArabic ? 'font-arabic text-right' : ''}`}
                        style={labelStyle(!!errors.message, focusedField === 'message')}
                      >
                        {t.contactMessage}
                        <span style={{ color: '#ef4444' }}> *</span>
                      </label>
                      <textarea
                        id="cm-message"
                        value={message}
                        onChange={(e) => {
                          setMessage(e.target.value);
                          if (errors.message) clearMessageError();
                        }}
                        onFocus={() => setFocusedField('message')}
                        onBlur={() => setFocusedField(null)}
                        placeholder={t.contactMessagePlaceholder}
                        rows={4}
                        className={`w-full py-2.5 px-3 text-sm outline-none transition-all duration-200 resize-none ${isArabic ? 'text-right font-arabic' : ''}`}
                        style={inputStyle(!!errors.message, focusedField === 'message')}
                        dir={isArabic ? 'rtl' : 'ltr'}
                      />
                      {errors.message && (
                        <p className={`text-xs mt-1 ${isArabic ? 'font-arabic text-right' : ''}`} style={{ color: '#ef4444' }}>
                          {errors.message}
                        </p>
                      )}
                    </div>

                    {/* Submit */}
                    <div className={`flex ${isArabic ? 'justify-start' : 'justify-end'} pt-1`}>
                      <motion.button
                        type="submit"
                        disabled={status === 'sending' || !user}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${isArabic ? 'font-arabic' : ''}`}
                        style={{
                          background:
                            status === 'success'
                              ? 'linear-gradient(135deg, rgba(34,197,94,0.25), rgba(34,197,94,0.12))'
                              : status === 'error'
                                ? 'linear-gradient(135deg, rgba(239,68,68,0.25), rgba(239,68,68,0.12))'
                                : 'linear-gradient(135deg, rgba(14,165,233,0.25), rgba(30,64,175,0.18))',
                          border: `1px solid ${status === 'success' ? 'rgba(34,197,94,0.35)' : status === 'error' ? 'rgba(239,68,68,0.35)' : 'rgba(14,165,233,0.3)'}`,
                          color: status === 'success' ? '#22c55e' : status === 'error' ? '#ef4444' : '#0ea5e9',
                          cursor: status === 'sending' || !user ? 'not-allowed' : 'pointer',
                          opacity: status === 'sending' || !user ? 0.6 : 1,
                        }}
                        whileHover={status === 'idle' && user ? { scale: 1.03, boxShadow: '0 0 24px rgba(14,165,233,0.15)' } : {}}
                        whileTap={status === 'idle' && user ? { scale: 0.97 } : {}}
                      >
                        {status === 'sending' ? (
                          <>
                            <div
                              className="w-3.5 h-3.5 border-2 border-t-transparent rounded-full animate-spin"
                              style={{ borderColor: '#0ea5e9', borderTopColor: 'transparent' }}
                            />
                            <span>{t.contactSending}</span>
                          </>
                        ) : status === 'success' ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            <span>{t.contactSuccess}</span>
                          </>
                        ) : status === 'error' ? (
                          <>
                            <AlertCircle className="w-4 h-4" />
                            <span>{t.contactError}</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>{t.contactSend}</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <LoginPrompt
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        messageAr="سجّل دخولك لإرسال رسالة والتواصل معنا"
        message="Sign in to send a message and contact us"
      />
    </>
  );
}
