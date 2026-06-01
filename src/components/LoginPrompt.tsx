'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, X } from 'lucide-react';

interface LoginPromptProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
  messageAr?: string;
}

export default function LoginPrompt({ isOpen, onClose, message, messageAr }: LoginPromptProps) {
  const { locale } = useLanguage();
  const { signInWithGoogle } = useAuth();
  const isArabic = locale === 'ar';

  const handleGoogleLogin = async () => {
    await signInWithGoogle();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative max-w-md w-full rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(16, 20, 38, 0.98)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(14,165,233,0.15)',
                boxShadow: '0 25px 80px rgba(0,0,0,0.5), 0 0 40px rgba(14,165,233,0.08)',
              }}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-lg cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <X className="w-4 h-4" style={{ color: 'rgba(192,192,192,0.5)' }} />
              </button>

              <div className="p-8 text-center">
                {/* Icon */}
                <motion.div
                  className="mx-auto mb-5 w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(14,165,233,0.15), rgba(30,64,175,0.1))',
                    border: '1px solid rgba(14,165,233,0.2)',
                  }}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <LogIn className="w-7 h-7" style={{ color: '#0ea5e9' }} />
                </motion.div>

                {/* Title */}
                <motion.h2
                  className={`text-xl font-bold mb-2 ${isArabic ? 'font-arabic' : ''}`}
                  style={{ color: 'rgba(232,232,232,0.95)' }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  {isArabic ? 'سجّل دخولك أولاً' : 'Sign in first'}
                </motion.h2>

                {/* Description */}
                <motion.p
                  className={`text-sm mb-7 leading-relaxed ${isArabic ? 'font-arabic' : ''}`}
                  style={{ color: 'rgba(192,192,192,0.5)' }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {message
                    ? (isArabic ? messageAr : message)
                    : (isArabic
                      ? 'يجب عليك تسجيل الدخول أو إنشاء حساب للوصول إلى هذه الميزة'
                      : 'You need to sign in or create an account to access this feature')
                  }
                </motion.p>

                {/* Google Login Button */}
                <motion.button
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl text-sm font-semibold cursor-pointer mb-3"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(192,192,192,0.12)',
                    color: 'rgba(232,232,232,0.9)',
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  whileHover={{ background: 'rgba(255,255,255,0.1', scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {isArabic ? 'تسجيل الدخول بحساب جوجل' : 'Sign in with Google'}
                </motion.button>

                {/* Email Login / Signup */}
                <div className="flex gap-3">
                  <motion.a
                    href="/login"
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-medium no-underline"
                    style={{
                      background: 'linear-gradient(135deg, rgba(14,165,233,0.15), rgba(30,64,175,0.1))',
                      border: '1px solid rgba(14,165,233,0.2)',
                      color: '#0ea5e9',
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    {isArabic ? 'تسجيل دخول' : 'Login'}
                  </motion.a>
                  <motion.a
                    href="/signup"
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-medium no-underline"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(192,192,192,0.08)',
                      color: 'rgba(192,192,192,0.7)',
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    whileHover={{ scale: 1.02, background: 'rgba(255,255,255,0.06)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    {isArabic ? 'إنشاء حساب' : 'Sign Up'}
                  </motion.a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
