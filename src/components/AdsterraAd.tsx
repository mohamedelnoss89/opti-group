'use client';

import { useEffect, useRef } from 'react';

interface AdsterraAdProps {
  type: 'native' | 'banner728' | 'socialbar' | 'smartlink' | 'popunder';
  className?: string;
}

export default function AdsterraAd({ type, className = '' }: AdsterraAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isLoaded = useRef(false);

  useEffect(() => {
    if (isLoaded.current) return;
    isLoaded.current = true;

    const container = containerRef.current;
    if (!container) return;

    if (type === 'banner728') {
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

    if (type === 'socialbar') {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://pl29736457.effectivecpmnetwork.com/02/10/14/0210141f0370b389f9055df094ac6ca0.js';
      container.appendChild(script);
    }

    if (type === 'smartlink') {
      const link = document.createElement('a');
      link.href = 'https://www.effectivecpmnetwork.com/hvq6pns0s?key=13cfbf9de4a2ae8eb7789a2fd62da57c';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.style.cssText = 'display:inline-block;padding:8px 20px;background:linear-gradient(135deg,rgba(14,165,233,0.2),rgba(30,64,175,0.15));border:1px solid rgba(14,165,233,0.25);border-radius:12px;color:#0ea5e9;font-size:13px;font-weight:600;text-decoration:none;cursor:pointer;transition:all 0.2s;';
      link.textContent = '🔗 عرض مميز';
      container.appendChild(link);
    }

    if (type === 'popunder') {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://pl29736459.effectivecpmnetwork.com/48/99/7a/48997ae29fe9b45f47c08dfb88305322.js';
      container.appendChild(script);
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
