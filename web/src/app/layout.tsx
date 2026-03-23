import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "../components/BottomNav";
import { DesktopSidebar } from "../components/DesktopSidebar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Portal Cafe",
  description: "Controle Financeiro Minimalista",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Cafe",
  },
};

import AuthWrapper from "../components/AuthWrapper";
import { ThemeScript } from "../components/ThemeScript";
import { PWAProvider } from "../components/PWAProvider";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0c0a09", // stone-950
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>☕</text></svg>" />
        <ThemeScript />
      </head>
      <body className={`${inter.variable} font-sans bg-background text-foreground min-h-screen flex flex-col md:flex-row transition-colors duration-300`}>
        <PWAProvider>
          <AuthWrapper
            sidebar={<DesktopSidebar />}
            bottomNav={<BottomNav />}
          >
            {children}
          </AuthWrapper>
        </PWAProvider>
      </body>
    </html>
  );
}
