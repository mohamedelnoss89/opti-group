"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Crown,
  Shield,
  Eye,
  Check,
  MessageCircle,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

interface SubscriptionPromptProps {
  onBack: () => void;
  onActivate: (code: string) => Promise<boolean>;
}

export default function SubscriptionPrompt({
  onBack,
  onActivate,
}: SubscriptionPromptProps) {
  const { t } = useI18n();
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const WHATSAPP_NUMBER = "201033346513";
  const WHATSAPP_MESSAGE = encodeURIComponent("مرحباً، أريد الاشتراك في OptiSize");

  const handleOpenWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${WHATSAPP_MESSAGE}`, "_blank");
  };

  const handleActivate = async () => {
    if (code.trim().length < 8) {
      setError(t("sub.codeError"));
      return;
    }
    setError("");
    setVerifying(true);
    try {
      const result = await onActivate(code.trim());
      if (result) {
        setSuccess(true);
        setTimeout(() => onBack(), 1500);
      } else {
        setError(t("sub.invalidCode"));
      }
    } catch {
      setError(t("sub.invalidCode"));
    } finally {
      setVerifying(false);
    }
  };

  const features = [
    { icon: Shield, text: t("sub.f1") },
    { icon: Eye, text: t("sub.f2") },
    { icon: Check, text: t("sub.f3") },
    { icon: MessageCircle, text: t("sub.f4") },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0a0e1a" }}>
      {/* Background decoration */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(168,85,247,0.08) 0%, transparent 50%)",
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
        <div className="w-10" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 px-4 pb-8 relative z-10 flex flex-col"
      >
        {/* VIP Icon & Title */}
        <div className="text-center mb-6">
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center relative"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #4c1d95)",
              boxShadow: "0 0 30px rgba(124,58,237,0.3)",
            }}
          >
            <Lock className="w-10 h-10" style={{ color: "#e9d5ff" }} />
          </motion.div>

          {/* VIP Badge */}
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3"
            style={{
              background: "linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,170,0,0.1))",
              border: "1px solid rgba(255,215,0,0.35)",
            }}
          >
            <Crown className="w-3.5 h-3.5" style={{ color: "#ffd700" }} />
            <span className="text-xs font-bold" style={{ color: "#ffd700" }}>
              VIP {t("sub.vipLabel")}
            </span>
            <Crown className="w-3.5 h-3.5" style={{ color: "#ffd700" }} />
          </div>

          <h1
            className="text-xl font-bold mb-1"
            style={{ color: "#e2e8f0" }}
          >
            {t("health.title")}
          </h1>
          <p
            className="text-xs"
            style={{ color: "#94a3b8" }}
          >
            Eye Health Center
          </p>
        </div>

        {/* Description */}
        <div className="text-center mb-5">
          <p
            className="text-sm leading-relaxed"
            style={{ color: "#c4b5fd" }}
          >
            {t("sub.desc")}
          </p>
        </div>

        {/* Subscription Card */}
        <div
          className="rounded-2xl p-5 mb-5"
          style={{
            background: "linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(76,29,149,0.08) 100%)",
            border: "1px solid rgba(124,58,237,0.25)",
          }}
        >
          <h3
            className="text-sm font-bold mb-3"
            style={{ color: "#e2e8f0" }}
          >
            {t("sub.planTitle")}
          </h3>

          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-2xl font-bold" style={{ color: "#a855f7" }}>
                50
              </span>
              <span className="text-sm mr-1" style={{ color: "#94a3b8" }}>
                {t("sub.currency")}
              </span>
              <span className="text-xs" style={{ color: "#64748b" }}>
                / {t("sub.month")}
              </span>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-2.5">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "rgba(34,197,94,0.15)" }}
                >
                  <feature.icon className="w-3 h-3" style={{ color: "#22c55e" }} />
                </div>
                <p className="text-xs" style={{ color: "#d1d5db" }}>
                  {feature.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Info */}
        <div
          className="rounded-2xl p-4 mb-4"
          style={{
            background: "rgba(255,215,0,0.06)",
            border: "1px solid rgba(255,215,0,0.2)",
          }}
        >
          <p className="text-xs font-bold mb-2" style={{ color: "#ffd700" }}>
            💰 طريقة الدفع
          </p>
          <div className="space-y-1.5">
            <p className="text-xs" style={{ color: "#d1d5db" }}>
              1. حوّل <span style={{ color: "#ffd700", fontWeight: "bold" }}>50 جنيه</span> على الرقم:
            </p>
            <div
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg"
              style={{ background: "rgba(255,255,255,0.05)" }}
              dir="ltr"
            >
              <span className="text-base font-mono font-bold tracking-wider" style={{ color: "#22c55e" }}>
                01028900122
              </span>
            </div>
            <p className="text-xs" style={{ color: "#94a3b8" }}>
              (فودافون كاش / إنستاباي / تحويل بنكي)
            </p>
            <p className="text-xs mt-2" style={{ color: "#d1d5db" }}>
              2. ابعت صورة الإيصال لواتساب البوت
            </p>
            <p className="text-xs" style={{ color: "#d1d5db" }}>
              3. أو لو معاك كود تفعيل، حطه تحت 👇
            </p>
          </div>
          <div className="mt-2 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-xs" style={{ color: "#64748b" }}>
              📅 {new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })} | 🕐 {new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        {/* Subscribe via WhatsApp Button */}
        <Button
          onClick={handleOpenWhatsApp}
          className="w-full h-12 rounded-xl font-bold text-base mb-4 transition-all hover:opacity-90"
          style={{
            background: "linear-gradient(135deg, #25d366, #128c7e)",
            color: "#fff",
            border: "none",
          }}
        >
          <MessageCircle className="w-5 h-5 ml-2" />
          {t("sub.subscribeBtn")}
        </Button>

        {/* Activation Code Input */}
        <div
          className="rounded-2xl p-4"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <p className="text-xs font-semibold mb-3" style={{ color: "#94a3b8" }}>
            {t("sub.enterCode")}
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError("");
              }}
              placeholder={t("sub.codePlaceholder")}
              className="flex-1 h-11 rounded-xl px-4 text-sm font-mono text-center tracking-widest outline-none"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#e2e8f0",
                direction: "ltr",
              }}
              maxLength={8}
            />
            <Button
              onClick={handleActivate}
              disabled={verifying || code.length < 8}
              className="h-11 px-5 rounded-xl font-semibold transition-all"
              style={{
                background: verifying
                  ? "rgba(168,85,247,0.3)"
                  : "linear-gradient(135deg, #a855f7, #7c3aed)",
                color: "#fff",
                border: "none",
              }}
            >
              {verifying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                t("sub.activate")
              )}
            </Button>
          </div>
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs mt-2"
                style={{ color: "#ef4444" }}
              >
                {error}
              </motion.p>
            )}
            {success && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs mt-2"
                style={{ color: "#22c55e" }}
              >
                {t("sub.successMsg")}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
