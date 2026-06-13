'use client';

import { useEffect, useRef } from 'react';

interface AdBannerProps {
  adSlot?: string;
  adFormat?: 'auto' | 'rectangle' | 'horizontal' | 'vertical' | 'fluid';
  style?: React.CSSProperties;
  className?: string;
}

export default function AdBanner({ adSlot, adFormat = 'auto', style, className = '' }: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const isPushed = useRef(false);

  useEffect(() => {
    if (isPushed.current) return;
    try {
      // @ts-expect-error adsbygoogle is injected by the AdSense script
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      isPushed.current = true;
    } catch (e) {
      // AdSense not loaded yet
    }
  }, []);

  return (
    <div className={`ad-container flex justify-center ${className}`} style={style}>
      <ins
        ref={adRef as unknown as React.RefObject<HTMLModElement>}
        className="adsbygoogle"
        style={{ display: 'block', minHeight: '90px', ...style }}
        data-ad-client="ca-pub-2715535111154362"
        data-ad-slot={adSlot || ''}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  );
}
