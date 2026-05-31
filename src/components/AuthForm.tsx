'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2, Globe } from 'lucide-react';
import Logo from './Logo';
import { useRouter } from 'next/navigation';

interface AuthFormProps {
  mode: 'login' | 'signup';
}

// Arab countries list
const arabCountries = [
  { code: 'EG', nameAr: 'مصر', nameEn: 'Egypt', flag: '🇪🇬' },
  { code: 'SA', nameAr: 'السعودية', nameEn: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'AE', nameAr: 'الإمارات', nameEn: 'UAE', flag: '🇦🇪' },
  { code: 'KW', nameAr: 'الكويت', nameEn: 'Kuwait', flag: '🇰🇼' },
  { code: 'QA', nameAr: 'قطر', nameEn: 'Qatar', flag: '🇶🇦' },
  { code: 'BH', nameAr: 'البحرين', nameEn: 'Bahrain', flag: '🇧🇭' },
  { code: 'OM', nameAr: 'عُمان', nameEn: 'Oman', flag: '🇴🇲' },
  { code: 'JO', nameAr: 'الأردن', nameEn: 'Jordan', flag: '🇯🇴' },
  { code: 'LB', nameAr: 'لبنان', nameEn: 'Lebanon', flag: '🇱🇧' },
  { code: 'PS', nameAr: 'فلسطين', nameEn: 'Palestine', flag: '🇵🇸' },
  { code: 'IQ', nameAr: 'العراق', nameEn: 'Iraq', flag: '🇮🇶' },
  { code: 'SY', nameAr: 'سوريا', nameEn: 'Syria', flag: '🇸🇾' },
  { code: 'YE', nameAr: 'اليمن', nameEn: 'Yemen', flag: '🇾🇪' },
  { code: 'LY', nameAr: 'ليبيا', nameEn: 'Libya', flag: '🇱🇾' },
  { code: 'TN', nameAr: 'تونس', nameEn: 'Tunisia', flag: '🇹🇳' },
  { code: 'DZ', nameAr: 'الجزائر', nameEn: 'Algeria', flag: '🇩🇿' },
  { code: 'MA', nameAr: 'المغرب', nameEn: 'Morocco', flag: '🇲🇦' },
  { code: 'SD', nameAr: 'السودان', nameEn: 'Sudan', flag: '🇸🇩' },
  { code: 'MR', nameAr: 'موريتانيا', nameEn: 'Mauritania', flag: '🇲🇷' },
  { code: 'SO', nameAr: 'الصومال', nameEn: 'Somalia', flag: '🇸🇴' },
  { code: 'DJ', nameAr: 'جيبوتي', nameEn: 'Djibouti', flag: '🇩🇯' },
  { code: 'KM', nameAr: 'جزر القمر', nameEn: 'Comoros', flag: '🇰🇲' },
];

// Other popular countries
const otherCountries = [
  { code: 'US', nameAr: 'الولايات المتحدة', nameEn: 'United States', flag: '🇺🇸' },
  { code: 'GB', nameAr: 'المملكة المتحدة', nameEn: 'United Kingdom', flag: '🇬🇧' },
  { code: 'DE', nameAr: 'ألمانيا', nameEn: 'Germany', flag: '🇩🇪' },
  { code: 'FR', nameAr: 'فرنسا', nameEn: 'France', flag: '🇫🇷' },
  { code: 'TR', nameAr: 'تركيا', nameEn: 'Turkey', flag: '🇹🇷' },
  { code: 'MY', nameAr: 'ماليزيا', nameEn: 'Malaysia', flag: '🇲🇾' },
  { code: 'ID', nameAr: 'إندونيسيا', nameEn: 'Indonesia', flag: '🇮🇩' },
  { code: 'PK', nameAr: 'باكستان', nameEn: 'Pakistan', flag: '🇵🇰' },
  { code: 'IN', nameAr: 'الهند', nameEn: 'India', flag: '🇮🇳' },
  { code: 'BR', nameAr: 'البرازيل', nameEn: 'Brazil', flag: '🇧🇷' },
  { code: 'CA', nameAr: 'كندا', nameEn: 'Canada', flag: '🇨🇦' },
  { code: 'AU', nameAr: 'أستراليا', nameEn: 'Australia', flag: '🇦🇺' },
];

const allCountries = [...arabCountries, ...otherCountries].sort((a, b) => 
  a.nameAr.localeCompare(b.nameAr, 'ar')
);

