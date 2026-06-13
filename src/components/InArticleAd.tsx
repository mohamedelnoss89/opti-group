'use client';

import { useEffect, useRef } from 'react';

interface InArticleAdProps {
  adSlot: string;
  className?: string;
}

export default function InArticleAd({ adSlot, className = '' }: InArticleAdProps) {
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
    <div className={`ad-in-article flex justify-center my-6 ${className}`}>
      <ins
        ref={adRef as React.RefObject<HTMLModElement>}
        className="adsbygoogle"
        style={{ display: 'block', textAlign: 'center' }}
        data-ad-client="ca-pub-2715535111154362"
        data-ad-slot={adSlot}
        data-ad-layout="in-article"
        data-ad-format="fluid"
      />
    </div>
  );
}
