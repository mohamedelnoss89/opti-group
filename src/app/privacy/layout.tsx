import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'سياسة الخصوصية - Privacy Policy',
  description: 'سياسة الخصوصية لمجموعة أوبتي - كيف نجمع ونستخدم ونحمي بياناتكم الشخصية. Privacy Policy for Opti Group - how we collect, use, and protect your personal data.',
  alternates: {
    canonical: 'https://opti-group.vercel.app/privacy',
  },
  openGraph: {
    title: 'سياسة الخصوصية | Opti Group',
    description: 'كيف نحمي بياناتكم الشخصية - مجموعة أوبتي',
    url: 'https://opti-group.vercel.app/privacy',
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
