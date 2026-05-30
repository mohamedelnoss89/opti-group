import { Eye, Stethoscope, Heart, Glasses, Shield, Globe, Users } from "lucide-react";
import Link from "next/link";
import BackButton from "@/components/BackButton";

export const metadata = {
  title: "من نحن - OptiSize",
  description: "تعرف على تطبيق OptiSize - مركز صحة العين الشامل لقياس النظر والعناية بصحة عينيك",
};

export default function AboutUs() {
  return (
    <div className="min-h-screen" style={{ background: "#0a0e1a", color: "#e2e8f0" }}>
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 p-4" style={{ background: "rgba(10,14,26,0.95)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <BackButton />
        <h1 className="text-lg font-bold" style={{ color: "#00f0ff" }}>من نحن</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 text-sm leading-relaxed" style={{ color: "#cbd5e1" }}>
        {/* Hero Section */}
        <div className="text-center py-6">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "linear-gradient(135deg, #00f0ff, #0080ff)" }}>
            <Eye className="w-10 h-10" style={{ color: "#0a0e1a" }} />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: "#00f0ff" }}>OptiSize</h2>
          <p className="text-base" style={{ color: "#94a3b8" }}>مركز صحة العين الشامل</p>
        </div>

        {/* About */}
        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: "#e2e8f0" }}>قصتنا</h2>
          <p className="mb-3">
            OptiSize هو تطبيق مبتكر لصحة العيون مصمم لمساعدة الملايين على العناية بنظرهم بسهولة ودقة. تأسس التطبيق بإيمان راسخ بأن كل شخص يستحق الوصول إلى أدوات متقدمة لفحص وصحة العين، بغض النظر عن موقعه الجغرافي أو إمكانياته المادية.
          </p>
          <p>
            نحن نجمع بين أحدث التقنيات والخبرة الطبية لتقديم تجربة شاملة تساعدك على فهم حالتك البصرية والحصول على نصائح عملية مخصصة لحاجتك. هدفنا هو أن يكون OptiSize رفيقك اليومي في رحلة العناية بصحة عينيك.
          </p>
        </section>

        {/* Mission */}
        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: "#e2e8f0" }}>رسالتنا</h2>
          <div className="rounded-xl p-4" style={{ background: "rgba(0,240,255,0.05)", border: "1px solid rgba(0,240,255,0.1)" }}>
            <p style={{ color: "#e2e8f0", fontSize: "15px" }}>
              تمكين كل شخص من العناية بنظره من خلال تقنية ذكية وسهلة الاستخدام، وجعل صحة العين في متناول الجميع في كل مكان.
            </p>
          </div>
        </section>

        {/* Features */}
        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: "#e2e8f0" }}>ما نقدمه</h2>
          <div className="space-y-3">
            <div className="flex gap-3 items-start rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #00f0ff, #0080ff)" }}>
                <Eye className="w-5 h-5" style={{ color: "#0a0e1a" }} />
              </div>
              <div>
                <p className="font-semibold" style={{ color: "#e2e8f0" }}>قياس مسافة البؤبؤ (PD)</p>
                <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>تقنية ذكية تستخدم الكاميرا لقياس مسافة البؤبؤ بدقة عالية في ثوانٍ معدودة، لتسهيل طلب النظارات والعدسات اللاصقة عبر الإنترنت.</p>
              </div>
            </div>

            <div className="flex gap-3 items-start rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #a855f7, #6366f1)" }}>
                <Stethoscope className="w-5 h-5" style={{ color: "#0a0e1a" }} />
              </div>
              <div>
                <p className="font-semibold" style={{ color: "#e2e8f0" }}>اختبارات النظر</p>
                <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>مجموعة شاملة من الاختبارات البصرية تشمل: حدة البصر، الألوان، الاستجماتيزم، الحول، المياه البيضاء، والمياه الزرقاء.</p>
              </div>
            </div>

            <div className="flex gap-3 items-start rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #ff3b30, #ff6b6b)" }}>
                <Heart className="w-5 h-5" style={{ color: "#0a0e1a" }} />
              </div>
              <div>
                <p className="font-semibold" style={{ color: "#e2e8f0" }}>مركز صحة العين</p>
                <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>محادثة طبية ذكية، حساب الوصفات الطبية، مقارنة النظارات، مؤقت حماية العين، تغذية العين، وتحسس الإضاءة.</p>
              </div>
            </div>

            <div className="flex gap-3 items-start rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #ffa500, #ff8c00)" }}>
                <Glasses className="w-5 h-5" style={{ color: "#0a0e1a" }} />
              </div>
              <div>
                <p className="font-semibold" style={{ color: "#e2e8f0" }}>تجربة النظارات</p>
                <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>جرّب مختلف أشكال النظارات على وجهك باستخدام تقنية الواقع المعزز قبل الشراء.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: "#e2e8f0" }}>قيمنا</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <Shield className="w-6 h-6 mx-auto mb-2" style={{ color: "#00f0ff" }} />
              <p className="text-xs font-semibold" style={{ color: "#e2e8f0" }}>الخصوصية</p>
              <p className="text-[10px] mt-1" style={{ color: "#94a3b8" }}>بياناتك في أمان</p>
            </div>
            <div className="text-center rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <Globe className="w-6 h-6 mx-auto mb-2" style={{ color: "#a855f7" }} />
              <p className="text-xs font-semibold" style={{ color: "#e2e8f0" }}>الوصول المجاني</p>
              <p className="text-[10px] mt-1" style={{ color: "#94a3b8" }}>للجميع في كل مكان</p>
            </div>
            <div className="text-center rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <Users className="w-6 h-6 mx-auto mb-2" style={{ color: "#ffa500" }} />
              <p className="text-xs font-semibold" style={{ color: "#e2e8f0" }}>المستخدم أولاً</p>
              <p className="text-[10px] mt-1" style={{ color: "#94a3b8" }}>تجربة سهلة ومريحة</p>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section>
          <div className="rounded-xl p-4" style={{ background: "rgba(255,165,0,0.06)", border: "1px solid rgba(255,165,0,0.12)" }}>
            <p className="text-xs" style={{ color: "#ffa500", fontWeight: "600", marginBottom: "8px" }}>تنبيه مهم</p>
            <p className="text-xs" style={{ color: "#94a3b8" }}>
              تطبيق OptiSize هو أداة إرشادية وتعليمية فقط. لا يغني عن فحص طبيب العيون المتخصص. نتائج القياسات والاختبارات تقريبية ويجب تأكيدها لدى طبيب مختص. لا تتجاهل أي أعراض واستشر طبيبك دائماً.
            </p>
          </div>
        </section>

        {/* Footer links */}
        <div className="pt-6 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="flex flex-wrap gap-4 justify-center text-xs" style={{ color: "#64748b" }}>
            <Link href="/privacy" style={{ color: "#94a3b8" }}>سياسة الخصوصية</Link>
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
