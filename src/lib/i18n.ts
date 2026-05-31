export type Locale = 'ar' | 'en';

export const translations = {
  ar: {
    // Brand
    brandName: 'مجموعة أوبتي',
    brandNameEn: 'OPTI GROUP',
    
    // Nav
    menu: 'القائمة',
    home: 'الرئيسية',
    
    // Sections
    healthSection: 'قسم الصحة',
    outingsSection: 'قسم الخروجات',
    aiSection: 'قسم الـ AI',
    landmarksSection: 'قسم المعالم السياحية المصرية',
    contactUs: 'اتصل بنا',
    
    // Hero
    heroTitle: 'مجموعة أوبتي',
    heroSubtitle: 'تطبيقات ذكية لحياة أفضل',
    heroDescription: 'مجموعة متكاملة من التطبيقات المصممة لتحسين جودة حياتك في الصحة والترفيه والذكاء الاصطناعي والسياحة',
    exploreApps: 'استكشف التطبيقات',
    
    // App statuses
    live: 'متاح الآن',
    comingSoon: 'قريباً',
    visit: 'زيارة',
    
    // Auth
    login: 'تسجيل الدخول',
    signup: 'إنشاء حساب',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    confirmPassword: 'تأكيد كلمة المرور',
    country: 'الدولة',
    selectCountry: 'اختر دولتك',
    loginButton: 'دخول',
    signupButton: 'إنشاء حساب',
    logout: 'تسجيل الخروج',
    noAccount: 'ليس لديك حساب؟',
    hasAccount: 'لديك حساب بالفعل؟',
    signupLink: 'إنشاء حساب جديد',
    loginLink: 'تسجيل الدخول',
    googleLogin: 'تسجيل الدخول بحساب جوجل',
    googleSignup: 'التسجيل بحساب جوجل',
    orContinueWith: 'أو المتابعة بواسطة',
    countryRequired: 'يرجى اختيار الدولة',
    
    // Contact
    contactTitle: 'اتصل بنا',
    contactDescription: 'نسعد بتواصلكم معنا. يمكنكم التواصل عبر الطرق التالية:',
    emailLabel: 'البريد الإلكتروني',
    phoneLabel: 'الهاتف',
    followUs: 'تابعنا',
    
    // General
    apps: 'تطبيقات',
    category: 'تصنيف',
    loading: 'جاري التحميل...',
    
    // Footer
    footerText: '© 2026 مجموعة أوبتي. جميع الحقوق محفوظة.',
    
    // Errors
    invalidCredentials: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    emailRequired: 'البريد الإلكتروني مطلوب',
    passwordRequired: 'كلمة المرور مطلوبة',
    passwordMismatch: 'كلمتا المرور غير متطابقتين',
    signupSuccess: 'تم إنشاء الحساب بنجاح!',
    loginSuccess: 'تم تسجيل الدخول بنجاح!',
    
    // Section descriptions
    healthDesc: 'تطبيقات الصحة واللياقة البدنية',
    outingsDesc: 'تطبيقات الخروجات والترفيه',
    aiDesc: 'تطبيقات الذكاء الاصطناعي',
    landmarksDesc: 'تطبيقات المعالم السياحية المصرية',
  },
  en: {
    // Brand
    brandName: 'Opti Group',
    brandNameEn: 'OPTI GROUP',
    
    // Nav
    menu: 'Menu',
    home: 'Home',
    
    // Sections
    healthSection: 'Health Section',
    outingsSection: 'Outings Section',
    aiSection: 'AI Section',
    landmarksSection: 'Egyptian Landmarks Section',
    contactUs: 'Contact Us',
    
    // Hero
    heroTitle: 'Opti Group',
    heroSubtitle: 'Smart Apps for a Better Life',
    heroDescription: 'A comprehensive suite of applications designed to improve your quality of life in health, entertainment, AI, and tourism',
    exploreApps: 'Explore Apps',
    
    // App statuses
    live: 'Live Now',
    comingSoon: 'Coming Soon',
    visit: 'Visit',
    
    // Auth
    login: 'Login',
    signup: 'Sign Up',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    country: 'Country',
    selectCountry: 'Select your country',
    loginButton: 'Login',
    signupButton: 'Sign Up',
    logout: 'Logout',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    signupLink: 'Create new account',
    loginLink: 'Login',
    googleLogin: 'Sign in with Google',
    googleSignup: 'Sign up with Google',
    orContinueWith: 'Or continue with',
    countryRequired: 'Please select a country',
    
    // Contact
    contactTitle: 'Contact Us',
    contactDescription: 'We are happy to hear from you. You can reach us through:',
    emailLabel: 'Email',
    phoneLabel: 'Phone',
    followUs: 'Follow Us',
    
    // General
    apps: 'Apps',
    category: 'Category',
    loading: 'Loading...',
    
    // Footer
    footerText: '© 2026 Opti Group. All rights reserved.',
    
    // Errors
    invalidCredentials: 'Invalid email or password',
    emailRequired: 'Email is required',
    passwordRequired: 'Password is required',
    passwordMismatch: 'Passwords do not match',
    signupSuccess: 'Account created successfully!',
    loginSuccess: 'Logged in successfully!',
    
    // Section descriptions
    healthDesc: 'Health & Fitness Apps',
    outingsDesc: 'Outings & Entertainment Apps',
    aiDesc: 'AI-Powered Apps',
    landmarksDesc: 'Egyptian Landmarks & Tourism Apps',
  },
} as const;

export type TranslationKey = keyof typeof translations.ar;
