/**
 * Dynamic Product Landing Page - Landing page singolo cartello con routing dinamico
 * 
 * Supporta URL diretti nel formato /public/product/QR001 per accesso rapido:
 * 
 * **URL Patterns:**
 * - /public/product/QR001 - Accesso diretto tramite QR code
 * - /public/product/QR001?role=employee - Con role per utente autenticato  
 * - /public/product/QR001?maintenance=true - Avvia direttamente manutenzione
 * 
 * **Layout Structure (come richiesto):**
 * - H1 con nome/identificativo cartello
 * - Sinistra: foto del cartello con metadati blockchain
 * - Destra: informazioni complete (nome, ID, installazione, tipologia, ditta)
 * - Bottoni CTA: Verifica On-Chain, Scarica Certificato
 * 
 * **User Roles Support:**
 * 1. **Utente Pubblico**: Scan QR senza login, visualizza dati base
 * 2. **Manutentore**: Login + scan, modale manutenzione dedicata
 * 3. **Produttore**: Verifica azioni effettuate e pending, tokenizzazione
 * 
 * **Mock Features Implemented:**
 * - Blockchain verification mock con transaction hash e explorer links
 * - PDF certificate download simulation con contenuto dettagliato
 * - Installation data completa con tecnico, certificazioni, garanzie
 * - Pending actions per produttori con priorità e scadenze
 * - Role-based actions e permissions
 * 
 * **Performance:**
 * - Server-side metadata generation per SEO
 * - Dynamic imports per componenti pesanti
 * - Responsive design mobile-first
 * - Loading states per operazioni async
 * 
 * **TODO:** Static generation per QR codes frequenti, offline support
 */

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { QrCode } from "lucide-react";
import ProductLandingClient from "./ProductLandingClient";
import { mockProducts, getInstallationData, getCompanyById } from "@/lib/mock-data";

// Interfaccia per i parametri della pagina (Next.js 15)
interface PageProps {
  params: Promise<{ qr: string }>;
  searchParams: Promise<{ role?: string; maintenance?: string }>;
}

/**
 * Genera metadata dinamici per SEO ottimizzato
 * Crea title, description e Open Graph tags specifici per ogni prodotto
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // Aspetta params promise (Next.js 15)
  const { qr } = await params;
  
  // Decodifica il QR code dall'URL
  const qrCode = decodeURIComponent(qr);
  
  // Trova il prodotto corrispondente
  const product = mockProducts.find(p => p.qr_code === qrCode);
  
  // Se prodotto non esiste, metadata di fallback
  if (!product) {
    return {
      title: `Prodotto ${qrCode} - Non Trovato | CertificablePlus`,
      description: `Il prodotto con QR code ${qrCode} non è stato trovato nel database.`,
      robots: 'noindex, nofollow'
    };
  }

  // Carica dati aggiuntivi per metadata ricchi
  const company = getCompanyById(product.companyId);
  const installationData = getInstallationData(qrCode);
  
  return {
    title: `${product.tipo_segnale} (${qrCode}) | CertificablePlus`,
    description: `${product.tipo_segnale} installato nel ${product.anno}. Materiale: ${product.materiale_supporto}, Dimensioni: ${product.dimensioni}. Certificato da ${company?.name}.`,
    keywords: [
      product.tipo_segnale,
      qrCode,
      product.materiale_supporto,
      'segnaletica stradale',
      'certificazione',
      'blockchain',
      company?.name || ''
    ].filter(Boolean),
    
    // Open Graph per social sharing
    openGraph: {
      title: `${product.tipo_segnale} - Certificato`,
      description: `Verifica autenticità e scarica certificazione per ${product.tipo_segnale}`,
      type: 'article',
      images: [
        {
          url: product.figura || '/default-product.jpg',
          width: 800,
          height: 600,
          alt: product.tipo_segnale
        }
      ],
      siteName: 'CertificablePlus',
      locale: 'it_IT'
    },
    
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: `${product.tipo_segnale} - Verifica Certificazione`,
      description: `QR: ${qrCode} - Installato da ${company?.name}`,
      images: [product.figura || '/default-product.jpg']
    },
    
    // Structured data per Google Rich Results
    other: {
      'product:brand': company?.name || '',
      'product:availability': 'in_stock',
      'product:condition': 'new',
      'article:published_time': product.createdAt,
      'article:modified_time': product.updatedAt
    },

    // Canonical URL
    alternates: {
      canonical: `/public/product/${qrCode}`
    }
  };
}

/**
 * Genera static params per pre-rendering dei QR codes più comuni
 * Migliora performance per prodotti frequentemente accessati
 */
export async function generateStaticParams() {
  // In produzione, questi potrebbero venire da database analytics
  // Per ora, generiamo per i primi 10 prodotti più recenti
  const topProducts = mockProducts
    .slice(0, 10)
    .map(product => ({
      qr: encodeURIComponent(product.qr_code)
    }));

  return topProducts;
}

/**
 * Component Server principale della pagina
 * Gestisce validazione QR code e caricamento dati server-side
 */
export default async function DynamicProductPage({ params, searchParams }: PageProps) {
  // Aspetta params e searchParams promises (Next.js 15)
  const { qr } = await params;
  const searchParamsResolved = await searchParams;
  
  // Decodifica QR code dall'URL
  const qrCode = decodeURIComponent(qr);
  
  // Validazione formato QR code (deve iniziare con QR)
  if (!qrCode || !qrCode.startsWith('QR')) {
    notFound();
  }
  
  // Verifica che il prodotto esista
  const product = mockProducts.find(p => p.qr_code === qrCode);
  if (!product) {
    notFound();
  }

  // Pre-carica dati server-side per performance
  const serverData = {
    qrCode,
    product,
    role: searchParamsResolved.role,
    autoStartMaintenance: searchParamsResolved.maintenance === 'true'
  };

  return (
    <Suspense 
      fallback={
        <ProductLoadingFallback qrCode={qrCode} />
      }
    >
      <ProductLandingClient {...serverData} />
    </Suspense>
  );
}

/**
 * Loading fallback ottimizzato con skeleton dei contenuti principali
 * Mantiene layout stabile durante il caricamento
 */
function ProductLoadingFallback({ qrCode }: { qrCode: string }) {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header skeleton */}
      <header className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="w-20 h-8 bg-muted rounded animate-pulse" />
              <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-lg">
                <QrCode className="w-4 h-4 text-primary" />
                <span className="font-mono text-sm font-bold text-primary">{qrCode}</span>
              </div>
            </div>
            <div className="w-8 h-8 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title skeleton */}
        <div className="text-center mb-8">
          <div className="h-12 bg-muted rounded w-2/3 mx-auto mb-4 animate-pulse" />
          <div className="flex justify-center gap-4">
            <div className="h-6 bg-muted rounded w-24 animate-pulse" />
            <div className="h-6 bg-muted rounded w-32 animate-pulse" />
          </div>
        </div>

        {/* Main content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Image skeleton */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-lg animate-pulse" />
            <div className="h-32 bg-muted rounded-lg animate-pulse" />
          </div>
          
          {/* Info skeleton */}
          <div className="space-y-6">
            <div className="h-64 bg-muted rounded-lg animate-pulse" />
            <div className="h-48 bg-muted rounded-lg animate-pulse" />
          </div>
        </div>

        {/* CTA buttons skeleton */}
        <div className="max-w-3xl mx-auto">
          <div className="h-48 bg-muted rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
}