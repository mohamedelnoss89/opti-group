'use client';

import { useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import SideMenu from '@/components/SideMenu';
import BackToTop from '@/components/BackToTop';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, ArrowLeft, User, Share2, Tag, Copy, Check, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { getBlogPostBySlug, type BlogPost } from '@/lib/blog-data';
import { useParams } from 'next/navigation';

const categoryColors: Record<BlogPost['category'], string> = {
  health: '#22c55e',
  ai: '#8b5cf6',
  tourism: '#f59e0b',
  updates: '#ec4899',
  sports: '#ef4444',
  islamic: '#06b6d4',
};

const categoryNames: Record<BlogPost['category'], { ar: string; en: string }> = {
  health: { ar: 'الصحة', en: 'Health' },
  ai: { ar: 'الذكاء الاصطناعي', en: 'AI' },
  tourism: { ar: 'السياحة', en: 'Tourism' },
  updates: { ar: 'التحديثات', en: 'Updates' },
  sports: { ar: 'الرياضة', en: 'Sports' },
  islamic: { ar: 'إسلاميات', en: 'Islamic' },
};

export default function BlogPostPage() {
  const { t, locale, dir } = useLanguage();
  const isArabic = locale === 'ar';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const params = useParams();
  const slug = params.slug as string;
  const post = getBlogPostBySlug(slug);

  const handleMenuToggle = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  const handleMenuClose = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const handleNavigate = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: isArabic ? post?.title.ar : post?.title.en,
          url: window.location.href,
        });
      } catch {
        // user cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  if (!post) {
    return (
      <div dir={dir} className="min-h-screen flex flex-col" style={{ background: '#0a0e1a' }}>
        <Header onMenuToggle={handleMenuToggle} />
        <main className="flex-1 pt-20 pb-16 px-4">
          <div className="max-w-3xl mx-auto text-center py-20">
            <p
              className={`text-lg ${isArabic ? 'font-arabic' : ''}`}
              style={{ color: 'rgba(192,192,192,0.5)' }}
            >
              {isArabic ? 'المقال غير موجود' : 'Article not found'}
            </p>
            <Link
              href="/blog"
              className={`inline-flex items-center gap-2 mt-4 text-sm ${isArabic ? 'font-arabic' : ''}`}
              style={{ color: '#0ea5e9' }}
            >
              {isArabic ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              {t.blogBackToBlog}
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const catColor = categoryColors[post.category];
  const catName = categoryNames[post.category];

  // Parse content into paragraphs
  const paragraphs = (isArabic ? post.content.ar : post.content.en).split('\n').filter((p) => p.trim());

  return (
    <div dir={dir} className="min-h-screen flex flex-col" style={{ background: '#0a0e1a' }}>
      <Header onMenuToggle={handleMenuToggle} />
      <SideMenu
        isOpen={isMenuOpen}
        onClose={handleMenuClose}
        onNavigate={handleNavigate}
        onContactClick={() => handleNavigate('section-contact')}
      />

      <main className="flex-1 pt-20 pb-16 px-4">
        <article className="max-w-3xl mx-auto">
          {/* Back navigation */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, x: isArabic ? 10 : -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Link
              href="/blog"
              className={`inline-flex items-center gap-2 text-sm transition-colors no-underline ${isArabic ? 'font-arabic' : ''}`}
              style={{ color: 'rgba(192,192,192,0.5)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#0ea5e9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(192,192,192,0.5)';
              }}
            >
              {isArabic ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              {t.blogBackToBlog}
            </Link>
          </motion.div>

          {/* Article header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Category */}
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium mb-4 ${isArabic ? 'font-arabic' : ''}`}
              style={{
                background: `${catColor}15`,
                color: catColor,
                border: `1px solid ${catColor}25`,
              }}
            >
              <Tag className="w-3 h-3" />
              {isArabic ? catName.ar : catName.en}
            </span>

            {/* Title */}
            <h1
              className={`text-xl sm:text-2xl lg:text-3xl font-bold mb-4 leading-relaxed ${isArabic ? 'font-arabic text-right' : ''}`}
              style={{ color: 'rgba(232,232,232,0.95)' }}
            >
              {isArabic ? post.title.ar : post.title.en}
            </h1>

            {/* Meta */}
            <div
              className={`flex flex-wrap items-center gap-4 text-xs ${isArabic ? 'flex-row-reverse font-arabic' : ''}`}
              style={{ color: 'rgba(192,192,192,0.4)' }}
            >
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(post.date)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {post.readTime} {t.blogMinRead}
              </span>
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                {isArabic ? post.author.ar : post.author.en}
              </span>
            </div>
          </motion.div>

          {/* Divider */}
          <div className="h-px mb-8" style={{ background: 'rgba(14,165,233,0.08)' }} />

          {/* Medical Disclaimer for health articles */}
          {post.category === 'health' && (
            <motion.div
              className={`mb-6 p-5 rounded-xl text-center ${isArabic ? 'font-arabic' : ''}`}
              style={{
                background: 'rgba(245, 158, 11, 0.06)',
                border: '1px solid rgba(245, 158, 11, 0.15)',
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4" style={{ color: '#f59e0b' }} />
                <p className="text-xs font-bold" style={{ color: '#f59e0b' }}>
                  {isArabic ? 'تنبيه طبي هام' : 'Important Medical Disclaimer'}
                </p>
                <AlertTriangle className="w-4 h-4" style={{ color: '#f59e0b' }} />
              </div>
              <p className="text-xs leading-relaxed max-w-2xl mx-auto" style={{ color: 'rgba(192,192,192,0.6)' }}>
                {isArabic
                  ? 'هذا المقال لأغراض المعلومات والتوعية فقط ولا يُغني عن استشارة الطبيب المختص. لا تُعتبر المعلومات بديلاً عن التشخيص أو العلاج الطبي المهني. يُرجى استشارة طبيبك قبل اتخاذ أي قرار طبي.'
                  : 'This article is for informational and educational purposes only and does not replace professional medical advice. This information is not a substitute for professional diagnosis or treatment. Please consult your doctor before making any medical decisions.'
                }
              </p>
            </motion.div>
          )}

          {/* Article content */}
          <motion.div
            className={`space-y-5 ${isArabic ? 'font-arabic text-right' : ''}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {paragraphs.map((paragraph, idx) => (
              <p
                key={idx}
                className="text-sm sm:text-base leading-[1.9]"
                style={{ color: 'rgba(192,192,192,0.65)' }}
              >
                {paragraph.trim()}
              </p>
            ))}
          </motion.div>

          {/* Author card */}
          <motion.div
            className="mt-12 rounded-2xl p-6"
            style={{
              background: 'rgba(26, 31, 54, 0.5)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(14,165,233,0.08)',
            }}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <div className={`flex items-center gap-4 ${isArabic ? 'flex-row-reverse' : ''}`}>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'rgba(14,165,233,0.1)',
                  border: '1px solid rgba(14,165,233,0.2)',
                }}
              >
                <User className="w-5 h-5" style={{ color: '#0ea5e9' }} />
              </div>
              <div className={isArabic ? 'text-right' : 'text-left'}>
                <p
                  className={`text-sm font-semibold ${isArabic ? 'font-arabic' : ''}`}
                  style={{ color: 'rgba(232,232,232,0.9)' }}
                >
                  {isArabic ? post.author.ar : post.author.en}
                </p>
                <p
                  className={`text-xs ${isArabic ? 'font-arabic' : ''}`}
                  style={{ color: 'rgba(192,192,192,0.4)' }}
                >
                  {isArabic ? post.authorRole.ar : post.authorRole.en}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Share section */}
          <motion.div
            className="mt-8 flex items-center gap-3"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
          >
            <span
              className={`text-xs ${isArabic ? 'font-arabic' : ''}`}
              style={{ color: 'rgba(192,192,192,0.35)' }}
            >
              {isArabic ? 'مشاركة:' : 'Share:'}
            </span>
            <button
              onClick={handleShare}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${isArabic ? 'font-arabic' : ''}`}
              style={{
                background: 'rgba(14,165,233,0.08)',
                border: '1px solid rgba(14,165,233,0.12)',
                color: '#0ea5e9',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(14,165,233,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(14,165,233,0.08)';
              }}
            >
              <Share2 className="w-3 h-3" />
              {isArabic ? 'مشاركة' : 'Share'}
            </button>
            <button
              onClick={handleCopyLink}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${isArabic ? 'font-arabic' : ''}`}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(14,165,233,0.08)',
                color: copied ? '#22c55e' : 'rgba(192,192,192,0.5)',
              }}
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied
                ? (isArabic ? 'تم النسخ!' : 'Copied!')
                : (isArabic ? 'نسخ الرابط' : 'Copy Link')}
            </button>
          </motion.div>
        </article>
      </main>

      {/* Footer */}
      <footer
        className="py-8 px-4"
        style={{
          background: 'rgba(10, 14, 26, 0.9)',
          borderTop: '1px solid rgba(192,192,192,0.06)',
        }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <p
            className={`text-xs ${isArabic ? 'font-arabic' : ''}`}
            style={{ color: 'rgba(192,192,192,0.2)' }}
          >
            {t.footerText}
          </p>
        </div>
      </footer>

      <BackToTop />
    </div>
  );
}
