"use client";

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Eye } from 'lucide-react';
import { getMaintenanceByProductId } from '@/lib/mock-data';
import { Product } from '@certplus/types';

// Fix per le icone di Leaflet in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Icone personalizzate per diversi tipi di segnali
const createSignalIcon = (iconSvg: string, color: string) => {
  return L.divIcon({
    className: 'custom-signal-marker',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 8px;
        box-shadow: 0 3px 12px rgba(0,0,0,0.4);
        cursor: pointer;
        transition: transform 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
      ">${iconSvg}</div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const signalIcons = {
  'Segnale di pericolo': createSignalIcon('⚠️', '#f59e0b'), // amber
  'Segnale di obbligo': createSignalIcon('🔵', '#3b82f6'), // blue
  'Segnale di divieto': createSignalIcon('🚫', '#ef4444'), // red
  'Segnale di indicazione': createSignalIcon('ℹ️', '#10b981'), // emerald
  'Pannello integrativo': createSignalIcon('📋', '#8b5cf6'), // violet
  'Segnale temporaneo': createSignalIcon('🚧', '#f97316'), // orange
  'Cartellonistica turistica': createSignalIcon('🏛️', '#06b6d4'), // cyan
  'Segnale personalizzato': createSignalIcon('⭐', '#ec4899'), // pink
  'Segnale informativo': createSignalIcon('💡', '#84cc16'), // lime
  default: createSignalIcon('📍', '#6b7280'), // gray
};

interface InteractiveMapProps {
  products: Product[];
  onProductSelect: (productId: string) => void;
  className?: string;
}

// Componente per centrare la mappa sui marker
function MapController({ products }: { products: Product[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (products.length > 0) {
      const validProducts = products.filter(p => p.gps_lat && p.gps_lng);
      if (validProducts.length > 0) {
        const bounds = L.latLngBounds(
          validProducts.map(p => [p.gps_lat!, p.gps_lng!])
        );
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [map, products]);
  
  return null;
}

function getProductSignalType(product: Product): string {
  return product.tipo_segnale || 'default';
}

function getProductStatus(product: Product): string {
  const maintenances = getMaintenanceByProductId(product.id);
  const lastMaintenance = maintenances[maintenances.length - 1];
  
  if (!lastMaintenance) return 'attivo';
  
  switch (lastMaintenance.tipo_intervento) {
    case 'installazione': return 'installato';
    case 'manutenzione': return 'mantenuto';
    case 'verifica': return 'verificato';
    case 'dismissione': return 'dismesso';
    default: return 'attivo';
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'installato':
      return <Badge className="bg-primary/10 text-primary hover:bg-primary/20">Installato</Badge>;
    case 'mantenuto':
      return <Badge className="bg-primary/20 text-primary hover:bg-primary/30">Mantenuto</Badge>;
    case 'verificato':
      return <Badge className="bg-muted text-muted-foreground hover:bg-muted/80">Verificato</Badge>;
    case 'dismesso':
      return <Badge variant="destructive">Dismesso</Badge>;
    default:
      return <Badge variant="outline">Attivo</Badge>;
  }
}

export default function InteractiveMap({ products, onProductSelect, className = '' }: InteractiveMapProps) {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  if (!isClient) {
    return (
      <div className={`w-full h-full bg-gradient-to-br from-primary/5 via-background to-primary/10 rounded-lg border border-border flex flex-col items-center justify-center ${className}`}>
        <Navigation className="h-16 w-16 text-muted-foreground/60 mb-4" />
        <p className="text-muted-foreground font-medium">Caricamento mappa...</p>
      </div>
    );
  }
  
  const validProducts = products.filter(p => p.gps_lat && p.gps_lng);
  
  // Centro predefinito su Roma se non ci sono prodotti
  const defaultCenter: [number, number] = [41.9028, 12.4964];
  const center = validProducts.length > 0 
    ? [validProducts[0].gps_lat!, validProducts[0].gps_lng!] as [number, number]
    : defaultCenter;
  
  return (
    <div className={`relative w-full h-full rounded-lg overflow-hidden ${className}`}>
      <MapContainer
        center={center}
        zoom={validProducts.length > 0 ? 13 : 6}
        className="w-full h-full z-0"
        zoomControl={true}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController products={validProducts} />
        
        {validProducts.map((product) => {
          const signalType = getProductSignalType(product);
          const status = getProductStatus(product);
          const icon = signalIcons[signalType as keyof typeof signalIcons] || signalIcons.default;
          
          return (
            <Marker
              key={product.id}
              position={[product.gps_lat!, product.gps_lng!]}
              icon={icon}
            >
              <Popup className="custom-popup">
                <div className="p-2 min-w-[220px]">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-sm">{product.tipo_segnale}</h3>
                    {getStatusBadge(status)}
                  </div>

                  <div className="space-y-1 text-xs text-muted-foreground mb-3">
                    <p><span className="font-medium">QR:</span> {product.qr_code}</p>
                    <p><span className="font-medium">Anno:</span> {product.anno}</p>
                    <p><span className="font-medium">Forma:</span> {product.forma}</p>
                    <p><span className="font-medium">Dimensioni:</span> {product.dimensioni}</p>
                    <p><span className="font-medium">Materiale:</span> {product.materiale_supporto}</p>
                    <p><span className="font-medium">Manutenzioni:</span> {product.maintenances?.length || 0}</p>
                  </div>

                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => onProductSelect(product.id)}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Visualizza dettagli
                  </Button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {/* Contatore marker */}
      <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-sm border border-border px-3 py-2 rounded-lg shadow-lg z-10">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">
            {validProducts.length} marker visualizzati
          </span>
        </div>
      </div>
      
      {/* Legenda tipi di segnali */}
      <div className="absolute top-4 right-4 bg-background/95 backdrop-blur-sm border border-border p-3 rounded-lg shadow-lg z-10 max-w-xs">
        <h4 className="text-xs font-semibold mb-2 text-foreground">Tipi di Segnali</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-amber-500 rounded border border-background flex items-center justify-center text-xs">⚠️</div>
            <span className="text-xs">Segnale di pericolo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-blue-500 rounded border border-background flex items-center justify-center text-xs">🔵</div>
            <span className="text-xs">Segnale di obbligo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-red-500 rounded border border-background flex items-center justify-center text-xs">🚫</div>
            <span className="text-xs">Segnale di divieto</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-emerald-500 rounded border border-background flex items-center justify-center text-xs">ℹ️</div>
            <span className="text-xs">Segnale di indicazione</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-violet-500 rounded border border-background flex items-center justify-center text-xs">📋</div>
            <span className="text-xs">Pannello integrativo</span>
          </div>
          <div className="flex items-center gap-2">
             <div className="w-5 h-5 bg-orange-500 rounded border border-background flex items-center justify-center text-xs">🚧</div>
             <span className="text-xs">Segnale temporaneo</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-5 h-5 bg-cyan-500 rounded border border-background flex items-center justify-center text-xs">🏛️</div>
             <span className="text-xs">Cartellonistica turistica</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-5 h-5 bg-pink-500 rounded border border-background flex items-center justify-center text-xs">⭐</div>
             <span className="text-xs">Segnale personalizzato</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-5 h-5 bg-lime-500 rounded border border-background flex items-center justify-center text-xs">💡</div>
             <span className="text-xs">Segnale informativo</span>
           </div>
         </div>
      </div>
    </div>
  );
}