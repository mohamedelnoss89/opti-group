'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Logo({ size = 'large' }: { size?: 'small' | 'medium' | 'large' }) {
  const sizes = {
    small: { img: 140, gap: 8, textBase: 18, textSub: 10, textAr: 9 },
    medium: { img: 220, gap: 12, textBase: 28, textSub: 14, textAr: 12 },
    large: { img: 360, gap: 16, textBase: 42, textSub: 20, textAr: 16 },
  };

  const s = sizes[size];

  return (
    <motion.div 
      className="flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: 'easeOut' }}
    >
      {/* Logo Image - just the graphic, no text inside */}
      <div 
        className="relative"
        style={{ 
          width: s.img, 
          height: s.img * (382/700),
        }}
      >
        <Image
          src="/logo.png"
          alt="Opti Group"
          fill
          className="object-contain"
          style={{
            filter: 'drop-shadow(0 0 30px rgba(59,130,246,0.15)) drop-shadow(0 4px 20px rgba(0,0,0,0.5))',
          }}
          priority
        />
      </div>

      {/* OPTI text below logo with premium styling */}
      <motion.div 
        className="flex flex-col items-center"
        style={{ marginTop: s.gap }}
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
            background: 'linear-gradient(180deg, #f0f0f0 0%, #c0c0c0 40%, #888888 70%, #b0b0b0 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))',
          }}
        >
          OPTI
        </span>
        <span 
          style={{
            fontSize: s.textSub,
            fontWeight: 300,
            letterSpacing: '0.6em',
            color: 'rgba(192,192,192,0.6)',
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
            color: 'rgba(192,192,192,0.4)',
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
