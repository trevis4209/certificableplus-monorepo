/**
 * Company Map Page - Mappa strategica per gestione territoriale
 * 
 * Dashboard geografica desktop-first per management aziendale:
 * 
 * **Core Features:**
 * - Interactive map con clustering intelligente prodotti
 * - Advanced filtering per tipo segnale e status
 * - Statistics dashboard (GPS, Installati, Da Controllare, Dismessi)
 * - Product sidebar con detailed list e quick actions
 * - Map controls (zoom, layer switching, center all)
 * 
 * **Executive Analytics:**
 * - Geographic distribution insights
 * - Status-based product categorization
 * - Installation vs maintenance coverage maps
 * - Territory optimization suggestions
 * - Team deployment planning support
 * 
 * **Advanced Filtering:**
 * - Multi-level search (QR code, tipo_segnale)
 * - Type-based filtering (pericolo, obbligo, divieto)
 * - Status overlay con color-coded legend
 * - Creator tracking per audit e responsibility
 * 
 * **Desktop-Optimized Layout:**
 * - Split view: Map (2/3) + Sidebar (1/3)
 * - Hover interactions con smooth transitions
 * - Modal details per comprehensive product info
 * - Map controls integration (satellite/roadmap view)
 * 
 * **Management Features:**
 * - Product details modal con GPS coordinates precision
 * - Direct navigation links per field coordination
 * - Maintenance history timeline integration
 * - Territory coverage analysis tools
 * 
 * **Mock Map Implementation:**
 * - Branded color scheme con primary/destructive states
 * - Interactive markers con hover scale effects
 * - Layer controls e zoom functionality placeholders
 * - Counter display per filtered results
 * 
 * **TODO:** Real map library, clustering algorithms, territory analytics
 */

"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MapPin, Search, Filter, Eye, Navigation, Layers, Package, TrendingUp, ArrowLeft } from "lucide-react";
import { mockProducts, mockUsers, getMaintenanceByProductId } from "@/lib/mock-data";
import { usePageHeader, useHeaderButtons } from "@/contexts";
import InteractiveMap from "@/components/custom/InteractiveMap";
import dynamic from "next/dynamic";

// Caricamento dinamico del componente mappa per evitare problemi SSR
const DynamicInteractiveMap = dynamic(() => import("@/components/custom/InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gradient-to-br from-primary/5 via-background to-primary/10 rounded-lg border border-border flex flex-col items-center justify-center">
      <Navigation className="h-16 w-16 text-muted-foreground/60 mb-4" />
      <p className="text-muted-foreground font-medium">Caricamento mappa...</p>
    </div>
  ),
});

