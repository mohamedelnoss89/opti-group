// Face detection library using face-api.js
// Visual overlay is STATIC and CENTERED - user positions their face into the guide
// Face detection still runs in background for PD calculation

type DetectionMethod = "none" | "native" | "cdn";

let detectionMethod: DetectionMethod = "none";
let modelsLoaded = false;

interface FaceDetection {
  box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  landmarks: {
    leftEye: { x: number; y: number };
    rightEye: { x: number; y: number };
    nose: { x: number; y: number };
    mouth: { x: number; y: number };
    jawLine: { x: number; y: number }[];
  };
  score: number;
}

// ====== PD Stabilization: Smooth PD readings across frames ======
let smoothedPD: number | null = null;
const PD_SMOOTH_FACTOR = 0.15; // Smooth PD value to avoid jumps
let pdSampleCount = 0;

// Initialize face detection models
export async function initializeDetection(): Promise<void> {
  try {
    // Try to load face-api.js dynamically
    const faceapi = await loadFaceApi();
    if (faceapi) {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
      detectionMethod = "native";
      modelsLoaded = true;
    }
  } catch {
    detectionMethod = "none";
    modelsLoaded = false;
  }
}

// Load face-api.js module
async function loadFaceApi(): Promise<typeof import("face-api.js") | null> {
  try {
    const faceapi = await import("face-api.js");
    return faceapi;
  } catch {
    return null;
  }
}

// Get current detection method
export function getDetectionMethod(): DetectionMethod {
  return detectionMethod;
}

// Detect face in video frame (for PD calculation only, NOT for overlay position)
export async function detectFace(
  video: HTMLVideoElement
): Promise<FaceDetection | null> {
  if (!modelsLoaded) return null;

  try {
    const faceapi = await loadFaceApi();
    if (!faceapi) return null;

    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({
        inputSize: 416,
        scoreThreshold: 0.5,
      }))
      .withFaceLandmarks();

    if (!detection) {
      return null;
    }

    const landmarks = detection.landmarks;
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
    const nose = landmarks.getNose();
    const jawOutline = landmarks.getJawOutline();
    const mouth = landmarks.getMouth();

    // Calculate eye centers
    const leftEyeCenter = {
      x: leftEye.reduce((sum, p) => sum + p.x, 0) / leftEye.length,
      y: leftEye.reduce((sum, p) => sum + p.y, 0) / leftEye.length,
    };

    const rightEyeCenter = {
      x: rightEye.reduce((sum, p) => sum + p.x, 0) / rightEye.length,
      y: rightEye.reduce((sum, p) => sum + p.y, 0) / rightEye.length,
    };

    const noseCenter = {
      x: nose.reduce((sum, p) => sum + p.x, 0) / nose.length / 2,
      y: nose[nose.length - 1].y,
    };

    const mouthCenter = {
      x: mouth.reduce((sum, p) => sum + p.x, 0) / mouth.length,
      y: mouth.reduce((sum, p) => sum + p.y, 0) / mouth.length,
    };

    return {
      box: {
        x: detection.detection.box.x,
        y: detection.detection.box.y,
        width: detection.detection.box.width,
        height: detection.detection.box.height,
      },
      landmarks: {
        leftEye: leftEyeCenter,
        rightEye: rightEyeCenter,
        nose: noseCenter,
        mouth: mouthCenter,
        jawLine: jawOutline.map((p) => ({ x: p.x, y: p.y })),
      },
      score: detection.detection.score,
    };
  } catch {
    return null;
  }
}

