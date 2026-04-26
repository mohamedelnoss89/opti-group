"use client";

import { motion } from "framer-motion";
import { ArrowRight, Eye, Stethoscope, Heart, Glasses, History, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlaceholderScreenProps {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  onBack: () => void;
}

export default function PlaceholderScreen({
  title,
  subtitle,
  icon: Icon,
  color,
  onBack,
}: PlaceholderScreenProps) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: "#0a0e1a" }}
    >
      {/* Background decoration */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${color}10 0%, transparent 50%)`,
        }}
      />

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        {/* Icon */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="w-24 h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${color}20, ${color}08)`,
            border: `1px solid ${color}30`,
          }}
        >
          <Icon className="w-12 h-12" style={{ color }} />
        </motion.div>

        <h1
          className="text-2xl font-bold mb-2"
          style={{ color: "#e2e8f0" }}
        >
          {title}
        </h1>
        <p className="text-sm mb-8" style={{ color: "#64748b" }}>
          {subtitle}
        </p>

        <p
          className="text-xs mb-6 px-4 py-3 rounded-xl max-w-xs mx-auto"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            color: "#94a3b8",
          }}
        >
          هذه الشاشة قيد التطوير وستتوفر قريباً
        </p>

        <Button
          onClick={onBack}
          className="h-11 px-6 rounded-xl font-medium transition-all hover:opacity-90"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#e2e8f0",
          }}
        >
          <ArrowRight className="w-4 h-4 ml-2" />
          رجوع
        </Button>
      </motion.div>
    </div>
  );
}

// Pre-configured placeholder screens
export function ScannerPlaceholder({ onBack }: { onBack: () => void }) {
  return (
    <PlaceholderScreen
      title="قياس مسافة البؤبؤ"
      subtitle="PD Measurement Scanner"
      icon={Eye}
      color="#00f0ff"
      onBack={onBack}
    />
  );
}

export function VisionTestPlaceholder({ onBack }: { onBack: () => void }) {
  return (
    <PlaceholderScreen
      title="اختبارات النظر"
      subtitle="Vision Tests"
      icon={Stethoscope}
      color="#a855f7"
      onBack={onBack}
    />
  );
}

export function HealthCenterPlaceholder({ onBack }: { onBack: () => void }) {
  return (
    <PlaceholderScreen
      title="مركز صحة العين"
      subtitle="Eye Health Center"
      icon={Heart}
      color="#ff3b30"
      onBack={onBack}
    />
  );
}

export function GlassesCatalogPlaceholder({ onBack }: { onBack: () => void }) {
  return (
    <PlaceholderScreen
      title="معرض النظارات"
      subtitle="Glasses Catalog"
      icon={Glasses}
      color="#ffa500"
      onBack={onBack}
    />
  );
}

export function RecordsPlaceholder({ onBack }: { onBack: () => void }) {
  return (
    <PlaceholderScreen
      title="السجل المحفوظ"
      subtitle="Saved Records"
      icon={History}
      color="#0080ff"
      onBack={onBack}
    />
  );
}

export function ResultsPlaceholder({ onBack }: { onBack: () => void }) {
  return (
    <PlaceholderScreen
      title="النتائج"
      subtitle="Results"
      icon={BarChart3}
      color="#00d4aa"
      onBack={onBack}
    />
  );
}
