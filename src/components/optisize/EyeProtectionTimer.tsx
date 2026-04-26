"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Clock,
  Bell,
  Settings,
  Flame,
  Eye,
  Coffee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface EyeProtectionTimerProps {
  onBack: () => void;
}

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

function loadSavedStats() {
  try {
    const saved = localStorage.getItem("optisize-eye-protection");
    if (saved) {
      const data = JSON.parse(saved);
      const today = new Date().toDateString();
      if (data.date === today) {
        return { breaks: data.breaks || 0, streak: data.streak || 0, interval: data.interval || 20 };
      }
    }
  } catch { /* ignore */ }
  return { breaks: 0, streak: 0, interval: 20 };
}

export default function EyeProtectionTimer({
  onBack,
}: EyeProtectionTimerProps) {
  const { toast } = useToast();
  const saved = loadSavedStats();
  const [intervalMinutes, setIntervalMinutes] = useState(saved.interval);
  const [secondsLeft, setSecondsLeft] = useState(saved.interval * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [totalBreaksToday, setTotalBreaksToday] = useState(saved.breaks);
  const [currentStreak, setCurrentStreak] = useState(saved.streak);
  const [breakAlert, setBreakAlert] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSeconds = intervalMinutes * 60;
  const progress = isOnBreak
    ? ((20 - secondsLeft) / 20) * 100
    : ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  // Save stats to localStorage
  const saveStats = useCallback(
    (breaks: number, streak: number, interval: number) => {
      try {
        localStorage.setItem(
          "optisize-eye-protection",
          JSON.stringify({
            date: new Date().toDateString(),
            breaks,
            streak,
            interval,
          })
        );
      } catch {
        // ignore
      }
    },
    []
  );

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            if (isOnBreak) {
              // Break over
              setIsOnBreak(false);
              setIsRunning(false);
              setSecondsLeft(intervalMinutes * 60);
              return intervalMinutes * 60;
            } else {
              // Time for a break!
              const newBreaks = totalBreaksToday + 1;
              const newStreak = currentStreak + 1;
              setTotalBreaksToday(newBreaks);
              setCurrentStreak(newStreak);
              saveStats(newBreaks, newStreak, intervalMinutes);

              setIsOnBreak(true);
              setSecondsLeft(20); // 20 second break

              // Show notification
              setBreakAlert(true);
              if (
                "Notification" in window &&
                Notification.permission === "granted"
              ) {
                new Notification("🧘 وقت الاستراحة!", {
                  body: "خذ استراحة 20 ثانية وانظر لمسافة 6 أمتار",
                  icon: "/logo.svg",
                });
              }

              toast({
                title: "🧘 وقت الاستراحة!",
                description:
                  "خذ استراحة 20 ثانية وانظر لمسافة 6 أمتار",
              });

              setTimeout(() => setBreakAlert(false), 5000);
              return 20;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [
    isRunning,
    isOnBreak,
    intervalMinutes,
    totalBreaksToday,
    currentStreak,
    saveStats,
    toast,
  ]);

  const handleStart = useCallback(() => {
    if (isOnBreak) {
      setIsOnBreak(false);
      setSecondsLeft(intervalMinutes * 60);
    }
    setIsRunning(true);
  }, [isOnBreak, intervalMinutes]);

  const handlePause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setIsOnBreak(false);
    setSecondsLeft(intervalMinutes * 60);
    setBreakAlert(false);
  }, [intervalMinutes]);

  const formatTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  }, []);

  // SVG circular progress
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

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
            "radial-gradient(ellipse at 50% 0%, rgba(0,212,170,0.05) 0%, transparent 50%)",
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
            وضع حماية العين
          </h1>
          <p className="text-xs" style={{ color: "#64748b" }}>
            Eye Protection Mode
          </p>
        </div>
        <Button
          onClick={() => setShowSettings(!showSettings)}
          variant="ghost"
          size="icon"
          className="w-10 h-10 rounded-xl hover:bg-white/5"
          style={{ color: "#94a3b8" }}
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 px-4 pb-8 relative z-10"
      >
        {/* Break Alert */}
        <AnimatePresence>
          {breakAlert && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="mb-4 rounded-xl p-4 text-center"
              style={{
                background: "rgba(0,212,170,0.1)",
                border: "1px solid rgba(0,212,170,0.3)",
              }}
            >
              <Bell
                className="w-8 h-8 mx-auto mb-2"
                style={{ color: "#00d4aa" }}
              />
              <p
                className="text-base font-bold mb-1"
                style={{ color: "#00d4aa" }}
              >
                وقت الاستراحة!
              </p>
              <p className="text-sm" style={{ color: "#94a3b8" }}>
                خذ استراحة 20 ثانية وانظر لمسافة 6 أمتار
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-card rounded-xl p-4 mb-4 overflow-hidden"
            >
              <p
                className="text-sm font-semibold mb-3"
                style={{ color: "#e2e8f0" }}
              >
                الإعدادات
              </p>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs" style={{ color: "#94a3b8" }}>
                  فترة العمل (دقيقة)
                </span>
                <span
                  className="text-sm font-bold"
                  style={{ color: "#00f0ff" }}
                >
                  {intervalMinutes}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                {[10, 15, 20, 25, 30, 45, 60].map((min) => (
                  <button
                    key={min}
                    onClick={() => {
                      if (!isRunning) {
                        setIntervalMinutes(min);
                        setSecondsLeft(min * 60);
                        saveStats(totalBreaksToday, currentStreak, min);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background:
                        intervalMinutes === min
                          ? "rgba(0,240,255,0.15)"
                          : "rgba(255,255,255,0.04)",
                      border:
                        intervalMinutes === min
                          ? "1px solid rgba(0,240,255,0.3)"
                          : "1px solid rgba(255,255,255,0.08)",
                      color:
                        intervalMinutes === min ? "#00f0ff" : "#94a3b8",
                    }}
                  >
                    {min}
                  </button>
                ))}
              </div>
              <p className="text-[10px] leading-relaxed" style={{ color: "#64748b" }}>
                قاعدة 20-20-20: كل 20 دقيقة، انظر لمسافة 20 قدماً (6 أمتار) لمدة 20
                ثانية
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Circular Timer */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center py-6"
        >
          <div className="relative w-56 h-56">
            {/* Background circle */}
            <svg
              className="w-full h-full -rotate-90"
              viewBox="0 0 220 220"
            >
              <circle
                cx="110"
                cy="110"
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="8"
              />
              <circle
                cx="110"
                cy="110"
                r={radius}
                fill="none"
                stroke={
                  isOnBreak
                    ? "#00d4aa"
                    : isRunning
                    ? "#00f0ff"
                    : "rgba(255,255,255,0.1)"
                }
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{
                  transition: "stroke-dashoffset 1s linear, stroke 0.3s",
                  filter: isRunning
                    ? `drop-shadow(0 0 8px ${
                        isOnBreak ? "rgba(0,212,170,0.4)" : "rgba(0,240,255,0.4)"
                      })`
                    : "none",
                }}
              />
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                animate={
                  isOnBreak
                    ? { scale: [1, 1.05, 1] }
                    : isRunning
                    ? {}
                    : {}
                }
                transition={
                  isOnBreak
                    ? { duration: 2, repeat: Infinity }
                    : {}
                }
              >
                {isOnBreak ? (
                  <Eye
                    className="w-8 h-8 mb-2"
                    style={{ color: "#00d4aa" }}
                  />
                ) : (
                  <Clock
                    className="w-6 h-6 mb-1"
                    style={{ color: "#64748b" }}
                  />
                )}
              </motion.div>
              <p
                className="text-4xl font-bold tracking-wider"
                style={{
                  color: isOnBreak ? "#00d4aa" : "#e2e8f0",
                  textShadow: isRunning
                    ? isOnBreak
                      ? "0 0 20px rgba(0,212,170,0.5)"
                      : "0 0 20px rgba(0,240,255,0.3)"
                    : "none",
                }}
              >
                {formatTime(secondsLeft)}
              </p>
              <p className="text-xs mt-1" style={{ color: "#64748b" }}>
                {isOnBreak
                  ? "استراحة 20 ثانية"
                  : isRunning
                  ? "جاري العمل..."
                  : "جاهز للبدء"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center gap-4 mb-6"
        >
          <Button
            onClick={handleReset}
            className="w-12 h-12 rounded-xl p-0"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#94a3b8",
            }}
          >
            <RotateCcw className="w-5 h-5" />
          </Button>

          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              onClick={isRunning ? handlePause : handleStart}
              className="w-16 h-16 rounded-2xl p-0"
              style={{
                background: isRunning
                  ? "linear-gradient(135deg, #ffa500, #ff6b00)"
                  : "linear-gradient(135deg, #00d4aa, #00a88a)",
                color: "#0a0e1a",
              }}
            >
              {isRunning ? (
                <Pause className="w-7 h-7" />
              ) : (
                <Play className="w-7 h-7" />
              )}
            </Button>
          </motion.div>

          <div className="w-12 h-12" /> {/* Spacer */}
        </motion.div>

        {/* Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 mb-6">
          <div className="glass-card rounded-xl p-4 text-center">
            <Coffee
              className="w-5 h-5 mx-auto mb-2"
              style={{ color: "#00d4aa" }}
            />
            <p
              className="text-2xl font-bold"
              style={{ color: "#00d4aa" }}
            >
              {totalBreaksToday}
            </p>
            <p className="text-[10px] mt-1" style={{ color: "#64748b" }}>
              استراحات اليوم
            </p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <Flame
              className="w-5 h-5 mx-auto mb-2"
              style={{ color: "#ffa500" }}
            />
            <p
              className="text-2xl font-bold"
              style={{ color: "#ffa500" }}
            >
              {currentStreak}
            </p>
            <p className="text-[10px] mt-1" style={{ color: "#64748b" }}>
              سلسلة متتالية
            </p>
          </div>
        </motion.div>

        {/* Rule Explanation */}
        <motion.div variants={itemVariants}>
          <div className="glass-card rounded-xl p-4">
            <p
              className="text-sm font-semibold mb-3"
              style={{ color: "#e2e8f0" }}
            >
              قاعدة 20-20-20
            </p>
            <div className="space-y-2">
              {[
                {
                  num: "20",
                  label: "دقيقة عمل",
                  desc: "كل 20 دقيقة خذ استراحة",
                  color: "#00f0ff",
                },
                {
                  num: "20",
                  label: "قدم مسافة",
                  desc: "انظر لمسافة 6 أمتار (20 قدماً)",
                  color: "#00d4aa",
                },
                {
                  num: "20",
                  label: "ثانية استراحة",
                  desc: "لمدة 20 ثانية على الأقل",
                  color: "#ffa500",
                },
              ].map((rule) => (
                <div
                  key={rule.label}
                  className="flex items-center gap-3"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: `${rule.color}15`,
                      border: `1px solid ${rule.color}30`,
                    }}
                  >
                    <span
                      className="text-base font-bold"
                      style={{ color: rule.color }}
                    >
                      {rule.num}
                    </span>
                  </div>
                  <div>
                    <p
                      className="text-xs font-medium"
                      style={{ color: "#e2e8f0" }}
                    >
                      {rule.label}
                    </p>
                    <p className="text-[10px]" style={{ color: "#94a3b8" }}>
                      {rule.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
