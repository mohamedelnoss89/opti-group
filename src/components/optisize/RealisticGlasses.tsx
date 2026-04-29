"use client";

export interface GlassesItem {
  id: number;
  nameAr: string;
  category: "men_prescription" | "women_prescription" | "men_sunglasses" | "women_sunglasses" | "kids";
  color: string;
  image: string;
  // Optional fields for backward compatibility with GlassesTryOn
  nameEn?: string;
  frameType?: string;
  gender?: "kids" | "women" | "men";
  colorHex?: string;
  price?: number;
}

export const GLASSES_CATEGORIES = [
  { id: "all", label: "الكل", icon: "🏪" },
  { id: "men_prescription", label: "نظر رجالي", icon: "👓" },
  { id: "women_prescription", label: "نظر حريمي", icon: "👓" },
  { id: "men_sunglasses", label: "شمس رجالي", icon: "🕶️" },
  { id: "women_sunglasses", label: "شمس حريمي", icon: "🕶️" },
  { id: "kids", label: "أطفال", icon: "👶" },
] as const;

export type GlassesCategory = typeof GLASSES_CATEGORIES[number]["id"];

export const ALL_GLASSES: GlassesItem[] = [
  // ===== نظر رجالي (Men Prescription) =====
  { id: 1, nameAr: "نظارة رجالية كلاسيكية سوداء", category: "men_prescription", color: "أسود", image: "/glasses/men-prescription/men-prescription-1.png" },
  { id: 2, nameAr: "نظارة رجالية معدنية", category: "men_prescription", color: "فضي", image: "/glasses/men-prescription/men-prescription-2.png" },
  { id: 3, nameAr: "نظارة رجالية عصرية", category: "men_prescription", color: "بني", image: "/glasses/men-prescription/men-prescription-3.png" },
  { id: 4, nameAr: "نظارة رجالية أنيقة", category: "men_prescription", color: "أسود مات", image: "/glasses/men-prescription/men-prescription-4.png" },
  { id: 5, nameAr: "نظارة رجالية ويفارر", category: "men_prescription", color: "كحلي", image: "/glasses/men-prescription/men-prescription-5.png" },
  { id: 6, nameAr: "نظارة رجالية مستديرة", category: "men_prescription", color: "أسود", image: "/glasses/men-prescription/men-prescription-6.png" },
  { id: 7, nameAr: "نظارة رجالية رياضية", category: "men_prescription", color: "رمادي", image: "/glasses/men-prescription/men-prescription-7.png" },
  { id: 8, nameAr: "نظارة رجالية شفافة", category: "men_prescription", color: "شفاف", image: "/glasses/men-prescription/men-prescription-8.png" },
  { id: 9, nameAr: "نظارة رجالية ذهبية", category: "men_prescription", color: "ذهبي", image: "/glasses/men-prescription/men-prescription-9.png" },
  { id: 10, nameAr: "نظارة رجالية نصف إطار", category: "men_prescription", color: "أسود وذهبي", image: "/glasses/men-prescription/men-prescription-10.png" },
  { id: 11, nameAr: "نظارة رجالية مستطيلة", category: "men_prescription", color: "بني غامق", image: "/glasses/men-prescription/men-prescription-11.png" },
  { id: 12, nameAr: "نظارة رجالية أفاتور", category: "men_prescription", color: "ذهبي", image: "/glasses/men-prescription/men-prescription-12.png" },
  { id: 13, nameAr: "نظارة رجالية سكوير", category: "men_prescription", color: "أسود", image: "/glasses/men-prescription/men-prescription-13.png" },
  { id: 14, nameAr: "نظارة رجالية أوفال", category: "men_prescription", color: "بني", image: "/glasses/men-prescription/men-prescription-14.png" },
  { id: 15, nameAr: "نظارة رجالية بروكلوب", category: "men_prescription", color: "أسود مات", image: "/glasses/men-prescription/men-prescription-15.png" },
  { id: 16, nameAr: "نظارة رجالية ريملس", category: "men_prescription", color: "فضي", image: "/glasses/men-prescription/men-prescription-16.png" },
  { id: 17, nameAr: "نظارة رجالية تيتانيوم", category: "men_prescription", color: "رمادي", image: "/glasses/men-prescription/men-prescription-17.png" },
  { id: 18, nameAr: "نظارة رجالية كربون", category: "men_prescription", color: "أسود", image: "/glasses/men-prescription/men-prescription-18.png" },

  // ===== نظر حريمي (Women Prescription) =====
  { id: 19, nameAr: "نظارة حريمي كات آي سوداء", category: "women_prescription", color: "أسود", image: "/glasses/women-prescription/women-prescription-1.png" },
  { id: 20, nameAr: "نظارة حريمي وردية", category: "women_prescription", color: "وردي", image: "/glasses/women-prescription/women-prescription-2.png" },
  { id: 21, nameAr: "نظارة حريمي بنفسجية", category: "women_prescription", color: "بنفسجي", image: "/glasses/women-prescription/women-prescription-3.png" },
  { id: 22, nameAr: "نظارة حريمي ذهبية", category: "women_prescription", color: "ذهبي", image: "/glasses/women-prescription/women-prescription-4.png" },
  { id: 23, nameAr: "نظارة حريمي شفافة", category: "women_prescription", color: "شفاف", image: "/glasses/women-prescription/women-prescription-5.png" },
  { id: 24, nameAr: "نظارة حريمي مستديرة", category: "women_prescription", color: "وردي فاتح", image: "/glasses/women-prescription/women-prescription-6.png" },
  { id: 25, nameAr: "نظارة حريمي سلحفاة", category: "women_prescription", color: "سلحفاة", image: "/glasses/women-prescription/women-prescription-7.png" },
  { id: 26, nameAr: "نظارة حريمي كلاسيكية", category: "women_prescription", color: "بني", image: "/glasses/women-prescription/women-prescription-8.png" },
  { id: 27, nameAr: "نظارة حريمي عصرية", category: "women_prescription", color: "أسود", image: "/glasses/women-prescription/women-prescription-9.png" },
  { id: 28, nameAr: "نظارة حريمي كات آي أنيقة", category: "women_prescription", color: "أسود", image: "/glasses/women-prescription/women-prescription-10.png" },
  { id: 29, nameAr: "نظارة حريمي مستطيلة", category: "women_prescription", color: "وردي", image: "/glasses/women-prescription/women-prescription-11.png" },
  { id: 30, nameAr: "نظارة حريمي دقيقة", category: "women_prescription", color: "ذهبي", image: "/glasses/women-prescription/women-prescription-12.png" },
  { id: 31, nameAr: "نظارة حريمي ملونة", category: "women_prescription", color: "متعدد", image: "/glasses/women-prescription/women-prescription-13.png" },

  // ===== شمس رجالي (Men Sunglasses) =====
  { id: 32, nameAr: "نظارة شمس رجالي أفاتور", category: "men_sunglasses", color: "ذهبي", image: "/glasses/men-sunglasses/men-sunglasses-1.png" },
  { id: 33, nameAr: "نظارة شمس رجالي ويفارر", category: "men_sunglasses", color: "أسود", image: "/glasses/men-sunglasses/men-sunglasses-2.png" },
  { id: 34, nameAr: "نظارة شمس رجالي كلاسيكية", category: "men_sunglasses", color: "بني", image: "/glasses/men-sunglasses/men-sunglasses-3.png" },
  { id: 35, nameAr: "نظارة شمس رجالي رياضية", category: "men_sunglasses", color: "أسود", image: "/glasses/men-sunglasses/men-sunglasses-4.png" },
  { id: 36, nameAr: "نظارة شمس رجالي مستديرة", category: "men_sunglasses", color: "أسود مات", image: "/glasses/men-sunglasses/men-sunglasses-5.png" },
  { id: 37, nameAr: "نظارة شمس رجالي سكوير", category: "men_sunglasses", color: "كحلي", image: "/glasses/men-sunglasses/men-sunglasses-6.png" },
  { id: 38, nameAr: "نظارة شمس رجالي معدنية", category: "men_sunglasses", color: "فضي", image: "/glasses/men-sunglasses/men-sunglasses-7.png" },
  { id: 39, nameAr: "نظارة شمس رجالي مستطيلة", category: "men_sunglasses", color: "رمادي", image: "/glasses/men-sunglasses/men-sunglasses-8.png" },
  { id: 40, nameAr: "نظارة شمس رجالي أوفال", category: "men_sunglasses", color: "ذهبي", image: "/glasses/men-sunglasses/men-sunglasses-9.png" },
  { id: 41, nameAr: "نظارة شمس رجالي شيلد", category: "men_sunglasses", color: "أسود", image: "/glasses/men-sunglasses/men-sunglasses-10.png" },
  { id: 42, nameAr: "نظارة شمس رجالي نصف إطار", category: "men_sunglasses", color: "أسود وذهبي", image: "/glasses/men-sunglasses/men-sunglasses-11.png" },
  { id: 43, nameAr: "نظارة شمس رجالي كاملة الإطار", category: "men_sunglasses", color: "بني غامق", image: "/glasses/men-sunglasses/men-sunglasses-12.png" },
  { id: 44, nameAr: "نظارة شمس رجالي بيست", category: "men_sunglasses", color: "أسود", image: "/glasses/men-sunglasses/men-sunglasses-13.png" },
  { id: 45, nameAr: "نظارة شمس رجالي راب", category: "men_sunglasses", color: "أزرق داكن", image: "/glasses/men-sunglasses/men-sunglasses-14.png" },
  { id: 46, nameAr: "نظارة شمس رجالي كربون", category: "men_sunglasses", color: "كربون", image: "/glasses/men-sunglasses/men-sunglasses-15.png" },
  { id: 47, nameAr: "نظارة شمس رجالي فاخرة", category: "men_sunglasses", color: "ذهبي", image: "/glasses/men-sunglasses/men-sunglasses-16.png" },
  { id: 48, nameAr: "نظارة شمس رجالي بولارايزد", category: "men_sunglasses", color: "رمادي", image: "/glasses/men-sunglasses/men-sunglasses-17.png" },
  { id: 49, nameAr: "نظارة شمس رجالي تيتانيوم", category: "men_sunglasses", color: "فضي", image: "/glasses/men-sunglasses/men-sunglasses-18.png" },

  // ===== شمس حريمي (Women Sunglasses) =====
  { id: 50, nameAr: "نظارة شمس حريمي كات آي", category: "women_sunglasses", color: "أسود", image: "/glasses/women-sunglasses/women-sunglasses-1.png" },
  { id: 51, nameAr: "نظارة شمس حريمي كبيرة", category: "women_sunglasses", color: "بني", image: "/glasses/women-sunglasses/women-sunglasses-2.png" },
  { id: 52, nameAr: "نظارة شمس حريمي مستديرة", category: "women_sunglasses", color: "وردي", image: "/glasses/women-sunglasses/women-sunglasses-3.png" },
  { id: 53, nameAr: "نظارة شمس حريمي أفاتور", category: "women_sunglasses", color: "ذهبي", image: "/glasses/women-sunglasses/women-sunglasses-4.png" },
  { id: 54, nameAr: "نظارة شمس حريمي ويفارر", category: "women_sunglasses", color: "أسود", image: "/glasses/women-sunglasses/women-sunglasses-5.png" },
  { id: 55, nameAr: "نظارة شمس حريمي وردية", category: "women_sunglasses", color: "وردي", image: "/glasses/women-sunglasses/women-sunglasses-6.png" },
  { id: 56, nameAr: "نظارة شمس حريمي شيلد", category: "women_sunglasses", color: "بنفسجي", image: "/glasses/women-sunglasses/women-sunglasses-7.png" },
  { id: 57, nameAr: "نظارة شمس حريمي مستطيلة", category: "women_sunglasses", color: "أسود", image: "/glasses/women-sunglasses/women-sunglasses-8.png" },
  { id: 58, nameAr: "نظارة شمس حريمي بترفلاي", category: "women_sunglasses", color: "بني", image: "/glasses/women-sunglasses/women-sunglasses-9.png" },
  { id: 59, nameAr: "نظارة شمس حريمي أوفرسايز", category: "women_sunglasses", color: "أسود مات", image: "/glasses/women-sunglasses/women-sunglasses-10.png" },
  { id: 60, nameAr: "نظارة شمس حريمي ريترو", category: "women_sunglasses", color: "أحمر", image: "/glasses/women-sunglasses/women-sunglasses-11.png" },
  { id: 61, nameAr: "نظارة شمس حريمي معدنية", category: "women_sunglasses", color: "ذهبي", image: "/glasses/women-sunglasses/women-sunglasses-12.png" },
  { id: 62, nameAr: "نظارة شمس حريمي ملونة", category: "women_sunglasses", color: "متعدد", image: "/glasses/women-sunglasses/women-sunglasses-13.png" },

  // ===== أطفال (Kids) =====
  { id: 63, nameAr: "نظارة أطفال ملونة", category: "kids", color: "وردي", image: "/glasses/kids/kids-1.png" },
  { id: 64, nameAr: "نظارة أطفال مستديرة", category: "kids", color: "أزرق", image: "/glasses/kids/kids-2.png" },
  { id: 65, nameAr: "نظارة أطفال مرحة", category: "kids", color: "أخضر", image: "/glasses/kids/kids-3.png" },
  { id: 66, nameAr: "نظارة أطفال كلاسيكية", category: "kids", color: "بنفسجي", image: "/glasses/kids/kids-4.png" },
  { id: 67, nameAr: "نظارة أطفال رياضية", category: "kids", color: "أحمر", image: "/glasses/kids/kids-5.png" },
  { id: 68, nameAr: "نظارة أطفال شمس", category: "kids", color: "أصفر", image: "/glasses/kids/kids-6.png" },
  { id: 69, nameAr: "نظارة أطفال مريحة", category: "kids", color: "سماوي", image: "/glasses/kids/kids-7.png" },
];

// Keep backward compatibility aliases
export const GLASSES_STYLES = {
  frameTypes: [] as string[],
  categories: GLASSES_CATEGORIES.filter(c => c.id !== "all").map(c => ({
    id: c.id,
    label: c.label,
    icon: c.icon,
  })),
};

export function getGlassesSVG(): string {
  return "";
}

export function getFrameTypeLabel(frameType: string): string {
  return frameType;
}
