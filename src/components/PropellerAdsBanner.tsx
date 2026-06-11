'use client';

import { useEffect, useRef } from 'react';

interface PropellerAdsBannerProps {
  /** Zone ID from PropellerAds dashboard, e.g. '11133741' */
  zoneId: string;
  /** Script URL, e.g. 'https://nap5k.com/tag.min.js' */
  src?: string;
  /** Optional CSS class */
  className?: string;
  /** Optional min-height for the container */
  minHeight?: string;
}

/**
 * PropellerAds / Monetag In-Page Push (Banner) component.
 * Renders the ad tag script inside a div in the page body
 * so the banner ad actually appears on screen on both desktop and mobile.
 */
export default function PropellerAdsBanner({
  zoneId,
  src = 'https://nap5k.com/tag.min.js',
  className = '',
  minHeight = '120px',
}: PropellerAdsBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current || !containerRef.current) return;
    loaded.current = true;

    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.setAttribute('data-zone', zoneId);
    script.src = src;
    containerRef.current.appendChild(script);
  }, [zoneId, src]);

  return (
    <div
      ref={containerRef}
      className={`flex justify-center items-center w-full ${className}`}
      style={{ minHeight }}
    />
  );
}
