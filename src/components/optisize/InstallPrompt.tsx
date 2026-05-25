"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  WifiOff,
  Zap,
  Share,
  Plus,
  Smartphone,
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

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

    // Listen for beforeinstallprompt (Android/Chrome)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show immediately when prompt is ready
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Show the install screen IMMEDIATELY for all non-standalone users
    // No delay - user must see it the moment they open the link
    setShowPrompt(true);

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

  // Don't show if already installed
  if (!mounted || isStandalone) return null;

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
            background: "rgba(0, 0, 0, 0.92)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
          }}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 30 }}
            transition={{ type: "spring", stiffness: 180, damping: 22 }}
            className="w-full max-w-sm relative overflow-hidden rounded-3xl"
            style={{
              background:
                "linear-gradient(180deg, #0f1a2e 0%, #0a0e1a 100%)",
              border: "1px solid rgba(0,240,255,0.2)",
              boxShadow:
                "0 0 80px rgba(0,240,255,0.15), 0 30px 60px rgba(0,0,0,0.6)",
            }}
          >
            {/* Top glow effect */}
            <div
              className="absolute top-0 left-0 right-0 h-40 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at 50% -30%, rgba(0,240,255,0.18) 0%, transparent 70%)",
              }}
            />

            {/* Animated pulse ring behind icon */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 pointer-events-none">
              <div
                className="w-28 h-28 rounded-full"
                style={{
                  border: "2px solid rgba(0,240,255,0.08)",
                  animation: "install-pulse 2.5s ease-in-out infinite",
                }}
              />
            </div>

            <div className="relative p-6 pt-10">
              {/* App Icon */}
              <div className="flex justify-center mb-5">
                <div
                  className="w-24 h-24 rounded-2xl flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(0,240,255,0.2), rgba(0,128,255,0.12))",
                    border: "1.5px solid rgba(0,240,255,0.3)",
                    boxShadow:
                      "0 0 40px rgba(0,240,255,0.2), inset 0 0 20px rgba(0,240,255,0.05)",
                  }}
                >
                  <img
                    src="/icons/icon-192x192.png"
                    alt="OptiSize"
                    className="w-16 h-16 rounded-xl"
                  />
                </div>
              </div>

              {/* Title */}
              <h2
                className="text-2xl font-bold text-center mb-2"
                style={{ color: "#f1f5f9" }}
              >
                ثبّت OptiSize
              </h2>
              <p
                className="text-sm text-center mb-5 leading-relaxed"
                style={{ color: "#94a3b8" }}
              >
                حمّل التطبيق على جهازك الآن
                <br />
                مجاناً وبكل سهولة
              </p>

              {/* Benefits */}
              <div className="space-y-2.5 mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "rgba(0,240,255,0.1)",
                      border: "1px solid rgba(0,240,255,0.15)",
                    }}
                  >
                    <WifiOff
                      className="w-3.5 h-3.5"
                      style={{ color: "#00f0ff" }}
                    />
                  </div>
                  <p
                    className="text-xs font-medium"
                    style={{ color: "#cbd5e1" }}
                  >
                    يعمل بدون إنترنت
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "rgba(0,240,255,0.1)",
                      border: "1px solid rgba(0,240,255,0.15)",
                    }}
                  >
                    <Zap
                      className="w-3.5 h-3.5"
                      style={{ color: "#00f0ff" }}
                    />
                  </div>
                  <p
                    className="text-xs font-medium"
                    style={{ color: "#cbd5e1" }}
                  >
                    أسرع وأخف من المتصفح
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "rgba(0,240,255,0.1)",
                      border: "1px solid rgba(0,240,255,0.15)",
                    }}
                  >
                    <Smartphone
                      className="w-3.5 h-3.5"
                      style={{ color: "#00f0ff" }}
                    />
                  </div>
                  <p
                    className="text-xs font-medium"
                    style={{ color: "#cbd5e1" }}
                  >
                    أيقونة على الشاشة الرئيسية
                  </p>
                </div>
              </div>

              {/* ========== Android Install Button ========== */}
              {!isIOS && deferredPrompt && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleInstall}
                  disabled={installing}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold mb-0"
                  style={{
                    background:
                      "linear-gradient(135deg, #00f0ff, #0080ff)",
                    color: "#0a0e1a",
                    boxShadow:
                      "0 0 40px rgba(0,240,255,0.35), 0 8px 24px rgba(0,128,255,0.3)",
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

              {/* ========== Android - waiting for prompt ========== */}
              {!isIOS && !deferredPrompt && (
                <div className="space-y-3">
                  <div
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold"
                    style={{
                      background:
                        "linear-gradient(135deg, #00f0ff, #0080ff)",
                      color: "#0a0e1a",
                      boxShadow:
                        "0 0 40px rgba(0,240,255,0.35), 0 8px 24px rgba(0,128,255,0.3)",
                      animation: "install-glow 2s ease-in-out infinite",
                    }}
                  >
                    <Download className="w-5 h-5" />
                    جاري تجهيز التثبيت...
                  </div>
                  <p
                    className="text-[10px] text-center leading-relaxed"
                    style={{ color: "#64748b" }}
                  >
                    إذا لم يظهر خيار التثبيت، افتح الصفحة في{" "}
                    <span style={{ color: "#00f0ff" }}>
                      Chrome أو Edge أو Samsung Internet
                    </span>
                  </p>
                </div>
              )}

              {/* ========== iOS Instructions ========== */}
              {isIOS && (
                <div>
                  {!showIOSSteps ? (
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setShowIOSSteps(true)}
                      className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold"
                      style={{
                        background:
                          "linear-gradient(135deg, #00f0ff, #0080ff)",
                        color: "#0a0e1a",
                        boxShadow:
                          "0 0 40px rgba(0,240,255,0.35), 0 8px 24px rgba(0,128,255,0.3)",
                      }}
                    >
                      <Download className="w-5 h-5" />
                      كيفية التثبيت على iPhone
                    </motion.button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl p-4"
                      style={{
                        background: "rgba(0,240,255,0.06)",
                        border: "1px solid rgba(0,240,255,0.15)",
                      }}
                    >
                      <p
                        className="text-xs font-bold mb-3 text-center"
                        style={{ color: "#00f0ff" }}
                      >
                        اتبع الخطوات التالية:
                      </p>
                      <div className="space-y-3">
                        {/* Step 1 */}
                        <div className="flex items-start gap-3">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                            style={{
                              background: "rgba(0,240,255,0.15)",
                              color: "#00f0ff",
                            }}
                          >
                            1
                          </div>
                          <p
                            className="text-xs leading-relaxed pt-1"
                            style={{ color: "#e2e8f0" }}
                          >
                            اضغط على{" "}
                            <span
                              className="inline-flex items-center gap-1 font-semibold"
                              style={{ color: "#00f0ff" }}
                            >
                              <Share className="w-3.5 h-3.5" />
                              زرار المشاركة
                            </span>{" "}
                            في أسفل شاشة Safari
                          </p>
                        </div>
                        {/* Step 2 */}
                        <div className="flex items-start gap-3">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                            style={{
                              background: "rgba(0,240,255,0.15)",
                              color: "#00f0ff",
                            }}
                          >
                            2
                          </div>
                          <p
                            className="text-xs leading-relaxed pt-1"
                            style={{ color: "#e2e8f0" }}
                          >
                            اضغط على{" "}
                            <span
                              className="inline-flex items-center gap-1 font-semibold"
                              style={{ color: "#00f0ff" }}
                            >
                              <Plus className="w-3.5 h-3.5" />
                              إضافة إلى الشاشة الرئيسية
                            </span>
                          </p>
                        </div>
                        {/* Step 3 */}
                        <div className="flex items-start gap-3">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                            style={{
                              background: "rgba(0,240,255,0.15)",
                              color: "#00f0ff",
                            }}
                          >
                            3
                          </div>
                          <p
                            className="text-xs leading-relaxed pt-1"
                            style={{ color: "#e2e8f0" }}
                          >
                            اضغط{" "}
                            <span
                              className="font-semibold"
                              style={{ color: "#00f0ff" }}
                            >
                              إضافة
                            </span>{" "}
                            وسيظهر التطبيق على شاشتك الرئيسية
                          </p>
                        </div>
                      </div>

                      {/* After adding, user can tap to continue */}
                      <p
                        className="text-[10px] text-center mt-3"
                        style={{ color: "#475569" }}
                      >
                        بعد الإضافة، افتح التطبيق من الشاشة الرئيسية
                      </p>
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            {/* Inline animation keyframes */}
            <style
              dangerouslySetInnerHTML={{
                __html: `
                  @keyframes install-pulse {
                    0%, 100% { transform: scale(1); opacity: 0.5; }
                    50% { transform: scale(1.15); opacity: 0; }
                  }
                  @keyframes install-glow {
                    0%, 100% { box-shadow: 0 0 40px rgba(0,240,255,0.35), 0 8px 24px rgba(0,128,255,0.3); }
                    50% { box-shadow: 0 0 60px rgba(0,240,255,0.5), 0 8px 32px rgba(0,128,255,0.4); }
                  }
                `,
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
