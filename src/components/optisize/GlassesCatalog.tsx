"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Search,
  SlidersHorizontal,
  Eye,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ALL_GLASSES,
  GLASSES_STYLES,
  getGlassesSVG,
  getFrameTypeLabel,
  type GlassesItem,
} from "./RealisticGlasses";

interface GlassesCatalogProps {
  onTryOn: (glasses: GlassesItem) => void;
  onBack: () => void;
}

type SortOption = "default" | "price-asc" | "price-desc" | "newest";

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
  const [activeCategory, setActiveCategory] = useState("women_regular");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFrameType, setSelectedFrameType] = useState<string>("all");
  const [sortOption, setSortOption] = useState<SortOption>("default");
  const [showFilters, setShowFilters] = useState(false);

  const filteredGlasses = useMemo(() => {
    let result = ALL_GLASSES.filter((g) => g.category === activeCategory);

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (g) =>
          g.nameAr.includes(q) ||
          g.nameEn.toLowerCase().includes(q) ||
          g.color.includes(q) ||
          g.frameType.includes(q)
      );
    }

    if (selectedFrameType !== "all") {
      result = result.filter((g) => g.frameType === selectedFrameType);
    }

    switch (sortOption) {
      case "price-asc":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case "newest":
        result = [...result].sort((a, b) => b.id - a.id);
        break;
    }

    return result;
  }, [activeCategory, searchQuery, selectedFrameType, sortOption]);

  const categoryLabel =
    GLASSES_STYLES.categories.find((c) => c.id === activeCategory)?.label || "";

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0a0e1a" }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4">
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
            Glasses Catalog
          </p>
        </div>
        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant="ghost"
          size="icon"
          className="w-10 h-10 rounded-xl hover:bg-white/5"
          style={{ color: showFilters ? "#00f0ff" : "#94a3b8" }}
        >
          <SlidersHorizontal className="w-5 h-5" />
        </Button>
      </div>

      {/* Category Tabs */}
      <div className="px-4 mb-3">
        <div
          className="flex gap-1.5 overflow-x-auto pb-2 custom-scrollbar"
          style={{ direction: "rtl" }}
        >
          {GLASSES_STYLES.categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setSearchQuery("");
                setSelectedFrameType("all");
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200"
              style={{
                background:
                  activeCategory === cat.id
                    ? "linear-gradient(135deg, rgba(0,240,255,0.15), rgba(0,128,255,0.1))"
                    : "rgba(255,255,255,0.04)",
                border: `1px solid ${
                  activeCategory === cat.id
                    ? "rgba(0,240,255,0.3)"
                    : "rgba(255,255,255,0.06)"
                }`,
                color:
                  activeCategory === cat.id ? "#00f0ff" : "#94a3b8",
              }}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="px-4 mb-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
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
      </div>

      {/* Expandable Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="px-4 mb-3"
        >
          <div
            className="p-3 rounded-xl"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {/* Frame Type Filter */}
            <div className="mb-3">
              <p
                className="text-xs font-medium mb-2"
                style={{ color: "#94a3b8" }}
              >
                نوع الإطار
              </p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedFrameType("all")}
                  className="px-3 py-1 rounded-lg text-xs transition-all"
                  style={{
                    background:
                      selectedFrameType === "all"
                        ? "rgba(0,240,255,0.15)"
                        : "rgba(255,255,255,0.04)",
                    border: `1px solid ${
                      selectedFrameType === "all"
                        ? "rgba(0,240,255,0.3)"
                        : "rgba(255,255,255,0.06)"
                    }`,
                    color:
                      selectedFrameType === "all" ? "#00f0ff" : "#94a3b8",
                  }}
                >
                  الكل
                </button>
                {GLASSES_STYLES.frameTypes.map((ft) => (
                  <button
                    key={ft}
                    onClick={() =>
                      setSelectedFrameType(
                        selectedFrameType === ft ? "all" : ft
                      )
                    }
                    className="px-3 py-1 rounded-lg text-xs transition-all"
                    style={{
                      background:
                        selectedFrameType === ft
                          ? "rgba(0,240,255,0.15)"
                          : "rgba(255,255,255,0.04)",
                      border: `1px solid ${
                        selectedFrameType === ft
                          ? "rgba(0,240,255,0.3)"
                          : "rgba(255,255,255,0.06)"
                      }`,
                      color:
                        selectedFrameType === ft ? "#00f0ff" : "#94a3b8",
                    }}
                  >
                    {getFrameTypeLabel(ft)}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <p
                className="text-xs font-medium mb-2"
                style={{ color: "#94a3b8" }}
              >
                ترتيب حسب
              </p>
              <div className="flex gap-2">
                {(
                  [
                    { value: "default", label: "افتراضي" },
                    { value: "price-asc", label: "السعر: الأقل" },
                    { value: "price-desc", label: "السعر: الأعلى" },
                    { value: "newest", label: "الأحدث" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSortOption(opt.value)}
                    className="px-3 py-1 rounded-lg text-xs transition-all"
                    style={{
                      background:
                        sortOption === opt.value
                          ? "rgba(0,240,255,0.15)"
                          : "rgba(255,255,255,0.04)",
                      border: `1px solid ${
                        sortOption === opt.value
                          ? "rgba(0,240,255,0.3)"
                          : "rgba(255,255,255,0.06)"
                      }`,
                      color:
                        sortOption === opt.value ? "#00f0ff" : "#94a3b8",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Results Count */}
      <div className="px-4 mb-2 flex items-center justify-between">
        <p className="text-xs" style={{ color: "#64748b" }}>
          {filteredGlasses.length} نظارة في {categoryLabel}
        </p>
        {sortOption !== "default" && (
          <button
            onClick={() => setSortOption("default")}
            className="text-xs flex items-center gap-1"
            style={{ color: "#00f0ff" }}
          >
            <ChevronDown className="w-3 h-3 rotate-90" />
            إعادة تعيين
          </button>
        )}
      </div>

      {/* Glasses Grid */}
      <div className="flex-1 px-4 pb-6 overflow-y-auto custom-scrollbar">
        {filteredGlasses.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className="grid grid-cols-2 gap-3"
          >
            {filteredGlasses.map((glasses) => (
              <motion.div
                key={glasses.id}
                variants={cardVariants}
                whileTap={{ scale: 0.97 }}
                onClick={() => onTryOn(glasses)}
                className="rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 group"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {/* Glasses Image */}
                <div
                  className="relative flex items-center justify-center py-6"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)",
                  }}
                >
                  <img
                    src={glasses.image}
                    alt={glasses.nameAr}
                    className="h-28 w-auto object-contain"
                  />
                  {/* Try-on overlay */}
                  <div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{ background: "rgba(10,14,26,0.6)" }}
                  >
                    <div
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                      style={{
                        background: "rgba(0,240,255,0.15)",
                        border: "1px solid rgba(0,240,255,0.3)",
                        color: "#00f0ff",
                      }}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      تجربة افتراضية
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                  <h3
                    className="text-sm font-semibold mb-0.5 truncate"
                    style={{ color: "#e2e8f0" }}
                  >
                    {glasses.nameAr}
                  </h3>
                  <p
                    className="text-xs mb-2 truncate"
                    style={{ color: "#64748b" }}
                  >
                    {glasses.nameEn}
                  </p>

                  <div className="flex items-center justify-between mb-2">
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-2 py-0"
                      style={{
                        background: "rgba(0,240,255,0.08)",
                        color: "#00f0ff",
                        border: "none",
                      }}
                    >
                      {getFrameTypeLabel(glasses.frameType)}
                    </Badge>
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-3.5 h-3.5 rounded-full"
                        style={{
                          background: glasses.colorHex,
                          border: "1px solid rgba(255,255,255,0.15)",
                        }}
                      />
                      <span
                        className="text-[10px]"
                        style={{ color: "#94a3b8" }}
                      >
                        {glasses.color}
                      </span>
                    </div>
                  </div>

                  <div
                    className="flex items-center justify-between pt-2"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
                  >
                    <span
                      className="text-sm font-bold"
                      style={{ color: "#00d4aa" }}
                    >
                      {glasses.price} ج.م
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
              {searchQuery
                ? "جرب البحث بكلمات مختلفة"
                : "لا توجد نظارات تطابق الفلتر المحدد"}
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setSelectedFrameType("all");
                setSortOption("default");
              }}
              variant="ghost"
              className="mt-4 h-9 px-4 rounded-xl text-xs"
              style={{ color: "#00f0ff" }}
            >
              إعادة تعيين الفلاتر
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
