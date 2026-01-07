/**
 * ProductCard Component - Card visualizzazione segnali
 *
 * Card responsive per visualizzazione prodotti/segnali stradali:
 *
 * **Responsive Layout:**
 * - Desktop: 4 colonne (grid-cols-4)
 * - Tablet: 3 colonne (md:grid-cols-3)
 * - Mobile: 2 colonne (grid-cols-2)
 *
 * **Card Features:**
 * - Icona segnale specifica per tipo e forma
 * - Badge status manutenzione
 * - Descrizione dettagliata tipo segnale (tipo_segnale field)
 * - Informazioni tecniche essenziali (supporto, pellicola, fissaggio)
 * - Quick actions (QR modal, view, maintenance)
 * - QR Code modal integrato con download/sharing
 * - Hover effects e animazioni
 * - Click handler per dettagli completi
 *
 * **Design System:**
 * - Consistent con shadcn/ui theme
 * - Support per dark mode
 * - Touch-optimized per mobile
 * - Loading skeleton states
 *
 * **Performance:**
 * - React.memo per ottimizzazione re-renders
 * - Icone SVG ottimizzate
 * - Optimized click handlers
 *
 * **TODO:** Virtual scrolling per liste grandi, infinite scroll
 */

"use client";

import React, { memo, useState, Suspense } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Dynamic import per QRCodeModal per ottimizzazione bundle
const QRCodeModal = dynamic(() => 
  import("@/components/modals/QRCodeModal").then(mod => ({ default: mod.QRCodeModal })),
  {
    loading: () => <div className="animate-pulse">Caricamento QR...</div>
  }
);
import { 
  Package, 
  MapPin, 
  Calendar, 
  Building, 
  QrCode, 
  Eye, 
  Wrench, 
  Shield,
  CheckCircle,
  AlertCircle,
  Clock,
  Triangle,
  Square,
  Circle,
  Octagon,
  Diamond,
  Hexagon,
  ArrowUp,
  ArrowRight,
  ArrowLeft,
  ArrowDown,
  Ban,
  Info,
  AlertTriangle,
  Zap,
  Car,
  Truck
} from "lucide-react";

/**
 * Mappa i tipi di segnale alle icone appropriate
 * Basato sui tipi più comuni di segnaletica stradale
 */
function getSignalIcon(tipoSegnale: string, forma: string) {
  const tipo = tipoSegnale.toLowerCase();
  const formaLower = forma.toLowerCase();
  
  // Segnali di pericolo (triangolari)
  if (formaLower.includes('triangolare') || tipo.includes('pericolo') || tipo.includes('attenzione')) {
    return <AlertTriangle className="w-8 h-8 text-amber-500" />;
  }
  
  // Segnali di divieto (circolari con bordo rosso)
  if (tipo.includes('divieto') || tipo.includes('vietato') || tipo.includes('stop')) {
    return <Ban className="w-8 h-8 text-red-500" />;
  }
  
  // Segnali di obbligo (circolari blu)
  if (tipo.includes('obbligo') || tipo.includes('obbligatorio')) {
    return <Circle className="w-8 h-8 text-blue-500" />;
  }
  
  // Segnali di precedenza
  if (tipo.includes('precedenza') || tipo.includes('stop') || formaLower.includes('ottagonale')) {
    return <Octagon className="w-8 h-8 text-red-500" />;
  }
  
  // Frecce direzionali
  if (tipo.includes('freccia') || tipo.includes('direzione')) {
    if (tipo.includes('destra')) return <ArrowRight className="w-8 h-8 text-blue-500" />;
    if (tipo.includes('sinistra')) return <ArrowLeft className="w-8 h-8 text-blue-500" />;
    if (tipo.includes('dritto') || tipo.includes('avanti')) return <ArrowUp className="w-8 h-8 text-blue-500" />;
    return <ArrowRight className="w-8 h-8 text-blue-500" />;
  }
  
  // Segnali informativi
  if (tipo.includes('informazione') || tipo.includes('indicazione')) {
    return <Info className="w-8 h-8 text-blue-400" />;
  }
  
  // Segnali per veicoli specifici
  if (tipo.includes('auto') || tipo.includes('macchina')) {
    return <Car className="w-8 h-8 text-green-500" />;
  }
  if (tipo.includes('camion') || tipo.includes('pesanti')) {
    return <Truck className="w-8 h-8 text-orange-500" />;
  }
  
  // Segnali elettrici/elettronici
  if (tipo.includes('elettrico') || tipo.includes('led')) {
    return <Zap className="w-8 h-8 text-yellow-500" />;
  }
  
  // Forma-based fallback
  if (formaLower.includes('quadrata') || formaLower.includes('rettangolare')) {
    return <Square className="w-8 h-8 text-blue-500" />;
  }
  if (formaLower.includes('rombo') || formaLower.includes('diamante')) {
    return <Diamond className="w-8 h-8 text-yellow-500" />;
  }
  if (formaLower.includes('esagonale')) {
    return <Hexagon className="w-8 h-8 text-green-500" />;
  }
  if (formaLower.includes('circolare')) {
    return <Circle className="w-8 h-8 text-blue-500" />;
  }
  
  // Default fallback
  return <Shield className="w-8 h-8 text-gray-500" />;
}