export default function CompanyMapPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [mapView, setMapView] = useState<"satellite" | "roadmap">("roadmap");

  const productsWithGPS = mockProducts.filter(product => product.gps_lat && product.gps_lng);
  
  const filteredProducts = productsWithGPS.filter(product => {
    const matchesSearch = 
      product.tipo_segnale.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.qr_code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === "all" || product.tipo_segnale.toLowerCase().includes(filterType.toLowerCase());
    
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (product: any) => {
    const maintenances = getMaintenanceByProductId(product.id);
    const lastMaintenance = maintenances[maintenances.length - 1];
    
    if (!lastMaintenance) {
      return <Badge variant="secondary">Mai controllato</Badge>;
    }
    
    switch (lastMaintenance.tipo_intervento) {
      case 'installazione':
        return <Badge className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors">Installato</Badge>;
      case 'manutenzione':
        return <Badge className="bg-primary/20 text-primary hover:bg-primary/30 transition-colors">Mantenuto</Badge>;
      case 'verifica':
        return <Badge className="bg-muted text-muted-foreground hover:bg-muted/80 transition-colors">Verificato</Badge>;
      case 'dismissione':
        return <Badge variant="destructive">Dismesso</Badge>;
      default:
        return <Badge variant="outline">Attivo</Badge>;
    }
  };

  // Configurazione header tramite context
  const headerConfig = useMemo(() => ({
    icon: MapPin,
    title: "Mappa Territoriale",
    description: "Visualizzazione geografica prodotti e copertura territoriale"
  }), []);
  
  usePageHeader(headerConfig);

  return (
    <>
      {/* Header con pulsante back */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => window.history.back()}
              className="flex items-center gap-2 hover:bg-muted/80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Indietro
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Mappa Territoriale</h1>
                <p className="text-sm text-muted-foreground">Visualizzazione geografica prodotti</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="h-[calc(100vh-180px)] w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Filtri e controlli */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Cerca per tipo segnale o QR code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filtra per tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti i tipi</SelectItem>
                  <SelectItem value="pericolo">Pericolo</SelectItem>
                  <SelectItem value="obbligo">Obbligo</SelectItem>
                  <SelectItem value="divieto">Divieto</SelectItem>
                  <SelectItem value="informazione">Informazione</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Statistiche rapide */}
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span className="text-muted-foreground">Installati: {filteredProducts.filter(p => {
                  const maintenances = getMaintenanceByProductId(p.id);
                  const last = maintenances[maintenances.length - 1];
                  return last?.tipo_intervento === 'installazione';
                }).length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-destructive rounded-full"></div>
                <span className="text-muted-foreground">Dismessi: {filteredProducts.filter(p => {
                  const maintenances = getMaintenanceByProductId(p.id);
                  const last = maintenances[maintenances.length - 1];
                  return last?.tipo_intervento === 'dismissione';
                }).length}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mappa a schermo intero */}
        <Card className="h-[calc(100%-120px)] transition-all hover:shadow-lg p-0 overflow-hidden">
          <DynamicInteractiveMap
            products={filteredProducts}
            onProductSelect={setSelectedProduct}
            className="h-full w-full"
          />
        </Card>
      </div>
      
      {/* Modal dettagli prodotto */}
      {selectedProduct && (
        <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Dettagli Prodotto
              </DialogTitle>
              <DialogDescription>
                Informazioni complete sul segnale selezionato
              </DialogDescription>
            </DialogHeader>
            
            {(() => {
              const product = mockProducts.find(p => p.id === selectedProduct);
              if (!product) return null;
              
              const maintenances = getMaintenanceByProductId(product.id);
               const creator = mockUsers.find(u => u.id === product.createdBy);
              
              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Tipo Segnale</label>
                        <p className="text-lg font-semibold">{product.tipo_segnale}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">QR Code</label>
                        <p className="font-mono text-sm bg-muted px-2 py-1 rounded">{product.qr_code}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Stato</label>
                        <div className="mt-1">{getStatusBadge(product)}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Coordinate GPS</label>
                        <p className="text-sm">
                          {product.gps_lat?.toFixed(6)}, {product.gps_lng?.toFixed(6)}
                        </p>
                      </div>
                      <div>
                         <label className="text-sm font-medium text-muted-foreground">Creato da</label>
                         <p className="text-sm">{creator?.name}</p>
                       </div>
                       <div>
                         <label className="text-sm font-medium text-muted-foreground">Data Creazione</label>
                         <p className="text-sm">{new Date(product.createdAt).toLocaleDateString('it-IT')}</p>
                       </div>
                    </div>
                  </div>
                  
                  {maintenances.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Storico Manutenzioni
                      </h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {maintenances.slice(-3).map((maintenance) => {
                           const maintainer = mockUsers.find(u => u.id === maintenance.userId);
                           return (
                             <div key={maintenance.id} className="flex justify-between items-center p-2 bg-muted/50 rounded text-sm">
                               <span className="capitalize">{maintenance.tipo_intervento}</span>
                               <span className="text-muted-foreground">
                                 {maintainer?.name} - {new Date(maintenance.createdAt).toLocaleDateString('it-IT')}
                               </span>
                             </div>
                           );
                         })}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-3 pt-4">
                    <Button 
                      onClick={() => {
                        if (product.gps_lat && product.gps_lng) {
                          window.open(`https://www.google.com/maps?q=${product.gps_lat},${product.gps_lng}`, '_blank');
                        }
                      }}
                      className="flex-1"
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      Apri in Google Maps
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedProduct(null)}>
                      Chiudi
                    </Button>
                  </div>
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}