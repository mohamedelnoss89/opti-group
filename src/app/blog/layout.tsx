import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'المدونة - Blog',
  description: 'آخر الأخبار والمقالات من مجموعة أوبتي عن الصحة والذكاء الاصطناعي والسياحة والتحديثات. Latest news and articles from Opti Group about health, AI, tourism, and updates.',
  alternates: {
    canonical: 'https://opti-group-deploy.vercel.app/blog',
  },
  openGraph: {
    title: 'المدونة | Opti Group',
    description: 'آخر الأخبار والمقالات من مجموعة أوبتي',
    url: 'https://opti-group-deploy.vercel.app/blog',
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
