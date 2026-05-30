import { Mail, MessageCircle, Clock, Shield } from "lucide-react";
import Link from "next/link";
import BackButton from "@/components/BackButton";

export const metadata = {
  title: "تواصل معنا - OptiSize",
  description: "تواصل مع فريق OptiSize - نحن هنا لمساعدتك والإجابة على استفساراتك",
};

export default function Contact() {
  return (
    <div className="min-h-screen" style={{ background: "#0a0e1a", color: "#e2e8f0" }}>
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 p-4" style={{ background: "rgba(10,14,26,0.95)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <BackButton />
        <h1 className="text-lg font-bold" style={{ color: "#00f0ff" }}>تواصل معنا</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 text-sm leading-relaxed" style={{ color: "#cbd5e1" }}>
        {/* Intro */}
        <section className="text-center py-4">
          <h2 className="text-xl font-bold mb-2" style={{ color: "#e2e8f0" }}>نحن هنا لمساعدتك!</h2>
          <p className="text-sm" style={{ color: "#94a3b8" }}>
            لا تتردد في التواصل معنا لأي سؤال أو اقتراح أو مشكلة. سنرد عليك في أقرب وقت ممكن.
          </p>
        </section>

        {/* Contact Methods */}
        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: "#e2e8f0" }}>طرق التواصل</h2>
          <div className="space-y-3">
            {/* Email */}
            <a
              href="mailto:mohamed10.mohamed10@gmail.com"
              className="flex gap-3 items-center rounded-xl p-4 transition-all hover:scale-[1.02]"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #00f0ff, #0080ff)" }}>
                <Mail className="w-6 h-6" style={{ color: "#0a0e1a" }} />
              </div>
              <div>
                <p className="font-semibold" style={{ color: "#e2e8f0" }}>البريد الإلكتروني</p>
                <p className="text-xs mt-1" style={{ color: "#00f0ff" }}>mohamed10.mohamed10@gmail.com</p>
                <p className="text-[10px] mt-0.5" style={{ color: "#64748b" }}>الطريقة المفضلة للتواصل</p>
              </div>
            </a>

            {/* WhatsApp */}
            <a
              href="https://wa.me/201000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-3 items-center rounded-xl p-4 transition-all hover:scale-[1.02]"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}>
                <MessageCircle className="w-6 h-6" style={{ color: "#fff" }} />
              </div>
              <div>
                <p className="font-semibold" style={{ color: "#e2e8f0" }}>واتساب</p>
                <p className="text-xs mt-1" style={{ color: "#25D366" }}>أرسل لنا رسالة</p>
                <p className="text-[10px] mt-0.5" style={{ color: "#64748b" }}>للاستفسارات السريعة</p>
              </div>
            </a>
          </div>
        </section>

        {/* Response Time */}
        <section>
          <div className="flex gap-3 items-start rounded-xl p-4" style={{ background: "rgba(0,240,255,0.05)", border: "1px solid rgba(0,240,255,0.1)" }}>
            <Clock className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#00f0ff" }} />
            <div>
              <p className="font-semibold" style={{ color: "#e2e8f0" }}>وقت الاستجابة</p>
              <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                نسعى للرد على جميع الرسائل خلال 24-48 ساعة عمل. في حالة الاستفسارات العاجلة، يرجى إرسال بريد إلكتروني مع ذكر "عاجل" في العنوان.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: "#e2e8f0" }}>الأسئلة الشائعة</h2>
          <div className="space-y-3">
            <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="font-semibold text-xs mb-2" style={{ color: "#e2e8f0" }}>هل التطبيق مجاني؟</p>
              <p className="text-xs" style={{ color: "#94a3b8" }}>نعم، OptiSize متاح مجاناً مع ميزات أساسية. بعض الميزات المتقدمة تتطلب اشتراكاً.</p>
            </div>

            <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="font-semibold text-xs mb-2" style={{ color: "#e2e8f0" }}>هل نتائج القياس دقيقة؟</p>
              <p className="text-xs" style={{ color: "#94a3b8" }}>النتائج تقريبية ومفيدة كمرجع أولي، لكن لا تعتبر تشخيصاً طبياً. نوصي بتأكيدها لدى طبيب عيون.</p>
            </div>

            <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="font-semibold text-xs mb-2" style={{ color: "#e2e8f0" }}>هل بياناتي آمنة؟</p>
              <p className="text-xs" style={{ color: "#94a3b8" }}>نعم، نستخدم أحدث تقنيات التشفير والحماية. لا نخزن صور الكاميرا ولا نشارك بياناتك مع أي طرف ثالث.</p>
            </div>

            <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="font-semibold text-xs mb-2" style={{ color: "#e2e8f0" }}>هل يمكنني استخدام التطبيق بدون إنترنت؟</p>
              <p className="text-xs" style={{ color: "#94a3b8" }}>بعض الميزات تعمل بدون إنترنت بعد التحميل الأول، لكن الميزات المتقدمة مثل المحادثة الطبية تتطلب اتصالاً بالإنترنت.</p>
            </div>
          </div>
        </section>

        {/* Privacy Notice */}
        <section>
          <div className="flex gap-3 items-start rounded-xl p-4" style={{ background: "rgba(168,85,247,0.05)", border: "1px solid rgba(168,85,247,0.1)" }}>
            <Shield className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#a855f7" }} />
            <div>
              <p className="font-semibold" style={{ color: "#e2e8f0" }}>خصوصية مراسلاتك</p>
              <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                نحترم خصوصية مراسلاتك ولن نشارك معلوماتك مع أي طرف ثالث. جميع المراسلات مشفرة وآمنة.
              </p>
            </div>
          </div>
        </section>

        {/* Footer links */}
        <div className="pt-6 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="flex flex-wrap gap-4 justify-center text-xs" style={{ color: "#64748b" }}>
            <Link href="/privacy" style={{ color: "#94a3b8" }}>سياسة الخصوصية</Link>
            <Link href="/about" style={{ color: "#94a3b8" }}>من نحن</Link>
            <Link href="/terms" style={{ color: "#94a3b8" }}>شروط الاستخدام</Link>
          </div>
          <p className="text-center text-xs mt-4" style={{ color: "#475569" }}>
            OptiSize &copy; 2026 - جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </div>
  );
}
