// PD (Pupillary Distance) calculation and classification

export interface PDClassification {
  category: "narrow" | "normal" | "wide";
  categoryAr: string;
  color: string;
  bgColor: string;
  minRange: string;
  maxRange: string;
  descriptionAr: string;
}

export function classifyPD(pd: number): PDClassification {
  if (pd < 58) {
    return {
      category: "narrow",
      categoryAr: "ضيق",
      color: "#ffa500",
      bgColor: "rgba(255, 165, 0, 0.08)",
      minRange: "50 مم",
      maxRange: "58 مم",
      descriptionAr:
        "مسافة البؤبؤ أقل من المتوسط. يُنصح باختيار نظارات ذات جسر ضيق لتناسب شكل الوجه.",
    };
  }
  if (pd <= 68) {
    return {
      category: "normal",
      categoryAr: "طبيعي",
      color: "#00d4aa",
      bgColor: "rgba(0, 212, 170, 0.08)",
      minRange: "58 مم",
      maxRange: "68 مم",
      descriptionAr:
        "مسافة البؤبؤ ضمن النطاق الطبيعي. معظم النظارات المتاحة ستناسبك بشكل مريح.",
    };
  }
  return {
    category: "wide",
    categoryAr: "واسع",
    color: "#0080ff",
    bgColor: "rgba(0, 128, 255, 0.08)",
    minRange: "68 مم",
    maxRange: "80 مم",
    descriptionAr:
      "مسافة البؤبؤ أكبر من المتوسط. يُنصح باختيار نظارات ذات جسر واسع لتناسب شكل الوجه.",
  };
}

// Calculate PD from face landmarks
export function calculatePDFromLandmarks(
  leftEyeX: number,
  leftEyeY: number,
  rightEyeX: number,
  rightEyeY: number,
  imageWidth: number
): number {
  // Average adult PD is 63mm
  // Average face width is ~140mm
  // We use the ratio of eye distance to face width
  const pixelDist = Math.sqrt(
    Math.pow(rightEyeX - leftEyeX, 2) + Math.pow(rightEyeY - leftEyeY, 2)
  );
  
  // Approximate face width as ~60% of image width for frontal face
  const faceWidthPx = imageWidth * 0.6;
  const faceWidthMM = 140; // Average adult face width
  
  const pdMM = (pixelDist / faceWidthPx) * faceWidthMM;
  
  // Clamp to realistic range
  return Math.round(Math.max(50, Math.min(80, pdMM)) * 10) / 10;
}
