'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Logo({ size = 'large' }: { size?: 'small' | 'medium' | 'large' }) {
  const sizes = {
    small: { img: 120, textBase: 16, textSub: 10, textAr: 9 },
    medium: { img: 200, textBase: 24, textSub: 14, textAr: 12 },
    large: { img: 320, textBase: 36, textSub: 18, textAr: 15 },
  };

  const s = sizes[size];

  return (
    <motion.div 
      className="flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      {/* Logo Image */}
      <div 
        className="relative"
        style={{ 
          width: s.img, 
          height: s.img * (382/700),
        }}
      >
        <Image
          src="/logo.png"
          alt="Opti Group Logo"
          fill
          className="object-contain drop-shadow-2xl"
          priority
        />
      </div>

      {/* OPTI text below logo */}
      <motion.div 
        className="flex flex-col items-center mt-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <span 
          style={{
            fontSize: s.textBase,
            fontWeight: 800,
            letterSpacing: '0.25em',
            background: 'linear-gradient(135deg, #e8e8e8 0%, #a0a0a0 25%, #e8e8e8 50%, #909090 75%, #c0c0c0 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          OPTI
        </span>
        <span 
          style={{
            fontSize: s.textSub,
            fontWeight: 400,
            letterSpacing: '0.5em',
            color: '#909090',
            marginTop: '2px',
          }}
        >
          GROUP
        </span>
        <span 
          style={{
            fontSize: s.textAr,
            fontWeight: 400,
            color: '#707070',
            marginTop: '4px',
            fontFamily: "'Noto Kufi Arabic', 'Traditional Arabic', serif",
          }}
        >
          مجموعة أوبتي
        </span>
      </motion.div>
    </motion.div>
  );
}
