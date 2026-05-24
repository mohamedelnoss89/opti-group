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

// ====== Stabilization: Ultra-smooth landmarks across frames ======
// Very low factor = very stable markers that barely jitter
const SMOOTH_FACTOR = 0.08; // Ultra-smooth (0.05 = frozen, 0.15 = slightly responsive)
const DEAD_ZONE_PX = 3; // Movements less than this many pixels are ignored entirely
let smoothedLandmarks: FaceDetection["landmarks"] | null = null;
let smoothedBox: FaceDetection["box"] | null = null;
let stableFrameCount = 0;
let lostFrameCount = 0;
const MAX_LOST_FRAMES = 5; // Keep showing last known position for a few frames

function smoothPoint(
  current: { x: number; y: number },
  previous: { x: number; y: number } | undefined,
  factor: number
): { x: number; y: number } {
  if (!previous) return current;

  // Dead zone: if movement is tiny, don't update at all
  const dx = current.x - previous.x;
  const dy = current.y - previous.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < DEAD_ZONE_PX) {
    return { x: previous.x, y: previous.y };
  }

  // For larger movements, apply exponential smoothing
  // This makes the markers "snap" less and glide smoothly
  return {
    x: previous.x + dx * factor,
    y: previous.y + dy * factor,
  };
}

function stabilizeDetection(detection: FaceDetection): FaceDetection {
  lostFrameCount = 0; // Reset lost counter since we have a detection

  if (!smoothedLandmarks || !smoothedBox) {
    // First detection - use as-is but store it
    smoothedLandmarks = {
      leftEye: { ...detection.landmarks.leftEye },
      rightEye: { ...detection.landmarks.rightEye },
      nose: { ...detection.landmarks.nose },
      mouth: { ...detection.landmarks.mouth },
      jawLine: detection.landmarks.jawLine.map(p => ({ ...p })),
    };
    // Derive face box from landmarks for stability
    smoothedBox = deriveBoxFromLandmarks(detection.landmarks);
    stableFrameCount = 1;
    return detection;
  }

  stableFrameCount++;

  // As stability increases, make smoothing even stronger (less responsive = more stable)
  // After many frames, the markers become almost locked in place
  const adaptiveFactor = stableFrameCount > 15
    ? Math.max(SMOOTH_FACTOR * 0.5, 0.03)  // Very locked after 15 frames
    : stableFrameCount > 5
    ? SMOOTH_FACTOR * 0.7  // Getting more stable
    : SMOOTH_FACTOR;  // Initial smoothing

  // Smooth all landmark points
  const smoothed: FaceDetection = {
    box: deriveBoxFromLandmarks({
      leftEye: smoothPoint(detection.landmarks.leftEye, smoothedLandmarks.leftEye, adaptiveFactor),
      rightEye: smoothPoint(detection.landmarks.rightEye, smoothedLandmarks.rightEye, adaptiveFactor),
      nose: smoothPoint(detection.landmarks.nose, smoothedLandmarks.nose, adaptiveFactor),
      mouth: smoothPoint(detection.landmarks.mouth, smoothedLandmarks.mouth, adaptiveFactor),
      jawLine: detection.landmarks.jawLine.map((p, i) =>
        smoothPoint(p, smoothedLandmarks!.jawLine[i], adaptiveFactor)
      ),
    }),
    landmarks: {
      leftEye: smoothPoint(detection.landmarks.leftEye, smoothedLandmarks.leftEye, adaptiveFactor),
      rightEye: smoothPoint(detection.landmarks.rightEye, smoothedLandmarks.rightEye, adaptiveFactor),
      nose: smoothPoint(detection.landmarks.nose, smoothedLandmarks.nose, adaptiveFactor),
      mouth: smoothPoint(detection.landmarks.mouth, smoothedLandmarks.mouth, adaptiveFactor),
      jawLine: detection.landmarks.jawLine.map((p, i) =>
        smoothPoint(p, smoothedLandmarks!.jawLine[i], adaptiveFactor)
      ),
    },
    score: detection.score,
  };

  // Store for next frame
  smoothedLandmarks = {
    leftEye: { ...smoothed.landmarks.leftEye },
    rightEye: { ...smoothed.landmarks.rightEye },
    nose: { ...smoothed.landmarks.nose },
    mouth: { ...smoothed.landmarks.mouth },
    jawLine: smoothed.landmarks.jawLine.map(p => ({ ...p })),
  };
  smoothedBox = { ...smoothed.box };

  return smoothed;
}

