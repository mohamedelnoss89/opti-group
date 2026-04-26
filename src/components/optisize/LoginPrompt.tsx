"use client";

import { motion } from "framer-motion";
import { LogIn, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LoginPromptProps {
  onLogin: () => void;
  onDismiss: () => void;
}

export default function LoginPrompt({
  onLogin,
  onDismiss,
}: LoginPromptProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10, 14, 26, 0.85)", backdropFilter: "blur(8px)" }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-sm"
      >
        {/* Close button */}
        <div className="flex justify-start mb-3">
          <Button
            onClick={onDismiss}
            variant="ghost"
            size="icon"
            className="w-8 h-8 rounded-full hover:bg-white/10 transition-colors"
            style={{ color: "#94a3b8" }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Prompt card */}
        <div className="glass-card rounded-2xl p-6 text-center">
          {/* Icon */}
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center glow-cyan"
            style={{ background: "linear-gradient(135deg, #00f0ff, #0080ff)" }}
          >
            <LogIn className="w-8 h-8" style={{ color: "#0a0e1a" }} />
          </motion.div>

          <h3
            className="text-lg font-bold mb-2"
            style={{ color: "#e2e8f0" }}
          >
            سجّل دخولك
          </h3>
          <p
            className="text-sm mb-6 leading-relaxed"
            style={{ color: "#94a3b8" }}
          >
            لحفظ بياناتك والوصول لجميع الميزات
          </p>

          <div className="space-y-3">
            <Button
              onClick={onLogin}
              className="w-full h-11 rounded-lg font-semibold text-base transition-all hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #00f0ff, #0080ff)",
                color: "#0a0e1a",
              }}
            >
              تسجيل الدخول
            </Button>
            <Button
              onClick={onDismiss}
              variant="outline"
              className="w-full h-11 rounded-lg font-medium transition-all hover:bg-white/10"
              style={{
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#94a3b8",
                background: "transparent",
              }}
            >
              لاحقاً
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
