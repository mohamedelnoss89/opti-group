'use client';

import { useEffect, useRef, useId } from 'react';

interface AdsterraAdProps {
  type: 'native' | 'banner728';
  className?: string;
}

export default function AdsterraAd({ type, className = '' }: AdsterraAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isLoaded = useRef(false);
  const uniqueId = useId().replace(/:/g, '');

  useEffect(() => {
    if (isLoaded.current) return;
    isLoaded.current = true;

    const container = containerRef.current;
    if (!container) return;

    if (type === 'banner728') {
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
  }, [type]);

  if (type === 'native') {
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