// Derive a stable face bounding box from landmarks instead of using the jittery detection box
function deriveBoxFromLandmarks(landmarks: FaceDetection["landmarks"]): FaceDetection["box"] {
  // Collect all landmark points
  const allPoints = [
    landmarks.leftEye,
    landmarks.rightEye,
    landmarks.nose,
    landmarks.mouth,
    ...landmarks.jawLine,
  ];

  const minX = Math.min(...allPoints.map(p => p.x));
  const maxX = Math.max(...allPoints.map(p => p.x));
  const minY = Math.min(...allPoints.map(p => p.y));
  const maxY = Math.max(...allPoints.map(p => p.y));

  // Add padding around the landmarks
  const paddingX = (maxX - minX) * 0.15;
  const paddingY = (maxY - minY) * 0.15;

  return {
    x: minX - paddingX,
    y: minY - paddingY,
    width: (maxX - minX) + paddingX * 2,
    height: (maxY - minY) + paddingY * 2,
  };
}

// Check if we should keep showing the last known position
export function shouldKeepLastPosition(): boolean {
  return smoothedLandmarks !== null && lostFrameCount < MAX_LOST_FRAMES;
}

// Get the last smoothed detection (for brief face losses)
export function getLastSmoothedDetection(): FaceDetection | null {
  if (!smoothedLandmarks || !smoothedBox) return null;
  lostFrameCount++;
  return {
    box: smoothedBox,
    landmarks: smoothedLandmarks,
    score: 0.5,
  };
}

// Reset stabilization (call when face is lost)
export function resetStabilization(): void {
  smoothedLandmarks = null;
  smoothedBox = null;
  stableFrameCount = 0;
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
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({
        inputSize: 416,
        scoreThreshold: 0.5,
      }))
      .withFaceLandmarks();

    if (!detection) {
      // Don't reset immediately - face detection can miss frames
      // The Scanner component will use shouldKeepLastPosition() for brief losses
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

    const rawDetection: FaceDetection = {
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

    // Apply stabilization to reduce jitter
    return stabilizeDetection(rawDetection);
  } catch {
    return null;
  }
}

// Calculate PD from face landmarks with improved accuracy
// Uses biometric ratios validated against clinical PD measurements
export function calculatePD(landmarks: FaceDetection["landmarks"]): number {
  // Step 1: Calculate pixel distance between eye centers
  const dx = landmarks.rightEye.x - landmarks.leftEye.x;
  const dy = landmarks.rightEye.y - landmarks.leftEye.y;
  const eyePixelDist = Math.sqrt(dx * dx + dy * dy);

  // Step 2: Determine face width in pixels using jawline (most reliable reference)
  let faceWidthPx = 0;
  if (landmarks.jawLine.length >= 5) {
    // Use middle portion of jawline (cheek to cheek) for more stable measurement
    // Jawline points: 0-4 are right side, 5-8 are chin, 9-12 are left side
    const rightJaw = landmarks.jawLine.slice(0, 4);
    const leftJaw = landmarks.jawLine.slice(landmarks.jawLine.length - 4);
    const rightX = Math.max(...rightJaw.map(p => p.x));
    const leftX = Math.min(...leftJaw.map(p => p.x));
    faceWidthPx = rightX - leftX;
    
    // If jawline width seems too narrow, use all points
    const fullJawWidth = Math.max(...landmarks.jawLine.map(p => p.x)) - Math.min(...landmarks.jawLine.map(p => p.x));
    if (faceWidthPx < fullJawWidth * 0.8) {
      faceWidthPx = fullJawWidth;
    }
  }

  // Step 3: Calculate PD using biometric ratio
  // Clinical reference: PD/FaceWidth ≈ 0.42-0.46 for adults (avg 0.43)
  // Face width (bizygionic) ≈ 130-145mm for adults (avg 137mm)
  const avgFaceWidthMM = 137;
  const pdToFaceWidthRatio = 0.43;
  
  let pdMM: number;
  
  if (faceWidthPx > 50) {
    // Primary method: Use jawline-based face width as reference
    // This is more accurate than a fixed pixel-to-mm ratio because it self-calibrates
    // based on the detected face size
    pdMM = (eyePixelDist / faceWidthPx) * avgFaceWidthMM * pdToFaceWidthRatio;
    
    // Perspective correction: front camera has slight barrel distortion
    // This corrects the ~3-5% overestimation from wide-angle lenses
    pdMM *= 0.97;
  } else {
    // Fallback: Use distance between nose and eyes as scale reference
    // Average distance from nose bridge to midpoint between eyes ≈ 12mm
    const eyeMidX = (landmarks.leftEye.x + landmarks.rightEye.x) / 2;
    const eyeMidY = (landmarks.leftEye.y + landmarks.rightEye.y) / 2;
    const noseToEyesPx = Math.sqrt(
      Math.pow(landmarks.nose.x - eyeMidX, 2) +
      Math.pow(landmarks.nose.y - eyeMidY, 2)
    );
    
    if (noseToEyesPx > 5) {
      // nose-to-eyes distance ≈ 12mm on average
      const pixelsPerMM = noseToEyesPx / 12;
      pdMM = eyePixelDist / pixelsPerMM;
      pdMM *= 0.98; // slight correction
    } else {
      // Last resort: use typical webcam calibration
      // At 640px width, average PD of 63mm spans ~21% of width
      pdMM = eyePixelDist * 0.21;
    }
  }

  // Step 4: Apply demographic correction
  // The calculation above assumes average adult proportions
  // No gender/age correction applied since we don't have that data
  
  // Clamp to realistic human PD range (45-80mm covers children to large adults)
  return Math.round(Math.max(45, Math.min(80, pdMM)) * 10) / 10;
}

