'use client';

import { useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import SideMenu from '@/components/SideMenu';
import BackToTop from '@/components/BackToTop';
import { motion } from 'framer-motion';
import { Info, Heart, MapPin, Brain, Landmark, Users, Target, Sparkles } from 'lucide-react';

export default function AboutPage() {
  const { t, locale, dir } = useLanguage();
  const isArabic = locale === 'ar';
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuToggle = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  const handleMenuClose = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const handleNavigate = useCallback((sectionId: string) => {
    // Navigate to home page with section anchor
    window.location.href = `/#${sectionId}`;
  }, []);

  const handleContactClick = useCallback(() => {
    window.location.href = '/#section-contact';
  }, []);

  const values = [
    { icon: Heart, color: '#10b981', titleAr: 'الصحة أولاً', titleEn: 'Health First', descAr: 'نؤمن بأن الصحة هي أساس حياة سعيدة ومنتجة، ونعمل على تقديم أدوات تساعدك في العناية بصحتك.', descEn: 'We believe health is the foundation of a happy and productive life, and we work to provide tools that help you take care of your health.' },
    { icon: Sparkles, color: '#f59e0b', titleAr: 'الابتكار المستمر', titleEn: 'Continuous Innovation', descAr: 'نسعى دائمًا لتقديم حلول مبتكرة تجمع بين التكنولوجيا الحديثة واحتياجات المستخدمين اليومية.', descEn: 'We constantly strive to deliver innovative solutions that combine modern technology with daily user needs.' },
    { icon: Users, color: '#8b5cf6', titleAr: 'تجربة المستخدم', titleEn: 'User Experience', descAr: 'نضع المستخدم في قلب كل ما نصنع، ونهتم بكل تفصيلة تضمن تجربة سهلة ومريحة.', descEn: 'We put the user at the heart of everything we create, caring about every detail to ensure an easy and comfortable experience.' },
    { icon: Target, color: '#f97316', titleAr: 'الجودة والاعتمادية', titleEn: 'Quality & Reliability', descAr: 'نلتزم بأعلى معايير الجودة في تطبيقاتنا لضمان أداء موثوق يلبي توقعاتكم.', descEn: 'We adhere to the highest quality standards in our applications to ensure reliable performance that meets your expectations.' },
  ];

  const sections = [
    { icon: Heart, color: '#10b981', titleAr: 'قسم الصحة', titleEn: 'Health Section', descAr: 'تطبيقات مخصصة لصحة العين واللياقة البدنية والتغذية السليمة. نقدم أدوات متقدمة مثل OptiSize لقياس مسافة البؤبؤ واختبارات النظر الشاملة، مع خطط لتوسيع نطاق تطبيقات الصحة لتشمل التمارين الرياضية المخصصة والتخطيط الغذائي الذكي.', descEn: 'Applications dedicated to eye health, physical fitness, and proper nutrition. We offer advanced tools like OptiSize for PD measurement and comprehensive vision tests, with plans to expand our health apps to include personalized exercise and smart nutritional planning.' },
    { icon: MapPin, color: '#f59e0b', titleAr: 'قسم الخروجات', titleEn: 'Outings Section', descAr: 'تطبيقات تساعدك على اكتشاف أفضل الأماكن والفعاليات القريبة منك وتخطيط خروجات مثالية مع توصيات مخصصة تناسب اهتماماتك وميزانيتك.', descEn: 'Applications that help you discover the best places and events near you and plan perfect outings with personalized recommendations that suit your interests and budget.' },
    { icon: Brain, color: '#8b5cf6', titleAr: 'قسم الذكاء الاصطناعي', titleEn: 'AI Section', descAr: 'تطبيقات تعتمد على أحدث تقنيات الذكاء الاصطناعي لتقديم مساعدات ذكية تُجيب على أسئلتك وتحلل الصور وتوفر رؤى قيمة في مختلف المجالات.', descEn: 'Applications powered by the latest AI technologies to provide intelligent assistants that answer your questions, analyze images, and offer valuable insights across various fields.' },
    { icon: Landmark, color: '#f97316', titleAr: 'قسم المعالم السياحية', titleEn: 'Landmarks Section', descAr: 'تطبيقات تتيح لك استكشاف المعالم السياحية المصرية العريقة بطرق مبتكرة، بما في ذلك الجولات الافتراضية داخل الأهرامات واكتشاف معالم نهر النيل الساحرة.', descEn: 'Applications that let you explore ancient Egyptian landmarks in innovative ways, including virtual tours inside the Pyramids and discovering the enchanting landmarks of the Nile.' },
  ];

  return (
    <div dir={dir} className="min-h-screen flex flex-col" style={{ background: '#0a0e1a' }}>
      <Header onMenuToggle={handleMenuToggle} />
      <SideMenu
        isOpen={isMenuOpen}
        onClose={handleMenuClose}
        onNavigate={handleNavigate}
        onContactClick={handleContactClick}
      />

      <main className="flex-1 pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="pb-8">
            <motion.div
              className={`flex items-center gap-3 mb-4 ${isArabic ? 'flex-row-reverse' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="p-3 rounded-2xl" style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.15)' }}>
                <Info className="w-6 h-6" style={{ color: '#0ea5e9' }} />
              </div>
              <h1 className={`text-2xl sm:text-3xl font-bold ${isArabic ? 'font-arabic text-right' : ''}`}
                style={{
                  background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                {isArabic ? 'من نحن' : 'About Us'}
              </h1>
            </motion.div>
          </div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-8"
          >
            {/* Mission Statement */}
            <div className="p-8 rounded-2xl" style={{
              background: 'linear-gradient(135deg, rgba(14,165,233,0.08), rgba(30,64,175,0.05))',
              border: '1px solid rgba(14,165,233,0.12)',
            }}>
              <p className={`text-base sm:text-lg leading-relaxed ${isArabic ? 'font-arabic text-right' : ''}`} style={{ color: 'rgba(232,232,232,0.85)' }}>
                {isArabic
                  ? 'مجموعة أوبتي هي منوعة تطبيقات مبتكرة تهدف إلى تحسين جودة حياتك اليومية. نجمع بين أحدث تقنيات الذكاء الاصطناعي والتصميم الجذاب لنقدم لك تطبيقات عملية في مجالات الصحة والترفيه والسياحة والتكنولوجيا الذكية. نؤمن بأن التكنولوجيا يجب أن تخدم الإنسان وتسهل حياته، وهذا ما نسعى لتحقيقه في كل تطبيق نصنعه.'
                  : 'Opti Group is a suite of innovative applications designed to improve your daily quality of life. We combine the latest AI technologies with attractive design to bring you practical applications in health, entertainment, tourism, and smart technology. We believe technology should serve people and make their lives easier, and that\'s what we strive to achieve in every app we create.'}
              </p>
            </div>

            {/* Our Values */}
            <div>
              <h2 className={`text-xl font-bold mb-6 ${isArabic ? 'font-arabic text-right' : ''}`} style={{ color: 'rgba(232,232,232,0.9)' }}>
                {isArabic ? 'قيمنا' : 'Our Values'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {values.map((value, index) => {
                  const Icon = value.icon;
                  return (
                    <motion.div
                      key={index}
                      className="p-5 rounded-2xl"
                      style={{
                        background: 'rgba(26, 31, 54, 0.5)',
                        border: `1px solid ${value.color}15`,
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <div className={`flex items-center gap-3 mb-3 ${isArabic ? 'flex-row-reverse' : ''}`}>
                        <div className="p-2 rounded-xl" style={{ background: `${value.color}10`, border: `1px solid ${value.color}20` }}>
                          <Icon className="w-5 h-5" style={{ color: value.color }} />
                        </div>
                        <h3 className={`text-sm font-bold ${isArabic ? 'font-arabic text-right' : ''}`} style={{ color: value.color }}>
                          {isArabic ? value.titleAr : value.titleEn}
                        </h3>
                      </div>
                      <p className={`text-sm leading-relaxed ${isArabic ? 'font-arabic text-right' : ''}`} style={{ color: 'rgba(192,192,192,0.6)' }}>
                        {isArabic ? value.descAr : value.descEn}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Our Sections */}
            <div>
              <h2 className={`text-xl font-bold mb-6 ${isArabic ? 'font-arabic text-right' : ''}`} style={{ color: 'rgba(232,232,232,0.9)' }}>
                {isArabic ? 'أقسامنا' : 'Our Sections'}
              </h2>
              <div className="space-y-4">
                {sections.map((section, index) => {
                  const Icon = section.icon;
                  return (
                    <motion.div
                      key={index}
                      className="p-6 rounded-2xl"
                      style={{
                        background: 'rgba(26, 31, 54, 0.5)',
                        border: `1px solid ${section.color}15`,
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }
                      }
                    >
                      <div className={`flex items-center gap-3 mb-3 ${isArabic ? 'flex-row-reverse' : ''}`}>
                        <div className="p-2.5 rounded-xl" style={{ background: `${section.color}10`, border: `1px solid ${section.color}20` }}>
                          <Icon className="w-5 h-5" style={{ color: section.color }} />
                        </div>
                        <h3 className={`text-base font-bold ${isArabic ? 'font-arabic text-right' : ''}`} style={{ color: section.color }}>
                          {isArabic ? section.titleAr : section.titleEn}
                        </h3>
                      </div>
                      <p className={`text-sm leading-relaxed ${isArabic ? 'font-arabic text-right' : ''}`} style={{ color: 'rgba(192,192,192,0.6)' }}>
                        {isArabic ? section.descAr : section.descEn}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Our Story */}
            <div className="p-6 rounded-2xl" style={{
              background: 'rgba(26, 31, 54, 0.5)',
              border: '1px solid rgba(14,165,233,0.08)',
            }}>
              <h2 className={`text-lg font-bold mb-3 ${isArabic ? 'font-arabic text-right' : ''}`} style={{ color: '#0ea5e9' }}>
                {isArabic ? 'قصتنا' : 'Our Story'}
              </h2>
              <p className={`text-sm leading-relaxed mb-4 ${isArabic ? 'font-arabic text-right' : ''}`} style={{ color: 'rgba(192,192,192,0.7)' }}>
                {isArabic
                  ? 'بدأت مجموعة أوبتي برؤية بسيطة: جعل التكنولوجيا أكثر فائدة وسهولة في الحياة اليومية. من أول تطبيق لنا وهو OptiSize المتخصص في صحة العيون، توسعنا لنقدم مجموعة متنوعة من التطبيقات التي تغطي جوانب متعددة من حياتك. كل تطبيق من تطبيقاتنا مصمم بعناية فائقة ليجمع بين الوظيفة العملية والتصميم الجذاب، مع التركيز على توفير تجربة مستخدم استثنائية تجعل التكنولوجيا في متناول الجميع.'
                  : 'Opti Group started with a simple vision: making technology more useful and accessible in daily life. From our first application, OptiSize, specialized in eye health, we expanded to offer a diverse range of applications covering multiple aspects of your life. Each of our applications is carefully designed to combine practical functionality with attractive design, with a focus on providing an exceptional user experience that makes technology accessible to everyone.'}
              </p>
              <p className={`text-sm leading-relaxed ${isArabic ? 'font-arabic text-right' : ''}`} style={{ color: 'rgba(192,192,192,0.7)' }}>
                {isArabic
                  ? 'نحن نعمل باستمرار على تطوير تطبيقاتنا وإضافة ميزات جديدة بناءً على ملاحظات المستخدمين والاحتياجات المتغيرة. هدفنا هو أن تكون مجموعة أوبتي رفيقك اليومي في كل ما تحتاجه من أدوات ذكية تسهّل حياتك وتثريها.'
                  : 'We continuously work on developing our applications and adding new features based on user feedback and changing needs. Our goal is for Opti Group to be your daily companion with smart tools that simplify and enrich your life.'}
              </p>
            </div>
          </motion.div>
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
