"use client";

export interface GlassesItem {
  id: number;
  nameAr: string;
  nameAr: string;
  category: "kids" | "women_regular" | "women_sun" | "men_regular" | "men_sun";
  frameType: string;
  gender: "kids" | "women" | "men";
  color: string;
  colorHex: string;
  price: number;
  image: string;
}

export const GLASSES_STYLES = {
  frameTypes: [
    "full-rim",
    "round",
    "square",
    "cat-eye",
    "wayfarer",
    "rimless",
    "half-rim",
    "aviator",
    "rectangle",
    "oval",
    "shield",
    "wrap",
  ],
  categories: [
    { id: "women_regular", label: "نسائي نظر", icon: "👓" },
    { id: "women_sun", label: "نسائي شمس", icon: "🕶️" },
    { id: "men_regular", label: "رجالي نظر", icon: "👓" },
    { id: "men_sun", label: "رجالي شمس", icon: "🕶️" },
    { id: "kids", label: "أطفال", icon: "👶" },
  ],
};

export const ALL_GLASSES: GlassesItem[] = [
  // ===== أطفال (Kids) IDs 1-8 =====
  {
    id: 1,
    nameAr: "نظارة أطفال ملونة",
    nameAr: "Colorful Kids Frame",
    category: "kids",
    frameType: "full-rim",
    gender: "kids",
    color: "وردي",
    colorHex: "#FF69B4",
    price: 250,
    image: "/glasses/child_01.png",
  },
  {
    id: 2,
    nameAr: "نظارة أطفال مستديرة",
    nameAr: "Round Kids Frame",
    category: "kids",
    frameType: "round",
    gender: "kids",
    color: "أزرق",
    colorHex: "#4A90D9",
    price: 275,
    image: "/glasses/child_02.png",
  },
  {
    id: 3,
    nameAr: "نظارة أطفال مستطيلة",
    nameAr: "Rectangle Kids Frame",
    category: "kids",
    frameType: "rectangle",
    gender: "kids",
    color: "أحمر",
    colorHex: "#E74C3C",
    price: 260,
    image: "/glasses/child_03.png",
  },
  {
    id: 4,
    nameAr: "نظارة أطفال كات آي",
    nameAr: "Cat-Eye Kids Frame",
    category: "kids",
    frameType: "cat-eye",
    gender: "kids",
    color: "أخضر",
    colorHex: "#2ECC71",
    price: 285,
    image: "/glasses/child_04.png",
  },
  {
    id: 5,
    nameAr: "نظارة أطفال أوفال",
    nameAr: "Oval Kids Frame",
    category: "kids",
    frameType: "oval",
    gender: "kids",
    color: "أصفر",
    colorHex: "#F1C40F",
    price: 245,
    image: "/glasses/child_05.png",
  },
  {
    id: 6,
    nameAr: "نظارة أطفال ويفارر",
    nameAr: "Wayfarer Kids Frame",
    category: "kids",
    frameType: "wayfarer",
    gender: "kids",
    color: "بنفسجي",
    colorHex: "#9B59B6",
    price: 290,
    image: "/glasses/child_06.png",
  },
  {
    id: 7,
    nameAr: "نظارة أطفال مربعة",
    nameAr: "Square Kids Frame",
    category: "kids",
    frameType: "square",
    gender: "kids",
    color: "برتقالي",
    colorHex: "#E67E22",
    price: 265,
    image: "/glasses/child_07.png",
  },
  {
    id: 8,
    nameAr: "نظارة أطفال نصف إطار",
    nameAr: "Half-Rim Kids Frame",
    category: "kids",
    frameType: "half-rim",
    gender: "kids",
    color: "سماوي",
    colorHex: "#00CED1",
    price: 255,
    image: "/glasses/child_08.png",
  },

  // ===== نسائي نظر (Women Regular) IDs 9-21 =====
  {
    id: 9,
    nameAr: "نظارة كات آي كلاسيكية",
    nameAr: "Classic Cat-Eye",
    category: "women_regular",
    frameType: "cat-eye",
    gender: "women",
    color: "أسود",
    colorHex: "#1a1a1a",
    price: 450,
    image: "/glasses/women_reg_01.png",
  },
  {
    id: 10,
    nameAr: "نظارة مستديرة أنيقة",
    nameAr: "Elegant Round Frame",
    category: "women_regular",
    frameType: "round",
    gender: "women",
    color: "بني",
    colorHex: "#8B4513",
    price: 420,
    image: "/glasses/women_reg_02.png",
  },
  {
    id: 11,
    nameAr: "نظارة سكوير عصرية",
    nameAr: "Modern Square Frame",
    category: "women_regular",
    frameType: "square",
    gender: "women",
    color: "عنابي",
    colorHex: "#800020",
    price: 480,
    image: "/glasses/women_reg_03.png",
  },
  {
    id: 12,
    nameAr: "نظارة مستطيلة نسائية",
    nameAr: "Women's Rectangle Frame",
    category: "women_regular",
    frameType: "rectangle",
    gender: "women",
    color: "ذهبي",
    colorHex: "#D4AF37",
    price: 520,
    image: "/glasses/women_reg_04.png",
  },
  {
    id: 13,
    nameAr: "نظارة أوفال رقيقة",
    nameAr: "Slim Oval Frame",
    category: "women_regular",
    frameType: "oval",
    gender: "women",
    color: "وردية ذهبية",
    colorHex: "#B76E79",
    price: 490,
    image: "/glasses/women_reg_05.png",
  },
  {
    id: 14,
    nameAr: "نظارة كاملة الإطار",
    nameAr: "Full-Rim Elegant Frame",
    category: "women_regular",
    frameType: "full-rim",
    gender: "women",
    color: "سلحفاة",
    colorHex: "#A0522D",
    price: 460,
    image: "/glasses/women_reg_06.png",
  },
  {
    id: 15,
    nameAr: "نظارة نصف إطار نسائية",
    nameAr: "Women's Half-Rim",
    category: "women_regular",
    frameType: "half-rim",
    gender: "women",
    color: "فضي",
    colorHex: "#C0C0C0",
    price: 440,
    image: "/glasses/women_reg_07.png",
  },
  {
    id: 16,
    nameAr: "نظارة ويفارر نسائية",
    nameAr: "Women's Wayfarer",
    category: "women_regular",
    frameType: "wayfarer",
    gender: "women",
    color: "أزرق داكن",
    colorHex: "#1B3A5C",
    price: 470,
    image: "/glasses/women_reg_08.png",
  },
  {
    id: 17,
    nameAr: "نظارة ريملس أنيقة",
    nameAr: "Elegant Rimless Frame",
    category: "women_regular",
    frameType: "rimless",
    gender: "women",
    color: "أبيض",
    colorHex: "#F5F5F5",
    price: 550,
    image: "/glasses/women_reg_09.png",
  },
  {
    id: 18,
    nameAr: "نظارة كات آي وردية",
    nameAr: "Pink Cat-Eye Frame",
    category: "women_regular",
    frameType: "cat-eye",
    gender: "women",
    color: "وردي",
    colorHex: "#FF69B4",
    price: 435,
    image: "/glasses/women_reg_10.png",
  },
  {
    id: 19,
    nameAr: "نظارة مستديرة بنفسجي",
    nameAr: "Purple Round Frame",
    category: "women_regular",
    frameType: "round",
    gender: "women",
    color: "بنفسجي",
    colorHex: "#6A0DAD",
    price: 445,
    image: "/glasses/women_reg_11.png",
  },
  {
    id: 20,
    nameAr: "نظارة أفاتور نسائية",
    nameAr: "Women's Aviator Frame",
    category: "women_regular",
    frameType: "aviator",
    gender: "women",
    color: "أحمر",
    colorHex: "#DC143C",
    price: 510,
    image: "/glasses/women_reg_12.png",
  },
  {
    id: 21,
    nameAr: "نظارة شفافة عصرية",
    nameAr: "Clear Modern Frame",
    category: "women_regular",
    frameType: "full-rim",
    gender: "women",
    color: "شفاف",
    colorHex: "#E8E8E8",
    price: 430,
    image: "/glasses/women_reg_13.png",
  },

  // ===== نسائي شمس (Women Sunglasses) IDs 22-33 =====
  {
    id: 22,
    nameAr: "نظارة شمس كات آي",
    nameAr: "Cat-Eye Sunglasses",
    category: "women_sun",
    frameType: "cat-eye",
    gender: "women",
    color: "أسود",
    colorHex: "#1a1a1a",
    price: 580,
    image: "/glasses/women_sun_01.png",
  },
  {
    id: 23,
    nameAr: "نظارة شمس ويفارر",
    nameAr: "Wayfarer Sunglasses",
    category: "women_sun",
    frameType: "wayfarer",
    gender: "women",
    color: "بني",
    colorHex: "#5C4033",
    price: 550,
    image: "/glasses/women_sun_02.png",
  },
  {
    id: 24,
    nameAr: "نظارة شمس أوفال",
    nameAr: "Oval Sunglasses",
    category: "women_sun",
    frameType: "oval",
    gender: "women",
    color: "ذهبي",
    colorHex: "#D4AF37",
    price: 620,
    image: "/glasses/women_sun_03.png",
  },
  {
    id: 25,
    nameAr: "نظارة شمس مستديرة",
    nameAr: "Round Sunglasses",
    category: "women_sun",
    frameType: "round",
    gender: "women",
    color: "أحمر",
    colorHex: "#B22222",
    price: 560,
    image: "/glasses/women_sun_04.png",
  },
  {
    id: 26,
    nameAr: "نظارة شمس شيلد",
    nameAr: "Shield Sunglasses",
    category: "women_sun",
    frameType: "shield",
    gender: "women",
    color: "أسود مات",
    colorHex: "#2C2C2C",
    price: 640,
    image: "/glasses/women_sun_05.png",
  },
  {
    id: 27,
    nameAr: "نظارة شمس مستطيلة",
    nameAr: "Rectangle Sunglasses",
    category: "women_sun",
    frameType: "rectangle",
    gender: "women",
    color: "سلحفاة",
    colorHex: "#8B4513",
    price: 590,
    image: "/glasses/women_sun_06.png",
  },
  {
    id: 28,
    nameAr: "نظارة شمس أفاتور نسائية",
    nameAr: "Women's Aviator Sunglasses",
    category: "women_sun",
    frameType: "aviator",
    gender: "women",
    color: "ذهبي روز",
    colorHex: "#B76E79",
    price: 650,
    image: "/glasses/women_sun_07.png",
  },
  {
    id: 29,
    nameAr: "نظارة شمس كاملة",
    nameAr: "Full-Rim Sunglasses",
    category: "women_sun",
    frameType: "full-rim",
    gender: "women",
    color: "وردي",
    colorHex: "#FF1493",
    price: 570,
    image: "/glasses/women_sun_08.png",
  },
  {
    id: 30,
    nameAr: "نظارة شمس ويفارر كبيرة",
    nameAr: "Oversized Wayfarer",
    category: "women_sun",
    frameType: "wayfarer",
    gender: "women",
    color: "أبيض",
    colorHex: "#FAFAFA",
    price: 600,
    image: "/glasses/women_sun_09.png",
  },
  {
    id: 31,
    nameAr: "نظارة شمس ماركيزة",
    nameAr: "Marquise Sunglasses",
    category: "women_sun",
    frameType: "oval",
    gender: "women",
    color: "بنفسجي",
    colorHex: "#4B0082",
    price: 610,
    image: "/glasses/women_sun_10.png",
  },
  {
    id: 32,
    nameAr: "نظارة شمس بترولجي",
    nameAr: "Butterfly Sunglasses",
    category: "women_sun",
    frameType: "cat-eye",
    gender: "women",
    color: "أسود وذهبي",
    colorHex: "#1C1C1C",
    price: 630,
    image: "/glasses/women_sun_11.png",
  },
  {
    id: 33,
    nameAr: "نظارة شمس راب نسائية",
    nameAr: "Women's Wrap Sunglasses",
    category: "women_sun",
    frameType: "wrap",
    gender: "women",
    color: "أزرق داكن",
    colorHex: "#191970",
    price: 595,
    image: "/glasses/women_sun_12.png",
  },

  // ===== رجالي نظر (Men Regular) IDs 34-50 =====
  {
    id: 34,
    nameAr: "نظارة رجالية كلاسيكية",
    nameAr: "Classic Men's Frame",
    category: "men_regular",
    frameType: "full-rim",
    gender: "men",
    color: "أسود",
    colorHex: "#1a1a1a",
    price: 480,
    image: "/glasses/men_reg_01.png",
  },
  {
    id: 35,
    nameAr: "نظارة مستطيلة رجالية",
    nameAr: "Men's Rectangle Frame",
    category: "men_regular",
    frameType: "rectangle",
    gender: "men",
    color: "بني",
    colorHex: "#5C4033",
    price: 460,
    image: "/glasses/men_reg_02.png",
  },
  {
    id: 36,
    nameAr: "نظارة أفاتور رجالية",
    nameAr: "Men's Aviator Frame",
    category: "men_regular",
    frameType: "aviator",
    gender: "men",
    color: "ذهبي",
    colorHex: "#B8860B",
    price: 520,
    image: "/glasses/men_reg_03.png",
  },
  {
    id: 37,
    nameAr: "نظارة ويفارر رجالية",
    nameAr: "Men's Wayfarer",
    category: "men_regular",
    frameType: "wayfarer",
    gender: "men",
    color: "أسود",
    colorHex: "#0D0D0D",
    price: 500,
    image: "/glasses/men_reg_04.png",
  },
  {
    id: 38,
    nameAr: "نظارة مستديرة رجالية",
    nameAr: "Men's Round Frame",
    category: "men_regular",
    frameType: "round",
    gender: "men",
    color: "أسود مات",
    colorHex: "#2C2C2C",
    price: 470,
    image: "/glasses/men_reg_05.png",
  },
  {
    id: 39,
    nameAr: "نظارة أوفال رجالية",
    nameAr: "Men's Oval Frame",
    category: "men_regular",
    frameType: "oval",
    gender: "men",
    color: "بني غامق",
    colorHex: "#3E2723",
    price: 490,
    image: "/glasses/men_reg_06.png",
  },
  {
    id: 40,
    nameAr: "نظارة نصف إطار رجالية",
    nameAr: "Men's Half-Rim Frame",
    category: "men_regular",
    frameType: "half-rim",
    gender: "men",
    color: "فضي",
    colorHex: "#A8A8A8",
    price: 510,
    image: "/glasses/men_reg_07.png",
  },
  {
    id: 41,
    nameAr: "نظارة سكوير رجالية",
    nameAr: "Men's Square Frame",
    category: "men_regular",
    frameType: "square",
    gender: "men",
    color: "أسود",
    colorHex: "#1a1a1a",
    price: 475,
    image: "/glasses/men_reg_08.png",
  },
  {
    id: 42,
    nameAr: "نظارة ريملس رجالية",
    nameAr: "Men's Rimless Frame",
    category: "men_regular",
    frameType: "rimless",
    gender: "men",
    color: "معدني",
    colorHex: "#808080",
    price: 560,
    image: "/glasses/men_reg_09.png",
  },
  {
    id: 43,
    nameAr: "نظارة كاملة رجالية",
    nameAr: "Men's Full-Rim Frame",
    category: "men_regular",
    frameType: "full-rim",
    gender: "men",
    color: "سلحفاة",
    colorHex: "#6B3A2A",
    price: 495,
    image: "/glasses/men_reg_10.png",
  },
  {
    id: 44,
    nameAr: "نظارة مستطيلة معدنية",
    nameAr: "Metal Rectangle Frame",
    category: "men_regular",
    frameType: "rectangle",
    gender: "men",
    color: "رمادي غامق",
    colorHex: "#4A4A4A",
    price: 530,
    image: "/glasses/men_reg_11.png",
  },
  {
    id: 45,
    nameAr: "نظارة برواز رجالي",
    nameAr: "Men's Browline Frame",
    category: "men_regular",
    frameType: "half-rim",
    gender: "men",
    color: "أسود وذهبي",
    colorHex: "#1C1C1C",
    price: 505,
    image: "/glasses/men_reg_12.png",
  },
  {
    id: 46,
    nameAr: "نظارة أوفال معدنية",
    nameAr: "Metal Oval Frame",
    category: "men_regular",
    frameType: "oval",
    gender: "men",
    color: "ذهبي",
    colorHex: "#DAA520",
    price: 540,
    image: "/glasses/men_reg_13.png",
  },
  {
    id: 47,
    nameAr: "نظارة كات آي رجالية",
    nameAr: "Men's Cat-Eye Frame",
    category: "men_regular",
    frameType: "cat-eye",
    gender: "men",
    color: "أسود",
    colorHex: "#111111",
    price: 485,
    image: "/glasses/men_reg_14.png",
  },
  {
    id: 48,
    nameAr: "نظارة مستديرة بنيتون",
    nameAr: "Brown Round Frame",
    category: "men_regular",
    frameType: "round",
    gender: "men",
    color: "بني",
    colorHex: "#8B6914",
    price: 465,
    image: "/glasses/men_reg_15.png",
  },
  {
    id: 49,
    nameAr: "نظارة أفاتور معدنية",
    nameAr: "Metal Aviator Frame",
    category: "men_regular",
    frameType: "aviator",
    gender: "men",
    color: "فولاذي",
    colorHex: "#708090",
    price: 545,
    image: "/glasses/men_reg_16.png",
  },
  {
    id: 50,
    nameAr: "نظارة سكوير كبيرة",
    nameAr: "Large Square Frame",
    category: "men_regular",
    frameType: "square",
    gender: "men",
    color: "كحلي",
    colorHex: "#1B2A4A",
    price: 488,
    image: "/glasses/men_reg_17.png",
  },

  // ===== رجالي شمس (Men Sunglasses) IDs 51-68 =====
  {
    id: 51,
    nameAr: "نظارة شمس رجالية كلاسيكية",
    nameAr: "Classic Men's Sunglasses",
    category: "men_sun",
    frameType: "aviator",
    gender: "men",
    color: "ذهبي",
    colorHex: "#B8860B",
    price: 650,
    image: "/glasses/men_sun_01.png",
  },
  {
    id: 52,
    nameAr: "نظارة شمس ويفارر رجالية",
    nameAr: "Men's Wayfarer Sunglasses",
    category: "men_sun",
    frameType: "wayfarer",
    gender: "men",
    color: "أسود",
    colorHex: "#0D0D0D",
    price: 620,
    image: "/glasses/men_sun_02.png",
  },
  {
    id: 53,
    nameAr: "نظارة شمس أفاتور رجالية",
    nameAr: "Men's Aviator Sunglasses",
    category: "men_sun",
    frameType: "aviator",
    gender: "men",
    color: "فضي",
    colorHex: "#C0C0C0",
    price: 670,
    image: "/glasses/men_sun_03.png",
  },
  {
    id: 54,
    nameAr: "نظارة شمس مستديرة رجالية",
    nameAr: "Men's Round Sunglasses",
    category: "men_sun",
    frameType: "round",
    gender: "men",
    color: "أسود مات",
    colorHex: "#2C2C2C",
    price: 590,
    image: "/glasses/men_sun_04.png",
  },
  {
    id: 55,
    nameAr: "نظارة شمس مستطيلة رجالية",
    nameAr: "Men's Rectangle Sunglasses",
    category: "men_sun",
    frameType: "rectangle",
    gender: "men",
    color: "بني",
    colorHex: "#5C4033",
    price: 610,
    image: "/glasses/men_sun_05.png",
  },
  {
    id: 56,
    nameAr: "نظارة شمس سكوير رجالية",
    nameAr: "Men's Square Sunglasses",
    category: "men_sun",
    frameType: "square",
    gender: "men",
    color: "أسود",
    colorHex: "#1a1a1a",
    price: 630,
    image: "/glasses/men_sun_06.png",
  },
  {
    id: 57,
    nameAr: "نظارة شمس شيلد رجالية",
    nameAr: "Men's Shield Sunglasses",
    category: "men_sun",
    frameType: "shield",
    gender: "men",
    color: "أسود",
    colorHex: "#111111",
    price: 700,
    image: "/glasses/men_sun_07.png",
  },
  {
    id: 58,
    nameAr: "نظارة شمس راب رجالية",
    nameAr: "Men's Wrap Sunglasses",
    category: "men_sun",
    frameType: "wrap",
    gender: "men",
    color: "رمادي",
    colorHex: "#555555",
    price: 660,
    image: "/glasses/men_sun_08.png",
  },
  {
    id: 59,
    nameAr: "نظارة شمس أوفال رجالية",
    nameAr: "Men's Oval Sunglasses",
    category: "men_sun",
    frameType: "oval",
    gender: "men",
    color: "ذهبي",
    colorHex: "#DAA520",
    price: 640,
    image: "/glasses/men_sun_09.png",
  },
  {
    id: 60,
    nameAr: "نظارة شمس ويفارر كبيرة",
    nameAr: "Oversized Men's Wayfarer",
    category: "men_sun",
    frameType: "wayfarer",
    gender: "men",
    color: "سلحفاة",
    colorHex: "#6B3A2A",
    price: 645,
    image: "/glasses/men_sun_10.png",
  },
  {
    id: 61,
    nameAr: "نظارة شمس كاملة رجالية",
    nameAr: "Men's Full-Rim Sunglasses",
    category: "men_sun",
    frameType: "full-rim",
    gender: "men",
    color: "أزرق داكن",
    colorHex: "#191970",
    price: 615,
    image: "/glasses/men_sun_11.png",
  },
  {
    id: 62,
    nameAr: "نظارة شمس رياضية",
    nameAr: "Sports Sunglasses",
    category: "men_sun",
    frameType: "wrap",
    gender: "men",
    color: "أحمر وأسود",
    colorHex: "#B22222",
    price: 720,
    image: "/glasses/men_sun_12.png",
  },
  {
    id: 63,
    nameAr: "نظارة شمس رجالية بيست",
    nameAr: "Men's Clubmaster Sunglasses",
    category: "men_sun",
    frameType: "half-rim",
    gender: "men",
    color: "أسود وذهبي",
    colorHex: "#1C1C1C",
    price: 680,
    image: "/glasses/men_sun_13.png",
  },
  {
    id: 64,
    nameAr: "نظارة شمس رجالية ناعمة",
    nameAr: "Slim Men's Sunglasses",
    category: "men_sun",
    frameType: "rectangle",
    gender: "men",
    color: "رمادي غامق",
    colorHex: "#4A4A4A",
    price: 625,
    image: "/glasses/men_sun_14.png",
  },
  {
    id: 65,
    nameAr: "نظارة شمس أفاتور كبيرة",
    nameAr: "Oversized Aviator Sunglasses",
    category: "men_sun",
    frameType: "aviator",
    gender: "men",
    color: "أسود",
    colorHex: "#0D0D0D",
    price: 690,
    image: "/glasses/men_sun_15.png",
  },
  {
    id: 66,
    nameAr: "نظارة شمس كلاسيكية بنية",
    nameAr: "Classic Brown Sunglasses",
    category: "men_sun",
    frameType: "full-rim",
    gender: "men",
    color: "بني",
    colorHex: "#4A3728",
    price: 605,
    image: "/glasses/men_sun_16.png",
  },
  {
    id: 67,
    nameAr: "نظارة شمس رجالية كربون",
    nameAr: "Carbon Fiber Sunglasses",
    category: "men_sun",
    frameType: "shield",
    gender: "men",
    color: "كربون",
    colorHex: "#333333",
    price: 750,
    image: "/glasses/men_sun_17.png",
  },
  {
    id: 68,
    nameAr: "نظارة شمس رجالية فاخرة",
    nameAr: "Luxury Men's Sunglasses",
    category: "men_sun",
    frameType: "rectangle",
    gender: "men",
    color: "أسود وفضي",
    colorHex: "#1a1a1a",
    price: 780,
    image: "/glasses/men_sun_18.png",
  },
];

