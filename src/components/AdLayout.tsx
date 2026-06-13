'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// صفحات من غير إعلانات
const NO_ADS_PATHS = ['/signup', '/login', '/setup'];

export default function AdLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const noAdsPage = NO_ADS_PATHS.some(p => pathname.startsWith(p));

  useEffect(() => {
    if (noAdsPage) {
      document.body.classList.add('no-ads');
    } else {
      document.body.classList.remove('no-ads');
    }
    return () => {
      document.body.classList.remove('no-ads');
    };
  }, [noAdsPage, pathname]);

  return <>{children}</>;
}
