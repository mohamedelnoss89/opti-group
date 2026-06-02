import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'حالة الخدمات - Service Status',
  description: 'صفحة حالة خدمات مجموعة أوبتي - تابع حالة الأنظمة والخدمات في الوقت الفعلي. Opti Group service status page - monitor real-time system health and uptime.',
  alternates: {
    canonical: 'https://opti-group-deploy.vercel.app/status',
  },
  openGraph: {
    title: 'حالة الخدمات | Opti Group',
    description: 'تابع حالة خدمات مجموعة أوبتي في الوقت الفعلي',
    url: 'https://opti-group-deploy.vercel.app/status',
  },
};

export default function StatusLayout({ children }: { children: React.ReactNode }) {
  return children;
}
