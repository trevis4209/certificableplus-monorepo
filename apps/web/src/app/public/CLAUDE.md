# CLAUDE.md - /src/app/public

Sezione pubblica per accesso senza autenticazione a catalogo prodotti e informazioni aziendali.

## 📁 Struttura

```
public/
├── products/           # Catalogo prodotti pubblico
│   └── page.tsx
├── map/               # Mappa pubblica prodotti installati
│   └── page.tsx
└── view/              # Vista dettaglio singolo prodotto
    └── page.tsx
```

## 🎯 Scopo e Funzionalità

### Target Users: **Pubblico Generale**
- **Accesso**: Nessuna autenticazione richiesta
- **SEO Optimized**: Contenuti indicizzabili dai motori di ricerca
- **Brand Awareness**: Vetrina pubblica per aziende partner
- **Transparency**: Trasparenza su prodotti installati sul territorio

### Core Features
1. **Public Product Catalog** - Catalogo prodotti consultabile
2. **Interactive Map** - Mappa pubblica prodotti installati
3. **Product Details** - Schede prodotto dettagliate
4. **Company Branding** - Esposizione brand aziende partner
5. **QR Code Landing** - Destinazione scan QR codes pubblici

## 🏗️ Architettura SEO-First

### Server-Side Rendering Strategy
```typescript
// Tutte le pagine public sono Server Components per SEO
export default async function PublicProductsPage({
  searchParams
}: {
  searchParams: { category?: string; location?: string; search?: string }
}) {
  // Server-side data fetching per SEO
  const products = await getPublicProducts({
    category: searchParams.category,
    location: searchParams.location,
    search: searchParams.search
  });
  
  return (
    <>
      {/* SEO Meta tags */}
      <PublicProductCatalog products={products} />
    </>
  );
}

// Dynamic metadata per SEO
export async function generateMetadata({ searchParams }) {
  const category = searchParams.category;
  
  return {
    title: `${category ? category + ' - ' : ''}Catalogo Prodotti Certificati | CertificablePlus`,
    description: `Esplora il catalogo pubblico di prodotti certificati ${category || 'per la sicurezza stradale'}. Trasparenza e qualità garantita.`,
    keywords: ['segnaletica', 'sicurezza stradale', 'prodotti certificati', category].filter(Boolean),
    openGraph: {
      title: `Catalogo Prodotti Certificati${category ? ` - ${category}` : ''}`,
      description: "Trasparenza e qualità nei prodotti per la sicurezza stradale",
      type: 'website',
      images: ['/og-catalog.jpg']
    }
  };
}
```

## 📊 Pagine e Responsabilità

### 1. Public Catalog (/public/products)
**Scopo**: Vetrina pubblica catalogo prodotti con funzionalità di ricerca

```typescript
interface PublicProductsData {
  products: PublicProduct[];      // Subset sicuro dei dati
  categories: ProductCategory[];
  companies: PublicCompany[];     // Info aziende (nome, logo)
  totalCount: number;
  filters: AvailableFilters;
}

// Versione pubblica sicura del Product
interface PublicProduct {
  id: string;
  tipo_segnale: string;
  anno: number;
  forma: string;
  dimensioni: string;
  materiale_supporto: string;
  figura_url?: string;
  qr_code: string;               // Per link diretti
  
  // Localizzazione generica (privacy)
  city?: string;                 // Solo città, non GPS preciso
  region?: string;
  
  // Info azienda (branding)
  company: {
    name: string;
    logo_url?: string;
  };
  
  // Metadata pubbliche
  installationYear: number;
  certificationLevel: string;
  maintenanceStatus: 'recent' | 'scheduled' | 'overdue';
}
```

**Public Features**:
- **Advanced Search**: Ricerca per tipo, materiale, dimensioni, zona
- **Category Filtering**: Filtri per categoria segnaletica
- **Company Showcase**: Vetrina aziende con prodotti installati  
- **Location-based Search**: Ricerca per città/regione
- **Certification Display**: Badge certificazioni e compliance

