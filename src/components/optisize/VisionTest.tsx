"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Eye,
  Palette,
  CircleDot,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface VisionTestProps {
  onSelectTest: (testId: string) => void;
  onBack: () => void;
}

const tests = [
  {
    id: "visual-acuity",
    title: "حدة البصر",
    subtitle: "Visual Acuity Test",
    description: "اختبار حدة الرؤية باستخدام أحرف Snellen بأحجام مختلفة",
    icon: Eye,
    gradient: "linear-gradient(135deg, #a855f7, #6366f1)",
    color: "#a855f7",
  },
  {
    id: "color-vision",
    title: "اختبار الألوان",
    subtitle: "Ishihara Color Test",
    description: "فحص قدرتك على تمييز الألوان باستخدام ألواح إيشيهارا",
    icon: Palette,
    gradient: "linear-gradient(135deg, #ff3b30, #ff6b6b)",
    color: "#ff3b30",
  },
  {
    id: "astigmatism",
    title: "الاستيجماتيزم",
    subtitle: "Astigmatism Test",
    description: "اختبار لفحص عدم انتظام القرنية ومدى تأثيره على رؤيتك",
    icon: CircleDot,
    gradient: "linear-gradient(135deg, #ffa500, #ff6b00)",
    color: "#ffa500",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export default function VisionTest({ onSelectTest, onBack }: VisionTestProps) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0a0e1a" }}>
      {/* Background decoration */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(168,85,247,0.05) 0%, transparent 50%)",
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
            اختبارات النظر
          </h1>
          <p className="text-xs" style={{ color: "#64748b" }}>
            Vision Tests
          </p>
        </div>
        <div className="w-10" />
      </div>

      {/* Test Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 px-4 pb-8 space-y-3 relative z-10"
      >
        <motion.p variants={itemVariants} className="text-xs mb-4" style={{ color: "#64748b" }}>
          اختر اختباراً للبدء
        </motion.p>

        {tests.map((test, index) => (
          <motion.div key={test.id} variants={itemVariants}>
            <motion.button
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
                  className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200"
                  style={{ background: test.gradient }}
                >
                  <test.icon className="w-7 h-7" style={{ color: "#0a0e1a" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold" style={{ color: "#e2e8f0" }}>
                    {test.title}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: test.color }}>
                    {test.subtitle}
                  </p>
                  <p className="text-xs mt-2 leading-relaxed" style={{ color: "#94a3b8" }}>
                    {test.description}
                  </p>
                </div>
                <ChevronLeft className="w-5 h-5 shrink-0" style={{ color: "#64748b" }} />
              </div>
            </motion.button>
          </motion.div>
        ))}

        {/* Info Card */}
        <motion.div variants={itemVariants} className="glass-card rounded-xl p-4 mt-4">
          <p className="text-xs leading-relaxed" style={{ color: "#94a3b8" }}>
            هذه الاختبارات للتوجيه فقط ولا تُغني عن الفحص الدقيق عند طبيب العيون.
            يُنصح بإجراء فحص شامل بشكل دوري.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
