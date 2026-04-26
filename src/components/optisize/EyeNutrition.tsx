"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Carrot,
  Fish,
  Leaf,
  Citrus,
  Nut,
  Egg,
  Save,
  Calendar,
  Sparkles,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface EyeNutritionProps {
  onBack: () => void;
}

interface Nutrient {
  id: string;
  name: string;
  nameEn: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  dailyAmount: string;
  benefit: string;
  foods: string[];
}

interface DayMeal {
  breakfast: string[];
  lunch: string[];
  dinner: string[];
}

const nutrients: Nutrient[] = [
  {
    id: "vitamin-a",
    name: "فيتامين A",
    nameEn: "Vitamin A",
    icon: Carrot,
    color: "#ffa500",
    gradient: "linear-gradient(135deg, #ffa500, #ff6b00)",
    dailyAmount: "900 ميكروغرام (رجال) / 700 ميكروغرام (نساء)",
    benefit: "ضروري لصحة الشبكية والرؤية الليلية. يحمي سطح العين ويمنع جفافها",
    foods: ["جزر", "بطاطا حلوة", "سبانخ", "كبد", "بيض"],
  },
  {
    id: "omega-3",
    name: "أوميجا 3",
    nameEn: "Omega-3",
    icon: Fish,
    color: "#0080ff",
    gradient: "linear-gradient(135deg, #0080ff, #0050cc)",
    dailyAmount: "250-500 ملغ (EPA + DHA)",
    benefit: "يقلل خطر التنكس البقعي المرتبط بالعمر ويحارب جفاف العين",
    foods: ["سمك سلمون", "تونة", "سردين", "بذور شيا", "جوز"],
  },
  {
    id: "lutein",
    name: "لوتين",
    nameEn: "Lutein",
    icon: Leaf,
    color: "#00d4aa",
    gradient: "linear-gradient(135deg, #00d4aa, #00a88a)",
    dailyAmount: "10 ملغ يومياً",
    benefit: "يعمل كفلتر طبيعي للضوء الأزرق ويحمي البقعة الصفراء من التلف",
    foods: ["سبانخ", "كراث", "بروكلي", "كيوي", "عنب"],
  },
  {
    id: "vitamin-c",
    name: "فيتامين C",
    nameEn: "Vitamin C",
    icon: Citrus,
    color: "#ff3b30",
    gradient: "linear-gradient(135deg, #ff3b30, #ff6b6b)",
    dailyAmount: "90 ملغ (رجال) / 75 ملغ (نساء)",
    benefit: "مضاد أكسدة قوي يحمي العين من أضرار الجذور الحرة ويساعد في صحة الأوعية الدموية",
    foods: ["برتقال", "فلفل أحمر", "فراولة", "كيوي", "بروكلي"],
  },
  {
    id: "vitamin-e",
    name: "فيتامين E",
    nameEn: "Vitamin E",
    icon: Nut,
    color: "#a855f7",
    gradient: "linear-gradient(135deg, #a855f7, #6366f1)",
    dailyAmount: "15 ملغ يومياً",
    benefit: "مضاد أكسدة يحمي خلايا العين من التلف ويقلل خطر إعتام عدسة العين",
    foods: ["لوز", "بذور عباد الشمس", "أفوكادو", "سبانخ", "فول سوداني"],
  },
  {
    id: "zinc",
    name: "زنك",
    nameEn: "Zinc",
    icon: Egg,
    color: "#00f0ff",
    gradient: "linear-gradient(135deg, #00f0ff, #0080ff)",
    dailyAmount: "11 ملغ (رجال) / 8 ملغ (نساء)",
    benefit: "يساعد فيتامين A على الوصول للشبكية ويحمي من التنكس البقعي",
    foods: ["محار", "لحم بقر", "بذور يقطين", "عدس", "بيض"],
  },
];

