import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ background: "#0a0e1a", color: "#e2e8f0" }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