export default function AuthForm({ mode }: AuthFormProps) {
  const { t, locale } = useLanguage();
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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

    if (mode === 'signup') {
      if (!country) {
        setError(t.countryRequired);
        return;
      }
      if (password !== confirmPassword) {
        setError(t.passwordMismatch);
        return;
      }
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
        const { error: authError } = await signUp(email, password, country);
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

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleLoading(true);
    try {
      const { error: authError } = await signInWithGoogle();
      if (authError) {
        setError(authError);
      }
    } catch {
      setError('Google sign-in failed');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-80 h-80 rounded-full blur-[100px]" style={{ background: 'rgba(30,64,175,0.04)' }} />
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 rounded-full blur-[100px]" style={{ background: 'rgba(14,165,233,0.04)' }} />
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

        <p className={`text-sm text-center mb-6 ${locale === 'ar' ? 'font-arabic' : ''}`} style={{ color: 'rgba(192,192,192,0.4)' }}>
          {mode === 'login' ? t.heroSubtitle : t.heroSubtitle}
        </p>

        {/* Google Sign In Button */}
        <motion.button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading}
          className="w-full py-3 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer flex items-center justify-center gap-3 mb-5 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(192,192,192,0.15)',
            color: 'rgba(232,232,232,0.85)',
          }}
          whileHover={!isGoogleLoading ? { scale: 1.02, borderColor: 'rgba(192,192,192,0.3)' } : {}}
          whileTap={!isGoogleLoading ? { scale: 0.98 } : {}}
        >
          {isGoogleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          )}
          <span className={locale === 'ar' ? 'font-arabic' : ''}>
            {mode === 'login' ? t.googleLogin : t.googleSignup}
          </span>
        </motion.button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px" style={{ background: 'rgba(192,192,192,0.1)' }} />
          <span className={`text-xs ${locale === 'ar' ? 'font-arabic' : ''}`} style={{ color: 'rgba(192,192,192,0.3)' }}>
            {t.orContinueWith}
          </span>
          <div className="flex-1 h-px" style={{ background: 'rgba(192,192,192,0.1)' }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Country field (signup only) */}
          {mode === 'signup' && (
            <div>
              <label className={`text-xs mb-2 block ${locale === 'ar' ? 'text-right font-arabic' : ''}`} style={{ color: 'rgba(192,192,192,0.5)' }}>
                {t.country}
              </label>
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(192,192,192,0.1)',
                }}
              >
                <Globe className="w-4 h-4 shrink-0" style={{ color: 'rgba(192,192,192,0.4)' }} />
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className={`flex-1 bg-transparent outline-none text-sm cursor-pointer ${locale === 'ar' ? 'text-right font-arabic' : ''}`}
                  style={{ color: country ? 'rgba(192,192,192,0.85)' : 'rgba(192,192,192,0.3)' }}
                  dir={locale === 'ar' ? 'rtl' : 'ltr'}
                >
                  <option value="" disabled style={{ background: '#1a1f36', color: 'rgba(192,192,192,0.5)' }}>
                    {t.selectCountry}
                  </option>
                  {allCountries.map((c) => (
                    <option key={c.code} value={c.code} style={{ background: '#1a1f36', color: '#c0c0c0' }}>
                      {c.flag} {locale === 'ar' ? c.nameAr : c.nameEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Email field */}
          <div>
            <label className={`text-xs mb-2 block ${locale === 'ar' ? 'text-right font-arabic' : ''}`} style={{ color: 'rgba(192,192,192,0.5)' }}>
              {t.email}
            </label>
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(192,192,192,0.1)',
              }}
            >
              <Mail className="w-4 h-4 shrink-0" style={{ color: 'rgba(192,192,192,0.4)' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`flex-1 bg-transparent outline-none text-sm placeholder:text-opacity-30 ${locale === 'ar' ? 'text-right font-arabic' : ''}`}
                style={{ color: 'rgba(192,192,192,0.85)' }}
                placeholder={locale === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <label className={`text-xs mb-2 block ${locale === 'ar' ? 'text-right font-arabic' : ''}`} style={{ color: 'rgba(192,192,192,0.5)' }}>
              {t.password}
            </label>
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(192,192,192,0.1)',
              }}
            >
              <Lock className="w-4 h-4 shrink-0" style={{ color: 'rgba(192,192,192,0.4)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`flex-1 bg-transparent outline-none text-sm placeholder:text-opacity-30 ${locale === 'ar' ? 'text-right font-arabic' : ''}`}
                style={{ color: 'rgba(192,192,192,0.85)' }}
                placeholder={locale === 'ar' ? 'أدخل كلمة المرور' : 'Enter your password'}
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" style={{ color: 'rgba(192,192,192,0.4)' }} />
                ) : (
                  <Eye className="w-4 h-4" style={{ color: 'rgba(192,192,192,0.4)' }} />
                )}
              </button>
            </div>
          </div>

          {/* Confirm password (signup only) */}
          {mode === 'signup' && (
            <div>
              <label className={`text-xs mb-2 block ${locale === 'ar' ? 'text-right font-arabic' : ''}`} style={{ color: 'rgba(192,192,192,0.5)' }}>
                {t.confirmPassword}
              </label>
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(192,192,192,0.1)',
                }}
              >
                <Lock className="w-4 h-4 shrink-0" style={{ color: 'rgba(192,192,192,0.4)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`flex-1 bg-transparent outline-none text-sm placeholder:text-opacity-30 ${locale === 'ar' ? 'text-right font-arabic' : ''}`}
                  style={{ color: 'rgba(192,192,192,0.85)' }}
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
          <span style={{ color: 'rgba(192,192,192,0.4)' }}>
            {mode === 'login' ? t.noAccount : t.hasAccount}
          </span>
          {' '}
          <a
            href={mode === 'login' ? '/signup' : '/login'}
            className="no-underline transition-colors"
            style={{ color: '#0ea5e9' }}
          >
            {mode === 'login' ? t.signupLink : t.loginLink}
          </a>
        </div>
      </motion.div>
    </div>
  );
}
