'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';

interface Testimonial {
  name: { ar: string; en: string };
  rating: number;
  text: { ar: string; en: string };
  app: { ar: string; en: string };
  initial: string;
  color: string;
}

const testimonials: Testimonial[] = [
  {
    name: { ar: 'أحمد محمد', en: 'Ahmed Mohamed' },
    rating: 5,
    text: {
      ar: 'تطبيق أوبتي سايز غيّر طريقة اهتمامي بصحة عيني. قياس مسافة البؤبؤ كان دقيقاً جداً واختبارات النظر سهلت عليّ معرفة حالتي. أنصح به بشدة!',
      en: 'OptiSize changed how I care for my eye health. The PD measurement was very accurate and the vision tests made it easy to understand my condition. Highly recommended!',
    },
    app: { ar: 'أوبتي سايز', en: 'OptiSize' },
    initial: 'أ',
    color: '#0ea5e9',
  },
  {
    name: { ar: 'سارة علي', en: 'Sara Ali' },
    rating: 5,
    text: {
      ar: 'تجربة رائعة مع معرض النظارات! تمكنت من تجربة نظارات متعددة افتراضياً قبل الشراء. التوصيات كانت ذكية ومناسبة لشكل وجهي.',
      en: 'Amazing experience with the glasses gallery! I was able to try on multiple glasses virtually before purchasing. The recommendations were smart and suited my face shape.',
    },
    app: { ar: 'أوبتي سايز', en: 'OptiSize' },
    initial: 'س',
    color: '#8b5cf6',
  },
  {
    name: { ar: 'محمود حسن', en: 'Mahmoud Hassan' },
    rating: 4,
    text: {
      ar: 'أستطيع الانتظار لإطلاق تطبيق أوبتي شات! فكرة مساعد ذكي يجيب على أسئلتي بالعربية رائعة. سيكون مفيداً جداً للدراسة والعمل.',
      en: "I can't wait for OptiChat to launch! The idea of a smart assistant that answers my questions in Arabic is amazing. It will be very useful for study and work.",
    },
    app: { ar: 'أوبتي شات', en: 'OptiChat' },
    initial: 'م',
    color: '#f59e0b',
  },
  {
    name: { ar: 'نور الدين', en: 'Nour El-Din' },
    rating: 5,
    text: {
      ar: 'فكرة الجولة الافتراضية داخل الأهرامات مبتكرة جداً! كمصري أفتخر بهذا التطبيق الذي يعرض حضارتنا بتقنية عالية. سيساعد السياح كثيراً.',
      en: 'The virtual tour inside the Pyramids is very innovative! As an Egyptian, I am proud of this app that showcases our civilization with high technology. It will help tourists a lot.',
    },
    app: { ar: 'أوبتي باير', en: 'OptiPyr' },
    initial: 'ن',
    color: '#22c55e',
  },
  {
    name: { ar: 'فاطمة يوسف', en: 'Fatma Youssef' },
    rating: 4,
    text: {
      ar: 'مجموعة أوبتي تقدم رؤية مستقبلية رائعة لتطبيقات تخدم حياتنا اليومية. من الصحة إلى السياحة، كل التطبيقات مصممة بعناية. أتمنى لهم التوفيق!',
      en: 'Opti Group presents a great futuristic vision for apps that serve our daily lives. From health to tourism, every app is carefully designed. I wish them success!',
    },
    app: { ar: 'مجموعة أوبتي', en: 'Opti Group' },
    initial: 'ف',
    color: '#ec4899',
  },
];

