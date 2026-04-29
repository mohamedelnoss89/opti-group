"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CircleDot,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AstigmatismTestProps {
  onBack: () => void;
}

const symptomQuestions = [
  "هل تعاني من صداع متكرر عند القراءة؟",
  "هل ترى الأشياء مشوّهة أو مزدوجة أحياناً؟",
  "هل تشعر بإرهاق في العينين بعد العمل على الشاشة؟",
  "هل صعوبة رؤية الأشياء البعيدة والقريبة معاً؟",
];

type Phase = "instructions" | "visual-1" | "visual-2" | "visual-3" | "questions" | "results";

// Generate radiating lines SVG for the astigmatism clock
function AstigmatismCircle() {
  const numLines = 24;
  const lines = useMemo(() => {
    const result = [];
    for (let i = 0; i < numLines; i++) {
      const angle = (i * 360) / numLines;
      const radian = (angle * Math.PI) / 180;
      const innerR = 30;
      const outerR = 120;
      const x1 = 150 + Math.cos(radian) * innerR;
      const y1 = 150 + Math.sin(radian) * innerR;
      const x2 = 150 + Math.cos(radian) * outerR;
      const y2 = 150 + Math.sin(radian) * outerR;

      const strokeWidth = i % 2 === 0 ? 2.5 : 1.5;
      const strokeOpacity = i % 2 === 0 ? 0.8 : 0.4;

      result.push(
        <line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#94a3b8"
          strokeWidth={strokeWidth}
          strokeOpacity={strokeOpacity}
          strokeLinecap="round"
        />
      );
    }
    return result;
  }, []);

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <circle cx="150" cy="150" r="125" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
      <circle cx="150" cy="150" r="30" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <circle cx="150" cy="150" r="3" fill="#ffa500" />
      {lines}
    </svg>
  );
}

// Half-moon / semicircle pattern for second visual test
function HalfMoonPattern() {
  const numArcs = 8;
  const arcs = useMemo(() => {
    const result = [];
    for (let i = 0; i < numArcs; i++) {
      const radius = 25 + i * 14;
      result.push(
        <circle
          key={i}
          cx="150"
          cy="150"
          r={radius}
          fill="none"
          stroke={i % 2 === 0 ? "#ffa500" : "#64748b"}
          strokeWidth={i % 2 === 0 ? 2.5 : 1.5}
          strokeOpacity={i % 2 === 0 ? 0.9 : 0.4}
          strokeDasharray={`${Math.PI * radius * 0.5} ${Math.PI * radius * 1.5}`}
          strokeDashoffset={-Math.PI * radius * 0.25}
          strokeLinecap="round"
        />
      );
    }
    return result;
  }, []);

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <circle cx="150" cy="150" r="135" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      <circle cx="150" cy="150" r="3" fill="#ffa500" />
      {arcs}
    </svg>
  );
}

// Grid distortion pattern for third visual test
function DistortionGridPattern() {
  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      {[40, 80, 120, 150, 180, 220, 260].map((y, i) => (
        <path
          key={`h-${i}`}
          d={`M 30 ${y} Q 150 ${y + (i === 3 ? 8 : i === 2 ? -5 : 0)}, 270 ${y}`}
          fill="none"
          stroke={i === 3 ? "#ffa500" : "rgba(255,255,255,0.15)"}
          strokeWidth={i === 3 ? 2.5 : 1}
        />
      ))}
      {[40, 80, 120, 150, 180, 220, 260].map((x, i) => (
        <path
          key={`v-${i}`}
          d={`M ${x} 30 Q ${x + (i === 3 ? 8 : i === 2 ? -5 : 0)} 150, ${x} 270`}
          fill="none"
          stroke={i === 3 ? "#ffa500" : "rgba(255,255,255,0.15)"}
          strokeWidth={i === 3 ? 2.5 : 1}
        />
      ))}
      <circle cx="150" cy="150" r="3" fill="#ffa500" />
    </svg>
  );
}

