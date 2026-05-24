"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Eye,
  Palette,
  Focus,
  Shield,
  ChevronLeft,
  Calculator,
  MessageCircle,
  GitCompareArrows,
  Timer,
  Apple,
  Lock,
  Crown,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

interface HealthCenterProps {
  onSelectTest: (testId: string) => void;
  onBack: () => void;
  hasSubscription: boolean;
  onRequestSubscription: () => void;
  onActivateCode: (code: string) => Promise<boolean>;
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

export default function HealthCenter({
  onSelectTest,
  onBack,
  hasSubscription,
  onRequestSubscription,
  onActivateCode,
}: HealthCenterProps) {
  const { t } = useI18n();
  const [showSubscription, setShowSubscription] = useState(false);

  const handleTestClick = (testId: string) => {
    onSelectTest(testId);
  };

  const handleActivate = async (code: string) => {
    const result = await onActivateCode(code);
    return result;
  };

  // Diagnostic tests section
  const diagnosticTests = [
    {
      id: "visual-acuity",
      title: t("health.acuity"),
      subtitle: t("health.acuity"),
      description: t("health.acuityDesc"),
      icon: Eye,
      gradient: "linear-gradient(135deg, #a855f7, #6366f1)",
      color: "#a855f7",
    },
    {
      id: "color-test",
      title: t("health.colorTest"),
      subtitle: t("health.colorTest"),
      description: t("health.colorTestDesc"),
      icon: Palette,
      gradient: "linear-gradient(135deg, #ff3b30, #ff6b6b)",
      color: "#ff3b30",
    },
    {
      id: "strabismus-test",
      title: t("health.strabismus"),
      subtitle: t("health.strabismus"),
      description: t("health.strabismusDesc"),
      icon: Focus,
      gradient: "linear-gradient(135deg, #ffa500, #ff6b00)",
      color: "#ffa500",
    },
    {
      id: "cataract-test",
      title: t("health.cataract"),
      subtitle: t("health.cataract"),
      description: t("health.cataractDesc"),
      icon: Shield,
      gradient: "linear-gradient(135deg, #00d4aa, #00a88a)",
      color: "#00d4aa",
    },
    {
      id: "glaucoma-test",
      title: t("health.glaucoma"),
      subtitle: t("health.glaucoma"),
      description: t("health.glaucomaDesc"),
      icon: Eye,
      gradient: "linear-gradient(135deg, #00f0ff, #0080ff)",
      color: "#00f0ff",
    },
  ];

  // Eye Health Tools section
  const healthTools = [
    {
      id: "prescription-calculator",
      title: t("health.calculator"),
      subtitle: t("health.calculatorSub"),
      description: t("health.calculatorDesc"),
      icon: Calculator,
      gradient: "linear-gradient(135deg, #00f0ff, #0080ff)",
      color: "#00f0ff",
    },
    {
      id: "medical-chat",
      title: t("health.chat"),
      subtitle: t("health.chatSub"),
      description: t("health.chatDesc"),
      icon: MessageCircle,
      gradient: "linear-gradient(135deg, #a855f7, #6366f1)",
      color: "#a855f7",
    },
    {
      id: "prescription-comparison",
      title: t("health.compare"),
      subtitle: t("health.compareSub"),
      description: t("health.compareDesc"),
      icon: GitCompareArrows,
      gradient: "linear-gradient(135deg, #ffa500, #ff6b00)",
      color: "#ffa500",
    },
    {
      id: "eye-protection",
      title: t("health.protection"),
      subtitle: t("health.protectionSub"),
      description: t("health.protectionDesc"),
      icon: Timer,
      gradient: "linear-gradient(135deg, #00d4aa, #00a88a)",
      color: "#00d4aa",
    },
    {
      id: "eye-nutrition",
      title: t("health.nutrition"),
      subtitle: t("health.nutritionSub"),
      description: t("health.nutritionDesc"),
      icon: Apple,
      gradient: "linear-gradient(135deg, #ff3b30, #ff6b6b)",
      color: "#ff3b30",
    },
  ];

  // Subscription required view
  if (showSubscription) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "#0a0e1a" }}>
        {/* Background decoration */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 50% 0%, rgba(168,85,247,0.08) 0%, transparent 50%)",
          }}
        />

        {/* Header */}
        <div className="flex items-center justify-between p-4 relative z-10">
          <Button
            onClick={() => setShowSubscription(false)}
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

            <h1 className="text-xl font-bold mb-1" style={{ color: "#e2e8f0" }}>
              {t("health.title")}
            </h1>
            <p className="text-xs" style={{ color: "#94a3b8" }}>
              Eye Health Center
            </p>
          </div>

          {/* Description */}
          <div className="text-center mb-5">
            <p className="text-sm leading-relaxed" style={{ color: "#c4b5fd" }}>
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
            <h3 className="text-sm font-bold mb-3" style={{ color: "#e2e8f0" }}>
              {t("sub.planTitle")}
            </h3>

            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-2xl font-bold" style={{ color: "#a855f7" }}>50</span>
                <span className="text-sm mr-1" style={{ color: "#94a3b8" }}>{t("sub.currency")}</span>
                <span className="text-xs" style={{ color: "#64748b" }}>/ {t("sub.month")}</span>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-2.5">
              {[
                { icon: Shield, text: t("sub.f1") },
                { icon: Eye, text: t("sub.f2") },
                { icon: Check, text: t("sub.f3") },
                { icon: MessageCircle, text: t("sub.f4") },
              ].map((feature, i) => (
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

          {/* Subscribe via WhatsApp Button */}
          <Button
            onClick={() => {
              const msg = encodeURIComponent("مرحباً، أريد الاشتراك في OptiSize");
              window.open(`https://api.whatsapp.com/send?phone=201033346513&text=${msg}`, "_blank");
            }}
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
          <ActivationCodeInput onActivate={handleActivate} t={t} />
        </motion.div>
      </div>
    );
  }

  // Main Health Center view
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0a0e1a" }}>
      {/* Background decoration */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(255,59,48,0.05) 0%, transparent 50%)",
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
        <div className="text-center flex items-center gap-2">
          <h1 className="text-base font-bold" style={{ color: "#e2e8f0" }}>
            {t("health.title")}
          </h1>
          {hasSubscription && (
            <div
              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full"
              style={{
                background: "linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,170,0,0.1))",
                border: "1px solid rgba(255,215,0,0.3)",
              }}
            >
              <Crown className="w-2.5 h-2.5" style={{ color: "#ffd700" }} />
              <span className="text-[8px] font-bold" style={{ color: "#ffd700" }}>VIP</span>
            </div>
          )}
        </div>
        <div className="w-10" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 px-4 pb-8 space-y-3 relative z-10"
      >
        {/* Diagnostic Tests Section */}
        <motion.div variants={itemVariants}>
          <h2 className="text-sm font-semibold mb-3" style={{ color: "#94a3b8" }}>
            {t("health.diagnosticSection")}
          </h2>
          <div className="space-y-3">
            {diagnosticTests.map((test) => (
              <motion.button
                key={test.id}
                onClick={() => handleTestClick(test.id)}
                className="w-full text-right rounded-2xl p-4 transition-all duration-200 group relative"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
                whileHover={{
                  scale: 1.015,
                  borderColor: `${test.color}40`,
                  boxShadow: `0 8px 32px ${test.color}10`,
                }}
                whileTap={{ scale: 0.985 }}
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200"
                      style={{
                        background: test.gradient,
                      }}
                    >
                      <test.icon
                        className="w-6 h-6"
                        style={{ color: "#0a0e1a" }}
                      />
                    </div>

                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: "#e2e8f0" }}>
                      {test.title}
                    </p>
                    <p className="text-[10px] mt-0.5" style={{ color: test.color }}>
                      {test.subtitle}
                    </p>
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: "#94a3b8" }}>
                      {test.description}
                    </p>
                  </div>
                  <ChevronLeft className="w-4 h-4 shrink-0" style={{ color: "#64748b" }} />
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Separator */}
        <motion.div variants={itemVariants} className="flex items-center gap-3 py-2">
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
          <span className="text-[10px]" style={{ color: "#64748b" }}>{t("health.toolsSection")}</span>
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
        </motion.div>

        {/* Health Tools Section */}
        <motion.div variants={itemVariants}>
          <div className="space-y-3">
            {healthTools.map((tool) => (
              <motion.button
                key={tool.id}
                onClick={() => handleTestClick(tool.id)}
                className="w-full text-right rounded-2xl p-4 transition-all duration-200 group relative"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
                whileHover={{
                  scale: 1.015,
                  borderColor: `${tool.color}40`,
                  boxShadow: `0 8px 32px ${tool.color}10`,
                }}
                whileTap={{ scale: 0.985 }}
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200"
                      style={{
                        background: tool.gradient,
                      }}
                    >
                      <tool.icon
                        className="w-6 h-6"
                        style={{ color: "#0a0e1a" }}
                      />
                    </div>

                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: "#e2e8f0" }}>
                      {tool.title}
                    </p>
                    <p className="text-[10px] mt-0.5" style={{ color: tool.color }}>
                      {tool.subtitle}
                    </p>
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: "#94a3b8" }}>
                      {tool.description}
                    </p>
                  </div>
                  <ChevronLeft className="w-4 h-4 shrink-0" style={{ color: "#64748b" }} />
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Info */}
        <motion.div variants={itemVariants} className="glass-card rounded-xl p-4 mt-4">
          <p className="text-xs leading-relaxed" style={{ color: "#94a3b8" }}>
            {t("health.disclaimer")}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

// Inline activation code input component
function ActivationCodeInput({
  onActivate,
  t,
}: {
  onActivate: (code: string) => Promise<boolean>;
  t: (key: string) => string;
}) {
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

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
      } else {
        setError(t("sub.invalidCode"));
      }
    } catch {
      setError(t("sub.invalidCode"));
    } finally {
      setVerifying(false);
    }
  };

  return (
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
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-t-transparent rounded-full"
              style={{ borderColor: "#fff", borderTopColor: "transparent" }}
            />
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
  );
}