/**
 * Generates an SVG illustration for glasses based on frame type and color.
 */
export function getGlassesSVG(
  frameType: string,
  color: string,
  size: number = 200
): string {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const frameWidth = 3;
  const lensOpacity = "0.15";
  const isSun =
    frameType === "shield" ||
    frameType === "wrap" ||
    color.includes("شمس");

  const lensFill = isSun
    ? "rgba(30,30,30,0.7)"
    : `rgba(200,220,255,${lensOpacity})`;

  function getFramePath(): string {
    switch (frameType) {
      case "round":
        return `
          <ellipse cx="${cx - 32}" cy="${cy}" rx="28" ry="28" 
            fill="${lensFill}" stroke="${color}" stroke-width="${frameWidth}" />
          <ellipse cx="${cx + 32}" cy="${cy}" rx="28" ry="28" 
            fill="${lensFill}" stroke="${color}" stroke-width="${frameWidth}" />
        `;
      case "square":
        return `
          <rect x="${cx - 60}" y="${cy - 24}" width="52" height="48" rx="6"
            fill="${lensFill}" stroke="${color}" stroke-width="${frameWidth}" />
          <rect x="${cx + 8}" y="${cy - 24}" width="52" height="48" rx="6"
            fill="${lensFill}" stroke="${color}" stroke-width="${frameWidth}" />
        `;
      case "cat-eye":
        return `
          <path d="M${cx - 58},${cy + 4} Q${cx - 58},${cy - 28} ${cx - 34},${cy - 28} 
            Q${cx - 10},${cy - 28} ${cx - 8},${cy} Q${cx - 10},${cy + 24} ${cx - 34},${cy + 24} 
            Q${cx - 58},${cy + 24} ${cx - 58},${cy + 4} Z"
            fill="${lensFill}" stroke="${color}" stroke-width="${frameWidth}" />
          <path d="M${cx + 58},${cy + 4} Q${cx + 58},${cy - 28} ${cx + 34},${cy - 28} 
            Q${cx + 10},${cy - 28} ${cx + 8},${cy} Q${cx + 10},${cy + 24} ${cx + 34},${cy + 24} 
            Q${cx + 58},${cy + 24} ${cx + 58},${cy + 4} Z"
            fill="${lensFill}" stroke="${color}" stroke-width="${frameWidth}" />
        `;
      case "aviator":
        return `
          <path d="M${cx - 58},${cy - 2} Q${cx - 58},${cy - 30} ${cx - 32},${cy - 30} 
            Q${cx - 8},${cy - 26} ${cx - 8},${cy + 2} Q${cx - 10},${cy + 26} ${cx - 34},${cy + 26} 
            Q${cx - 60},${cy + 26} ${cx - 58},${cy - 2} Z"
            fill="${lensFill}" stroke="${color}" stroke-width="${frameWidth}" />
          <path d="M${cx + 58},${cy - 2} Q${cx + 58},${cy - 30} ${cx + 32},${cy - 30} 
            Q${cx + 8},${cy - 26} ${cx + 8},${cy + 2} Q${cx + 10},${cy + 26} ${cx + 34},${cy + 26} 
            Q${cx + 60},${cy + 26} ${cx + 58},${cy - 2} Z"
            fill="${lensFill}" stroke="${color}" stroke-width="${frameWidth}" />
        `;
      case "wayfarer":
        return `
          <path d="M${cx - 60},${cy - 8} L${cx - 56},${cy - 26} 
            Q${cx - 32},${cy - 30} ${cx - 10},${cy - 20} L${cx - 8},${cy - 16}
            Q${cx - 8},${cy + 26} ${cx - 32},${cy + 26} Q${cx - 62},${cy + 24} ${cx - 60},${cy - 8} Z"
            fill="${lensFill}" stroke="${color}" stroke-width="${frameWidth}" />
          <path d="M${cx + 60},${cy - 8} L${cx + 56},${cy - 26} 
            Q${cx + 32},${cy - 30} ${cx + 10},${cy - 20} L${cx + 8},${cy - 16}
            Q${cx + 8},${cy + 26} ${cx + 32},${cy + 26} Q${cx + 62},${cy + 24} ${cx + 60},${cy - 8} Z"
            fill="${lensFill}" stroke="${color}" stroke-width="${frameWidth}" />
        `;
      case "rimless":
        return `
          <ellipse cx="${cx - 32}" cy="${cy}" rx="28" ry="26"
            fill="${lensFill}" stroke="${color}" stroke-width="1.5" stroke-dasharray="4 3" />
          <ellipse cx="${cx + 32}" cy="${cy}" rx="28" ry="26"
            fill="${lensFill}" stroke="${color}" stroke-width="1.5" stroke-dasharray="4 3" />
          <circle cx="${cx - 58}" cy="${cy - 8}" r="3" fill="${color}" />
          <circle cx="${cx + 58}" cy="${cy - 8}" r="3" fill="${color}" />
        `;
      case "half-rim":
        return `
          <path d="M${cx - 58},${cy} Q${cx - 58},${cy - 26} ${cx - 32},${cy - 26} 
            Q${cx - 8},${cy - 26} ${cx - 8},${cy}"
            fill="none" stroke="${color}" stroke-width="${frameWidth + 1}" />
          <path d="M${cx + 58},${cy} Q${cx + 58},${cy - 26} ${cx + 32},${cy - 26} 
            Q${cx + 8},${cy - 26} ${cx + 8},${cy}"
            fill="none" stroke="${color}" stroke-width="${frameWidth + 1}" />
          <path d="M${cx - 8},${cy} Q${cx - 8},${cy + 26} ${cx - 32},${cy + 26} 
            Q${cx - 58},${cy + 26} ${cx - 58},${cy}"
            fill="${lensFill}" stroke="none" />
          <path d="M${cx + 8},${cy} Q${cx + 8},${cy + 26} ${cx + 32},${cy + 26} 
            Q${cx + 58},${cy + 26} ${cx + 58},${cy}"
            fill="${lensFill}" stroke="none" />
        `;
      case "rectangle":
        return `
          <rect x="${cx - 60}" y="${cy - 18}" width="50" height="36" rx="4"
            fill="${lensFill}" stroke="${color}" stroke-width="${frameWidth}" />
          <rect x="${cx + 10}" y="${cy - 18}" width="50" height="36" rx="4"
            fill="${lensFill}" stroke="${color}" stroke-width="${frameWidth}" />
        `;
      case "oval":
        return `
          <ellipse cx="${cx - 32}" cy="${cy}" rx="30" ry="22"
            fill="${lensFill}" stroke="${color}" stroke-width="${frameWidth}" />
          <ellipse cx="${cx + 32}" cy="${cy}" rx="30" ry="22"
            fill="${lensFill}" stroke="${color}" stroke-width="${frameWidth}" />
        `;
      case "shield":
        return `
          <path d="M${cx - 58},${cy - 10} Q${cx - 58},${cy - 28} ${cx},${cy - 32} 
            Q${cx + 58},${cy - 28} ${cx + 58},${cy - 10} Q${cx + 56},${cy + 22} ${cx},${cy + 28} 
            Q${cx - 56},${cy + 22} ${cx - 58},${cy - 10} Z"
            fill="${lensFill}" stroke="${color}" stroke-width="${frameWidth + 1}" />
        `;
      case "wrap":
        return `
          <path d="M${cx - 56},${cy - 6} Q${cx - 56},${cy - 24} ${cx - 32},${cy - 26} 
            Q${cx - 6},${cy - 28} ${cx + 6},${cy - 26} Q${cx + 32},${cy - 24} ${cx + 56},${cy - 18} 
            Q${cx + 58},${cy + 4} ${cx + 56},${cy + 22} Q${cx + 32},${cy + 26} ${cx + 6},${cy + 26} 
            Q${cx - 6},${cy + 26} ${cx - 32},${cy + 24} Q${cx - 58},${cy + 22} ${cx - 56},${cy - 6} Z"
            fill="${lensFill}" stroke="${color}" stroke-width="${frameWidth + 1}" />
        `;
      case "full-rim":
      default:
        return `
          <rect x="${cx - 58}" y="${cy - 22}" width="48" height="44" rx="8"
            fill="${lensFill}" stroke="${color}" stroke-width="${frameWidth}" />
          <rect x="${cx + 10}" y="${cy - 22}" width="48" height="44" rx="8"
            fill="${lensFill}" stroke="${color}" stroke-width="${frameWidth}" />
        `;
    }
  }

  // Bridge and temples
  const bridge = frameType === "shield" || frameType === "wrap"
    ? ""
    : `<path d="M${cx - 6},${cy - 4} Q${cx},${cy - 12} ${cx + 6},${cy - 4}" 
        fill="none" stroke="${color}" stroke-width="${frameWidth - 0.5}" />`;

  const temples = frameType === "shield" || frameType === "wrap"
    ? `<path d="M${cx - 58},${cy - 10} L${cx - 76},${cy - 14}" stroke="${color}" stroke-width="2.5" stroke-linecap="round" />
       <path d="M${cx + 58},${cy - 10} L${cx + 76},${cy - 14}" stroke="${color}" stroke-width="2.5" stroke-linecap="round" />`
    : `<path d="M${cx - 60},${cy - 16} L${cx - 78},${cy - 20}" stroke="${color}" stroke-width="2.5" stroke-linecap="round" />
       <path d="M${cx + 60},${cy - 16} L${cx + 78},${cy - 20}" stroke="${color}" stroke-width="2.5" stroke-linecap="round" />`;

  return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg">
    ${getFramePath()}
    ${bridge}
    ${temples}
  </svg>`;
}

export function getFrameTypeLabel(frameType: string): string {
  const labels: Record<string, string> = {
    "full-rim": "إطار كامل",
    round: "مستدير",
    square: "مربع",
    "cat-eye": "كات آي",
    wayfarer: "ويفارر",
    rimless: "بدون إطار",
    "half-rim": "نصف إطار",
    aviator: "أفاتور",
    rectangle: "مستطيل",
    oval: "أوفال",
    shield: "شيلد",
    wrap: "راب",
  };
  return labels[frameType] || frameType;
}
