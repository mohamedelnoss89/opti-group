"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  Stethoscope,
  Heart,
  Glasses,
  History,
  LogOut,
  Info,
  Mail,
  Ruler,
  Sparkles,
  Save,
  Cpu,
  Sun,
  Download,
  Lock,
  Crown,
  Languages,
  Bot,
  X,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StoredUser } from "@/lib/auth";
import { logout } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";

interface MainMenuProps {
  user: StoredUser;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
  onRequestLogin: () => void;
  onOpenBotSetup?: () => void;
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

// Services that are free for guests (only PD measurement)
const GUEST_ALLOWED = ["scanner"];

export default function MainMenu({
  user,
  onNavigate,
  onLogout,
  onRequestLogin,
  onOpenBotSetup,
}: MainMenuProps) {
  const { toast } = useToast();
  const { t, isRTL, locale, setLocale } = useI18n();
  const isGuest = user.isGuest;

  // Bot setup state
  const [showBotSetup, setShowBotSetup] = useState(false);
  const [pairingData, setPairingData] = useState<{status: string; code?: string; steps?: string[]; message?: string} | null>(null);
  const [copied, setCopied] = useState(false);
  const [requestingCode, setRequestingCode] = useState(false);

  // Fetch pairing status
  useEffect(() => {
    if (!showBotSetup) return;
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/pairing-status');
        const data = await res.json();
        setPairingData(data);
      } catch {}
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [showBotSetup]);

  // Request fresh pairing code on demand
  const requestFreshCode = async () => {
    setRequestingCode(true);
    // Clear old code immediately so UI shows loading
    setPairingData({ status: 'starting', message: 'جاري توليد كود جديد...' });
    try {
      const res = await fetch('/api/request-pairing', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fresh: true })
      });
      const data = await res.json();
      setPairingData(data);
      
