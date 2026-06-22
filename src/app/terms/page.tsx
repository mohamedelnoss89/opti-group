'use client';

import { useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import SideMenu from '@/components/SideMenu';
import BackToTop from '@/components/BackToTop';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

export default function TermsPage() {
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
    window.location.href = `/#${sectionId}`;
  }, []);

  const handleContactClick = useCallback(() => {
    window.location.href = '/#section-contact';
  }, []);

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
                <FileText className="w-6 h-6" style={{ color: '#0ea5e9' }} />
              </div>
              <h1 className={`text-2xl sm:text-3xl font-bold ${isArabic ? 'font-arabic text-right' : ''}`}
                style={{
                  background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                {isArabic ? 'شروط الاستخدام' : 'Terms of Service'}
              </h1>
            </motion.div>
            <p className={`text-sm ${isArabic ? 'font-arabic text-right' : ''}`} style={{ color: 'rgba(192,192,192,0.5)' }}>
              {isArabic ? 'آخر تحديث: يونيو 2026' : 'Last updated: June 2026'}
            </p>
          </div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-8"
          >
            {isArabic ? (
              <>
                <Section title="قبول الشروط">
                  باستخدامكم لمواقع وتطبيقات مجموعة أوبتي، فإنكم توافقون على الالتزام بهذه الشروط والأحكام. إذا لم توافقوا على أي جزء من هذه الشروط، يرجى عدم استخدام خدماتنا. يستمر استخدامكم لخدماتنا بعد نشر أي تغييرات على هذه الشروط يشكل موافقة منكم على تلك التغييرات.
                </Section>

                <Section title="وصف الخدمة">
                  تقدم مجموعة أوبتي مجموعة من التطبيقات والخدمات الرقمية في مجالات الصحة والترفيه والذكاء الاصطناعي والسياحة. تشمل خدماتنا حاليًا تطبيق OptiSize لصحة العيون، مع خطط لإطلاق تطبيقات إضافية في المستقبل. نحتفظ بالحق في تعديل أو إيقاف أي خدمة في أي وقت دون إشعار مسبق.
                </Section>

                <Section title="حسابات المستخدمين">
                  لاستخدام بعض ميزاتنا، قد تحتاجون إلى إنشاء حساب. أنتم مسؤولون عن: تقديم معلومات صحيحة وكاملة عند إنشاء حسابكم، والحفاظ على سرية كلمة المرور الخاصة بكم، وجميع الأنشطة التي تتم تحت حسابكم. يجب إخطارنا فورًا بأي استخدام غير مصرح به لحسابكم. لا نتحمل مسؤولية أي خسائر ناتجة عن استخدام غير مصرح به لحسابكم.
                </Section>

                <Section title="السلوك المقبول">
                  عند استخدام خدماتنا، توافقون على عدم: استخدام خدماتنا لأي غرض غير قانوني أو غير مصرح به، أو محاولة الوصول غير المصرح به إلى أنظمتنا أو حسابات المستخدمين الآخرين، أو إرسال أو نشر محتوى ضار أو مسيء أو غير لائق، أو التدخل في عمل خدماتنا أو تعطيلها، أو استخدام خدماتنا بطريقة قد تضر بمستخدمين آخرين أو بأطراف ثالثة، أو نسخ أو توزيع أو بيع أي جزء من خدماتنا دون إذن كتابي مسبق.
                </Section>

                <Section title="المحتوى والملكية الفكرية">
                  جميع المحتوى والتصاميم والشعارات والأكواد والرسومات الموجودة على مواقعنا وتطبيقاتنا هي ملك لمجموعة أوبتي ومحمية بموجب قوانين الملكية الفكرية المعمول بها. يُحظر نسخ أو توزيع أو تعديل أي محتوى من خدماتنا دون إذن كتابي مسبق منا. العلامات التجارية والأسماء التجارية المستخدمة في خدماتنا هي ملك لأصحابها المعنيين.
                </Section>

                <Section title="إخلاء المسؤولية">
                  تُقدم خدماتنا &quot;كما هي&quot; و&quot;حسب التوفر&quot; دون أي ضمانات صريحة أو ضمنية. لا نضمن أن خدماتنا ستكون متاحة بشكل مستمر أو خالية من الأخطاء. لا نتحمل مسؤولية أي أضرار مباشرة أو غير مباشرة ناتجة عن استخدام خدماتنا أو عدم القدرة على استخدامها. المعلومات الصحية المقدمة في تطبيقاتنا هي لأغراض معلوماتية فقط ولا تغني عن استشارة الطبيب المختص.
                </Section>

                <Section title="الإعلانات">
                  قد تعرض خدماتنا إعلانات من أطراف ثالثة مثل Google AdSense. نحن لا نتحمل مسؤولية محتوى هذه الإعلانات أو دقتها. تفاعلكم مع هذه الإعلانات يخضع لشروط وأحكام المعلنين المعنيين وسياسات الخصوصية الخاصة بهم.
                </Section>

                <Section title="التعديلات">
                  نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم نشر الشروط المعدلة على هذه الصفحة مع تحديث تاريخ &quot;آخر تحديث&quot;. استمراركم في استخدام خدماتنا بعد نشر التعديلات يعني موافقتكم على الشروط الجديدة.
                </Section>

                <Section title="اتصل بنا">
                  لأي أسئلة حول شروط الاستخدام هذه، يرجى التواصل معنا عبر صفحة الاتصال على موقعنا أو عبر البريد الإلكتروني: optigroup.10@gmail.com
                </Section>
              </>
            ) : (
              <>
                <Section title="Acceptance of Terms">
                  By using Opti Group&apos;s websites and applications, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please do not use our services. Your continued use of our services after any changes to these terms are posted constitutes your acceptance of those changes.
                </Section>

                <Section title="Service Description">
                  Opti Group offers a suite of digital applications and services in the fields of health, entertainment, artificial intelligence, and tourism. Our current services include the OptiSize eye health application, with plans to launch additional applications in the future. We reserve the right to modify or discontinue any service at any time without prior notice.
                </Section>

                <Section title="User Accounts">
                  To use certain features, you may need to create an account. You are responsible for: providing accurate and complete information when creating your account, maintaining the confidentiality of your password, and all activities that occur under your account. You must notify us immediately of any unauthorized use of your account. We are not liable for any losses resulting from unauthorized use of your account.
                </Section>

                <Section title="Acceptable Conduct">
                  When using our services, you agree not to: use our services for any illegal or unauthorized purpose, attempt unauthorized access to our systems or other users&apos; accounts, transmit or post harmful, abusive, or inappropriate content, interfere with or disrupt the operation of our services, use our services in a way that may harm other users or third parties, or copy, distribute, or sell any part of our services without prior written permission.
                </Section>

                <Section title="Content and Intellectual Property">
                  All content, designs, logos, code, and graphics on our websites and applications are the property of Opti Group and are protected by applicable intellectual property laws. Copying, distributing, or modifying any content from our services without prior written permission is prohibited. Trademarks and trade names used in our services are the property of their respective owners.
                </Section>

                <Section title="Disclaimer">
                  Our services are provided &quot;as is&quot; and &quot;as available&quot; without any express or implied warranties. We do not guarantee that our services will be continuously available or error-free. We are not responsible for any direct or indirect damages resulting from the use of our services or the inability to use them. Health information provided in our applications is for informational purposes only and does not replace consultation with a qualified medical professional.
                </Section>

                <Section title="Advertisements">
                  Our services may display advertisements from third parties such as Google AdSense. We are not responsible for the content or accuracy of these advertisements. Your interaction with such advertisements is subject to the terms and conditions and privacy policies of the respective advertisers.
                </Section>

                <Section title="Modifications">
                  We reserve the right to modify these Terms at any time. Amended terms will be posted on this page with an updated &quot;Last updated&quot; date. Your continued use of our services after the amendments are posted means you agree to the new terms.
                </Section>

                <Section title="Contact Us">
                  For any questions about these Terms of Service, please contact us through the contact page on our website or via email at: optigroup.10@gmail.com
                </Section>
              </>
            )}
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-6 rounded-2xl" style={{
      background: 'rgba(26, 31, 54, 0.5)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(14,165,233,0.08)',
    }}>
      <h2 className="text-lg font-bold mb-3" style={{ color: '#0ea5e9' }}>{title}</h2>
      <div className="text-sm leading-relaxed space-y-3" style={{ color: 'rgba(192,192,192,0.7)' }}>
        {children}
      </div>
    </div>
  );
}
