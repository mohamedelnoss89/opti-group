"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Palette,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

interface ColorVisionTestProps {
  onBack: () => void;
  onComplete: (result: { score: number; total: number; status: string }) => void;
}

/* ============================================================
   Ishihara Plate Data
   ============================================================ */
interface IshiharaPlate {
  id: number;
  correctAnswer: number;
  options: number[];
  bgColors: string[];
  numColors: string[];
  seed: number;
}

const plates: IshiharaPlate[] = [
  {
    id: 1, correctAnswer: 12, options: [12, 17, 21, 15],
    bgColors: ["#6DBE5B", "#7EC96E", "#5A9E4B", "#8DD87E", "#4A8A3B", "#3A7A2B"],
    numColors: ["#CC3333", "#DD4444", "#BB2222", "#EE5555"], seed: 42,
  },
  {
    id: 2, correctAnswer: 6, options: [6, 8, 5, 9],
    bgColors: ["#E8A020", "#F0B030", "#D89010", "#F8C040", "#C88000", "#B87000"],
    numColors: ["#3A8A3A", "#2A7A2A", "#4A9A4A", "#1A6A1A"], seed: 123,
  },
  {
    id: 3, correctAnswer: 29, options: [29, 70, 26, 39],
    bgColors: ["#7080D0", "#8898E0", "#5868C0", "#A0B0F0", "#4858B0", "#3848A0"],
    numColors: ["#CC3333", "#DD4444", "#EE5555", "#BB2222"], seed: 256,
  },
  {
    id: 4, correctAnswer: 5, options: [5, 3, 8, 6],
    bgColors: ["#E87050", "#D86040", "#F88060", "#C85030", "#FF9070", "#B84020"],
    numColors: ["#3A8A3A", "#2A7A2A", "#4A9A4A", "#1A6A1A"], seed: 789,
  },
  {
    id: 5, correctAnswer: 74, options: [74, 21, 47, 71],
    bgColors: ["#6DBE5B", "#5A9E4B", "#8DD87E", "#4A8A3B", "#7EC96E", "#3A7A2B"],
    numColors: ["#D86040", "#C85030", "#E87050", "#B84020"], seed: 1024,
  },
  {
    id: 6, correctAnswer: 16, options: [16, 19, 15, 18],
    bgColors: ["#A08070", "#B09080", "#907060", "#C0A090", "#806050", "#D0B0A0"],
    numColors: ["#20A090", "#108070", "#30B0A0", "#006050"], seed: 567,
  },
  {
    id: 7, correctAnswer: 8, options: [8, 3, 6, 9],
    bgColors: ["#E09010", "#D08000", "#F0A020", "#C07000", "#FFB030", "#B06000"],
    numColors: ["#3A8A3A", "#2A7A2A", "#4A9A4A", "#1A6A1A"], seed: 333,
  },
  {
    id: 8, correctAnswer: 3, options: [3, 8, 5, 2],
    bgColors: ["#8DD87E", "#7EC96E", "#A0E890", "#6DBE5B", "#5A9E4B", "#B0F8A0"],
    numColors: ["#BB2222", "#CC3333", "#DD4444", "#AA1111"], seed: 888,
  },
];

/* ============================================================
   Seeded Random
   ============================================================ */
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

/* ============================================================
   Digit Bitmaps  — 5×7 filled pixel grids for each digit.
   This creates solid, recognizable number shapes for Ishihara plates.
   ============================================================ */
