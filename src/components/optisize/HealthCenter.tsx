"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Eye,
  Palette,
  Focus,
  Shield,
  ChevronLeft,
  Calculator,
  MessageCircle,
  GitCompareArrows,
  Timer,
  Apple,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

interface HealthCenterProps {
  onSelectTest: (testId: string) => void;
  onBack: () => void;
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

export default function HealthCenter({ onSelectTest, onBack }: HealthCenterProps) {
  const { t } = useI18n();

  // Diagnostic tests section
  const diagnosticTests = [
    {
      id: "visual-acuity",
      title: "اختبار حدة البصر",
      subtitle: "Visual Acuity",
      description: "فحص مدى وضوح رؤيتك للأشياء القريبة والبعيدة",
      icon: Eye,
      gradient: "linear-gradient(135deg, #a855f7, #6366f1)",
      color: "#a855f7",
    },
    {
      id: "color-test",
      title: "اختبار الألوان",
      subtitle: "Color Vision",
      description: "فحص قدرتك على تمييز الألوان المختلفة باستخدام ألواح إيشيهارا",
      icon: Palette,
      gradient: "linear-gradient(135deg, #ff3b30, #ff6b6b)",
      color: "#ff3b30",
    },
    {
      id: "strabismus-test",
      title: "فحص الحول",
      subtitle: "Strabismus Screening",
      description: "اكتشاف علامات الحول وتقييم حالة محاذاة العينين",
      icon: Focus,
      gradient: "linear-gradient(135deg, #ffa500, #ff6b00)",
      color: "#ffa500",
    },
    {
      id: "cataract-test",
      title: "فحص المياه البيضاء",
      subtitle: "Cataract Screening",
      description: "تقييم خطر الإصابة بالمياه البيضاء من خلال الأعراض الشائعة",
      icon: Shield,
      gradient: "linear-gradient(135deg, #00d4aa, #00a88a)",
      color: "#00d4aa",
    },
    {
      id: "glaucoma-test",
      title: "فحص المياه الزرقاء",
      subtitle: "Glaucoma Screening",
      description: "فحص مبكر لارتفاع ضغط العين وتقييم مجال الرؤية الجانبية",
      icon: Eye,
      gradient: "linear-gradient(135deg, #00f0ff, #0080ff)",
      color: "#00f0ff",
    },
  ];

  // Eye Health Tools section (NEW)
  const healthTools = [
    {
      id: "prescription-calculator",
      title: t("health.calculator"),
      subtitle: "Prescription Calculator",
      description: t("health.calculatorDesc"),
      icon: Calculator,
      gradient: "linear-gradient(135deg, #00f0ff, #0080ff)",
      color: "#00f0ff",
    },
    {
      id: "medical-chat",
      title: t("health.chat"),
      subtitle: "AI Medical Chat",
      description: t("health.chatDesc"),
      icon: MessageCircle,
      gradient: "linear-gradient(135deg, #a855f7, #6366f1)",
      color: "#a855f7",
    },
    {
      id: "prescription-comparison",
      title: t("health.compare"),
      subtitle: "Prescription Comparison",
      description: t("health.compareDesc"),
      icon: GitCompareArrows,
      gradient: "linear-gradient(135deg, #ffa500, #ff6b00)",
      color: "#ffa500",
    },
    {
      id: "eye-protection",
      title: t("health.protection"),
      subtitle: "Eye Protection Mode",
      description: t("health.protectionDesc"),
      icon: Timer,
      gradient: "linear-gradient(135deg, #00d4aa, #00a88a)",
      color: "#00d4aa",
    },
    {
      id: "eye-nutrition",
      title: t("health.nutrition"),
      subtitle: "Eye Nutrition",
      description: t("health.nutritionDesc"),
      icon: Apple,
      gradient: "linear-gradient(135deg, #ff3b30, #ff6b6b)",
      color: "#ff3b30",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0a0e1a" }}>
      {/* Background decoration */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(255,59,48,0.05) 0%, transparent 50%)",
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between p-4 relative z-10">
        <Button
          onClick={onBack}
          variant="ghost"
          size="icon"
          className="w-10 h-10 rounded-xl hover:bg-white/5"
          style={{ color: "#94a3b8" }}
        >
          <ArrowRight className="w-5 h-5" />
        </Button>
        <div className="text-center">
          <h1 className="text-base font-bold" style={{ color: "#e2e8f0" }}>
            {t("health.title")}
          </h1>
          <p className="text-xs" style={{ color: "#64748b" }}>
            Eye Health Center
          </p>
        </div>
        <div className="w-10" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 px-4 pb-8 space-y-3 relative z-10"
      >
        {/* Diagnostic Tests Section */}
        <motion.div variants={itemVariants}>
          <h2 className="text-sm font-semibold mb-3" style={{ color: "#94a3b8" }}>
            الفحوصات التشخيصية
          </h2>
          <div className="space-y-3">
            {diagnosticTests.map((test) => (
              <motion.button
                key={test.id}
                onClick={() => onSelectTest(test.id)}
                className="w-full text-right rounded-2xl p-4 transition-all duration-200 group"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
                whileHover={{
                  scale: 1.015,
                  borderColor: `${test.color}40`,
                  boxShadow: `0 8px 32px ${test.color}10`,
                }}
                whileTap={{ scale: 0.985 }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200"
                    style={{ background: test.gradient }}
                  >
                    <test.icon className="w-6 h-6" style={{ color: "#0a0e1a" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: "#e2e8f0" }}>
                      {test.title}
                    </p>
                    <p className="text-[10px] mt-0.5" style={{ color: test.color }}>
                      {test.subtitle}
                    </p>
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: "#94a3b8" }}>
                      {test.description}
                    </p>
                  </div>
                  <ChevronLeft className="w-4 h-4 shrink-0" style={{ color: "#64748b" }} />
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Separator */}
        <motion.div variants={itemVariants} className="flex items-center gap-3 py-2">
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
          <span className="text-[10px]" style={{ color: "#64748b" }}>أدوات صحة العين</span>
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
        </motion.div>

        {/* Health Tools Section (NEW) */}
        <motion.div variants={itemVariants}>
          <div className="space-y-3">
            {healthTools.map((tool) => (
              <motion.button
                key={tool.id}
                onClick={() => onSelectTest(tool.id)}
                className="w-full text-right rounded-2xl p-4 transition-all duration-200 group"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
                whileHover={{
                  scale: 1.015,
                  borderColor: `${tool.color}40`,
                  boxShadow: `0 8px 32px ${tool.color}10`,
                }}
                whileTap={{ scale: 0.985 }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200"
                    style={{ background: tool.gradient }}
                  >
                    <tool.icon className="w-6 h-6" style={{ color: "#0a0e1a" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: "#e2e8f0" }}>
                      {tool.title}
                    </p>
                    <p className="text-[10px] mt-0.5" style={{ color: tool.color }}>
                      {tool.subtitle}
                    </p>
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: "#94a3b8" }}>
                      {tool.description}
                    </p>
                  </div>
                  <ChevronLeft className="w-4 h-4 shrink-0" style={{ color: "#64748b" }} />
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Info */}
        <motion.div variants={itemVariants} className="glass-card rounded-xl p-4 mt-4">
          <p className="text-xs leading-relaxed" style={{ color: "#94a3b8" }}>
            هذه الفحوصات والأدوات للتوعية والتوجيه فقط ولا تُغني عن الفحص الدقيق عند طبيب العيون المتخصص.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