      // If we got a new pairing code, show a toast
      if (data.status === 'pairing' && data.code) {
        toast({ title: '🔑 كود ربط جديد!', description: data.code });
      } else if (data.status === 'error') {
        toast({ title: '❌ خطأ', description: data.message || 'حصل مشكلة' });
      }
    } catch (error) {
      setPairingData({ status: 'error', message: 'فشل الاتصال بالسيرفر' });
      toast({ title: '❌ خطأ', description: 'فشل الاتصال - جرب تاني' });
    }
    setRequestingCode(false);
  };

  const copyCode = () => {
    if (pairingData?.code) {
      navigator.clipboard.writeText(pairingData.code.replace(/-/g, ''));
      setCopied(true);
      toast({ title: 'تم نسخ الكود!' });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const mainActions = [
    {
      id: "scanner",
      label: t("menu.pd"),
      description: "قياس مسافة البؤبؤ",
      icon: Eye,
      gradient: "linear-gradient(135deg, #00f0ff, #0080ff)",
      glowClass: "glow-cyan",
    },
    {
      id: "vision-test",
      label: t("menu.vision"),
      description: "اختبارات النظر",
      icon: Stethoscope,
      gradient: "linear-gradient(135deg, #a855f7, #6366f1)",
      glowClass: "glow-purple",
    },
    {
      id: "health-center",
      label: t("menu.health"),
      description: "مركز صحة العين",
      icon: Heart,
      gradient: "linear-gradient(135deg, #ff3b30, #ff6b6b)",
      glowClass: "glow-red",
      vip: true,
    },
    {
      id: "glasses-catalog",
      label: t("menu.glasses"),
      description: "معرض النظارات",
      icon: Glasses,
      gradient: "linear-gradient(135deg, #ffa500, #ff6b00)",
      glowClass: "glow-orange",
    },
    {
      id: "records",
      label: t("menu.records"),
      description: "السجلات المحفوظة",
      icon: History,
      gradient: "linear-gradient(135deg, #0080ff, #0050cc)",
      glowClass: "glow-blue",
    },
  ];

  const features = [
    {
      icon: Ruler,
      label: t("menu.pdDesc"),
      color: "#00f0ff",
    },
    {
      icon: Cpu,
      label: t("menu.pdFeat"),
      color: "#a855f7",
    },
    {
      icon: Save,
      label: t("menu.saveFeat"),
      color: "#00d4aa",
    },
    {
      icon: Sparkles,
      label: t("menu.uiFeat"),
      color: "#ffa500",
    },
  ];

  // Quick tools in main menu (Light Sensitivity + Export)
  const quickTools = [
    {
      id: "light-sensitivity",
      label: t("light.title"),
      subtitle: "تحسس الإضاءة",
      icon: Sun,
      gradient: "linear-gradient(135deg, #fbbf24, #f59e0b)",
      color: "#fbbf24",
    },
    {
      id: "records",
      label: t("records.export"),
      subtitle: "تصدير وفرز",
      icon: Download,
      gradient: "linear-gradient(135deg, #00d4aa, #00a88a)",
      color: "#00d4aa",
    },
  ];

  const handleLogout = () => {
    logout();
    toast({ title: t("menu.toast.loggedOut"), description: t("menu.toast.bye") });
    onLogout();
  };

  const handleActionClick = (actionId: string) => {
    if (isGuest && !GUEST_ALLOWED.includes(actionId)) {
      onRequestLogin();
      return;
    }
    onNavigate(actionId);
  };

  const isLocked = (actionId: string) => isGuest && !GUEST_ALLOWED.includes(actionId);

  return (
    <div
      className="min-h-screen pb-8"
      style={{ background: "#0a0e1a" }}
    >
      {/* Background decoration */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(0,240,255,0.05) 0%, transparent 50%)",
        }}
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative max-w-lg mx-auto px-4 pt-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center glow-cyan"
              style={{ background: "linear-gradient(135deg, #00f0ff, #0080ff)" }}
            >
              <Eye className="w-6 h-6" style={{ color: "#0a0e1a" }} />
            </div>
            <div>
              <h1
                className="text-xl font-bold text-glow-cyan"
                style={{ color: "#00f0ff" }}
              >
                OptiSize
              </h1>
              <p className="text-xs" style={{ color: "#64748b" }}>
                {t("menu.subtitle")}
              </p>
            </div>
          </div>

          {/* User bar */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="icon"
              className="w-9 h-9 rounded-lg hover:bg-white/5 transition-colors"
              style={{ color: "#94a3b8" }}
            >
              <LogOut className="w-4 h-4" />
            </Button>
            <div className="text-left">
              <p className="text-sm font-medium" style={{ color: "#e2e8f0" }}>
                {user.name}
              </p>
              {user.isGuest && (
                <p className="text-[10px]" style={{ color: "#64748b" }}>
                  {t("menu.guest")}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Main Action Cards */}
        <motion.div variants={itemVariants} className="space-y-3 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2
              className="text-sm font-semibold"
              style={{ color: "#94a3b8" }}
            >
              {t("menu.services")}
            </h2>
            <button
              onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium transition-all duration-200 active:scale-95 hover:bg-white/10"
              style={{
                background: "rgba(0,240,255,0.08)",
                border: "1px solid rgba(0,240,255,0.2)",
                color: "#00f0ff",
              }}
            >
              <Languages className="w-3 h-3" />
              {locale === "ar" ? "EN" : "عربي"}
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {mainActions.map((action, index) => {
              const locked = isLocked(action.id);
              return (
                <motion.button
                  key={action.id}
                  onClick={() => handleActionClick(action.id)}
                  className="w-full text-right rounded-xl p-4 transition-all duration-200 group relative overflow-hidden"
                  style={{
                    background: locked
                      ? "linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)"
                      : "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
                    border: locked
                      ? "1px solid rgba(255,255,255,0.04)"
                      : "1px solid rgba(255,255,255,0.08)",
                    opacity: locked ? 0.55 : 1,
                  }}
                  whileHover={locked ? {} : {
                    scale: 1.015,
                    borderColor: "rgba(255,255,255,0.15)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                  }}
                  whileTap={locked ? { scale: 0.98 } : { scale: 0.985 }}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.06, duration: 0.3 }}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200"
                        style={{
                          background: locked
                            ? "rgba(255,255,255,0.06)"
                            : action.gradient,
                        }}
                      >
                        <action.icon
                          className="w-6 h-6"
                          style={{ color: locked ? "#475569" : "#0a0e1a" }}
                        />
                      </div>
                      {/* Lock icon for guest */}
                      {locked && (
                        <div
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
                        >
                          <Lock className="w-2.5 h-2.5" style={{ color: "#94a3b8" }} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className="text-base font-semibold"
                          style={{ color: locked ? "#64748b" : "#e2e8f0" }}
                        >
                          {action.label}
                        </p>
                        {/* VIP Badge for health center */}
                        {action.vip && (
                          <div
                            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full"
                            style={{
                              background: locked
                                ? "rgba(255,215,0,0.08)"
                                : "linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,170,0,0.15))",
                              border: locked
                                ? "1px solid rgba(255,215,0,0.15)"
                                : "1px solid rgba(255,215,0,0.35)",
                            }}
                          >
                            <Crown className="w-2.5 h-2.5" style={{ color: locked ? "#92400e" : "#ffd700" }} />
                            <span className="text-[8px] font-bold" style={{ color: locked ? "#92400e" : "#ffd700" }}>VIP</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: locked ? "#475569" : "#64748b" }}>
                        {locked ? "سجّل دخولك للوصول" : action.description}
                      </p>
                    </div>
                    <div
                      className="w-2 h-2 rounded-full shrink-0 opacity-40 group-hover:opacity-100 transition-opacity"
                      style={{
                        background: locked ? "#475569" : action.gradient,
                      }}
                    />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div variants={itemVariants} className="mb-6">
          <h2
            className="text-sm font-semibold mb-3"
            style={{ color: "#94a3b8" }}
          >
            {t("menu.features")}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.label}
                className="glass-card rounded-xl p-3 text-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.06 }}
                whileHover={{ scale: 1.03 }}
              >
                <feature.icon
                  className="w-5 h-5 mx-auto mb-2"
                  style={{ color: feature.color }}
                />
                <p
                  className="text-xs font-medium"
                  style={{ color: "#e2e8f0" }}
                >
                  {feature.label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Tools (Light Sensitivity + Export) */}
        <motion.div variants={itemVariants} className="mb-6">
          <h2 className="text-sm font-semibold mb-3" style={{ color: "#94a3b8" }}>
            أدوات سريعة
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {quickTools.map((tool, index) => {
              const locked = isGuest;
              return (
                <motion.button
                  key={tool.id}
                  onClick={() => handleActionClick(tool.id)}
                  className="glass-card rounded-xl p-4 text-center transition-all duration-200 group relative"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.06 }}
                  whileHover={locked ? {} : { scale: 1.03, borderColor: `${tool.color}30` }}
                  whileTap={locked ? { scale: 0.97 } : { scale: 0.97 }}
                  style={locked ? { opacity: 0.45 } : {}}
                >
                  {/* Lock overlay for guests */}
                  {locked && (
                    <div className="absolute top-2 left-2">
                      <Lock className="w-3 h-3" style={{ color: "#94a3b8" }} />
                    </div>
                  )}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform"
                    style={{ background: locked ? "rgba(255,255,255,0.04)" : tool.gradient }}
                  >
                    <tool.icon className="w-5 h-5" style={{ color: locked ? "#475569" : "#0a0e1a" }} />
                  </div>
                  <p className="text-xs font-semibold" style={{ color: locked ? "#64748b" : "#e2e8f0" }}>
                    {tool.label}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: locked ? "#475569" : tool.color }}>
                    {locked ? "سجّل دخولك" : tool.subtitle}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Bot Setup Button */}
        {!isGuest && (
          <motion.div variants={itemVariants} className="mb-6">
            <button
              onClick={() => setShowBotSetup(true)}
              className="w-full rounded-xl p-4 text-right transition-all duration-200 group"
              style={{
                background: "linear-gradient(135deg, rgba(0,240,255,0.08), rgba(0,128,255,0.05))",
                border: "1px solid rgba(0,240,255,0.2)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "linear-gradient(135deg, #00f0ff, #0080ff)" }}
                >
                  <Bot className="w-5 h-5" style={{ color: "#0a0e1a" }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: "#00f0ff" }}>
                    ربط بوت واتساب
                  </p>
                  <p className="text-[10px]" style={{ color: "#64748b" }}>
                    اربط رقم واتساب بالتطبيق
                  </p>
                </div>
              </div>
            </button>
          </motion.div>
        )}

        {/* Bot Setup Modal */}
        <AnimatePresence>
          {showBotSetup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
              onClick={() => setShowBotSetup(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm rounded-2xl p-6"
                style={{
                  background: "linear-gradient(135deg, #0d1117, #161b22)",
                  border: "1px solid rgba(0,240,255,0.2)",
                  boxShadow: "0 0 40px rgba(0,240,255,0.1)",
                }}
              >
                {/* Close button */}
                <button
                  onClick={() => setShowBotSetup(false)}
                  className="absolute top-4 left-4 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  <X className="w-4 h-4" style={{ color: "#94a3b8" }} />
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                    style={{ background: "linear-gradient(135deg, #00f0ff, #0080ff)" }}
                  >
                    <Bot className="w-7 h-7" style={{ color: "#0a0e1a" }} />
                  </div>
                  <h3 className="text-lg font-bold" style={{ color: "#e2e8f0" }}>
                    ربط بوت واتساب
                  </h3>
                </div>

                {/* Content based on status */}
                {pairingData?.status === 'pairing' && pairingData.code && (
                  <div className="text-center">
                    <p className="text-sm mb-4" style={{ color: "#94a3b8" }}>
                      ادخل الكود ده في واتساب:
                    </p>
                    {/* Code display */}
                    <div
                      className="rounded-xl p-4 mb-4 cursor-pointer"
                      onClick={copyCode}
                      style={{
                        background: "rgba(0,240,255,0.08)",
                        border: "1px solid rgba(0,240,255,0.25)",
                      }}
                    >
                      <p
                        className="text-3xl font-bold tracking-[0.3em] text-center"
                        style={{ color: "#00f0ff", fontFamily: "monospace" }}
                      >
                        {pairingData.code}
                      </p>
                      <p className="text-[10px] mt-2" style={{ color: "#64748b" }}>
                        {copied ? '✅ تم النسخ!' : 'اضغط للنسخ'}
                      </p>
                    </div>
                    {/* Steps */}
                    <div className="space-y-2 text-right mb-4">
                      {(pairingData.steps || []).map((step, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span
                            className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5"
                            style={{ background: "rgba(0,240,255,0.15)", color: "#00f0ff" }}
                          >
                            {i + 1}
                          </span>
                          <p className="text-xs" style={{ color: "#c8d6e5" }}>{step}</p>
                        </div>
                      ))}
                    </div>
                    {/* Request new code button */}
                    <button
                      onClick={requestFreshCode}
                      disabled={requestingCode}
                      className="w-full py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95"
                      style={{
                        background: "rgba(0,240,255,0.1)",
                        border: "1px solid rgba(0,240,255,0.25)",
                        color: "#00f0ff",
                      }}
                    >
                      {requestingCode ? 'جاري طلب كود جديد...' : '🔄 طلب كود جديد'}
                    </button>
                  </div>
                )}

                {pairingData?.status === 'connected' && (
                  <div className="text-center">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
                      style={{ background: "rgba(0,255,136,0.1)", border: "2px solid rgba(0,255,136,0.3)" }}
                    >
                      <Check className="w-8 h-8" style={{ color: "#00ff88" }} />
                    </div>
                    <p className="text-base font-bold" style={{ color: "#00ff88" }}>
                      واتساب مربوط بنجاح!
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#64748b" }}>
                      البوت شغال وجاهز يستقبل الرسائل
                    </p>
                  </div>
                )}

                {/* Starting / Loading state */}
                {(pairingData?.status === 'starting' || pairingData?.status === 'requesting_code' || pairingData?.status === 'reconnecting' || pairingData?.status === 'connecting') && (
                  <div className="text-center">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                      style={{ background: "rgba(0,240,255,0.1)", border: "1px solid rgba(0,240,255,0.2)" }}
                    >
                      <span className="w-7 h-7 rounded-full border-3 border-t-transparent animate-spin" style={{ borderColor: "#00f0ff", borderTopColor: "transparent", borderWidth: "3px" }} />
                    </div>
                    <p className="text-sm mb-2" style={{ color: "#00f0ff" }}>
                      {pairingData?.status === 'requesting_code' ? 'جاري طلب كود الربط...' : 
                       pairingData?.status === 'reconnecting' ? 'بيحاول يتصل تاني...' :
                       pairingData?.status === 'connecting' ? 'جاري الاتصال...' :
                       'جاري تشغيل البوت...'}
                    </p>
                    <p className="text-[10px]" style={{ color: "#64748b" }}>
                      استنى ثواني...
                    </p>
                  </div>
                )}

                {/* Not started / Ready state - show button */}
                {(pairingData?.status === 'not_started' || pairingData?.status === 'ready' || pairingData?.status === 'logged_out' || !pairingData) && (
                  <div className="text-center">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                      style={{ background: "rgba(0,240,255,0.1)", border: "1px solid rgba(0,240,255,0.2)" }}
                    >
                      <Bot className="w-7 h-7" style={{ color: "#00f0ff" }} />
                    </div>
                    <p className="text-sm mb-4" style={{ color: "#94a3b8" }}>
                      {pairingData?.status === 'logged_out' ? 'تم تسجيل الخروج - محتاج ربط جديد' :
                       pairingData?.status === 'ready' ? 'البوت جاهز! اضغط الزرار عشان يطلع كود ربط جديد' :
                       'اضغط الزرار عشان تشغل البوت وتولد كود ربط'}
                    </p>
                    <button
                      onClick={requestFreshCode}
                      disabled={requestingCode}
                      className="px-6 py-3 rounded-xl font-bold text-base transition-all active:scale-95"
                      style={{
                        background: requestingCode ? "rgba(0,240,255,0.2)" : "linear-gradient(135deg, #00f0ff, #0080ff)",
                        color: requestingCode ? "#00f0ff" : "#0a0e1a",
                        border: "none",
                      }}
                    >
                      {requestingCode ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#00f0ff", borderTopColor: "transparent" }} />
                          جاري توليد الكود...
                        </span>
                      ) : (
                        '🔑 طلب كود ربط جديد'
                      )}
                    </button>
                  </div>
                )}

                {/* Error state */}
                {pairingData?.status === 'error' && (
                  <div className="text-center">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                      style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.2)" }}
                    >
                      <X className="w-7 h-7" style={{ color: "#ff6b6b" }} />
                    </div>
                    <p className="text-sm mb-2" style={{ color: "#ff6b6b" }}>
                      حصل خطأ
                    </p>
                    <p className="text-xs mb-4" style={{ color: "#94a3b8" }}>
                      {pairingData?.message || 'حاجة غلط حصلت'}
                    </p>
                    <button
                      onClick={requestFreshCode}
                      disabled={requestingCode}
                      className="px-6 py-3 rounded-xl font-bold text-base transition-all active:scale-95"
                      style={{
                        background: requestingCode ? "rgba(0,240,255,0.2)" : "linear-gradient(135deg, #00f0ff, #0080ff)",
                        color: requestingCode ? "#00f0ff" : "#0a0e1a",
                        border: "none",
                      }}
                    >
                      {requestingCode ? 'جاري المحاولة...' : '🔄 حاول تاني'}
                    </button>
                  </div>
                )}

                {/* Disconnected state */}
                {pairingData?.status === 'disconnected' && (
                  <div className="text-center">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                      style={{ background: "rgba(255,170,0,0.1)", border: "1px solid rgba(255,170,0,0.2)" }}
                    >
                      <Bot className="w-7 h-7" style={{ color: "#ffaa00" }} />
                    </div>
                    <p className="text-sm mb-4" style={{ color: "#ffaa00" }}>
                      البوت مفصول
                    </p>
                    <button
                      onClick={requestFreshCode}
                      disabled={requestingCode}
                      className="px-6 py-3 rounded-xl font-bold text-base transition-all active:scale-95"
                      style={{
                        background: "linear-gradient(135deg, #00f0ff, #0080ff)",
                        color: "#0a0e1a",
                        border: "none",
                      }}
                    >
                      🔄 إعادة الربط
                    </button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Disclaimer */}
        <motion.div
          variants={itemVariants}
          className="glass-card rounded-xl p-4 mb-6"
        >
          <div className="flex gap-3">
            <Info
              className="w-5 h-5 shrink-0 mt-0.5"
              style={{ color: "#ffa500" }}
            />
            <p
              className="text-xs leading-relaxed"
              style={{ color: "#94a3b8" }}
            >
              {t("menu.disclaimer")}
            </p>
          </div>
        </motion.div>

        {/* Contact Button */}
        <motion.div variants={itemVariants} className="mb-6">
          <Button
            asChild
            className="w-full h-11 rounded-xl font-medium transition-all hover:opacity-90"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#e2e8f0",
            }}
          >
            <a href="mailto:mohamed10.mohamed10@gmail.com">
              <Mail
                className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`}
                style={{ color: "#00f0ff" }}
              />
              {t("menu.contact")}
            </a>
          </Button>
        </motion.div>

        {/* Footer */}
        <motion.div variants={itemVariants} className="text-center pt-4">
          <div
            className="h-px mx-auto mb-4 max-w-[200px]"
            style={{ background: "rgba(255,255,255,0.08)" }}
          />
          <p className="text-xs" style={{ color: "#64748b" }}>
            {t("menu.rights")}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
