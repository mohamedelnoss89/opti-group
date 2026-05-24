"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  WifiOff,
  Zap,
  Shield,
  Share,
  Plus,
} from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [showIOSSteps, setShowIOSSteps] = useState(false);
  const [skipCount, setSkipCount] = useState(0);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone ===
        true;
    setIsStandalone(standalone);

    if (standalone) return;

    // Check if iOS
    const ios =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as unknown as { MSStream?: boolean }).MSStream;
    setIsIOS(ios);

    // Load skip count from localStorage
    const storedSkipCount = parseInt(
      localStorage.getItem("optisize-install-skip-count") || "0",
      10
    );
    setSkipCount(storedSkipCount);

    // Listen for beforeinstallprompt (Android/Chrome)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show the full-screen install prompt quickly
      setTimeout(() => setShowPrompt(true), 1500);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // For iOS or browsers without beforeinstallprompt, show after short delay
    if (ios) {
      // Show every time on iOS
      setTimeout(() => setShowPrompt(true), 2000);
    } else {
      // For other browsers, also check after a delay if no beforeinstallprompt fired
      setTimeout(() => {
        setDeferredPrompt((currentPrompt) => {
          if (!currentPrompt) {
            // Show after max 3 skips
            if (storedSkipCount < 3) {
              setShowPrompt(true);
            }
          }
          return currentPrompt;
        });
      }, 4000);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (deferredPrompt) {
      setInstalling(true);
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
          setDeferredPrompt(null);
          setShowPrompt(false);
        }
      } finally {
        setInstalling(false);
      }
    }
  }, [deferredPrompt]);

  const handleSkip = useCallback(() => {
    setShowPrompt(false);
    // Track skip count but don't permanently dismiss
    const newCount = skipCount + 1;
    setSkipCount(newCount);
    localStorage.setItem(
      "optisize-install-skip-count",
      newCount.toString()
    );
  }, [skipCount]);

  // Don't show if already installed
  if (isStandalone) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{
            background: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="w-full max-w-sm relative overflow-hidden rounded-3xl"
            style={{
              background:
                "linear-gradient(180deg, #0d1525 0%, #0a0e1a 100%)",
              border: "1px solid rgba(0,240,255,0.15)",
              boxShadow:
                "0 0 60px rgba(0,240,255,0.1), 0 25px 50px rgba(0,0,0,0.5)",
            }}
          >
            {/* Top glow effect */}
            <div
              className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at 50% -20%, rgba(0,240,255,0.12) 0%, transparent 70%)",
              }}
            />

            <div className="relative p-6 pt-8">
              {/* App Icon */}
              <div className="flex justify-center mb-5">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(0,240,255,0.15), rgba(0,128,255,0.1))",
                    border: "1px solid rgba(0,240,255,0.25)",
                    boxShadow: "0 0 30px rgba(0,240,255,0.15)",
                  }}
                >
                  <img
                    src="/icons/icon-192x192.png"
                    alt="OptiSize"
                    className="w-14 h-14 rounded-xl"
                  />
                </div>
              </div>

              {/* Title */}
              <h2
                className="text-xl font-bold text-center mb-2"
                style={{ color: "#e2e8f0" }}
              >
                ثبّت OptiSize على جهازك
              </h2>
              <p
                className="text-sm text-center mb-6 leading-relaxed"
                style={{ color: "#94a3b8" }}
              >
                استمتع بتجربة أفضل مع التطبيق المثبّت على جهازك
              </p>

              {/* Benefits */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "rgba(0,240,255,0.1)",
                      border: "1px solid rgba(0,240,255,0.15)",
                    }}
                  >
                    <WifiOff
                      className="w-4 h-4"
                      style={{ color: "#00f0ff" }}
                    />
                  </div>
                  <div>
                    <p
                      className="text-xs font-semibold"
                      style={{ color: "#e2e8f0" }}
                    >
                      يعمل بدون إنترنت
                    </p>
                    <p className="text-[10px]" style={{ color: "#64748b" }}>
                      استخدم التطبيق في أي وقت بدون اتصال
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "rgba(0,240,255,0.1)",
                      border: "1px solid rgba(0,240,255,0.15)",
                    }}
                  >
                    <Zap className="w-4 h-4" style={{ color: "#00f0ff" }} />
                  </div>
                  <div>
                    <p
                      className="text-xs font-semibold"
                      style={{ color: "#e2e8f0" }}
                    >
                      أسرع وأخف
                    </p>
                    <p className="text-[10px]" style={{ color: "#64748b" }}>
                      تشغيل فوري بدون متصفح
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "rgba(0,240,255,0.1)",
                      border: "1px solid rgba(0,240,255,0.15)",
                    }}
                  >
                    <Shield
                      className="w-4 h-4"
                      style={{ color: "#00f0ff" }}
                    />
                  </div>
                  <div>
                    <p
                      className="text-xs font-semibold"
                      style={{ color: "#e2e8f0" }}
                    >
                      أيقونة على الشاشة الرئيسية
                    </p>
                    <p className="text-[10px]" style={{ color: "#64748b" }}>
                      وصول سريع بنقرة واحدة
                    </p>
                  </div>
                </div>
              </div>

              {/* Install Button - Android */}
              {!isIOS && deferredPrompt && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleInstall}
                  disabled={installing}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold mb-3"
                  style={{
                    background:
                      "linear-gradient(135deg, #00f0ff, #0080ff)",
                    color: "#0a0e1a",
                    boxShadow:
                      "0 0 30px rgba(0,240,255,0.3), 0 8px 20px rgba(0,128,255,0.25)",
                  }}
                >
                  {installing ? (
                    <>
                      <div
                        className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                        style={{
                          borderColor: "#0a0e1a",
                          borderTopColor: "transparent",
                        }}
                      />
                      جاري التثبيت...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      تثبيت التطبيق الآن
                    </>
                  )}
                </motion.button>
              )}

              {/* iOS Instructions */}
              {isIOS && (
                <div className="mb-3">
                  {!showIOSSteps ? (
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setShowIOSSteps(true)}
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold"
                      style={{
                        background:
                          "linear-gradient(135deg, #00f0ff, #0080ff)",
                        color: "#0a0e1a",
                        boxShadow:
                          "0 0 30px rgba(0,240,255,0.3), 0 8px 20px rgba(0,128,255,0.25)",
                      }}
                    >
                      <Download className="w-5 h-5" />
                      كيفية التثبيت على iPhone
                    </motion.button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="rounded-2xl p-4"
                      style={{
                        background: "rgba(0,240,255,0.05)",
                        border: "1px solid rgba(0,240,255,0.12)",
                      }}
                    >
                      <p
                        className="text-xs font-bold mb-3"
                        style={{ color: "#00f0ff" }}
                      >
                        خطوات التثبيت:
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
                            style={{
                              background: "rgba(0,240,255,0.15)",
                              color: "#00f0ff",
                            }}
                          >
                            1
                          </div>
                          <p
                            className="text-xs leading-relaxed"
                            style={{ color: "#e2e8f0" }}
                          >
                            اضغط على{" "}
                            <span
                              className="inline-flex items-center gap-1"
                              style={{ color: "#00f0ff" }}
                            >
                              <Share className="w-3 h-3" />
                              زرار المشاركة
                            </span>{" "}
                            في أسفل شاشة Safari
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
                            style={{
                              background: "rgba(0,240,255,0.15)",
                              color: "#00f0ff",
                            }}
                          >
                            2
                          </div>
                          <p
                            className="text-xs leading-relaxed"
                            style={{ color: "#e2e8f0" }}
                          >
                            اضغط على{" "}
                            <span
                              className="inline-flex items-center gap-1"
                              style={{ color: "#00f0ff" }}
                            >
                              <Plus className="w-3 h-3" />
                              إضافة إلى الشاشة الرئيسية
                            </span>
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
                            style={{
                              background: "rgba(0,240,255,0.15)",
                              color: "#00f0ff",
                            }}
                          >
                            3
                          </div>
                          <p
                            className="text-xs leading-relaxed"
                            style={{ color: "#e2e8f0" }}
                          >
                            اضغط{" "}
                            <span style={{ color: "#00f0ff" }}>
                              إضافة
                            </span>{" "}
                            وسيظهر التطبيق على شاشتك الرئيسية
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Non-supported browser message (no deferredPrompt and not iOS) */}
              {!isIOS && !deferredPrompt && (
                <div
                  className="mb-3 rounded-2xl p-3"
                  style={{
                    background: "rgba(0,240,255,0.05)",
                    border: "1px solid rgba(0,240,255,0.1)",
                  }}
                >
                  <p
                    className="text-xs text-center leading-relaxed"
                    style={{ color: "#94a3b8" }}
                  >
                    افتح هذه الصفحة في{" "}
                    <span style={{ color: "#00f0ff" }}>
                      Chrome أو Edge أو Samsung Internet
                    </span>{" "}
                    لتثبيت التطبيق
                  </p>
                </div>
              )}

              {/* Skip button */}
              <button
                onClick={handleSkip}
                className="w-full py-2.5 rounded-xl text-xs"
                style={{
                  color:
                    skipCount >= 2
                      ? "#64748b"
                      : "#475569",
                  background: "transparent",
                }}
              >
                {skipCount >= 2
                  ? "متابعة بدون تثبيت"
                  : skipCount >= 1
                  ? "تخطي هذه المرة"
                  : "استخدم بدون تثبيت"}
              </button>

              {/* Subtle reminder text after skips */}
              {skipCount >= 1 && (
                <p
                  className="text-[10px] text-center mt-2"
                  style={{ color: "#334155" }}
                >
                  التثبيت مجاني تماماً ويحسن تجربتك بشكل كبير
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
