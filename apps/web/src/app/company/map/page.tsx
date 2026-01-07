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
 * **API Integration:**
 * - Real-time data from GET /api/products
 * - Single fetch with nested maintenances
 * - Loading/Error states con UI dedicati
 * - Geographic filtering basato su GPS coordinates
 * - Auto-centering sui marker tramite MapController
 *
 * **Leaflet Map Implementation:**
 * - Branded color scheme con primary/destructive states
 * - Interactive markers con hover scale effects
 * - Layer controls e zoom functionality
 * - Counter display per filtered results
 * - Custom icons per tipo segnale (⚠️ pericolo, 🔵 obbligo, 🚫 divieto, etc.)
 *
 * **TODO:** Remove getMaintenanceByProductId - use products.maintenances nested
 */

"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Search, Filter, Navigation, Loader2, AlertTriangle } from "lucide-react";
import { usePageHeader } from "@/contexts";
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
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  // Real data from API
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/products');
        const result = await response.json();

        if (result.success && result.data) {
          setProducts(result.data);
        } else {
          setError(result.message || 'Failed to load products');
        }
      } catch (err) {
        console.error('Map fetch error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const productsWithGPS = products.filter(product => product.gps_lat && product.gps_lng);
  
  const filteredProducts = productsWithGPS.filter(product => {
    const matchesSearch =
      (product.tipo_segnale?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (product.qr_code?.toLowerCase().includes(searchTerm.toLowerCase()) || false);

    const matchesFilter = filterType === "all" || (product.tipo_segnale?.toLowerCase().includes(filterType.toLowerCase()) || false);

    return matchesSearch && matchesFilter;
  });

  // Navigate to product detail page
  const handleProductSelect = (productId: string) => {
    router.push(`/company/products/${productId}`);
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
      <div className="h-[calc(100vh-120px)] w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Loading State */}
        {loading && (
          <Card className="h-full flex items-center justify-center">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-lg font-medium text-muted-foreground">Caricamento mappa...</p>
              <p className="text-sm text-muted-foreground mt-2">Recupero prodotti dal database</p>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="h-full flex items-center justify-center border-destructive">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
              <p className="text-lg font-semibold text-destructive">Errore nel caricamento</p>
              <p className="text-sm text-muted-foreground mt-2">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Main Content - Only show when not loading and no error */}
        {!loading && !error && (
          <>
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
                <span className="text-muted-foreground">Con GPS: {filteredProducts.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-muted-foreground rounded-full"></div>
                <span className="text-muted-foreground">Totali: {products.length}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mappa a schermo intero */}
        <Card className="h-[calc(100%-120px)] transition-all hover:shadow-lg p-0 overflow-hidden">
          <DynamicInteractiveMap
            products={filteredProducts}
            onProductSelect={handleProductSelect}
            className="h-full w-full"
          />
        </Card>
          </>
        )}
        {/* End Main Content */}
      </div>
    </>
  );
}