"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Search, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ALL_GLASSES,
  GLASSES_CATEGORIES,
  type GlassesCategory,
  type GlassesItem,
} from "./RealisticGlasses";

interface GlassesCatalogProps {
  onTryOn: (glasses: GlassesItem) => void;
  onBack: () => void;
}

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const cardVariants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

export default function GlassesCatalog({ onTryOn, onBack }: GlassesCatalogProps) {
  const [activeCategory, setActiveCategory] = useState<GlassesCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGlasses = useMemo(() => {
    let result = activeCategory === "all"
      ? ALL_GLASSES
      : ALL_GLASSES.filter((g) => g.category === activeCategory);

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (g) =>
          g.nameAr.includes(q) ||
          g.color.includes(q)
      );
    }

    return result;
  }, [activeCategory, searchQuery]);

  const categoryLabel = activeCategory === "all"
    ? "الكل"
    : GLASSES_CATEGORIES.find((c) => c.id === activeCategory)?.label || "";

  return (
    <div className="min-h-screen flex flex-col touch-manipulation" style={{ background: "#0a0e1a", WebkitTapHighlightColor: "transparent" }}>
      {/* Background decoration */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(0,240,255,0.05) 0%, transparent 50%)",
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
            معرض النظارات
          </h1>
          <p className="text-xs" style={{ color: "#64748b" }}>
            {filteredGlasses.length} نظارة
          </p>
        </div>
        <div className="w-10" />
      </div>

      {/* Category Tabs - VERY BIG tappable buttons in grid */}
      <div className="px-3 mb-5 relative z-10">
        <div
          className="grid grid-cols-2 gap-3"
          style={{ direction: "rtl" }}
        >
          {GLASSES_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setSearchQuery("");
              }}
              className="flex items-center justify-center gap-3 px-5 py-5 rounded-2xl text-xl font-bold whitespace-nowrap transition-all duration-200 w-full"
              style={{
                background:
                  activeCategory === cat.id
                    ? "linear-gradient(135deg, rgba(0,240,255,0.35), rgba(0,128,255,0.25))"
                    : "rgba(255,255,255,0.06)",
                border: `3px solid ${
                  activeCategory === cat.id
                    ? "rgba(0,240,255,0.7)"
                    : "rgba(255,255,255,0.12)"
                }`,
                color:
                  activeCategory === cat.id ? "#00f0ff" : "#94a3b8",
                boxShadow: activeCategory === cat.id
                  ? "0 0 30px rgba(0,240,255,0.3), inset 0 0 20px rgba(0,240,255,0.1)"
                  : "none",
                minHeight: "76px",
              }}
            >
              <span className="text-3xl">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 mb-3 relative z-10">
        <div className="relative">
          <Search
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: "#64748b" }}
          />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`ابحث في ${categoryLabel}...`}
            className="h-10 pr-10 pl-4 rounded-xl text-sm"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#e2e8f0",
            }}
          />
        </div>
      </div>

      {/* Results Count */}
      <div className="px-4 mb-2 relative z-10">
        <p className="text-xs" style={{ color: "#64748b" }}>
          {filteredGlasses.length} نظارة في {categoryLabel}
        </p>
      </div>

      {/* Glasses Grid */}
      <div className="flex-1 px-3 pb-6 overflow-y-auto relative z-10 custom-scrollbar">
        {filteredGlasses.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className="grid grid-cols-2 gap-4"
          >
            {filteredGlasses.map((glasses) => (
              <motion.div
                key={glasses.id}
                variants={cardVariants}
                whileTap={{ scale: 0.97 }}
                onClick={() => onTryOn(glasses)}
                className="rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 group hover:border-cyan-500/20"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(15,23,42,0.8) 0%, rgba(10,14,26,0.95) 100%)",
                  border: "2px solid rgba(255,255,255,0.12)",
                }}
              >
                {/* Glasses Image */}
                <div
                  className="relative flex items-center justify-center p-5"
                  style={{
                    background: "transparent",
                    minHeight: "210px",
                  }}
                >
                  <img
                    src={glasses.image}
                    alt={glasses.nameAr}
                    className="max-h-52 w-auto object-contain drop-shadow-lg transition-transform duration-200 group-active:scale-95"
                    style={{ 
                      filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3)) brightness(1.1) contrast(1.2)",
                      mixBlendMode: "normal",
                    }}
                  />
                  {/* Try-on overlay */}
                  <div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-200"
                    style={{ background: "rgba(10,14,26,0.5)" }}
                  >
                    <div
                      className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                      style={{
                        background: "rgba(0,240,255,0.2)",
                        border: "1px solid rgba(0,240,255,0.4)",
                        color: "#00f0ff",
                      }}
                    >
                      <Eye className="w-4 h-4" />
                      تجربة
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 pt-2">
                  <h3
                    className="text-base font-bold mb-2 truncate"
                    style={{ color: "#e2e8f0" }}
                  >
                    {glasses.nameAr}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm px-3 py-1.5 rounded-lg"
                      style={{
                        background: "rgba(0,240,255,0.1)",
                        color: "#00f0ff",
                        border: "1px solid rgba(0,240,255,0.15)",
                      }}
                    >
                      {glasses.color}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <Search className="w-8 h-8" style={{ color: "#4a5568" }} />
            </div>
            <p
              className="text-sm font-medium mb-1"
              style={{ color: "#94a3b8" }}
            >
              لا توجد نتائج
            </p>
            <p className="text-xs text-center" style={{ color: "#64748b" }}>
              جرب البحث بكلمات مختلفة
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("all");
              }}
              variant="ghost"
              className="mt-4 h-9 px-4 rounded-xl text-xs"
              style={{ color: "#00f0ff" }}
            >
              عرض الكل
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
