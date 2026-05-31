"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Eye,
  Stethoscope,
  Heart,
  Glasses,
  History,
  LogOut,
  Info,
  Mail,
  Ruler,
  Sparkles,
  Save,
  Cpu,
  Sun,
  Download,
  Lock,
  Crown,
  Languages,
  ShieldCheck,
  AlertTriangle,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StoredUser } from "@/lib/auth";
import { logout } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";

interface MainMenuProps {
  user: StoredUser;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
  onRequestLogin: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

// Services that are free for guests (only PD measurement)
const GUEST_ALLOWED = ["scanner"];

export default function MainMenu({
  user,
  onNavigate,
  onLogout,
  onRequestLogin,
}: MainMenuProps) {
  const { toast } = useToast();
  const { t, isRTL, locale, setLocale } = useI18n();
  const isGuest = user.isGuest;

  const mainActions = [
    {
      id: "scanner",
      label: t("menu.pd"),
      description: "قياس مسافة البؤبؤ",
      icon: Eye,
      gradient: "linear-gradient(135deg, #00f0ff, #0080ff)",
      glowClass: "glow-cyan",
    },
    {
      id: "vision-test",
      label: t("menu.vision"),
      description: "اختبارات النظر",
      icon: Stethoscope,
      gradient: "linear-gradient(135deg, #a855f7, #6366f1)",
      glowClass: "glow-purple",
    },
    {
      id: "health-center",
      label: t("menu.health"),
      description: "مركز صحة العين",
      icon: Heart,
      gradient: "linear-gradient(135deg, #ff3b30, #ff6b6b)",
      glowClass: "glow-red",
      vip: true,
    },
    {
      id: "records",
      label: t("menu.records"),
      description: "السجلات المحفوظة",
      icon: History,
      gradient: "linear-gradient(135deg, #0080ff, #0050cc)",
      glowClass: "glow-blue",
    },
  ];

  const features = [
    {
      icon: Ruler,
      label: t("menu.pdDesc"),
      color: "#00f0ff",
    },
    {
      icon: Cpu,
      label: t("menu.pdFeat"),
      color: "#a855f7",
    },
    {
      icon: Save,
      label: t("menu.saveFeat"),
      color: "#00d4aa",
    },
    {
      icon: Sparkles,
      label: t("menu.uiFeat"),
      color: "#ffa500",
    },
  ];

  // Quick tools in main menu (Light Sensitivity + Export)
  const quickTools = [
    {
      id: "light-sensitivity",
      label: t("light.title"),
      subtitle: "تحسس الإضاءة",
      icon: Sun,
      gradient: "linear-gradient(135deg, #fbbf24, #f59e0b)",
      color: "#fbbf24",
    },
    {
      id: "records",
      label: t("records.export"),
      subtitle: "تصدير وفرز",
      icon: Download,
      gradient: "linear-gradient(135deg, #00d4aa, #00a88a)",
      color: "#00d4aa",
    },
  ];

  const handleLogout = () => {
    logout();
    toast({ title: t("menu.toast.loggedOut"), description: t("menu.toast.bye") });
    onLogout();
  };

  const handleActionClick = (actionId: string) => {
    if (isGuest && !GUEST_ALLOWED.includes(actionId)) {
      onRequestLogin();
      return;
    }
    onNavigate(actionId);
  };

  const isLocked = (actionId: string) => isGuest && !GUEST_ALLOWED.includes(actionId);

  return (
    <div
      className="min-h-screen pb-8"
      style={{ background: "#0a0e1a" }}
    >
      {/* Background decoration */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(0,240,255,0.05) 0%, transparent 50%)",
        }}
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative max-w-lg mx-auto px-4 pt-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center glow-cyan"
              style={{ background: "linear-gradient(135deg, #00f0ff, #0080ff)" }}
            >
              <Eye className="w-6 h-6" style={{ color: "#0a0e1a" }} />
            </div>
            <div>
              <h1
                className="text-xl font-bold text-glow-cyan"
                style={{ color: "#00f0ff" }}
              >
                OptiSize
              </h1>
              <p className="text-xs" style={{ color: "#64748b" }}>
                {t("menu.subtitle")}
              </p>
            </div>
          </div>

