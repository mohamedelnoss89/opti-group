'use client';

import { useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import SideMenu from '@/components/SideMenu';
import BackToTop from '@/components/BackToTop';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, ArrowLeft, Tag, Rss } from 'lucide-react';
import Link from 'next/link';
import { blogPosts, getBlogPostsByCategory, type BlogPost } from '@/lib/blog-data';

type CategoryFilter = 'all' | 'health' | 'ai' | 'tourism' | 'updates';

const categoryConfig: Record<CategoryFilter, { ar: string; en: string; color: string }> = {
  all: { ar: 'الكل', en: 'All', color: '#0ea5e9' },
  health: { ar: 'الصحة', en: 'Health', color: '#22c55e' },
  ai: { ar: 'الذكاء الاصطناعي', en: 'AI', color: '#8b5cf6' },
  tourism: { ar: 'السياحة', en: 'Tourism', color: '#f59e0b' },
  updates: { ar: 'التحديثات', en: 'Updates', color: '#ec4899' },
};

const categoryColors: Record<BlogPost['category'], string> = {
  health: '#22c55e',
  ai: '#8b5cf6',
  tourism: '#f59e0b',
  updates: '#ec4899',
};

export default function BlogPage() {
  const { t, locale, dir } = useLanguage();
  const isArabic = locale === 'ar';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');

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

  const filteredPosts = getBlogPostsByCategory(activeCategory);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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
        <div className="max-w-6xl mx-auto">
          {/* Page header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-center gap-3 mb-3">
              <h1
                className={`text-2xl sm:text-3xl font-bold ${isArabic ? 'font-arabic' : ''}`}
                style={{
                  background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {t.blogTitle}
              </h1>
              <a
                href="/feed.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg transition-colors no-underline"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(14,165,233,0.1)',
                }}
                title={t.blogRss}
              >
                <Rss className="w-4 h-4" style={{ color: '#0ea5e9' }} />
              </a>
            </div>
            <p
              className={`text-sm ${isArabic ? 'font-arabic' : ''}`}
              style={{ color: 'rgba(192,192,192,0.5)' }}
            >
              {t.blogSubtitle}
            </p>
          </motion.div>

          {/* Category filter */}
          <motion.div
            className="flex flex-wrap justify-center gap-2 mb-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {(Object.keys(categoryConfig) as CategoryFilter[]).map((cat) => {
              const config = categoryConfig[cat];
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${isArabic ? 'font-arabic' : ''}`}
                  style={{
                    background: isActive ? `${config.color}20` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isActive ? `${config.color}40` : 'rgba(14,165,233,0.08)'}`,
                    color: isActive ? config.color : 'rgba(192,192,192,0.5)',
                  }}
                >
                  {isArabic ? config.ar : config.en}
                </button>
              );
            })}
          </motion.div>

          {/* Blog grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post, index) => {
              const catColor = categoryColors[post.category];
              return (
                <motion.div
                  key={post.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
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
                      {/* Category tag */}
                      <div className="flex items-center gap-2 mb-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${isArabic ? 'font-arabic' : ''}`}
                          style={{
                            background: `${catColor}15`,
                            color: catColor,
                            border: `1px solid ${catColor}25`,
                          }}
                        >
                          <Tag className="w-3 h-3" />
                          {isArabic
                            ? categoryConfig[post.category].ar
                            : categoryConfig[post.category].en}
                        </span>
                      </div>

                      {/* Title */}
                      <h3
                        className={`text-base font-bold mb-3 leading-relaxed ${isArabic ? 'font-arabic text-right' : ''}`}
                        style={{ color: 'rgba(232,232,232,0.9)' }}
                      >
                        {isArabic ? post.title.ar : post.title.en}
                      </h3>

                      {/* Excerpt */}
                      <p
                        className={`text-xs leading-relaxed mb-4 ${isArabic ? 'font-arabic text-right' : ''}`}
                        style={{ color: 'rgba(192,192,192,0.5)' }}
                      >
                        {(isArabic ? post.excerpt.ar : post.excerpt.en).substring(0, 120)}...
                      </p>

                      {/* Meta */}
                      <div
                        className={`flex items-center gap-4 text-xs ${isArabic ? 'flex-row-reverse font-arabic' : ''}`}
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

                      {/* Read more */}
                      <div
                        className={`flex items-center gap-1 mt-4 text-xs font-medium ${isArabic ? 'flex-row-reverse font-arabic' : ''}`}
                        style={{ color: '#0ea5e9' }}
                      >
                        <span>{t.blogReadMore}</span>
                        {isArabic ? (
                          <ArrowLeft className="w-3 h-3" />
                        ) : (
                          <ArrowRight className="w-3 h-3" />
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Empty state */}
          {filteredPosts.length === 0 && (
            <div className="text-center py-16">
              <p
                className={`text-sm ${isArabic ? 'font-arabic' : ''}`}
                style={{ color: 'rgba(192,192,192,0.4)' }}
              >
                {isArabic ? 'لا توجد مقالات في هذا التصنيف' : 'No articles in this category'}
              </p>
            </div>
          )}
        </div>
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
