"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Camera,
  Upload,
  SwitchCamera,
  Loader2,
  Download,
  RotateCcw,
  RefreshCw,
  Eye,
  ZoomIn,
  RotateCw,
  GripVertical,
  X,
  Sparkles,
  Shuffle,
  BookmarkCheck,
  BookmarkPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  ALL_GLASSES,
  getGlassesSVG,
  getFrameTypeLabel,
  GLASSES_STYLES,
  type GlassesItem,
} from "./RealisticGlasses";

const GLASSES_OVERLAY_SIZE = 260;

import { detectFaceForGlasses, type GlassesFaceResult } from "@/lib/glassesFaceDetection";
import { saveRecord } from "@/lib/storage";

interface GlassesTryOnProps {
  glasses: GlassesItem;
  onBack: () => void;
  onChangeGlasses: (glasses: GlassesItem) => void;
}

type TryOnStage = "selection" | "capture" | "detection" | "tryon";

interface Position {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export default function GlassesTryOn({
  glasses,
  onBack,
  onChangeGlasses,
}: GlassesTryOnProps) {
  const [stage, setStage] = useState<TryOnStage>("selection");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [position, setPosition] = useState<Position>({
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
  });
  const [faceResult, setFaceResult] = useState<GlassesFaceResult | null>(null);
  const [autoPositioned, setAutoPositioned] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showChangeSheet, setShowChangeSheet] = useState(false);
  const [detectionProgress, setDetectionProgress] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [autoCountdown, setAutoCountdown] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const compositeCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; px: number; py: number }>({
    x: 0,
    y: 0,
    px: 0,
    py: 0,
  });

  // Start camera - must only be called when video element exists in DOM
  const startCamera = useCallback(
    async (facing: "user" | "environment"): Promise<boolean> => {
      try {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }

        if (!videoRef.current) return false;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing, width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        streamRef.current = stream;

        const video = videoRef.current;
        video.srcObject = stream;
        video.play().catch(() => {});

        return true;
      } catch {
        return false;
      }
    },
    []
  );

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, []);

  // Perform face detection on captured image
  const performFaceDetection = useCallback(async (imgSrc: string) => {
    setDetectionProgress("جاري تحميل نموذج كشف الوجه...");

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imgSrc;

    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
    });

    imgRef.current = img;

    setDetectionProgress("جاري تحليل الوجه والعينين...");
    const result = await detectFaceForGlasses(img);
    setFaceResult(result);

    if (result.detected) {
      setDetectionProgress("تم الكشف! جاري التركيب...");
      await new Promise((r) => setTimeout(r, 500));

      // Calculate initial position based on face detection
      // The container dimensions will be set when we enter tryon stage
      setAutoPositioned(true);
      setStage("tryon");
    } else {
      setDetectionProgress("لم يتم الكشف عن وجه. يمكنك ضبط النظارة يدوياً.");
      await new Promise((r) => setTimeout(r, 1500));
      setAutoPositioned(false);
      setStage("tryon");
    }
  }, []);

  // Apply auto position once container is available
  useEffect(() => {
    if (stage !== "tryon" || !autoPositioned || !faceResult || !containerRef.current) return;

    const container = containerRef.current;
    const containerW = container.clientWidth;
    const containerH = container.clientHeight;

    if (containerW === 0 || containerH === 0) return;

    // faceResult gives us normalized coordinates (0-1)
    const cx = faceResult.centerX * containerW;
    const cy = faceResult.centerY * containerH;

    // Calculate scale: glasses SVG size vs detected face width
    // Default SVG size is GLASSES_OVERLAY_SIZE, we want the glasses to span faceResult.width of the image
    const imageDisplayW = containerW;
    const targetGlassesW = faceResult.width * imageDisplayW;
    const baseGlassesW = GLASSES_OVERLAY_SIZE;
    const scale = targetGlassesW / baseGlassesW;

    // Convert center position to offset from the default position (50%, 33%)
    const defaultCX = containerW * 0.5;
    const defaultCY = containerH * 0.33;
    const offsetX = cx - defaultCX;
    const offsetY = cy - defaultCY;

    setPosition({
      x: offsetX,
      y: offsetY,
      scale: Math.max(0.3, Math.min(3.5, scale)),
      rotation: faceResult.rotation,
    });

    setAutoPositioned(false);
  }, [stage, autoPositioned, faceResult]);

  // Start camera when entering capture stage (useEffect ensures video element is mounted first)
  useEffect(() => {
    if (stage === "capture") {
      startCamera(facingMode).then((ok) => {
        if (!ok) {
          setStage("selection");
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  // Navigate to capture with camera
  const handleUseCamera = useCallback(() => {
    setStage("capture");
  }, []);

  // Navigate to capture with uploaded photo
  const handleUploadPhoto = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Handle file upload - go directly to tryon with manual positioning (no auto-detect)
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        setCapturedImage(dataUrl);
        setFaceResult(null);
        setAutoPositioned(false);
        setPosition({ x: 0, y: 0, scale: 1, rotation: 0 });
        setStage("tryon");
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  }, []);

  // Toggle camera
  const toggleCamera = useCallback(async () => {
    const newFacing = facingMode === "user" ? "environment" : "user";
    setFacingMode(newFacing);
    await startCamera(newFacing);
  }, [facingMode, startCamera]);

  // Capture photo from video
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Mirror for front camera
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedImage(dataUrl);

    // Stop camera
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    // Move to detection stage
    setFaceResult(null);
    setAutoPositioned(false);
    setPosition({ x: 0, y: 0, scale: 1, rotation: 0 });
    setStage("detection");
    performFaceDetection(dataUrl);
  }, [facingMode, performFaceDetection]);

  // Reset position (back to auto-detected or default)
  const resetPosition = useCallback(() => {
    if (faceResult?.detected) {
      setAutoPositioned(true);
    } else {
      setPosition({ x: 0, y: 0, scale: 1, rotation: 0 });
    }
  }, [faceResult]);

  // Retry - go back to capture (camera starts via useEffect when stage changes)
  const handleRetry = useCallback(() => {
    setCapturedImage(null);
    setFaceResult(null);
    setAutoPositioned(false);
    setPosition({ x: 0, y: 0, scale: 1, rotation: 0 });
    setIsAutoMode(false);
    setAutoCountdown(0);
    setStage("capture");
  }, []);

  // Change glasses
  const handleChangeGlasses = useCallback(
    (newGlasses: GlassesItem) => {
      onChangeGlasses(newGlasses);
      setShowChangeSheet(false);
    },
    [onChangeGlasses]
  );

  // Auto-select random glasses → open camera → countdown → auto-capture (camera starts via useEffect)
  const handleAutoSelect = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * ALL_GLASSES.length);
    const randomGlasses = ALL_GLASSES[randomIndex];
    onChangeGlasses(randomGlasses);
    setIsAutoMode(true);
    setAutoCountdown(3);
    setStage("capture");
  }, [onChangeGlasses]);

  // Countdown timer for auto-capture
  useEffect(() => {
    if (!isAutoMode || stage !== "capture" || autoCountdown <= 0) return;

    countdownTimerRef.current = setInterval(() => {
      setAutoCountdown((prev) => {
        if (prev <= 1) {
          if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
          setIsAutoMode(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, [isAutoMode, stage, autoCountdown]);

  // Auto-capture when countdown reaches 0
  useEffect(() => {
    if (isAutoMode && stage === "capture" && autoCountdown === 0) {
      capturePhoto();
    }
  }, [isAutoMode, stage, autoCountdown, capturePhoto]);

  // Cancel auto mode when user manually captures
  const handleManualCapture = useCallback(() => {
    setIsAutoMode(false);
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }
    setAutoCountdown(0);
    capturePhoto();
  }, [capturePhoto]);

  // Download composite image
  const handleDownload = useCallback(() => {
    if (!capturedImage) return;

    const offscreen = document.createElement("canvas");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      offscreen.width = img.width;
      offscreen.height = img.height;
      const offCtx = offscreen.getContext("2d");
      if (!offCtx) return;

      offCtx.drawImage(img, 0, 0);

      // Calculate glasses position based on face detection or manual position
      let cx, cy, gSize, rot;
      if (faceResult?.detected) {
        cx = faceResult.centerX * img.width + position.x;
        cy = faceResult.centerY * img.height + position.y;
        gSize = GLASSES_OVERLAY_SIZE * position.scale;
        rot = position.rotation;
      } else {
        cx = img.width / 2 + position.x;
        cy = img.height * 0.35 + position.y;
        gSize = GLASSES_OVERLAY_SIZE * position.scale;
        rot = position.rotation;
      }

      const glassesImg = new Image();
      glassesImg.crossOrigin = "anonymous";
      glassesImg.onload = () => {
        offCtx.save();
        offCtx.translate(cx, cy);
        offCtx.rotate((rot * Math.PI) / 180);
        offCtx.drawImage(glassesImg, -gSize / 2, -gSize / 2, gSize, gSize);
        offCtx.restore();

        const link = document.createElement("a");
        link.download = `optisize-tryon-${glasses.id}.png`;
        link.href = offscreen.toDataURL("image/png");
        link.click();
      };
      glassesImg.src = glasses.image;
    };
    img.src = capturedImage;
  }, [capturedImage, glasses, position, faceResult]);

  // Generate composite image data URL (reusable)
  const generateCompositeImage = useCallback((): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!capturedImage) {
        resolve(null);
        return;
      }

      const offscreen = document.createElement("canvas");
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        offscreen.width = img.width;
        offscreen.height = img.height;
        const offCtx = offscreen.getContext("2d");
        if (!offCtx) {
          resolve(null);
          return;
        }

        offCtx.drawImage(img, 0, 0);

        let cx, cy, gSize, rot;
        if (faceResult?.detected) {
          cx = faceResult.centerX * img.width + position.x;
          cy = faceResult.centerY * img.height + position.y;
          gSize = GLASSES_OVERLAY_SIZE * position.scale;
          rot = position.rotation;
        } else {
          cx = img.width / 2 + position.x;
          cy = img.height * 0.35 + position.y;
          gSize = GLASSES_OVERLAY_SIZE * position.scale;
          rot = position.rotation;
        }

        const glassesImg = new Image();
        glassesImg.crossOrigin = "anonymous";
        glassesImg.onload = () => {
          offCtx.save();
          offCtx.translate(cx, cy);
          offCtx.rotate((rot * Math.PI) / 180);
          offCtx.drawImage(glassesImg, -gSize / 2, -gSize / 2, gSize, gSize);
          offCtx.restore();

          // Compress to JPEG for storage efficiency
          resolve(offscreen.toDataURL("image/jpeg", 0.7));
        };
        glassesImg.onerror = () => resolve(null);
        glassesImg.src = glasses.image;
      };
      img.onerror = () => resolve(null);
      img.src = capturedImage;
    });
  }, [capturedImage, glasses, position, faceResult]);

  // Save composite image to app storage
  const handleSaveToApp = useCallback(async () => {
    const dataUrl = await generateCompositeImage();
    if (!dataUrl) return;

    saveRecord({
      id: `tryon-${Date.now()}`,
      userId: "guest",
      type: "glasses",
      title: `تجربة ${glasses.nameAr}`,
      data: {
        imageUrl: dataUrl,
        glassesId: glasses.id,
        glassesName: glasses.nameAr,
        glassesColor: glasses.color,
        price: glasses.price,
        category: glasses.category,
      },
      timestamp: new Date().toISOString(),
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  }, [generateCompositeImage, glasses]);

  // Drag handlers for try-on stage
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      setIsDragging(true);
      const touch = e.touches[0];
      dragStartRef.current = { x: touch.clientX, y: touch.clientY, px: position.x, py: position.y };
    },
    [position]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const touch = e.touches[0];
      const dx = touch.clientX - dragStartRef.current.x;
      const dy = touch.clientY - dragStartRef.current.y;
      setPosition((prev) => ({
        ...prev,
        x: dragStartRef.current.px + dx,
        y: dragStartRef.current.py + dy,
      }));
    },
    [isDragging]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX, y: e.clientY, px: position.x, py: position.y };

      const handleMouseMove = (ev: MouseEvent) => {
        const dx = ev.clientX - dragStartRef.current.x;
        const dy = ev.clientY - dragStartRef.current.y;
        setPosition((prev) => ({
          ...prev,
          x: dragStartRef.current.px + dx,
          y: dragStartRef.current.py + dy,
        }));
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [position]
  );

  // Render header
  const renderHeader = (title: string, subtitle: string) => (
    <div className="flex items-center justify-between p-4">
      <Button
        onClick={stage === "tryon" ? onBack : stage === "capture" ? () => setStage("selection") : onBack}
        variant="ghost"
        size="icon"
        className="w-10 h-10 rounded-xl hover:bg-white/5"
        style={{ color: "#94a3b8" }}
      >
        <ArrowRight className="w-5 h-5" />
      </Button>
      <div className="text-center">
        <h1 className="text-base font-bold" style={{ color: "#e2e8f0" }}>{title}</h1>
        <p className="text-xs" style={{ color: "#64748b" }}>{subtitle}</p>
      </div>
      <div className="w-10" />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0a0e1a" }}>
      <canvas ref={canvasRef} className="hidden" />
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      {/* ===== STAGE 1: SELECTION ===== */}
      {stage === "selection" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex flex-col min-h-screen"
        >
          {renderHeader("تجربة افتراضية", "Virtual Try-On")}

          <div className="flex-1 flex flex-col items-center justify-center px-6">
            {/* Selected Glasses Preview */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="mb-6"
            >
              <div
                className="w-48 h-48 rounded-3xl flex items-center justify-center mx-auto"
                style={{
                  background: "linear-gradient(135deg, rgba(0,240,255,0.08), rgba(0,128,255,0.05))",
                  border: "1px solid rgba(0,240,255,0.15)",
                }}
              >
                <img
                  src={glasses.image}
                  alt={glasses.nameAr}
                  className="w-40 h-40 object-contain"
                />
              </div>
            </motion.div>

            {/* Glasses Details */}
            <div className="text-center mb-8">
              <h2 className="text-lg font-bold mb-1" style={{ color: "#e2e8f0" }}>
                {glasses.nameAr}
              </h2>
              <p className="text-sm mb-3" style={{ color: "#64748b" }}>
                {glasses.nameEn}
              </p>
              <div className="flex items-center justify-center gap-3 mb-2">
                <span
                  className="text-xs px-3 py-1 rounded-full"
                  style={{
                    background: "rgba(0,240,255,0.08)",
                    color: "#00f0ff",
                    border: "1px solid rgba(0,240,255,0.15)",
                  }}
                >
                  {getFrameTypeLabel(glasses.frameType)}
                </span>
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      background: glasses.colorHex,
                      border: "1px solid rgba(255,255,255,0.15)",
                    }}
                  />
                  <span className="text-xs" style={{ color: "#94a3b8" }}>
                    {glasses.color}
                  </span>
                </div>
              </div>
              <p className="text-xl font-bold mt-2" style={{ color: "#00d4aa" }}>
                {glasses.price} ج.م
              </p>
            </div>

            {/* Options */}
            <div className="w-full max-w-sm space-y-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleUseCamera}
                className="w-full flex items-center gap-3 p-4 rounded-2xl transition-all"
                style={{
                  background: "linear-gradient(135deg, rgba(0,240,255,0.12), rgba(0,128,255,0.08))",
                  border: "1px solid rgba(0,240,255,0.2)",
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(0,240,255,0.15)" }}
                >
                  <Camera className="w-6 h-6" style={{ color: "#00f0ff" }} />
                </div>
                <div className="text-right flex-1">
                  <p className="text-sm font-semibold" style={{ color: "#e2e8f0" }}>
                    استخدام الكاميرا
                  </p>
                  <p className="text-xs" style={{ color: "#64748b" }}>
                    التقاط صورة مباشرة - كشف تلقائي للوجه
                  </p>
                </div>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleUploadPhoto}
                className="w-full flex items-center gap-3 p-4 rounded-2xl transition-all"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                >
                  <Upload className="w-6 h-6" style={{ color: "#94a3b8" }} />
                </div>
                <div className="text-right flex-1">
                  <p className="text-sm font-semibold" style={{ color: "#e2e8f0" }}>
                    رفع صورة
                  </p>
                  <p className="text-xs" style={{ color: "#64748b" }}>
                    اختر صورة من الجهاز - كشف تلقائي للوجه
                  </p>
                </div>
              </motion.button>
            </div>

            {/* Auto Select Button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleAutoSelect}
              className="w-full flex items-center gap-3 p-4 rounded-2xl transition-all mt-3"
              style={{
                background: "linear-gradient(135deg, rgba(168,85,247,0.15), rgba(236,72,153,0.1))",
                border: "1px solid rgba(168,85,247,0.25)",
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(168,85,247,0.15)" }}
              >
                <Sparkles className="w-6 h-6" style={{ color: "#a855f7" }} />
              </div>
              <div className="text-right flex-1">
                <p className="text-sm font-semibold" style={{ color: "#e2e8f0" }}>
                  اختار لي
                </p>
                <p className="text-xs" style={{ color: "#64748b" }}>
                  التقط تلقائياً وجرّب نظارة عشوائية
                </p>
              </div>
              <Shuffle className="w-5 h-5" style={{ color: "#a855f7" }} />
            </motion.button>

            {/* AI badge */}
            <div className="flex items-center gap-2 mt-4 px-4 py-2 rounded-full" style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.15)" }}>
              <Eye className="w-4 h-4" style={{ color: "#a855f7" }} />
              <span className="text-xs" style={{ color: "#a855f7" }}>كشف وجه تلقائي بالذكاء الاصطناعي</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* ===== STAGE 2: CAPTURE ===== */}
      {stage === "capture" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex flex-col min-h-screen"
        >
          {renderHeader("التقاط صورة", "Capture Photo")}

          {/* Camera View */}
          <div className="flex-1 relative mx-4 rounded-2xl overflow-hidden" style={{ minHeight: 400 }}>
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              playsInline
              muted
              style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
            />

            {/* Face guide overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="w-48 h-56 rounded-full border-2 border-dashed"
                style={{ borderColor: "rgba(0,240,255,0.25)" }}
              />
            </div>

            {/* Corner guides */}
            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 rounded-tr-lg" style={{ borderColor: "rgba(0,240,255,0.5)" }} />
            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 rounded-tl-lg" style={{ borderColor: "rgba(0,240,255,0.5)" }} />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 rounded-br-lg" style={{ borderColor: "rgba(0,240,255,0.5)" }} />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 rounded-bl-lg" style={{ borderColor: "rgba(0,240,255,0.5)" }} />

            {/* Instruction */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2">
              <div
                className="px-4 py-1.5 rounded-full text-xs"
                style={{
                  background: isAutoMode
                    ? "rgba(168,85,247,0.7)"
                    : "rgba(10,14,26,0.7)",
                  border: isAutoMode
                    ? "1px solid rgba(168,85,247,0.4)"
                    : "1px solid rgba(0,240,255,0.15)",
                  color: isAutoMode ? "#fff" : "#00f0ff",
                }}
              >
                {isAutoMode && autoCountdown > 0
                  ? `سيتم الالتقاط بعد ${autoCountdown} ثوانٍ...`
                  : "ضع وجهك داخل الدائرة"}
              </div>
            </div>

            {/* Auto mode pulsing ring */}
            {isAutoMode && autoCountdown > 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div
                  animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                  className="w-48 h-56 rounded-full border-2"
                  style={{ borderColor: "rgba(168,85,247,0.4)" }}
                />
              </div>
            )}
          </div>

          {/* Selected Glasses Preview Badge */}
          <div className="mx-4 mb-2 flex items-center gap-3 px-3 py-2 rounded-xl" style={{ background: "rgba(10,14,26,0.8)", border: "1px solid rgba(0,240,255,0.15)" }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(0,240,255,0.1)" }}>
              <img src={glasses.image} alt={glasses.nameAr} className="w-8 h-8 object-contain" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: "#e2e8f0" }}>{glasses.nameAr}</p>
              <p className="text-[10px] truncate" style={{ color: "#64748b" }}>{glasses.nameEn}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="px-4 py-6 flex items-center justify-center gap-8">
            <Button
              onClick={toggleCamera}
              variant="ghost"
              size="icon"
              className="w-12 h-12 rounded-full"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#e2e8f0",
              }}
            >
              <SwitchCamera className="w-5 h-5" />
            </Button>

            {/* Capture Button / Countdown */}
            {isAutoMode && autoCountdown > 0 ? (
              <motion.button
                disabled
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, rgba(168,85,247,0.8), rgba(124,58,237,0.8))",
                  boxShadow: "0 0 30px rgba(168,85,247,0.4), 0 0 60px rgba(168,85,247,0.15)",
                }}
              >
                <motion.span
                  key={autoCountdown}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.3, type: "spring" }}
                  className="text-xl font-bold"
                  style={{ color: "#fff" }}
                >
                  {autoCountdown}
                </motion.span>
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleManualCapture}
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #00f0ff, #0080ff)",
                  boxShadow: "0 0 30px rgba(0,240,255,0.3), 0 0 60px rgba(0,240,255,0.1)",
                }}
              >
                <div
                  className="w-12 h-12 rounded-full"
                  style={{ border: "3px solid rgba(10,14,26,0.4)", background: "transparent" }}
                />
              </motion.button>
            )}

            <div className="w-12 h-12" />
          </div>
        </motion.div>
      )}

      {/* ===== STAGE 3: DETECTION ===== */}
      {stage === "detection" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col min-h-screen items-center justify-center px-6"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="text-center"
          >
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6"
              style={{
                background: "rgba(0,240,255,0.08)",
                border: "1px solid rgba(0,240,255,0.2)",
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Eye className="w-12 h-12" style={{ color: "#00f0ff" }} />
              </motion.div>
            </div>

            <h2 className="text-lg font-bold mb-2" style={{ color: "#e2e8f0" }}>
              كشف الوجه بالذكاء الاصطناعي
            </h2>
            <p className="text-sm mb-6" style={{ color: "#64748b" }}>
              {detectionProgress || "AI Face Detection"}
            </p>

            {/* Scanning animation */}
            <div className="flex items-center justify-center gap-1.5 mb-6">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-8 rounded-full"
                  style={{ background: "#00f0ff" }}
                  animate={{ scaleY: [0.4, 1, 0.4] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>

            {/* Mini preview */}
            {capturedImage && (
              <div
                className="w-40 h-40 rounded-2xl overflow-hidden mx-auto mb-4"
                style={{
                  border: "2px solid rgba(0,240,255,0.3)",
                  boxShadow: "0 0 20px rgba(0,240,255,0.15)",
                }}
              >
                <img
                  src={capturedImage}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* ===== STAGE 4: TRY-ON ===== */}
      {stage === "tryon" && capturedImage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex flex-col min-h-screen"
        >
          {renderHeader("تجربة النظارة", "Try-On Preview")}

          {/* Photo with Glasses Overlay */}
          <div
            ref={containerRef}
            className="flex-1 relative mx-4 rounded-2xl overflow-hidden"
            style={{ minHeight: 350 }}
          >
            <canvas ref={compositeCanvasRef} className="hidden" />

            {/* Photo */}
            <div className="absolute inset-0">
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-full object-cover"
                draggable={false}
              />
            </div>

            {/* Draggable Glasses */}
            <div
              className="absolute inset-0 cursor-grab active:cursor-grabbing"
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div
                className="absolute pointer-events-none select-none"
                style={{
                  left: `calc(50% + ${position.x}px)`,
                  top: `calc(33% + ${position.y}px)`,
                  transform: `translate(-50%, -50%) scale(${position.scale}) rotate(${position.rotation}deg)`,
                  transition: isDragging ? "none" : "transform 0.1s",
                }}
              >
                <img
                  src={glasses.image}
                  alt={glasses.nameAr}
                  className="pointer-events-none select-none"
                  style={{ width: GLASSES_OVERLAY_SIZE, height: 'auto', objectFit: 'contain' }}
                  draggable={false}
                />
              </div>
            </div>

            {/* Face detected indicator */}
            {faceResult?.detected && (
              <div className="absolute top-3 right-3">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: "rgba(0,212,170,0.15)", border: "1px solid rgba(0,212,170,0.3)" }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#00d4aa" }} />
                  <span className="text-[10px]" style={{ color: "#00d4aa" }}>تم كشف الوجه</span>
                </div>
              </div>
            )}

            {/* Drag indicator */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{
                  background: "rgba(10,14,26,0.7)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <GripVertical className="w-3.5 h-3.5" style={{ color: "#94a3b8" }} />
                <span className="text-[10px]" style={{ color: "#94a3b8" }}>
                  اسحب لضبط الموضع
                </span>
              </motion.div>
            </div>
          </div>

          {/* Controls Panel */}
          <div
            className="p-4 space-y-4"
            style={{
              background: "linear-gradient(0deg, rgba(10,14,26,1) 0%, rgba(10,14,26,0.95) 100%)",
            }}
          >
            {/* Scale Slider */}
            <div className="flex items-center gap-3">
              <ZoomIn className="w-4 h-4 flex-shrink-0" style={{ color: "#64748b" }} />
              <div className="flex-1">
                <Slider
                  value={[position.scale]}
                  min={0.3}
                  max={3.5}
                  step={0.05}
                  onValueChange={([v]) => setPosition((p) => ({ ...p, scale: v }))}
                  className="w-full"
                />
              </div>
              <span className="text-xs w-10 text-center" style={{ color: "#64748b" }}>
                {Math.round(position.scale * 100)}%
              </span>
            </div>

            {/* Rotation Slider */}
            <div className="flex items-center gap-3">
              <RotateCw className="w-4 h-4 flex-shrink-0" style={{ color: "#64748b" }} />
              <div className="flex-1">
                <Slider
                  value={[position.rotation]}
                  min={-30}
                  max={30}
                  step={1}
                  onValueChange={([v]) => setPosition((p) => ({ ...p, rotation: v }))}
                  className="w-full"
                />
              </div>
              <span className="text-xs w-10 text-center" style={{ color: "#64748b" }}>
                {Math.round(position.rotation)}°
              </span>
            </div>

            {/* Reset */}
            <Button
              onClick={resetPosition}
              variant="ghost"
              size="sm"
              className="w-full h-9 rounded-xl text-xs"
              style={{ color: "#94a3b8" }}
            >
              <RotateCcw className="w-3.5 h-3.5 ml-1" />
              {faceResult?.detected ? "إعادة وضع تلقائي" : "إعادة تعيين الموضع"}
            </Button>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => setShowChangeSheet(true)}
                variant="ghost"
                className="h-11 rounded-xl text-xs font-medium"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#e2e8f0",
                }}
              >
                <RefreshCw className="w-4 h-4 ml-1.5" />
                تغيير النظارة
              </Button>
              <Button
                onClick={handleRetry}
                variant="ghost"
                className="h-11 rounded-xl text-xs font-medium"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#e2e8f0",
                }}
              >
                <RotateCcw className="w-4 h-4 ml-1.5" />
                إعادة التجربة
              </Button>
            </div>

            {/* Save & Download Buttons */}
            <div className="grid grid-cols-2 gap-2">
              {/* Save to App */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={saveSuccess ? "success" : "save"}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="col-span-1"
                >
                  <Button
                    onClick={saveSuccess ? undefined : handleSaveToApp}
                    disabled={saveSuccess}
                    className="w-full h-12 rounded-xl text-sm font-semibold"
                    style={{
                      background: saveSuccess
                        ? "linear-gradient(135deg, #00d4aa, #00b894)"
                        : "linear-gradient(135deg, rgba(168,85,247,0.9), rgba(124,58,237,0.9))",
                      color: "#fff",
                      boxShadow: saveSuccess
                        ? "0 0 20px rgba(0,212,170,0.3)"
                        : "0 0 20px rgba(168,85,247,0.2)",
                      border: "none",
                    }}
                  >
                    {saveSuccess ? (
                      <>
                        <BookmarkCheck className="w-4 h-4 ml-2" />
                        تم الحفظ
                      </>
                    ) : (
                      <>
                        <BookmarkPlus className="w-4 h-4 ml-2" />
                        حفظ الصورة
                      </>
                    )}
                  </Button>
                </motion.div>
              </AnimatePresence>

              {/* Download to Device */}
              <div className="col-span-1">
                <Button
                  onClick={handleDownload}
                  className="w-full h-12 rounded-xl text-sm font-semibold"
                  style={{
                    background: "linear-gradient(135deg, #00f0ff, #0080ff)",
                    color: "#0a0e1a",
                    boxShadow: "0 0 20px rgba(0,240,255,0.2)",
                    border: "none",
                  }}
                >
                  <Download className="w-4 h-4 ml-2" />
                  تحميل الصورة
                </Button>
              </div>
            </div>
          </div>

          {/* Change Glasses Bottom Sheet */}
          <AnimatePresence>
            {showChangeSheet && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50"
                style={{ background: "rgba(10,14,26,0.85)", backdropFilter: "blur(8px)" }}
              >
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25 }}
                  className="absolute bottom-0 left-0 right-0 rounded-t-3xl max-h-[70vh] flex flex-col"
                  style={{
                    background: "#111827",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderBottom: "none",
                  }}
                >
                  {/* Sheet Header */}
                  <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <h3 className="text-sm font-bold" style={{ color: "#e2e8f0" }}>
                      تغيير النظارة
                    </h3>
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          handleAutoSelect();
                          setShowChangeSheet(false);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                        style={{
                          background: "rgba(168,85,247,0.12)",
                          border: "1px solid rgba(168,85,247,0.25)",
                          color: "#a855f7",
                        }}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        اختار لي
                      </motion.button>
                      <Button
                        onClick={() => setShowChangeSheet(false)}
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 rounded-lg"
                        style={{ color: "#64748b" }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Category Tabs */}
                  <div className="flex gap-1.5 px-4 py-3 overflow-x-auto custom-scrollbar" style={{ direction: "rtl" }}>
                    {GLASSES_STYLES.categories.map((cat) => (
                      <button
                        key={cat.id}
                        className="px-3 py-1.5 rounded-lg text-xs whitespace-nowrap"
                        style={{
                          background: glasses.category === cat.id
                            ? "rgba(0,240,255,0.12)"
                            : "rgba(255,255,255,0.04)",
                          border: `1px solid ${
                            glasses.category === cat.id
                              ? "rgba(0,240,255,0.25)"
                              : "rgba(255,255,255,0.06)"
                          }`,
                          color: glasses.category === cat.id ? "#00f0ff" : "#94a3b8",
                        }}
                      >
                        {cat.icon} {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Glasses List */}
                  <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
                    <div className="grid grid-cols-2 gap-2">
                      {ALL_GLASSES.filter((g) => g.category === glasses.category).map(
                        (g) => (
                          <motion.button
                            key={g.id}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleChangeGlasses(g)}
                            className="p-3 rounded-xl transition-all text-right"
                            style={{
                              background:
                                g.id === glasses.id
                                  ? "rgba(0,240,255,0.1)"
                                  : "rgba(255,255,255,0.03)",
                              border: `1px solid ${
                                g.id === glasses.id
                                  ? "rgba(0,240,255,0.3)"
                                  : "rgba(255,255,255,0.05)"
                              }`,
                            }}
                          >
                            <div
                              className="flex items-center justify-center mb-2"
                              dangerouslySetInnerHTML={{
                                __html: getGlassesSVG(g.frameType, g.colorHex, 80),
                              }}
                            />
                            <p
                              className="text-xs font-medium truncate"
                              style={{ color: "#e2e8f0" }}
                            >
                              {g.nameAr}
                            </p>
                            <p
                              className="text-[10px] truncate"
                              style={{ color: "#64748b" }}
                            >
                              {g.color} - {g.price} ج.م
                            </p>
                          </motion.button>
                        )
                      )}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
