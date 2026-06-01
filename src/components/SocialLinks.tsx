'use client';

import { motion } from 'framer-motion';

interface SocialLink {
  name: string;
  nameAr: string;
  url: string;
  icon: React.ReactNode;
  color: string;
  hoverBg: string;
}

const socialLinks: SocialLink[] = [
  {
    name: 'Facebook',
    nameAr: 'فيسبوك',
    url: 'https://www.facebook.com/profile.php?id=61590651353571',
    color: '#1877F2',
    hoverBg: 'rgba(24,119,242,0.12)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    name: 'YouTube',
    nameAr: 'يوتيوب',
    url: 'https://www.youtube.com/channel/UC_he0TLQaODFUxGXi4uQP1A',
    color: '#FF0000',
    hoverBg: 'rgba(255,0,0,0.1)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
  {
    name: 'TikTok',
    nameAr: 'تيك توك',
    url: 'https://www.tiktok.com/@mohamedopti995',
    color: '#00F2EA',
    hoverBg: 'rgba(0,242,234,0.1)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
      </svg>
    ),
  },
];

interface SocialLinksProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'minimal';
  className?: string;
  isArabic?: boolean;
}

export default function SocialLinks({ size = 'medium', variant = 'default', className = '', isArabic = false }: SocialLinksProps) {
  const iconSize = size === 'small' ? 'w-9 h-9' : size === 'large' ? 'w-12 h-12' : 'w-10 h-10';
  const padding = size === 'small' ? 'p-2' : size === 'large' ? 'p-3' : 'p-2.5';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {socialLinks.map((link, index) => (
        <motion.a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`${iconSize} ${padding} rounded-xl flex items-center justify-center transition-all duration-300 no-underline`}
          style={{
            background: variant === 'minimal' ? 'transparent' : 'rgba(255,255,255,0.03)',
            border: variant === 'minimal' ? 'none' : '1px solid rgba(192,192,192,0.06)',
            color: 'rgba(192,192,192,0.5)',
          }}
          whileHover={{
            scale: 1.12,
            background: link.hoverBg,
            borderColor: `${link.color}30`,
          }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          title={isArabic ? link.nameAr : link.name}
        >
          <span style={{ color: 'inherit', transition: 'color 0.3s' }}
            onMouseEnter={(e) => { (e.currentTarget.parentElement as HTMLElement).style.color = link.color; }}
            onMouseLeave={(e) => { (e.currentTarget.parentElement as HTMLElement).style.color = 'rgba(192,192,192,0.5)'; }}
          >
            {link.icon}
          </span>
        </motion.a>
      ))}
    </div>
  );
}

export { socialLinks };
