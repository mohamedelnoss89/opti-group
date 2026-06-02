import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'شروط الاستخدام - Terms of Service',
  description: 'شروط استخدام خدمات مجموعة أوبتي - القواعد والأحكام التي تحكم استخدام مواقعنا وتطبيقاتنا. Terms of Service for Opti Group applications and websites.',
  alternates: {
    canonical: 'https://opti-group-deploy.vercel.app/terms',
  },
  openGraph: {
    title: 'شروط الاستخدام | Opti Group',
    description: 'شروط وأحكام استخدام خدمات مجموعة أوبتي',
    url: 'https://opti-group-deploy.vercel.app/terms',
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