export default function TestimonialsSection() {
  const { locale } = useLanguage();
  const isArabic = locale === 'ar';
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(0);

  const goToSlide = useCallback((index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  }, [currentIndex]);

  const goNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, []);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, []);

  // Auto-rotate
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(goNext, 5000);
    return () => clearInterval(interval);
  }, [isPaused, goNext]);

  const current = testimonials[currentIndex];

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -100 : 100,
      opacity: 0,
    }),
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className="w-4 h-4"
            style={{
              color: star <= rating ? '#eab308' : 'rgba(192,192,192,0.2)',
              fill: star <= rating ? '#eab308' : 'none',
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <section className="relative py-16 px-4">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(14,165,233,0.03), transparent 70%)',
        }}
      />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Section header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{
              background: 'rgba(14,165,233,0.1)',
              border: '1px solid rgba(14,165,233,0.15)',
            }}
          >
            <Quote className="w-7 h-7" style={{ color: '#0ea5e9' }} />
          </div>
          <h2
            className={`text-xl sm:text-2xl font-bold mb-2 ${isArabic ? 'font-arabic' : ''}`}
            style={{
              background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {isArabic ? 'ماذا يقول مستخدمونا' : 'What Our Users Say'}
          </h2>
          <p
            className={`text-sm ${isArabic ? 'font-arabic' : ''}`}
            style={{ color: 'rgba(192,192,192,0.4)' }}
          >
            {isArabic ? 'آراء حقيقية من مستخدمين يثقون في تطبيقاتنا' : 'Real reviews from users who trust our apps'}
          </p>
        </motion.div>

        {/* Testimonial card */}
        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            className="rounded-3xl p-8 sm:p-10 min-h-[260px] flex flex-col justify-center overflow-hidden"
            style={{
              background: 'rgba(26, 31, 54, 0.5)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(14,165,233,0.12)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.2), 0 0 40px rgba(14,165,233,0.04)',
            }}
          >
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className={`flex flex-col items-center text-center ${isArabic ? 'font-arabic' : ''}`}
              >
                {/* Quote icon */}
                <div className="mb-4">
                  <Quote
                    className="w-8 h-8"
                    style={{ color: 'rgba(14,165,233,0.2)' }}
                  />
                </div>

                {/* Review text */}
                <p
                  className={`text-sm sm:text-base leading-relaxed mb-6 max-w-2xl ${isArabic ? 'text-right' : 'text-left'}`}
                  style={{ color: 'rgba(192,192,192,0.65)' }}
                >
                  &ldquo;{isArabic ? current.text.ar : current.text.en}&rdquo;
                </p>

                {/* Stars */}
                <div className="mb-4">
                  {renderStars(current.rating)}
                </div>

                {/* User info */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `${current.color}15`,
                      border: `1px solid ${current.color}25`,
                    }}
                  >
                    <span
                      style={{ color: current.color, fontSize: '14px', fontWeight: 700 }}
                    >
                      {isArabic ? current.initial : current.name.en.charAt(0)}
                    </span>
                  </div>
                  <div className={`${isArabic ? 'text-right' : 'text-left'}`}>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: 'rgba(232,232,232,0.9)' }}
                    >
                      {isArabic ? current.name.ar : current.name.en}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: 'rgba(14,165,233,0.6)' }}
                    >
                      {isArabic ? current.app.ar : current.app.en}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation arrows */}
          <button
            onClick={goPrev}
            className={`absolute top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all cursor-pointer ${isArabic ? 'right-2 sm:-right-4' : 'left-2 sm:-left-4'}`}
            style={{
              background: 'rgba(26, 31, 54, 0.8)',
              border: '1px solid rgba(14,165,233,0.15)',
            }}
            aria-label="Previous testimonial"
          >
            {isArabic ? (
              <ChevronRight className="w-4 h-4" style={{ color: 'rgba(192,192,192,0.6)' }} />
            ) : (
              <ChevronLeft className="w-4 h-4" style={{ color: 'rgba(192,192,192,0.6)' }} />
            )}
          </button>
          <button
            onClick={goNext}
            className={`absolute top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all cursor-pointer ${isArabic ? 'left-2 sm:-left-4' : 'right-2 sm:-right-4'}`}
            style={{
              background: 'rgba(26, 31, 54, 0.8)',
              border: '1px solid rgba(14,165,233,0.15)',
            }}
            aria-label="Next testimonial"
          >
            {isArabic ? (
              <ChevronLeft className="w-4 h-4" style={{ color: 'rgba(192,192,192,0.6)' }} />
            ) : (
              <ChevronRight className="w-4 h-4" style={{ color: 'rgba(192,192,192,0.6)' }} />
            )}
          </button>
        </div>

        {/* Dots navigation */}
        <div className="flex justify-center gap-2 mt-6">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className="cursor-pointer transition-all duration-300"
              aria-label={`Go to testimonial ${index + 1}`}
            >
              <div
                className="rounded-full transition-all duration-300"
                style={{
                  width: index === currentIndex ? '24px' : '8px',
                  height: '8px',
                  background: index === currentIndex
                    ? 'linear-gradient(135deg, #0ea5e9, #38bdf8)'
                    : 'rgba(192,192,192,0.2)',
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
