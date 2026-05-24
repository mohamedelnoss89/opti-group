"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Smartphone } from "lucide-react";

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

  useEffect(() => {
    // Check if already installed (standalone mode)
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
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
      // Show prompt after a short delay so it doesn't feel intrusive
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // For iOS, show the prompt after first visit
    if (ios) {
      const dismissed = localStorage.getItem("optisize-install-dismissed");
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 5000);
      }
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setShowPrompt(false);
      }
    }
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setShowPrompt(false);
    localStorage.setItem("optisize-install-dismissed", "true");
  }, []);

  // Don't show if already installed
  if (isStandalone) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="fixed bottom-0 left-0 right-0 z-[60] p-4"
        >
          <div
            className="max-w-md mx-auto rounded-2xl p-4 relative"
            style={{
              background:
                "linear-gradient(135deg, rgba(0,240,255,0.12), rgba(0,128,255,0.08))",
              border: "1px solid rgba(0,240,255,0.2)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              boxShadow:
                "0 0 30px rgba(0,240,255,0.15), 0 8px 32px rgba(0,0,0,0.3)",
            }}
          >
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 left-3 w-6 h-6 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(255,255,255,0.08)",
                color: "#94a3b8",
              }}
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-start gap-3 pr-2">
              {/* Icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "rgba(0,240,255,0.15)",
                  border: "1px solid rgba(0,240,255,0.25)",
                }}
              >
                <img
                  src="/icons/icon-96x96.png"
                  alt="OptiSize"
                  className="w-8 h-8 rounded-lg"
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3
                  className="text-sm font-bold mb-1"
                  style={{ color: "#e2e8f0" }}
                >
                  ثبّت OptiSize على جهازك
                </h3>
                <p
                  className="text-xs leading-relaxed mb-3"
                  style={{ color: "#94a3b8" }}
                >
                  {isIOS ? (
                    <>
                      اضغط على{" "}
                      <span
                        className="inline-flex items-center"
                        style={{ color: "#00f0ff" }}
                      >
                        <Smartphone className="w-3 h-3 mx-0.5" />
                        زرار المشاركة
                      </span>{" "}
                      ثم{" "}
                      <span style={{ color: "#00f0ff" }}>
                        &quot;إضافة إلى الشاشة الرئيسية&quot;
                      </span>
                    </>
                  ) : (
                    "ثبّت التطبيق للوصول السريع والعمل بدون إنترنت"
                  )}
                </p>

                {/* Install button (Android) */}
                {!isIOS && (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleInstall}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
                    style={{
                      background: "linear-gradient(135deg, #00f0ff, #0080ff)",
                      color: "#0a0e1a",
                      boxShadow:
                        "0 0 20px rgba(0,240,255,0.3), 0 4px 12px rgba(0,128,255,0.2)",
                    }}
                  >
                    <Download className="w-4 h-4" />
                    تثبيت التطبيق
                  </motion.button>
                )}

                {/* iOS instruction */}
                {isIOS && (
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-lg"
                    style={{
                      background: "rgba(0,240,255,0.06)",
                      border: "1px solid rgba(0,240,255,0.1)",
                    }}
                  >
                    <Smartphone className="w-4 h-4" style={{ color: "#00f0ff" }} />
                    <span className="text-xs" style={{ color: "#00f0ff" }}>
                      Safari ← مشاركة ← إضافة للشاشة
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
