/**
 * Root Layout - Layout globale dell'applicazione CertificablePlus
 *
 * Questo è il layout principale che avvolge tutte le pagine dell'applicazione.
 * Configura:
 * - Font system (Geist Sans e Mono)
 * - Theme provider per dark/light mode con system preference
 * - Toast notifications (Sonner) per feedback utente
 * - Performance monitoring (Web Vitals e Resource Monitor)
 * - Metadata SEO di base
 * - Configurazione HTML globale (lang="it", suppressHydrationWarning)
 *
 * Performance Features:
 * - Server Component per ottimizzazioni SSR
 * - Theme provider con transizioni ottimizzate
 * - Web Vitals tracking automatico
 * - Performance monitoring in development
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/contexts";
import { WebVitalsTracker } from "@/components/WebVitalsTracker";
import { PerformanceMonitor } from "@/components/PerformanceMonitor";
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
  title: "Certificable Plus",
  description: "Piattaforma per la gestione e tracciamento di dispositivi certificati",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppProvider>
          {children}
          <Toaster />
          <WebVitalsTracker />
          <PerformanceMonitor />
        </AppProvider>
      </body>
    </html>
  );
}
