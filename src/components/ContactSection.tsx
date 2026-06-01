'use client';

import { useState, FormEvent, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle, AlertCircle, Copy, Check, Mail, MessageSquare, User, AtSign, FileText, Lock } from 'lucide-react';
import LoginPrompt from './LoginPrompt';

type FormStatus = 'idle' | 'sending' | 'success' | 'error';

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

// InputField defined OUTSIDE the component to prevent re-creation on every render
function InputField({
  id,
  label,
  placeholder,
  value,
  onChange,
  error,
  onClearError,
  icon: Icon,
  type = 'text',
  required = false,
  isArabic,
  isFocused,
  onFocus,
  onBlur,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
  onClearError: () => void;
  icon: React.ElementType;
  type?: string;
  required?: boolean;
  isArabic: boolean;
  isFocused: boolean;
  onFocus: () => void;
  onBlur: () => void;
}) {
  return (
    <div className="relative">
      <label
        htmlFor={id}
        className={`block text-xs font-medium mb-2 transition-colors duration-200 ${isArabic ? 'font-arabic text-right' : ''}`}
        style={{ color: error ? '#ef4444' : isFocused ? '#0ea5e9' : 'rgba(192,192,192,0.5)' }}
      >
        {label}
        {required && <span style={{ color: '#ef4444' }}> *</span>}
      </label>
      <div className="relative">
        <div
          className="absolute top-1/2 -translate-y-1/2 transition-colors duration-200 pointer-events-none"
          style={{
            [isArabic ? 'right' : 'left']: '14px',
            color: error ? '#ef4444' : isFocused ? '#0ea5e9' : 'rgba(192,192,192,0.3)',
          }}
        >
          <Icon className="w-4 h-4" />
        </div>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (error) {
              onClearError();
            }
          }}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`w-full py-3 transition-all duration-200 outline-none text-sm ${isArabic ? 'pr-11 pl-4 text-right font-arabic' : 'pl-11 pr-4'}`}
          style={{
            background: 'rgba(10,14,26,0.6)',
            border: `1px solid ${error ? 'rgba(239,68,68,0.4)' : isFocused ? 'rgba(14,165,233,0.35)' : 'rgba(192,192,192,0.08)'}`,
            borderRadius: '12px',
            color: 'rgba(232,232,232,0.9)',
            boxShadow: isFocused ? '0 0 20px rgba(14,165,233,0.06)' : 'none',
          }}
          dir={isArabic ? 'rtl' : 'ltr'}
        />
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            className={`text-xs mt-1.5 ${isArabic ? 'font-arabic text-right' : ''}`}
            style={{ color: '#ef4444' }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ContactSection() {
  const { t, locale } = useLanguage();
  const { user } = useAuth();
  const isArabic = locale === 'ar';

  // Login prompt state
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errors, setErrors] = useState<FormErrors>({});
  const [copied, setCopied] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const validateEmail = (emailStr: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailStr);
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = t.contactNameRequired;
    }
    if (!email.trim()) {
      newErrors.email = t.contactEmailRequired;
    } else if (!validateEmail(email.trim())) {
      newErrors.email = t.contactEmailInvalid;
    }
    if (!message.trim()) {
      newErrors.message = t.contactMessageRequired;
    }

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
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 5000);
      }
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText('mohamed10.mohamed10@gmail.com');
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
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

  // Stable callbacks to prevent unnecessary re-renders
  const clearNameError = useCallback(() => setErrors((prev) => ({ ...prev, name: undefined })), []);
  const clearEmailError = useCallback(() => setErrors((prev) => ({ ...prev, email: undefined })), []);
  const clearMessageError = useCallback(() => setErrors((prev) => ({ ...prev, message: undefined })), []);

  return (
    <section id="section-contact" className="relative py-20 px-4">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(14,165,233,0.04), transparent 70%)',
        }}
      />

      <div className="max-w-5xl mx-auto relative z-10">
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

        {/* Main content: Form + Info side by side on larger screens */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Contact Form - Takes 3 columns */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div
              className="p-6 sm:p-8 rounded-2xl"
              style={{
                background: 'rgba(26, 31, 54, 0.5)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(14,165,233,0.08)',
                boxShadow: '0 8px 40px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.02)',
              }}
            >
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name + Email row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <InputField
                    id="name"
                    label={t.contactName}
                    placeholder={t.contactNamePlaceholder}
                    value={name}
                    onChange={setName}
                    error={errors.name}
                    onClearError={clearNameError}
                    icon={User}
                    required
                    isArabic={isArabic}
                    isFocused={focusedField === 'name'}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                  />
                  <InputField
                    id="email"
                    label={t.contactEmail}
                    placeholder={t.contactEmailPlaceholder}
                    value={email}
                    onChange={setEmail}
                    error={errors.email}
                    onClearError={clearEmailError}
                    icon={AtSign}
                    type="email"
                    required
                    isArabic={isArabic}
                    isFocused={focusedField === 'email'}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>

                {/* Subject */}
                <InputField
                  id="subject"
                  label={t.contactSubject}
                  placeholder={t.contactSubjectPlaceholder}
                  value={subject}
                  onChange={setSubject}
                  onClearError={() => {}}
                  icon={FileText}
                  isArabic={isArabic}
                  isFocused={focusedField === 'subject'}
                  onFocus={() => setFocusedField('subject')}
                  onBlur={() => setFocusedField(null)}
                />

                {/* Message textarea */}
                <div className="relative">
                  <label
                    htmlFor="message"
                    className={`block text-xs font-medium mb-2 transition-colors duration-200 ${isArabic ? 'font-arabic text-right' : ''}`}
                    style={{
                      color: errors.message
                        ? '#ef4444'
                        : focusedField === 'message'
                          ? '#0ea5e9'
                          : 'rgba(192,192,192,0.5)',
                    }}
                  >
                    {t.contactMessage}
                    <span style={{ color: '#ef4444' }}> *</span>
                  </label>
                  <div className="relative">
                    <textarea
                      id="message"
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        if (errors.message) {
                          clearMessageError();
                        }
                      }}
                      onFocus={() => setFocusedField('message')}
                      onBlur={() => setFocusedField(null)}
                      placeholder={t.contactMessagePlaceholder}
                      rows={5}
                      className={`w-full py-3 px-4 transition-all duration-200 outline-none text-sm resize-none ${isArabic ? 'text-right font-arabic' : ''}`}
                      style={{
                        background: 'rgba(10,14,26,0.6)',
                        border: `1px solid ${errors.message ? 'rgba(239,68,68,0.4)' : focusedField === 'message' ? 'rgba(14,165,233,0.35)' : 'rgba(192,192,192,0.08)'}`,
                        borderRadius: '12px',
                        color: 'rgba(232,232,232,0.9)',
                        boxShadow: focusedField === 'message' ? '0 0 20px rgba(14,165,233,0.06)' : 'none',
                      }}
                      dir={isArabic ? 'rtl' : 'ltr'}
                    />
                  </div>
                  <AnimatePresence>
                    {errors.message && (
                      <motion.p
                        initial={{ opacity: 0, y: -4, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -4, height: 0 }}
                        className={`text-xs mt-1.5 ${isArabic ? 'font-arabic text-right' : ''}`}
                        style={{ color: '#ef4444' }}
                      >
                        {errors.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Submit button */}
                <div className={`flex ${isArabic ? 'justify-start' : 'justify-end'}`}>
                  <motion.button
                    type="submit"
                    disabled={status === 'sending'}
                    className={`flex items-center gap-2.5 px-7 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${isArabic ? 'font-arabic' : ''}`}
                    style={{
                      background:
                        status === 'success'
                          ? 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.1))'
                          : status === 'error'
                            ? 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.1))'
                            : 'linear-gradient(135deg, rgba(14,165,233,0.2), rgba(30,64,175,0.15))',
                      border: `1px solid ${status === 'success' ? 'rgba(34,197,94,0.3)' : status === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(14,165,233,0.25)'}`,
                      color: status === 'success' ? '#22c55e' : status === 'error' ? '#ef4444' : '#0ea5e9',
                      cursor: status === 'sending' ? 'not-allowed' : 'pointer',
                      opacity: status === 'sending' ? 0.7 : 1,
                    }}
                    whileHover={
                      status === 'idle'
                        ? { scale: 1.03, boxShadow: '0 0 30px rgba(14,165,233,0.12)' }
                        : {}
                    }
                    whileTap={status === 'idle' ? { scale: 0.97 } : {}}
                  >
                    {status === 'sending' ? (
                      <>
                        <div
                          className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
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
                        <Send className="w-4 h-4" />
                        <span>{t.contactSend}</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>

          {/* Contact Info Sidebar - Takes 2 columns */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="space-y-5">
              {/* Email card */}
              <div
                className="p-6 rounded-2xl"
                style={{
                  background: 'rgba(26, 31, 54, 0.5)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(14,165,233,0.08)',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.02)',
                }}
              >
                <div className={`flex items-center gap-3 mb-4 ${isArabic ? 'flex-row-reverse' : ''}`}>
                  <div
                    className="p-2.5 rounded-xl flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, rgba(14,165,233,0.12), rgba(30,64,175,0.08))',
                      border: '1px solid rgba(14,165,233,0.12)',
                    }}
                  >
                    <Mail className="w-5 h-5" style={{ color: '#0ea5e9' }} />
                  </div>
                  <h3
                    className={`text-sm font-semibold ${isArabic ? 'font-arabic text-right' : ''}`}
                    style={{ color: 'rgba(232,232,232,0.85)' }}
                  >
                    {t.contactOrEmail}
                  </h3>
                </div>

                {/* Email address display */}
                <div
                  className="p-3.5 rounded-xl mb-4"
                  style={{
                    background: 'rgba(10,14,26,0.5)',
                    border: '1px solid rgba(192,192,192,0.06)',
                  }}
                >
                  <p
                    className="text-sm font-medium"
                    style={{ color: 'rgba(192,192,192,0.75)' }}
                    dir="ltr"
                  >
                    mohamed10.mohamed10@gmail.com
                  </p>
                </div>

                {/* Copy email button */}
                <motion.button
                  onClick={handleCopyEmail}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${isArabic ? 'font-arabic' : ''}`}
                  style={{
                    background: copied ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.02)',
                    border: copied
                      ? '1px solid rgba(34,197,94,0.2)'
                      : '1px solid rgba(192,192,192,0.06)',
                    color: copied ? '#22c55e' : 'rgba(192,192,192,0.5)',
                    cursor: 'pointer',
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{t.contactCopied}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{t.contactCopyEmail}</span>
                    </>
                  )}
                </motion.button>
              </div>

              {/* Response time card */}
              <div
                className="p-6 rounded-2xl"
                style={{
                  background: 'rgba(26, 31, 54, 0.5)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(14,165,233,0.08)',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.02)',
                }}
              >
                <div className={`flex items-center gap-3 mb-3 ${isArabic ? 'flex-row-reverse' : ''}`}>
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
                    {isArabic ? 'متاح للتواصل' : 'Available for contact'}
                  </span>
                </div>
                <p
                  className={`text-xs leading-relaxed ${isArabic ? 'font-arabic text-right' : ''}`}
                  style={{ color: 'rgba(192,192,192,0.4)' }}
                >
                  {isArabic
                    ? 'نحرص على الرد على جميع الرسائل في أسرع وقت ممكن. عادةً نرد خلال 24-48 ساعة.'
                    : 'We make sure to respond to all messages as quickly as possible. We usually reply within 24-48 hours.'}
                </p>
              </div>

              {/* Decorative element */}
              <div
                className="hidden lg:block p-6 rounded-2xl text-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(14,165,233,0.05), rgba(30,64,175,0.03))',
                  border: '1px solid rgba(14,165,233,0.06)',
                }}
              >
                <div className="text-4xl mb-3">✉️</div>
                <p
                  className={`text-xs ${isArabic ? 'font-arabic' : ''}`}
                  style={{ color: 'rgba(192,192,192,0.35)' }}
                >
                  {isArabic
                    ? 'رأيك يهمنا! لا تتردد في التواصل معنا.'
                    : 'Your feedback matters! Don\'t hesitate to reach out.'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Login required notice - shown when not logged in */}
      {!user && (
        <div className="max-w-5xl mx-auto px-4 mt-6">
          <motion.div
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl"
            style={{
              background: 'rgba(14,165,233,0.06)',
              border: '1px solid rgba(14,165,233,0.12)',
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Lock className="w-4 h-4" style={{ color: '#0ea5e9' }} />
            <span className={`text-xs ${isArabic ? 'font-arabic' : ''}`} style={{ color: 'rgba(14,165,233,0.8)' }}>
              {isArabic ? 'يجب تسجيل الدخول لإرسال رسالة' : 'Sign in required to send a message'}
            </span>
          </motion.div>
        </div>
      )}

      {/* Login Prompt Modal */}
      <LoginPrompt
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        messageAr="سجّل دخولك لإرسال رسالة والتواصل معنا"
        message="Sign in to send a message and contact us"
      />
    </section>
  );
}