**SEO Optimizations**:
```typescript
// Structured data per Google Rich Results
const productStructuredData = {
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": product.tipo_segnale,
  "description": `${product.tipo_segnale} in ${product.materiale_supporto}, dimensioni ${product.dimensioni}`,
  "image": product.figura_url,
  "brand": {
    "@type": "Brand",
    "name": product.company.name
  },
  "manufacturer": product.company.name,
  "productionDate": product.anno,
  "category": product.tipo_segnale,
  "additionalProperty": [
    {
      "@type": "PropertyValue", 
      "name": "Materiale",
      "value": product.materiale_supporto
    },
    {
      "@type": "PropertyValue",
      "name": "Dimensioni", 
      "value": product.dimensioni
    }
  ]
};
```

### 2. Public Map (/public/map)
**Scopo**: Mappa interattiva pubblica con prodotti installati (privacy-safe)

**Map Features**:
- **Cluster View**: Raggruppamento per zone geografiche
- **Privacy Protection**: Coordinate approssimative (100m radius)
- **Filter Overlay**: Filtri per tipo prodotto e azienda
- **Info Popups**: Informazioni base su click
- **Company Branding**: Logo aziende sui marker cluster

**Privacy-Safe Data**:
```typescript
interface PublicMapData {
  productClusters: Array<{
    center: {
      lat: number;        // Approssimato a 100m
      lng: number;        // Approssimato a 100m
    };
    productCount: number;
    predominantType: string;
    companies: string[];   // Nomi aziende nell'area
    installationPeriod: string; // "2020-2024"
  }>;
  
  mapBounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  
  statistics: {
    totalProducts: number;
    coverageArea: string;
    participatingCompanies: number;
  };
}
```

**Interactive Features**:
```tsx
<PublicMap
  clusters={mapData.productClusters}
  onClusterClick={handleClusterExpand}
  onMarkerClick={handleProductInfo}
  defaultZoom={10}
  showCompanyLogos={true}
  enableSearch={true}
  showStatistics={true}
/>
```

### 3. Product Detail View (/public/view)
**Scopo**: Landing page per QR code scans e link diretti a prodotti

**URL Structure**:
```
/public/view?qr=QR001                    # QR code lookup
/public/view/product-id                  # Direct product link  
/public/view?company=company-name        # Company showcase
```

**Product Detail Data**:
```typescript
interface PublicProductDetail {
  product: PublicProduct;
  
  // Informazioni tecniche pubbliche
  specifications: {
    technicalSpecs: TechnicalSpec[];
    certifications: Certification[];
    compliance: ComplianceInfo[];
    materials: MaterialInfo[];
  };
  
  // Storico pubblico (non sensibile)
  publicHistory: {
    installationDate: string;
    lastInspection: string;    // Solo data, no dettagli
    certificationRenewal: string;
    complianceStatus: 'current' | 'pending' | 'expired';
  };
  
  // Info azienda estese
  companyInfo: {
    name: string;
    logo: string;
    website?: string;
    description?: string;
    establishedYear?: number;
    certifications?: string[];
  };
  
  // Posizione geografica generica
  location: {
    city: string;
    region: string;
    country: string;
    // NO coordinate precise
  };
}
```

**QR Code Integration**:
```typescript
// Handle QR code scans per pubblico
export default async function PublicViewPage({ 
  searchParams 
}: { 
  searchParams: { qr?: string; id?: string } 
}) {
  let product: PublicProductDetail | null = null;
  
  if (searchParams.qr) {
    // QR code lookup
    product = await getProductByQRCode(searchParams.qr);
  } else if (searchParams.id) {
    // Direct product lookup
    product = await getPublicProductById(searchParams.id);
  }
  
  if (!product) {
    return <ProductNotFoundPage />;
  }
  
  return (
    <>
      {/* Dynamic SEO meta */}
      <ProductDetailView product={product} />
    </>
  );
}
```

## 🔒 Privacy & Security

### Data Privacy Protection
```typescript
// Data sanitization per pubblico
export function sanitizeProductForPublic(product: Product): PublicProduct {
  return {
    id: product.id,
    tipo_segnale: product.tipo_segnale,
    anno: product.anno,
    forma: product.forma,
    dimensioni: product.dimensioni,
    materiale_supporto: product.materiale_supporto,
    figura_url: product.figura_url,
    qr_code: product.qr_code,
    
    // Privacy protection
    city: extractCityFromGPS(product.gps_lat, product.gps_lng),
    region: extractRegionFromGPS(product.gps_lat, product.gps_lng),
    // NO GPS coordinates precise
    
    company: {
      name: product.company.name,
      logo_url: product.company.logo_url
      // NO email, contatti, dati sensibili
    },
    
    installationYear: product.anno,
    certificationLevel: determineCertificationLevel(product),
    maintenanceStatus: getPublicMaintenanceStatus(product)
  };
}
```

