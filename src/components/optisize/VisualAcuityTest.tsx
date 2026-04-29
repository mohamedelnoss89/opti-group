"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Eye,
  EyeOff,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface VisualAcuityTestProps {
  onBack: () => void;
}

type Direction = "up" | "down" | "left" | "right";
type EyeSelection = "right" | "left" | "both";
type Phase =
  | "eye-select"
  | "instructions"
  | "test"
  | "eye-result"
  | "results";

const testLines = [
  { eSize: 80, label: "6/60", rotations: 3 },
  { eSize: 64, label: "6/36", rotations: 3 },
  { eSize: 48, label: "6/24", rotations: 3 },
  { eSize: 36, label: "6/18", rotations: 4 },
  { eSize: 28, label: "6/12", rotations: 4 },
  { eSize: 20, label: "6/9", rotations: 4 },
  { eSize: 16, label: "6/6", rotations: 5 },
  { eSize: 12, label: "6/5", rotations: 5 },
];

const dirAngles: Record<Direction, number> = {
  right: 0,
  down: 90,
  left: 180,
  up: 270,
};

function makeSteps(): { li: number; dir: Direction }[] {
  const out: { li: number; dir: Direction }[] = [];
  const ds: Direction[] = ["up", "down", "left", "right"];
  for (let li = 0; li < testLines.length; li++) {
    for (let ri = 0; ri < testLines[li].rotations; ri++) {
      out.push({ li, dir: ds[Math.floor(Math.random() * 4)] });
    }
  }
  return out;
}

interface EyeResult {
  eye: "right" | "left";
  score: number;
  total: number;
  best: number;
  correctPerLine: number[];
  totalPerLine: number[];
}

function calcResults(
  steps: { li: number; dir: Direction }[],
  answers: Direction[]
) {
  const correctPerLine = new Array(testLines.length).fill(0) as number[];
  const totalPerLine = new Array(testLines.length).fill(0) as number[];

  steps.forEach((s, i) => {
    totalPerLine[s.li]++;
    if (i < answers.length && answers[i] === s.dir) {
      correctPerLine[s.li]++;
    }
  });

  let best = -1;
  for (let i = testLines.length - 1; i >= 0; i--) {
    if (totalPerLine[i] > 0 && correctPerLine[i] / totalPerLine[i] >= 0.66) {
      best = i;
      break;
    }
  }

  return { best, correctPerLine, totalPerLine };
}

function getResInfo(best: number) {
  if (best >= 5)
    return {
      color: "#00d4aa",
      title: "رؤية ممتازة",
      desc: "تهانينا! حدة بصرك ممتازة. استمر في الفحوصات الدورية.",
    };
  if (best >= 3)
    return {
      color: "#0080ff",
      title: "رؤية جيدة",
      desc: "رؤيتك جيدة. ينصح بإجراء فحص دوري عند طبيب العيون.",
    };
  if (best >= 1)
    return {
      color: "#ffa500",
      title: "رؤية متوسطة",
      desc: "قد تحتاج إلى نظارات. ينصح بزيارة طبيب العيون.",
    };
  return {
    color: "#ff3b30",
    title: "ينصح بزيارة طبيب العيون",
    desc: "النتائج تشير إلى ضعف في حدة البصر. يجب زيارة طبيب العيون.",
  };
}

const fadeVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export default function VisualAcuityTest({ onBack }: VisualAcuityTestProps) {
  const [phase, setPhase] = useState<Phase>("eye-select");
  const [selectedEye, setSelectedEye] = useState<EyeSelection | null>(null);
  const [currentTestEye, setCurrentTestEye] = useState<"right" | "left">(
    "right"
  );
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [fb, setFb] = useState<boolean | null>(null);
  const [eyeResults, setEyeResults] = useState<EyeResult[]>([]);

  const stepsRef = useRef<{ li: number; dir: Direction }[]>(makeSteps());
  const ansRef = useRef<Direction[]>([]);
  const scoreRef = useRef(0);

  const steps = stepsRef.current;
  const total = steps.length;

  const cur = useMemo(() => {
    if (phase !== "test" || step >= steps.length)
      return { li: 0, dir: "right" as Direction };
    return steps[step];
  }, [step, steps, phase]);

  const curLine = useMemo(() => {
    return testLines[cur.li];
  }, [cur.li]);

  // Select eye and go to instructions
  const handleSelectEye = useCallback((eye: EyeSelection) => {
    setSelectedEye(eye);
    setCurrentTestEye("right");
    setEyeResults([]);
    setPhase("instructions");
  }, []);

  // Start test for current eye
  const startTest = useCallback(() => {
    stepsRef.current = makeSteps();
    ansRef.current = [];
    scoreRef.current = 0;
    setStep(0);
    setScore(0);
    setFb(null);
    setPhase("test");
  }, []);

  // Answer direction
  const answer = useCallback(
    (d: Direction) => {
      if (fb !== null || phase !== "test") return;
      const ok = d === cur.dir;
      setFb(ok);
      ansRef.current.push(d);
      if (ok) {
        scoreRef.current += 1;
        setScore(scoreRef.current);
      }
      setTimeout(() => {
        setFb(null);
        if (step < total - 1) {
          setStep((s) => s + 1);
        } else {
          // Test finished for this eye - calculate results
          const res = calcResults(steps, ansRef.current);
          const eyeRes: EyeResult = {
            eye: currentTestEye,
            score: scoreRef.current,
            total,
            best: res.best,
            correctPerLine: res.correctPerLine,
            totalPerLine: res.totalPerLine,
          };

          const newResults = [...eyeResults, eyeRes];
          setEyeResults(newResults);

          if (selectedEye === "both") {
            // Both mode: show per-eye result screen
            setPhase("eye-result");
          } else {
            // Single mode: go straight to final results
            setPhase("results");
          }
        }
      }, 500);
    },
    [fb, cur, step, total, currentTestEye, eyeResults, selectedEye, phase]
  );

  // Navigate to next eye instructions from eye-result screen
  const goToNextEye = useCallback(() => {
    setCurrentTestEye("left");
    setPhase("instructions");
  }, []);

  // Navigate to final comprehensive results from eye-result screen
  const showFinalResults = useCallback(() => {
    setPhase("results");
  }, []);

  // Restart everything
  const restart = useCallback(() => {
    setSelectedEye(null);
    setCurrentTestEye("right");
    setEyeResults([]);
    setStep(0);
    setScore(0);
    setFb(null);
    setPhase("eye-select");
  }, []);

  const eyeLabel = (eye: "right" | "left") =>
    eye === "right" ? "العين اليمنى" : "العين اليسرى";

  // Get the just-completed eye result for eye-result phase
  const lastEyeResult = useMemo(() => {
    if (eyeResults.length === 0) return null;
    return eyeResults[eyeResults.length - 1];
  }, [eyeResults]);

  // Determine if there's another eye to test after this one
  const hasNextEye = useMemo(() => {
    if (selectedEye !== "both") return false;
    if (currentTestEye === "right") return true;
    return false;
  }, [selectedEye, currentTestEye]);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#0a0e1a" }}
    >
      {/* Background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(168,85,247,0.05) 0%, transparent 50%)",
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
            اختبار حدة البصر
          </h1>
          <p className="text-xs" style={{ color: "#64748b" }}>
            اختبار الحرف E
          </p>
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 px-4 pb-8 relative z-10">
        <AnimatePresence mode="wait">
          {/* ===== EYE SELECTION ===== */}
          {phase === "eye-select" && (
            <motion.div
              key="eye-select"
              variants={fadeVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center py-8"
            >
              <div
                className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(168,85,247,0.13), rgba(99,102,241,0.03))",
                  border: "1px solid rgba(168,85,247,0.19)",
                }}
              >
                <Eye className="w-12 h-12" style={{ color: "#a855f7" }} />
              </div>

              <h2
                className="text-xl font-bold mb-2"
                style={{ color: "#e2e8f0" }}
              >
                اختبار الحرف E
              </h2>
              <p
                className="text-sm text-center mb-8 max-w-[300px] leading-relaxed"
                style={{ color: "#94a3b8" }}
              >
                اختر العين التي تريد اختبارها
              </p>

              <div className="w-full max-w-[320px] space-y-3">
                {/* Right Eye */}
                <button
                  onClick={() => handleSelectEye("right")}
                  className="w-full rounded-2xl p-4 flex items-center gap-4 transition-all duration-200 active:scale-[0.98]"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg, #0080ff, #0050cc)",
                    }}
                  >
                    <Eye className="w-7 h-7" style={{ color: "#fff" }} />
                  </div>
                  <div className="text-right flex-1">
                    <p
                      className="text-base font-semibold"
                      style={{ color: "#e2e8f0" }}
                    >
                      العين اليمنى
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#0080ff" }}>
                      اختبار العين اليمنى
                    </p>
                    <p
                      className="text-xs mt-1"
                      style={{ color: "#64748b" }}
                    >
                      اختبار حدة البصر للعين اليمنى فقط
                    </p>
                  </div>
                </button>

                {/* Left Eye */}
                <button
                  onClick={() => handleSelectEye("left")}
                  className="w-full rounded-2xl p-4 flex items-center gap-4 transition-all duration-200 active:scale-[0.98]"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg, #a855f7, #6366f1)",
                    }}
                  >
                    <Eye className="w-7 h-7" style={{ color: "#fff" }} />
                  </div>
                  <div className="text-right flex-1">
                    <p
                      className="text-base font-semibold"
                      style={{ color: "#e2e8f0" }}
                    >
                      العين اليسرى
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#a855f7" }}>
                      اختبار العين اليسرى
                    </p>
                    <p
                      className="text-xs mt-1"
                      style={{ color: "#64748b" }}
                    >
                      اختبار حدة البصر للعين اليسرى فقط
                    </p>
                  </div>
                </button>

                {/* Both Eyes */}
                <button
                  onClick={() => handleSelectEye("both")}
                  className="w-full rounded-2xl p-4 flex items-center gap-4 transition-all duration-200 active:scale-[0.98]"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg, #00d4aa, #00a080)",
                    }}
                  >
                    <div className="flex gap-1">
                      <Eye className="w-5 h-5" style={{ color: "#fff" }} />
                      <Eye className="w-5 h-5" style={{ color: "#fff" }} />
                    </div>
                  </div>
                  <div className="text-right flex-1">
                    <p
                      className="text-base font-semibold"
                      style={{ color: "#e2e8f0" }}
                    >
                      العينين معاً
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#00d4aa" }}>
                      اختبار العينين معاً
                    </p>
                    <p
                      className="text-xs mt-1"
                      style={{ color: "#64748b" }}
                    >
                      اختبار كل عين على حدة ثم عرض النتائج
                    </p>
                  </div>
                </button>
              </div>

              <div
                className="rounded-xl p-4 mt-8 w-full max-w-[320px]"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className="flex gap-2 mb-2">
                  <AlertTriangle
                    className="w-4 h-4 shrink-0 mt-0.5"
                    style={{ color: "#ffa500" }}
                  />
                  <p className="text-xs" style={{ color: "#94a3b8" }}>
                    هذا الاختبار للتوجيه فقط ولا يُغني عن الفحص الدقيق عند طبيب
                    العيون.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ===== INSTRUCTIONS ===== */}
          {phase === "instructions" && (
            <motion.div
              key={`instructions-${currentTestEye}`}
              variants={fadeVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <motion.div
                animate={{ rotate: [0, 90, 180, 270, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="w-28 h-28 rounded-3xl flex items-center justify-center mb-6"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(168,85,247,0.13), rgba(99,102,241,0.03))",
                  border: "1px solid rgba(168,85,247,0.19)",
                }}
              >
                <span
                  style={{
                    fontSize: 64,
                    fontWeight: 900,
                    color: "#a855f7",
                    fontFamily: "Arial",
                  }}
                >
                  E
                </span>
              </motion.div>

              {/* Current eye indicator */}
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-full mb-4"
                style={{
                  background:
                    currentTestEye === "right"
                      ? "rgba(0,128,255,0.12)"
                      : "rgba(168,85,247,0.12)",
                  border:
                    currentTestEye === "right"
                      ? "1px solid rgba(0,128,255,0.25)"
                      : "1px solid rgba(168,85,247,0.25)",
                }}
              >
                {currentTestEye === "right" ? (
                  <Eye
                    className="w-4 h-4"
                    style={{ color: "#0080ff" }}
                  />
                ) : (
                  <Eye
                    className="w-4 h-4"
                    style={{ color: "#a855f7" }}
                  />
                )}
                <span
                  className="text-sm font-medium"
                  style={{
                    color:
                      currentTestEye === "right" ? "#0080ff" : "#a855f7",
                  }}
                >
                  {eyeLabel(currentTestEye)}
                </span>
              </div>

              {selectedEye === "both" && (
                <p className="text-xs mb-4" style={{ color: "#64748b" }}>
                  الاختبار {currentTestEye === "right" ? "1" : "2"} من 2
                </p>
              )}

              <h2
                className="text-xl font-bold mb-3"
                style={{ color: "#e2e8f0" }}
              >
                اختبار الحرف E
              </h2>
              <p
                className="text-sm text-center mb-2 max-w-[300px] leading-relaxed"
                style={{ color: "#94a3b8" }}
              >
                سيظهر حرف E في اتجاهات مختلفة. اختر الاتجاه الذي يشير إليه.
                يصغر الحرف تدريجياً.
              </p>
              <div
                className="rounded-xl p-4 mb-6 w-full max-w-[300px]"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <p className="text-xs mb-2" style={{ color: "#94a3b8" }}>
                  - اجلس على بعد 3 أمتار من الشاشة
                </p>
                <p className="text-xs mb-2" style={{ color: "#94a3b8" }}>
                  -
                  {selectedEye === "both"
                    ? " غط العين الأخرى واختبر كل عين على حدة"
                    : selectedEye === "right"
                    ? " غط العين اليسرى جيداً"
                    : " غط العين اليمنى جيداً"}
                </p>
                <p className="text-xs" style={{ color: "#94a3b8" }}>
                  - {total} سؤال - الحرف يصغر تدريجياً
                </p>
              </div>
              <Button
                onClick={startTest}
                className="h-12 px-8 rounded-xl font-medium text-base"
                style={{
                  background:
                    "linear-gradient(135deg, #a855f7, #6366f1)",
                  color: "#0a0e1a",
                }}
              >
                ابدأ الاختبار
              </Button>
            </motion.div>
          )}

          {/* ===== TEST ===== */}
          {phase === "test" && (
            <motion.div
              key={`test-${currentTestEye}`}
              variants={fadeVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              {/* Current eye badge */}
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-full mb-3"
                style={{
                  background:
                    currentTestEye === "right"
                      ? "rgba(0,128,255,0.12)"
                      : "rgba(168,85,247,0.12)",
                  border:
                    currentTestEye === "right"
                      ? "1px solid rgba(0,128,255,0.2)"
                      : "1px solid rgba(168,85,247,0.2)",
                }}
              >
                <Eye
                  className="w-3.5 h-3.5"
                  style={{
                    color:
                      currentTestEye === "right" ? "#0080ff" : "#a855f7",
                  }}
                />
                <span
                  className="text-[11px] font-medium"
                  style={{
                    color:
                      currentTestEye === "right" ? "#0080ff" : "#a855f7",
                  }}
                >
                  {eyeLabel(currentTestEye)}
                </span>
              </div>

              {/* Progress */}
              <div className="w-full flex items-center justify-between mb-2">
                <p className="text-xs" style={{ color: "#94a3b8" }}>
                  السؤال {step + 1} من {total}
                </p>
                <p
                  className="text-xs font-medium"
                  style={{ color: "#a855f7" }}
                >
                  {Math.round(((step + 1) / total) * 100)}%
                </p>
              </div>
              <div
                className="w-full h-1.5 rounded-full overflow-hidden mb-3"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, #a855f7, #6366f1)",
                    width: `${Math.round(
                      ((step + 1) / total) * 100
                    )}%`,
                    transition: "width 0.3s",
                  }}
                />
              </div>

              <div className="flex items-center gap-4 mb-2">
                <span
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    background: "rgba(168,85,247,0.15)",
                    color: "#a855f7",
                    border: "1px solid rgba(168,85,247,0.25)",
                  }}
                >
                  {curLine.label}
                </span>
                <span className="text-xs" style={{ color: "#64748b" }}>
                  السطر {cur.li + 1} من {testLines.length}
                </span>
              </div>

              <p className="text-xs mb-6" style={{ color: "#94a3b8" }}>
                صحيح:{" "}
                <span style={{ color: "#00d4aa", fontWeight: 600 }}>
                  {score}
                </span>{" "}
                / {step}
              </p>

              {/* E Letter */}
              <div
                className="w-40 h-40 rounded-2xl flex items-center justify-center mb-6"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border:
                    fb === true
                      ? "2px solid rgba(0,212,170,0.5)"
                      : fb === false
                      ? "2px solid rgba(255,59,48,0.5)"
                      : "1px solid rgba(255,255,255,0.08)",
                  boxShadow:
                    fb === true
                      ? "0 0 30px rgba(0,212,170,0.2)"
                      : fb === false
                      ? "0 0 30px rgba(255,59,48,0.2)"
                      : "0 8px 32px rgba(168,85,247,0.08)",
                  transition:
                    "border-color 0.2s, box-shadow 0.2s",
                }}
              >
                <span
                  style={{
                    fontSize: curLine.eSize,
                    fontWeight: 900,
                    color: "#e2e8f0",
                    fontFamily: "Arial, Helvetica, sans-serif",
                    lineHeight: 1,
                    display: "block",
                    transform: `rotate(${dirAngles[cur.dir]}deg)`,
                    transition: "transform 0.3s ease",
                  }}
                >
                  E
                </span>
              </div>

              {/* Feedback */}
              {fb !== null && (
                <p
                  className="text-sm font-medium mb-4"
                  style={{ color: fb ? "#00d4aa" : "#ff3b30" }}
                >
                  {fb ? "صحيح!" : "خطأ"}
                </p>
              )}

              {/* Direction Buttons */}
              <div
                className="grid gap-3 w-full max-w-[240px]"
                style={{
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gridTemplateRows: "1fr 1fr 1fr",
                }}
              >
                <div />
                <button
                  onClick={() => answer("up")}
                  disabled={fb !== null}
                  className="h-14 rounded-xl flex items-center justify-center active:scale-95 transition-transform"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 19V5" />
                    <path d="M5 12l7-7 7 7" />
                  </svg>
                </button>
                <div />
                <button
                  onClick={() => answer("left")}
                  disabled={fb !== null}
                  className="h-14 rounded-xl flex items-center justify-center active:scale-95 transition-transform"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 12H5" />
                    <path d="M12 19l-7-7 7-7" />
                  </svg>
                </button>
                <div
                  className="h-14 rounded-xl flex items-center justify-center"
                  style={{
                    background: "rgba(168,85,247,0.08)",
                    border: "1px solid rgba(168,85,247,0.15)",
                  }}
                >
                  <span
                    style={{
                      fontSize: Math.max(12, curLine.eSize * 0.25),
                      fontWeight: 900,
                      color: "#a855f7",
                      opacity: 0.4,
                    }}
                  >
                    E
                  </span>
                </div>
                <button
                  onClick={() => answer("right")}
                  disabled={fb !== null}
                  className="h-14 rounded-xl flex items-center justify-center active:scale-95 transition-transform"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="M12 5l7 7-7 7" />
                  </svg>
                </button>
                <div />
                <button
                  onClick={() => answer("down")}
                  disabled={fb !== null}
                  className="h-14 rounded-xl flex items-center justify-center active:scale-95 transition-transform"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 5v14" />
                    <path d="M19 12l-7 7-7-7" />
                  </svg>
                </button>
                <div />
              </div>
            </motion.div>
          )}

          {/* ===== EYE RESULT (intermediate screen after each eye in "both" mode) ===== */}
          {phase === "eye-result" && lastEyeResult && (
            <motion.div
              key={`eye-result-${lastEyeResult.eye}`}
              variants={fadeVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center py-6"
            >
              {/* Success icon */}
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{
                  background:
                    currentTestEye === "right"
                      ? "rgba(0,128,255,0.12)"
                      : "rgba(168,85,247,0.12)",
                  border:
                    currentTestEye === "right"
                      ? "2px solid rgba(0,128,255,0.3)"
                      : "2px solid rgba(168,85,247,0.3)",
                }}
              >
                <CheckCircle2
                  className="w-8 h-8"
                  style={{
                    color:
                      currentTestEye === "right" ? "#0080ff" : "#a855f7",
                  }}
                />
              </div>

              <h2
                className="text-lg font-bold mb-1"
                style={{ color: "#e2e8f0" }}
              >
                نتيجة {eyeLabel(lastEyeResult.eye)}
              </h2>
              <p className="text-xs mb-5" style={{ color: "#64748b" }}>
                {selectedEye === "both"
                  ? currentTestEye === "right"
                    ? "تم اختبار العين اليمنى بنجاح"
                    : "تم اختبار العين اليسرى بنجاح"
                  : "تم الاختبار بنجاح"}
              </p>

              {/* Result card */}
              {(() => {
                const info = getResInfo(lastEyeResult.best);
                return (
                  <div
                    className="rounded-2xl p-5 w-full mb-5"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
                      border: `1px solid ${info.color}30`,
                    }}
                  >
                    {/* Eye header with score */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{
                            background:
                              lastEyeResult.eye === "right"
                                ? "rgba(0,128,255,0.15)"
                                : "rgba(168,85,247,0.15)",
                          }}
                        >
                          <Eye
                            className="w-6 h-6"
                            style={{
                              color:
                                lastEyeResult.eye === "right"
                                  ? "#0080ff"
                                  : "#a855f7",
                            }}
                          />
                        </div>
                        <div>
                          <p
                            className="text-base font-semibold"
                            style={{ color: "#e2e8f0" }}
                          >
                            {eyeLabel(lastEyeResult.eye)}
                          </p>
                          <p
                            className="text-xs mt-0.5"
                            style={{ color: info.color }}
                          >
                            {info.title}
                          </p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p
                          className="text-3xl font-bold"
                          style={{ color: info.color }}
                        >
                          {lastEyeResult.best >= 0
                            ? testLines[lastEyeResult.best].label
                            : "--"}
                        </p>
                        <p
                          className="text-[10px] text-left mt-0.5"
                          style={{ color: "#64748b" }}
                        >
                          حدة البصر
                        </p>
                      </div>
                    </div>

                    {/* Status message */}
                    <div
                      className="rounded-xl px-4 py-3 mb-4"
                      style={{
                        background: `${info.color}08`,
                        border: `1px solid ${info.color}20`,
                      }}
                    >
                      <p
                        className="text-sm text-center leading-relaxed"
                        style={{ color: info.color }}
                      >
                        {info.desc}
                      </p>
                    </div>

                    {/* Score bar */}
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="text-xs"
                        style={{ color: "#94a3b8" }}
                      >
                        الاجابات الصحيحة
                      </span>
                      <span
                        className="text-xs font-medium"
                        style={{ color: info.color }}
                      >
                        {lastEyeResult.score} / {lastEyeResult.total}
                      </span>
                    </div>
                    <div
                      className="w-full h-2 rounded-full overflow-hidden mb-4"
                      style={{ background: "rgba(255,255,255,0.08)" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          background: `linear-gradient(90deg, ${info.color}, ${info.color}cc)`,
                          width: `${Math.round(
                            (lastEyeResult.score / lastEyeResult.total) * 100
                          )}%`,
                          transition: "width 0.5s",
                        }}
                      />
                    </div>

                    {/* Line breakdown */}
                    <div className="space-y-1.5">
                      {testLines.map((ln, i) => {
                        const c = lastEyeResult.correctPerLine[i];
                        const t = lastEyeResult.totalPerLine[i];
                        const p = t > 0 ? Math.round((c / t) * 100) : 0;
                        const pass = p >= 66;
                        const isBest = i === lastEyeResult.best;
                        return (
                          <div
                            key={i}
                            className="flex items-center justify-between px-2.5 py-2 rounded-lg"
                            style={{
                              background: isBest
                                ? "rgba(168,85,247,0.1)"
                                : "rgba(255,255,255,0.02)",
                              border: isBest
                                ? "1px solid rgba(168,85,247,0.2)"
                                : "1px solid transparent",
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="text-[11px] font-medium"
                                style={{
                                  color: isBest
                                    ? "#a855f7"
                                    : "#64748b",
                                }}
                              >
                                {ln.label}
                              </span>
                              {isBest && (
                                <span
                                  className="text-[9px] px-1.5 py-0.5 rounded-full"
                                  style={{
                                    background:
                                      "rgba(168,85,247,0.2)",
                                    color: "#a855f7",
                                  }}
                                >
                                  افضل
                                </span>
                              )}
                            </div>
                            <span
                              className="text-[11px] font-medium"
                              style={{
                                color: pass ? "#00d4aa" : "#ff3b30",
                              }}
                            >
                              {c}/{t} ({p}%)
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Progress indicator for both mode */}
              {selectedEye === "both" && (
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                    style={{
                      background:
                        currentTestEye === "right"
                          ? "rgba(0,128,255,0.12)"
                          : "rgba(255,255,255,0.05)",
                      border:
                        currentTestEye === "right"
                          ? "1px solid rgba(0,128,255,0.25)"
                          : "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <Eye
                      className="w-3 h-3"
                      style={{
                        color:
                          currentTestEye === "right"
                            ? "#0080ff"
                            : "#00d4aa",
                      }}
                    />
                    <span
                      className="text-[10px] font-medium"
                      style={{
                        color:
                          currentTestEye === "right"
                            ? "#0080ff"
                            : "#00d4aa",
                      }}
                    >
                      اليمنى
                    </span>
                    {currentTestEye === "right" ? null : (
                      <CheckCircle2
                        className="w-3 h-3"
                        style={{ color: "#00d4aa" }}
                      />
                    )}
                  </div>
                  <div
                    className="w-4 h-px"
                    style={{ background: "rgba(255,255,255,0.1)" }}
                  />
                  <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                    style={{
                      background:
                        currentTestEye === "left"
                          ? "rgba(168,85,247,0.12)"
                          : "rgba(255,255,255,0.05)",
                      border:
                        currentTestEye === "left"
                          ? "1px solid rgba(168,85,247,0.25)"
                          : "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <Eye
                      className="w-3 h-3"
                      style={{
                        color:
                          currentTestEye === "left"
                            ? "#a855f7"
                            : "#64748b",
                      }}
                    />
                    <span
                      className="text-[10px] font-medium"
                      style={{
                        color:
                          currentTestEye === "left"
                            ? "#a855f7"
                            : "#64748b",
                      }}
                    >
                      اليسرى
                    </span>
                    {currentTestEye === "left" ? null : (
                      <span
                        className="text-[9px]"
                        style={{ color: "#64748b" }}
                      >
                        قريباً
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              {hasNextEye ? (
                <Button
                  onClick={goToNextEye}
                  className="w-full h-12 rounded-xl font-medium text-base"
                  style={{
                    background:
                      "linear-gradient(135deg, #a855f7, #6366f1)",
                    color: "#0a0e1a",
                  }}
                >
                  اختبار العين التالية ←
                </Button>
              ) : (
                <Button
                  onClick={showFinalResults}
                  className="w-full h-12 rounded-xl font-medium text-base"
                  style={{
                    background:
                      "linear-gradient(135deg, #00d4aa, #00a080)",
                    color: "#0a0e1a",
                  }}
                >
                  عرض النتيجة النهائية
                </Button>
              )}
            </motion.div>
          )}

          {/* ===== RESULTS (final comprehensive results) ===== */}
          {phase === "results" && (
            <motion.div
              key="results"
              variants={fadeVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center py-6"
            >
              {/* Header */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(0,212,170,0.12), rgba(168,85,247,0.08))",
                  border: "1px solid rgba(0,212,170,0.2)",
                }}
              >
                <CheckCircle2
                  className="w-8 h-8"
                  style={{ color: "#00d4aa" }}
                />
              </div>
              <h2
                className="text-xl font-bold mb-1"
                style={{ color: "#e2e8f0" }}
              >
                النتيجة النهائية
              </h2>
              <p className="text-xs mb-5" style={{ color: "#64748b" }}>
                {eyeResults.length === 2
                  ? "ملخص نتائج اختبار العينين"
                  : "نتيجة اختبار " +
                    eyeLabel(eyeResults[0].eye)}
              </p>

              {/* Both eyes comparison header (only for both mode) */}
              {eyeResults.length === 2 && (
                <div
                  className="rounded-2xl p-4 w-full mb-4"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(0,128,255,0.06), rgba(168,85,247,0.06))",
                    border: "1px solid rgba(168,85,247,0.15)",
                  }}
                >
                  <div className="flex items-center justify-center gap-6">
                    {/* Right eye score */}
                    <div className="flex flex-col items-center">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center mb-1.5"
                        style={{
                          background: "rgba(0,128,255,0.15)",
                          border: "1.5px solid rgba(0,128,255,0.3)",
                        }}
                      >
                        <Eye
                          className="w-5 h-5"
                          style={{ color: "#0080ff" }}
                        />
                      </div>
                      <p
                        className="text-[10px] mb-0.5"
                        style={{ color: "#94a3b8" }}
                      >
                        اليمنى
                      </p>
                      <p
                        className="text-lg font-bold"
                        style={{ color: "#0080ff" }}
                      >
                        {eyeResults[0].best >= 0
                          ? testLines[eyeResults[0].best].label
                          : "--"}
                      </p>
                    </div>

                    {/* VS indicator */}
                    <div className="flex flex-col items-center">
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{
                          background: "rgba(168,85,247,0.15)",
                          color: "#a855f7",
                          border: "1px solid rgba(168,85,247,0.25)",
                        }}
                      >
                        مقابل
                      </span>
                    </div>

                    {/* Left eye score */}
                    <div className="flex flex-col items-center">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center mb-1.5"
                        style={{
                          background: "rgba(168,85,247,0.15)",
                          border: "1.5px solid rgba(168,85,247,0.3)",
                        }}
                      >
                        <Eye
                          className="w-5 h-5"
                          style={{ color: "#a855f7" }}
                        />
                      </div>
                      <p
                        className="text-[10px] mb-0.5"
                        style={{ color: "#94a3b8" }}
                      >
                        اليسرى
                      </p>
                      <p
                        className="text-lg font-bold"
                        style={{ color: "#a855f7" }}
                      >
                        {eyeResults[1].best >= 0
                          ? testLines[eyeResults[1].best].label
                          : "--"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Per-eye detailed results */}
              <div className="w-full space-y-4 mb-5">
                {eyeResults.map((eyeRes) => {
                  const info = getResInfo(eyeRes.best);
                  return (
                    <div
                      key={eyeRes.eye}
                      className="rounded-2xl p-4 w-full"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
                        border: `1px solid ${info.color}30`,
                      }}
                    >
                      {/* Eye header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{
                              background:
                                eyeRes.eye === "right"
                                  ? "rgba(0,128,255,0.15)"
                                  : "rgba(168,85,247,0.15)",
                            }}
                          >
                            <Eye
                              className="w-5 h-5"
                              style={{
                                color:
                                  eyeRes.eye === "right"
                                    ? "#0080ff"
                                    : "#a855f7",
                              }}
                            />
                          </div>
                          <div>
                            <p
                              className="text-sm font-semibold"
                              style={{ color: "#e2e8f0" }}
                            >
                              {eyeLabel(eyeRes.eye)}
                            </p>
                            <p
                              className="text-[11px]"
                              style={{ color: info.color }}
                            >
                              {info.title}
                            </p>
                          </div>
                        </div>
                        <div className="text-left">
                          <p
                            className="text-2xl font-bold"
                            style={{ color: info.color }}
                          >
                            {eyeRes.best >= 0
                              ? testLines[eyeRes.best].label
                              : "--"}
                          </p>
                        </div>
                      </div>

                      {/* Score bar */}
                      <div
                        className="flex items-center justify-between mb-2"
                      >
                        <span
                          className="text-xs"
                          style={{ color: "#94a3b8" }}
                        >
                          الاجابات الصحيحة
                        </span>
                        <span
                          className="text-xs font-medium"
                          style={{ color: info.color }}
                        >
                          {eyeRes.score} / {eyeRes.total}
                        </span>
                      </div>
                      <div
                        className="w-full h-1.5 rounded-full overflow-hidden mb-3"
                        style={{ background: "rgba(255,255,255,0.08)" }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            background: info.color,
                            width: `${Math.round(
                              (eyeRes.score / eyeRes.total) * 100
                            )}%`,
                            transition: "width 0.5s",
                          }}
                        />
                      </div>

                      {/* Line breakdown */}
                      <div className="space-y-1.5">
                        {testLines.map((ln, i) => {
                          const c = eyeRes.correctPerLine[i];
                          const t = eyeRes.totalPerLine[i];
                          const p =
                            t > 0 ? Math.round((c / t) * 100) : 0;
                          const pass = p >= 66;
                          const isBest = i === eyeRes.best;
                          return (
                            <div
                              key={i}
                              className="flex items-center justify-between px-2.5 py-2 rounded-lg"
                              style={{
                                background: isBest
                                  ? "rgba(168,85,247,0.1)"
                                  : "rgba(255,255,255,0.02)",
                                border: isBest
                                  ? "1px solid rgba(168,85,247,0.2)"
                                  : "1px solid transparent",
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className="text-[11px] font-medium"
                                  style={{
                                    color: isBest
                                      ? "#a855f7"
                                      : "#64748b",
                                  }}
                                >
                                  {ln.label}
                                </span>
                                {isBest && (
                                  <span
                                    className="text-[9px] px-1.5 py-0.5 rounded-full"
                                    style={{
                                      background:
                                        "rgba(168,85,247,0.2)",
                                      color: "#a855f7",
                                    }}
                                  >
                                    افضل
                                  </span>
                                )}
                              </div>
                              <span
                                className="text-[11px] font-medium"
                                style={{
                                  color: pass ? "#00d4aa" : "#ff3b30",
                                }}
                              >
                                {c}/{t} ({p}%)
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Comparison & Assessment (both mode only) */}
              {eyeResults.length === 2 && (
                <div className="w-full space-y-3 mb-5">
                  {/* Comparison card */}
                  {(() => {
                    const rBest = eyeResults[0].best;
                    const lBest = eyeResults[1].best;
                    const rInfo = getResInfo(rBest);
                    const lInfo = getResInfo(lBest);
                    const rightBetter = rBest > lBest;
                    const leftBetter = lBest > rBest;
                    const equal = rBest === lBest;

                    return (
                      <div
                        className="rounded-xl p-4 w-full"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(168,85,247,0.06), rgba(99,102,241,0.04))",
                          border: "1px solid rgba(168,85,247,0.15)",
                        }}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center"
                            style={{
                              background: "rgba(168,85,247,0.15)",
                            }}
                          >
                            <EyeOff
                              className="w-4 h-4"
                              style={{ color: "#a855f7" }}
                            />
                          </div>
                          <p
                            className="text-sm font-semibold"
                            style={{ color: "#e2e8f0" }}
                          >
                            المقارنة بين العينين
                          </p>
                        </div>

                        {/* Side by side mini bars */}
                        <div className="space-y-3">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span
                                className="text-[11px] font-medium"
                                style={{ color: "#0080ff" }}
                              >
                                {eyeLabel("right")}
                              </span>
                              <span
                                className="text-[11px] font-medium"
                                style={{ color: "#0080ff" }}
                              >
                                {rBest >= 0
                                  ? testLines[rBest].label
                                  : "--"}{" "}
                                ({rInfo.title})
                              </span>
                            </div>
                            <div
                              className="w-full h-2 rounded-full overflow-hidden"
                              style={{
                                background: "rgba(0,128,255,0.1)",
                              }}
                            >
                              <div
                                className="h-full rounded-full"
                                style={{
                                  background:
                                    "linear-gradient(90deg, #0080ff, #0060cc)",
                                  width: `${Math.max(
                                    (rBest >= 0
                                      ? ((rBest + 1) / testLines.length) *
                                        100
                                      : 5),
                                    5
                                  )}%`,
                                  transition: "width 0.5s",
                                }}
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span
                                className="text-[11px] font-medium"
                                style={{ color: "#a855f7" }}
                              >
                                {eyeLabel("left")}
                              </span>
                              <span
                                className="text-[11px] font-medium"
                                style={{ color: "#a855f7" }}
                              >
                                {lBest >= 0
                                  ? testLines[lBest].label
                                  : "--"}{" "}
                                ({lInfo.title})
                              </span>
                            </div>
                            <div
                              className="w-full h-2 rounded-full overflow-hidden"
                              style={{
                                background: "rgba(168,85,247,0.1)",
                              }}
                            >
                              <div
                                className="h-full rounded-full"
                                style={{
                                  background:
                                    "linear-gradient(90deg, #a855f7, #7c3aed)",
                                  width: `${Math.max(
                                    (lBest >= 0
                                      ? ((lBest + 1) / testLines.length) *
                                        100
                                      : 5),
                                    5
                                  )}%`,
                                  transition: "width 0.5s",
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Comparison verdict */}
                        <div
                          className="mt-3 rounded-lg px-3 py-2.5"
                          style={{
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.06)",
                          }}
                        >
                          <p
                            className="text-xs text-center leading-relaxed"
                            style={{ color: "#94a3b8" }}
                          >
                            {equal
                              ? "كلتا العينين بنفس مستوى الرؤية"
                              : rightBetter
                              ? `العين اليمنى أفضل من اليسرى (${testLines[rBest >= 0 ? rBest : 0].label} مقابل ${testLines[lBest >= 0 ? lBest : 0].label})`
                              : `العين اليسرى أفضل من اليمنى (${testLines[lBest >= 0 ? lBest : 0].label} مقابل ${testLines[rBest >= 0 ? rBest : 0].label})`}
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Overall assessment */}
                  <div
                    className="rounded-xl p-4 w-full"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(0,212,170,0.06), rgba(0,212,170,0.02))",
                      border: "1px solid rgba(0,212,170,0.15)",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2
                        className="w-4 h-4"
                        style={{ color: "#00d4aa" }}
                      />
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "#e2e8f0" }}
                      >
                        التقييم العام
                      </p>
                    </div>
                    <p
                      className="text-sm text-center leading-relaxed"
                      style={{ color: "#94a3b8" }}
                    >
                      {eyeResults[0].best === eyeResults[1].best &&
                      eyeResults[0].best >= 3
                        ? "رؤيتك متوازنة وممتازة في كلتا العينين. استمر في الفحوصات الدورية."
                        : Math.abs(eyeResults[0].best - eyeResults[1].best) <= 1
                        ? "رؤيتك متقاربة في كلتا العينين. ينصح بإجراء فحص دوري."
                        : "يوجد فرق واضح بين العينين. يُنصح بزيارة طبيب العيون لفحص شامل."}
                    </p>
                  </div>

                  {/* Recommendation */}
                  {(() => {
                    const avgBest = Math.round(
                      (eyeResults[0].best + eyeResults[1].best) / 2
                    );
                    const avgInfo = getResInfo(avgBest);
                    return (
                      <div
                        className="rounded-xl p-4 w-full"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle
                            className="w-4 h-4"
                            style={{ color: avgInfo.color }}
                          />
                          <p
                            className="text-sm font-semibold"
                            style={{ color: "#e2e8f0" }}
                          >
                            التوصية
                          </p>
                        </div>
                        <p
                          className="text-sm text-center leading-relaxed"
                          style={{ color: "#94a3b8" }}
                        >
                          {avgBest >= 5
                            ? "رؤيتك ممتازة. يُنصح بإجراء فحص دوري كل سنة للحفاظ على صحة عينيك."
                            : avgBest >= 3
                            ? "رؤيتك جيدة بشكل عام. يُنصح بزيارة طبيب العيون مرة كل سنة للتأكد من عدم وجود تغيرات."
                            : avgBest >= 1
                            ? "قد تستفيد من استخدام نظارات تصحيحية. يُنصح بزيارة طبيب العيون للحصول على وصفة طبية دقيقة."
                            : "ينصح بشدة بزيارة طبيب العيون في أقرب وقت للحصول على فحص شامل وتشخيص دقيق."}
                        </p>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Single eye assessment */}
              {eyeResults.length === 1 && (
                <div
                  className="rounded-xl p-4 mb-6 w-full"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(0,212,170,0.06), rgba(0,212,170,0.02))",
                    border: "1px solid rgba(0,212,170,0.15)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2
                      className="w-4 h-4"
                      style={{ color: "#00d4aa" }}
                    />
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "#e2e8f0" }}
                    >
                      التقييم العام
                    </p>
                  </div>
                  <p
                    className="text-sm text-center leading-relaxed"
                    style={{ color: "#94a3b8" }}
                  >
                    {getResInfo(eyeResults[0].best).desc}
                  </p>
                </div>
              )}

              <p
                className="text-[11px] text-center mb-6 max-w-[280px]"
                style={{ color: "#475569" }}
              >
                هذا الاختبار للتوجيه فقط ولا يغني عن الفحص الدقيق عند طبيب
                العيون.
              </p>

              <div className="flex gap-3 w-full">
                <Button
                  onClick={restart}
                  className="flex-1 h-11 rounded-xl font-medium"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#e2e8f0",
                  }}
                >
                  <RotateCcw className="w-4 h-4 ml-2" />
                  اعادة الاختبار
                </Button>
                <Button
                  onClick={onBack}
                  className="flex-1 h-11 rounded-xl font-medium"
                  style={{
                    background:
                      "linear-gradient(135deg, #a855f7, #6366f1)",
                    color: "#0a0e1a",
                  }}
                >
                  رجوع
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
