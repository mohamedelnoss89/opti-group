"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  RotateCcw,
  Eye,
  Shield,
  Sparkles,
  Sun,
  Monitor,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface PrescriptionCalculatorProps {
  onBack: () => void;
  pdValue?: number | null;
}

interface EyeValues {
  sph: number;
  cyl: number;
  axis: number;
  add: number;
}

interface LensRecommendation {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
}

const defaultEye: EyeValues = { sph: 0, cyl: 0, axis: 0, add: 0 };

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

function generateSteps(min: number, max: number, step: number): number[] {
  const steps: number[] = [];
  for (let v = min; v <= max; v += step) {
    steps.push(Math.round(v * 100) / 100);
  }
  return steps;
}

const sphSteps = generateSteps(-20, 20, 0.25);
const cylSteps = generateSteps(-10, 10, 0.25);
const addSteps = generateSteps(0, 4, 0.25);

function calculateRecommendations(
  od: EyeValues,
  os: EyeValues
): LensRecommendation[] {
  const recs: LensRecommendation[] = [];
  const hasCyl = od.cyl !== 0 || os.cyl !== 0;
  const hasSph = od.sph !== 0 || os.sph !== 0;
  const hasAdd = od.add > 0 || os.add > 0;
  const maxSph = Math.max(Math.abs(od.sph), Math.abs(os.sph));

  if (hasCyl) {
    recs.push({
      id: "toric",
      title: "عدسات أسطوانية (Toric)",
      subtitle: "عدسات أسطوانية",
      description: "لديك أستيجماتيزم ويحتاج عدسة خاصة بتصحيح الانحناء",
      icon: Eye,
      color: "#00f0ff",
      gradient: "linear-gradient(135deg, #00f0ff, #0080ff)",
    });
  } else if (hasSph) {
    recs.push({
      id: "spherical",
      title: "عدسات كروية",
      subtitle: "عدسات كروية",
      description: "تصحيح بسيط لقصر أو مد البصر",
      icon: Eye,
      color: "#0080ff",
      gradient: "linear-gradient(135deg, #0080ff, #0050cc)",
    });
  }

  if (hasAdd) {
    recs.push({
      id: "progressive",
      title: "عدسات متدرجة (Progressive)",
      subtitle: "عدسات متدرجة",
      description:
        "تحتاج تصحيح للبعد وللقرب في نفس العدسة بدون خط واضح",
      icon: ChevronDown,
      color: "#a855f7",
      gradient: "linear-gradient(135deg, #a855f7, #6366f1)",
    });
  }

  if (maxSph > 4) {
    recs.push({
      id: "highIndex",
      title: "عدسات عالية المؤشر (High Index)",
      subtitle: "عدسات عالية المؤشر",
      description:
        "الوصفة قوية والعدسة العادية ستكون سميكة. المؤشر العالي يسمح بعدسة أرفع",
      icon: Sparkles,
      color: "#ffa500",
      gradient: "linear-gradient(135deg, #ffa500, #ff6b00)",
    });
  }

  // Always recommended
  recs.push({
    id: "blueLight",
    title: "حماية من الضوء الأزرق",
    subtitle: "حماية من الضوء الأزرق",
    description:
      "شاشات الهاتف والكمبيوتر تصدر ضوء أزرق قد يسبب إجهاد العين واضطرابات النوم",
    icon: Monitor,
    color: "#0080ff",
    gradient: "linear-gradient(135deg, #0080ff, #0050cc)",
  });

  recs.push({
    id: "transition",
    title: "عدسات متحولة الضوء (Transition)",
    subtitle: "عدسات متحولة الضوء",
    description:
      "تتغير لونها تلقائياً من شفافة إلى داكنة تحت الشمس. راحة إضافية وبدون حاجة لنظارات شمس منفصلة",
    icon: Sun,
    color: "#00d4aa",
    gradient: "linear-gradient(135deg, #00d4aa, #00a88a)",
  });

  return recs;
}

