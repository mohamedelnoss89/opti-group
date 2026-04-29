"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sun,
  Moon,
  Lightbulb,
  Eye,
  Gauge,
  AlertTriangle,
  CheckCircle2,
  Info,
  SlidersHorizontal,
  Monitor,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface LightSensitivityProps {
  onBack: () => void;
}

type LightLevel = "normal" | "low" | "high";

interface LightReading {
  lux: number;
  level: LightLevel;
  color: string;
  label: string;
  description: string;
}

function getLightReading(lux: number): LightReading {
  if (lux < 100) {
    return {
      lux,
      level: "low",
      color: "#ffa500",
      label: "إضاءة ضعيفة",
      description: "قد تُجهد عينيك عند القراءة أو العمل في هذه الإضاءة",
    };
  } else if (lux <= 500) {
    return {
      lux,
      level: "normal",
      color: "#00d4aa",
      label: "إضاءة طبيعية",
      description: "مستوى الإضاءة مناسب لمعظم الأنشطة",
    };
  } else {
    return {
      lux,
      level: "high",
      color: "#ff3b30",
      label: "إضاءة قوية",
      description: "قد تؤذي عينيك عند التعرض المطوّل. استخدم حماية من الوهج",
    };
  }
}

const tips = [
  {
    icon: Sun,
    title: "تجنب الوهج المباشر",
    description: "لا تنظر مباشرة للشمس أو المصابيح الساطعة",
    color: "#ffa500",
  },
  {
    icon: Lightbulb,
    title: "إضاءة متوازنة",
    description: "استخدم إضاءة محيطة مع إضاءة مركزة عند القراءة",
    color: "#00d4aa",
  },
  {
    icon: Monitor,
    title: "ضبط سطوع الشاشة",
    description:
      "اجعل سطوع الشاشة مساوياً تقريباً لإضاءة المحيط حولك",
    color: "#0080ff",
  },
  {
    icon: Eye,
    title: "قاعدة 20-20-20",
    description: "كل 20 دقيقة، انظر بعيداً 6 أمتار لمدة 20 ثانية",
    color: "#a855f7",
  },
];

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

