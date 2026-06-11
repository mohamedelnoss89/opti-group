import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Kufi_Arabic } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import CookieConsent from "@/components/CookieConsent";

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

        {/* PropellerAds / Monetag Verification */}
        <meta name="monetag" content="6346a7d55beb483ec3cdc659d2edfeb1" />

        {/* ALL ADS - Only load when app is installed (standalone mode) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
              var isStandalone=window.matchMedia('(display-mode:standalone)').matches||(window.navigator&&window.navigator.standalone===true);
              if(isStandalone){
                var g=document.createElement('script');g.async=true;g.src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2715535111154362';g.setAttribute('crossorigin','anonymous');document.head.appendChild(g);
                var s1=document.createElement('script');s1.src='https://quge5.com/88/tag.min.js';s1.setAttribute('data-zone','247662');s1.async=true;s1.setAttribute('data-cfasync','false');document.head.appendChild(s1);
                var s2=document.createElement('script');s2.src='https://quge5.com/88/tag.min.js';s2.setAttribute('data-zone','247661');s2.async=true;s2.setAttribute('data-cfasync','false');document.head.appendChild(s2);
                var s3=document.createElement('script');s3.dataset.zone='11133741';s3.src='https://nap5k.com/tag.min.js';s3.async=true;s3.setAttribute('data-cfasync','false');document.body.appendChild(s3);
              }
            })();`,
          }}
        />
        {/* RSS Auto-Discovery */}
        <link rel="alternate" type="application/rss+xml" title="Opti Group Blog" href="/feed.xml" />
        {/* Structured Data - JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Opti Group",
              "alternateName": "مجموعة أوبتي",
              "url": "https://opti-group.vercel.app",
              "logo": "https://opti-group.vercel.app/favicon.ico",
              "description": "مجموعة أوبتي - تطبيقات ذكية لحياة أفضل. Opti Group - Smart Apps for a Better Life.",
              "sameAs": [
                "https://www.facebook.com/profile.php?id=61575021874974",
                "https://www.youtube.com/@OptiGroup1",
                "https://www.tiktok.com/@optigroup1",
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "email": "mohamed10.mohamed10@gmail.com",
                "contactType": "customer support",
                "availableLanguage": ["Arabic", "English"],
              },
              "applicationCategory": "UtilitiesApplication",
              "operatingSystem": "Web",
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Opti Group",
              "alternateName": "مجموعة أوبتي",
              "url": "https://opti-group.vercel.app",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://opti-group.vercel.app/?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${notoKufiArabic.variable} min-h-screen flex flex-col`}>
        <Providers>
          {children}
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