### Access Control
- **No Authentication Required**: Accesso completamente pubblico
- **Read-Only Data**: Nessuna modifica possibile
- **Privacy-Safe**: Coordinate GPS approssimative
- **Rate Limiting**: Protezione contro scraping (future)

### Content Moderation
```typescript
// Filtri contenuto per pubblico
interface PublicContentFilters {
  excludeSensitiveLocations: boolean;    // Ospedali, scuole, etc.
  hidePrivateProperties: boolean;        // Proprietà private
  moderateCompanyInfo: boolean;          // Review info aziende
  filterInactiveProducts: boolean;       // Solo prodotti attivi
}
```

## 🚀 SEO & Marketing Features

### Search Engine Optimization
1. **Static Generation**: Pre-rendering per performance
2. **Semantic HTML**: Proper heading hierarchy e markup
3. **Structured Data**: Rich snippets per Google
4. **Open Graph**: Social sharing optimization
5. **XML Sitemap**: Auto-generated sitemap (future)

### Content Marketing
```typescript
// Content strategy per engagement
interface PublicContentStrategy {
  productShowcase: {
    featuredProducts: Product[];
    successStories: CompanyStory[];
    certificationBadges: CertificationInfo[];
  };
  
  companySpotlight: {
    monthlyFeature: Company;
    newInstallations: Installation[];
    innovationHighlights: Innovation[];
  };
  
  educationalContent: {
    safetyGuidelines: SafetyGuide[];
    complianceInfo: ComplianceGuide[];
    industryNews: NewsArticle[];
  };
}
```

### Analytics Integration
```typescript
// Google Analytics events per public usage
interface PublicAnalytics {
  pageViews: {
    catalogVisits: number;
    productDetailViews: number;
    mapInteractions: number;
  };
  
  searchBehavior: {
    popularQueries: string[];
    filterUsage: FilterStats;
    resultClickthrough: number;
  };
  
  companyExposure: {
    brandImpressions: CompanyMetrics[];
    logoClicks: number;
    websiteReferrals: number;
  };
}
```

## 🔄 Integration Points

### With Company Section
- **Product Publication**: Company decide quali prodotti rendere pubblici
- **Brand Management**: Logo, descrizioni, contatti aziendali
- **Analytics Sharing**: Stats pubbliche condivise con aziende

### With Employee Section  
- **QR Code Validation**: Verifica che QR codes pubblici siano validi
- **Status Updates**: Sync status manutenzione (senza dettagli)
- **Location Validation**: Verifica posizioni per privacy

### External Integrations
```typescript
// Future integrations
interface ExternalIntegrations {
  socialMedia: {
    shareButtons: SocialPlatform[];
    embedWidgets: EmbedConfig[];
  };
  
  thirdPartyMaps: {
    googleMaps: boolean;
    openStreetMap: boolean;
    customTileServers: string[];
  };
  
  certificationBodies: {
    badgeValidation: boolean;
    complianceChecks: boolean;
  };
}
```

## 📈 Performance Considerations

### Loading Optimization
- **Server-Side Generation**: Pre-rendering statico
- **Image Optimization**: Next.js automatic image optimization
- **CDN Distribution**: Global content delivery
- **Lazy Loading**: Gradual content loading

### Caching Strategy
```typescript
// Multi-level caching per performance
export const publicCacheConfig = {
  // Static content (24h)
  staticPages: { maxAge: 86400, staleWhileRevalidate: 604800 },
  
  // Product data (1h)
  productData: { maxAge: 3600, staleWhileRevalidate: 86400 },
  
  // Images (7d)
  images: { maxAge: 604800, immutable: true },
  
  // Search results (15m)
  searchResults: { maxAge: 900, staleWhileRevalidate: 3600 }
};
```

La sezione Public fornisce **trasparenza** e **brand awareness** ottimizzata per SEO, con forte focus su privacy protection e user experience.