// Interfaccia per le props del componente
interface ProductCardProps {
  product: {
    id: string;
    qr_code: string;
    tipologia_segnale: string;
    tipo_segnale: string;
    anno: number;
    forma: string;
    dimensioni: string;
    materiale_supporto: string;
    spessore_supporto: number;
    materiale_pellicola: string;
    wl?: string;
    fissaggio?: string;
    figura?: string;
    gps_lat?: number;
    gps_lng?: number;
    companyId: string;
    createdAt: string;
    updatedAt: string;
  };
  // Dati aggiuntivi calcolati
  company?: {
    id: string;
    name: string;
    logo_url?: string;
  };
  lastMaintenance?: {
    id: string;
    tipo_intervento: string;
    createdAt: string;
    note?: string;
  } | null;
  maintenanceCount?: number;
  // Handlers e configurazione
  onCardClick?: (productId: string) => void;
  onMaintenanceClick?: (productId: string) => void;
  className?: string;
  // Feature flags
  showActions?: boolean;
  showCompanyInfo?: boolean;
  isLoading?: boolean;
}

/**
 * Hook per calcolare badge status basato su ultima manutenzione
 */
function useMaintenanceStatus(lastMaintenance: ProductCardProps['lastMaintenance']) {
  if (!lastMaintenance) {
    return {
      badge: <Badge className="bg-muted text-muted-foreground text-xs">Mai controllato</Badge>,
      icon: <AlertCircle className="w-3 h-3 text-muted-foreground" />,
      color: "muted"
    };
  }
  
  switch (lastMaintenance.tipo_intervento) {
    case 'installazione':
      return {
        badge: <Badge className="bg-primary/10 text-primary text-xs">Installato</Badge>,
        icon: <CheckCircle className="w-3 h-3 text-primary" />,
        color: "primary"
      };
    case 'manutenzione':
      return {
        badge: <Badge className="bg-primary/20 text-primary text-xs">Mantenuto</Badge>,
        icon: <Wrench className="w-3 h-3 text-primary" />,
        color: "primary"
      };
    case 'verifica':
      return {
        badge: <Badge className="bg-muted text-muted-foreground text-xs">Verificato</Badge>,
        icon: <Shield className="w-3 h-3 text-muted-foreground" />,
        color: "muted"
      };
    case 'dismissione':
      return {
        badge: <Badge variant="destructive" className="text-xs">Dismesso</Badge>,
        icon: <AlertCircle className="w-3 h-3 text-destructive" />,
        color: "destructive"
      };
    default:
      return {
        badge: <Badge variant="outline" className="text-xs">Attivo</Badge>,
        icon: <CheckCircle className="w-3 h-3 text-primary" />,
        color: "outline"
      };
  }
}

/**
 * Loading skeleton per ProductCard
 * Mantiene layout stabile durante caricamento
 */