          {/* User bar */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="icon"
              className="w-9 h-9 rounded-lg hover:bg-white/5 transition-colors"
              style={{ color: "#94a3b8" }}
            >
              <LogOut className="w-4 h-4" />
            </Button>
            <div className="text-left">
              <p className="text-sm font-medium" style={{ color: "#e2e8f0" }}>
                {user.name}
              </p>
              {user.isGuest && (
                <p className="text-[10px]" style={{ color: "#64748b" }}>
                  {t("menu.guest")}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Main Action Cards */}
        <motion.div variants={itemVariants} className="space-y-3 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2
              className="text-sm font-semibold"
              style={{ color: "#94a3b8" }}
            >
              {t("menu.services")}
            </h2>
            <button
              onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium transition-all duration-200 active:scale-95 hover:bg-white/10"
              style={{
                background: "rgba(0,240,255,0.08)",
                border: "1px solid rgba(0,240,255,0.2)",
                color: "#00f0ff",
              }}
            >
              <Languages className="w-3 h-3" />
              <span className="hidden sm:inline">{locale === "ar" ? "EN" : "عربي"}</span>
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {mainActions.map((action, index) => {
              const locked = isLocked(action.id);
              return (
                <motion.button
                  key={action.id}
                  onClick={() => handleActionClick(action.id)}
                  className="w-full text-right rounded-xl p-4 transition-all duration-200 group relative overflow-hidden"
                  style={{
                    background: locked
                      ? "linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)"
                      : "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
                    border: locked
                      ? "1px solid rgba(255,255,255,0.04)"
                      : "1px solid rgba(255,255,255,0.08)",
                    opacity: locked ? 0.55 : 1,
                  }}
                  whileHover={locked ? {} : {
                    scale: 1.015,
                    borderColor: "rgba(255,255,255,0.15)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                  }}
                  whileTap={locked ? { scale: 0.98 } : { scale: 0.985 }}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.06, duration: 0.3 }}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200"
                        style={{
                          background: locked
                            ? "rgba(255,255,255,0.06)"
                            : action.gradient,
                        }}
                      >
                        <action.icon
                          className="w-6 h-6"
                          style={{ color: locked ? "#475569" : "#0a0e1a" }}
                        />
                      </div>
                      {/* Lock icon for guest */}
                      {locked && (
                        <div
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
                        >
                          <Lock className="w-2.5 h-2.5" style={{ color: "#94a3b8" }} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className="text-base font-semibold"
                          style={{ color: locked ? "#64748b" : "#e2e8f0" }}
                        >
                          {action.label}
                        </p>
                        {/* VIP Badge for health center */}
                        {action.vip && (
                          <div
                            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full"
                            style={{
                              background: locked
                                ? "rgba(255,215,0,0.08)"
                                : "linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,170,0,0.15))",
                              border: locked
                                ? "1px solid rgba(255,215,0,0.15)"
                                : "1px solid rgba(255,215,0,0.35)",
                            }}
                          >
                            <Crown className="w-2.5 h-2.5" style={{ color: locked ? "#92400e" : "#ffd700" }} />
                            <span className="text-[8px] font-bold" style={{ color: locked ? "#92400e" : "#ffd700" }}>VIP</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: locked ? "#475569" : "#64748b" }}>
                        {locked ? "سجّل دخولك للوصول" : action.description}
                      </p>
                    </div>
                    <div
                      className="w-2 h-2 rounded-full shrink-0 opacity-40 group-hover:opacity-100 transition-opacity"
                      style={{
                        background: locked ? "#475569" : action.gradient,
                      }}
                    />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div variants={itemVariants} className="mb-6">
          <h2
            className="text-sm font-semibold mb-3"
            style={{ color: "#94a3b8" }}
          >
            {t("menu.features")}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.label}
                className="glass-card rounded-xl p-3 text-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.06 }}
                whileHover={{ scale: 1.03 }}
              >
                <feature.icon
                  className="w-5 h-5 mx-auto mb-2"
                  style={{ color: feature.color }}
                />
                <p
                  className="text-xs font-medium"
                  style={{ color: "#e2e8f0" }}
                >
                  {feature.label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Tools (Light Sensitivity + Export) */}
        <motion.div variants={itemVariants} className="mb-6">
          <h2 className="text-sm font-semibold mb-3" style={{ color: "#94a3b8" }}>
            أدوات سريعة
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {quickTools.map((tool, index) => {
              const locked = isGuest;
              return (
                <motion.button
                  key={tool.id}
                  onClick={() => handleActionClick(tool.id)}
                  className="glass-card rounded-xl p-4 text-center transition-all duration-200 group relative"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.06 }}
                  whileHover={locked ? {} : { scale: 1.03, borderColor: `${tool.color}30` }}
                  whileTap={locked ? { scale: 0.97 } : { scale: 0.97 }}
                  style={locked ? { opacity: 0.45 } : {}}
                >
                  {/* Lock overlay for guests */}
                  {locked && (
                    <div className="absolute top-2 left-2">
                      <Lock className="w-3 h-3" style={{ color: "#94a3b8" }} />
                    </div>
                  )}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform"
                    style={{ background: locked ? "rgba(255,255,255,0.04)" : tool.gradient }}
                  >
                    <tool.icon className="w-5 h-5" style={{ color: locked ? "#475569" : "#0a0e1a" }} />
                  </div>
                  <p className="text-xs font-semibold" style={{ color: locked ? "#64748b" : "#e2e8f0" }}>
                    {tool.label}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: locked ? "#475569" : tool.color }}>
                    {locked ? "سجّل دخولك" : tool.subtitle}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Ad Banner - Hidden until AdSense approval */}

        {/* Eye Health Article - Publisher Content */}
        <motion.div variants={itemVariants} className="mb-6">
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(180deg, rgba(15,23,42,0.9) 0%, rgba(10,14,26,0.95) 100%)",
              border: "1px solid rgba(0,240,255,0.12)",
            }}
          >
            {/* Article Header */}
            <div
              className="p-4 pb-3"
              style={{
                background: "linear-gradient(135deg, rgba(0,240,255,0.08), rgba(0,128,255,0.04))",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5" style={{ color: "#00f0ff" }} />
                <h3 className="text-base font-bold" style={{ color: "#00f0ff" }}>
                  نصائح لصحة عينيك
                </h3>
              </div>
              <p className="text-xs" style={{ color: "#64748b" }}>
                كيف تحافظ على نظرك في العصر الرقمي
              </p>
            </div>

            {/* Article Body */}
            <div className="p-4 space-y-4">
              {/* Intro */}
              <p className="text-sm leading-relaxed" style={{ color: "#cbd5e1" }}>
                تعتبر العين من أهم الحواس التي نمتلكها، ومع زيادة استخدام الشاشات في حياتنا اليومية، أصبحت العناية بصحة العين أكثر أهمية من أي وقت مضى. تشير الإحصائيات إلى أن أكثر من 80% من المعلومات التي نتلقاها تأتي عبر حاسة البصر، مما يجعل الحفاظ على صحة العين أولوية قصوى لكل فرد.
              </p>

              {/* Tip 1 */}
              <div className="flex gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: "rgba(0,240,255,0.1)", border: "1px solid rgba(0,240,255,0.15)" }}
                >
                  <span className="text-sm font-bold" style={{ color: "#00f0ff" }}>1</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold mb-1" style={{ color: "#e2e8f0" }}>
                    قاعدة 20-20-20
                  </h4>
                  <p className="text-xs leading-relaxed" style={{ color: "#94a3b8" }}>
                    كل 20 دقيقة أمام الشاشة، انظر إلى شيء على بعد 20 قدماً (6 أمتار) لمدة 20 ثانية. هذه القاعدة البسيطة تقلل إجهاد العين بشكل ملحوظ وتساعد في منع جفاف العين والصداع الناتج عن الاستخدام المطول للشاشات.
                  </p>
                </div>
              </div>

              {/* Tip 2 */}
              <div className="flex gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.15)" }}
                >
                  <span className="text-sm font-bold" style={{ color: "#a855f7" }}>2</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold mb-1" style={{ color: "#e2e8f0" }}>
                    الإضاءة المناسبة
                  </h4>
                  <p className="text-xs leading-relaxed" style={{ color: "#94a3b8" }}>
                    تجنب العمل في الظلام الدامس أو تحت إضاءة ساطعة جداً. أفضل ظروف الإضاءة هي أن تكون إضاءة الغرفة مماثلة لسطوع الشاشة. استخدم مصابح مكتبية ذات ضوء دافئ لتقليل التباين بين الشاشة والبيئة المحيطة.
                  </p>
                </div>
              </div>

              {/* Tip 3 */}
              <div className="flex gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: "rgba(0,212,170,0.1)", border: "1px solid rgba(0,212,170,0.15)" }}
                >
                  <span className="text-sm font-bold" style={{ color: "#00d4aa" }}>3</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold mb-1" style={{ color: "#e2e8f0" }}>
                    قياس مسافة البؤبؤ بانتظام
                  </h4>
                  <p className="text-xs leading-relaxed" style={{ color: "#94a3b8" }}>
                    القياس الدقيق لمسافة البؤبؤ (PD) ضروري للحصول على نظارات مريحة وفعالة. النظارات ذات القياس الخاطئ تسبب صداع وإجهاد العين. استخدم تطبيق OptiSize لقياس مسافة البؤبؤ بدقة عالية من المنزل.
                  </p>
                </div>
              </div>

              {/* Tip 4 */}
              <div className="flex gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.15)" }}
                >
                  <span className="text-sm font-bold" style={{ color: "#fbbf24" }}>4</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold mb-1" style={{ color: "#e2e8f0" }}>
                    الفحص الدوري للعين
                  </h4>
                  <p className="text-xs leading-relaxed" style={{ color: "#94a3b8" }}>
                    يُنصح بزيارة طبيب العيون مرة واحدة على الأقل كل سنة، حتى لو لم تلاحظ أي مشاكل في النظر. بعض أمراض العين مثل المياه الزرقاء تتطور تدريجياً دون أعراض واضحة في البداية، والاكتشاف المبكر يُحدث فرقاً كبيراً في العلاج.
                  </p>
                </div>
              </div>

              {/* Tip 5 */}
              <div className="flex gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: "rgba(255,59,48,0.1)", border: "1px solid rgba(255,59,48,0.15)" }}
                >
                  <span className="text-sm font-bold" style={{ color: "#ff3b30" }}>5</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold mb-1" style={{ color: "#e2e8f0" }}>
                    التغذية السليمة للعين
                  </h4>
                  <p className="text-xs leading-relaxed" style={{ color: "#94a3b8" }}>
                    تناول الأطعمة الغنية بفيتامين A وC وE وأوميغا 3، مثل الجزر والسبانخ والسمك والبرتقال. هذه العناصر الغذائية تلعب دوراً حيوياً في حماية العين من الضمور البقعي المرتبط بالعمر وإعتام عدسة العين.
                  </p>
                </div>
              </div>

              {/* Medical Warning */}
              <div
                className="rounded-xl p-3 mt-3"
                style={{
                  background: "rgba(255,59,48,0.06)",
                  border: "1px solid rgba(255,59,48,0.15)",
                }}
              >
                <div className="flex gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#ff3b30" }} />
                  <div>
                    <p className="text-xs font-bold mb-1" style={{ color: "#ff6b6b" }}>
                      تحذير طبي هام
                    </p>
                    <p className="text-[11px] leading-relaxed" style={{ color: "#94a3b8" }}>
                      هذا التطبيق أداة مساعدة فقط ولا يُغني عن استشارة طبيب العيون المتخصص. إذا كنت تعاني من ألم في العين، أو ضعف مفاجئ في النظر، أو أي أعراض مقلقة، تواصل فوراً مع طبيب مختص. التشخيص الذاتي قد يكون خطيراً على صحتك.
                    </p>
                  </div>
                </div>
              </div>

