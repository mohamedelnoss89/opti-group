import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Kufi_Arabic } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import CookieConsent from "@/components/CookieConsent";
import AdsterraAd from "@/components/AdsterraAd";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoKufiArabic = Noto_Kufi_Arabic({
  variable: "--font-noto-kufi",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://opti-group.vercel.app"),
  title: {
    default: "Opti Group | مجموعة أوبتي - تطبيقات ذكية لحياة أفضل",
    template: "%s | Opti Group",
  },
  description: "مجموعة أوبتي - تطبيقات ذكية لحياة أفضل. اكتشف تطبيقات الصحة والذكاء الاصطناعي والسياحة والترفيه. Opti Group - Smart Apps for a Better Life.",
  keywords: ["مجموعة أوبتي", "Opti Group", "تطبيقات ذكية", "تطبيقات صحة", "تطبيقات AI", "ذكاء اصطناعي", "سياحة مصر", "OptiSize", "smart apps", "eye health", "Egyptian landmarks"],
  authors: [{ name: "Opti Group", url: "https://opti-group.vercel.app" }],
  creator: "Opti Group",
  publisher: "Opti Group",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ar_EG",
    alternateLocale: "en_US",
    url: "https://opti-group.vercel.app",
    siteName: "Opti Group | مجموعة أوبتي",
    title: "Opti Group | مجموعة أوبتي - تطبيقات ذكية لحياة أفضل",
    description: "مجموعة أوبتي - تطبيقات ذكية لحياة أفضل. اكتشف تطبيقات الصحة والذكاء الاصطناعي والسياحة والترفيه.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Opti Group - تطبيقات ذكية لحياة أفضل",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Opti Group | مجموعة أوبتي",
    description: "تطبيقات ذكية لحياة أفضل - Smart Apps for a Better Life",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://opti-group.vercel.app",
    types: {
      "application/rss+xml": "https://opti-group.vercel.app/feed.xml",
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
  other: {
    "google-adsense-account": "ca-pub-2715535111154362",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" className="antialiased" suppressHydrationWarning>
      <head>
        {/* Google Search Console Verification */}
        <meta name="google-site-verification" content="iDfGIkUmx5IS34mZFNLeinnk6AmyjZnXJzwumZGo5sU" />

        {/* Google AdSense Verification */}
        <meta name="google-adsense-account" content="ca-pub-2715535111154362" />

        {/* Monetag Verification */}
        <meta name="monetag" content="cb1e85204cec32a1e92c546d3075cb32" />

        {/* Adsterra Native Banner */}
        <script async data-cfasync="false" src="https://pl29736070.effectivecpmnetwork.com/02cf7d9902da8d556cfe7f03550e90d9/invoke.js"></script>

        {/* Adsterra Social Bar */}
        <script src="https://pl29736457.effectivecpmnetwork.com/02/10/14/0210141f0370b389f9055df094ac6ca0.js"></script>

        {/* Adsterra Popunder */}
        <script src="https://pl29736459.effectivecpmnetwork.com/48/99/7a/48997ae29fe9b45f47c08dfb88305322.js"></script>

        {/* Monetag OnClick (Popunder) - Zone 249426 */}
        <script src="https://quge5.com/88/tag.min.js" data-zone="249426" async data-cfasync="false"></script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${notoKufiArabic.variable} min-h-screen flex flex-col`}>
        <Providers>
          {/* Ad - Top of every page */}
          <div className="w-full bg-transparent">
            <AdsterraAd type="banner728" className="py-2" />
          </div>

          {children}

          {/* Ad - Bottom of every page */}
          <div className="w-full bg-transparent">
            <AdsterraAd type="native" className="py-3" />
          </div>

          {/* Smart Link - Floating on every page */}
          <div className="fixed bottom-20 right-4 z-40">
            <AdsterraAd type="smartlink" />
          </div>

          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
