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
  other: {
    "google-adsense-account": "ca-pub-9431864894722327",
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
        {/* Google AdSense Verification - Meta Tag */}
        <meta name="google-adsense-account" content="ca-pub-9431864894722327" />

        {/* Google AdSense Script - Disabled until AdSense approval */}
        {/* <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9431864894722327"
          crossOrigin="anonymous"
        /> */}

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

        {/* ====== رمز N v2 — AUTO-UPDATE VERSION CHECK + AGGRESSIVE CACHE CLEAR ====== */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var CURRENT_VERSION = 106;

                // ===== STEP 1: Check local version — if outdated, FORCE CLEAR =====
                var localVer = parseInt(localStorage.getItem('optisize-ver') || '0', 10);

                if (localVer < CURRENT_VERSION) {
                  console.log('N: Old version detected (' + localVer + ' < ' + CURRENT_VERSION + '), clearing everything...');

                  // 1a: Delete ALL caches
                  var clearCaches = function() {
                    if ('caches' in window) {
                      return caches.keys().then(function(names) {
                        return Promise.all(names.map(function(n) { return caches.delete(n); }));
                      });
                    }
                    return Promise.resolve();
                  };

                  // 1b: Unregister ALL service workers
                  var clearSWs = function() {
                    if ('serviceWorker' in navigator) {
                      return navigator.serviceWorker.getRegistrations().then(function(regs) {
                        return Promise.all(regs.map(function(r) { return r.unregister(); }));
                      });
                    }
                    return Promise.resolve();
                  };

                  // 1c: Clear old localStorage data (but NOT user account!)
                  localStorage.removeItem('optisize-cache-cleared');
                  localStorage.removeItem('optisize-screen');
                  localStorage.removeItem('optisize-history');
                  localStorage.removeItem('optisize-splash-shown');
                  localStorage.removeItem('N-done');
                  localStorage.removeItem('N-done-100');

                  // 1d: Mark new version as done BEFORE reload (prevents infinite loop)
                  localStorage.setItem('optisize-ver', String(CURRENT_VERSION));

                  // 1e: Clear everything then reload
                  var reloadTimer = setTimeout(function() {
                    window.location.reload();
                  }, 2000);

                  clearCaches().then(function() {
                    clearSWs().then(function() {
                      clearTimeout(reloadTimer);
                      console.log('N: Everything cleared, reloading...');
                      window.location.reload();
                    });
                  });

                  return; // Stop here — page will reload
                }

                // ===== STEP 2: Also check server version via API (SW does NOT intercept API calls!) =====
                // This is the KEY innovation — even if old SW serves old HTML,
                // the API call goes directly to the server and returns the real version
                fetch('/api/version', { cache: 'no-store' }).then(function(r) { return r.json(); }).then(function(data) {
                  if (data.version && data.version > CURRENT_VERSION) {
                    console.log('N: Server has newer version (' + data.version + '), force updating...');
                    localStorage.setItem('optisize-ver', String(data.version));

                    // Clear everything and reload
                    if ('caches' in window) {
                      caches.keys().then(function(names) {
                        Promise.all(names.map(function(n) { return caches.delete(n); }));
                      });
                    }
                    if ('serviceWorker' in navigator) {
                      navigator.serviceWorker.getRegistrations().then(function(regs) {
                        regs.forEach(function(r) { r.unregister(); });
                      });
                    }

                    setTimeout(function() {
                      window.location.reload();
                    }, 500);
                  }
                }).catch(function() {
                  // Offline or error — that's fine, check next time
                });

                // ===== STEP 3: Register SW ======
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js?v=106').then(function(reg) {
                      console.log('N: SW registered v106');

                      // Force new SW to activate immediately
                      reg.addEventListener('updatefound', function() {
                        var nw = reg.installing;
                        nw.addEventListener('statechange', function() {
                          if (nw.state === 'installed' && navigator.serviceWorker.controller) {
                            nw.postMessage({ type: 'SKIP_WAITING' });
                          }
                        });
                      });

                      // When new SW takes over, reload once
                      var refreshing = false;
                      navigator.serviceWorker.addEventListener('controllerchange', function() {
                        if (!refreshing) {
                          refreshing = true;
                          window.location.reload();
                        }
                      });

                      // Check for updates every 30 seconds
                      setInterval(function() {
                        reg.update();
                      }, 30000);
                    }).catch(function(err) {
                      console.log('N: SW registration failed:', err);
                    });
                  });
                }

                // ===== STEP 4: Periodic version check every 5 minutes =====
                setInterval(function() {
                  fetch('/api/version', { cache: 'no-store' }).then(function(r) { return r.json(); }).then(function(data) {
                    if (data.version && data.version > CURRENT_VERSION) {
                      localStorage.setItem('optisize-ver', String(data.version));
                      if ('caches' in window) {
                        caches.keys().then(function(names) {
                          Promise.all(names.map(function(n) { return caches.delete(n); })).then(function() {
                            window.location.reload();
                          });
                        });
                      } else {
                        window.location.reload();
                      }
                    }
                  }).catch(function() {});
                }, 5 * 60 * 1000);
              })();
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
