import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Kufi_Arabic } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import AdLayout from "@/components/AdLayout";

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

        {/* HilltopAds Verification */}
        <meta name="d182d280dd940bf59213757c162a6be7aab3a8f5" content="d182d280dd940bf59213757c162a6be7aab3a8f5" />

        {/* HilltopAds - زيادة الأرباح حتى 20% */}
        <meta name="referrer" content="no-referrer-when-downgrade" />

        {/* Ad scripts moved to AdLayout component for per-page control */}

        {/* CSS إخفاء الإعلانات في صفحات التسجيل والإعداد */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              body.no-ads [id*="effectivecpmnetwork"],
              body.no-ads [id*="pl29736"],
              body.no-ads [id*="highperformanceformat"],
              body.no-ads [id*="container-02cf7d"],
              body.no-ads [id*="adsterra"],
              body.no-ads [class*="quge5"],
              body.no-ads [class*="adsterra"],
              body.no-ads [class*="effectivecpmnetwork"],
              body.no-ads iframe[src*="effectivecpmnetwork"],
              body.no-ads iframe[src*="quge5"],
              body.no-ads iframe[src*="highperformanceformat"],
              body.no-ads iframe[src*="adsterra"],
              body.no-ads iframe[src*="cpmnetwork"],
              body.no-ads #adsterra-banner728,
              body.no-ads #adsterra-native,
              body.no-ads #adsterra-smartlink,
              body.no-ads .fixed.bottom-20,
              body.no-ads iframe[width="0"],
              body.no-ads iframe[height="0"],
              body.no-ads iframe[style*="display: none"],
              body.no-ads iframe[style*="visibility: hidden"],
              body.no-ads div[id^="ad-"],
              body.no-ads div[id^="ads-"],
              body.no-ads div[class^="ad-"],
              body.no-ads div[class^="ads-"],
              body.no-ads a[href*="effectivecpmnetwork"],
              body.no-ads a[href*="quge5"],
              body.no-ads a[href*="highperformanceformat"] {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
                position: absolute !important;
                left: -9999px !important;
                top: -9999px !important;
                width: 0 !important;
                height: 0 !important;
                overflow: hidden !important;
                z-index: -9999 !important;
              }
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${notoKufiArabic.variable} min-h-screen flex flex-col`}>
        <Providers>
          <AdLayout>{children}</AdLayout>
        </Providers>
      </body>
    </html>
  );
}
