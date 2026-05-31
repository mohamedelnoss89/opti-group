'use client';

import { motion } from 'framer-motion';

export default function Logo({ size = 'large' }: { size?: 'small' | 'medium' | 'large' }) {
  const sizes = {
    small: { svg: 140, textBase: 18, textSub: 10, textAr: 9 },
    medium: { svg: 220, textBase: 28, textSub: 14, textAr: 12 },
    large: { svg: 320, textBase: 42, textSub: 20, textAr: 16 },
  };

  const s = sizes[size];

  return (
    <motion.div 
      className="flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: 'easeOut' }}
    >
      <svg
        width={s.svg}
        height={s.svg * 0.85}
        viewBox="0 0 400 340"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Premium metallic silver gradient */}
          <linearGradient id="silverMain" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e8e8e8" />
            <stop offset="20%" stopColor="#b0b0b0" />
            <stop offset="40%" stopColor="#e0e0e0" />
            <stop offset="55%" stopColor="#909090" />
            <stop offset="70%" stopColor="#d4d4d4" />
            <stop offset="85%" stopColor="#a8a8a8" />
            <stop offset="100%" stopColor="#c8c8c8" />
          </linearGradient>

          {/* Darker metallic for ring undersides */}
          <linearGradient id="silverDark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#999" />
            <stop offset="30%" stopColor="#777" />
            <stop offset="60%" stopColor="#aaa" />
            <stop offset="100%" stopColor="#888" />
          </linearGradient>

          {/* Ring 1 gradient - rotated -60° */}
          <linearGradient id="ring1Grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d8d8d8" />
            <stop offset="25%" stopColor="#a0a0a0" />
            <stop offset="50%" stopColor="#e8e8e8" />
            <stop offset="75%" stopColor="#888" />
            <stop offset="100%" stopColor="#c0c0c0" />
          </linearGradient>

          {/* Ring 2 gradient - rotated 60° */}
          <linearGradient id="ring2Grad" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#d0d0d0" />
            <stop offset="25%" stopColor="#989898" />
            <stop offset="50%" stopColor="#e0e0e0" />
            <stop offset="75%" stopColor="#808080" />
            <stop offset="100%" stopColor="#b8b8b8" />
          </linearGradient>

          {/* Ring 3 gradient - horizontal */}
          <linearGradient id="ring3Grad" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#ccc" />
            <stop offset="30%" stopColor="#999" />
            <stop offset="60%" stopColor="#ddd" />
            <stop offset="100%" stopColor="#aaa" />
          </linearGradient>

          {/* Blue gem gradient - rich sapphire */}
          <radialGradient id="gemGrad" cx="45%" cy="35%" r="55%">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="25%" stopColor="#60a5fa" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="75%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </radialGradient>

          {/* Gem glow effect */}
          <radialGradient id="gemGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(59,130,246,0.35)" />
            <stop offset="60%" stopColor="rgba(59,130,246,0.1)" />
            <stop offset="100%" stopColor="rgba(59,130,246,0)" />
          </radialGradient>

          {/* Inner gem highlight */}
          <radialGradient id="gemHighlight" cx="40%" cy="30%" r="30%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>

          {/* Ring shadow filter */}
          <filter id="ringShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.6)" />
          </filter>

          {/* Ring glow filter */}
          <filter id="ringGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="rgba(192,192,192,0.15)" />
          </filter>

          {/* Gem filter */}
          <filter id="gemFilter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Metallic shine on ring */}
          <linearGradient id="ringShine" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
            <stop offset="40%" stopColor="rgba(255,255,255,0)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.08)" />
          </linearGradient>
        </defs>

        {/* ===== THREE INTERLOCKING RINGS (Borromean-style knot) ===== */}
        {/* Center of the rings: (200, 150) */}
        {/* Ring radius ~110, ellipse ratio ~0.65 */}

        {/* Background glow behind rings */}
        <circle cx="200" cy="150" r="100" fill="url(#gemGlow)" />
        <circle cx="200" cy="150" r="60" fill="url(#gemGlow)" />

        {/* Ring 1 - Top ring (rotated -30°) - Goes OVER ring 2 on top-right */}
        <ellipse 
          cx="200" cy="150" rx="110" ry="72" 
          stroke="url(#ring1Grad)" strokeWidth="14" fill="none"
          transform="rotate(-30, 200, 150)"
          filter="url(#ringShadow)"
        />
        {/* Shine on ring 1 */}
        <ellipse 
          cx="200" cy="150" rx="110" ry="72" 
          stroke="url(#ringShine)" strokeWidth="16" fill="none"
          transform="rotate(-30, 200, 150)"
          opacity="0.4"
        />

        {/* Ring 2 - Bottom-left ring (rotated 30°) - Goes OVER ring 3 on bottom */}
        <ellipse 
          cx="200" cy="150" rx="110" ry="72" 
          stroke="url(#ring2Grad)" strokeWidth="14" fill="none"
          transform="rotate(30, 200, 150)"
          filter="url(#ringShadow)"
        />
        {/* Shine on ring 2 */}
        <ellipse 
          cx="200" cy="150" rx="110" ry="72" 
          stroke="url(#ringShine)" strokeWidth="16" fill="none"
          transform="rotate(30, 200, 150)"
          opacity="0.35"
        />

        {/* Ring 3 - Horizontal ring (0°) - Goes OVER ring 1 on left */}
        <ellipse 
          cx="200" cy="150" rx="100" ry="65" 
          stroke="url(#ring3Grad)" strokeWidth="12" fill="none"
          transform="rotate(90, 200, 150)"
          filter="url(#ringShadow)"
        />
        {/* Shine on ring 3 */}
        <ellipse 
          cx="200" cy="150" rx="100" ry="65" 
          stroke="url(#ringShine)" strokeWidth="14" fill="none"
          transform="rotate(90, 200, 150)"
          opacity="0.3"
        />

        {/* ===== RETICLE / CROSSHAIR ===== */}
        {/* Horizontal lines */}
        <line x1="150" y1="150" x2="185" y2="150" stroke="#b0b0b0" strokeWidth="1.5" opacity="0.6" />
        <line x1="215" y1="150" x2="250" y2="150" stroke="#b0b0b0" strokeWidth="1.5" opacity="0.6" />
        
        {/* Vertical lines */}
        <line x1="200" y1="100" x2="200" y2="135" stroke="#b0b0b0" strokeWidth="1.5" opacity="0.6" />
        <line x1="200" y1="165" x2="200" y2="200" stroke="#b0b0b0" strokeWidth="1.5" opacity="0.6" />

        {/* Reticle corner marks - top-left */}
        <line x1="170" y1="122" x2="180" y2="122" stroke="#a0a0a0" strokeWidth="1" opacity="0.4" />
        <line x1="170" y1="122" x2="170" y2="132" stroke="#a0a0a0" strokeWidth="1" opacity="0.4" />
        {/* top-right */}
        <line x1="220" y1="122" x2="230" y2="122" stroke="#a0a0a0" strokeWidth="1" opacity="0.4" />
        <line x1="230" y1="122" x2="230" y2="132" stroke="#a0a0a0" strokeWidth="1" opacity="0.4" />
        {/* bottom-left */}
        <line x1="170" y1="178" x2="180" y2="178" stroke="#a0a0a0" strokeWidth="1" opacity="0.4" />
        <line x1="170" y1="168" x2="170" y2="178" stroke="#a0a0a0" strokeWidth="1" opacity="0.4" />
        {/* bottom-right */}
        <line x1="220" y1="178" x2="230" y2="178" stroke="#a0a0a0" strokeWidth="1" opacity="0.4" />
        <line x1="230" y1="168" x2="230" y2="178" stroke="#a0a0a0" strokeWidth="1" opacity="0.4" />

        {/* ===== BLUE GEMSTONE ===== */}
        {/* Outer glow */}
        <circle cx="200" cy="150" r="22" fill="url(#gemGlow)" />
        
        {/* Gem body - faceted look with multiple overlapping circles */}
        <circle cx="200" cy="150" r="14" fill="url(#gemGrad)" filter="url(#gemFilter)" />
        
        {/* Gem facets - lighter areas */}
        <ellipse cx="197" cy="146" rx="6" ry="4" fill="rgba(147,197,253,0.3)" transform="rotate(-15, 197, 146)" />
        <ellipse cx="204" cy="152" rx="4" ry="3" fill="rgba(37,99,235,0.4)" transform="rotate(20, 204, 152)" />
        
        {/* Gem highlight - bright spot */}
        <circle cx="196" cy="145" r="4" fill="url(#gemHighlight)" />
        
        {/* Gem sparkle - tiny white dot */}
        <circle cx="195" cy="144" r="1.5" fill="rgba(255,255,255,0.9)" />
        
        {/* Secondary sparkle */}
        <circle cx="205" cy="155" r="0.8" fill="rgba(255,255,255,0.5)" />
      </svg>

      {/* OPTI text below logo */}
      <motion.div 
        className="flex flex-col items-center"
        style={{ marginTop: size === 'large' ? 12 : 8 }}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <span 
          style={{
            fontSize: s.textBase,
            fontWeight: 900,
            letterSpacing: '0.3em',
            lineHeight: 1,
            background: 'linear-gradient(180deg, #f0f0f0 0%, #c0c0c0 40%, #888 70%, #b0b0b0 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))',
          }}
        >
          OPTI
        </span>
        <span 
          style={{
            fontSize: s.textSub,
            fontWeight: 300,
            letterSpacing: '0.6em',
            color: 'rgba(192,192,192,0.5)',
            marginTop: '4px',
            lineHeight: 1,
          }}
        >
          GROUP
        </span>
        <span 
          style={{
            fontSize: s.textAr,
            fontWeight: 400,
            color: 'rgba(192,192,192,0.35)',
            marginTop: '8px',
            fontFamily: "'Noto Kufi Arabic', 'Traditional Arabic', serif",
            letterSpacing: '0.1em',
          }}
        >
          مجموعة أوبتي
        </span>
      </motion.div>
    </motion.div>
  );
}
