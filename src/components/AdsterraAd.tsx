'use client';

import { useEffect } from 'react';

interface AdsterraAdProps {
  type: 'native' | 'banner728';
  className?: string;
}

export default function AdsterraAd({ type, className = '' }: AdsterraAdProps) {
  useEffect(() => {
    if (type === 'banner728') {
      try {
        // @ts-expect-error Adsterra atOptions
        window.atOptions = {
          'key': 'df6179afb55a28833e3da220d014e849',
          'format': 'iframe',
          'height': 90,
          'width': 728,
          'params': {}
        };
      } catch (e) {}
    }
  }, [type]);

  if (type === 'native') {
    return (
      <div className={`flex justify-center ${className}`}>
        <div id="container-02cf7d9902da8d556cfe7f03550e90d9"></div>
      </div>
    );
  }

  if (type === 'banner728') {
    return (
      <div className={`flex justify-center ${className}`}>
        <ins
          className="adsbygoogle"
          style={{ display: 'inline-block', width: '728px', height: '90px' }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              atOptions = {
                'key' : 'df6179afb55a28833e3da220d014e849',
                'format' : 'iframe',
                'height' : 90,
                'width' : 728,
                'params' : {}
              };
            `,
          }}
        />
        <script async src="https://www.highperformanceformat.com/df6179afb55a28833e3da220d014e849/invoke.js"></script>
      </div>
    );
  }

  return null;
}