function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4">
        {/* Icon area skeleton */}
        <div className="flex justify-center items-center h-16">
          <div className="w-8 h-8 bg-muted rounded animate-pulse" />
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <div className="space-y-2">
          {/* Title skeleton */}
          <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
          {/* Badge skeleton */}
          <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
          {/* Details skeleton */}
          <div className="space-y-1">
            <div className="h-3 bg-muted rounded w-full animate-pulse" />
            <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
          </div>
          {/* Actions skeleton */}
          <div className="flex gap-1 pt-2">
            <div className="h-7 bg-muted rounded flex-1 animate-pulse" />
            <div className="h-7 bg-muted rounded w-7 animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * ProductCard Component principale
 * Memorizzato per performance con React.memo
 */
const ProductCard = memo(function ProductCard({
  product,
  company,
  lastMaintenance = null,
  maintenanceCount = 0,
  onCardClick,
  onMaintenanceClick,
  className = "",
  showActions = true,
  showCompanyInfo = true,
  isLoading = false
}: ProductCardProps) {
  
  // State per QR modal
  const [showQRModal, setShowQRModal] = useState(false);
  
  // Status badge calcolato
  const status = useMaintenanceStatus(lastMaintenance);
  
  // Handler ottimizzati con useCallback implicito (memo)
  const handleCardClick = () => {
    // Se è definito onCardClick personalizzato, usalo
    if (onCardClick) {
      onCardClick(product.id);
    } else {
      // Altrimenti naviga alla pagina dettagli
      window.location.href = `/company/products/${product.id}`;
    }
  };
  const handleScanClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Apri solo QR modal - nessuna navigazione
    setShowQRModal(true);
  };

  // Handler per chiusura QR modal
  const handleCloseQRModal = () => {
    setShowQRModal(false);
  };

  // Loading state
  if (isLoading) {
    return <ProductCardSkeleton />;
  }

  return (
    <Card 
      className={`
        overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] 
        cursor-pointer group border-2 hover:border-primary/20 bg-card
        ${className}
      `}
      onClick={handleCardClick}
    >
      <CardHeader className="p-4 pb-2">
        {/* Header con QR code e status */}
        <div className="flex items-start justify-between mb-3">
          <Badge variant="secondary" className="bg-muted text-muted-foreground text-xs font-mono">
            {product.qr_code}
          </Badge>
          {status.badge}
        </div>
        
        {/* Icona segnale centrata */}
        <div className="flex justify-center items-center py-2">
          <div className="p-4 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 
                         group-hover:from-primary/10 group-hover:to-primary/5 transition-colors duration-300">
            {getSignalIcon(product.tipologia_segnale, product.forma)}
          </div>
        </div>

        {/* GPS indicator se disponibile */}
        {product.gps_lat && product.gps_lng && (
          <div className="flex justify-center mt-2">
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              <MapPin className="w-2 h-2 text-green-600" />
              GPS
            </Badge>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-4 pt-2">
        <div className="space-y-2">
          {/* Title e descrizione */}
          <div>
            <CardTitle className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors">
              {product.tipologia_segnale}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              {product.forma} • {product.dimensioni}
            </CardDescription>
          </div>

          {/* Company info se abilitato */}
          {showCompanyInfo && company && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Building className="w-3 h-3" />
              <span className="truncate">{company.name}</span>
            </div>
          )}

          {/* Dettagli tecnici compatti */}
          <div className="space-y-1.5 text-xs bg-muted/20 rounded-lg p-2.5 border border-muted/30">
            {/* Tipo Segnale - Descrizione dettagliata del modello */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">Tipo Segnale:</span>
              <span className="font-medium truncate ml-2">{product.tipo_segnale}</span>
            </div>

            {/* WL Code - Importante per identificazione */}
            {product.wl && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">WL Code:</span>
                <span className="font-mono font-semibold text-primary">{product.wl}</span>
              </div>
            )}

            {/* Materiale Supporto + Spessore */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Supporto:</span>
              <span className="font-medium truncate ml-2">
                {product.materiale_supporto} ({product.spessore_supporto}mm)
              </span>
            </div>

            {/* Materiale Pellicola */}
            {product.materiale_pellicola && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Pellicola:</span>
                <span className="font-medium truncate ml-2">{product.materiale_pellicola}</span>
              </div>
            )}

            {/* Sistema Fissaggio */}
            {product.fissaggio && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Fissaggio:</span>
                <span className="font-medium truncate ml-2">{product.fissaggio}</span>
              </div>
            )}

            {/* Anno Produzione */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Anno:</span>
              <span className="font-medium">{product.anno}</span>
            </div>

            {/* Numero Interventi */}
            {maintenanceCount > 0 && (
              <div className="flex items-center justify-between pt-1 border-t border-muted/40">
                <span className="text-muted-foreground">Interventi:</span>
                <Badge variant="secondary" className="text-xs font-semibold">
                  {maintenanceCount}
                </Badge>
              </div>
            )}
          </div>

          {/* Ultima manutenzione info */}
          {lastMaintenance && (
            <div className="flex items-center gap-2 text-xs bg-muted/30 p-2 rounded">
              {status.icon}
              <div className="flex-1 min-w-0">
                <p className="font-medium capitalize">{lastMaintenance.tipo_intervento}</p>
                <p className="text-muted-foreground truncate">
                  {new Date(lastMaintenance.createdAt).toLocaleDateString('it-IT')}
                </p>
              </div>
            </div>
          )}

          {/* Action buttons se abilitati */}
          {showActions && (
            <div className="flex gap-2 pt-2">
              {/* View details button - 50% width */}
              <Link href={`/company/products/${product.id}`} className="flex-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-xs hover:bg-primary hover:text-primary-foreground"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Dettagli
                </Button>
              </Link>
              
              {/* Quick scan button - 50% width */}
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1 text-xs hover:bg-primary hover:text-primary-foreground"
                onClick={handleScanClick}
                title="Scansiona QR"
              >
                <QrCode className="w-3 h-3 mr-1" />
                QR Code
              </Button>
            </div>
          )}
        </div>
      </CardContent>

      {/* QR Code Modal */}
      {showQRModal && (
        <Suspense fallback={null}>
          <QRCodeModal
            isOpen={showQRModal}
            onClose={handleCloseQRModal}
            product={product}
            company={company}
          />
        </Suspense>
      )}
    </Card>
  );
});

