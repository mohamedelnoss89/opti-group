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

        {/*
          CRITICAL: CSS-based ad protection system.
          1. Block ads on mobile browser (not standalone + not desktop)
          2. Block PropellerAds/Monetag in ALL modes (sexual/inappropriate content)
          3. Block ads on auth/registration pages (/signup, /login, /auth)
          4. Block ads on desktop when user is NOT authenticated
        */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* ===== CSS AD BLOCKER (mobile browser only) ===== */
              /* Ads allowed on: (1) Desktop browser (2) PWA standalone */
              /* Ads blocked on: Mobile browser (small screen, not installed) */
              html:not(.is-standalone):not(.is-desktop) ins.adsbygoogle,
              html:not(.is-standalone):not(.is-desktop) .adsbygoogle,
              html:not(.is-standalone):not(.is-desktop) .ad-container,
              html:not(.is-standalone):not(.is-desktop) [id*="google_ads"],
              html:not(.is-standalone):not(.is-desktop) iframe[src*="adsbygoogle"],
              html:not(.is-standalone):not(.is-desktop) iframe[src*="googlesyndication"] {
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

              /* ===== PROPELLERADS / MONETAG COMPLETE BLOCK (ALL modes) ===== */
              /* These networks serve sexual/inappropriate ads and are BANNED. */
              [id^="propeller-"],
              [class*="propeller-"],
              [id*="monetag"],
              [class*="monetag"],
              [id*="quge5"],
              [class*="quge5"],
              [id*="nap5k"],
              [class*="nap5k"],
              iframe[src*="quge5"],
              iframe[src*="nap5k"],
              iframe[src*="profitablegate"],
              iframe[src*="propellerads"],
              div[data-zone],
              script[src*="quge5"] + *,
              script[src*="nap5k"] + *,
              script[src*="profitablegate"] + * {
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

              /* ===== AD CONTENT SAFETY FILTER ===== */
              [id*="push-notification"],
              [class*="push-notification"],
              [id*="in-page-push"],
              [class*="in-page-push"],
              [id*="native-push"],
              [class*="native-push"],
              [id*="notification-popup"],
              [class*="notification-popup"],
              [id^="push_"],
              [class^="push_"],
              div[id][style*="position: fixed"][style*="z-index"][style*="9"],
              div[id][style*="position:fixed"][style*="z-index"][style*="9"] {
                display: none !important;
                visibility: hidden !important;
                height: 0 !important;
                pointer-events: none !important;
              }

              /* ===== NO ADS ON AUTH/REGISTRATION PAGES ===== */
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
              html.on-auth-page .ad-slot {
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
          - Desktop: ads show to ALL visitors (no auth required, just cookie consent)
          - Mobile PWA (standalone): ads show when user is authenticated
          - Mobile browser: NO ads at all (clean experience for new visitors)
          - Auth pages (/signup, /login, /auth): NO ads ever
          - PropellerAds/Monetag: BANNED in ALL modes (sexual content)
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
                // Desktop = screen >= 1024px AND not standalone
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

                // ===== STEP 1: Load AdSense =====
                // Desktop: load for all visitors
                // Mobile PWA: load only when authenticated
                // Mobile browser: never load
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

                function loadAdsIfAllowed() {
                  var path = window.location.pathname;
                  if (path === '/signup' || path === '/login' || path === '/auth' || path.indexOf('/auth/') === 0) return;

                  if (isDesktop) {
                    loadAdSense();
                  } else if (isStandalone) {
                    var currentUser = null;
                    try { currentUser = localStorage.getItem('optigroup-current-user'); } catch(e) {}
                    if (currentUser) {
                      loadAdSense();
                    }
                  }
                }

                if (isStandalone || isDesktop) {
                  loadAdsIfAllowed();
                  window.addEventListener('optigroup-load-ads', function() {
                    loadAdsIfAllowed();
                  });
                }

                // Mobile browser: remove any ad elements
                if (!isStandalone && !isDesktop) {
                  function removeAdElements() {
                    var iframes = document.querySelectorAll('iframe[src*="quge5"], iframe[src*="nap5k"], iframe[src*="profitablegate"], iframe[src*="propellerads"], iframe[src*="adsbygoogle"], iframe[src*="googlesyndication"]');
                    for (var i = 0; i < iframes.length; i++) { iframes[i].remove(); }
                    var ins = document.querySelectorAll('ins.adsbygoogle');
                    for (var k = 0; k < ins.length; k++) { ins[k].remove(); }
                  }
                  removeAdElements();
                  setTimeout(removeAdElements, 1000);
                  setTimeout(removeAdElements, 3000);
                }

                // ===== PROPELLERADS / MONETAG NUCLEAR BLOCKER =====
                function nukePropellerAds() {
                  var badScripts = document.querySelectorAll('script[src*="quge5"], script[src*="nap5k"], script[src*="profitablegate"], script[src*="propellerads"]');
                  for (var i = 0; i < badScripts.length; i++) { badScripts[i].remove(); }
                  var badIframes = document.querySelectorAll('iframe[src*="quge5"], iframe[src*="nap5k"], iframe[src*="profitablegate"], iframe[src*="propellerads"]');
                  for (var j = 0; j < badIframes.length; j++) { badIframes[j].remove(); }
                  var zones = document.querySelectorAll('div[data-zone]');
                  for (var k = 0; k < zones.length; k++) { zones[k].remove(); }
                  var badEls = document.querySelectorAll('[id^="propeller-"], [class*="propeller"], [id*="monetag"], [class*="monetag"], [id*="quge5"], [class*="quge5"], [id*="nap5k"], [class*="nap5k"]');
                  for (var m = 0; m < badEls.length; m++) { badEls[m].remove(); }
                }
                nukePropellerAds();
                setTimeout(nukePropellerAds, 500);
                setTimeout(nukePropellerAds, 1000);
                setTimeout(nukePropellerAds, 2000);
                setTimeout(nukePropellerAds, 3000);
                setTimeout(nukePropellerAds, 5000);

                // ===== AD SAFETY MONITOR =====
                var adSafetyObserver = new MutationObserver(function(mutations) {
                  var found = false;
                  for (var i = 0; i < mutations.length; i++) {
                    var added = mutations[i].addedNodes;
                    for (var j = 0; j < added.length; j++) {
                      var node = added[j];
                      if (node.nodeType === 1) {
                        var el = node;
                        var src = el.src || el.getAttribute('src') || '';
                        var dataZone = el.getAttribute('data-zone') || '';
                        var cls = el.className || '';
                        var id = el.id || '';
                        // Always nuke PropellerAds/Monetag
                        if (src.indexOf('quge5') > -1 || src.indexOf('nap5k') > -1 ||
                            src.indexOf('profitablegate') > -1 || src.indexOf('propellerads') > -1 ||
                            dataZone ||
                            cls.indexOf('propeller') > -1 || cls.indexOf('monetag') > -1 ||
                            cls.indexOf('quge5') > -1 || cls.indexOf('nap5k') > -1 ||
                            id.indexOf('propeller') > -1 || id.indexOf('monetag') > -1 ||
                            id.indexOf('quge5') > -1 || id.indexOf('nap5k') > -1) {
                          el.remove();
                          found = true;
                        }
                        // Remove AdSense if: mobile browser OR on auth page
                        var authPath = window.location.pathname;
                        var isOnAuthPage = authPath === '/signup' || authPath === '/login' || authPath === '/auth' || authPath.indexOf('/auth/') === 0;
                        var isMobileBrowser = !isStandalone && !isDesktop;
                        if (isMobileBrowser || isOnAuthPage) {
                          if (src.indexOf('pagead2.googlesyndication') > -1 || cls.indexOf('adsbygoogle') > -1) {
                            el.remove();
                            found = true;
                          }
                        }
                      }
                    }
                  }
                  if (found) {
                    console.log('[OptiGroup] Ad safety: removed inappropriate ad element');
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
