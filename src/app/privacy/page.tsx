import Link from "next/link";
import BackButton from "@/components/BackButton";

export const metadata = {
  title: "سياسة الخصوصية - OptiSize",
  description: "سياسة الخصوصية لتطبيق OptiSize - كيف نحمي بياناتك ونحترم خصوصيتك",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen" style={{ background: "#0a0e1a", color: "#e2e8f0" }}>
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 p-4" style={{ background: "rgba(10,14,26,0.95)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <BackButton />
        <h1 className="text-lg font-bold" style={{ color: "#00f0ff" }}>سياسة الخصوصية</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 text-sm leading-relaxed" style={{ color: "#cbd5e1" }}>
        {/* Last Updated */}
        <p className="text-xs" style={{ color: "#64748b" }}>آخر تحديث: مايو 2026</p>

        {/* Intro */}
        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: "#e2e8f0" }}>مقدمة</h2>
          <p>
            نرحب بكم في تطبيق OptiSize. نحن نأخذ خصوصيتكم على محمل الجد ونلتزم بحماية بياناتكم الشخصية.
            توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية المعلومات التي تقدمونها عند استخدام تطبيقنا.
            باستخدامك لتطبيق OptiSize، فإنك توافق على الممارسات الموضحة في هذه السياسة.
          </p>
        </section>

        {/* Data Collection */}
        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: "#e2e8f0" }}>1. البيانات التي نجمعها</h2>
          <p className="mb-2">نجمع الأنواع التالية من المعلومات:</p>
          <ul className="list-disc list-inside space-y-1.5 mr-4">
            <li><strong style={{ color: "#e2e8f0" }}>بيانات الحساب:</strong> الاسم والبريد الإلكتروني عند التسجيل</li>
            <li><strong style={{ color: "#e2e8f0" }}>بيانات القياسات:</strong> نتائج قياس مسافة البؤبؤ (PD) واختبارات النظر التي تحفظها</li>
            <li><strong style={{ color: "#e2e8f0" }}>بيانات الكاميرا:</strong> نستخدم الكاميرا لقياس مسافة البؤبؤ فقط - لا نخزن أي صور أو فيديو على خوادمنا</li>
            <li><strong style={{ color: "#e2e8f0" }}>بيانات الاستخدام:</strong> كيفية تفاعلك مع التطبيق والأقسام التي تزورها</li>
            <li><strong style={{ color: "#e2e8f0" }}>بيانات الجهاز:</strong> نوع الجهاز ونظام التشغيل وإصدار المتصفح</li>
          </ul>
        </section>

        {/* Camera Usage */}
        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: "#e2e8f0" }}>2. استخدام الكاميرا</h2>
          <div className="rounded-xl p-4" style={{ background: "rgba(0,240,255,0.05)", border: "1px solid rgba(0,240,255,0.1)" }}>
            <p className="mb-2">
              <strong style={{ color: "#00f0ff" }}>التزامنا بحماية خصوصيتكم:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1.5 mr-4">
              <li>نستخدم الكاميرا فقط لقياس مسافة البؤبؤ (PD) في الوقت الفعلي</li>
              <li>لا نقوم بالتقاط أو تخزين أي صور أو مقاطع فيديو</li>
              <li>جميع عمليات التحليل تتم على جهازك مباشرة (محلياً)</li>
              <li>لا يتم إرسال أي بيانات بصرية إلى خوادمنا أو أي طرف ثالث</li>
              <li>يمكنك رفض إذن الكاميرا ولن يؤثر ذلك على باقي ميزات التطبيق</li>
            </ul>
          </div>
        </section>

        {/* Data Usage */}
        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: "#e2e8f0" }}>3. كيف نستخدم بياناتك</h2>
          <p className="mb-2">نستخدم المعلومات المجمعة للأغراض التالية:</p>
          <ul className="list-disc list-inside space-y-1.5 mr-4">
            <li>تقديم وتحسين خدمات التطبيق</li>
            <li>حفظ نتائج القياسات والاختبارات لرجوع إليها لاحقاً</li>
            <li>تقديم محتوى مخصص ونصائح صحية مفيدة</li>
            <li>تحليل أنماط الاستخدام لتحسين تجربة المستخدم</li>
            <li>التواصل معكم بخصوص التحديثات والميزات الجديدة</li>
          </ul>
        </section>

        {/* Data Storage */}
        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: "#e2e8f0" }}>4. تخزين البيانات وحمايتها</h2>
          <p className="mb-2">
            نتخذ إجراءات أمنية مناسبة لحماية بياناتكم من الوصول غير المصرح به أو التعديل أو الكشف أو التدمير. تشمل هذه الإجراءات:
          </p>
          <ul className="list-disc list-inside space-y-1.5 mr-4">
            <li>تشفير البيانات أثناء النقل باستخدام بروتوكولات SSL/TLS</li>
            <li>تخزين البيانات على خوادم آمنة ومحمية</li>
            <li>تقييد الوصول إلى البيانات الشخصية على الموظفين المعتمدين فقط</li>
            <li>مراجعة دورية لإجراءات الأمان والحماية</li>
          </ul>
        </section>

        {/* Data Sharing */}
        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: "#e2e8f0" }}>5. مشاركة البيانات</h2>
          <p>
            لا نبيع أو نتاجر أو ننقل بياناتكم الشخصية إلى أطراف خارجية. هذا لا يشمل الأطراف الموثوقة التي تساعدنا في تشغيل التطبيق أو خدمتكم، طالما أن هذه الأطراف توافق على إبقاء هذه المعلومات سرية. قد نطلق بياناتكم عندما نعتقد أن الإطلاق مناسب للامتثال للقانون أو إنفاذ اتفاقيات الموقع أو حماية حقوقنا أو سلامة الآخرين.
          </p>
        </section>

        {/* Medical Disclaimer */}
        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: "#e2e8f0" }}>6. إخلاء المسؤولية الطبية</h2>
          <div className="rounded-xl p-4" style={{ background: "rgba(255,165,0,0.06)", border: "1px solid rgba(255,165,0,0.12)" }}>
            <p>
              تطبيق OptiSize هو أداة إرشادية وتعليمية فقط ولا يغني عن استشارة الطبيب المتخصص. المعلومات المقدمة في التطبيق بما في ذلك نتائج القياسات والمحادثة الطبية لا تعتبر تشخيصاً طبياً ولا ينبغي الاعتماد عليها كبديل للتشخيص أو العلاج الطبي المهني. نوصي دائماً بزيارة طبيب عيون متخصص للحصول على التشخيص الدقيق.
            </p>
          </div>
        </section>

        {/* Cookies */}
        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: "#e2e8f0" }}>7. ملفات تعريف الارتباط (Cookies)</h2>
          <p>
            قد نستخدم ملفات تعريف الارتباط لتعزيز تجربتكم في استخدام التطبيق. يمكنك اختيار تعطيل ملفات تعريف الارتباط من خلال إعدادات المتصفح الخاص بك، لكن يرجى العلم أن بعض ميزات التطبيق قد لا تعمل بشكل صحيح بدونها.
          </p>
        </section>

        {/* Children's Privacy */}
        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: "#e2e8f0" }}>8. خصوصية الأطفال</h2>
          <p>
            نحن لا نجمع عن قصد معلومات شخصية من الأطفال دون سن 13 عاماً. إذا كنت ولي أمر وتعلم أن طفلك قدم معلومات شخصية لنا، يرجى الاتصال بنا وسن نتخذ خطوات لإزالة تلك المعلومات من خوادمنا.
          </p>
        </section>

        {/* Your Rights */}
        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: "#e2e8f0" }}>9. حقوقك</h2>
          <p className="mb-2">لديك الحق في:</p>
          <ul className="list-disc list-inside space-y-1.5 mr-4">
            <li>الوصول إلى بياناتك الشخصية المخزنة لدينا</li>
            <li>طلب تصحيح أو تحديث بياناتك</li>
            <li>طلب حذف بياناتك الشخصية</li>
            <li>الاعتراض على معالجة بياناتك</li>
            <li>سحب موافقتك في أي وقت</li>
          </ul>
        </section>

        {/* Changes */}
        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: "#e2e8f0" }}>10. التغييرات على السياسة</h2>
          <p>
            نحتفظ بالحق في تعديل سياسة الخصوصية هذه في أي وقت. سيتم نشر أي تغييرات على هذه الصفحة مع تحديث تاريخ "آخر تحديث". ننصحك بمراجعة هذه السياسة بشكل دوري للاطلاع على أي تغييرات.
          </p>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: "#e2e8f0" }}>11. التواصل معنا</h2>
          <p>
            إذا كان لديك أي أسئلة أو استفسارات بشأن سياسة الخصوصية هذه، يمكنك التواصل معنا عبر:
          </p>
          <p className="mt-2">
            البريد الإلكتروني: <a href="mailto:mohamed10.mohamed10@gmail.com" style={{ color: "#00f0ff" }}>mohamed10.mohamed10@gmail.com</a>
          </p>
        </section>

        {/* Footer links */}
        <div className="pt-6 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="flex flex-wrap gap-4 justify-center text-xs" style={{ color: "#64748b" }}>
            <Link href="/about" style={{ color: "#94a3b8" }}>من نحن</Link>
            <Link href="/terms" style={{ color: "#94a3b8" }}>شروط الاستخدام</Link>
            <Link href="/contact" style={{ color: "#94a3b8" }}>تواصل معنا</Link>
          </div>
          <p className="text-center text-xs mt-4" style={{ color: "#475569" }}>
            OptiSize &copy; 2026 - جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </div>
  );
}
