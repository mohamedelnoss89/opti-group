"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Eye,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Save,
  RotateCcw,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface PrescriptionComparisonProps {
  onBack: () => void;
}

interface EyeRx {
  sph: number;
  cyl: number;
  axis: number;
  add: number;
}

interface Prescription {
  od: EyeRx;
  os: EyeRx;
}

interface DiffResult {
  param: string;
  label: string;
  eye: "od" | "os";
  oldValue: number;
  newValue: number;
  diff: number;
  status: "improved" | "worsened" | "noChange";
}

const defaultRx: EyeRx = { sph: 0, cyl: 0, axis: 0, add: 0 };

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
const axisSteps = generateSteps(0, 180, 1);

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

function RxDropdown({
  label,
  value,
  onChange,
  steps,
  unit,
  highlightColor,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  steps: number[];
  unit?: string;
  highlightColor?: string;
}) {
  const [open, setOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const currentIndex = steps.findIndex(
    (s) => Math.abs(s - value) < 0.001
  );

  useEffect(() => {
    if (open && listRef.current && currentIndex >= 0) {
      const itemHeight = 36;
      listRef.current.scrollTop = currentIndex * itemHeight - listRef.current.clientHeight / 2 + itemHeight / 2;
    }
  }, [open, currentIndex]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (listRef.current && !listRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const displayValue = unit
    ? `${Math.round(value)}${unit}`
    : value >= 0
    ? `+${value.toFixed(2)}`
    : value.toFixed(2);

  return (
    <div className="flex flex-col items-center gap-1 relative">
      <span className="text-[10px]" style={{ color: "#64748b" }}>
        {label}
      </span>
      <button
        onClick={() => setOpen(!open)}
        className="w-full h-9 rounded-lg flex items-center justify-center gap-1 text-xs font-semibold transition-all active:scale-95"
        style={{
          background: open
            ? `${highlightColor || "#0080ff"}15`
            : "rgba(255,255,255,0.06)",
          border: open
            ? `1px solid ${highlightColor || "#0080ff"}50`
            : "1px solid rgba(255,255,255,0.1)",
          color: "#e2e8f0",
        }}
      >
        <span>{displayValue}</span>
        <ChevronDown
          className="w-3 h-3 transition-transform"
          style={{
            color: "#64748b",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={listRef}
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 z-50 mt-1 rounded-xl overflow-hidden max-h-[180px] overflow-y-auto"
            style={{
              background: "#1a1e2e",
              border: `1px solid ${highlightColor || "#0080ff"}30`,
              boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 16px ${highlightColor || "#0080ff"}10`,
            }}
          >
            {steps.map((stepVal) => {
              const isSelected = Math.abs(stepVal - value) < 0.001;
              const display = unit
                ? `${Math.round(stepVal)}${unit}`
                : stepVal >= 0
                ? `+${stepVal.toFixed(2)}`
                : stepVal.toFixed(2);

              return (
                <button
                  key={stepVal}
                  onClick={() => {
                    onChange(stepVal);
                    setOpen(false);
                  }}
                  className="w-full h-9 flex items-center justify-center text-xs transition-all"
                  style={{
                    background: isSelected
                      ? `${highlightColor || "#0080ff"}20`
                      : "transparent",
                    color: isSelected
                      ? highlightColor || "#0080ff"
                      : "#94a3b8",
                    fontWeight: isSelected ? 700 : 400,
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  {display}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EyeCard({
  title,
  subtitle,
  color,
  gradient,
  rx,
  onUpdate,
}: {
  title: string;
  subtitle: string;
  color: string;
  gradient: string;
  rx: EyeRx;
  onUpdate: (field: keyof EyeRx, value: number) => void;
}) {
  return (
    <div className="glass-card rounded-xl p-3">
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: gradient }}
        >
          <Eye className="w-4 h-4" style={{ color: "#0a0e1a" }} />
        </div>
        <div>
          <p className="text-xs font-semibold" style={{ color: "#e2e8f0" }}>
            {title}
          </p>
          <p className="text-[9px]" style={{ color }}>
            {subtitle}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <RxDropdown
          label="كروي"
          value={rx.sph}
          onChange={(v) => onUpdate("sph", v)}
          steps={sphSteps}
          highlightColor={color}
        />
        <RxDropdown
          label="أسطواني"
          value={rx.cyl}
          onChange={(v) => onUpdate("cyl", v)}
          steps={cylSteps}
          highlightColor={color}
        />
        <RxDropdown
          label="محور"
          value={rx.axis}
          onChange={(v) => onUpdate("axis", v)}
          steps={axisSteps}
          unit="°"
          highlightColor={color}
        />
        <RxDropdown
          label="إضافة"
          value={rx.add}
          onChange={(v) => onUpdate("add", v)}
          steps={addSteps}
          highlightColor={color}
        />
      </div>
    </div>
  );
}

function comparePrescriptions(
  oldRx: Prescription,
  newRx: Prescription
): DiffResult[] {
  const diffs: DiffResult[] = [];
  const params: { key: keyof EyeRx; label: string; isAxis?: boolean }[] = [
    { key: "sph", label: "كروي" },
    { key: "cyl", label: "أسطواني" },
    { key: "axis", label: "محور", isAxis: true },
    { key: "add", label: "إضافة" },
  ];

  for (const eye of ["od", "os"] as const) {
    const eyeLabel = eye === "od" ? "OD" : "OS";
    for (const param of params) {
      const oldVal = oldRx[eye][param.key];
      const newVal = newRx[eye][param.key];
      const diff = param.isAxis
        ? Math.round(newVal - oldVal)
        : Math.round((newVal - oldVal) * 100) / 100;

      let status: DiffResult["status"] = "noChange";
      if (diff !== 0) {
        // For SPH and CYL: smaller absolute value = improved
        // For ADD: smaller = improved
        // For Axis: change is neutral
        if (param.isAxis) {
          status = "noChange"; // Axis change alone doesn't indicate improvement
          if (diff !== 0) status = "worsened"; // Actually axis change means prescription changed
        } else if (param.key === "add") {
          // Lower ADD is generally better (less presbyopia)
          status = diff < 0 ? "improved" : "worsened";
        } else {
          // For SPH and CYL: closer to 0 is better
          if (Math.abs(newVal) < Math.abs(oldVal)) {
            status = "improved";
          } else if (Math.abs(newVal) > Math.abs(oldVal)) {
            status = "worsened";
          } else {
            status = "noChange";
          }
        }
      }

      diffs.push({
        param: param.label,
        label: `${eyeLabel} ${param.label}`,
        eye,
        oldValue: oldVal,
        newValue: newVal,
        diff,
        status,
      });
    }
  }

  return diffs;
}

export default function PrescriptionComparison({
  onBack,
}: PrescriptionComparisonProps) {
  const { toast } = useToast();
  const [oldRx, setOldRx] = useState<Prescription>({
    od: { ...defaultRx },
    os: { ...defaultRx },
  });
  const [newRx, setNewRx] = useState<Prescription>({
    od: { ...defaultRx },
    os: { ...defaultRx },
  });
  const [diffResults, setDiffResults] = useState<DiffResult[] | null>(null);

  const updateOldRx = useCallback(
    (eye: "od" | "os", field: keyof EyeRx, value: number) => {
      setOldRx((prev) => ({
        ...prev,
        [eye]: { ...prev[eye], [field]: value },
      }));
      setDiffResults(null);
    },
    []
  );

  const updateNewRx = useCallback(
    (eye: "od" | "os", field: keyof EyeRx, value: number) => {
      setNewRx((prev) => ({
        ...prev,
        [eye]: { ...prev[eye], [field]: value },
      }));
      setDiffResults(null);
    },
    []
  );

  const handleCompare = useCallback(() => {
    const results = comparePrescriptions(oldRx, newRx);
    setDiffResults(results);
  }, [oldRx, newRx]);

  const handleReset = useCallback(() => {
    setOldRx({ od: { ...defaultRx }, os: { ...defaultRx } });
    setNewRx({ od: { ...defaultRx }, os: { ...defaultRx } });
    setDiffResults(null);
  }, []);

  const handleSave = useCallback(() => {
    try {
      const data = {
        oldRx,
        newRx,
        comparison: diffResults,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(
        "optisize-prescription-comparison",
        JSON.stringify(data)
      );
      toast({
        title: "تم الحفظ",
        description: "تم حفظ نتيجة المقارنة بنجاح",
      });
    } catch {
      toast({
        title: "خطأ",
        description: "لم يتم حفظ البيانات",
      });
    }
  }, [oldRx, newRx, diffResults, toast]);

  const statusConfig = {
    improved: { color: "#00d4aa", label: "تحسنت", icon: TrendingUp },
    worsened: { color: "#ff3b30", label: "ساءت", icon: TrendingDown },
    noChange: { color: "#64748b", label: "لا تغيير", icon: Minus },
  };

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
            "radial-gradient(ellipse at 50% 0%, rgba(0,128,255,0.05) 0%, transparent 50%)",
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
            مقارنة الوصفات
          </h1>
          <p className="text-xs" style={{ color: "#64748b" }}>
            مقارنة الوصفات
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
        className="flex-1 px-4 pb-8 space-y-4 relative z-10 overflow-y-auto"
      >
        {/* Old Prescription */}
        <motion.div variants={itemVariants}>
          <p
            className="text-xs font-semibold mb-2 flex items-center gap-2"
            style={{ color: "#94a3b8" }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: "#ff3b30" }}
            />
            الوصفة القديمة
          </p>
          <div className="space-y-2">
            <EyeCard
              title="العين اليمنى (OD)"
              subtitle="العين اليمنى القديمة"
              color="#ff6b6b"
              gradient="linear-gradient(135deg, #ff3b30, #ff6b6b)"
              rx={oldRx.od}
              onUpdate={(f, v) => updateOldRx("od", f, v)}
            />
            <EyeCard
              title="العين اليسرى (OS)"
              subtitle="العين اليسرى القديمة"
              color="#ff6b6b"
              gradient="linear-gradient(135deg, #ff3b30, #ff6b6b)"
              rx={oldRx.os}
              onUpdate={(f, v) => updateOldRx("os", f, v)}
            />
          </div>
        </motion.div>

        {/* Divider with icon */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center py-2"
        >
          <div
            className="h-px flex-1"
            style={{ background: "rgba(255,255,255,0.08)" }}
          />
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center mx-3"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <ArrowLeftRight
              className="w-5 h-5"
              style={{ color: "#00f0ff" }}
            />
          </div>
          <div
            className="h-px flex-1"
            style={{ background: "rgba(255,255,255,0.08)" }}
          />
        </motion.div>

        {/* New Prescription */}
        <motion.div variants={itemVariants}>
          <p
            className="text-xs font-semibold mb-2 flex items-center gap-2"
            style={{ color: "#94a3b8" }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: "#00d4aa" }}
            />
            الوصفة الجديدة
          </p>
          <div className="space-y-2">
            <EyeCard
              title="العين اليمنى (OD)"
              subtitle="العين اليمنى الجديدة"
              color="#00d4aa"
              gradient="linear-gradient(135deg, #00d4aa, #00a88a)"
              rx={newRx.od}
              onUpdate={(f, v) => updateNewRx("od", f, v)}
            />
            <EyeCard
              title="العين اليسرى (OS)"
              subtitle="العين اليسرى الجديدة"
              color="#00d4aa"
              gradient="linear-gradient(135deg, #00d4aa, #00a88a)"
              rx={newRx.os}
              onUpdate={(f, v) => updateNewRx("os", f, v)}
            />
          </div>
        </motion.div>

        {/* Compare Button */}
        <motion.div variants={itemVariants}>
          <Button
            onClick={handleCompare}
            className="w-full h-12 rounded-xl font-semibold text-base"
            style={{
              background: "linear-gradient(135deg, #0080ff, #0050cc)",
              color: "#fff",
            }}
          >
            <ArrowLeftRight className="w-5 h-5 ml-2" />
            مقارنة الوصفات
          </Button>
        </motion.div>

        {/* Comparison Results */}
        <AnimatePresence>
          {diffResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <p
                className="text-sm font-semibold"
                style={{ color: "#e2e8f0" }}
              >
                نتائج المقارنة
              </p>

              {/* Summary */}
              <div
                className="glass-card rounded-xl p-4"
              >
                <div className="flex items-center justify-around">
                  {(
                    [
                      "improved",
                      "worsened",
                      "noChange",
                    ] as const
                  ).map((status) => {
                    const count = diffResults.filter(
                      (d) => d.status === status
                    ).length;
                    const config = statusConfig[status];
                    return (
                      <div key={status} className="text-center">
                        <p
                          className="text-2xl font-bold"
                          style={{ color: config.color }}
                        >
                          {count}
                        </p>
                        <p
                          className="text-[10px] mt-1"
                          style={{ color: "#94a3b8" }}
                        >
                          {config.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Detailed Results */}
              {diffResults.map((result, index) => {
                const config = statusConfig[result.status];
                const StatusIcon = config.icon;
                return (
                  <motion.div
                    key={result.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass-card rounded-xl p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StatusIcon
                          className="w-4 h-4"
                          style={{ color: config.color }}
                        />
                        <span
                          className="text-xs font-medium"
                          style={{ color: "#e2e8f0" }}
                        >
                          {result.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <p className="text-[9px]" style={{ color: "#64748b" }}>
                            قديم
                          </p>
                          <p
                            className="text-xs font-medium"
                            style={{ color: "#ff6b6b" }}
                          >
                            {result.param === "Axis"
                              ? Math.round(result.oldValue)
                              : result.oldValue.toFixed(2)}
                          </p>
                        </div>
                        <span style={{ color: "#64748b" }}>→</span>
                        <div className="text-center">
                          <p className="text-[9px]" style={{ color: "#64748b" }}>
                            جديد
                          </p>
                          <p
                            className="text-xs font-medium"
                            style={{ color: "#00d4aa" }}
                          >
                            {result.param === "Axis"
                              ? Math.round(result.newValue)
                              : result.newValue.toFixed(2)}
                          </p>
                        </div>
                        <div
                          className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                          style={{
                            background: `${config.color}15`,
                            color: config.color,
                            border: `1px solid ${config.color}30`,
                          }}
                        >
                          {result.diff !== 0
                            ? (result.diff > 0 ? "+" : "") +
                              (result.param === "Axis"
                                ? Math.round(result.diff)
                                : result.diff.toFixed(2))
                            : "="}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Save Button */}
              <Button
                onClick={handleSave}
                className="w-full h-10 rounded-xl font-medium"
                style={{
                  background: "rgba(0,212,170,0.1)",
                  border: "1px solid rgba(0,212,170,0.2)",
                  color: "#00d4aa",
                }}
              >
                <Save className="w-4 h-4 ml-2" />
                حفظ نتيجة المقارنة
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