const weeklyMealPlan: Record<string, DayMeal> = {
  السبت: {
    breakfast: ["عصير جزر", "بيض مسلوق", "خبز أسمر"],
    lunch: ["سمك سلمون مشوي", "سلطة سبانخ", "أرز بني"],
    dinner: ["شوربة عدس", "سلطة فلفل ألوان", "خبز"],
  },
  الأحد: {
    breakfast: ["شوفان بالتوت", "موز", "جوز"],
    lunch: ["صدر دجاج", "بروكلي سوتيه", "بطاطا حلوة"],
    dinner: ["تونة مشوية", "سلطة طماطم", "خبز أسمر"],
  },
  الاثنين: {
    breakfast: ["أفوكادو توست", "بيض", "برتقال"],
    lunch: ["سمك سردين", "سلطة كرنب", "أرز"],
    dinner: ["شوربة سبانخ", "جبن قريش", "خبز"],
  },
  الثلاثاء: {
    breakfast: ["سموذي سبانخ وموز", "لوز", "كيوي"],
    lunch: ["لحم بقر مشوي", "سلطة جزر", "بطاطا حلوة"],
    dinner: ["سلطة تونة", "بيض مسلوق", "خبز أسمر"],
  },
  الأربعاء: {
    breakfast: ["عصير برتقال", "شوفان", "بذور عباد الشمس"],
    lunch: ["دجاج مشوي", "بروكلي", "أرز بني"],
    dinner: ["شوربة جزر", "جبنة", "خبز"],
  },
  الخميس: {
    breakfast: ["بيض بأفوكادو", "فلفل أحمر", "خبز"],
    lunch: ["سمك سلمون", "سلطة خضراء", "بطاطا"],
    dinner: ["فول مدمس", "طماطم", "زيت زيتون"],
  },
  الجمعة: {
    breakfast: ["فواكه مشكلة", "زبادي باللوز", "عسل"],
    lunch: ["مشويات مشكلة", "سلطة طازجة", "أرز"],
    dinner: ["شوربة خضار", "جبن", "خبز أسمر"],
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export default function EyeNutrition({ onBack }: EyeNutritionProps) {
  const { toast } = useToast();
  const [selectedNutrient, setSelectedNutrient] = useState<string | null>(null);
  const [showMealPlan, setShowMealPlan] = useState(false);

  const handleSaveMealPlan = useCallback(() => {
    try {
      localStorage.setItem(
        "optisize-meal-plan",
        JSON.stringify({
          plan: weeklyMealPlan,
          savedAt: new Date().toISOString(),
        })
      );
      toast({
        title: "تم الحفظ",
        description: "تم حفظ جدول الوجبات الأسبوعي بنجاح",
      });
    } catch {
      toast({
        title: "خطأ",
        description: "لم يتم حفظ البيانات",
      });
    }
  }, [toast]);

  const days = Object.keys(weeklyMealPlan);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#0a0e1a" }}
    >
      {/* Background decoration */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(255,165,0,0.05) 0%, transparent 50%)",
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between p-4 relative z-10">
        <Button
          onClick={onBack}
          variant="ghost"
          size="icon"
          className="w-10 h-10 rounded-xl hover:bg-white/5"
          style={{ color: "#94a3b8" }}
        >
          <ArrowRight className="w-5 h-5" />
        </Button>
        <div className="text-center">
          <h1 className="text-base font-bold" style={{ color: "#e2e8f0" }}>
            تغذية العين
          </h1>
          <p className="text-xs" style={{ color: "#64748b" }}>
            Eye Nutrition
          </p>
        </div>
        <Button
          onClick={() => setShowMealPlan(!showMealPlan)}
          variant="ghost"
          size="icon"
          className="w-10 h-10 rounded-xl hover:bg-white/5"
          style={{ color: "#94a3b8" }}
        >
          <Calendar className="w-5 h-5" />
        </Button>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 px-4 pb-8 relative z-10 overflow-y-auto"
      >
        {/* Intro */}
        <motion.div variants={itemVariants} className="mb-4">
          <div className="glass-card rounded-xl p-4 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg, #ffa500, #ff6b00)",
              }}
            >
              <Sparkles className="w-5 h-5" style={{ color: "#0a0e1a" }} />
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "#94a3b8" }}>
              التغذية السليمة تلعب دوراً مهماً في صحة العين. تعرّف على العناصر
              الغذائية الأساسية وأفضل مصادرها
            </p>
          </div>
        </motion.div>

        {/* Meal Plan Toggle */}
        {showMealPlan ? (
          <motion.div variants={itemVariants} className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <p
                className="text-sm font-semibold"
                style={{ color: "#e2e8f0" }}
              >
                📅 جدول الوجبات الأسبوعي
              </p>
              <Button
                onClick={handleSaveMealPlan}
                className="h-8 px-3 text-xs rounded-lg"
                style={{
                  background: "rgba(0,212,170,0.1)",
                  border: "1px solid rgba(0,212,170,0.2)",
                  color: "#00d4aa",
                }}
              >
                <Save className="w-3 h-3 ml-1" />
                حفظ
              </Button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
              {days.map((day) => {
                const meals = weeklyMealPlan[day];
                return (
                  <div key={day} className="glass-card rounded-xl p-3">
                    <p
                      className="text-xs font-semibold mb-2"
                      style={{ color: "#00f0ff" }}
                    >
                      {day}
                    </p>
                    <div className="space-y-1.5">
                      <div className="flex items-start gap-2">
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded shrink-0 mt-0.5"
                          style={{
                            background: "rgba(255,165,0,0.1)",
                            color: "#ffa500",
                          }}
                        >
                          فطور
                        </span>
                        <p className="text-[11px]" style={{ color: "#94a3b8" }}>
                          {meals.breakfast.join(" • ")}
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded shrink-0 mt-0.5"
                          style={{
                            background: "rgba(0,212,170,0.1)",
                            color: "#00d4aa",
                          }}
                        >
                          غداء
                        </span>
                        <p className="text-[11px]" style={{ color: "#94a3b8" }}>
                          {meals.lunch.join(" • ")}
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded shrink-0 mt-0.5"
                          style={{
                            background: "rgba(168,85,247,0.1)",
                            color: "#a855f7",
                          }}
                        >
                          عشاء
                        </span>
                        <p className="text-[11px]" style={{ color: "#94a3b8" }}>
                          {meals.dinner.join(" • ")}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <>
            {/* Nutrient Cards */}
            <div className="space-y-3">
              {nutrients.map((nutrient) => (
                <motion.div
                  key={nutrient.id}
                  variants={itemVariants}
                >
                  <motion.button
                    onClick={() =>
                      setSelectedNutrient(
                        selectedNutrient === nutrient.id
                          ? null
                          : nutrient.id
                      )
                    }
                    className="w-full glass-card rounded-xl p-4 text-right transition-all"
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: nutrient.gradient }}
                      >
                        <nutrient.icon
                          className="w-6 h-6"
                          style={{ color: "#0a0e1a" }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-semibold"
                          style={{ color: "#e2e8f0" }}
                        >
                          {nutrient.name}
                        </p>
                        <p
                          className="text-[10px] mt-0.5"
                          style={{ color: nutrient.color }}
                        >
                          {nutrient.nameEn}
                        </p>
                        <p
                          className="text-xs mt-1 line-clamp-1"
                          style={{ color: "#94a3b8" }}
                        >
                          {nutrient.benefit}
                        </p>
                      </div>
                      <Eye
                        className="w-4 h-4 shrink-0"
                        style={{
                          color:
                            selectedNutrient === nutrient.id
                              ? nutrient.color
                              : "#64748b",
                        }}
                      />
                    </div>
                  </motion.button>

                  {/* Expanded details */}
                  {selectedNutrient === nutrient.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div
                        className="rounded-xl p-4 mt-2 space-y-3"
                        style={{
                          background: `${nutrient.color}06`,
                          border: `1px solid ${nutrient.color}15`,
                        }}
                      >
                        {/* Daily Amount */}
                        <div>
                          <p
                            className="text-[10px] font-medium mb-1"
                            style={{ color: nutrient.color }}
                          >
                            الكمية اليومية الموصى بها
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: "#e2e8f0" }}
                          >
                            {nutrient.dailyAmount}
                          </p>
                        </div>

                        {/* Benefit */}
                        <div>
                          <p
                            className="text-[10px] font-medium mb-1"
                            style={{ color: nutrient.color }}
                          >
                            الفائدة للعين
                          </p>
                          <p
                            className="text-xs leading-relaxed"
                            style={{ color: "#94a3b8" }}
                          >
                            {nutrient.benefit}
                          </p>
                        </div>

                        {/* Foods */}
                        <div>
                          <p
                            className="text-[10px] font-medium mb-2"
                            style={{ color: nutrient.color }}
                          >
                            مصادر غذائية
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {nutrient.foods.map((food) => (
                              <span
                                key={food}
                                className="text-[11px] px-2.5 py-1 rounded-full"
                                style={{
                                  background: `${nutrient.color}10`,
                                  border: `1px solid ${nutrient.color}20`,
                                  color: "#e2e8f0",
                                }}
                              >
                                {food}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Quick tip */}
            <motion.div
              variants={itemVariants}
              className="mt-4 glass-card rounded-xl p-4"
            >
              <p
                className="text-xs font-semibold mb-2"
                style={{ color: "#e2e8f0" }}
              >
                💡 نصيحة سريعة
              </p>
              <p className="text-xs leading-relaxed" style={{ color: "#94a3b8" }}>
                اتبع نظاماً غذائياً غنياً بالخضروات الورقية والأسماك الدهنية
                والمكسرات. أضغط على أيقونة التقويم 📅 في الأعلى لرؤية جدول
                الوجبات الأسبوعي المُعد خصيصاً لصحة عينيك.
              </p>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
}
