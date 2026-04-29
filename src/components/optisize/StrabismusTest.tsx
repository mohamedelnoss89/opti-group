"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Focus,
  ChevronLeft,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

interface StrabismusTestProps {
  onBack: () => void;
  onComplete: (result: { score: number; riskLevel: string; riskColor: string }) => void;
}

type Answer = "yes" | "sometimes" | "no";

export default function StrabismusTest({ onBack, onComplete }: StrabismusTestProps) {
  const { t, isRTL } = useI18n();

  const questions = [
    { id: 1, question: t("strab.q1"), description: t("strab.q1d") },
    { id: 2, question: t("strab.q2"), description: t("strab.q2d") },
    { id: 3, question: t("strab.q3"), description: t("strab.q3d") },
    { id: 4, question: t("strab.q4"), description: t("strab.q4d") },
    { id: 5, question: t("strab.q5"), description: t("strab.q5d") },
    { id: 6, question: t("strab.q6"), description: t("strab.q6d") },
  ];

  // Visual test: alignment check with patterns
  const visualPatterns = [
    { label: t("strab.pattern1"), pattern: "cross" as const },
    { label: t("strab.pattern2"), pattern: "dots" as const },
    { label: t("strab.pattern3"), pattern: "lines" as const },
  ];

  const [currentStep, setCurrentStep] = useState<"intro" | "visual" | "questions" | "result">("intro");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [visualResponses, setVisualResponses] = useState<string[]>([]);

  const handleAnswer = useCallback((answer: Answer) => {
    setAnswers((prev) => [...prev, answer]);
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      // Calculate results
      const yesCount = [...answers, answer].filter((a) => a === "yes").length;
      const sometimesCount = [...answers, answer].filter((a) => a === "sometimes").length;
      const score = yesCount * 2 + sometimesCount;
      const total = questions.length * 2;
      const percentage = (score / total) * 100;

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

  const handleVisualResponse = useCallback((response: string) => {
    setVisualResponses((prev) => [...prev, response]);
    if (visualResponses.length + 1 >= visualPatterns.length) {
      setCurrentStep("questions");
    }
  }, [visualResponses.length, visualPatterns.length]);

  const handleRestart = useCallback(() => {
    setCurrentStep("intro");
    setCurrentQuestion(0);
    setAnswers([]);
    setVisualResponses([]);
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
            {t("strab.title")}
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
                  background: "linear-gradient(135deg, #ffa50020, #ff6b0008)",
                  border: "1px solid #ffa50030",
                }}
              >
                <Focus className="w-12 h-12" style={{ color: "#ffa500" }} />
              </motion.div>
              <h2 className="text-xl font-bold mb-3" style={{ color: "#e2e8f0" }}>
                {t("strab.introTitle")}
              </h2>
              <p className="text-sm text-center mb-2 max-w-[280px] leading-relaxed" style={{ color: "#94a3b8" }}>
                {t("strab.introDesc")}
              </p>
              <p className="text-xs text-center mb-8 max-w-[280px]" style={{ color: "#64748b" }}>
                {t("strab.introInfo").replace("{questions}", String(questions.length)).replace("{visual}", String(visualPatterns.length))}
              </p>
              <Button
                onClick={() => setCurrentStep("visual")}
                className="h-12 px-8 rounded-xl font-medium text-base"
                style={{ background: "linear-gradient(135deg, #ffa500, #ff6b00)", color: "#0a0e1a" }}
              >
                {t("strab.start")}
              </Button>
            </motion.div>
          )}

          {/* Visual Patterns */}
          {currentStep === "visual" && (
            <motion.div
              key="visual"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <p className="text-xs mb-4" style={{ color: "#94a3b8" }}>
                {t("strab.patternProgress").replace("{current}", String(visualResponses.length + 1)).replace("{total}", String(visualPatterns.length))}
              </p>
              <p className="text-center text-sm mb-6" style={{ color: "#e2e8f0" }}>
                {t("strab.visualInstruction")}
              </p>

              {/* Visual Pattern Display */}
              <div className="flex justify-center mb-6">
                <motion.div
                  key={visualResponses.length}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-64 h-48 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  {visualPatterns[visualResponses.length]?.pattern === "cross" && (
                    <svg width="120" height="120" viewBox="0 0 120 120">
                      <line x1="60" y1="20" x2="60" y2="100" stroke="#ffa500" strokeWidth="2" />
                      <line x1="20" y1="60" x2="100" y2="60" stroke="#ffa500" strokeWidth="2" />
                      <circle cx="60" cy="60" r="15" fill="none" stroke="#ffa500" strokeWidth="1.5" />
                      <circle cx="60" cy="60" r="3" fill="#ffa500" />
                    </svg>
                  )}
                  {visualPatterns[visualResponses.length]?.pattern === "dots" && (
                    <div className="grid grid-cols-3 gap-4">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ delay: i * 0.1, duration: 1.5, repeat: Infinity }}
                          className="w-6 h-6 rounded-full"
                          style={{ background: i === 4 ? "#ffa500" : "#ffa50060" }}
                        />
                      ))}
                    </div>
                  )}
                  {visualPatterns[visualResponses.length]?.pattern === "lines" && (
                    <svg width="120" height="120" viewBox="0 0 120 120">
                      {[0, 15, 30, 45, 60, 75, 90, 105].map((y, i) => (
                        <motion.line
                          key={i}
                          x1="20"
                          y1={y + 8}
                          x2="100"
                          y2={y + 8}
                          stroke={i === 4 ? "#ffa500" : "#ffa50040"}
                          strokeWidth={i === 4 ? 2.5 : 1}
                          initial={{ x2: 20 }}
                          animate={{ x2: 100 }}
                          transition={{ delay: i * 0.08, duration: 0.5 }}
                        />
                      ))}
                    </svg>
                  )}
                </motion.div>
              </div>

              <div className="space-y-2">
                {([
                  { value: "yes", label: t("strab.matchYes") },
                  { value: "no", label: t("strab.matchNo") },
                  { value: "unsure", label: t("strab.matchUnsure") },
                ]).map((opt) => (
                  <Button
                    key={opt.value}
                    onClick={() => handleVisualResponse(opt.value)}
                    className="w-full h-11 rounded-xl text-sm"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#e2e8f0",
                    }}
                  >
                    {opt.label}
                  </Button>
                ))}
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
                  {t("strab.questionProgress").replace("{current}", String(currentQuestion + 1)).replace("{total}", String(questions.length))}
                </p>
                <p className="text-xs font-medium" style={{ color: "#ffa500" }}>
                  {Math.round(((currentQuestion) / questions.length) * 100)}%
                </p>
              </div>

              {/* Progress */}
              <div className="relative h-1.5 rounded-full overflow-hidden mb-8" style={{ background: "rgba(255,255,255,0.08)" }}>
                <motion.div
                  className="absolute inset-y-0 right-0 rounded-full"
                  style={{ background: "linear-gradient(90deg, #ffa500, #ff6b00)" }}
                  animate={{ width: `${((currentQuestion) / questions.length) * 100}%` }}
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
                      border: `1px solid rgba(255,255,255,0.1)`,
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
                  description = t("strab.highDesc");
                } else if (percentage >= 30) {
                  riskLevel = "medium";
                  riskColor = "#ffa500";
                  description = t("strab.mediumDesc");
                } else {
                  riskLevel = "low";
                  riskColor = "#00d4aa";
                  description = t("strab.lowDesc");
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
                      {t("strab.riskTitle").replace("{level}", t(`common.risk.${riskLevel}`))}
                    </h2>
                    <p className="text-3xl font-bold mb-4" style={{ color: riskColor }}>
                      {percentage}%
                    </p>

                    <div className="glass-card rounded-xl p-4 mb-6 w-full">
                      <p className="text-sm text-center leading-relaxed" style={{ color: "#94a3b8" }}>
                        {description}
                      </p>
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
                          background: "linear-gradient(135deg, #ffa500, #ff6b00)",
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
