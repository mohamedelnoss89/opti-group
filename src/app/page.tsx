"use client";

import { useState, useCallback, useEffect } from "react";
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

// Dynamic imports for heavy components that use camera / face-api.js / TensorFlow
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
  | "splash"
  | "auth"
  | "main"
  | "scanner"
  | "vision-test"
  | "health-center"
  | "glasses-catalog"
  | "records"
  | "results"
  | "color-test"
  | "strabismus-test"
  | "cataract-test"
  | "glaucoma-test"
  | "glasses-try-on"
  | "calibration-guide"
  | "visual-acuity-test"
  | "astigmatism-test"
  | "prescription-calculator"
  | "medical-chat"
  | "prescription-comparison"
  | "eye-protection"
  | "eye-nutrition"
  | "light-sensitivity";

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export default function Home() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [screenHistory, setScreenHistory] = useState<Screen[]>([]);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [scanResult, setScanResult] = useState<number | null>(null);
  const [selectedGlasses, setSelectedGlasses] = useState<GlassesItem | null>(null);

  // Remove CSS-only loader and show app once React hydrates
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

  const handleSplashComplete = useCallback(() => {
    const existingUser = getCurrentUser();
    if (existingUser) {
      setUser(existingUser);
      setScreenHistory([]);
      if (existingUser.isGuest) {
        setScreen("main");
        setTimeout(() => setShowLoginPrompt(true), 1500);
      } else {
        setScreen("main");
      }
    } else {
      setScreen("auth");
    }
  }, []);

  const handleAuth = useCallback((authUser: StoredUser) => {
    setUser(authUser);
    setScreenHistory([]);
    // Check subscription status
    checkSubscription(authUser.id);
    setScreen("main");
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    setScreen("auth");
  }, []);

  // Navigate forward: push current screen to history
  const navigateTo = useCallback((target: Screen) => {
    setScreenHistory((prev) => [...prev, screen]);
    setScreen(target);
  }, [screen]);

  const handleNavigate = useCallback((target: string) => {
    setScreenHistory((prev) => [...prev, screen]);
    setScreen(target as Screen);
  }, [screen]);

  // Go back one step: pop from history
  const handleBack = useCallback(() => {
    setScreenHistory((prev) => {
      const newHistory = [...prev];
      const previousScreen = newHistory.pop() || "main";
      setScreen(previousScreen);
      return newHistory;
    });
  }, []);

  // Guest tries to access a locked service → show login prompt
  const handleRequestLogin = useCallback(() => {
    setShowLoginPrompt(true);
  }, []);

  const handleLoginPromptLogin = useCallback(() => {
    setShowLoginPrompt(false);
    setScreenHistory((prev) => [...prev, screen]);
    setScreen("auth");
  }, [screen]);

  const handleLoginPromptDismiss = useCallback(() => {
    setShowLoginPrompt(false);
  }, []);

  // Check subscription status from DB
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

  // Handle subscription activation code
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

  // Scanner result
  const handleScanResult = useCallback((pd: number) => {
    setScanResult(pd);
    setScreenHistory((prev) => [...prev, screen]);
    setScreen("results");
  }, [screen]);

  // Save PD measurement
  const handleSaveResult = useCallback(() => {
    if (scanResult === null || !user) return;

    const record: StoredRecord = {
      id: Math.random().toString(36).substring(2) + Date.now().toString(36),
      userId: user.id,
      type: "pd",
      title: "قياس مسافة البؤبؤ",
      data: { pd: scanResult, value: scanResult },
      timestamp: new Date().toISOString(),
    };

    saveRecord(record);
  }, [scanResult, user]);

  // Retake measurement
  const handleRetake = useCallback(() => {
    setScanResult(null);
    handleBack();
  }, [handleBack]);

  // Go to records from results
  const handleGoToRecords = useCallback(() => {
    setScreenHistory((prev) => [...prev, screen]);
    setScreen("records");
  }, [screen]);

  // Vision test selection
  const handleSelectVisionTest = useCallback((testId: string) => {
    setScreenHistory((prev) => [...prev, screen]);
    if (testId === "color-vision") {
      setScreen("color-test");
    } else if (testId === "visual-acuity") {
      setScreen("visual-acuity-test");
    } else if (testId === "astigmatism") {
      setScreen("astigmatism-test");
    }
  }, [screen]);

  // Health center test selection
  const handleSelectHealthTest = useCallback((testId: string) => {
    setScreenHistory((prev) => [...prev, screen]);
    if (testId === "color-test") {
      setScreen("color-test");
    } else if (testId === "strabismus-test") {
      setScreen("strabismus-test");
    } else if (testId === "cataract-test") {
      setScreen("cataract-test");
    } else if (testId === "glaucoma-test") {
      setScreen("glaucoma-test");
    } else if (testId === "visual-acuity" || testId === "astigmatism") {
      setScreen(testId === "visual-acuity" ? "visual-acuity-test" : "astigmatism-test");
    } else if (testId === "prescription-calculator") {
      setScreen("prescription-calculator");
    } else if (testId === "medical-chat") {
      setScreen("medical-chat");
    } else if (testId === "prescription-comparison") {
      setScreen("prescription-comparison");
    } else if (testId === "eye-protection") {
      setScreen("eye-protection");
    } else if (testId === "eye-nutrition") {
      setScreen("eye-nutrition");
    } else if (testId === "light-sensitivity") {
      setScreen("light-sensitivity");
    }
  }, [screen]);

  // Color vision test complete
  const handleColorTestComplete = useCallback((result: { score: number; total: number; status: string }) => {
    if (user) {
      const record: StoredRecord = {
        id: Math.random().toString(36).substring(2) + Date.now().toString(36),
        userId: user.id,
        type: "vision-test",
        title: "اختبار الألوان - Ishihara",
        data: { ...result, testType: "color-vision" },
        timestamp: new Date().toISOString(),
      };
      saveRecord(record);
    }
    // Go back to previous screen (vision-test or health-center)
    handleBack();
  }, [user, handleBack]);

  // Strabismus test complete
  const handleStrabismusComplete = useCallback((result: { score: number; riskLevel: string; riskColor: string }) => {
    if (user) {
      saveRecord({
        id: Math.random().toString(36).substring(2) + Date.now().toString(36),
        userId: user.id,
        type: "vision-test",
        title: "فحص الحول - Strabismus",
        data: { ...result, testType: "strabismus" },
        timestamp: new Date().toISOString(),
      });
    }
  }, [user]);

  // Cataract test complete
  const handleCataractComplete = useCallback((result: { score: number; riskLevel: string; riskColor: string }) => {
    if (user) {
      saveRecord({
        id: Math.random().toString(36).substring(2) + Date.now().toString(36),
        userId: user.id,
        type: "vision-test",
        title: "فحص المياه البيضاء - Cataract",
        data: { ...result, testType: "cataract" },
        timestamp: new Date().toISOString(),
      });
    }
  }, [user]);

  // Glaucoma test complete
  const handleGlaucomaComplete = useCallback((result: { score: number; riskLevel: string; riskColor: string }) => {
    if (user) {
      saveRecord({
        id: Math.random().toString(36).substring(2) + Date.now().toString(36),
        userId: user.id,
        type: "vision-test",
        title: "فحص المياه الزرقاء - Glaucoma",
        data: { ...result, testType: "glaucoma" },
        timestamp: new Date().toISOString(),
      });
    }
  }, [user]);

  // Glasses catalog try-on
  const handleTryOn = useCallback((glasses: GlassesItem) => {
    setSelectedGlasses(glasses);
    setScreenHistory((prev) => [...prev, screen]);
    setScreen("calibration-guide");
  }, [screen]);

  // Calibration guide start → go to try-on
  const handleCalibrationStart = useCallback(() => {
    if (selectedGlasses) {
      setScreenHistory((prev) => [...prev, screen]);
      setScreen("glasses-try-on");
    }
  }, [selectedGlasses, screen]);

  // Calibration guide back → go to catalog
  const handleCalibrationBack = useCallback(() => {
    setSelectedGlasses(null);
    handleBack();
  }, [handleBack]);

  // Change glasses during try-on
  const handleChangeGlasses = useCallback((newGlasses: GlassesItem) => {
    setSelectedGlasses(newGlasses);
  }, []);

  // Try-on back → catalog
  const handleTryOnBack = useCallback(() => {
    setSelectedGlasses(null);
    handleBack();
  }, [handleBack]);

  // Prevent body scroll when on splash
  useEffect(() => {
    if (screen === "splash") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
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

        {/* ===== Eye Health Center Screens ===== */}

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
