/**
 * Company Products Page - Gestione completa catalogo prodotti aziendali
 *
 * Pagina CRUD per la gestione del database prodotti certificati:
 *
 * **Core Features:**
 * - ✅ External API Integration: Fetch da https://api-dev.geosign.toknox.com/product
 * - ✅ Data Mapping: Transform API schema → App schema automatico
 * - Search & Filtering: Ricerca real-time per tipo, forma, QR code
 * - Responsive Design: Card view mobile + table view desktop
 * - QR Code Integration: Quick scan button apre QR modal in ProductCard
 * - Status Tracking: Badge colorati per stato manutenzione
 * - Loading & Error States: UI ottimizzate per feedback utente
 * - Export Functionality: CSV/Excel export (placeholder)
 *
 * **Data Management:**
 * - ✅ External API: GET /product con x-api-key header authentication
 * - ✅ Schema Mapping: API fields → Internal Product type conversion
 * - Product CRUD operations tramite modal forms
 * - QR code generation automatica
 * - GPS location tracking per prodotti installati
 * - Maintenance history aggregation
 * - Creator tracking per audit trail
 *
 * **API Configuration:**
 * - Base URL: https://api-dev.geosign.toknox.com
 * - Authentication: x-api-key header
 * - Mapping functions: src/lib/api-mapping.ts
 * - Config utilities: src/lib/api-config.ts
 *
 * **UI Patterns:**
 * - Mobile-first responsive: Card list → Data table
 * - Advanced filtering bar con search e filter buttons
 * - Status badges con color coding per maintenance states
 * - Loading spinner durante fetch dati
 * - Error message con retry button
 * - Empty state handling per no results
 *
 * **Business Logic:**
 * - Product status derivato da ultima manutenzione
 * - GPS indicator per prodotti georeferenziati
 * - Maintenance timeline con user attribution
 * - Real-time search filtering client-side
 * - Signal type normalization (API → permanente/temporanea)
 *
 * **TODO:** Advanced filters, bulk operations, image upload, auto-refresh dopo creazione prodotto
 */

"use client";

import { useState, useMemo, useCallback, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Download, Eye, Plus, MapPin, Package, LayoutGrid, List, Loader2, AlertCircle } from "lucide-react";
import { mockUsers, mockCompanies, mockMaintenance, getMaintenanceByProductId } from "@/lib/mock-data";
import { ProductCardList } from "@/components/custom/ProductCard";
import { usePageHeader, useHeaderTabs, useHeaderButtons } from "@/contexts";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@certplus/types";

// Dynamic import del ProductModal per performance
const ProductModal = dynamic(() =>
  import("@/components/modals/ProductModal")
    .then(mod => ({ default: mod.ProductModal })),
  { ssr: false }
);

