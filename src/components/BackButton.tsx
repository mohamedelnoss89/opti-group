"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

interface BackButtonProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function BackButton({ className, style }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    // Check if there's history to go back to
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/5 transition-colors ${className || ""}`}
      style={{ color: "#94a3b8", ...style }}
      aria-label="رجوع"
    >
      <ArrowRight className="w-5 h-5" />
    </button>
  );
}
