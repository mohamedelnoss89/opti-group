"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import SplashScreen from "@/components/optisize/SplashScreen";
import AuthScreen from "@/components/optisize/AuthScreen";
import MainMenu from "@/components/optisize/MainMenu";
import Results from "@/components/optisize/Results";
import Records from "@/components/optisize/Records";
import VisionTest from "@/components/optisize/VisionTest";
import ColorVisionTest from "@/components/optisize/ColorVisionTest";
import VisualAcuityTest from "@/components/optisize/VisualAcuityTest";
import AstigmatismTest from "@/components/optisize/AstigmatismTest";
import HealthCenter from "@/components/optisize/HealthCenter";
import StrabismusTest from "@/components/optisize/StrabismusTest";
import CataractTest from "@/components/optisize/CataractTest";
import GlaucomaTest from "@/components/optisize/GlaucomaTest";
import GlassesCatalog from "@/components/optisize/GlassesCatalog";
import CalibrationGuide from "@/components/optisize/CalibrationGuide";
import PrescriptionCalculator from "@/components/optisize/PrescriptionCalculator";
import MedicalChat from "@/components/optisize/MedicalChat";
import PrescriptionComparison from "@/components/optisize/PrescriptionComparison";
import EyeProtectionTimer from "@/components/optisize/EyeProtectionTimer";
import EyeNutrition from "@/components/optisize/EyeNutrition";
import LightSensitivity from "@/components/optisize/LightSensitivity";

const Scanner = dynamic(() => import("@/components/optisize/Scanner"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0e1a" }}>
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-3" style={{ borderColor: "#00f0ff", borderTopColor: "transparent" }} />
        <p style={{ color: "#64748b" }}>جاري تحميل الكاميرا...</p>
      </div>
    </div>
  ),
});

const GlassesTryOn = dynamic(() => import("@/components/optisize/GlassesTryOn"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0e1a" }}>
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-3" style={{ borderColor: "#00f0ff", borderTopColor: "transparent" }} />
        <p style={{ color: "#64748b" }}>جاري التحميل...</p>
      </div>
    </div>
  ),
});

import type { GlassesItem } from "@/components/optisize/RealisticGlasses";
import { getCurrentUser } from "@/lib/auth";
import { saveRecord, type Record as StoredRecord } from "@/lib/storage";
import type { StoredUser } from "@/lib/auth";
import { I18nProvider } from "@/lib/i18n";
import LoginPrompt from "@/components/optisize/LoginPrompt";