export default function CompanyProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const { toast } = useToast();

  // Fetch products from API (proxied to external API)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔄 Fetching products...');

        // Call /api/products (which proxies to external API)
        const response = await fetch('/api/products', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ API Response:', data);

        if (data.success && data.data) {
          // Data is already mapped by the API proxy
          console.log(`✅ Loaded ${data.data.length} products`);
          setProducts(data.data);
        } else {
          throw new Error(data.message || 'Errore nel caricamento dei prodotti');
        }
      } catch (err) {
        console.error('❌ Error fetching products:', err);
        setError(err instanceof Error ? err.message : 'Errore nel caricamento dei prodotti dal database');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    // Listen for product creation events to auto-refresh
    const handleProductCreated = () => {
      console.log('[Products] New product created, refreshing data...');
      fetchProducts();
    };

    window.addEventListener('product-created', handleProductCreated);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('product-created', handleProductCreated);
    };
  }, []);

  const filteredProducts = products.filter(product =>
    product.tipologia_segnale.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.forma.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.qr_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    // Mock export functionality
    alert("Export CSV/Excel da implementare");
  };



  // Configurazione tabs per view switcher
  const handleTabChange = useCallback((tabId: string) => {
    setViewMode(tabId as 'cards' | 'table');
  }, []);
  
  const createHeaderTabs = useHeaderTabs(viewMode, handleTabChange);
  const tabs = useMemo(() => createHeaderTabs([
    { id: 'cards', label: 'Cards', icon: LayoutGrid },
    { id: 'table', label: 'Tabella', mobileLabel: 'Tab', icon: List }
  ]), [createHeaderTabs]);

  // Configurazione buttons per actions
  const buttonHandlers = useMemo(() => ({
    'add-product': () => setShowProductModal(true)
  }), []);
  
  const createHeaderButtons = useHeaderButtons(buttonHandlers);
  const buttons = useMemo(() => createHeaderButtons([
    { 
      id: 'add-product', 
      label: 'Nuovo Prodotto', 
      mobileLabel: 'Nuovo', 
      icon: Plus 
    }
  ]), [createHeaderButtons]);

  // Configura header tramite context
  const headerConfig = useMemo(() => ({
    icon: Package,
    title: "Gestione Prodotti",
    description: "Database completo dei dispositivi certificati",
    tabs,
    buttons
  }), [tabs, buttons]);
  
  usePageHeader(headerConfig);

  const handleMaintenanceClick = (productId: string) => {
    // Redirect a pagina manutenzione con prodotto pre-selezionato
    window.open(`/company/maintenance?product=${productId}`, '_blank');
  };

  const handleProductSubmit = useCallback(async (data: any) => {
    try {
      console.log('[Products] Submitting product:', data);

      // Get current user from mockUsers (same pattern as Sidebar)
      const currentUser = mockUsers.find(u => u.role === 'company');

      if (!currentUser) {
        console.error('❌ Cannot create product: currentUser is not available');
        toast({
          variant: "destructive",
          title: "Errore di autenticazione",
          description: "Utente non trovato. Ricarica la pagina e riprova.",
        });
        return;
      }

      // Import the service dynamically to avoid circular dependencies
      const { createProductWithQR, transformFormDataToProduct } = await import('@/services/product-service');

      try {
        // Transform form data to API format using currentUser
        const productData = transformFormDataToProduct(data, currentUser);

        // Create product with QR code
        const result = await createProductWithQR(productData, currentUser);

        if (result.success && result.data) {
          console.log('✅ Product created successfully:', {
            product: result.data.product,
            qr_code: result.data.product.qr_code,
            qr_image_base64: result.data.qr_image_base64.substring(0, 50) + '...', // Log first 50 chars
            qr_url: result.data.qr_url,
          });

          // Show success notification
          toast({
            variant: "success",
            title: "Prodotto creato con successo",
            description: `QR Code: ${result.data.product.qr_code} - Tipo: ${result.data.product.tipologia_segnale}`,
          });

          // Dispatch custom event to trigger refresh
          window.dispatchEvent(new CustomEvent('product-created', {
            detail: result.data
          }));

          // Close modal after success
          setShowProductModal(false);

        } else {
          throw new Error(result.error || 'Failed to create product');
        }

      } catch (productError) {
        console.error('❌ Product creation failed:', productError);
        toast({
          variant: "destructive",
          title: "Errore nella creazione del prodotto",
          description: productError instanceof Error ? productError.message : 'Errore sconosciuto',
        });
      }

    } catch (error) {
      console.error('[Products] Error submitting product:', error);
      toast({
        variant: "destructive",
        title: "Errore nel salvataggio",
        description: error instanceof Error ? error.message : 'Errore sconosciuto',
      });
    }
  }, [toast]);

  const getStatusBadge = (product: any) => {
    const maintenances = getMaintenanceByProductId(product.id);
    const lastMaintenance = maintenances[maintenances.length - 1];

    if (!lastMaintenance) {
      return <Badge variant="secondary">Mai controllato</Badge>;
    }

    switch (lastMaintenance.tipo_intervento) {
      case 'installazione':
        return <Badge className="bg-primary/10 text-primary hover:bg-primary/20">Installato</Badge>;
      case 'manutenzione':
        return <Badge className="bg-primary/20 text-primary hover:bg-primary/30">Mantenuto</Badge>;
      case 'verifica':
        return <Badge className="bg-muted text-muted-foreground hover:bg-muted/80">Verificato</Badge>;
      case 'dismissione':
        return <Badge variant="destructive">Dismesso</Badge>;
      default:
        return <Badge variant="outline">Attivo</Badge>;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground">Caricamento prodotti in corso...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-destructive">
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <AlertCircle className="w-16 h-16 text-destructive" />
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-destructive">Errore nel caricamento</h3>
              <p className="text-muted-foreground">{error}</p>
            </div>
            <Button onClick={() => window.location.reload()} variant="outline">
              Riprova
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Filters and Search */}
        <Card className="transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca per tipo segnale, forma o QR code..."
                  className="pl-10 focus:ring-primary/20"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" className="shrink-0 hover:bg-primary/10">
                <Filter className="h-4 w-4 mr-2" />
                Filtri
              </Button>
              <Button variant="outline" onClick={handleExport} className="shrink-0 hover:bg-primary/10">
                <Download className="h-4 w-4 mr-2" />
                Esporta
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Conditional View: Cards or Table */}
        {viewMode === 'cards' ? (
          /* Card View - Responsive Grid */
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Prodotti ({filteredProducts.length})
              </h2>
              <p className="text-sm text-muted-foreground">
                Vista card responsive
              </p>
            </div>
            
            <ProductCardList
              products={filteredProducts}
              companies={mockCompanies}
              maintenances={mockMaintenance}
              onCardClick={undefined}
              onMaintenanceClick={handleMaintenanceClick}
              showActions={true}
              showCompanyInfo={false}
              emptyMessage="Nessun prodotto trovato con i criteri di ricerca"
            />
          </div>
        ) : (
          /* Table View - Traditional */
          <Card className="transition-all hover:shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Package className="w-4 h-4 text-primary" />
              </div>
              Prodotti ({filteredProducts.length})
            </CardTitle>
            <CardDescription>
              Elenco completo dei dispositivi con stato e informazioni
            </CardDescription>
          </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>QR Code</TableHead>
                  <TableHead>Tipo Segnale</TableHead>
                  <TableHead>Anno</TableHead>
                  <TableHead>Forma</TableHead>
                  <TableHead>Dimensioni</TableHead>
                  <TableHead>Materiale</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead>Posizione</TableHead>
                  <TableHead>Creato da</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const creator = mockUsers.find(u => u.id === product.createdBy);
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-mono text-sm">
                        {product.qr_code}
                      </TableCell>
                      <TableCell className="font-medium">
                        {product.tipologia_segnale}
                      </TableCell>
                      <TableCell>{product.anno}</TableCell>
                      <TableCell>{product.forma}</TableCell>
                      <TableCell>{product.dimensioni}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="text-foreground">{product.materiale_supporto}</div>
                          <div className="text-muted-foreground">{product.spessore_supporto}mm</div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(product)}</TableCell>
                      <TableCell>
                        {product.gps_lat && product.gps_lng ? (
                          <div className="flex items-center text-sm">
                            <MapPin className="h-3 w-3 text-primary mr-1" />
                            <span className="text-primary font-medium">GPS</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>{creator?.name || 'N/A'}</TableCell>
                      <TableCell>
                        {new Date(product.createdAt).toLocaleDateString('it-IT')}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => console.log('View details:', product.id)}
                          disabled
                          title="Dettagli rimossi"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-8">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">Nessun prodotto trovato</p>
              <p className="text-muted-foreground/80 text-sm mt-2">Prova a modificare i criteri di ricerca</p>
            </div>
          )}
        </CardContent>
      </Card>
        )}

        {/* Product Modal */}
        {showProductModal && (
          <Suspense fallback={null}>
            <ProductModal
              isOpen={showProductModal}
              onClose={() => setShowProductModal(false)}
              onSubmit={handleProductSubmit}
              mode="add"
            />
          </Suspense>
        )}
    </div>
  );
}