"use client";

import { useI18n } from "@/lib/i18n";
import { Languages } from "lucide-react";

export function LanguageSwitch() {
  const { locale, setLocale } = useI18n();

  return (
    <button
      onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
      className="fixed top-4 left-4 z-[100] flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 active:scale-95 hover:bg-white/15"
      style={{
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.12)",
        color: "#94a3b8",
        backdropFilter: "blur(10px)",
      }}
    >
      <Languages className="w-3.5 h-3.5" />
      {locale === "ar" ? "EN" : "عربي"}
    </button>
  );
}
