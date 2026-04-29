"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Shield,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Cloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

interface CataractTestProps {
  onBack: () => void;
  onComplete: (result: { score: number; riskLevel: string; riskColor: string }) => void;
}

type Answer = "yes" | "sometimes" | "no";

export default function CataractTest({ onBack, onComplete }: CataractTestProps) {
  const { t, isRTL } = useI18n();

  const questions = [
    { id: 1, question: t("cataract.q1"), description: t("cataract.q1d") },
    { id: 2, question: t("cataract.q2"), description: t("cataract.q2d") },
    { id: 3, question: t("cataract.q3"), description: t("cataract.q3d") },
    { id: 4, question: t("cataract.q4"), description: t("cataract.q4d") },
    { id: 5, question: t("cataract.q5"), description: t("cataract.q5d") },
    { id: 6, question: t("cataract.q6"), description: t("cataract.q6d") },
    { id: 7, question: t("cataract.q7"), description: t("cataract.q7d") },
  ];

  // Visual test: foggy overlay
  const visualTestItems = [
    { id: 1, label: t("cataract.shape1"), shape: "star" as const, fogLevel: 0.2 },
    { id: 2, label: t("cataract.shape2"), shape: "triangle" as const, fogLevel: 0.5 },
    { id: 3, label: t("cataract.shape3"), shape: "circle" as const, fogLevel: 0.8 },
  ];

  const [currentStep, setCurrentStep] = useState<"intro" | "visual" | "questions" | "result">("intro");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [visualScore, setVisualScore] = useState(0);
  const [currentVisual, setCurrentVisual] = useState(0);

  const handleVisualAnswer = useCallback((couldSee: boolean) => {
    if (couldSee) setVisualScore((prev) => prev + 1);
    if (currentVisual < visualTestItems.length - 1) {
      setCurrentVisual((prev) => prev + 1);
    } else {
      setCurrentStep("questions");
    }
  }, [currentVisual, visualTestItems.length]);

  const handleAnswer = useCallback((answer: Answer) => {
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
  }, [currentQuestion, answers, onComplete, questions.length]);

  const handleRestart = useCallback(() => {
    setCurrentStep("intro");
    setCurrentQuestion(0);
    setAnswers([]);
    setVisualScore(0);
    setCurrentVisual(0);
  }, []);

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
            {t("cataract.title")}
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
                  background: "linear-gradient(135deg, #00d4aa20, #00a88a08)",
                  border: "1px solid #00d4aa30",
                }}
              >
                <Cloud className="w-12 h-12" style={{ color: "#00d4aa" }} />
              </motion.div>
              <h2 className="text-xl font-bold mb-3" style={{ color: "#e2e8f0" }}>
                {t("cataract.introTitle")}
              </h2>
              <p className="text-sm text-center mb-2 max-w-[280px] leading-relaxed" style={{ color: "#94a3b8" }}>
                {t("cataract.introDesc")}
              </p>
              <p className="text-xs text-center mb-8" style={{ color: "#64748b" }}>
                {t("cataract.introInfo").replace("{questions}", String(questions.length)).replace("{visual}", String(visualTestItems.length))}
              </p>
              <Button
                onClick={() => setCurrentStep("visual")}
                className="h-12 px-8 rounded-xl font-medium text-base"
                style={{ background: "linear-gradient(135deg, #00d4aa, #00a88a)", color: "#0a0e1a" }}
              >
                {t("cataract.start")}
              </Button>
            </motion.div>
          )}

          {/* Visual Test */}
          {currentStep === "visual" && (
            <motion.div
              key={`visual-${currentVisual}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <p className="text-xs mb-4" style={{ color: "#94a3b8" }}>
                {t("cataract.visualProgress").replace("{current}", String(currentVisual + 1)).replace("{total}", String(visualTestItems.length))}
              </p>
              <p className="text-center text-sm mb-6" style={{ color: "#e2e8f0" }}>
                {t("cataract.visualQuestion")}
              </p>

              <div className="flex justify-center mb-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-64 h-64 rounded-2xl flex items-center justify-center relative overflow-hidden"
                  style={{ background: "#1a1a2e" }}
                >
                  {/* Shape */}
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    style={{
                      width: 80,
                      height: 80,
                      opacity: 1 - visualTestItems[currentVisual].fogLevel,
                    }}
                  >
                    {visualTestItems[currentVisual].shape === "star" && (
                      <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                        <path d="M40 5L48 30L75 30L53 45L60 72L40 57L20 72L27 45L5 30L32 30L40 5Z" fill="#00d4aa" />
                      </svg>
                    )}
                    {visualTestItems[currentVisual].shape === "triangle" && (
                      <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                        <path d="M40 10L70 70H10L40 10Z" fill="#00d4aa" />
                      </svg>
                    )}
                    {visualTestItems[currentVisual].shape === "circle" && (
                      <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                        <circle cx="40" cy="40" r="30" fill="#00d4aa" />
                      </svg>
                    )}
                  </motion.div>

                  {/* Fog overlay */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `radial-gradient(circle, transparent 20%, rgba(200,200,220,${visualTestItems[currentVisual].fogLevel}) 60%, rgba(200,200,220,${visualTestItems[currentVisual].fogLevel + 0.1}) 100%)`,
                    }}
                  />
                </motion.div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => handleVisualAnswer(true)}
                  className="w-full h-12 rounded-xl text-sm font-medium"
                  style={{
                    background: "rgba(0, 212, 170, 0.1)",
                    border: "1px solid rgba(0, 212, 170, 0.3)",
                    color: "#00d4aa",
                  }}
                >
                  {t("cataract.canSee")}
                </Button>
                <Button
                  onClick={() => handleVisualAnswer(false)}
                  className="w-full h-12 rounded-xl text-sm font-medium"
                  style={{
                    background: "rgba(255, 59, 48, 0.1)",
                    border: "1px solid rgba(255, 59, 48, 0.3)",
                    color: "#ff3b30",
                  }}
                >
                  {t("cataract.cannotSee")}
                </Button>
              </div>
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
                  {t("cataract.questionProgress").replace("{current}", String(currentQuestion + 1)).replace("{total}", String(questions.length))}
                </p>
                <p className="text-xs font-medium" style={{ color: "#00d4aa" }}>
                  {Math.round((currentQuestion / questions.length) * 100)}%
                </p>
              </div>

              <div className="relative h-1.5 rounded-full overflow-hidden mb-8" style={{ background: "rgba(255,255,255,0.08)" }}>
                <motion.div
                  className="absolute inset-y-0 right-0 rounded-full"
                  style={{ background: "linear-gradient(90deg, #00d4aa, #00a88a)" }}
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
                  description = t("cataract.highDesc");
                } else if (percentage >= 30) {
                  riskLevel = "medium";
                  riskColor = "#ffa500";
                  description = t("cataract.mediumDesc");
                } else {
                  riskLevel = "low";
                  riskColor = "#00d4aa";
                  description = t("cataract.lowDesc");
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
                      {t("cataract.riskTitle").replace("{level}", t(`common.risk.${riskLevel}`))}
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
                        <p className="text-[10px]" style={{ color: "#64748b" }}>{t("cataract.visualLabel")}</p>
                        <p className="text-sm font-bold" style={{ color: "#00d4aa" }}>
                          {visualScore}/{visualTestItems.length}
                        </p>
                      </div>
                      <div className="glass-card rounded-xl p-3 text-center">
                        <p className="text-[10px]" style={{ color: "#64748b" }}>{t("cataract.symptomsLabel")}</p>
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
                          background: "linear-gradient(135deg, #00d4aa, #00a88a)",
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