/**
 * ProductCardGrid Component - Container per layout responsive
 * Gestisce il layout a griglia con breakpoint responsive
 */
export function ProductCardGrid({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <div className={`
      grid gap-4
      grid-cols-1           /* Mobile: 1 colonne */
      sm:grid-cols-2        /* Small: 2 colonne */  
      md:grid-cols-3        /* Medium: 3 colonne */
      ${className}
    `}>
      {children}
    </div>
  );
}

/**
 * ProductCardList Component - Lista completa con caricamento
 * Gestisce stato loading e empty states
 */
export function ProductCardList({
  products = [],
  companies = [],
  maintenances = [],
  isLoading = false,
  onCardClick,
  onMaintenanceClick,
  showActions = true,
  showCompanyInfo = true,
  emptyMessage = "Nessun prodotto trovato"
}: {
  products: ProductCardProps['product'][];
  companies?: ProductCardProps['company'][];
  maintenances?: any[];
  isLoading?: boolean;
  onCardClick?: (productId: string) => void;
  onMaintenanceClick?: (productId: string) => void;
  showActions?: boolean;
  showCompanyInfo?: boolean;
  emptyMessage?: string;
}) {
  
  // Loading state con skeleton cards
  if (isLoading) {
    return (
      <ProductCardGrid>
        {Array.from({ length: 8 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </ProductCardGrid>
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nessun Prodotto</h3>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ProductCardGrid>
      {products.map((product) => {
        // Trova company corrispondente
        const company = companies?.find(c => c?.id === product.companyId);
        
        // Trova ultima manutenzione
        const productMaintenances = maintenances.filter(m => m.productId === product.id);
        const lastMaintenance = productMaintenances.length > 0 
          ? productMaintenances[productMaintenances.length - 1] 
          : null;

        return (
          <ProductCard
            key={product.id}
            product={product}
            company={company}
            lastMaintenance={lastMaintenance}
            maintenanceCount={productMaintenances.length}
            onCardClick={onCardClick}
            onMaintenanceClick={onMaintenanceClick}
            showActions={showActions}
            showCompanyInfo={showCompanyInfo}
          />
        );
      })}
    </ProductCardGrid>
  );
}

export default ProductCard;