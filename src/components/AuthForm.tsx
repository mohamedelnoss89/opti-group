'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import Logo from './Logo';
import { useRouter } from 'next/navigation';

interface AuthFormProps {
  mode: 'login' | 'signup';
}

export default function AuthForm({ mode }: AuthFormProps) {
  const { t, locale } = useLanguage();
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email) {
      setError(t.emailRequired);
      return;
    }

    if (!password) {
      setError(t.passwordRequired);
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'login') {
        const { error: authError } = await signIn(email, password);
        if (authError) {
          setError(authError);
        } else {
          setSuccess(t.loginSuccess);
          setTimeout(() => router.push('/'), 1000);
        }
      } else {
        const { error: authError } = await signUp(email, password);
        if (authError) {
          setError(authError);
        } else {
          setSuccess(t.signupSuccess);
          setTimeout(() => router.push('/'), 1500);
        }
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-accent-blue/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-accent-cyan/5 rounded-full blur-[100px]" />
      </div>

      <motion.div
        className="glass-card p-8 sm:p-10 w-full max-w-md relative z-10"
        style={{ boxShadow: '0 0 40px rgba(14,165,233,0.06)' }}
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Logo size="small" />
        </div>

        {/* Title */}
        <h1 className={`text-2xl font-bold text-center text-metallic mb-2 ${locale === 'ar' ? 'font-arabic' : ''}`}>
          {mode === 'login' ? t.login : t.signup}
        </h1>

        <p className={`text-sm text-accent-silver/40 text-center mb-8 ${locale === 'ar' ? 'font-arabic' : ''}`}>
          {mode === 'login' ? t.heroSubtitle : t.heroSubtitle}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email field */}
          <div>
            <label className={`text-xs text-accent-silver/50 mb-2 block ${locale === 'ar' ? 'text-right font-arabic' : ''}`}>
              {t.email}
            </label>
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(192,192,192,0.1)',
              }}
            >
              <Mail className="w-4 h-4 text-accent-silver/40 shrink-0" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`flex-1 bg-transparent outline-none text-sm text-accent-silver placeholder:text-accent-silver/30 ${locale === 'ar' ? 'text-right' : ''}`}
                placeholder={locale === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <label className={`text-xs text-accent-silver/50 mb-2 block ${locale === 'ar' ? 'text-right font-arabic' : ''}`}>
              {t.password}
            </label>
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(192,192,192,0.1)',
              }}
            >
              <Lock className="w-4 h-4 text-accent-silver/40 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`flex-1 bg-transparent outline-none text-sm text-accent-silver placeholder:text-accent-silver/30 ${locale === 'ar' ? 'text-right' : ''}`}
                placeholder={locale === 'ar' ? 'أدخل كلمة المرور' : 'Enter your password'}
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-accent-silver/40" />
                ) : (
                  <Eye className="w-4 h-4 text-accent-silver/40" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm password (signup only) */}
          {mode === 'signup' && (
            <div>
              <label className={`text-xs text-accent-silver/50 mb-2 block ${locale === 'ar' ? 'text-right font-arabic' : ''}`}>
                {t.confirmPassword}
              </label>
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(192,192,192,0.1)',
                }}
              >
                <Lock className="w-4 h-4 text-accent-silver/40 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`flex-1 bg-transparent outline-none text-sm text-accent-silver placeholder:text-accent-silver/30 ${locale === 'ar' ? 'text-right' : ''}`}
                  placeholder={locale === 'ar' ? 'أعد إدخال كلمة المرور' : 'Re-enter your password'}
                  dir={locale === 'ar' ? 'rtl' : 'ltr'}
                />
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <motion.div
              className="text-sm text-red-400 bg-red-400/10 px-4 py-3 rounded-xl"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          {/* Success message */}
          {success && (
            <motion.div
              className="text-sm text-green-400 bg-green-400/10 px-4 py-3 rounded-xl"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {success}
            </motion.div>
          )}

          {/* Submit button */}
          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl text-sm font-semibold tracking-wider uppercase transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, rgba(30,64,175,0.4), rgba(14,165,233,0.4))',
              border: '1px solid rgba(14,165,233,0.3)',
              color: '#e8e8e8',
            }}
            whileHover={!isLoading ? { 
              scale: 1.02, 
              boxShadow: '0 0 30px rgba(14,165,233,0.2)',
            } : {}}
            whileTap={!isLoading ? { scale: 0.98 } : {}}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {t.loading}
              </span>
            ) : (
              mode === 'login' ? t.loginButton : t.signupButton
            )}
          </motion.button>
        </form>

        {/* Switch between login/signup */}
        <div className={`mt-6 text-center text-sm ${locale === 'ar' ? 'font-arabic' : ''}`}>
          <span className="text-accent-silver/40">
            {mode === 'login' ? t.noAccount : t.hasAccount}
          </span>
          {' '}
          <a
            href={mode === 'login' ? '/signup' : '/login'}
            className="text-accent-cyan hover:text-accent-cyan/80 transition-colors no-underline"
          >
            {mode === 'login' ? t.signupLink : t.loginLink}
          </a>
        </div>
      </motion.div>
    </div>
  );
}
