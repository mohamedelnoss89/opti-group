'use client';

import { useEffect, useRef } from 'react';

interface AdsterraAdProps {
  variant: number;
  className?: string;
}

// Each variant uses a unique container ID from Adsterra
// Variant 1: Native Banner (from Adsterra)
// Variant 2: 728x90 Banner
// Variant 3: Another placement of 728x90

let banner728Loaded = false;

export default function AdsterraAd({ variant, className = '' }: AdsterraAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isLoaded = useRef(false);

  useEffect(() => {
    if (isLoaded.current) return;
    isLoaded.current = true;

    const container = containerRef.current;
    if (!container) return;

    if (variant === 1) {
      // Native Banner - script is loaded in layout.tsx head
      // The container div with the specific ID is all we need
      return;
    }

    if (variant === 2 || variant === 3) {
      // 728x90 Banner - inject scripts dynamically
      const atOptionsScript = document.createElement('script');
      atOptionsScript.type = 'text/javascript';
      atOptionsScript.textContent = `
        atOptions = {
          'key' : 'df6179afb55a28833e3da220d014e849',
          'format' : 'iframe',
          'height' : 90,
          'width' : 728,
          'params' : {}
        };
      `;
      container.appendChild(atOptionsScript);

      const invokeScript = document.createElement('script');
      invokeScript.async = true;
      invokeScript.src = 'https://www.highperformanceformat.com/df6179afb55a28833e3da220d014e849/invoke.js';
      container.appendChild(invokeScript);
    }
  }, [variant]);

  if (variant === 1) {
    return (
      <div ref={containerRef} className={`flex justify-center ${className}`}>
        <div id="container-02cf7d9902da8d556cfe7f03550e90d9"></div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`flex justify-center ${className}`}></div>
  );
}
