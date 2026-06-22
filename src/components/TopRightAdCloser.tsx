'use client';

import { useEffect, useState } from 'react';

/**
 * TopRightAdCloser
 * ----------
 * Adsterra Social Bar injects floating ad icons into the top-right corner
 * of the viewport via an external script. We don't control its DOM, but
 * we CAN hide it by:
 *
 *   1. Showing a small "X" close button fixed at top-right (above the ad)
 *   2. When clicked: add `data-top-right-ad-hidden="1"` to <html>
 *      and persist the dismissal in sessionStorage so it stays hidden
 *      for the rest of the browsing session
 *   3. CSS (in layout.tsx <head>) hides common Adsterra selectors when
 *      that attribute is present
 *
 * The X button is auto-hidden if user already dismissed it this session
 * (so it doesn't clutter the UI after dismissal).
 */

const STORAGE_KEY = 'opti-group-top-right-ad-dismissed';

export default function TopRightAdCloser() {
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Restore dismissal state from sessionStorage
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored === '1') {
        setDismissed(true);
        document.documentElement.setAttribute('data-top-right-ad-hidden', '1');
      }
    } catch {
      // sessionStorage may be blocked — ignore
    }
  }, []);

  const handleClose = () => {
    setDismissed(true);
    document.documentElement.setAttribute('data-top-right-ad-hidden', '1');
    try {
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // ignore
    }
  };

  if (!mounted || dismissed) return null;

  return (
    <button
      type="button"
      onClick={handleClose}
      aria-label="إغلاق الإعلان"
      title="إغلاق الإعلان"
      style={{
        position: 'fixed',
        top: '4px',
        right: '4px',
        width: '24px',
        height: '24px',
        padding: 0,
        background: 'rgba(15, 23, 42, 0.85)',
        border: '1px solid rgba(239, 68, 68, 0.5)',
        borderRadius: '6px',
        color: '#ef4444',
        fontSize: '14px',
        fontWeight: 700,
        lineHeight: '22px',
        cursor: 'pointer',
        zIndex: 2147483647, // max int — always above everything
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        transition: 'background 0.15s ease, transform 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.9)';
        e.currentTarget.style.color = '#ffffff';
        e.currentTarget.style.transform = 'scale(1.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(15, 23, 42, 0.85)';
        e.currentTarget.style.color = '#ef4444';
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      ×
    </button>
  );
}
