"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Sun,
  Eye,
  Maximize2,
  Smile,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalibrationGuideProps {
  onBack: () => void;
  onStart: () => void;
}

const tips = [
  {
    icon: Sun,
    title: "التقط صورة في إضاءة جيدة",
    titleAr: "إضاءة جيدة",
    description: "تجنب الإضاءة الخلفية القوية واستخدم إضاءة طبيعية أو موزعة بشكل متساوٍ على وجهك",
    color: "#FFA500",
    bgColor: "rgba(255,165,0,0.1)",
    borderColor: "rgba(255,165,0,0.2)",
  },
  {
    icon: Eye,
    title: "انظر مباشرة للكاميرا",
    titleAr: "مواجهة الكاميرا مباشرة",
    description: "اجعل نظرك موجهًا مباشرة نحو الكاميرا مع إبقاء عينيك مفتوحتين بشكل طبيعي",
    color: "#00f0ff",
    bgColor: "rgba(0,240,255,0.1)",
    borderColor: "rgba(0,240,255,0.2)",
  },
  {
    icon: Maximize2,
    title: "اجعل وجهك في المنتصف",
    titleAr: "توسيط الوجه",
    description: "وجهك يجب أن يكون في منتصف الصورة مع مسافة كافية حوله",
    color: "#00d4aa",
    bgColor: "rgba(0,212,170,0.1)",
    borderColor: "rgba(0,212,170,0.2)",
  },
  {
    icon: Smile,
    title: "أبقِ تعبير وجهك طبيعي",
    titleAr: "تعبير طبيعي",
    description: "لا تبتسم أو تقطب حاجبيك، أبقِ تعبير وجهك مسترخيًا وطبيعيًا",
    color: "#a855f7",
    bgColor: "rgba(168,85,247,0.1)",
    borderColor: "rgba(168,85,247,0.2)",
  },
];

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export default function CalibrationGuide({ onBack, onStart }: CalibrationGuideProps) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0a0e1a" }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4">
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
            دليل التجربة الافتراضية
          </h1>
          <p className="text-xs" style={{ color: "#64748b" }}>
            دليل التجربة الافتراضية
          </p>
        </div>
        <div className="w-10" />
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-6 overflow-y-auto custom-scrollbar">
        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 mt-2"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: "linear-gradient(135deg, rgba(0,240,255,0.12), rgba(0,128,255,0.08))",
              border: "1px solid rgba(0,240,255,0.2)",
            }}
          >
            <Sparkles className="w-8 h-8" style={{ color: "#00f0ff" }} />
          </motion.div>
          <h2 className="text-lg font-bold mb-2" style={{ color: "#e2e8f0" }}>
            للحصول على أفضل نتيجة
          </h2>
          <p className="text-xs leading-relaxed" style={{ color: "#64748b" }}>
            اتبع هذه النصائح للحصول على تجربة افتراضية دقيقة ومريحة للنظارات
          </p>
        </motion.div>

        {/* Tips */}
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="space-y-3 mb-8"
        >
          {tips.map((tip, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="p-4 rounded-2xl"
              style={{
                background: `linear-gradient(135deg, ${tip.bgColor} 0%, rgba(255,255,255,0.02) 100%)`,
                border: `1px solid ${tip.borderColor}`,
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: tip.bgColor,
                    border: `1px solid ${tip.borderColor}`,
                  }}
                >
                  <tip.icon className="w-5 h-5" style={{ color: tip.color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3
                      className="text-sm font-semibold"
                      style={{ color: "#e2e8f0" }}
                    >
                      {tip.title}
                    </h3>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        color: "#64748b",
                      }}
                    >
                      {tip.titleAr}
                    </span>
                  </div>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "#94a3b8" }}
                  >
                    {tip.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Tips */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-4 rounded-2xl mb-6"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4" style={{ color: "#00d4aa" }} />
            <h3 className="text-sm font-semibold" style={{ color: "#e2e8f0" }}>
              نصائح إضافية
            </h3>
          </div>
          <ul className="space-y-2">
            {[
              "أزل النظارة الحالية قبل التقاط الصورة",
              "اسحب النظارة على الصورة لضبط الموضع يدويًا",
              "استخدم أشرطة التحكم لتغيير الحجم والدوران",
              "يمكنك تحميل الصورة النهائية ومشاركتها",
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-2">
                <div
                  className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                  style={{ background: "#00d4aa" }}
                />
                <span className="text-xs" style={{ color: "#94a3b8" }}>
                  {text}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Start Button */}
      <div className="p-4" style={{ background: "linear-gradient(0deg, #0a0e1a 0%, transparent 100%)" }}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            onClick={onStart}
            className="w-full h-12 rounded-xl text-sm font-semibold"
            style={{
              background: "linear-gradient(135deg, #00f0ff, #0080ff)",
              color: "#0a0e1a",
              boxShadow: "0 0 20px rgba(0,240,255,0.2)",
            }}
          >
            <CheckCircle2 className="w-4 h-4 ml-2" />
            فهمت، ابدأ التجربة
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
