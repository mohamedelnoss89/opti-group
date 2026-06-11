'use client';

import { useEffect, useRef } from 'react';

interface PropellerAdsBannerProps {
  /** The profitablegate script URL, e.g. //pl26353667.profitablegate.com/7c/1a/45/7c1a45e4b3a1e3f8d0e5c3b4a2d1e0f7.js */
  src: string;
  /** Optional CSS class */
  className?: string;
  /** Optional min-height for the container */
  minHeight?: string;
}

/**
 * PropellerAds / Monetag Banner component for desktop.
 * Renders the profitablegate script inside a div in the page body
 * (not in <head>) so the banner ad actually appears on screen.
 */
export default function PropellerAdsBanner({
  src,
  className = '',
  minHeight = '90px',
}: PropellerAdsBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current || !containerRef.current) return;
    loaded.current = true;

    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = src;
    containerRef.current.appendChild(script);
  }, [src]);

  return (
    <div
      ref={containerRef}
      className={`flex justify-center items-center w-full ${className}`}
      style={{ minHeight }}
    />
  );
}