// Calculate PD from face landmarks with improved accuracy
export function calculatePD(landmarks: FaceDetection["landmarks"]): number {
  // Step 1: Calculate pixel distance between eye centers
  const dx = landmarks.rightEye.x - landmarks.leftEye.x;
  const dy = landmarks.rightEye.y - landmarks.leftEye.y;
  const eyePixelDist = Math.sqrt(dx * dx + dy * dy);

  // Step 2: Determine face width in pixels using jawline
  let faceWidthPx = 0;
  if (landmarks.jawLine.length >= 5) {
    const rightJaw = landmarks.jawLine.slice(0, 4);
    const leftJaw = landmarks.jawLine.slice(landmarks.jawLine.length - 4);
    const rightX = Math.max(...rightJaw.map(p => p.x));
    const leftX = Math.min(...leftJaw.map(p => p.x));
    faceWidthPx = rightX - leftX;
    
    const fullJawWidth = Math.max(...landmarks.jawLine.map(p => p.x)) - Math.min(...landmarks.jawLine.map(p => p.x));
    if (faceWidthPx < fullJawWidth * 0.8) {
      faceWidthPx = fullJawWidth;
    }
  }

  // Step 3: Calculate PD using biometric ratio
  const avgFaceWidthMM = 137;
  const pdToFaceWidthRatio = 0.43;
  
  let pdMM: number;
  
  if (faceWidthPx > 50) {
    pdMM = (eyePixelDist / faceWidthPx) * avgFaceWidthMM * pdToFaceWidthRatio;
    pdMM *= 0.97; // Perspective correction
  } else {
    const eyeMidX = (landmarks.leftEye.x + landmarks.rightEye.x) / 2;
    const eyeMidY = (landmarks.leftEye.y + landmarks.rightEye.y) / 2;
    const noseToEyesPx = Math.sqrt(
      Math.pow(landmarks.nose.x - eyeMidX, 2) +
      Math.pow(landmarks.nose.y - eyeMidY, 2)
    );
    
    if (noseToEyesPx > 5) {
      const pixelsPerMM = noseToEyesPx / 12;
      pdMM = eyePixelDist / pixelsPerMM;
      pdMM *= 0.98;
    } else {
      pdMM = eyePixelDist * 0.21;
    }
  }

  const rawPD = Math.round(Math.max(45, Math.min(80, pdMM)) * 10) / 10;

  // Smooth the PD reading to avoid jumps
  if (smoothedPD === null) {
    smoothedPD = rawPD;
    pdSampleCount = 1;
  } else {
    pdSampleCount++;
    // Only apply smoothing if the new value is within reasonable range
    const diff = Math.abs(rawPD - smoothedPD);
    if (diff < 10) {
      // Normal variation - smooth it
      smoothedPD = smoothedPD + (rawPD - smoothedPD) * PD_SMOOTH_FACTOR;
      smoothedPD = Math.round(smoothedPD * 10) / 10;
    } else {
      // Big jump - likely a detection error, ignore
      // But if we keep getting the same big value, slowly accept it
      if (pdSampleCount > 20 && diff < 15) {
        smoothedPD = smoothedPD + (rawPD - smoothedPD) * 0.05;
        smoothedPD = Math.round(smoothedPD * 10) / 10;
      }
    }
  }

  return smoothedPD;
}

// Reset PD stabilization
export function resetStabilization(): void {
  smoothedPD = null;
  pdSampleCount = 0;
}

// Keep for compatibility - but we don't need these anymore
export function shouldKeepLastPosition(): boolean {
  return false;
}

export function getLastSmoothedDetection(): null {
  return null;
}

