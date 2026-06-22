"use client";

type AdsterraIframeAdProps = {
  /** Path to the static HTML file containing the Adsterra banner code */
  src: string;
  /** Width in pixels */
  width: number;
  /** Height in pixels */
  height: number;
  /** Optional className for the wrapper */
  className?: string;
};

/**
 * Renders an Adsterra banner ad inside an isolated iframe.
 *
 * Why iframe? When you have multiple banner placements on the same page,
 * they all set the global `atOptions` variable. If they share the same JS
 * context (e.g., via inline scripts), only the last-set value wins.
 * Putting each ad in its own iframe gives each one its own JS context,
 * so they don't conflict.
 *
 * Pure functional component — NO useState, NO useEffect, NO useRef.
 * React cannot cause re-renders or re-mounts because there's nothing
 * for React to reconcile. The iframe is created once on mount and never
 * touched again.
 */
export default function AdsterraIframeAd({
  src,
  width,
  height,
  className,
}: AdsterraIframeAdProps) {
  return (
    <div
      className={className}
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: height,
      }}
      aria-label="إعلان"
    >
      <iframe
        src={src}
        title="ad"
        width={width}
        height={height}
        style={{
          border: "0",
          maxWidth: "100%",
          overflow: "hidden",
          background: "transparent",
        }}
        scrolling="no"
        loading="lazy"
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms"
      />
    </div>
  );
}