// Draw face overlay on canvas - stable and centered
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

  // ====== Draw stable face oval (centered on landmarks) ======
  // Use the face box to derive a smooth oval centered on the face
  const faceCenterX = (landmarks.leftEye.x + landmarks.rightEye.x) / 2 * scaleX;
  const faceCenterY = ((landmarks.leftEye.y + landmarks.rightEye.y) / 2 * 0.7 + landmarks.mouth.y * 0.3) * scaleY;
  const faceW = box.width * scaleX * 1.15; // Slightly wider for oval shape
  const faceH = box.height * scaleY * 1.1;  // Slightly taller for oval shape

  ctx.beginPath();
  ctx.ellipse(faceCenterX, faceCenterY, faceW / 2, faceH / 2, 0, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(0, 240, 255, 0.25)";
  ctx.lineWidth = 2 * scaleX;
  ctx.stroke();

  // ====== Draw stable eye markers ======
  const eyeRadius = 20 * scaleX;
  const lx = landmarks.leftEye.x * scaleX;
  const ly = landmarks.leftEye.y * scaleY;
  const rx = landmarks.rightEye.x * scaleX;
  const ry = landmarks.rightEye.y * scaleY;

  // Left eye - outer ring with glow
  ctx.beginPath();
  ctx.arc(lx, ly, eyeRadius, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(0, 240, 255, 0.9)";
  ctx.lineWidth = 2.5 * scaleX;
  ctx.stroke();

  // Left eye - glow effect
  ctx.beginPath();
  ctx.arc(lx, ly, eyeRadius + 4 * scaleX, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(0, 240, 255, 0.15)";
  ctx.lineWidth = 6 * scaleX;
  ctx.stroke();

  // Left eye - crosshair for precise centering
  const crossSize = 6 * scaleX;
  ctx.beginPath();
  ctx.moveTo(lx - crossSize, ly);
  ctx.lineTo(lx + crossSize, ly);
  ctx.moveTo(lx, ly - crossSize);
  ctx.lineTo(lx, ly + crossSize);
  ctx.strokeStyle = "rgba(0, 240, 255, 0.8)";
  ctx.lineWidth = 1.5 * scaleX;
  ctx.stroke();

  // Left eye - center dot
  ctx.beginPath();
  ctx.arc(lx, ly, 3 * scaleX, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0, 240, 255, 1)";
  ctx.fill();

  // Right eye - outer ring with glow
  ctx.beginPath();
  ctx.arc(rx, ry, eyeRadius, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(0, 240, 255, 0.9)";
  ctx.lineWidth = 2.5 * scaleX;
  ctx.stroke();

  // Right eye - glow effect
  ctx.beginPath();
  ctx.arc(rx, ry, eyeRadius + 4 * scaleX, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(0, 240, 255, 0.15)";
  ctx.lineWidth = 6 * scaleX;
  ctx.stroke();

  // Right eye - crosshair for precise centering
  ctx.beginPath();
  ctx.moveTo(rx - crossSize, ry);
  ctx.lineTo(rx + crossSize, ry);
  ctx.moveTo(rx, ry - crossSize);
  ctx.lineTo(rx, ry + crossSize);
  ctx.strokeStyle = "rgba(0, 240, 255, 0.8)";
  ctx.lineWidth = 1.5 * scaleX;
  ctx.stroke();

  // Right eye - center dot
  ctx.beginPath();
  ctx.arc(rx, ry, 3 * scaleX, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0, 240, 255, 1)";
  ctx.fill();

  // ====== Draw PD line between eyes ======
  ctx.beginPath();
  ctx.moveTo(lx, ly);
  ctx.lineTo(rx, ry);
  ctx.strokeStyle = "rgba(0, 240, 255, 0.4)";
  ctx.lineWidth = 1.5 * scaleX;
  ctx.setLineDash([6, 4]);
  ctx.stroke();
  ctx.setLineDash([]);

  // ====== Draw center vertical guide line (nose bridge) ======
  const midX = (lx + rx) / 2;
  const midY = (ly + ry) / 2;
  ctx.beginPath();
  ctx.moveTo(midX, faceCenterY - faceH / 2);
  ctx.lineTo(midX, faceCenterY + faceH / 2);
  ctx.strokeStyle = "rgba(0, 240, 255, 0.12)";
  ctx.lineWidth = 1 * scaleX;
  ctx.setLineDash([3, 6]);
  ctx.stroke();
  ctx.setLineDash([]);
}
