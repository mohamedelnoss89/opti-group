'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import AdsterraAd from '@/components/AdsterraAd';
import OptiSizePromo from '@/components/OptiSizePromo';
import CookieConsent from '@/components/CookieConsent';

// صفحات من غير إعلانات
const NO_ADS_PATHS = ['/signup', '/login', '/setup'];

// أنماط URL للسكريبتات الإعلانية
const AD_SCRIPT_URLS = [
  'effectivecpmnetwork.com/02cf7d9902da8d556cfe7f03550e90d9/invoke.js',
  'effectivecpmnetwork.com/02/10/14/0210141f0370b389f9055df094ac6ca0.js',
  'effectivecpmnetwork.com/48/99/7a/48997ae29fe9b45f47c08dfb88305322.js',
  'quge5.com/88/tag.min.js',
  'highperformanceformat.com',
  'idealistic-revenue.com',
];

// أنماط URL للعناصر الإعلانية
const AD_URL_PATTERNS = [
  'effectivecpmnetwork',
  'highperformanceformat',
  'quge5',
  'adsterra',
  'cpmnetwork',
  'idealistic-revenue',
];

export default function AdLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const noAdsPage = NO_ADS_PATHS.some(p => pathname.startsWith(p));
  const showAds = !noAdsPage;

  // مراجع للسكريبتات المحقونة
  const injectedScriptsRef = useRef<HTMLScriptElement[]>([]);
  const observerRef = useRef<MutationObserver | null>(null);

  // دالة لإزالة كل السكريبتات الإعلانية من head
  const removeAllAdScripts = useCallback(() => {
    injectedScriptsRef.current.forEach(script => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    });
    injectedScriptsRef.current = [];

    // شيل أي سكريبت إعلاني تاني في head
    const allScripts = document.querySelectorAll('script[src]');
    allScripts.forEach(script => {
      const src = script.getAttribute('src') || '';
      if (AD_SCRIPT_URLS.some(pattern => src.includes(pattern))) {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      }
    });
  }, []);

  // دالة لإزالة كل العناصر الإعلانية من body
  const removeAllAdElements = useCallback(() => {
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      const src = iframe.getAttribute('src') || '';
      const id = iframe.id || '';
      if (AD_URL_PATTERNS.some(pattern => src.includes(pattern) || id.includes(pattern))) {
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      }
    });

    const adContainers = document.querySelectorAll(
      '[id*="container-02cf7d9902da8d556cfe7f03550e90d9"], ' +
      '[id*="effectivecpmnetwork"], ' +
      '[id*="pl29736"], ' +
      '[class*="quge5"], ' +
      '[id*="highperformanceformat"], ' +
      '[id*="adsterra"]'
    );
    adContainers.forEach(el => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });

    // شيل أي لينكات إعلانية
    document.querySelectorAll('a[href*="effectivecpmnetwork"], a[href*="quge5"]').forEach(el => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
  }, []);

  // دالة لتشغيل MutationObserver
  const startAdObserver = useCallback(() => {
    if (observerRef.current) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node instanceof HTMLIFrameElement) {
            const src = node.getAttribute('src') || '';
            if (AD_URL_PATTERNS.some(p => src.includes(p))) {
              node.remove();
            }
          }
          if (node instanceof HTMLScriptElement) {
            const src = node.getAttribute('src') || '';
            if (AD_SCRIPT_URLS.some(p => src.includes(p))) {
              node.remove();
            }
          }
          if (node instanceof HTMLDivElement) {
            const id = node.id || '';
            const className = node.className || '';
            if (
              AD_URL_PATTERNS.some(p => id.includes(p)) ||
              id.includes('container-02cf7d') ||
              (typeof className === 'string' && className.includes('quge5'))
            ) {
              node.remove();
            }
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    observerRef.current = observer;
  }, []);

  const stopAdObserver = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  }, []);

  // صفحات من غير إعلانات: ضيف no-ads class على body
  useEffect(() => {
    if (noAdsPage) {
      document.body.classList.add('no-ads');
      // شيل السكريبتات والعناصر الإعلانية فوراً
      removeAllAdScripts();
      removeAllAdElements();
      // شغّل Observer
      startAdObserver();
    } else {
      document.body.classList.remove('no-ads');
      // وقّف Observer
      stopAdObserver();
    }
    return () => {
      document.body.classList.remove('no-ads');
      stopAdObserver();
    };
  }, [noAdsPage, pathname, removeAllAdScripts, removeAllAdElements, startAdObserver, stopAdObserver]);

  // حقن/إزالة سكريبتات الإعلانات حسب showAds
  useEffect(() => {
    if (showAds) {
      stopAdObserver();

      // Adsterra Native Banner
      const s1 = document.createElement('script');
      s1.async = true;
      s1.setAttribute('data-cfasync', 'false');
      s1.src = 'https://pl29736070.effectivecpmnetwork.com/02cf7d9902da8d556cfe7f03550e90d9/invoke.js';
      document.head.appendChild(s1);
      injectedScriptsRef.current.push(s1);

      // Adsterra Social Bar
      const s2 = document.createElement('script');
      s2.src = 'https://pl29736457.effectivecpmnetwork.com/02/10/14/0210141f0370b389f9055df094ac6ca0.js';
      document.head.appendChild(s2);
      injectedScriptsRef.current.push(s2);

      // Adsterra Popunder
      const s3 = document.createElement('script');
      s3.src = 'https://pl29736459.effectivecpmnetwork.com/48/99/7a/48997ae29fe9b45f47c08dfb88305322.js';
      document.head.appendChild(s3);
      injectedScriptsRef.current.push(s3);

      // Monetag OnClick
      const s4 = document.createElement('script');
      s4.src = 'https://quge5.com/88/tag.min.js';
      s4.async = true;
      s4.setAttribute('data-cfasync', 'false');
      s4.setAttribute('data-zone', '249426');
      document.head.appendChild(s4);
      injectedScriptsRef.current.push(s4);

      // HilltopAds Popunder - Zone #7135561
      const s5 = document.createElement('script');
      s5.src = 'https://idealistic-revenue.com/bH3PVr0.P/3/pbvgbom/ViJkZ/D-0-3/MOT/MG1wNzTpY/xPLZTccrxoMezkUp1uNhj/UZ';
      s5.async = true;
      s5.setAttribute('data-cfasync', 'false');
      document.head.appendChild(s5);
      injectedScriptsRef.current.push(s5);
    } else {
      removeAllAdScripts();
      removeAllAdElements();
    }

    return () => {
      if (!showAds) {
        removeAllAdScripts();
        removeAllAdElements();
      }
    };
  }, [showAds, pathname, removeAllAdScripts, removeAllAdElements, stopAdObserver]);

  return (
    <>
      {showAds && (
        <div className="w-full bg-transparent">
          <AdsterraAd type="banner728" className="py-2" />
        </div>
      )}

      {children}

      {showAds && (
        <>
          <div className="max-w-7xl mx-auto px-4 py-4">
            <AdsterraAd type="banner728" />
          </div>

          <div className="w-full bg-transparent">
            <AdsterraAd type="native" className="py-3" />
          </div>

          <div className="fixed bottom-20 right-4 z-40">
            <AdsterraAd type="smartlink" />
          </div>
        </>
      )}

      <CookieConsent />
      <OptiSizePromo />
    </>
  );
}