export default function LightSensitivity({ onBack }: LightSensitivityProps) {
  const [sensorAvailable, setSensorAvailable] = useState(false);
  const [sensorLux, setSensorLux] = useState<number | null>(null);
  const [manualLux, setManualLux] = useState(300);
  const [useManual, setUseManual] = useState(() => {
    // No sensor available by default, will be updated by effect
    return !("AmbientLightSensor" in window);
  });

  // Try to use ambient light sensor
  useEffect(() => {
    if (!("AmbientLightSensor" in window)) return;

    let cancelled = false;
    try {
      const ALS = (window as Record<string, typeof AmbientLightSensor>).AmbientLightSensor;
      const sensor = new ALS();
      sensor.addEventListener("reading", () => {
        if (!cancelled) {
          setSensorLux(sensor.illuminance);
          setSensorAvailable(true);
        }
      });
      sensor.addEventListener("error", () => {
        if (!cancelled) {
          setSensorAvailable(false);
          setUseManual(true);
        }
      });
      sensor.start();
      return () => {
        cancelled = true;
        sensor.stop();
      };
    } catch {
      // Sensor failed, use manual mode
    }
  }, []);

  const currentLux = useManual ? manualLux : sensorLux ?? 300;
  const reading = getLightReading(currentLux);

  // Gauge calculation (0-1000 lux range, logarithmic)
  const gaugePercent = Math.min(
    100,
    Math.max(0, (Math.log10(currentLux + 1) / Math.log10(1001)) * 100)
  );

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setManualLux(Number(e.target.value));
    },
    []
  );

  const lightLevels: { range: string; level: LightLevel; color: string; label: string }[] = [
    { range: "0-100", level: "low", color: "#ffa500", label: "ضعيفة" },
    { range: "100-500", level: "normal", color: "#00d4aa", label: "طبيعية" },
    { range: "500-1000+", level: "high", color: "#ff3b30", label: "قوية" },
  ];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#0a0e1a" }}
    >
      {/* Background decoration */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(255,165,0,0.05) 0%, transparent 50%)",
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
            تحساس الإضاءة
          </h1>
          <p className="text-xs" style={{ color: "#64748b" }}>
            تحسس الإضاءة
          </p>
        </div>
        <div className="w-10" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 px-4 pb-8 relative z-10"
      >
        {/* Sensor Status */}
        <motion.div variants={itemVariants} className="mb-4">
          <div
            className="rounded-xl p-3 flex items-center gap-3"
            style={{
              background: sensorAvailable
                ? "rgba(0,212,170,0.06)"
                : "rgba(255,165,0,0.06)",
              border: sensorAvailable
                ? "1px solid rgba(0,212,170,0.15)"
                : "1px solid rgba(255,165,0,0.15)",
            }}
          >
            {sensorAvailable ? (
              <CheckCircle2
                className="w-5 h-5 shrink-0"
                style={{ color: "#00d4aa" }}
              />
            ) : (
              <Info
                className="w-5 h-5 shrink-0"
                style={{ color: "#ffa500" }}
              />
            )}
            <div>
              <p
                className="text-xs font-medium"
                style={{
                  color: sensorAvailable ? "#00d4aa" : "#ffa500",
                }}
              >
                {sensorAvailable
                  ? "مستشعر الإضاءة متاح"
                  : "مستشعر الإضاءة غير متاح"}
              </p>
              <p className="text-[10px]" style={{ color: "#94a3b8" }}>
                {sensorAvailable
                  ? "يتم قراءة مستوى الإضاءة تلقائياً من جهازك"
                  : "يمكنك تقدير مستوى الإضاءة يدوياً باستخدام الشريط أدناه"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Gauge Display */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center py-6"
        >
          <div className="relative w-52 h-52">
            <svg
              className="w-full h-full -rotate-90"
              viewBox="0 0 200 200"
            >
              {/* Background arc */}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="10"
                strokeDasharray={`${Math.PI * 80} ${Math.PI * 80}`}
                strokeLinecap="round"
              />
              {/* Low range */}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="rgba(255,165,0,0.15)"
                strokeWidth="10"
                strokeDasharray={`${Math.PI * 80 * 0.33} ${Math.PI * 80}`}
                strokeLinecap="round"
              />
              {/* Normal range */}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="rgba(0,212,170,0.15)"
                strokeWidth="10"
                strokeDasharray={`${Math.PI * 80 * 0.33} ${Math.PI * 80}`}
                strokeDashoffset={`${-Math.PI * 80 * 0.33}`}
                strokeLinecap="round"
              />
              {/* High range */}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="rgba(255,59,48,0.15)"
                strokeWidth="10"
                strokeDasharray={`${Math.PI * 80 * 0.34} ${Math.PI * 80}`}
                strokeDashoffset={`${-Math.PI * 80 * 0.66}`}
                strokeLinecap="round"
              />
              {/* Current value indicator */}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke={reading.color}
                strokeWidth="10"
                strokeDasharray={`${(gaugePercent / 100) * Math.PI * 80} ${Math.PI * 80}`}
                strokeLinecap="round"
                style={{
                  filter: `drop-shadow(0 0 8px ${reading.color}60)`,
                  transition: "stroke-dasharray 0.5s ease, stroke 0.3s",
                }}
              />
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {reading.level === "low" ? (
                <Moon
                  className="w-7 h-7 mb-2"
                  style={{ color: reading.color }}
                />
              ) : reading.level === "high" ? (
                <Sun
                  className="w-7 h-7 mb-2"
                  style={{ color: reading.color }}
                />
              ) : (
                <Sun
                  className="w-7 h-7 mb-2"
                  style={{ color: reading.color }}
                />
              )}
              <p
                className="text-3xl font-bold"
                style={{
                  color: reading.color,
                  textShadow: `0 0 20px ${reading.color}50`,
                }}
              >
                {Math.round(currentLux)}
              </p>
              <p className="text-[10px] mt-1" style={{ color: "#64748b" }}>
                لوكس (lux)
              </p>
            </div>
          </div>

          {/* Level Label */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 px-4 py-2 rounded-full"
            style={{
              background: `${reading.color}12`,
              border: `1px solid ${reading.color}30`,
            }}
          >
            <p
              className="text-sm font-semibold"
              style={{ color: reading.color }}
            >
              {reading.label}
            </p>
          </motion.div>
          <p
            className="text-xs mt-2 text-center max-w-[260px] leading-relaxed"
            style={{ color: "#94a3b8" }}
          >
            {reading.description}
          </p>
        </motion.div>

        {/* Manual Slider (if no sensor) */}
        {!sensorAvailable && (
          <motion.div variants={itemVariants} className="mb-4">
            <div className="glass-card rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <SlidersHorizontal
                  className="w-4 h-4"
                  style={{ color: "#00f0ff" }}
                />
                <p
                  className="text-xs font-semibold"
                  style={{ color: "#e2e8f0" }}
                >
                  تقدير يدوي لمستوى الإضاءة
                </p>
              </div>
              <input
                type="range"
                min="0"
                max="1000"
                step="10"
                value={manualLux}
                onChange={handleSliderChange}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(90deg, #ffa500 0%, #00d4aa 40%, #ff3b30 80%, #ff3b30 100%)`,
                  accentColor: reading.color,
                }}
              />
              <div className="flex justify-between mt-1">
                <span className="text-[9px]" style={{ color: "#64748b" }}>
                  0 لوكس
                </span>
                <span className="text-[9px]" style={{ color: "#64748b" }}>
                  1000+ لوكس
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Light Level Reference */}
        <motion.div variants={itemVariants} className="mb-4">
          <div className="glass-card rounded-xl p-4">
            <p
              className="text-xs font-semibold mb-3"
              style={{ color: "#e2e8f0" }}
            >
              <Gauge className="w-4 h-4 inline ml-1" style={{ color: "#00f0ff" }} />
              مستويات الإضاءة
            </p>
            <div className="space-y-2">
              {lightLevels.map((level) => (
                <div
                  key={level.range}
                  className="flex items-center gap-3"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: level.color }}
                  />
                  <span
                    className="text-xs font-medium flex-1"
                    style={{ color: "#e2e8f0" }}
                  >
                    {level.label}
                  </span>
                  <span className="text-[10px]" style={{ color: "#64748b" }}>
                    {level.range} لوكس
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tips */}
        <motion.div variants={itemVariants}>
          <p
            className="text-xs font-semibold mb-3"
            style={{ color: "#e2e8f0" }}
          >
            💡 نصائح للإضاءة المناسبة
          </p>
          <div className="grid grid-cols-1 gap-2">
            {tips.map((tip) => (
              <div
                key={tip.title}
                className="glass-card rounded-xl p-3 flex items-start gap-3"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: `${tip.color}12`,
                    border: `1px solid ${tip.color}25`,
                  }}
                >
                  <tip.icon
                    className="w-4 h-4"
                    style={{ color: tip.color }}
                  />
                </div>
                <div>
                  <p
                    className="text-xs font-medium"
                    style={{ color: "#e2e8f0" }}
                  >
                    {tip.title}
                  </p>
                  <p
                    className="text-[10px] mt-0.5 leading-relaxed"
                    style={{ color: "#94a3b8" }}
                  >
                    {tip.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Warning */}
        <motion.div
          variants={itemVariants}
          className="mt-4 rounded-xl p-3 flex items-start gap-2"
          style={{
            background: "rgba(255,165,0,0.06)",
            border: "1px solid rgba(255,165,0,0.12)",
          }}
        >
          <AlertTriangle
            className="w-4 h-4 shrink-0 mt-0.5"
            style={{ color: "#ffa500" }}
          />
          <p className="text-[10px] leading-relaxed" style={{ color: "#94a3b8" }}>
            القياسات تقريبية وتعتمد على مستشعر الجهاز. إذا كنت تعاني من حساسية
            للضوء، استشر طبيب العيون.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
