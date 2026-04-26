// Glasses face detection - specialized for virtual try-on
// Detects face position and calculates glasses placement parameters

export interface GlassesFaceResult {
  detected: boolean;
  centerX: number; // Normalized 0-1
  centerY: number; // Normalized 0-1
  width: number;   // Normalized 0-1
  height: number;  // Normalized 0-1
  rotation: number; // Degrees
  leftEye: { x: number; y: number };
  rightEye: { x: number; y: number };
  eyeDistance: number; // Normalized 0-1
}

export async function detectFaceForGlasses(
  img: HTMLImageElement
): Promise<GlassesFaceResult> {
  try {
    const faceapi = await import("face-api.js");

    // Ensure models are loaded
    if (!faceapi.nets.tinyFaceDetector.params) {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
    }
    if (!faceapi.nets.faceLandmark68Net.params) {
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
    }

    const detection = await faceapi
      .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks();

    if (!detection) {
      return {
        detected: false,
        centerX: 0.5,
        centerY: 0.33,
        width: 0.3,
        height: 0.2,
        rotation: 0,
        leftEye: { x: 0.4, y: 0.33 },
        rightEye: { x: 0.6, y: 0.33 },
        eyeDistance: 0.2,
      };
    }

    const landmarks = detection.landmarks;
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
    const box = detection.detection.box;

    const imgW = img.width || img.naturalWidth;
    const imgH = img.height || img.naturalHeight;

    // Eye centers
    const leftEyeCenter = {
      x: leftEye.reduce((sum, p) => sum + p.x, 0) / leftEye.length,
      y: leftEye.reduce((sum, p) => sum + p.y, 0) / leftEye.length,
    };

    const rightEyeCenter = {
      x: rightEye.reduce((sum, p) => sum + p.x, 0) / rightEye.length,
      y: rightEye.reduce((sum, p) => sum + p.y, 0) / rightEye.length,
    };

    // Calculate rotation from eye alignment
    const dx = rightEyeCenter.x - leftEyeCenter.x;
    const dy = rightEyeCenter.y - leftEyeCenter.y;
    const rotation = (Math.atan2(dy, dx) * 180) / Math.PI;

    // Glasses center point (between the eyes, slightly above center)
    const centerX = (leftEyeCenter.x + rightEyeCenter.x) / 2;
    const centerY = (leftEyeCenter.y + rightEyeCenter.y) / 2;

    // Eye distance
    const eyeDistance = Math.sqrt(dx * dx + dy * dy);

    // Glasses width is approximately 1.5x the eye distance
    const glassesWidth = eyeDistance * 1.5;

    return {
      detected: true,
      centerX: centerX / imgW,
      centerY: centerY / imgH,
      width: glassesWidth / imgW,
      height: (glassesWidth * 0.4) / imgH,
      rotation,
      leftEye: { x: leftEyeCenter.x / imgW, y: leftEyeCenter.y / imgH },
      rightEye: { x: rightEyeCenter.x / imgW, y: rightEyeCenter.y / imgH },
      eyeDistance: eyeDistance / imgW,
    };
  } catch {
    return {
      detected: false,
      centerX: 0.5,
      centerY: 0.33,
      width: 0.3,
      height: 0.2,
      rotation: 0,
      leftEye: { x: 0.4, y: 0.33 },
      rightEye: { x: 0.6, y: 0.33 },
      eyeDistance: 0.2,
    };
  }
}
