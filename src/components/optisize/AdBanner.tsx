"use client";

import { useEffect, useRef } from "react";

interface AdBannerProps {
  /**
   * Ad slot ID from AdSense dashboard.
   * While waiting for approval, use empty string – the component will
   * render a placeholder so you can see where ads will appear.
   */
  adSlot?: string;
  /** "horizontal" for leaderboard / banner, "vertical" for sidebar, "rectangle" for in-feed */
  format?: "horizontal" | "vertical" | "rectangle" | "auto";
  /** Whether the ad is responsive (default true) */
  responsive?: boolean;
  /** Optional className for custom styling */
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: Array<Record<string, unknown>>;
  }
}

export default function AdBanner({
  adSlot = "",
  format = "auto",
  responsive = true,
  className = "",
}: AdBannerProps) {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    // Push the ad to AdSense after mount
    if (!pushed.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushed.current = true;
      } catch {
        // AdSense not loaded yet or blocked by ad-blocker
      }
    }
  }, []);

  const formatStyle: React.CSSHTMLAttributes<HTMLModElement>["style"] = {
    display: "block",
    textAlign: "center",
    minHeight: format === "horizontal" ? 90 : format === "vertical" ? 250 : 100,
    background: "rgba(255,255,255,0.03)",
    borderRadius: 8,
    overflow: "hidden",
  };

  return (
    <div
      className={`ad-container ${className}`}
      style={{
        width: "100%",
        maxWidth: format === "horizontal" ? 728 : format === "rectangle" ? 336 : "100%",
        margin: "12px auto",
        padding: "4px 0",
      }}
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={formatStyle}
        data-ad-client="ca-pub-9431864894722327"
        data-ad-slot={adSlot}
        data-ad-format={format === "auto" ? "auto" : format === "horizontal" ? "horizontal" : "rectangle"}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}