const DIGIT_MAP: Record<number, number[][]> = {
  0: [
    [0,1,1,1,0],
    [1,1,0,1,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,1,0,1,1],
    [0,1,1,1,0],
  ],
  1: [
    [0,0,1,0,0],
    [0,1,1,0,0],
    [1,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [1,1,1,1,1],
  ],
  2: [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [0,0,0,0,1],
    [0,0,1,1,0],
    [0,1,0,0,0],
    [1,0,0,0,0],
    [1,1,1,1,1],
  ],
  3: [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [0,0,0,0,1],
    [0,0,1,1,0],
    [0,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0],
  ],
  4: [
    [0,0,0,1,0],
    [0,0,1,1,0],
    [0,1,0,1,0],
    [1,0,0,1,0],
    [1,1,1,1,1],
    [0,0,0,1,0],
    [0,0,0,1,0],
  ],
  5: [
    [1,1,1,1,1],
    [1,0,0,0,0],
    [1,1,1,1,0],
    [0,0,0,0,1],
    [0,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0],
  ],
  6: [
    [0,1,1,1,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0],
  ],
  7: [
    [1,1,1,1,1],
    [0,0,0,0,1],
    [0,0,0,1,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
  ],
  8: [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0],
  ],
  9: [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,1],
    [0,0,0,0,1],
    [0,0,0,0,1],
    [0,1,1,1,0],
  ],
};

/* ============================================================
   SVG Ishihara Plate  —  uses filled bitmap digits for clarity
   ============================================================ */
function IshiharaPlate({ plate }: { plate: IshiharaPlate }) {
  const elements = useMemo(() => {
    const rng = seededRandom(plate.seed);
    const CX = 150;
    const CY = 150;
    const R = 138;
    const COLS = 5;
    const ROWS = 7;

    // Scale cell size based on number of digits
    const digitCount = plate.correctAnswer.toString().length;
    const cellSize = digitCount > 1 ? 16 : 22;
    const gap = digitCount > 1 ? 4 : 0; // gap between digits
    const totalW = digitCount * COLS * cellSize + (digitCount - 1) * gap;
    const totalH = ROWS * cellSize;
    const startX = CX - totalW / 2;
    const startY = CY - totalH / 2;

    // Collect all "on" cells for the number
    const numberCells: Array<[number, number]> = [];
    const str = plate.correctAnswer.toString();

    for (let ci = 0; ci < str.length; ci++) {
      const digit = parseInt(str[ci]);
      const bitmap = DIGIT_MAP[digit];
      if (!bitmap) continue;
      const digitOffsetX = ci * (COLS * cellSize + gap);

      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          if (bitmap[row][col]) {
            const cx = startX + digitOffsetX + col * cellSize + cellSize / 2;
            const cy = startY + row * cellSize + cellSize / 2;
            numberCells.push([cx, cy]);
          }
        }
      }
    }

    const bgDots: string[] = [];
    const numDots: string[] = [];

    // Number dots — dense fill within each cell for solid appearance
    for (const [cx, cy] of numberCells) {
      const count = 2 + Math.floor(rng() * 3); // 2-4 dots per cell
      for (let i = 0; i < count; i++) {
        const px = cx + (rng() - 0.5) * cellSize * 0.75;
        const py = cy + (rng() - 0.5) * cellSize * 0.75;
        const pr = cellSize * 0.28 + rng() * cellSize * 0.2;
        const fill = plate.numColors[Math.floor(rng() * plate.numColors.length)];
        numDots.push(`<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${pr.toFixed(1)}" fill="${fill}"/>`);
      }
    }

    // A few small number-colored dots scattered in background for realism
    for (let i = 0; i < 30; i++) {
      const ang = rng() * Math.PI * 2;
      const dist = Math.sqrt(rng()) * R;
      const x = CX + Math.cos(ang) * dist;
      const y = CY + Math.sin(ang) * dist;
      // Skip if too close to number area
      let tooClose = false;
      for (const [nx, ny] of numberCells) {
        if (Math.abs(x - nx) < cellSize && Math.abs(y - ny) < cellSize) {
          tooClose = true;
          break;
        }
      }
      if (!tooClose) {
        const r = 2 + rng() * 3;
        const fill = plate.numColors[Math.floor(rng() * plate.numColors.length)];
        bgDots.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${fill}"/>`);
      }
    }

    // Background dots — fill circle densely
    for (let i = 0; i < 400; i++) {
      const ang = rng() * Math.PI * 2;
      const dist = Math.sqrt(rng()) * R;
      const x = CX + Math.cos(ang) * dist;
      const y = CY + Math.sin(ang) * dist;
      const r = 3 + rng() * 5;
      const fill = plate.bgColors[Math.floor(rng() * plate.bgColors.length)];
      bgDots.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${fill}"/>`);
    }

    return { bg: bgDots.join(""), num: numDots.join("") };
  }, [plate]);

  const clipId = "ipc-" + plate.id;
  const clipUrl = "url(#ipc-" + plate.id + ")";

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full block">
      <defs>
        <clipPath id={clipId}>
          <circle cx="150" cy="150" r="140" />
        </clipPath>
      </defs>
      <circle cx="150" cy="150" r="140" fill="#f0e6d0" />
      <g clipPath={clipUrl}>
        <g dangerouslySetInnerHTML={{ __html: elements.bg }} />
        <g dangerouslySetInnerHTML={{ __html: elements.num }} />
      </g>
      <circle cx="150" cy="150" r="139" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
    </svg>
  );
}

