import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'من نحن - About Us',
  description: 'تعرف على مجموعة أوبتي - شركة تقنية متخصصة في تطوير تطبيقات ذكية في مجالات الصحة والذكاء الاصطناعي والسياحة. Learn about Opti Group - a tech company specializing in smart apps.',
  alternates: {
    canonical: 'https://opti-group-deploy.vercel.app/about',
  },
  openGraph: {
    title: 'من نحن | Opti Group',
    description: 'تعرف على مجموعة أوبتي - تطبيقات ذكية لحياة أفضل',
    url: 'https://opti-group-deploy.vercel.app/about',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
