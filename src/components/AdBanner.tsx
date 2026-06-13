'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user, loading } = useAuth();

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

    // Determine if ads can be shown
    const evaluateCanShow = () => {
      const hasConsent = checkConsent();
      if (desktop) {
        // Desktop: consent only (no auth required)
        setCanShow(hasConsent);
      } else if (standalone) {
        // Mobile PWA: consent + auth required
        setCanShow(hasConsent && !!user);
      }
    };

    evaluateCanShow();

    // Listen for consent changes
    const handleConsentChange = () => evaluateCanShow();
    window.addEventListener('cookie-consent-changed', handleConsentChange);

    // Listen for auth changes (via custom event from AuthContext/AuthForm)
    const handleAuthChange = () => evaluateCanShow();
    window.addEventListener('optigroup-auth-changed', handleAuthChange);

    // Also re-evaluate when user state changes from AuthContext
    evaluateCanShow();

    return () => {
      window.removeEventListener('cookie-consent-changed', handleConsentChange);
      window.removeEventListener('optigroup-auth-changed', handleAuthChange);
    };
  }, [user, loading]);

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