type Screen =
  | "splash" | "auth" | "main" | "scanner" | "vision-test" | "health-center"
  | "glasses-catalog" | "records" | "results" | "color-test" | "strabismus-test"
  | "cataract-test" | "glaucoma-test" | "glasses-try-on" | "calibration-guide"
  | "visual-acuity-test" | "astigmatism-test" | "prescription-calculator"
  | "medical-chat" | "prescription-comparison" | "eye-protection"
  | "eye-nutrition" | "light-sensitivity";

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export default function Home() {
  // ===== STATE =====
  const [screen, setScreen] = useState<Screen>("splash");
  const [screenHistory, setScreenHistory] = useState<Screen[]>([]);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [scanResult, setScanResult] = useState<number | null>(null);
  const [selectedGlasses, setSelectedGlasses] = useState<GlassesItem | null>(null);

  // Refs for synchronous access in event handlers
  const screenRef = useRef<Screen>("splash");
  const screenHistoryRef = useRef<Screen[]>([]);

  // Keep refs in sync with state
  useEffect(() => { screenRef.current = screen; }, [screen]);
  useEffect(() => { screenHistoryRef.current = screenHistory; }, [screenHistory]);

  // ===== PERSIST STATE TO LOCALSTORAGE (survives app close!) =====
  useEffect(() => {
    if (screen !== "splash" && screen !== "auth") {
      try {
        localStorage.setItem("optisize-screen", screen);
        localStorage.setItem("optisize-history", JSON.stringify(screenHistory));
      } catch {}
    }
  }, [screen, screenHistory]);

  // ===== STATE RESTORATION FROM LOCALSTORAGE =====
  // Runs FIRST (before CSS loader removal) so user never sees splash on return
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const splashShown = localStorage.getItem("optisize-splash-shown");
      const savedScreen = localStorage.getItem("optisize-screen");
      const savedHistory = localStorage.getItem("optisize-history");

      if (splashShown === "1" && savedScreen && savedScreen !== "splash" && savedScreen !== "auth") {
        const existingUser = getCurrentUser();
        if (existingUser) {
          // Don't restore transient screens that need extra state
          const transient = ["results", "calibration-guide", "glasses-try-on"];
          if (!transient.includes(savedScreen)) {
            setScreen(savedScreen as Screen);
            screenRef.current = savedScreen as Screen;
            const hist = savedHistory ? JSON.parse(savedHistory) : [];
            setScreenHistory(hist);
            screenHistoryRef.current = hist;
            setUser(existingUser);
          } else {
            // Transient screen → go to main
            setScreen("main");
            screenRef.current = "main";
            setUser(existingUser);
          }
        }
      }
    } catch {}
  }, []);

  // ===== CSS LOADER REMOVAL =====
  useEffect(() => {
    const cssLoader = document.getElementById("css-loader");
    const appRoot = document.getElementById("app-root");
    if (cssLoader) {
      cssLoader.classList.add("app-ready");
      setTimeout(() => cssLoader.remove(), 400);
    }
    if (appRoot) {
      appRoot.classList.add("app-ready");
    }
  }, []);

  // ===== SERVICE WORKER AUTO-UPDATE =====
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data && event.data.type === "SW_UPDATED") {
        if (screenRef.current === "main" || screenRef.current === "splash") {
          window.location.reload();
        }
      }
    });

    // Check for SW updates every 3 minutes
    const interval = setInterval(() => {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg) reg.update();
      });
    }, 3 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // ===== HARDWARE BACK BUTTON — GUARD PATTERN =====
  // Push a guard entry so hardware back doesn't exit the PWA
  // When back is pressed: re-push guard + pop from React screenHistory
  useEffect(() => {
    window.history.pushState({ guard: true }, "");

    const handlePopState = () => {
      // Always re-push the guard so next back press stays in the app
      window.history.pushState({ guard: true }, "");

      // Go back in our React screen history
      const prev = [...screenHistoryRef.current];
      if (prev.length > 0) {
        const newHistory = [...prev];
        const previousScreen = newHistory.pop() || "main";
        screenHistoryRef.current = newHistory;
        setScreenHistory(newHistory);
        setScreen(previousScreen);
        screenRef.current = previousScreen;
      }
      // If no history (user is on main), stay on current screen — do nothing
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // ===== NAVIGATION FUNCTIONS =====

  // Navigate forward: push current screen to history, go to target
  // NO browser history manipulation — the guard handles hardware back
  const navigateForward = useCallback((target: Screen) => {
    const currentScreen = screenRef.current;
    const newHistory = [...screenHistoryRef.current, currentScreen];

    // Update React state only
    screenHistoryRef.current = newHistory;
    setScreenHistory(newHistory);
    setScreen(target);
    screenRef.current = target;
  }, []);

  // In-app back: pure React state — NO browser history manipulation
  const handleBack = useCallback(() => {
    const prev = [...screenHistoryRef.current];
    if (prev.length > 0) {
      const newHistory = [...prev];
      const previousScreen = newHistory.pop() || "main";
      screenHistoryRef.current = newHistory;
      setScreenHistory(newHistory);
      setScreen(previousScreen);
      screenRef.current = previousScreen;
    } else {
      // No history — go to main
      setScreen("main");
      screenRef.current = "main";
    }
  }, []);

  const handleSplashComplete = useCallback(() => {
    const existingUser = getCurrentUser();
    try { localStorage.setItem("optisize-splash-shown", "1"); } catch {}

    if (existingUser) {
      setUser(existingUser);
      setScreenHistory([]);
      screenHistoryRef.current = [];
      setScreen("main");
      screenRef.current = "main";
      if (existingUser.isGuest) {
        setTimeout(() => setShowLoginPrompt(true), 1500);
      }
    } else {
      setScreen("auth");
      screenRef.current = "auth";
    }
  }, []);

  const handleAuth = useCallback((authUser: StoredUser) => {
    setUser(authUser);
    setScreenHistory([]);
    screenHistoryRef.current = [];
    try { localStorage.setItem("optisize-splash-shown", "1"); } catch {}
    checkSubscription(authUser.id);
    setScreen("main");
    screenRef.current = "main";
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem("optisize-splash-shown");
      localStorage.removeItem("optisize-screen");
      localStorage.removeItem("optisize-history");
    } catch {}
    setScreen("auth");
    screenRef.current = "auth";
  }, []);

  const handleNavigate = useCallback((target: string) => {
    navigateForward(target as Screen);
  }, [navigateForward]);

  const handleRequestLogin = useCallback(() => {
    setShowLoginPrompt(true);
  }, []);

  const handleLoginPromptLogin = useCallback(() => {
    setShowLoginPrompt(false);
    navigateForward("auth");
  }, [navigateForward]);

  const handleLoginPromptDismiss = useCallback(() => {
    setShowLoginPrompt(false);
  }, []);

  const checkSubscription = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`/api/subscriptions?userId=${encodeURIComponent(userId)}`);
      const data = await res.json();
      if (data.success) {
        setHasSubscription(data.hasSubscription);
      }
    } catch {
      setHasSubscription(false);
    }
  }, []);

  const handleActivateCode = useCallback(async (code: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, userId: user.id }),
      });
      const data = await res.json();
      if (data.success) {
        setHasSubscription(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [user]);

  const handleScanResult = useCallback((pd: number) => {
    setScanResult(pd);
    navigateForward("results");
  }, [navigateForward]);

  const handleSaveResult = useCallback(() => {
    if (scanResult === null || !user) return;
    const record: StoredRecord = {
      id: Math.random().toString(36).substring(2) + Date.now().toString(36),
      userId: user.id, type: "pd", title: "قياس مسافة البؤبؤ",
      data: { pd: scanResult, value: scanResult }, timestamp: new Date().toISOString(),
    };
    saveRecord(record);
  }, [scanResult, user]);

  const handleRetake = useCallback(() => {
    setScanResult(null);
    handleBack();
  }, [handleBack]);

  const handleGoToRecords = useCallback(() => {
    navigateForward("records");
  }, [navigateForward]);

  const handleSelectVisionTest = useCallback((testId: string) => {
    if (testId === "color-vision") navigateForward("color-test");
    else if (testId === "visual-acuity") navigateForward("visual-acuity-test");
    else if (testId === "astigmatism") navigateForward("astigmatism-test");
  }, [navigateForward]);

  const handleSelectHealthTest = useCallback((testId: string) => {
    if (testId === "color-test") navigateForward("color-test");
    else if (testId === "strabismus-test") navigateForward("strabismus-test");
    else if (testId === "cataract-test") navigateForward("cataract-test");
    else if (testId === "glaucoma-test") navigateForward("glaucoma-test");
    else if (testId === "visual-acuity" || testId === "astigmatism") {
      navigateForward(testId === "visual-acuity" ? "visual-acuity-test" : "astigmatism-test");
    }
    else if (testId === "prescription-calculator") navigateForward("prescription-calculator");
    else if (testId === "medical-chat") navigateForward("medical-chat");
    else if (testId === "prescription-comparison") navigateForward("prescription-comparison");
    else if (testId === "eye-protection") navigateForward("eye-protection");
    else if (testId === "eye-nutrition") navigateForward("eye-nutrition");
    else if (testId === "light-sensitivity") navigateForward("light-sensitivity");
    else if (testId === "glasses-catalog") navigateForward("glasses-catalog");
  }, [navigateForward]);

  const handleColorTestComplete = useCallback((result: { score: number; total: number; status: string }) => {
    if (user) {
      saveRecord({
        id: Math.random().toString(36).substring(2) + Date.now().toString(36),
        userId: user.id, type: "vision-test", title: "اختبار الألوان - Ishihara",
        data: { ...result, testType: "color-vision" }, timestamp: new Date().toISOString(),
      });
    }
    handleBack();
  }, [user, handleBack]);

  const handleStrabismusComplete = useCallback((result: { score: number; riskLevel: string; riskColor: string }) => {
    if (user) {
      saveRecord({
        id: Math.random().toString(36).substring(2) + Date.now().toString(36),
        userId: user.id, type: "vision-test", title: "فحص الحول - Strabismus",
        data: { ...result, testType: "strabismus" }, timestamp: new Date().toISOString(),
      });
    }
  }, [user]);

  const handleCataractComplete = useCallback((result: { score: number; riskLevel: string; riskColor: string }) => {
    if (user) {
      saveRecord({
        id: Math.random().toString(36).substring(2) + Date.now().toString(36),
        userId: user.id, type: "vision-test", title: "فحص المياه البيضاء - Cataract",
        data: { ...result, testType: "cataract" }, timestamp: new Date().toISOString(),
      });
    }
  }, [user]);

  const handleGlaucomaComplete = useCallback((result: { score: number; riskLevel: string; riskColor: string }) => {
    if (user) {
      saveRecord({
        id: Math.random().toString(36).substring(2) + Date.now().toString(36),
        userId: user.id, type: "vision-test", title: "فحص المياه الزرقاء - Glaucoma",
        data: { ...result, testType: "glaucoma" }, timestamp: new Date().toISOString(),
      });
    }
  }, [user]);

  const handleTryOn = useCallback((glasses: GlassesItem) => {
    setSelectedGlasses(glasses);
    navigateForward("calibration-guide");
  }, [navigateForward]);

  const handleCalibrationStart = useCallback(() => {
    if (selectedGlasses) {
      const newHistory = [...screenHistoryRef.current];
      setScreenHistory(newHistory);
      setScreen("glasses-try-on");
      screenRef.current = "glasses-try-on";
    }
  }, [selectedGlasses]);

  const handleCalibrationBack = useCallback(() => {
    setSelectedGlasses(null);
    handleBack();
  }, [handleBack]);

  const handleChangeGlasses = useCallback((newGlasses: GlassesItem) => {
    setSelectedGlasses(newGlasses);
  }, []);

  const handleTryOnBack = useCallback(() => {
    setSelectedGlasses(null);
    // Pop back past calibration-guide to glasses-catalog
    const newHistory = [...screenHistoryRef.current];
    while (newHistory.length > 0 && newHistory[newHistory.length - 1] === "calibration-guide") {
      newHistory.pop();
    }
    const previousScreen = newHistory.length > 0 ? newHistory.pop()! : "glasses-catalog";
    screenHistoryRef.current = newHistory;
    setScreenHistory(newHistory);
    setScreen(previousScreen);
    screenRef.current = previousScreen;
  }, []);

  // Prevent body scroll on splash
  useEffect(() => {
    if (screen === "splash") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [screen]);

  return (
    <I18nProvider>
      <div style={{ background: "#0a0e1a", minHeight: "100vh" }}>
        <AnimatePresence mode="wait">
        {screen === "splash" && (
          <motion.div key="splash" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
            <SplashScreen onComplete={handleSplashComplete} />
          </motion.div>
        )}

        {screen === "auth" && (
          <motion.div key="auth" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
            <AuthScreen onAuth={handleAuth} />
          </motion.div>
        )}

        {screen === "main" && user && (
          <motion.div key="main" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
            <MainMenu user={user} onNavigate={handleNavigate} onLogout={handleLogout} onRequestLogin={handleRequestLogin} />
            <AnimatePresence>
              {showLoginPrompt && (
                <LoginPrompt onLogin={handleLoginPromptLogin} onDismiss={handleLoginPromptDismiss} />
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {screen === "scanner" && (
          <motion.div key="scanner" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
            <Scanner onResult={handleScanResult} onBack={handleBack} />
          </motion.div>
        )}

        {screen === "results" && scanResult !== null && (
          <motion.div key="results" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
            <Results pd={scanResult} onBack={handleBack} onSave={handleSaveResult} onRetake={handleRetake} onRecords={handleGoToRecords} />
          </motion.div>
        )}

        {screen === "records" && (
          <motion.div key="records" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
            <Records onBack={handleBack} />
          </motion.div>
        )}

        {screen === "vision-test" && (
          <motion.div key="vision-test" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
            <VisionTest onSelectTest={handleSelectVisionTest} onBack={handleBack} />
          </motion.div>
        )}

        {screen === "color-test" && (
          <motion.div key="color-test" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
            <ColorVisionTest onBack={handleBack} onComplete={handleColorTestComplete} />
          </motion.div>
        )}

        {screen === "health-center" && (
          <motion.div key="health-center" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
            <HealthCenter onSelectTest={handleSelectHealthTest} onBack={handleBack} hasSubscription={hasSubscription} onRequestSubscription={() => {}} onActivateCode={handleActivateCode} />
          </motion.div>
        )}

        {screen === "strabismus-test" && (
          <motion.div key="strabismus-test" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
            <StrabismusTest onBack={handleBack} onComplete={handleStrabismusComplete} />
          </motion.div>
        )}

        {screen === "cataract-test" && (
          <motion.div key="cataract-test" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
            <CataractTest onBack={handleBack} onComplete={handleCataractComplete} />
          </motion.div>
        )}

        {screen === "glaucoma-test" && (
          <motion.div key="glaucoma-test" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
            <GlaucomaTest onBack={handleBack} onComplete={handleGlaucomaComplete} />
          </motion.div>
        )}

        {screen === "visual-acuity-test" && (
          <motion.div key="visual-acuity-test" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
            <VisualAcuityTest onBack={handleBack} />
          </motion.div>
        )}

        {screen === "astigmatism-test" && (
          <motion.div key="astigmatism-test" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
            <AstigmatismTest onBack={handleBack} />
          </motion.div>
        )}

        {screen === "glasses-catalog" && (
          <motion.div key="glasses-catalog" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
            <GlassesCatalog onTryOn={handleTryOn} onBack={handleBack} />
          </motion.div>
        )}

        {screen === "calibration-guide" && selectedGlasses && (
          <motion.div key="calibration-guide" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
            <CalibrationGuide onBack={handleCalibrationBack} onStart={handleCalibrationStart} />
          </motion.div>
        )}

        {screen === "glasses-try-on" && selectedGlasses && (
          <motion.div key="glasses-try-on" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
            <GlassesTryOn glasses={selectedGlasses} onBack={handleTryOnBack} onChangeGlasses={handleChangeGlasses} />
          </motion.div>
        )}

        {screen === "prescription-calculator" && (
          <motion.div key="prescription-calculator" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
            <PrescriptionCalculator onBack={handleBack} pd={scanResult} />
          </motion.div>
        )}

        {screen === "medical-chat" && (
          <motion.div key="medical-chat" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
            <MedicalChat onBack={handleBack} />
          </motion.div>
        )}

        {screen === "prescription-comparison" && (
          <motion.div key="prescription-comparison" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
            <PrescriptionComparison onBack={handleBack} />
          </motion.div>
        )}

        {screen === "eye-protection" && (
          <motion.div key="eye-protection" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
            <EyeProtectionTimer onBack={handleBack} />
          </motion.div>
        )}

        {screen === "eye-nutrition" && (
          <motion.div key="eye-nutrition" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
            <EyeNutrition onBack={handleBack} />
          </motion.div>
        )}

        {screen === "light-sensitivity" && (
          <motion.div key="light-sensitivity" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
            <LightSensitivity onBack={handleBack} />
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </I18nProvider>
  );
}
