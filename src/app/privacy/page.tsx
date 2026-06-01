'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import AdBanner from '@/components/AdBanner';

export default function PrivacyPage() {
  const { locale } = useLanguage();
  const isArabic = locale === 'ar';

  return (
    <div dir={isArabic ? 'rtl' : 'ltr'} className="min-h-screen" style={{ background: '#0a0e1a' }}>
      {/* Header */}
      <div className="pt-24 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className={`flex items-center gap-3 mb-4 ${isArabic ? 'flex-row-reverse' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="p-3 rounded-2xl" style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.15)' }}>
              <Shield className="w-6 h-6" style={{ color: '#0ea5e9' }} />
            </div>
            <h1 className={`text-2xl sm:text-3xl font-bold ${isArabic ? 'font-arabic text-right' : ''}`}
              style={{
                background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
              {isArabic ? 'سياسة الخصوصية' : 'Privacy Policy'}
            </h1>
          </motion.div>
          <p className={`text-sm ${isArabic ? 'font-arabic text-right' : ''}`} style={{ color: 'rgba(192,192,192,0.5)' }}>
            {isArabic ? 'آخر تحديث: يونيو 2026' : 'Last updated: June 2026'}
          </p>
        </div>
      </div>

      {/* Ad Banner */}
      <div className="max-w-4xl mx-auto px-4 py-2">
        <AdBanner adSlot="privacy-top" adFormat="horizontal" />
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-8"
        >
          {isArabic ? (
            <>
              <Section title="مقدمة">
                مرحبًا بكم في مجموعة أوبتي (&quot;نحن&quot;، &quot;لنا&quot;، أو &quot;مجموعتنا&quot;). نحن نقدر خصوصيتكم ونلتزم بحماية بياناتكم الشخصية. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية المعلومات التي نحصل عليها عند استخدامكم لمواقعنا وتطبيقاتنا، بما في ذلك ولكن لا يقتصر على opti-group-deploy.vercel.app والتطبيقات المرتبطة بها مثل OptiSize.
              </Section>

              <Section title="المعلومات التي نجمعها">
                <SubSection title="المعلومات التي تقدمونها أنتم:">
                  قد نجمع المعلومات التي تقدمونها طوعًا عند إنشاء حساب، أو ملء نموذج اتصال، أو الاشتراك في خدماتنا. يشمل ذلك اسمكم، عنوان البريد الإلكتروني، رقم الهاتف (اختياري)، الدولة، وأي معلومات أخرى تختارون تقديمها.
                </SubSection>
                <SubSection title="المعلومات المجمعة تلقائيًا:">
                  عند استخدامكم لمواقعنا، قد نجمع تلقائيًا معلومات معينة، بما في ذلك عنوان IP الخاص بكم، نوع المتصفح، نظام التشغيل، صفحات المرجع، الصفحات التي تزورونها، وتاريخ ووقت زيارتكم، ومعلومات الجهاز.
                </SubSection>
                <SubSection title="ملفات تعريف الارتباط والتقنيات المماثلة:">
                  نستخدم ملفات تعريف الارتباط وتقنيات التتبع المماثلة لتحسين تجربتكم وتحليل كيفية استخدامكم لمواقعنا. يمكنكم التحكم في تفضيلات ملفات تعريف الارتباط من خلال إعدادات المتصفح الخاص بكم.
                </SubSection>
              </Section>

              <Section title="كيف نستخدم معلوماتكم">
                نستخدم المعلومات التي نجمعها للأغراض التالية: تقديم خدماتنا وتشغيل مواقعنا وتطبيقاتنا، وتحسين وتطوير خدماتنا وتجربة المستخدم، وإرسال رسائل بريد إلكتروني تتعلق بحسابكم أو طلباتكم، والاستجابة لاستفساراتكم وتقديم دعم العملاء، ومراقبة وتحليل أنماط الاستخدام والاتجاهات، وعرض الإعلانات ذات الصلة من خلال Google AdSense، والامتثال للمتطلبات القانونية والتنظيمية.
              </Section>

              <Section title="مشاركة المعلومات">
                <SubSection title="مزودو الخدمات:">
                  نشارك معلوماتكم مع مزودي خدمات الطرف الثالث الذين يساعدوننا في تشغيل خدماتنا، مثل Supabase لقواعد البيانات والمصادقة، وGoogle للمصادقة والإعلانات (AdSense)، وVercel للاستضافة.
                </SubSection>
                <SubSection title="المتطلبات القانونية:">
                  قد نكشف عن معلوماتكم إذا كان القانون يتطلب ذلك أو استجابةً لطلبات قانونية صالحة من السلطات العامة.
                </SubSection>
                <SubSection title="حماية الحقوق:">
                  قد نكشف عن معلوماتكم لحماية حقوقنا أو سلامة الآخرين، أو التحقيق في احتيال، أو مسائل أمنية.
                </SubSection>
              </Section>

              <Section title="Google AdSense">
                نستخدم Google AdSense لعرض الإعلانات على مواقعنا. قد يستخدم Google ملفات تعريف الارتباط لعرض الإعلانات بناءً على زياراتكم السابقة لمواقعنا أو مواقع أخرى. يمكنك تعطيل الإعلانات المخصصة من خلال زيارة إعدادات إعلانات Google. استخدام Google لملفات تعريف الارتباط لخدمة الإعلانات يعتمد على موافقة المستخدم وفقًا لسياسة الخصوصية هذه.
              </Section>

              <Section title="أمن البيانات">
                نتخذ تدابير أمنية معقولة لحماية معلوماتكم الشخصية من الوصول غير المصرح به أو التغيير أو الكشف أو التدمير. ومع ذلك، لا يمكن لأي طريقة نقل عبر الإنترنت أو تخزين إلكتروني أن تكون آمنة بنسبة 100٪، لذلك لا يمكننا ضمان الأمن المطلق.
              </Section>

              <Section title="حقوقكم">
                لديكم الحق في: الوصول إلى بياناتكم الشخصية التي نحتفظ بها، وطلب تصحيح أي بيانات غير دقيقة، وطلب حذف بياناتكم الشخصية، والاعتراض على معالجة بياناتكم، وطلب نقل بياناتكم. لممارسة أي من هذه الحقوق، يرجى التواصل معنا عبر نموذج الاتصال على موقعنا أو عبر البريد الإلكتروني.
              </Section>

              <Section title="الاحتفاظ بالبيانات">
                نحتفظ ببياناتكم الشخصية فقط طالما كان ذلك ضروريًا للأغراض الموضحة في سياسة الخصوصية هذه، أو طالما كان مطلوبًا بموجب القانون. سنحذف بياناتكم الشخصية أو نصنفها بشكل مجهول عند انتهاء الغرض من معالجتها.
              </Section>

              <Section title="التغييرات على سياسة الخصوصية">
                قد نحدّث سياسة الخصوصية هذه من وقت لآخر. سنقوم بإخطاركم بأي تغييرات جوهرية عن طريق نشر السياسة المحدثة على هذه الصفحة مع تحديث تاريخ &quot;آخر تحديث&quot;. نوصي بمراجعة هذه السياسة بشكل دوري.
              </Section>

              <Section title="اتصل بنا">
                إذا كان لديكم أي أسئلة حول سياسة الخصوصية هذه أو ممارسات البيانات الخاصة بنا، يرجى التواصل معنا عبر صفحة الاتصال على موقعنا أو عبر البريد الإلكتروني: mohamed10.mohamed10@gmail.com
              </Section>
            </>
          ) : (
            <>
              <Section title="Introduction">
                Welcome to Opti Group (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). We value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard information we obtain when you use our websites and applications, including but not limited to opti-group-deploy.vercel.app and associated applications such as OptiSize.
              </Section>

              <Section title="Information We Collect">
                <SubSection title="Information You Provide:">
                  We may collect information you voluntarily provide when creating an account, filling out a contact form, or subscribing to our services. This includes your name, email address, phone number (optional), country, and any other information you choose to provide.
                </SubSection>
                <SubSection title="Automatically Collected Information:">
                  When you use our websites, we may automatically collect certain information, including your IP address, browser type, operating system, referring pages, pages you visit, date and time of your visit, and device information.
                </SubSection>
                <SubSection title="Cookies and Similar Technologies:">
                  We use cookies and similar tracking technologies to enhance your experience and analyze how you use our websites. You can control your cookie preferences through your browser settings.
                </SubSection>
              </Section>

              <Section title="How We Use Your Information">
                We use the information we collect for the following purposes: providing our services and operating our websites and applications, improving and developing our services and user experience, sending emails related to your account or orders, responding to your inquiries and providing customer support, monitoring and analyzing usage patterns and trends, displaying relevant advertisements through Google AdSense, and complying with legal and regulatory requirements.
              </Section>

              <Section title="Information Sharing">
                <SubSection title="Service Providers:">
                  We share your information with third-party service providers who help us operate our services, such as Supabase for database and authentication, Google for authentication and advertising (AdSense), and Vercel for hosting.
                </SubSection>
                <SubSection title="Legal Requirements:">
                  We may disclose your information if required by law or in response to valid legal requests from public authorities.
                </SubSection>
                <SubSection title="Protection of Rights:">
                  We may disclose your information to protect our rights or the safety of others, or to investigate fraud or security issues.
                </SubSection>
              </Section>

              <Section title="Google AdSense">
                We use Google AdSense to display advertisements on our websites. Google may use cookies to serve ads based on your prior visits to our website or other websites. You can opt out of personalized advertising by visiting Google Ads Settings. Google&apos;s use of advertising cookies is based on user consent as outlined in this privacy policy.
              </Section>

              <Section title="Data Security">
                We take reasonable security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, so we cannot guarantee absolute security.
              </Section>

              <Section title="Your Rights">
                You have the right to: access your personal data that we hold, request correction of any inaccurate data, request deletion of your personal data, object to the processing of your data, and request data portability. To exercise any of these rights, please contact us through the contact form on our website or via email.
              </Section>

              <Section title="Data Retention">
                We retain your personal data only for as long as necessary for the purposes outlined in this Privacy Policy, or as required by law. We will delete or anonymize your personal data when the purpose of processing has been fulfilled.
              </Section>

              <Section title="Changes to This Privacy Policy">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the updated policy on this page with an updated &quot;Last updated&quot; date. We recommend reviewing this policy periodically.
              </Section>

              <Section title="Contact Us">
                If you have any questions about this Privacy Policy or our data practices, please contact us through the contact page on our website or via email at: mohamed10.mohamed10@gmail.com
              </Section>
            </>
          )}
        </motion.div>

        {/* Ad Banner - Bottom */}
        <div className="mt-10">
          <AdBanner adSlot="privacy-bottom" adFormat="horizontal" />
        </div>
      </div>
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

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-1" style={{ color: 'rgba(232,232,232,0.85)' }}>{title}</h3>
      <p>{children}</p>
    </div>
  );
}
