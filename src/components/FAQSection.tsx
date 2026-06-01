'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: { ar: string; en: string };
  answer: { ar: string; en: string };
}

const faqItems: FAQItem[] = [
  {
    question: {
      ar: 'ما هي مجموعة أوبتي؟',
      en: 'What is Opti Group?',
    },
    answer: {
      ar: 'مجموعة أوبتي هي شركة تقنية متخصصة في تطوير تطبيقات ذكية تهدف لتحسين جودة حياتك. نقدم مجموعة متكاملة من التطبيقات في مجالات الصحة والخروجات والذكاء الاصطناعي والسياحة، مصممة خصيصاً لتلبية احتياجاتك اليومية.',
      en: 'Opti Group is a technology company specializing in developing smart applications aimed at improving your quality of life. We offer a comprehensive suite of apps in health, outings, artificial intelligence, and tourism, designed specifically to meet your daily needs.',
    },
  },
  {
    question: {
      ar: 'هل التطبيقات مجانية؟',
      en: 'Are the apps free?',
    },
    answer: {
      ar: 'نعم، جميع تطبيقاتنا الأساسية مجانية للاستخدام. نقدم ميزات أساسية مجانية بالكامل مع خيارات اشتراك مميز للحصول على ميزات إضافية ومحتوى حصري. يمكنك الاستمتاع بمعظم الوظائف دون أي تكلفة.',
      en: 'Yes, all our core applications are free to use. We offer fully free basic features with premium subscription options for additional features and exclusive content. You can enjoy most functionalities without any cost.',
    },
  },
  {
    question: {
      ar: 'كيف أسجل حساباً جديداً؟',
      en: 'How do I create a new account?',
    },
    answer: {
      ar: 'يمكنك إنشاء حساب بسهولة عن طريق النقر على زر "إنشاء حساب" في أعلى الصفحة. يمكنك التسجيل باستخدام بريدك الإلكتروني أو حساب جوجل. التسجيل سريع ويستغرق أقل من دقيقة.',
      en: 'You can easily create an account by clicking the "Sign Up" button at the top of the page. You can register using your email or Google account. Registration is quick and takes less than a minute.',
    },
  },
  {
    question: {
      ar: 'ما التطبيقات المتاحة حالياً؟',
      en: 'What apps are currently available?',
    },
    answer: {
      ar: 'حالياً تطبيق أوبتي سايز (OptiSize) متاح وهو مركز شامل لصحة العين يشمل قياس مسافة البؤبؤ واختبارات النظر ومعرض النظارات. نعمل على إطلاق المزيد من التطبيقات قريباً في مجالات اللياقة والتغذية والرحلات والذكاء الاصطناعي والسياحة.',
      en: 'Currently, OptiSize is available — a comprehensive eye health center that includes PD measurement, vision tests, and a glasses gallery. We are working on launching more apps soon in fitness, nutrition, trips, AI, and tourism.',
    },
  },
  {
    question: {
      ar: 'هل بياناتي آمنة؟',
      en: 'Is my data safe?',
    },
    answer: {
      ar: 'بالتأكيد! نأخذ خصوصية بياناتك على محمل الجد. نستخدم أحدث تقنيات التشفير وحماية البيانات، ولا نشارك معلوماتك الشخصية مع أي طرف ثالث. يمكنك مراجعة سياسة الخصوصية الخاصة بنا لمزيد من التفاصيل.',
      en: 'Absolutely! We take your data privacy very seriously. We use the latest encryption and data protection technologies, and we never share your personal information with any third party. You can review our privacy policy for more details.',
    },
  },
  {
    question: {
      ar: 'كيف يمكنني التواصل معكم؟',
      en: 'How can I contact you?',
    },
    answer: {
      ar: 'يمكنك التواصل معنا عبر نموذج الاتصال في صفحة "اتصل بنا"، أو عبر البريد الإلكتروني contact@optigroup.app، أو من خلال حساباتنا على وسائل التواصل الاجتماعي. نسعد بتلقي استفساراتكم واقتراحاتكم.',
      en: 'You can reach us through the contact form on our "Contact Us" page, via email at contact@optigroup.app, or through our social media accounts. We are happy to receive your inquiries and suggestions.',
    },
  },
];

export default function FAQSection() {
  const { locale } = useLanguage();
  const isArabic = locale === 'ar';
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(prev => prev === index ? null : index);
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

      <div className="max-w-3xl mx-auto relative z-10">
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
            <HelpCircle className="w-7 h-7" style={{ color: '#0ea5e9' }} />
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
            {isArabic ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
          </h2>
          <p
            className={`text-sm ${isArabic ? 'font-arabic' : ''}`}
            style={{ color: 'rgba(192,192,192,0.4)' }}
          >
            {isArabic ? 'إجابات على أكثر الأسئلة شيوعاً' : 'Answers to the most common questions'}
          </p>
        </motion.div>

        {/* FAQ items */}
        <div className="space-y-3">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={index}
                className="rounded-2xl overflow-hidden"
                style={{
                  background: 'rgba(26, 31, 54, 0.4)',
                  backdropFilter: 'blur(12px)',
                  border: `1px solid ${isOpen ? 'rgba(14,165,233,0.25)' : 'rgba(14,165,233,0.08)'}`,
                  boxShadow: isOpen ? '0 8px 32px rgba(14,165,233,0.06)' : 'none',
                  transition: 'border-color 0.3s, box-shadow 0.3s',
                }}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
              >
                {/* Question */}
                <button
                  className={`w-full flex items-center justify-between gap-4 p-5 text-left cursor-pointer ${isArabic ? 'flex-row-reverse text-right' : ''}`}
                  onClick={() => toggleItem(index)}
                  aria-expanded={isOpen}
                >
                  <span
                    className={`text-sm font-semibold ${isArabic ? 'font-arabic' : ''}`}
                    style={{ color: isOpen ? '#0ea5e9' : 'rgba(232,232,232,0.85)' }}
                  >
                    {isArabic ? item.question.ar : item.question.en}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown
                      className="w-4 h-4"
                      style={{ color: isOpen ? '#0ea5e9' : 'rgba(192,192,192,0.4)' }}
                    />
                  </motion.div>
                </button>

                {/* Answer */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div
                        className={`px-5 pb-5 pt-0 ${isArabic ? 'text-right' : ''}`}
                        style={{ borderTop: '1px solid rgba(14,165,233,0.08)' }}
                      >
                        <div className="pt-4">
                          <p
                            className={`text-sm leading-relaxed ${isArabic ? 'font-arabic' : ''}`}
                            style={{ color: 'rgba(192,192,192,0.55)' }}
                          >
                            {isArabic ? item.answer.ar : item.answer.en}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
