"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Eye,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

interface GlaucomaTestProps {
  onBack: () => void;
  onComplete: (result: { score: number; riskLevel: string; riskColor: string }) => void;
}

type Answer = "yes" | "sometimes" | "no";

// Visual field test: dots appearing in peripheral vision
interface DotPosition {
  x: number;
  y: number;
  visible: boolean;
  isTarget: boolean;
  size: number;
}

const FIELD_SIZE = 280;
const TOTAL_FIELD_DOTS = 20;
const TARGET_DOTS = 8;

export default function GlaucomaTest({ onBack, onComplete }: GlaucomaTestProps) {
  const { t, isRTL } = useI18n();

  const questions = [
    { id: 1, question: t("glaucoma.q1"), description: t("glaucoma.q1d") },
    { id: 2, question: t("glaucoma.q2"), description: t("glaucoma.q2d") },
    { id: 3, question: t("glaucoma.q3"), description: t("glaucoma.q3d") },
    { id: 4, question: t("glaucoma.q4"), description: t("glaucoma.q4d") },
    { id: 5, question: t("glaucoma.q5"), description: t("glaucoma.q5d") },
    { id: 6, question: t("glaucoma.q6"), description: t("glaucoma.q6d") },
    { id: 7, question: t("glaucoma.q7"), description: t("glaucoma.q7d") },
  ];

  const [currentStep, setCurrentStep] = useState<"intro" | "visual" | "questions" | "result">("intro");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [fieldDots, setFieldDots] = useState<DotPosition[]>([]);
  const [fieldScore, setFieldScore] = useState(0);
  const [fieldDotsShown, setFieldDotsShown] = useState(0);
  const [fieldComplete, setFieldComplete] = useState(false);
  const [activeDot, setActiveDot] = useState<number | null>(null);
  const fieldTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dotTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize visual field test
  const initFieldTest = useCallback(() => {
    const dots: DotPosition[] = [];
    const targetIndices = new Set<number>();

    // Randomly pick target positions
    while (targetIndices.size < TARGET_DOTS) {
      targetIndices.add(Math.floor(Math.random() * TOTAL_FIELD_DOTS));
    }

    for (let i = 0; i < TOTAL_FIELD_DOTS; i++) {
      const angle = (i / TOTAL_FIELD_DOTS) * Math.PI * 2;
      const radius = 80 + Math.random() * 40;
      dots.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        visible: false,
        isTarget: targetIndices.has(i),
        size: 8 + Math.random() * 6,
      });
    }

    setFieldDots(dots);
    setFieldScore(0);
    setFieldDotsShown(0);
    setFieldComplete(false);
    setActiveDot(null);
  }, []);

  // Show dots one at a time
  useEffect(() => {
    if (currentStep !== "visual" || fieldComplete) return;

    dotTimerRef.current = setTimeout(() => {
      if (fieldDotsShown >= TOTAL_FIELD_DOTS) {
        setFieldComplete(true);
        setTimeout(() => setCurrentStep("questions"), 1500);
        return;
      }

      setActiveDot(fieldDotsShown);
      setFieldDotsShown((prev) => prev + 1);

      // Hide dot after 1.5 seconds
      fieldTimerRef.current = setTimeout(() => {
        setActiveDot(null);
      }, 1500);
    }, 2000);

    return () => {
      if (dotTimerRef.current) clearTimeout(dotTimerRef.current);
      if (fieldTimerRef.current) clearTimeout(fieldTimerRef.current);
    };
  }, [currentStep, fieldDotsShown, fieldComplete, fieldDots]);

  const handleFieldTap = useCallback(
    (index: number) => {
      if (activeDot !== null && fieldDots[activeDot]?.isTarget) {
        if (index === activeDot || true) {
          // Simplified: any tap during target is correct
          setFieldScore((prev) => prev + 1);
        }
      }
    },
    [activeDot, fieldDots]
  );

  const handleAnswer = useCallback(
    (answer: Answer) => {
      setAnswers((prev) => [...prev, answer]);
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion((prev) => prev + 1);
      } else {
        const allAnswers = [...answers, answer];
        const yesCount = allAnswers.filter((a) => a === "yes").length;
        const sometimesCount = allAnswers.filter((a) => a === "sometimes").length;
        const score = yesCount * 2 + sometimesCount;
        const total = questions.length * 2;
        const percentage = Math.round((score / total) * 100);

        let riskLevel: string;
        let riskColor: string;
        if (percentage >= 60) {
          riskLevel = "high";
          riskColor = "#ff3b30";
        } else if (percentage >= 30) {
          riskLevel = "medium";
          riskColor = "#ffa500";
        } else {
          riskLevel = "low";
          riskColor = "#00d4aa";
        }

        onComplete({ score: percentage, riskLevel, riskColor });
        setCurrentStep("result");
      }
    },
    [currentQuestion, answers, onComplete, questions.length]
  );

  const handleStartVisual = useCallback(() => {
    initFieldTest();
    setCurrentStep("visual");
  }, [initFieldTest]);

  const handleRestart = useCallback(() => {
    setCurrentStep("intro");
    setCurrentQuestion(0);
    setAnswers([]);
    initFieldTest();
  }, [initFieldTest]);

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
            {t("glaucoma.title")}
          </h1>
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 px-4 pb-8">
        <AnimatePresence mode="wait">
          {/* Intro */}
          {currentStep === "intro" && (
            <motion.div
              key="intro"
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
                  background: "linear-gradient(135deg, #00f0ff20, #0080ff08)",
                  border: "1px solid #00f0ff30",
                }}
              >
                <Eye className="w-12 h-12" style={{ color: "#00f0ff" }} />
              </motion.div>
              <h2 className="text-xl font-bold mb-3" style={{ color: "#e2e8f0" }}>
                {t("glaucoma.introTitle")}
              </h2>
              <p className="text-sm text-center mb-2 max-w-[280px] leading-relaxed" style={{ color: "#94a3b8" }}>
                {t("glaucoma.introDesc")}
              </p>
              <p className="text-xs text-center mb-8" style={{ color: "#64748b" }}>
                {t("glaucoma.introInfo").replace("{questions}", String(questions.length))}
              </p>
              <Button
                onClick={handleStartVisual}
                className="h-12 px-8 rounded-xl font-medium text-base"
                style={{ background: "linear-gradient(135deg, #00f0ff, #0080ff)", color: "#0a0e1a" }}
              >
                {t("glaucoma.start")}
              </Button>
            </motion.div>
          )}

          {/* Visual Field Test */}
          {currentStep === "visual" && (
            <motion.div
              key="visual"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <p className="text-xs mb-2" style={{ color: "#94a3b8" }}>
                {t("glaucoma.fieldTitle")}
              </p>
              <p className="text-center text-sm mb-4" style={{ color: "#e2e8f0" }}>
                {t("glaucoma.fieldInstruction")}
              </p>

              <div className="flex justify-center mb-4">
                <div
                  className="relative rounded-2xl overflow-hidden"
                  style={{
                    width: FIELD_SIZE,
                    height: FIELD_SIZE,
                    background: "#0d1117",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                  onClick={() => handleFieldTap(activeDot ?? -1)}
                >
                  {/* Grid background */}
                  <div className="absolute inset-0 opacity-10">
                    <svg width="100%" height="100%">
                      <circle cx="50%" cy="50%" r="40" fill="none" stroke="#00f0ff" strokeWidth="0.5" />
                      <circle cx="50%" cy="50%" r="80" fill="none" stroke="#00f0ff" strokeWidth="0.5" />
                      <circle cx="50%" cy="50%" r="120" fill="none" stroke="#00f0ff" strokeWidth="0.5" />
                      <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#00f0ff" strokeWidth="0.3" />
                      <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#00f0ff" strokeWidth="0.3" />
                    </svg>
                  </div>

                  {/* Center fixation point */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-3 h-3 rounded-full"
                      style={{ background: "#ff3b30" }}
                    />
                  </div>

                  {/* Dots */}
                  {fieldDots.map((dot, index) => (
                    <motion.div
                      key={index}
                      className="absolute rounded-full"
                      style={{
                        left: `${FIELD_SIZE / 2 + dot.x - dot.size / 2}px`,
                        top: `${FIELD_SIZE / 2 + dot.y - dot.size / 2}px`,
                        width: dot.size,
                        height: dot.size,
                      }}
                      animate={{
                        opacity: activeDot === index ? 1 : 0,
                        scale: activeDot === index ? [0, 1.3, 1] : 0,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <div
                        className="w-full h-full rounded-full"
                        style={{
                          background: dot.isTarget ? "#00f0ff" : "#00f0ff60",
                          boxShadow: dot.isTarget
                            ? "0 0 12px rgba(0, 240, 255, 0.5)"
                            : "0 0 6px rgba(0, 240, 255, 0.2)",
                        }}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Progress */}
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs" style={{ color: "#64748b" }}>
                  {t("glaucoma.fieldProgress").replace("{shown}", String(fieldDotsShown)).replace("{total}", String(TOTAL_FIELD_DOTS))}
                </p>
                <p className="text-xs" style={{ color: "#00f0ff" }}>
                  {t("glaucoma.detections").replace("{count}", String(fieldScore))}
                </p>
              </div>
              <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                <motion.div
                  className="absolute inset-y-0 right-0 rounded-full"
                  style={{ background: "linear-gradient(90deg, #00f0ff, #0080ff)" }}
                  animate={{ width: `${(fieldDotsShown / TOTAL_FIELD_DOTS) * 100}%` }}
                />
              </div>

              {/* Field complete message */}
              <AnimatePresence>
                {fieldComplete && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mt-4"
                  >
                    <p className="text-sm" style={{ color: "#00f0ff" }}>
                      {t("glaucoma.fieldDone")}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Questions */}
          {currentStep === "questions" && (
            <motion.div
              key={`q-${currentQuestion}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs" style={{ color: "#94a3b8" }}>
                  {t("glaucoma.questionProgress").replace("{current}", String(currentQuestion + 1)).replace("{total}", String(questions.length))}
                </p>
                <p className="text-xs font-medium" style={{ color: "#00f0ff" }}>
                  {Math.round((currentQuestion / questions.length) * 100)}%
                </p>
              </div>

              <div className="relative h-1.5 rounded-full overflow-hidden mb-8" style={{ background: "rgba(255,255,255,0.08)" }}>
                <motion.div
                  className="absolute inset-y-0 right-0 rounded-full"
                  style={{ background: "linear-gradient(90deg, #00f0ff, #0080ff)" }}
                  animate={{ width: `${(currentQuestion / questions.length) * 100}%` }}
                />
              </div>

              <div className="glass-card rounded-2xl p-5 mb-6">
                <p className="text-base font-semibold mb-2 leading-relaxed" style={{ color: "#e2e8f0" }}>
                  {questions[currentQuestion].question}
                </p>
                <p className="text-xs" style={{ color: "#64748b" }}>
                  {questions[currentQuestion].description}
                </p>
              </div>

              <div className="space-y-3">
                {([
                  { value: "yes" as Answer, label: t("common.yes"), color: "#ff3b30" },
                  { value: "sometimes" as Answer, label: t("common.sometimes"), color: "#ffa500" },
                  { value: "no" as Answer, label: t("common.no"), color: "#00d4aa" },
                ]).map((opt) => (
                  <motion.button
                    key={opt.value}
                    onClick={() => handleAnswer(opt.value)}
                    className="w-full h-12 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#e2e8f0",
                    }}
                    whileHover={{ scale: 1.02, borderColor: `${opt.color}40` }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: opt.color }} />
                      {opt.label}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Result */}
          {currentStep === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-8"
            >
              {(() => {
                const yesCount = answers.filter((a) => a === "yes").length;
                const sometimesCount = answers.filter((a) => a === "sometimes").length;
                const score = yesCount * 2 + sometimesCount;
                const total = questions.length * 2;
                const percentage = Math.round((score / total) * 100);

                let riskLevel: string;
                let riskColor: string;
                let description: string;
                if (percentage >= 60) {
                  riskLevel = "high";
                  riskColor = "#ff3b30";
                  description = t("glaucoma.highDesc");
                } else if (percentage >= 30) {
                  riskLevel = "medium";
                  riskColor = "#ffa500";
                  description = t("glaucoma.mediumDesc");
                } else {
                  riskLevel = "low";
                  riskColor = "#00d4aa";
                  description = t("glaucoma.lowDesc");
                }

                return (
                  <>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 150 }}
                      className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
                      style={{
                        background: `${riskColor}15`,
                        border: `2px solid ${riskColor}40`,
                      }}
                    >
                      {riskLevel === "low" ? (
                        <CheckCircle2 className="w-12 h-12" style={{ color: riskColor }} />
                      ) : (
                        <AlertTriangle className="w-12 h-12" style={{ color: riskColor }} />
                      )}
                    </motion.div>

                    <h2 className="text-xl font-bold mb-1" style={{ color: "#e2e8f0" }}>
                      {t("glaucoma.riskTitle").replace("{level}", t(`common.risk.${riskLevel}`))}
                    </h2>
                    <p className="text-3xl font-bold mb-4" style={{ color: riskColor }}>
                      {percentage}%
                    </p>

                    <div className="glass-card rounded-xl p-4 mb-6 w-full">
                      <p className="text-sm text-center leading-relaxed" style={{ color: "#94a3b8" }}>
                        {description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6 w-full">
                      <div className="glass-card rounded-xl p-3 text-center">
                        <p className="text-[10px]" style={{ color: "#64748b" }}>{t("glaucoma.fieldLabel")}</p>
                        <p className="text-sm font-bold" style={{ color: "#00f0ff" }}>
                          {fieldScore}/{TARGET_DOTS}
                        </p>
                      </div>
                      <div className="glass-card rounded-xl p-3 text-center">
                        <p className="text-[10px]" style={{ color: "#64748b" }}>{t("glaucoma.riskFactors")}</p>
                        <p className="text-sm font-bold" style={{ color: riskColor }}>
                          {percentage}%
                        </p>
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
                        <RotateCcw className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                        {t("common.restart")}
                      </Button>
                      <Button
                        onClick={onBack}
                        className="flex-1 h-11 rounded-xl font-medium"
                        style={{
                          background: "linear-gradient(135deg, #00f0ff, #0080ff)",
                          color: "#0a0e1a",
                        }}
                      >
                        {t("common.back")}
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