function NumberInput({
  label,
  value,
  onChange,
  steps,
  min,
  max,
  step,
  unit,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  steps?: number[];
  min: number;
  max: number;
  step: number;
  unit?: string;
}) {
  const increment = () => {
    const next = Math.round((value + step) * 100) / 100;
    if (next <= max) onChange(next);
  };
  const decrement = () => {
    const next = Math.round((value - step) * 100) / 100;
    if (next >= min) onChange(next);
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] font-medium" style={{ color: "#64748b" }}>
        {label}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={decrement}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all active:scale-90"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#94a3b8",
          }}
        >
          −
        </button>
        <div
          className="w-16 h-8 rounded-lg flex items-center justify-center text-sm font-semibold"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "#e2e8f0",
          }}
        >
          {value >= 0 ? "+" : ""}
          {value.toFixed(2)}
          {unit && (
            <span className="text-[9px] mr-0.5" style={{ color: "#64748b" }}>
              {unit}
            </span>
          )}
        </div>
        <button
          onClick={increment}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all active:scale-90"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#94a3b8",
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function PrescriptionCalculator({
  onBack,
  pdValue,
}: PrescriptionCalculatorProps) {
  const [od, setOd] = useState<EyeValues>({ ...defaultEye });
  const [os, setOs] = useState<EyeValues>({ ...defaultEye });
  const [results, setResults] = useState<LensRecommendation[] | null>(null);
  const [showResults, setShowResults] = useState(false);

  const updateOd = useCallback(
    (field: keyof EyeValues, value: number) => {
      setOd((prev) => ({ ...prev, [field]: value }));
      setShowResults(false);
    },
    []
  );

  const updateOs = useCallback(
    (field: keyof EyeValues, value: number) => {
      setOs((prev) => ({ ...prev, [field]: value }));
      setShowResults(false);
    },
    []
  );

  const handleCalculate = useCallback(() => {
    const recs = calculateRecommendations(od, os);
    setResults(recs);
    setShowResults(true);
  }, [od, os]);

  const handleReset = useCallback(() => {
    setOd({ ...defaultEye });
    setOs({ ...defaultEye });
    setResults(null);
    setShowResults(false);
  }, []);

  const hasValues =
    od.sph !== 0 || od.cyl !== 0 || od.add !== 0 || os.sph !== 0 || os.cyl !== 0 || os.add !== 0;

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
            "radial-gradient(ellipse at 50% 0%, rgba(0,240,255,0.05) 0%, transparent 50%)",
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
            حاسبة النظارات
          </h1>
          <p className="text-xs" style={{ color: "#64748b" }}>
            حاسبة النظارات
          </p>
        </div>
        <Button
          onClick={handleReset}
          variant="ghost"
          size="icon"
          className="w-10 h-10 rounded-xl hover:bg-white/5"
          style={{ color: "#94a3b8" }}
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 px-4 pb-8 space-y-4 relative z-10"
      >
        {/* PD Bar */}
        <motion.div variants={itemVariants}>
          {pdValue ? (
            <div
              className="rounded-xl p-3 flex items-center gap-3"
              style={{
                background: "rgba(0,212,170,0.08)",
                border: "1px solid rgba(0,212,170,0.2)",
              }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #00d4aa, #00a88a)",
                }}
              >
                <Eye className="w-5 h-5" style={{ color: "#0a0e1a" }} />
              </div>
              <div>
                <p
                  className="text-xs font-medium"
                  style={{ color: "#00d4aa" }}
                >
                  مسافة البؤبؤ (PD)
                </p>
                <p className="text-sm font-bold" style={{ color: "#e2e8f0" }}>
                  {pdValue} مم
                </p>
              </div>
            </div>
          ) : (
            <div
              className="rounded-xl p-3 flex items-center gap-3"
              style={{
                background: "rgba(255,165,0,0.06)",
                border: "1px solid rgba(255,165,0,0.15)",
              }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{
                  background: "rgba(255,165,0,0.12)",
                }}
              >
                <Eye className="w-5 h-5" style={{ color: "#ffa500" }} />
              </div>
              <div>
                <p
                  className="text-xs font-medium"
                  style={{ color: "#ffa500" }}
                >
                  مسافة البؤبؤ (PD)
                </p>
                <p className="text-xs" style={{ color: "#94a3b8" }}>
                  لم يتم القياس بعد - يمكنك القياس من صفحة الماسح
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* OD Card */}
        <motion.div variants={itemVariants}>
          <div
            className="glass-card rounded-2xl p-4"
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #0080ff, #0050cc)",
                }}
              >
                <Eye className="w-5 h-5" style={{ color: "#fff" }} />
              </div>
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: "#e2e8f0" }}
                >
                  العين اليمنى (OD)
                </p>
                <p className="text-[10px]" style={{ color: "#0080ff" }}>
                  العين اليمنى
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <NumberInput
                label="كروي (SPH)"
                value={od.sph}
                onChange={(v) => updateOd("sph", v)}
                steps={sphSteps}
                min={-20}
                max={20}
                step={0.25}
              />
              <NumberInput
                label="أسطواني (CYL)"
                value={od.cyl}
                onChange={(v) => updateOd("cyl", v)}
                steps={cylSteps}
                min={-10}
                max={10}
                step={0.25}
              />
              <NumberInput
                label="محور (Axis)"
                value={od.axis}
                onChange={(v) => updateOd("axis", v)}
                min={0}
                max={180}
                step={1}
                unit="°"
              />
              <NumberInput
                label="إضافة (ADD)"
                value={od.add}
                onChange={(v) => updateOd("add", v)}
                steps={addSteps}
                min={0}
                max={4}
                step={0.25}
              />
            </div>
          </div>
        </motion.div>

        {/* OS Card */}
        <motion.div variants={itemVariants}>
          <div
            className="glass-card rounded-2xl p-4"
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #a855f7, #6366f1)",
                }}
              >
                <Eye className="w-5 h-5" style={{ color: "#fff" }} />
              </div>
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: "#e2e8f0" }}
                >
                  العين اليسرى (OS)
                </p>
                <p className="text-[10px]" style={{ color: "#a855f7" }}>
                  العين اليسرى
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <NumberInput
                label="كروي (SPH)"
                value={os.sph}
                onChange={(v) => updateOs("sph", v)}
                steps={sphSteps}
                min={-20}
                max={20}
                step={0.25}
              />
              <NumberInput
                label="أسطواني (CYL)"
                value={os.cyl}
                onChange={(v) => updateOs("cyl", v)}
                steps={cylSteps}
                min={-10}
                max={10}
                step={0.25}
              />
              <NumberInput
                label="محور (Axis)"
                value={os.axis}
                onChange={(v) => updateOs("axis", v)}
                min={0}
                max={180}
                step={1}
                unit="°"
              />
              <NumberInput
                label="إضافة (ADD)"
                value={os.add}
                onChange={(v) => updateOs("add", v)}
                steps={addSteps}
                min={0}
                max={4}
                step={0.25}
              />
            </div>
          </div>
        </motion.div>

        {/* Calculate Button */}
        <motion.div variants={itemVariants}>
          <Button
            onClick={handleCalculate}
            disabled={!hasValues}
            className="w-full h-12 rounded-xl font-semibold text-base transition-all"
            style={{
              background: hasValues
                ? "linear-gradient(135deg, #00f0ff, #0080ff)"
                : "rgba(255,255,255,0.05)",
              color: hasValues ? "#0a0e1a" : "#64748b",
              border: hasValues
                ? "none"
                : "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <Shield className="w-5 h-5 ml-2" />
            حساب نوع العدسات
          </Button>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {showResults && results && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="space-y-3"
            >
              {/* Prescription Summary */}
              <div
                className="glass-card rounded-2xl p-4"
              >
                <p
                  className="text-sm font-semibold mb-3"
                  style={{ color: "#e2e8f0" }}
                >
                  ملخص الوصفة
                </p>
                <div className="space-y-2 text-xs" style={{ color: "#94a3b8" }}>
                  <p>
                    <span style={{ color: "#0080ff" }}>OD:</span>{" "}
                    {od.sph >= 0 ? "+" : ""}
                    {od.sph.toFixed(2)} / {od.cyl >= 0 ? "+" : ""}
                    {od.cyl.toFixed(2)} × {od.axis}°
                    {od.add > 0 && (
                      <span style={{ color: "#a855f7" }}>
                        {" "}
                        +{od.add.toFixed(2)} ADD
                      </span>
                    )}
                  </p>
                  <p>
                    <span style={{ color: "#a855f7" }}>OS:</span>{" "}
                    {os.sph >= 0 ? "+" : ""}
                    {os.sph.toFixed(2)} / {os.cyl >= 0 ? "+" : ""}
                    {os.cyl.toFixed(2)} × {os.axis}°
                    {os.add > 0 && (
                      <span style={{ color: "#a855f7" }}>
                        {" "}
                        +{os.add.toFixed(2)} ADD
                      </span>
                    )}
                  </p>
                  {pdValue && (
                    <p>
                      <span style={{ color: "#00d4aa" }}>PD:</span> {pdValue} مم
                    </p>
                  )}
                </div>
              </div>

              {/* Recommendations */}
              <p
                className="text-xs font-medium"
                style={{ color: "#94a3b8" }}
              >
                التوصيات
              </p>
              {results.map((rec, index) => (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card rounded-xl p-4"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: rec.gradient }}
                    >
                      <rec.icon
                        className="w-5 h-5"
                        style={{ color: "#0a0e1a" }}
                      />
                    </div>
                    <div className="flex-1">
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "#e2e8f0" }}
                      >
                        {rec.title}
                      </p>
                      <p className="text-[10px] mt-0.5" style={{ color: rec.color }}>
                        {rec.subtitle}
                      </p>
                      <p
                        className="text-xs mt-1.5 leading-relaxed"
                        style={{ color: "#94a3b8" }}
                      >
                        {rec.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Medical Disclaimer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="rounded-xl p-3 flex items-start gap-2"
                style={{
                  background: "rgba(255,165,0,0.06)",
                  border: "1px solid rgba(255,165,0,0.15)",
                }}
              >
                <AlertTriangle
                  className="w-4 h-4 shrink-0 mt-0.5"
                  style={{ color: "#ffa500" }}
                />
                <p className="text-xs leading-relaxed" style={{ color: "#94a3b8" }}>
                  هذه التوصيات للإرشاد العام فقط. يرجى استشارة طبيب العيون أو
                  أخصائي البصريات للحصول على تشخيص دقيق ووصفة طبية مناسبة لحالتك.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex gap-3 mt-4"
        >
          <Button
            onClick={onBack}
            className="flex-1 h-11 rounded-xl font-medium"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#e2e8f0",
            }}
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            رجوع
          </Button>
          <Button
            onClick={handleReset}
            className="flex-1 h-11 rounded-xl font-medium"
            style={{
              background: "rgba(255,59,48,0.08)",
              border: "1px solid rgba(255,59,48,0.2)",
              color: "#ff3b30",
            }}
          >
            <RotateCcw className="w-4 h-4 ml-2" />
            إعادة
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
