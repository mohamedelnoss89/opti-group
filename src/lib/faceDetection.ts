// Face detection library using face-api.js
// Supports both native face-api.js and fallback estimation

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

// Detect face in video frame
export async function detectFace(
  video: HTMLVideoElement
): Promise<FaceDetection | null> {
  if (!modelsLoaded) return null;

  try {
    const faceapi = await loadFaceApi();
    if (!faceapi) return null;

    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks();

    if (!detection) return null;

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

// Calculate PD from face landmarks
export function calculatePD(landmarks: FaceDetection["landmarks"]): number {
  const pixelDist = Math.sqrt(
    Math.pow(landmarks.rightEye.x - landmarks.leftEye.x, 2) +
      Math.pow(landmarks.rightEye.y - landmarks.leftEye.y, 2)
  );

  // Average face width is ~140mm, PD is ~43% of face width for adults
  // PD ≈ 63mm is average, with range 50-80mm
  const faceWidthMM = 140;
  const pdRatio = 0.43;
  
  // Use jawline width as face width reference if available
  let faceWidthPx = 0;
  if (landmarks.jawLine.length > 0) {
    const jawXs = landmarks.jawLine.map((p) => p.x);
    faceWidthPx = Math.max(...jawXs) - Math.min(...jawXs);
  }
  
  if (faceWidthPx > 0) {
    const pdMM = (pixelDist / faceWidthPx) * faceWidthMM * pdRatio / 0.43;
    // Correction factor based on camera perspective
    const corrected = pdMM * 0.95;
    return Math.round(Math.max(50, Math.min(80, corrected)) * 10) / 10;
  }
  
  // Fallback: use a standard ratio
  const pdMM = pixelDist * 0.21; // Calibrated ratio for typical webcam
  return Math.round(Math.max(50, Math.min(80, pdMM)) * 10) / 10;
}

// Draw face overlay on canvas
export function drawFaceOverlay(
  canvas: HTMLCanvasElement,
  detection: FaceDetection,
  scanLineY: number
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const scaleX = w / (canvas.clientWidth || 1);
  const scaleY = h / (canvas.clientHeight || 1);

  const { landmarks, box } = detection;

  // Draw eye circles
  const eyeRadius = 12 * scaleX;
  
  // Left eye
  ctx.beginPath();
  ctx.arc(landmarks.leftEye.x * scaleX, landmarks.leftEye.y * scaleY, eyeRadius, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(0, 240, 255, 0.7)";
  ctx.lineWidth = 2 * scaleX;
  ctx.stroke();

  // Right eye
  ctx.beginPath();
  ctx.arc(landmarks.rightEye.x * scaleX, landmarks.rightEye.y * scaleY, eyeRadius, 0, Math.PI * 2);
  ctx.stroke();

  // Draw PD line
  ctx.beginPath();
  ctx.moveTo(landmarks.leftEye.x * scaleX, landmarks.leftEye.y * scaleY);
  ctx.lineTo(landmarks.rightEye.x * scaleX, landmarks.rightEye.y * scaleY);
  ctx.strokeStyle = "rgba(0, 240, 255, 0.5)";
  ctx.lineWidth = 1.5 * scaleX;
  ctx.setLineDash([5, 5]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw face box (subtle)
  ctx.strokeStyle = "rgba(0, 240, 255, 0.2)";
  ctx.lineWidth = 1 * scaleX;
  ctx.strokeRect(box.x * scaleX, box.y * scaleY, box.width * scaleX, box.height * scaleY);
}
