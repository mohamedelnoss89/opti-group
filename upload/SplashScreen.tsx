"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: "#0a0e1a" }}
    >
      {/* Background radial glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, rgba(0,240,255,0.08) 0%, transparent 60%)",
        }}
      />

      {/* Animated Eye Logo */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative mb-8"
      >
        {/* Outer glow ring */}
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(0,240,255,0.15) 0%, transparent 70%)",
            transform: "scale(1.8)",
          }}
        />

        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Eye outer shape */}
          <motion.path
            d="M10 60 C10 60, 30 25, 60 25 C90 25, 110 60, 110 60 C110 60, 90 95, 60 95 C30 95, 10 60, 10 60Z"
            fill="none"
            stroke="url(#eyeGradient)"
            strokeWidth="2.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />

          {/* Iris */}
          <motion.circle
            cx="60"
            cy="60"
            r="22"
            fill="url(#irisGradient)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
          />

          {/* Pupil */}
          <motion.circle
            cx="60"
            cy="60"
            r="9"
            fill="#0a0e1a"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1, 0.85, 1] }}
            transition={{
              delay: 0.8,
              duration: 1.5,
              ease: "easeInOut",
            }}
          />

          {/* Pupil highlight */}
          <motion.circle
            cx="55"
            cy="55"
            r="3"
            fill="rgba(255,255,255,0.7)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 1, duration: 0.5 }}
          />

          {/* Iris ring */}
          <motion.circle
            cx="60"
            cy="60"
            r="22"
            fill="none"
            stroke="rgba(0,240,255,0.4)"
            strokeWidth="1"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          />

          {/* Rotating iris detail lines */}
          <motion.g
            animate={{ rotate: 360 }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{ transformOrigin: "60px 60px" }}
          >
            {[0, 60, 120, 180, 240, 300].map((angle) => (
              <line
                key={angle}
                x1="60"
                y1="42"
                x2="60"
                y2="48"
                stroke="rgba(0,240,255,0.3)"
                strokeWidth="1"
                transform={`rotate(${angle} 60 60)`}
              />
            ))}
          </motion.g>

          <defs>
            <linearGradient
              id="eyeGradient"
              x1="10"
              y1="60"
              x2="110"
              y2="60"
            >
              <stop offset="0%" stopColor="#0080ff" />
              <stop offset="50%" stopColor="#00f0ff" />
              <stop offset="100%" stopColor="#0080ff" />
            </linearGradient>
            <radialGradient id="irisGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.6" />
              <stop offset="60%" stopColor="#0080ff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0050cc" stopOpacity="1" />
            </radialGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="text-4xl font-bold tracking-wider mb-3 text-glow-cyan"
        style={{ color: "#00f0ff" }}
      >
        OptiSize
      </motion.h1>

      {/* Tagline */}
      <motion.p
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="text-base text-center max-w-xs mb-10"
        style={{ color: "#94a3b8" }}
      >
        الدقة في كل تفصيلة.. مستقبل البصريات في جيبك
      </motion.p>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 1.2, duration: 0.4 }}
        className="w-56"
      >
        <div
          className="h-1 rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.1)" }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(to left, #00f0ff, #0080ff)",
            }}
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "linear" }}
          />
        </div>
      </motion.div>

      {/* Loading dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="flex gap-1.5 mt-4"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "#00f0ff" }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}