export default function AstigmatismTest({ onBack }: AstigmatismTestProps) {
  const [phase, setPhase] = useState<Phase>("instructions");
  const [linesEqual, setLinesEqual] = useState<"equal" | "unequal" | "unsure" | null>(null);
  const [darkestLine, setDarkestLine] = useState<number | null>(null);
  const [gridDistorted, setGridDistorted] = useState<"normal" | "distorted" | "unsure" | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questionAnswers, setQuestionAnswers] = useState<boolean[]>([]);

  const handleVisual1Answer = useCallback((answer: "equal" | "unequal" | "unsure") => {
    setLinesEqual(answer);
    setTimeout(() => setPhase("visual-2"), 500);
  }, []);

  const handleVisual2Answer = useCallback((lineAngle: number | null) => {
    setDarkestLine(lineAngle);
    setTimeout(() => setPhase("visual-3"), 500);
  }, []);

  const handleVisual3Answer = useCallback((answer: "normal" | "distorted" | "unsure") => {
    setGridDistorted(answer);
    setTimeout(() => setPhase("questions"), 500);
  }, []);

  const handleQuestionAnswer = useCallback(
    (answer: boolean) => {
      const newAnswers = [...questionAnswers, answer];
      setQuestionAnswers(newAnswers);

      if (newAnswers.length < symptomQuestions.length) {
        setCurrentQuestion((prev) => prev + 1);
      } else {
        setPhase("results");
      }
    },
    [questionAnswers]
  );

  const handleRestart = useCallback(() => {
    setPhase("instructions");
    setLinesEqual(null);
    setDarkestLine(null);
    setGridDistorted(null);
    setCurrentQuestion(0);
    setQuestionAnswers([]);
  }, []);

  const calculateResult = useCallback(() => {
    let riskScore = 0;

    if (linesEqual === "unequal") riskScore += 3;
    else if (linesEqual === "unsure") riskScore += 1;

    if (darkestLine !== null) riskScore += 3;

    if (gridDistorted === "distorted") riskScore += 3;
    else if (gridDistorted === "unsure") riskScore += 1;

    const yesCount = questionAnswers.filter(Boolean).length;
    riskScore += yesCount * 2;

    const maxScore = 3 + 3 + 3 + symptomQuestions.length * 2;
    const percentage = Math.round((riskScore / maxScore) * 100);

    let riskLevel: string;
    let riskColor: string;
    let description: string;

    if (percentage >= 55) {
      riskLevel = "مرتفع";
      riskColor = "#ff3b30";
      description = "هناك مؤشرات قوية على احتمالية وجود استيجماتيزم. يُنصح بزيارة طبيب العيون في أقرب وقت لإجراء فحص شامل.";
    } else if (percentage >= 30) {
      riskLevel = "متوسط";
      riskColor = "#ffa500";
      description = "هناك بعض العلامات التي قد تشير إلى وجود استيجماتيزم. يُنصح بزيارة طبيب العيون.";
    } else {
      riskLevel = "منخفض";
      riskColor = "#00d4aa";
      description = "لا توجد مؤشرات واضحة على وجود استيجماتيزم. استمر في الفحوصات الدورية.";
    }

    return { riskLevel, riskColor, description, percentage, riskScore };
  }, [linesEqual, darkestLine, gridDistorted, questionAnswers]);

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
            اختبار الاستيجماتيزم
          </h1>
          <p className="text-xs" style={{ color: "#64748b" }}>
            اختبار الاستيجماتيزم
          </p>
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 px-4 pb-8">
        <AnimatePresence mode="wait">
          {/* Phase 1: Instructions */}
          {phase === "instructions" && (
            <motion.div
              key="instructions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6"
                style={{
                  background: "linear-gradient(135deg, rgba(255,165,0,0.13), rgba(255,107,0,0.03))",
                  border: "1px solid rgba(255,165,0,0.19)",
                }}
              >
                <CircleDot className="w-12 h-12" style={{ color: "#ffa500" }} />
              </motion.div>
              <h2 className="text-xl font-bold mb-3" style={{ color: "#e2e8f0" }}>
                اختبار الاستيجماتيزم
              </h2>
              <p className="text-sm text-center mb-2 max-w-[280px] leading-relaxed" style={{ color: "#94a3b8" }}>
                انظر للدائرة التالية من مسافة 30 سم. إذا رأيت بعض الخطوط أغمق أو أوضح من البقية، فقد يكون لديك استيجماتيزم.
              </p>
              <p className="text-xs text-center mb-8 max-w-[280px]" style={{ color: "#64748b" }}>
                3 اختبارات بصرية + {symptomQuestions.length} أسئلة عن الأعراض
              </p>
              <Button
                onClick={() => setPhase("visual-1")}
                className="h-12 px-8 rounded-xl font-medium text-base"
                style={{ background: "linear-gradient(135deg, #ffa500, #ff6b00)", color: "#0a0e1a" }}
              >
                ابدأ الاختبار
              </Button>
            </motion.div>
          )}

          {/* Phase 2: Visual Test 1 - Clock face */}
          {phase === "visual-1" && (
            <motion.div
              key="visual-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs" style={{ color: "#94a3b8" }}>
                  الاختبار 1 من 3
                </p>
                <p className="text-xs font-medium" style={{ color: "#ffa500" }}>
                  33%
                </p>
              </div>
              <div className="relative h-1.5 rounded-full overflow-hidden mb-4" style={{ background: "rgba(255,255,255,0.08)" }}>
                <div
                  className="absolute inset-y-0 right-0 rounded-full"
                  style={{ background: "linear-gradient(90deg, #ffa500, #ff6b00)", width: "33%" }}
                />
              </div>

              <p className="text-center text-sm mb-1" style={{ color: "#e2e8f0" }}>
                انظر للدائرة بعين واحدة في كل مرة
              </p>
              <p className="text-center text-xs mb-4" style={{ color: "#64748b" }}>
                هل كل الخطوط تبدو متساوية الوضوح؟
              </p>

              <div className="flex justify-center mb-6">
                <div
                  className="w-56 h-56 rounded-2xl p-3"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <AstigmatismCircle />
                </div>
              </div>

              <div className="space-y-3">
                {([
                  { value: "equal" as const, label: "نعم، كل الخطوط متساوية" },
                  { value: "unequal" as const, label: "لا، بعض الخطوط أغمق" },
                  { value: "unsure" as const, label: "غير متأكد" },
                ]).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleVisual1Answer(opt.value)}
                    className="w-full h-12 rounded-xl text-sm font-medium transition-all active:scale-[0.98]"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#e2e8f0",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Phase 3: Visual Test 2 - Half Moon */}
          {phase === "visual-2" && (
            <motion.div
              key="visual-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs" style={{ color: "#94a3b8" }}>
                  الاختبار 2 من 3
                </p>
                <p className="text-xs font-medium" style={{ color: "#ffa500" }}>
                  66%
                </p>
              </div>
              <div className="relative h-1.5 rounded-full overflow-hidden mb-4" style={{ background: "rgba(255,255,255,0.08)" }}>
                <div
                  className="absolute inset-y-0 right-0 rounded-full"
                  style={{ background: "linear-gradient(90deg, #ffa500, #ff6b00)", width: "66%" }}
                />
              </div>

              <p className="text-center text-sm mb-1" style={{ color: "#e2e8f0" }}>
                انظر للأنماط المقوسة التالية
              </p>
              <p className="text-center text-xs mb-4" style={{ color: "#64748b" }}>
                هل أي من الخطوط يبدو أغمق أو أوضح من البقية؟
              </p>

              <div className="flex justify-center mb-6">
                <div
                  className="w-56 h-56 rounded-2xl p-3"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <HalfMoonPattern />
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { value: null as number | null, label: "كل الخطوط متساوية الوضوح" },
                  { value: 0, label: "الخطوط الأفقية أغمق" },
                  { value: 90, label: "الخطوط العمودية أغمق" },
                  { value: 45, label: "خطوط مائلة أغمق" },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => handleVisual2Answer(opt.value)}
                    className="w-full h-12 rounded-xl text-sm font-medium transition-all active:scale-[0.98]"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#e2e8f0",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Phase 4: Visual Test 3 - Grid Distortion */}
          {phase === "visual-3" && (
            <motion.div
              key="visual-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs" style={{ color: "#94a3b8" }}>
                  الاختبار 3 من 3
                </p>
                <p className="text-xs font-medium" style={{ color: "#ffa500" }}>
                  100%
                </p>
              </div>
              <div className="relative h-1.5 rounded-full overflow-hidden mb-4" style={{ background: "rgba(255,255,255,0.08)" }}>
                <div
                  className="absolute inset-y-0 right-0 rounded-full"
                  style={{ background: "linear-gradient(90deg, #ffa500, #ff6b00)", width: "100%" }}
                />
              </div>

              <p className="text-center text-sm mb-1" style={{ color: "#e2e8f0" }}>
                انظر للشبكة التالية
              </p>
              <p className="text-center text-xs mb-4" style={{ color: "#64748b" }}>
                هل تبدو الخطوط مستقيمة ومتساوية؟
              </p>

              <div className="flex justify-center mb-6">
                <div
                  className="w-56 h-56 rounded-2xl p-3"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <DistortionGridPattern />
                </div>
              </div>

              <div className="space-y-3">
                {([
                  { value: "normal" as const, label: "نعم، الخطوط مستقيمة" },
                  { value: "distorted" as const, label: "لا، بعض الخطوط تبدو منحنية" },
                  { value: "unsure" as const, label: "غير متأكد" },
                ]).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleVisual3Answer(opt.value)}
                    className="w-full h-12 rounded-xl text-sm font-medium transition-all active:scale-[0.98]"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#e2e8f0",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Phase 5: Questions */}
          {phase === "questions" && (
            <motion.div
              key={`q-${currentQuestion}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs" style={{ color: "#94a3b8" }}>
                  السؤال {currentQuestion + 1} من {symptomQuestions.length}
                </p>
                <p className="text-xs font-medium" style={{ color: "#ffa500" }}>
                  {Math.round(((currentQuestion + 1) / symptomQuestions.length) * 100)}%
                </p>
              </div>

              <div className="relative h-1.5 rounded-full overflow-hidden mb-6" style={{ background: "rgba(255,255,255,0.08)" }}>
                <div
                  className="absolute inset-y-0 right-0 rounded-full"
                  style={{ background: "linear-gradient(90deg, #ffa500, #ff6b00)", width: `${((currentQuestion + 1) / symptomQuestions.length) * 100}%` }}
                />
              </div>

              <div className="rounded-xl p-5 mb-6" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="text-base font-semibold mb-2 leading-relaxed" style={{ color: "#e2e8f0" }}>
                  {symptomQuestions[currentQuestion]}
                </p>
              </div>

              <div className="space-y-3">
                {([
                  { value: true, label: "نعم", color: "#ff3b30" },
                  { value: false, label: "لا", color: "#00d4aa" },
                ]).map((opt) => (
                  <button
                    key={String(opt.value)}
                    onClick={() => handleQuestionAnswer(opt.value)}
                    className="w-full h-12 rounded-xl text-sm font-medium transition-all active:scale-[0.98]"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#e2e8f0",
                    }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: opt.color }} />
                      {opt.label}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Phase 6: Results */}
          {phase === "results" && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-8"
            >
              {(() => {
                const result = calculateResult();
                return (
                  <>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 150 }}
                      className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
                      style={{
                        background: `${result.riskColor}15`,
                        border: `2px solid ${result.riskColor}40`,
                      }}
                    >
                      {result.riskLevel === "منخفض" ? (
                        <CheckCircle2 className="w-12 h-12" style={{ color: result.riskColor }} />
                      ) : (
                        <AlertTriangle className="w-12 h-12" style={{ color: result.riskColor }} />
                      )}
                    </motion.div>

                    <h2 className="text-xl font-bold mb-1" style={{ color: "#e2e8f0" }}>
                      مستوى الخطر: {result.riskLevel}
                    </h2>
                    <p className="text-3xl font-bold mb-4" style={{ color: result.riskColor }}>
                      {result.percentage}%
                    </p>

                    <div className="rounded-xl p-4 mb-6 w-full" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <p className="text-sm text-center leading-relaxed" style={{ color: "#94a3b8" }}>
                        {result.description}
                      </p>
                    </div>

                    {/* Summary */}
                    <div className="w-full space-y-2 mb-6">
                      <div className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                        <span className="text-xs" style={{ color: "#94a3b8" }}>الاختبارات البصرية</span>
                        <span className="text-xs font-medium" style={{ color: result.riskColor }}>
                          {result.riskScore <= 5 ? "طبيعي" : result.riskScore <= 9 ? "يحتاج متابعة" : "يحتاج فحص"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                        <span className="text-xs" style={{ color: "#94a3b8" }}>الأعراض</span>
                        <span className="text-xs font-medium" style={{ color: "#e2e8f0" }}>
                          {questionAnswers.filter(Boolean).length}/{symptomQuestions.length} نعم
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3 w-full">
                      <Button
                        onClick={handleRestart}
                        className="flex-1 h-11 rounded-xl font-medium"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: "#e2e8f0",
                        }}
                      >
                        <RotateCcw className="w-4 h-4 ml-2" />
                        إعادة الاختبار
                      </Button>
                      <Button
                        onClick={onBack}
                        className="flex-1 h-11 rounded-xl font-medium"
                        style={{
                          background: "linear-gradient(135deg, #ffa500, #ff6b00)",
                          color: "#0a0e1a",
                        }}
                      >
                        رجوع
                      </Button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