// ====== Draw STATIC centered face guide overlay ======
// This overlay does NOT move - it stays centered on screen
// The user positions their face to align with this fixed guide
export function drawStaticFaceGuide(
  canvas: HTMLCanvasElement,
  faceDetected: boolean
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const scaleX = w / (canvas.clientWidth || 1);
  const scaleY = h / (canvas.clientHeight || 1);

  // ====== ALL POSITIONS ARE FIXED - CENTERED ON SCREEN ======
  const centerX = w / 2;
  const centerY = h / 2;

  // Face oval - static, centered
  const faceOvalW = w * 0.38;  // Width of face oval
  const faceOvalH = h * 0.55;  // Height of face oval

  // Eye positions - fixed at typical eye level within the face oval
  // Eyes are roughly at 40% from top of face oval
  const eyesY = centerY - faceOvalH * 0.1; // Slightly above center
  const eyeSpacing = faceOvalW * 0.28; // Distance from center to each eye
  const leftEyeX = centerX - eyeSpacing;
  const rightEyeX = centerX + eyeSpacing;

  // Color based on face detection status
  const guideColor = faceDetected ? "0, 212, 170" : "0, 240, 255"; // Green when detected, cyan when waiting
  const guideAlpha = faceDetected ? 0.8 : 0.4;

  // ====== Draw face oval ======
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, faceOvalW / 2, faceOvalH / 2, 0, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(${guideColor}, ${guideAlpha * 0.5})`;
  ctx.lineWidth = 2 * scaleX;
  ctx.setLineDash([8, 6]);
  ctx.stroke();
  ctx.setLineDash([]);

  // ====== Draw left eye circle (FIXED POSITION) ======
  const eyeRadius = 22 * scaleX;

  // Outer ring
  ctx.beginPath();
  ctx.arc(leftEyeX, eyesY, eyeRadius, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(${guideColor}, ${guideAlpha})`;
  ctx.lineWidth = 2.5 * scaleX;
  ctx.stroke();

  // Glow ring
  ctx.beginPath();
  ctx.arc(leftEyeX, eyesY, eyeRadius + 5 * scaleX, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(${guideColor}, ${guideAlpha * 0.2})`;
  ctx.lineWidth = 6 * scaleX;
  ctx.stroke();

  // Crosshair
  const crossSize = 8 * scaleX;
  ctx.beginPath();
  ctx.moveTo(leftEyeX - crossSize, eyesY);
  ctx.lineTo(leftEyeX + crossSize, eyesY);
  ctx.moveTo(leftEyeX, eyesY - crossSize);
  ctx.lineTo(leftEyeX, eyesY + crossSize);
  ctx.strokeStyle = `rgba(${guideColor}, ${guideAlpha * 0.9})`;
  ctx.lineWidth = 1.5 * scaleX;
  ctx.stroke();

  // Center dot
  ctx.beginPath();
  ctx.arc(leftEyeX, eyesY, 3 * scaleX, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(${guideColor}, 1)`;
  ctx.fill();

  // ====== Draw right eye circle (FIXED POSITION) ======
  // Outer ring
  ctx.beginPath();
  ctx.arc(rightEyeX, eyesY, eyeRadius, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(${guideColor}, ${guideAlpha})`;
  ctx.lineWidth = 2.5 * scaleX;
  ctx.stroke();

  // Glow ring
  ctx.beginPath();
  ctx.arc(rightEyeX, eyesY, eyeRadius + 5 * scaleX, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(${guideColor}, ${guideAlpha * 0.2})`;
  ctx.lineWidth = 6 * scaleX;
  ctx.stroke();

  // Crosshair
  ctx.beginPath();
  ctx.moveTo(rightEyeX - crossSize, eyesY);
  ctx.lineTo(rightEyeX + crossSize, eyesY);
  ctx.moveTo(rightEyeX, eyesY - crossSize);
  ctx.lineTo(rightEyeX, eyesY + crossSize);
  ctx.strokeStyle = `rgba(${guideColor}, ${guideAlpha * 0.9})`;
  ctx.lineWidth = 1.5 * scaleX;
  ctx.stroke();

  // Center dot
  ctx.beginPath();
  ctx.arc(rightEyeX, eyesY, 3 * scaleX, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(${guideColor}, 1)`;
  ctx.fill();

  // ====== PD line between eyes ======
  ctx.beginPath();
  ctx.moveTo(leftEyeX, eyesY);
  ctx.lineTo(rightEyeX, eyesY);
  ctx.strokeStyle = `rgba(${guideColor}, ${guideAlpha * 0.4})`;
  ctx.lineWidth = 1.5 * scaleX;
  ctx.setLineDash([6, 4]);
  ctx.stroke();
  ctx.setLineDash([]);

  // ====== Center vertical line (nose guide) ======
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - faceOvalH / 2);
  ctx.lineTo(centerX, centerY + faceOvalH / 2);
  ctx.strokeStyle = `rgba(${guideColor}, ${guideAlpha * 0.15})`;
  ctx.lineWidth = 1 * scaleX;
  ctx.setLineDash([3, 6]);
  ctx.stroke();
  ctx.setLineDash([]);

  // ====== "PD" label in the center ======
  if (faceDetected) {
    ctx.font = `bold ${12 * scaleX}px sans-serif`;
    ctx.fillStyle = `rgba(${guideColor}, 0.7)`;
    ctx.textAlign = "center";
    ctx.fillText("PD", centerX, eyesY + eyeRadius + 18 * scaleY);
  }
}

// Keep drawFaceOverlay for compatibility but redirect to static guide
export function drawFaceOverlay(
  canvas: HTMLCanvasElement,
  detection: FaceDetection | null,
  scanLineY: number,
  faceDetected: boolean = false
): void {
  drawStaticFaceGuide(canvas, faceDetected || !!detection);
}
