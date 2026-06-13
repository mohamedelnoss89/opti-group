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

        {/* Monetag Verification */}
        <meta name="monetag" content="cb1e85204cec32a1e92c546d3075cb32" />

        {/*
          CSS-based ad protection system:
          1. Block ALL ads on mobile browser (not standalone + not desktop)
          2. Block ALL ads on auth/registration pages (/signup, /login, /auth)
          3. Ads allowed on: (a) Desktop browser (b) Mobile PWA standalone
          - Monetag In-Page Push (Zone 249426): allowed on desktop + PWA standalone
          - Google AdSense: allowed on desktop + PWA standalone (when authenticated)
        */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* ===== BLOCK ALL ADS ON MOBILE BROWSER ===== */
              /* Mobile browser = not standalone AND not desktop */
              html:not(.is-standalone):not(.is-desktop) ins.adsbygoogle,
              html:not(.is-standalone):not(.is-desktop) .adsbygoogle,
              html:not(.is-standalone):not(.is-desktop) .ad-container,
              html:not(.is-standalone):not(.is-desktop) [id*="google_ads"],
              html:not(.is-standalone):not(.is-desktop) iframe[src*="adsbygoogle"],
              html:not(.is-standalone):not(.is-desktop) iframe[src*="googlesyndication"],
              html:not(.is-standalone):not(.is-desktop) iframe[src*="n6wxm"],
              html:not(.is-standalone):not(.is-desktop) iframe[src*="quge5"],
              html:not(.is-standalone):not(.is-desktop) div[data-zone],
              html:not(.is-standalone):not(.is-desktop) script[src*="quge5"] + * {
                display: none !important;
                visibility: hidden !important;
                height: 0 !important;
                max-height: 0 !important;
                overflow: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
                position: absolute !important;
                left: -9999px !important;
              }

              /* ===== BLOCK ALL ADS ON AUTH/REGISTRATION PAGES ===== */
              html.on-auth-page ins.adsbygoogle,
              html.on-auth-page .adsbygoogle,
              html.on-auth-page .ad-container,
              html.on-auth-page [id*="google_ads"],
              html.on-auth-page [id*="google_ads_iframe"],
              html.on-auth-page iframe[src*="adsbygoogle"],
              html.on-auth-page iframe[src*="googlesyndication"],
              html.on-auth-page iframe[src*="doubleclick"],
              html.on-auth-page div[data-ad],
              html.on-auth-page div[data-ad-slot],
              html.on-auth-page .ad-banner,
              html.on-auth-page .ad-wrapper,
              html.on-auth-page .ad-slot,
              html.on-auth-page iframe[src*="n6wxm"],
              html.on-auth-page iframe[src*="quge5"],
              html.on-auth-page div[data-zone],
              html.on-auth-page script[src*="quge5"] + * {
                display: none !important;
                visibility: hidden !important;
                height: 0 !important;
                max-height: 0 !important;
                overflow: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
                position: absolute !important;
                left: -9999px !important;
              }
            `,
          }}
        />

        {/*
          ====== OPTI GROUP AD MANAGEMENT ======

          Ad display rules:
          - Desktop: ads show to ALL visitors (no auth required)
          - Mobile PWA (standalone): ads show when user is authenticated
          - Mobile browser: NO ads at all
          - Auth pages (/signup, /login, /auth): NO ads ever
          - Monetag Vignette (Zone 11143210): shows on desktop + PWA standalone
          - Google AdSense: shows on desktop + PWA standalone (when authenticated)
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // ===== STEP 0: Detect standalone mode =====
                var isStandalone = window.matchMedia('(display-mode:standalone)').matches || (window.navigator && window.navigator.standalone === true);
                if (isStandalone) {
                  document.documentElement.classList.add('is-standalone');
                }

                // ===== STEP 0a: Detect desktop mode =====
                var isDesktop = !isStandalone && window.innerWidth >= 1024;
                if (isDesktop) {
                  document.documentElement.classList.add('is-desktop');
                }
                window.addEventListener('resize', function() {
                  var nowDesktop = !isStandalone && window.innerWidth >= 1024;
                  if (nowDesktop !== isDesktop) {
                    isDesktop = nowDesktop;
                    if (isDesktop) {
                      document.documentElement.classList.add('is-desktop');
                    } else {
                      document.documentElement.classList.remove('is-desktop');
                    }
                  }
                });

                // ===== STEP 0b: Detect auth pages =====
                function updateAuthPageClass() {
                  var path = window.location.pathname;
                  var isAuthPage = path === '/signup' || path === '/login' || path === '/auth' || path.indexOf('/auth/') === 0;
                  if (isAuthPage) {
                    document.documentElement.classList.add('on-auth-page');
                  } else {
                    document.documentElement.classList.remove('on-auth-page');
                  }
                }
                updateAuthPageClass();
                window.addEventListener('popstate', updateAuthPageClass);
                var origPushState = history.pushState;
                var origReplaceState = history.replaceState;
                history.pushState = function() {
                  origPushState.apply(this, arguments);
                  updateAuthPageClass();
                };
                history.replaceState = function() {
                  origReplaceState.apply(this, arguments);
                  updateAuthPageClass();
                };

                // ===== STEP 1: Load Google AdSense =====
                function loadAdSense() {
                  if (document.getElementById('optigroup-adsense-script')) return;
                  var g = document.createElement('script');
                  g.id = 'optigroup-adsense-script';
                  g.async = true;
                  g.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2715535111154362';
                  g.setAttribute('crossorigin', 'anonymous');
                  document.head.appendChild(g);
                  console.log('[OptiGroup] AdSense loaded (' + (isDesktop ? 'desktop' : isStandalone ? 'standalone' : 'unknown') + ')');
                }

                // ===== STEP 2: Load Monetag In-Page Push Banner =====
                // Zone ID: 249426 - In-Page Push format (sidebar banner with close button)
                // EXACT original Monetag code - do NOT modify
                function loadMonetagInPagePush() {
                  if (window.__optigroupMonetagLoaded) return;
                  window.__optigroupMonetagLoaded = true;
                  var s = document.createElement('script');
                  s.src = 'https://quge5.com/88/tag.min.js';
                  s.setAttribute('data-zone', '249426');
                  s.async = true;
                  s.setAttribute('data-cfasync', 'false');
                  document.head.appendChild(s);
                  console.log('[OptiGroup] Monetag In-Page Push loaded (' + (isDesktop ? 'desktop' : isStandalone ? 'standalone' : 'unknown') + ')');
                }

                // Check if user is authenticated via Supabase
                function isSupabaseAuthenticated() {
                  try {
                    for (var i = 0; i < localStorage.length; i++) {
                      var key = localStorage.key(i);
                      if (key && key.indexOf('-auth-token') > -1) {
                        var value = localStorage.getItem(key);
                        if (value) {
                          try {
                            var parsed = JSON.parse(value);
                            if (parsed.access_token || (parsed[0] && parsed[0].access_token)) {
                              return true;
                            }
                          } catch(e) {
                            if (value.length > 10) return true;
                          }
                        }
                      }
                    }
                  } catch(e) {}
                  return false;
                }

                function loadAdsIfAllowed() {
                  var path = window.location.pathname;
                  if (path === '/signup' || path === '/login' || path === '/auth' || path.indexOf('/auth/') === 0) return;

                  if (isDesktop) {
                    // Desktop: load ALL ads for ALL visitors (no auth required)
                    loadAdSense();
                  } else if (isStandalone) {
                    // Mobile PWA: only load ads when user is authenticated via Supabase
                    if (isSupabaseAuthenticated()) {
                      loadAdSense();
                    }
                  }
                  // Mobile browser: no ads at all
                }

                if (isStandalone || isDesktop) {
                  // Load AdSense immediately (head is available)
                  loadAdsIfAllowed();
                  // Load Monetag In-Page Push
                  // Desktop: always load, PWA: only when authenticated
                  function tryLoadMonetag() {
                    if (isDesktop || (isStandalone && isSupabaseAuthenticated())) {
                      loadMonetagInPagePush();
                    }
                  }
                  tryLoadMonetag();
                  // Listen for ad loading requests (after auth change)
                  window.addEventListener('optigroup-load-ads', function() {
                    loadAdsIfAllowed();
                    tryLoadMonetag();
                  });
                  // Also re-check periodically for Supabase auth (catches Google OAuth redirects)
                  setTimeout(function() { loadAdsIfAllowed(); tryLoadMonetag(); }, 1000);
                  setTimeout(function() { loadAdsIfAllowed(); tryLoadMonetag(); }, 2000);
                  setTimeout(function() { loadAdsIfAllowed(); tryLoadMonetag(); }, 5000);
                }

                // Mobile browser: remove any ad elements that might have loaded
                if (!isStandalone && !isDesktop) {
                  function removeAdElements() {
                    var iframes = document.querySelectorAll('iframe[src*="adsbygoogle"], iframe[src*="googlesyndication"], iframe[src*="n6wxm"], iframe[src*="quge5"]');
                    for (var i = 0; i < iframes.length; i++) { iframes[i].remove(); }
                    var ins = document.querySelectorAll('ins.adsbygoogle');
                    for (var k = 0; k < ins.length; k++) { ins[k].remove(); }
                    var zones = document.querySelectorAll('div[data-zone]');
                    for (var m = 0; m < zones.length; m++) { zones[m].remove(); }
                  }
                  removeAdElements();
                  setTimeout(removeAdElements, 1000);
                  setTimeout(removeAdElements, 3000);
                }

                // ===== AD SAFETY MONITOR =====
                // Removes ads on auth pages and mobile browser (both AdSense + Monetag)
                var adSafetyObserver = new MutationObserver(function(mutations) {
                  var found = false;
                  for (var i = 0; i < mutations.length; i++) {
                    var added = mutations[i].addedNodes;
                    for (var j = 0; j < added.length; j++) {
                      var node = added[j];
                      if (node.nodeType === 1) {
                        var el = node;
                        var src = el.src || el.getAttribute('src') || '';
                        var cls = el.className || '';
                        var authPath = window.location.pathname;
                        var isOnAuthPage = authPath === '/signup' || authPath === '/login' || authPath === '/auth' || authPath.indexOf('/auth/') === 0;
                        var isMobileBrowser = !isStandalone && !isDesktop;
                        // Remove ANY ad (AdSense + Monetag) on auth pages and mobile browser
                        if (isMobileBrowser || isOnAuthPage) {
                          if (src.indexOf('pagead2.googlesyndication') > -1 || cls.indexOf('adsbygoogle') > -1 ||
                              src.indexOf('n6wxm') > -1 || src.indexOf('quge5') > -1 || el.getAttribute('data-zone')) {
                            el.remove();
                            found = true;
                          }
                        }
                      }
                    }
                  }
                  if (found) {
                    console.log('[OptiGroup] Ad safety: removed ad element (auth page or mobile browser)');
                  }
                });
                adSafetyObserver.observe(document.documentElement, { childList: true, subtree: true });
                setTimeout(function() { adSafetyObserver.disconnect(); }, 60000);
              })();
            `,
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
