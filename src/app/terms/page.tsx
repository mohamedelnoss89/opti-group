import Link from "next/link";
import BackButton from "@/components/BackButton";

export const metadata = {
  title: "شروط الاستخدام - OptiSize",
  description: "شروط استخدام تطبيق OptiSize - القواعد واللوائح التي تحكم استخدامك للتطبيق",
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen" style={{ background: "#0a0e1a", color: "#e2e8f0" }}>
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 p-4" style={{ background: "rgba(10,14,26,0.95)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <BackButton />
        <h1 className="text-lg font-bold" style={{ color: "#00f0ff" }}>شروط الاستخدام</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 text-sm leading-relaxed" style={{ color: "#cbd5e1" }}>
        {/* Last Updated */}
        <p className="text-xs" style={{ color: "#64748b" }}>آخر تحديث: مايو 2026</p>

        {/* Intro */}
        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: "#e2e8f0" }}>مقدمة</h2>
          <p>
            مرحباً بك في OptiSize. يرجى قراءة شروط الاستخدام هذه بعناية قبل استخدام التطبيق. باستخدامك لتطبيق OptiSize، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام التطبيق.
          </p>
        </section>

        {/* Acceptance */}
        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: "#e2e8f0" }}>1. قبول الشروط</h2>
          <p>
            بإنشاء حساب أو استخدام التطبيق، فإنك تقر بأنك قرأت وفهمت ووافقت على الالتزام بشروط الاستخدام هذه وسياسة الخصوصية الخاصة بنا. تحتفظ OptiSize بالحق في تعديل هذه الشروط في أي وقت، وسيتم إخطارك بأي تغييرات جوهرية عبر التطبيق أو البريد الإلكتروني.
          </p>
        </section>

        {/* Medical Disclaimer */}
        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: "#e2e8f0" }}>2. إخلاء المسؤولية الطبية</h2>
          <div className="rounded-xl p-4" style={{ background: "rgba(255,165,0,0.06)", border: "1px solid rgba(255,165,0,0.12)" }}>
            <p className="mb-2"><strong style={{ color: "#ffa500" }}>تحذير مهم:</strong></p>
            <ul className="list-disc list-inside space-y-1.5 mr-4">
              <li>تطبيق OptiSize هو أداة إرشادية وتعليمية فقط وليس أداة تشخيص طبي</li>
              <li>نتائج القياسات والاختبارات تقريبية ولا تعتبر تشخيصاً طبياً</li>
              <li>المحادثة الطبية تقدم نصائح عامة ولا تغني عن استشارة طبيب متخصص</li>
              <li>لا توقف أو تعدل أي علاج طبي بناءً على معلومات التطبيق</li>
              <li>استشر طبيب عيون متخصص دائماً للتشخيص والعلاج الدقيق</li>
              <li>في حالة الطوارئ، اتصل بخدمات الطوارئ فوراً</li>
            </ul>
          </div>
        </section>

        {/* User Responsibilities */}
        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: "#e2e8f0" }}>3. مسؤوليات المستخدم</h2>
          <p className="mb-2">باستخدامك للتطبيق، تتفق على:</p>
          <ul className="list-disc list-inside space-y-1.5 mr-4">
            <li>تقديم معلومات صحيحة ودقيقة عند التسجيل</li>
            <li>الحفاظ على سرية بيانات حسابك</li>
            <li>عدم استخدام التطبيق لأي أغراض غير قانونية أو ضارة</li>
            <li>عدم محاولة الوصول غير المصرح به إلى أنظمة التطبيق</li>
            <li>عدم مشاركة حسابك مع أشخاص آخرين</li>
            <li>إخطارنا فوراً في حالة الاستخدام غير المصرح به لحسابك</li>
            <li>استخدام التطبيق وفقاً للقوانين المحلية المعمول بها</li>
          </ul>
        </section>

        {/* Prohibited Uses */}
        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: "#e2e8f0" }}>4. الاستخدامات المحظورة</h2>
          <p className="mb-2">يُحظر عليك:</p>
          <ul className="list-disc list-inside space-y-1.5 mr-4">
            <li>استخدام التطبيق لأغراض غير قانونية أو غير مصرح بها</li>
            <li>محاولة التلاعب بنتائج القياسات أو الاختبارات</li>
            <li>نسخ أو توزيع محتوى التطبيق دون إذن مسبق</li>
            <li>محاولة اختراق أو إتلاف أنظمة التطبيق</li>
            <li>استخدام التطبيق للتشخيص أو العلاج الطبي للآخرين</li>
            <li>نشر معلومات مضللة مستمدة من التطبيق</li>
          </ul>
        </section>

        {/* Accuracy */}
        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: "#e2e8f0" }}>5. دقة المعلومات</h2>
          <p>
            نسعى لتقديم معلومات دقيقة وحديثة، لكننا لا نضمن دقة أو اكتمال أو موثوقية أي محتوى في التطبيق. النتائج التي يقدمها التطبيق تعتمد على عوامل متعددة منها إضاءة المكان، وموضع الجهاز، وحالة المستخدم. قد تختلف النتائج عن الفحص الطبي المهني. نوصي دائماً بتأكيد النتائج لدى طبيب مختص.
          </p>
        </section>

        {/* Intellectual Property */}
        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: "#e2e8f0" }}>6. الملكية الفكرية</h2>
          <p>
            جميع المحتويات في تطبيق OptiSize بما في ذلك التصميم والنصوص والرسومات والشعارات والأيقونات والصور والبرمجيات هي ملك لـ OptiSize أو مرخصة لنا ومحمية بموجب قوانين الملكية الفكرية المعمول بها. لا يجوز لك استخدام أي محتوى من التطبيق دون إذن كتابي مسبق منا.
          </p>
        </section>

        {/* Limitation of Liability */}
        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: "#e2e8f0" }}>7. حدود المسؤولية</h2>
          <p>
            لا يتحمل OptiSize أي مسؤولية عن الأضرار المباشرة أو غير المباشرة أو العرضية أو التبعية الناتجة عن استخدام التطبيق أو عدم القدرة على استخدامه. يشمل ذلك على سبيل المثال لا الحصر: القرارات الطبية المتخذة بناءً على نتائج التطبيق، أو الأضرار الناتجة عن الاعتماد على المعلومات المقدمة، أو أي أخطاء في القياسات أو النتائج.
          </p>
        </section>

        {/* Service Changes */}
        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: "#e2e8f0" }}>8. تغييرات الخدمة</h2>
          <p>
            نحتفظ بالحق في تعديل أو إيقاف أي جزء من التطبيق في أي وقت دون إشعار مسبق. قد نضيف أو نزيل ميزات، أو نغير التصميم أو الوظائف. لن نكون مسؤولين عن أي تعديل أو إيقاف أو تغيير في الخدمة.
          </p>
        </section>

        {/* Termination */}
        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: "#e2e8f0" }}>9. إنهاء الخدمة</h2>
          <p>
            نحتفظ بالحق في تعليق أو إنهاء حسابك في أي وقت إذا انتهكت هذه الشروط. يمكنك إنهاء استخدامك للتطبيق في أي الوقت عن طريق التوقف عن استخدامه وحذف حسابك. بعد الإنهاء، ستظل الأحكام التي بطبيعتها يجب أن تبقى سارية معمولاً بها.
          </p>
        </section>

        {/* Governing Law */}
        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: "#e2e8f0" }}>10. القانون الحاكم</h2>
          <p>
            تخضع شروط الاستخدام هذه وتفسر وفقاً لقوانين جمهورية مصر العربية. أي نزاع ينشأ عن استخدامك للتطبيق سيتم حله وفقاً للقوانين المصرية.
          </p>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: "#e2e8f0" }}>11. التواصل</h2>
          <p>
            لأي استفسارات بخصوص شروط الاستخدام هذه، يمكنك التواصل معنا عبر:
          </p>
          <p className="mt-2">
            البريد الإلكتروني: <a href="mailto:mohamed10.mohamed10@gmail.com" style={{ color: "#00f0ff" }}>mohamed10.mohamed10@gmail.com</a>
          </p>
        </section>

        {/* Footer links */}
        <div className="pt-6 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="flex flex-wrap gap-4 justify-center text-xs" style={{ color: "#64748b" }}>
            <Link href="/privacy" style={{ color: "#94a3b8" }}>سياسة الخصوصية</Link>
            <Link href="/about" style={{ color: "#94a3b8" }}>من نحن</Link>
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
