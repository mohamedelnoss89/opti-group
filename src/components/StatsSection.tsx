'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Smartphone, Users, Download, LayoutGrid } from 'lucide-react';

interface StatItem {
  icon: React.ReactNode;
  targetValue: number;
  suffix: string;
  labelAr: string;
  labelEn: string;
}

const stats: StatItem[] = [
  {
    icon: <Smartphone className="w-6 h-6" />,
    targetValue: 15,
    suffix: '+',
    labelAr: 'تطبيق',
    labelEn: 'Apps',
  },
  {
    icon: <Users className="w-6 h-6" />,
    targetValue: 10,
    suffix: 'K+',
    labelAr: 'مستخدم',
    labelEn: 'Users',
  },
  {
    icon: <Download className="w-6 h-6" />,
    targetValue: 50,
    suffix: 'K+',
    labelAr: 'تحميل',
    labelEn: 'Downloads',
  },
  {
    icon: <LayoutGrid className="w-6 h-6" />,
    targetValue: 6,
    suffix: '',
    labelAr: 'أقسام',
    labelEn: 'Sections',
  },
];

function AnimatedCounter({ targetValue, suffix, isVisible }: { targetValue: number; suffix: string; isVisible: boolean }) {
  const [count, setCount] = useState(0);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const duration = 2000; // 2 seconds

  const animate = useCallback((timestamp: number) => {
    if (startTimeRef.current === null) {
      startTimeRef.current = timestamp;
    }
    const elapsed = timestamp - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);

    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * targetValue);
    setCount(current);

    if (progress < 1) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [targetValue]);

  useEffect(() => {
    if (isVisible) {
      startTimeRef.current = null;
      animationRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isVisible, animate]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
}

export default function StatsSection() {
  const { locale } = useLanguage();
  const isArabic = locale === 'ar';
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    const currentRef = sectionRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [isVisible]);

  return (
    <section ref={sectionRef} className="relative py-16 px-4">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(14,165,233,0.03), transparent 70%)',
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section title */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2
            className={`text-xl sm:text-2xl font-bold mb-2 ${isArabic ? 'font-arabic' : ''}`}
            style={{
              background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {isArabic ? 'أرقامنا تتحدث' : 'Our Numbers Speak'}
          </h2>
          <p
            className={`text-sm ${isArabic ? 'font-arabic' : ''}`}
            style={{ color: 'rgba(192,192,192,0.4)' }}
          >
            {isArabic ? 'إنجازاتنا بالأرقام' : 'Our achievements in numbers'}
          </p>
          <p
            className={`text-xs mt-2 ${isArabic ? 'font-arabic' : ''}`}
            style={{ color: 'rgba(14,165,233,0.5)' }}
          >
            {isArabic ? 'وَإِن تَعُدُّوا نِعْمَةَ اللَّهِ لَا تُحْصُوهَا' : 'If you count the blessings of Allah, you cannot count them'}
          </p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="relative rounded-2xl p-6 text-center"
              style={{
                background: 'rgba(26, 31, 54, 0.4)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(14,165,233,0.1)',
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.12 }}
              whileHover={{
                borderColor: 'rgba(14,165,233,0.25)',
                boxShadow: '0 8px 32px rgba(14,165,233,0.06)',
                y: -2,
              }}
            >
              {/* Icon */}
              <div
                className="mx-auto mb-3 w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  background: 'rgba(14,165,233,0.1)',
                  border: '1px solid rgba(14,165,233,0.15)',
                }}
              >
                <span style={{ color: '#0ea5e9' }}>{stat.icon}</span>
              </div>

              {/* Number */}
              <div
                className="text-3xl sm:text-4xl font-bold mb-1.5"
                style={{
                  background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                <AnimatedCounter
                  targetValue={stat.targetValue}
                  suffix={stat.suffix}
                  isVisible={isVisible}
                />
              </div>

              {/* Label */}
              <p
                className={`text-sm font-medium ${isArabic ? 'font-arabic' : ''}`}
                style={{ color: 'rgba(192,192,192,0.5)' }}
              >
                {isArabic ? stat.labelAr : stat.labelEn}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
