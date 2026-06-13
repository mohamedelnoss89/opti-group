'use client';

import { ExternalLink } from 'lucide-react';

export default function OptiSizePromo() {
  return (
    <a
      href="https://optisize-nine.vercel.app"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 left-4 z-40 flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all hover:scale-105"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(192,192,192,0.08)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        textDecoration: 'none',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Eye icon */}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      <div className="flex flex-col">
        <span className="text-[10px] font-bold tracking-wider" style={{ color: '#00f0ff', lineHeight: 1.2 }}>
          OPTISIZE
        </span>
        <span className="text-[8px]" style={{ color: 'rgba(192,192,192,0.4)', lineHeight: 1.2 }}>
          صحة العين
        </span>
      </div>
      <ExternalLink className="w-3 h-3" style={{ color: 'rgba(0,240,255,0.5)' }} />
    </a>
  );
}
