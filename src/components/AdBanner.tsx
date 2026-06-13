'use client';

import { useEffect, useRef, useState } from 'react';

interface AdBannerProps {
  adSlot: string;
  adFormat?: 'auto' | 'rectangle' | 'horizontal' | 'vertical' | 'fluid';
  style?: React.CSSProperties;
  className?: string;
}

const CONSENT_KEY = 'optigroup-cookie-consent';

export default function AdBanner({ adSlot, adFormat = 'auto', style, className = '' }: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const isPushed = useRef(false);
  const [canShow, setCanShow] = useState(false);

  useEffect(() => {
    // Check standalone mode
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    // Check desktop mode (screen >= 1024px)
    const desktop = !standalone && window.innerWidth >= 1024;

    // If neither standalone nor desktop (mobile browser), no ads
    if (!standalone && !desktop) return;

    // Check if on auth page — NEVER show ads there
    const path = window.location.pathname;
    const onAuthPage = path === '/signup' || path === '/login' || path === '/auth' || path.startsWith('/auth/');
    if (onAuthPage) return;

    // Check cookie consent
    const checkConsent = () => {
      const consent = localStorage.getItem(CONSENT_KEY);
      return consent === 'accepted';
    };

    // Check authentication (only needed for PWA standalone)
    const checkAuth = () => {
      const user = localStorage.getItem('optigroup-current-user');
      return !!user;
    };

    // Determine if ads can be shown
    const evaluateCanShow = () => {
      const hasConsent = checkConsent();
      if (desktop) {
        // Desktop: consent only (no auth required)
        setCanShow(hasConsent);
      } else if (standalone) {
        // Mobile PWA: consent + auth required
        setCanShow(hasConsent && checkAuth());
      }
    };

    evaluateCanShow();

    // Listen for changes
    const handleConsentChange = () => evaluateCanShow();
    const handleAuthChange = () => evaluateCanShow();
    window.addEventListener('cookie-consent-changed', handleConsentChange);
    window.addEventListener('optigroup-auth-changed', handleAuthChange);

    return () => {
      window.removeEventListener('cookie-consent-changed', handleConsentChange);
      window.removeEventListener('optigroup-auth-changed', handleAuthChange);
    };
  }, []);

  useEffect(() => {
    if (!canShow || isPushed.current) return;
    try {
      // @ts-expect-error adsbygoogle is injected by the AdSense script
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      isPushed.current = true;
    } catch (e) {
      // AdSense not loaded yet or blocked
    }
  }, [canShow]);

  if (!canShow) return null;

  return (
    <div className={`ad-container flex justify-center ${className}`} style={style}>
      <ins
        ref={adRef as unknown as React.RefObject<HTMLModElement>}
        className="adsbygoogle"
        style={{ display: 'block', minHeight: '90px', ...style }}
        data-ad-client="ca-pub-2715535111154362"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
        data-personalization-off="true"
      />
    </div>
  );
}
