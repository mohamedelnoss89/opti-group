'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, ArrowLeft, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { blogPosts } from '@/lib/blog-data';

const categoryColors: Record<string, string> = {
  health: '#22c55e',
  ai: '#8b5cf6',
  tourism: '#f59e0b',
  updates: '#ec4899',
  sports: '#ef4444',
  islamic: '#06b6d4',
};

const categoryLabels: Record<string, { ar: string; en: string }> = {
  health: { ar: 'الصحة', en: 'Health' },
  ai: { ar: 'الذكاء الاصطناعي', en: 'AI' },
  tourism: { ar: 'السياحة', en: 'Tourism' },
  updates: { ar: 'التحديثات', en: 'Updates' },
  sports: { ar: 'الرياضة', en: 'Sports' },
  islamic: { ar: 'إسلاميات', en: 'Islamic' },
};

export default function BlogPreviewSection() {
  const { t, locale } = useLanguage();
  const isArabic = locale === 'ar';

  // Show the 3 most recent articles
  const recentPosts = blogPosts.slice(-3).reverse();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <section id="section-blog" className="relative py-20 px-4">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(14,165,233,0.04), transparent 70%)',
      }} />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <BookOpen className="w-6 h-6" style={{ color: '#0ea5e9' }} />
            <h2
              className={`text-xl sm:text-2xl font-bold ${isArabic ? 'font-arabic' : ''}`}
              style={{
                background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {isArabic ? 'أحدث المقالات' : 'Latest Articles'}
            </h2>
          </div>
          <p
            className={`text-sm ${isArabic ? 'font-arabic' : ''}`}
            style={{ color: 'rgba(192,192,192,0.5)' }}
          >
            {isArabic
              ? 'اقرأ أحدث المقالات والأخبار من مجموعة أوبتي'
              : 'Read the latest articles and news from Opti Group'}
          </p>
        </motion.div>

        {/* Blog Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {recentPosts.map((post, index) => {
            const catColor = categoryColors[post.category] || '#0ea5e9';
            const catLabel = categoryLabels[post.category] || { ar: post.category, en: post.category };

            return (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Link href={`/blog/${post.slug}`} className="block no-underline">
                  <div
                    className="rounded-2xl p-6 h-full transition-all"
                    style={{
                      background: 'rgba(26, 31, 54, 0.5)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(14,165,233,0.08)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(14,165,233,0.25)';
                      e.currentTarget.style.boxShadow = '0 8px 32px rgba(14,165,233,0.06)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(14,165,233,0.08)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {/* Category badge */}
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium mb-4 ${isArabic ? 'font-arabic' : ''}`}
                      style={{
                        background: `${catColor}15`,
                        color: catColor,
                        border: `1px solid ${catColor}25`,
                      }}
                    >
                      {isArabic ? catLabel.ar : catLabel.en}
                    </span>

                    {/* Title */}
                    <h3
                      className={`text-sm font-bold mb-3 leading-relaxed ${isArabic ? 'font-arabic text-right' : ''}`}
                      style={{ color: 'rgba(232,232,232,0.9)' }}
                    >
                      {isArabic ? post.title.ar : post.title.en}
                    </h3>

                    {/* Excerpt */}
                    <p
                      className={`text-xs leading-relaxed mb-4 ${isArabic ? 'font-arabic text-right' : ''}`}
                      style={{ color: 'rgba(192,192,192,0.5)' }}
                    >
                      {(isArabic ? post.excerpt.ar : post.excerpt.en).substring(0, 100)}...
                    </p>

                    {/* Meta */}
                    <div
                      className={`flex items-center gap-3 text-xs ${isArabic ? 'flex-row-reverse font-arabic' : ''}`}
                      style={{ color: 'rgba(192,192,192,0.35)' }}
                    >
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(post.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime} {t.blogMinRead}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* View All Button */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link
            href="/blog"
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all no-underline ${isArabic ? 'font-arabic' : ''}`}
            style={{
              background: 'rgba(14,165,233,0.08)',
              border: '1px solid rgba(14,165,233,0.15)',
              color: '#0ea5e9',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(14,165,233,0.15)';
              e.currentTarget.style.borderColor = 'rgba(14,165,233,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(14,165,233,0.08)';
              e.currentTarget.style.borderColor = 'rgba(14,165,233,0.15)';
            }}
          >
            <BookOpen className="w-4 h-4" />
            <span>{isArabic ? 'عرض جميع المقالات' : 'View All Articles'}</span>
            {isArabic ? (
              <ArrowLeft className="w-4 h-4" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
