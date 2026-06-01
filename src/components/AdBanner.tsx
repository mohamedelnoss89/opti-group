'use client';

import { useEffect, useRef } from 'react';

interface AdBannerProps {
  adSlot: string;
  adFormat?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  style?: React.CSSProperties;
  className?: string;
}

export default function AdBanner({ adSlot, adFormat = 'auto', style, className = '' }: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const isPushed = useRef(false);

  useEffect(() => {
    // Only push the ad once per component mount
    if (adRef.current && !isPushed.current) {
      try {
        // @ts-expect-error adsbygoogle is injected by the AdSense script
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        isPushed.current = true;
      } catch (e) {
        console.log('AdSense push error:', e);
      }
    }
  }, []);

  return (
    <div className={`ad-container flex justify-center ${className}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client="ca-pub-2715535111154362"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  );
}