/* ============================================================
   Animation
   ============================================================ */
const fadeV = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

/* ============================================================
   Main
   ============================================================ */
function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ColorVisionTest({ onBack, onComplete }: ColorVisionTestProps) {
  const { t, isRTL } = useI18n();
  const [phase, setPhase] = useState<"intro" | "test" | "results">("intro");
  const [shuffledPlates, setShuffledPlates] = useState<IshiharaPlate[]>([]);
  const [currentPlate, setCurrentPlate] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [answers, setAnswers] = useState<Array<{ picked: number; correct: number; ok: boolean }>>([]);

  const plate = shuffledPlates[currentPlate] ?? plates[0];
  const total = shuffledPlates.length || plates.length;
  const score = answers.filter(a => a.ok).length;

  const startTest = useCallback(() => {
    const shuffled = shuffleArray(plates).map(p => ({
      ...p,
      options: shuffleArray(p.options),
    }));
    setShuffledPlates(shuffled);
    setCurrentPlate(0); setSelected(null); setLocked(false); setAnswers([]); setPhase("test");
  }, []);

  const pick = useCallback((num: number) => {
    if (locked) return;
    const ok = num === plate.correctAnswer;
    setSelected(num); setLocked(true);
    setAnswers(prev => [...prev, { picked: num, correct: plate.correctAnswer, ok }]);
    setTimeout(() => {
      setSelected(null); setLocked(false);
      if (currentPlate < total - 1) setCurrentPlate(p => p + 1);
      else setPhase("results");
    }, 900);
  }, [locked, plate.correctAnswer, currentPlate, total]);

  const restart = useCallback(() => {
    setShuffledPlates([]);
    setCurrentPlate(0); setSelected(null); setLocked(false); setAnswers([]); setPhase("intro");
  }, []);

  const finish = useCallback(() => {
    onComplete({ score, total, status: score >= 6 ? "normal" : "deficient" });
    onBack();
  }, [onComplete, onBack, score, total]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0a0e1a" }}>
      <div className="fixed inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(255,59,48,0.04) 0%, transparent 50%)" }} />

      {/* Header */}
      <div className="flex items-center justify-between p-4 relative z-10">
        <Button onClick={phase === "results" ? finish : onBack} variant="ghost" size="icon"
          className="w-10 h-10 rounded-xl hover:bg-white/5" style={{ color: "#94a3b8" }}>
          <ArrowRight className="w-5 h-5" />
        </Button>
        <div className="text-center">
          <h1 className="text-base font-bold" style={{ color: "#e2e8f0" }}>{t("color.title")}</h1>
          <p className="text-xs" style={{ color: "#64748b" }}>Ishihara Color Test</p>
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 px-4 pb-8 relative z-10">
        <AnimatePresence mode="wait">

          {/* INTRO */}
          {phase === "intro" && (
            <motion.div key="intro" variants={fadeV} initial="initial" animate="animate" exit="exit"
              transition={{ duration: 0.3 }} className="flex flex-col items-center justify-center py-8">
              <motion.div animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
                style={{ background: "linear-gradient(135deg, rgba(255,59,48,0.15), rgba(255,107,107,0.05))",
                  border: "2px solid rgba(255,59,48,0.25)" }}>
                <Palette className="w-12 h-12" style={{ color: "#ff3b30" }} />
              </motion.div>
              <h2 className="text-xl font-bold mb-2" style={{ color: "#e2e8f0" }}>{t("color.introTitle")}</h2>
              <p className="text-sm text-center mb-6 max-w-[300px] leading-relaxed" style={{ color: "#94a3b8" }}>
                {t("color.introDesc").replace("{total}", String(total))}
              </p>
              <div className="rounded-xl p-4 mb-6 w-full max-w-[300px]"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-xs mb-2" style={{ color: "#94a3b8" }}>{t("color.tip1")}</p>
                <p className="text-xs mb-2" style={{ color: "#94a3b8" }}>{t("color.tip2")}</p>
                <p className="text-xs mb-2" style={{ color: "#94a3b8" }}>{t("color.tip3")}</p>
                <p className="text-xs" style={{ color: "#94a3b8" }}>{t("color.tip4")}</p>
              </div>
              <div className="w-44 h-44 rounded-full overflow-hidden mb-6"
                style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
                <IshiharaPlate plate={plates[0]} />
              </div>
              <Button onClick={startTest} className="h-12 px-8 rounded-xl font-medium text-base"
                style={{ background: "linear-gradient(135deg, #ff3b30, #ff6b6b)", color: "#fff" }}>
                {t("color.start")}
              </Button>
            </motion.div>
          )}

          {/* TEST */}
          {phase === "test" && (
            <motion.div key={"p-" + currentPlate} variants={fadeV} initial="initial" animate="animate" exit="exit"
              transition={{ duration: 0.3 }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs" style={{ color: "#94a3b8" }}>{t("color.plateProgress").replace("{current}", String(currentPlate + 1)).replace("{total}", String(total))}</p>
                <p className="text-xs font-medium" style={{ color: "#ff3b30" }}>{answers.length}/{total}</p>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden mb-5" style={{ background: "rgba(255,255,255,0.08)" }}>
                <div className="h-full rounded-full transition-all duration-300"
                  style={{ background: "linear-gradient(90deg, #ff3b30, #ff6b6b)", width: (((answers.length + 1) / total) * 100) + "%" }} />
              </div>
              <p className="text-center text-sm mb-4" style={{ color: "#94a3b8" }}>{t("color.question")}</p>

              <div className="flex justify-center mb-6">
                <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-full overflow-hidden"
                  style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 60px rgba(255,59,48,0.06)",
                    padding: 2, background: "linear-gradient(135deg, rgba(255,59,48,0.2), rgba(255,107,107,0.1))" }}>
                  <IshiharaPlate plate={plate} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {plate.options.map(opt => {
                  const isSel = selected === opt;
                  const isCorr = opt === plate.correctAnswer;
                  const fb = locked && selected !== null;
                  let bg = "rgba(255,255,255,0.05)";
                  let bdr = "rgba(255,255,255,0.1)";
                  let clr = "#e2e8f0";
                  if (fb && isSel && isCorr) { bg = "rgba(0,212,170,0.15)"; bdr = "rgba(0,212,170,0.4)"; clr = "#00d4aa"; }
                  else if (fb && isSel && !isCorr) { bg = "rgba(255,59,48,0.15)"; bdr = "rgba(255,59,48,0.4)"; clr = "#ff3b30"; }
                  else if (fb && !isSel && isCorr) { bg = "rgba(0,212,170,0.08)"; bdr = "rgba(0,212,170,0.25)"; clr = "#00d4aa"; }
                  return (
                    <button key={opt} onClick={() => pick(opt)} disabled={locked}
                      className="h-14 w-full rounded-xl text-xl font-bold transition-all duration-200 active:scale-95"
                      style={{ background: bg, border: "1px solid " + bdr, color: clr }}>
                      {fb && isSel && isCorr && <CheckCircle2 className={`w-4 h-4 inline ${isRTL ? "ml-2" : "mr-2"}`} />}
                      {fb && isSel && !isCorr && <XCircle className={`w-4 h-4 inline ${isRTL ? "ml-2" : "mr-2"}`} />}
                      {opt}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {locked && selected !== null && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }} className="text-center">
                    <p className="text-sm font-medium" style={{ color: selected === plate.correctAnswer ? "#00d4aa" : "#ff3b30" }}>
                      {selected === plate.correctAnswer ? t("color.correctAnswer") : t("color.wrongAnswer").replace("{answer}", String(plate.correctAnswer))}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* RESULTS */}
          {phase === "results" && (
            <motion.div key="results" variants={fadeV} initial="initial" animate="animate" exit="exit"
              transition={{ duration: 0.3 }} className="flex flex-col items-center py-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 150 }}
                className="w-24 h-24 rounded-full flex items-center justify-center mb-5"
                style={{ background: score >= 6 ? "rgba(0,212,170,0.1)" : "rgba(255,165,0,0.1)",
                  border: "2px solid " + (score >= 6 ? "rgba(0,212,170,0.3)" : "rgba(255,165,0,0.3)") }}>
                {score >= 6
                  ? <CheckCircle2 className="w-12 h-12" style={{ color: "#00d4aa" }} />
                  : <Palette className="w-12 h-12" style={{ color: "#ffa500" }} />}
              </motion.div>
              <h2 className="text-xl font-bold mb-1" style={{ color: "#e2e8f0" }}>
                {score >= 6 ? t("color.normal") : t("color.deficient")}
              </h2>
              <p className="text-3xl font-bold mb-4" style={{ color: score >= 6 ? "#00d4aa" : "#ffa500" }}>{score} / {total}</p>
              <div className="rounded-xl p-4 mb-5 w-full" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="text-sm text-center leading-relaxed" style={{ color: "#94a3b8" }}>
                  {score >= 6 ? t("color.normalDesc") : t("color.deficientDesc")}
                </p>
              </div>
              <div className="w-full mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs" style={{ color: "#94a3b8" }}>{t("color.correctAnswers")}</span>
                  <span className="text-xs font-medium" style={{ color: score >= 6 ? "#00d4aa" : "#ffa500" }}>{score} من {total}</span>
                </div>
                <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <motion.div className="h-full rounded-full"
                    style={{ background: score >= 6 ? "linear-gradient(90deg, #00d4aa, #00a080)" : "linear-gradient(90deg, #ffa500, #ff6b00)" }}
                    initial={{ width: 0 }} animate={{ width: Math.round((score / total) * 100) + "%" }} transition={{ duration: 0.8 }} />
                </div>
              </div>
              <div className="w-full space-y-2 mb-5">
                <p className="text-xs font-medium mb-2" style={{ color: "#64748b" }}>{t("color.answerDetails")}</p>
                {answers.map((a, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-lg"
                    style={{ background: a.ok ? "rgba(0,212,170,0.06)" : "rgba(255,59,48,0.06)",
                      border: "1px solid " + (a.ok ? "rgba(0,212,170,0.12)" : "rgba(255,59,48,0.12)") }}>
                    <div className="flex items-center gap-2">
                      {a.ok
                        ? <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#00d4aa" }} />
                        : <XCircle className="w-3.5 h-3.5" style={{ color: "#ff3b30" }} />}
                      <span className="text-xs" style={{ color: "#94a3b8" }}>{t("color.plate").replace("{n}", String(i + 1))}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {!a.ok && <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.05)", color: "#64748b" }}>{t("color.picked").replace("{n}", String(a.picked))}</span>}
                      <span className="text-xs font-medium" style={{ color: a.ok ? "#00d4aa" : "#ff3b30" }}>{a.correct}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 w-full">
                <Button onClick={restart} className="flex-1 h-11 rounded-xl font-medium"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0" }}>
                  <RotateCcw className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} /> {t("common.restart")}
                </Button>
                <Button onClick={finish} className="flex-1 h-11 rounded-xl font-medium"
                  style={{ background: "linear-gradient(135deg, #ff3b30, #ff6b6b)", color: "#fff" }}>
                  <Save className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} /> {t("color.saveExit")}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
