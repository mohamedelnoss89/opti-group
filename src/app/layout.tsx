import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import InstallPrompt from "@/components/optisize/InstallPrompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0e1a",
};

export const metadata: Metadata = {
  title: "OptiSize - مركز صحة العين الشامل",
  description:
    "قياس مسافة البؤبؤ، اختبارات النظر، مركز صحة العين، ومعرض النظارات - الدقة في كل تفصيلة",
  keywords: [
    "OptiSize",
    "قياس مسافة البؤبؤ",
    "PD measurement",
    "صحة العين",
    "eye health",
    "نظارات",
    "glasses",
  ],
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "OptiSize",
  },
  openGraph: {
    title: "OptiSize - مركز صحة العين الشامل",
    description:
      "قياس مسافة البؤبؤ، اختبارات النظر، مركز صحة العين، ومعرض النظارات",
    type: "website",
    locale: "ar_EG",
    siteName: "OptiSize",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        {/* PWA Meta Tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="OptiSize" />
        <meta name="msapplication-TileColor" content="#0a0e1a" />
        <meta name="msapplication-navbutton-color" content="#0a0e1a" />

        {/* Inline CSS loader - prevents FOUC / raw HTML on mobile */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* Hide all app content until JS hydrates */
              #app-root { opacity: 0; }
              /* Show CSS-only loader */
              #css-loader {
                position: fixed; inset: 0; z-index: 99999;
                background: #0a0e1a;
                display: flex; flex-direction: column;
                align-items: center; justify-content: center;
                transition: opacity 0.3s ease;
              }
              #css-loader .loader-eye {
                width: 80px; height: 80px;
                border: 2px solid rgba(0,240,255,0.4);
                border-radius: 50%;
                position: relative;
                animation: css-pulse 2s ease-in-out infinite;
              }
              #css-loader .loader-eye::after {
                content: '';
                position: absolute; top: 50%; left: 50%;
                transform: translate(-50%,-50%);
                width: 24px; height: 24px;
                background: #00f0ff;
                border-radius: 50%;
                animation: css-blink 2s ease-in-out infinite;
              }
              #css-loader .loader-text {
                color: #00f0ff; font-size: 24px; font-weight: bold;
                margin-top: 20px; letter-spacing: 4px;
                font-family: system-ui, -apple-system, sans-serif;
              }
              #css-loader .loader-sub {
                color: #64748b; font-size: 12px; margin-top: 8px;
                font-family: system-ui, -apple-system, sans-serif;
              }
              @keyframes css-pulse {
                0%, 100% { box-shadow: 0 0 20px rgba(0,240,255,0.2); }
                50% { box-shadow: 0 0 40px rgba(0,240,255,0.4); }
              }
              @keyframes css-blink {
                0%, 100% { opacity: 1; transform: translate(-50%,-50%) scale(1); }
                50% { opacity: 0.7; transform: translate(-50%,-50%) scale(0.85); }
              }
              /* Once app is hydrated, remove loader and show content */
              #css-loader.app-ready { opacity: 0; pointer-events: none; }
              #app-root.app-ready { opacity: 1; }
            `,
          }}
        />

        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(reg) {
                    console.log('SW registered:', reg.scope);
                  }).catch(function(err) {
                    console.log('SW registration failed:', err);
                  });
                });
              }
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ background: "#0a0e1a", color: "#e2e8f0" }}
      >
        {/* CSS-only loader shown before JS hydrates */}
        <div id="css-loader">
          <div className="loader-eye" />
          <div className="loader-text">OptiSize</div>
          <div className="loader-sub">جاري التحميل...</div>
        </div>
        {/* App root - hidden until JS hydrates */}
        <div id="app-root">{children}</div>
        <Toaster />
        <InstallPrompt />
      </body>
    </html>
  );
}
