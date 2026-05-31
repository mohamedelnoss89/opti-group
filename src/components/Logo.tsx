'use client';

import { motion } from 'framer-motion';

export default function Logo({ size = 'large' }: { size?: 'small' | 'medium' | 'large' }) {
  const sizes = {
    small: { svg: 120, text: 14 },
    medium: { svg: 200, text: 20 },
    large: { svg: 280, text: 28 },
  };

  const s = sizes[size];

  return (
    <motion.div 
      className="flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <svg
        width={s.svg}
        height={s.svg}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Metallic silver gradient */}
          <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e8e8e8" />
            <stop offset="25%" stopColor="#a0a0a0" />
            <stop offset="50%" stopColor="#e8e8e8" />
            <stop offset="75%" stopColor="#909090" />
            <stop offset="100%" stopColor="#c0c0c0" />
          </linearGradient>

          {/* Dark metallic gradient */}
          <linearGradient id="darkSilverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#888" />
            <stop offset="50%" stopColor="#666" />
            <stop offset="100%" stopColor="#999" />
          </linearGradient>

          {/* Blue gem gradient */}
          <radialGradient id="gemGrad" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="40%" stopColor="#3b82f6" />
            <stop offset="80%" stopColor="#1e40af" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </radialGradient>

          {/* Gem glow */}
          <radialGradient id="gemGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(59,130,246,0.4)" />
            <stop offset="100%" stopColor="rgba(59,130,246,0)" />
          </radialGradient>

          {/* Ring gradient 1 */}
          <linearGradient id="ring1Grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d4d4d4" />
            <stop offset="30%" stopColor="#a3a3a3" />
            <stop offset="60%" stopColor="#e5e5e5" />
            <stop offset="100%" stopColor="#737373" />
          </linearGradient>

          {/* Ring gradient 2 */}
          <linearGradient id="ring2Grad" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#c0c0c0" />
            <stop offset="30%" stopColor="#8a8a8a" />
            <stop offset="60%" stopColor="#d9d9d9" />
            <stop offset="100%" stopColor="#6b6b6b" />
          </linearGradient>

          {/* Ring gradient 3 */}
          <linearGradient id="ring3Grad" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#b8b8b8" />
            <stop offset="50%" stopColor="#909090" />
            <stop offset="100%" stopColor="#c8c8c8" />
          </linearGradient>

          {/* Drop shadow filter */}
          <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.5)" />
          </filter>

          {/* Inner glow for gem */}
          <filter id="gemInnerGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Metallic shine */}
          <linearGradient id="shineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
          </linearGradient>
        </defs>

        {/* Background glow */}
        <circle cx="100" cy="85" r="70" fill="url(#gemGlow)" />

        {/* Outer ring - Ring 1 (top-left to bottom-right) */}
        <ellipse 
          cx="100" cy="85" rx="55" ry="40" 
          stroke="url(#ring1Grad)" strokeWidth="7" fill="none"
          transform="rotate(-30, 100, 85)"
          filter="url(#dropShadow)"
          opacity="0.9"
        />

        {/* Outer ring - Ring 2 (top-right to bottom-left) */}
        <ellipse 
          cx="100" cy="85" rx="55" ry="40" 
          stroke="url(#ring2Grad)" strokeWidth="7" fill="none"
          transform="rotate(30, 100, 85)"
          filter="url(#dropShadow)"
          opacity="0.9"
        />

        {/* Center ring - Ring 3 (horizontal) */}
        <ellipse 
          cx="100" cy="85" rx="50" ry="35" 
          stroke="url(#ring3Grad)" strokeWidth="6" fill="none"
          transform="rotate(90, 100, 85)"
          filter="url(#dropShadow)"
          opacity="0.85"
        />

        {/* Shine overlay on rings */}
        <ellipse 
          cx="100" cy="85" rx="55" ry="40" 
          stroke="url(#shineGrad)" strokeWidth="8" fill="none"
          transform="rotate(-30, 100, 85)"
          opacity="0.5"
        />

        {/* Reticle / Crosshair - horizontal */}
        <line x1="72" y1="85" x2="92" y2="85" stroke="#c0c0c0" strokeWidth="1.5" opacity="0.7" />
        <line x1="108" y1="85" x2="128" y2="85" stroke="#c0c0c0" strokeWidth="1.5" opacity="0.7" />

        {/* Reticle / Crosshair - vertical */}
        <line x1="100" y1="57" x2="100" y2="77" stroke="#c0c0c0" strokeWidth="1.5" opacity="0.7" />
        <line x1="100" y1="93" x2="100" y2="113" stroke="#c0c0c0" strokeWidth="1.5" opacity="0.7" />

        {/* Reticle corner marks */}
        {/* Top-left */}
        <line x1="82" y1="72" x2="88" y2="72" stroke="#c0c0c0" strokeWidth="1" opacity="0.5" />
        <line x1="82" y1="72" x2="82" y2="78" stroke="#c0c0c0" strokeWidth="1" opacity="0.5" />
        {/* Top-right */}
        <line x1="112" y1="72" x2="118" y2="72" stroke="#c0c0c0" strokeWidth="1" opacity="0.5" />
        <line x1="118" y1="72" x2="118" y2="78" stroke="#c0c0c0" strokeWidth="1" opacity="0.5" />
        {/* Bottom-left */}
        <line x1="82" y1="98" x2="88" y2="98" stroke="#c0c0c0" strokeWidth="1" opacity="0.5" />
        <line x1="82" y1="92" x2="82" y2="98" stroke="#c0c0c0" strokeWidth="1" opacity="0.5" />
        {/* Bottom-right */}
        <line x1="112" y1="98" x2="118" y2="98" stroke="#c0c0c0" strokeWidth="1" opacity="0.5" />
        <line x1="118" y1="92" x2="118" y2="98" stroke="#c0c0c0" strokeWidth="1" opacity="0.5" />

        {/* Central gem glow background */}
        <circle cx="100" cy="85" r="10" fill="url(#gemGlow)" />

        {/* Blue gem - outer facet */}
        <circle cx="100" cy="85" r="7" fill="url(#gemGrad)" filter="url(#gemInnerGlow)" />

        {/* Blue gem - inner highlight */}
        <circle cx="98" cy="83" r="2.5" fill="rgba(147, 197, 253, 0.6)" />

        {/* Blue gem - tiny sparkle */}
        <circle cx="97" cy="82" r="1" fill="rgba(255, 255, 255, 0.8)" />

        {/* OPTI text */}
        <text 
          x="100" y="148" 
          textAnchor="middle" 
          fontFamily="'Inter', 'Segoe UI', system-ui, sans-serif"
          fontWeight="800" 
          fontSize="36" 
          letterSpacing="6"
          fill="url(#silverGrad)"
        >
          OPTI
        </text>

        {/* GROUP text */}
        <text 
          x="100" y="170" 
          textAnchor="middle" 
          fontFamily="'Inter', 'Segoe UI', system-ui, sans-serif"
          fontWeight="400" 
          fontSize="14" 
          letterSpacing="8"
          fill="#909090"
        >
          GROUP
        </text>

        {/* Arabic text */}
        <text 
          x="100" y="190" 
          textAnchor="middle" 
          fontFamily="'Noto Kufi Arabic', 'Traditional Arabic', serif"
          fontWeight="400" 
          fontSize="13" 
          fill="#707070"
        >
          مجموعة أوبتي
        </text>
      </svg>
    </motion.div>
  );
}
