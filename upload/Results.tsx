"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Save,
  RotateCcw,
  History,
  CheckCircle2,
  TrendingUp,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { classifyPD } from "@/lib/pdCalculation";

interface ResultsProps {
  pd: number;
  onBack: () => void;
  onSave: () => void;
  onRetake: () => void;
  onRecords: () => void;
}

export default function Results({ pd, onBack, onSave, onRetake, onRecords }: ResultsProps) {
  const classification = classifyPD(pd);
  const [animatedPD, setAnimatedPD] = useState(0);
  const [saved, setSaved] = useState(false);

  // Animate PD counter
  useEffect(() => {
    const duration = 1200;
    const steps = 60;
    const increment = pd / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= pd) {
        setAnimatedPD(pd);
        clearInterval(timer);
      } else {
        setAnimatedPD(Math.round(current * 10) / 10);
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [pd]);

  const handleSave = () => {
    onSave();
    setSaved(true);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0a0e1a" }}>
      {/* Background decoration */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${classification.color}08 0%, transparent 50%)`,
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
        <h1 className="text-base font-bold" style={{ color: "#e2e8f0" }}>
          نتيجة القياس
        </h1>
        <div className="w-10" />
      </div>

      <div className="flex-1 px-4 relative z-10">
        {/* Main Result Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl p-6 mb-4"
          style={{
            background: `linear-gradient(135deg, ${classification.bgColor}, rgba(255,255,255,0.02))`,
            border: `1px solid ${classification.color}30`,
          }}
        >
          {/* PD Value */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 150 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
              style={{
                background: `${classification.color}15`,
                border: `2px solid ${classification.color}40`,
              }}
            >
              <span className="text-3xl font-bold" style={{ color: classification.color }}>
                {animatedPD}
              </span>
            </motion.div>

            <p className="text-xs mb-2" style={{ color: "#64748b" }}>
              مسافة البؤبؤ (PD)
            </p>
            <p className="text-lg font-bold" style={{ color: classification.color }}>
              {animatedPD.toFixed(1)} مم
            </p>
          </div>

          {/* Classification Badge */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center mb-4"
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                background: `${classification.color}15`,
                border: `1px solid ${classification.color}30`,
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: classification.color }}
              />
              <span className="text-sm font-medium" style={{ color: classification.color }}>
                {classification.categoryAr}
              </span>
            </div>
          </motion.div>

          {/* Range info */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <div className="text-center">
              <p className="text-[10px]" style={{ color: "#64748b" }}>الحد الأدنى</p>
              <p className="text-sm font-bold" style={{ color: "#94a3b8" }}>{classification.minRange}</p>
            </div>
            <div className="w-px h-6" style={{ background: "rgba(255,255,255,0.1)" }} />
            <div className="text-center">
              <p className="text-[10px]" style={{ color: "#64748b" }}>المدى الطبيعي</p>
              <p className="text-sm font-bold" style={{ color: classification.color }}>
                {classification.minRange} - {classification.maxRange}
              </p>
            </div>
            <div className="w-px h-6" style={{ background: "rgba(255,255,255,0.1)" }} />
            <div className="text-center">
              <p className="text-[10px]" style={{ color: "#64748b" }}>الحد الأقصى</p>
              <p className="text-sm font-bold" style={{ color: "#94a3b8" }}>{classification.maxRange}</p>
            </div>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex gap-2 p-3 rounded-xl"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            <Info className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#64748b" }} />
            <p className="text-xs leading-relaxed" style={{ color: "#94a3b8" }}>
              {classification.descriptionAr}
            </p>
          </motion.div>
        </motion.div>

        {/* Stats Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.4 }}
          className="glass-card rounded-2xl p-4 mb-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4" style={{ color: "#00f0ff" }} />
            <p className="text-sm font-medium" style={{ color: "#e2e8f0" }}>
              تفاصيل القياس
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl text-center" style={{ background: "rgba(255,255,255,0.03)" }}>
              <p className="text-[10px] mb-1" style={{ color: "#64748b" }}>نوع القياس</p>
              <p className="text-xs font-medium" style={{ color: "#e2e8f0" }}>مسافة البؤبؤ</p>
            </div>
            <div className="p-3 rounded-xl text-center" style={{ background: "rgba(255,255,255,0.03)" }}>
              <p className="text-[10px] mb-1" style={{ color: "#64748b" }}>الدقة</p>
              <p className="text-xs font-medium" style={{ color: "#e2e8f0" }}>±0.5 مم</p>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.4 }}
          className="space-y-3 pb-8"
        >
          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={saved}
            className="w-full h-12 rounded-xl font-medium text-base transition-all"
            style={{
              background: saved
                ? "rgba(0, 212, 170, 0.15)"
                : "linear-gradient(135deg, #00d4aa, #00a88a)",
              color: saved ? "#00d4aa" : "#0a0e1a",
              border: saved ? "1px solid rgba(0, 212, 170, 0.3)" : "none",
            }}
          >
            {saved ? (
              <>
                <CheckCircle2 className="w-5 h-5 ml-2" />
                تم الحفظ بنجاح
              </>
            ) : (
              <>
                <Save className="w-5 h-5 ml-2" />
                حفظ القياس
              </>
            )}
          </Button>

          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={onRetake}
              variant="ghost"
              className="h-11 rounded-xl text-xs"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#e2e8f0",
              }}
            >
              <RotateCcw className="w-4 h-4 ml-1" />
              إعادة القياس
            </Button>
            <Button
              onClick={onRecords}
              variant="ghost"
              className="h-11 rounded-xl text-xs"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#e2e8f0",
              }}
            >
              <History className="w-4 h-4 ml-1" />
              عرض السجلات
            </Button>
            <Button
              onClick={onBack}
              variant="ghost"
              className="h-11 rounded-xl text-xs"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#e2e8f0",
              }}
            >
              <ArrowRight className="w-4 h-4 ml-1" />
              رجوع
            </Button>
          </div>

          {/* Disclaimer */}
          <div className="flex gap-2 p-3 rounded-xl mt-4" style={{ background: "rgba(255,165,0,0.05)" }}>
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "#ffa500" }} />
            <p className="text-[10px] leading-relaxed" style={{ color: "#94a3b8" }}>
              هذا القياس تقريبي. للحصول على قياسات دقيقة، يُنصح بزيارة طبيب العيون المتخصص.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