              {/* Reliability Badge */}
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{
                  background: "rgba(0,240,255,0.04)",
                  border: "1px solid rgba(0,240,255,0.08)",
                }}
              >
                <ShieldCheck className="w-3.5 h-3.5" style={{ color: "#00d4aa" }} />
                <span className="text-[10px]" style={{ color: "#00d4aa" }}>
                  محتوى طبي مراجع - للاطلاع فقط وليس للتشخيص
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          variants={itemVariants}
          className="glass-card rounded-xl p-4 mb-6"
        >
          <div className="flex gap-3">
            <Info
              className="w-5 h-5 shrink-0 mt-0.5"
              style={{ color: "#ffa500" }}
            />
            <p
              className="text-xs leading-relaxed"
              style={{ color: "#94a3b8" }}
            >
              {t("menu.disclaimer")}
            </p>
          </div>
        </motion.div>

        {/* Contact Button */}
        <motion.div variants={itemVariants} className="mb-6">
          <Button
            asChild
            className="w-full h-11 rounded-xl font-medium transition-all hover:opacity-90"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#e2e8f0",
            }}
          >
            <a href="mailto:mohamed10.mohamed10@gmail.com">
              <Mail
                className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`}
                style={{ color: "#00f0ff" }}
              />
              {t("menu.contact")}
            </a>
          </Button>
        </motion.div>

        {/* Legal Links */}
        <motion.div variants={itemVariants} className="mb-4">
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/privacy" className="text-[10px] px-2.5 py-1 rounded-lg transition-all hover:bg-white/5" style={{ color: "#64748b", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
              سياسة الخصوصية
            </Link>
            <Link href="/about" className="text-[10px] px-2.5 py-1 rounded-lg transition-all hover:bg-white/5" style={{ color: "#64748b", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
              من نحن
            </Link>
            <Link href="/terms" className="text-[10px] px-2.5 py-1 rounded-lg transition-all hover:bg-white/5" style={{ color: "#64748b", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
              شروط الاستخدام
            </Link>
            <Link href="/contact" className="text-[10px] px-2.5 py-1 rounded-lg transition-all hover:bg-white/5" style={{ color: "#64748b", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
              تواصل معنا
            </Link>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div variants={itemVariants} className="text-center pt-4">
          <div
            className="h-px mx-auto mb-4 max-w-[200px]"
            style={{ background: "rgba(255,255,255,0.08)" }}
          />
          <p className="text-xs" style={{ color: "#64748b" }}>
            {t("menu.rights")}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
