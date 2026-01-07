/**
 * Company Product Detail Page - Pagina dettaglio prodotto aziendale
 * 
 * **Core Features:**
 * - Visualizzazione completa dati prodotto
 * - Storico manutenzioni con timeline
 * - Azioni rapide (modifica, QR, manutenzione)
 * - Dashboard metriche prodotto specifico
 * - Breadcrumb navigation e back button
 * - Integration con sistema QR codes
 * 
 * **Layout Structure:**
 * - Header con breadcrumb e actions
 * - Hero section con foto e info principali
 * - Tabs per organizzare contenuto (Info, Manutenzioni, Storico, GPS)
 * - Sidebar con quick stats e QR code
 * 
 * **Business Logic:**
 * - Solo prodotti della propria azienda accessibili
 * - Controllo permessi su azioni (modifica, elimina)
 * - Analytics e statistiche utilizzo
 * - Export dati e certificazioni
 * 
 * **Technical Architecture:**
 * - Dynamic routing con [product] parameter
 * - Server Component per initial data load
 * - Client components per interattivit�
 * - Metadata dinamici per SEO interno
 * 
 * **Integration Points:**
 * - ProductModal per editing
 * - MaintenanceModal per nuovi interventi
 * - QRCodeModal per visualizzazione QR
 * - Export/PDF generation services
 * 
 * **TODO:** Real-time updates, photo gallery, maintenance scheduling
 */

"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import nextDynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Edit,
  QrCode,
  Download,
  Calendar,
  Building,
  Package,
  Wrench,
  FileText,
  BarChart3,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle,
  Shield,
  Trash2,
  Construction
} from "lucide-react";

// Dynamic imports per performance
const ProductModal = nextDynamic(() => 
  import("@/components/modals/ProductModal").then(mod => ({ default: mod.ProductModal })),
  { loading: () => <div className="animate-pulse">Caricamento...</div> }
);

const MaintenanceModal = nextDynamic(() => 
  import("@/components/modals/MaintenanceModal").then(mod => ({ default: mod.MaintenanceModal })),
  { loading: () => <div className="animate-pulse">Caricamento...</div> }
);

const QRCodeModal = nextDynamic(() => 
  import("@/components/modals/QRCodeModal").then(mod => ({ default: mod.QRCodeModal })),
  { loading: () => <div className="animate-pulse">Caricamento QR...</div> }
);

import {
  mockUsers,
  mockCompanies,
} from "@/lib/mock-data";
import { mapApiProductToProduct } from "@/lib/api-mapping";
import type { ApiProduct } from "@/lib/api-mapping";
import { useToast } from "@/hooks/use-toast";

// Helper function per label tipo intervento
function getTipoInterventoLabel(tipo: string): string {
  const labels: Record<string, string> = {
    'installazione': 'Installazione',
    'manutenzione': 'Manutenzione Ordinaria',
    'sostituzione': 'Sostituzione',
    'verifica': 'Verifica Periodica',
    'dismissione': 'Dismissione'
  };
  return labels[tipo] || tipo.charAt(0).toUpperCase() + tipo.slice(1);
}

function ProductDetailContent() {
  const params = useParams();
  const router = useRouter();
  const productId = params.product as string;
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // API data states
  const [product, setProduct] = useState<any>(null);
  const [maintenances, setMaintenances] = useState<any[]>([]);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hooks
  const { toast } = useToast();

  // Mock user data (in produzione verrà da autenticazione)
  const currentUser = mockUsers.find(u => u.role === 'company');

  // Fetch product and maintenance data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('[ProductDetail] Fetching data for product:', productId);

        // Single API call - maintenances are nested in product response
        const response = await fetch(`/api/products?id=${productId}`);
        const result = await response.json();

        console.log('[ProductDetail] API Response:', result);

        // Handle new API structure: payload.data[0]
        if (result.success && result.payload?.data?.[0]) {
          const apiProduct: ApiProduct = result.payload.data[0];

          console.log('[ProductDetail] Raw API Product:', apiProduct);

          // Map API product to internal format
          const mappedProduct = mapApiProductToProduct(apiProduct);
          setProduct(mappedProduct);

          // Use maintenances from mapped product (already mapped internally by mapApiProductToProduct)
          const maintenancesList = mappedProduct.maintenances || [];
          setMaintenances(maintenancesList);

          // Find company (use mock for now as no /companies API exists)
          const foundCompany = mockCompanies.find(c => c.id === mappedProduct.companyId);
          setCompany(foundCompany);

          console.log('[ProductDetail] ✅ Product mapped:', mappedProduct.id);
          console.log('[ProductDetail] ✅ Maintenances extracted:', maintenancesList.length);
          console.log('[ProductDetail] ✅ Company found:', foundCompany?.name);
        } else if (result.success && result.data) {
          // Fallback for old API structure (backward compatibility)
          console.log('[ProductDetail] Using fallback structure (result.data)');
          setProduct(result.data);

          const foundCompany = mockCompanies.find(c => c.id === result.data.companyId);
          setCompany(foundCompany);

          // Maintenances are already mapped by API route - use directly
          const maintenancesList = result.data.maintenances || [];
          setMaintenances(maintenancesList);
          console.log('[ProductDetail] ✅ Maintenances from fallback:', maintenancesList.length);
        } else {
          setError(result.message || 'Product not found or invalid API structure');
        }
      } catch (err) {
        console.error('[ProductDetail] ❌ Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId]);

  // Controllo accesso aziendale
  useEffect(() => {
    if (!product || !currentUser) return;

    // Verifica che il prodotto appartenga all'azienda dell'utente corrente
    if (product.companyId !== currentUser.companyId) {
      console.log('[ProductDetail] Access denied - wrong company');
      router.push('/company/products'); // Redirect se non autorizzato
    }
  }, [product, currentUser, router]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Caricamento prodotto...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product || !company) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Prodotto Non Trovato</h3>
          <p className="text-muted-foreground mb-4">
            {error || 'Il prodotto richiesto non esiste o non hai i permessi per visualizzarlo.'}
          </p>
          <Link href="/company/products">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Torna al Catalogo
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Statistiche prodotto
  const installationsCount = maintenances.filter(m => m.tipo_intervento === 'installazione').length;
  const maintenancesCount = maintenances.filter(m => m.tipo_intervento !== 'installazione').length;

  const stats = {
    totalMaintenances: maintenances.length,
    installationsCount,
    maintenancesCount,
    lastMaintenance: maintenances[maintenances.length - 1],
    installationDate: maintenances.find(m => m.tipo_intervento === 'installazione')?.createdAt,
    productAge: new Date().getFullYear() - product.anno,
    maintenanceTypes: maintenances.reduce((acc, m) => {
      acc[m.tipo_intervento] = (acc[m.tipo_intervento] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  // Status prodotto
  const getProductStatus = () => {
    const lastMaint = stats.lastMaintenance;
    if (!lastMaint) {
      return { 
        badge: <Badge variant="outline">Nuovo</Badge>, 
        color: "gray" 
      };
    }
    
    switch (lastMaint.tipo_intervento) {
      case 'installazione':
        return { 
          badge: <Badge className="bg-primary/10 text-primary">Installato</Badge>, 
          color: "primary" 
        };
      case 'manutenzione':
        return { 
          badge: <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Mantenuto</Badge>, 
          color: "green" 
        };
      case 'dismissione':
        return { 
          badge: <Badge variant="destructive">Dismesso</Badge>, 
          color: "red" 
        };
      default:
        return { 
          badge: <Badge variant="secondary">Attivo</Badge>, 
          color: "blue" 
        };
    }
  };

  const productStatus = getProductStatus();

  // Handlers
  const handleEdit = () => setShowEditModal(true);
  const handleMaintenance = () => setShowMaintenanceModal(true);
  const handleQRCode = () => setShowQRModal(true);
  const handleDelete = () => {
    if (confirm('Sei sicuro di voler eliminare questo prodotto? Questa azione non pu� essere annullata.')) {
      // In produzione: chiamata API per eliminazione
      console.log('Elimina prodotto:', product.id);
      router.push('/company/products');
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header con Breadcrumb */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/company/products">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Catalogo Prodotti
            </Button>
          </Link>
          <Separator orientation="vertical" className="h-6" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {product.tipo_segnale}
            </h1>
            <p className="text-muted-foreground text-sm">
              ID: {product.qr_code} " Creato: {new Date(product.createdAt).toLocaleDateString('it-IT')}
            </p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleQRCode}>
            <QrCode className="w-4 h-4 mr-2" />
            QR Code
          </Button>
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Modifica
          </Button>
          <Button onClick={handleMaintenance}>
            <Wrench className="w-4 h-4 mr-2" />
            Nuova Manutenzione
          </Button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Main Content */}
        <div className="lg:col-span-3">
          
          {/* Hero Section */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                {/* Product Image */}
                <div className="flex-shrink-0">
                  <div className="w-40 h-40 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                    {product.figura ? (
                      <img
                        src={product.figura} 
                        alt={product.tipo_segnale}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-16 h-16 text-muted-foreground" />
                    )}
                  </div>
                </div>
                
                {/* Product Info */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-semibold mb-2">{product.tipo_segnale}</h2>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building className="w-4 h-4" />
                          {company.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Anno {product.anno}
                        </span>
                      </div>
                    </div>
                    {productStatus.badge}
                  </div>
                  
                  {/* Key Specs */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Forma</p>
                      <p className="font-semibold">{product.forma}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Dimensioni</p>
                      <p className="font-semibold">{product.dimensioni}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Materiale</p>
                      <p className="font-semibold">{product.materiale_supporto}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Interventi</p>
                      <p className="font-semibold">{stats.totalMaintenances}</p>
                    </div>
                  </div>

                  {/* Blockchain Links */}
                  {(product.asset_id || product.metadata_cid) && (
                    <>
                      <Separator className="my-4" />
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Blockchain Information</p>
                        <div className="flex flex-wrap gap-3">
                          {product.asset_id && (
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                            >
                              <a
                                href={`https://testnet.algo.surf/asset/${product.asset_id}/transactions`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2"
                              >
                                <Shield className="w-4 h-4" />
                                Asset
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </Button>
                          )}

                          {product.metadata_cid && (
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                            >
                              <a
                                href={`https://toknox.mypinata.cloud/ipfs/${product.metadata_cid}/`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2"
                              >
                                <FileText className="w-4 h-4" />
                                Metadata
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs Content */}
          <div className="space-y-6">
            <div className="flex border-b border-border">
              <button
                onClick={() => setActiveTab("info")}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === "info" 
                    ? "border-primary text-primary" 
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Informazioni
              </button>
              <button
                onClick={() => setActiveTab("maintenance")}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === "maintenance" 
                    ? "border-primary text-primary" 
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Manutenzioni
              </button>
              <button
                onClick={() => setActiveTab("installation")}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === "installation"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Installazione
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === "analytics"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Statistiche
              </button>
            </div>
            
            {/* Informazioni Tab */}
            {activeTab === "info" && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Specifiche Tecniche
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Tipo Segnale</p>
                          <p className="font-semibold">{product.tipo_segnale}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Forma</p>
                          <p className="font-semibold">{product.forma}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Dimensioni</p>
                          <p className="font-semibold">{product.dimensioni}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Anno Produzione</p>
                          <p className="font-semibold">{product.anno}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Materiale Supporto</p>
                          <p className="font-semibold">{product.materiale_supporto}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Materiale Pellicola</p>
                          <p className="font-semibold">{product.materiale_pellicola}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Spessore Supporto</p>
                          <p className="font-semibold">{product.spessore_supporto}mm</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Sistema Fissaggio</p>
                          <p className="font-semibold">{product.fissaggio}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Installazione Tab */}
            {activeTab === "installation" && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Construction className="w-5 h-5" />
                        Storico Installazioni ({stats.installationsCount})
                      </CardTitle>
                      <Button size="sm" onClick={handleMaintenance}>
                        <Construction className="w-4 h-4 mr-2" />
                        Nuova Installazione
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const installationRecords = maintenances.filter(m => m.tipo_intervento === 'installazione');

                      return installationRecords.length > 0 ? (
                        <div className="space-y-4">
                          {installationRecords.map((installation, index) => (
                            <div key={installation.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Construction className="w-4 h-4 text-primary" />
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <h4 className="font-semibold text-lg">Installazione</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {new Date(installation.createdAt).toLocaleString('it-IT')}
                                    </p>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    #{index + 1}
                                  </Badge>
                                </div>

                                {/* Informazioni Installazione */}
                                <div className="space-y-2 mb-3">
                                  <div className="flex items-start gap-2 text-sm">
                                    <span className="text-muted-foreground min-w-[80px]">Causale:</span>
                                    <span className="font-medium">{installation.causale || 'N/A'}</span>
                                  </div>
                                  <div className="flex items-start gap-2 text-sm">
                                    <span className="text-muted-foreground min-w-[80px]">Anno:</span>
                                    <span className="font-medium">{installation.anno || 'N/A'}</span>
                                  </div>
                                  <div className="flex items-start gap-2 text-sm">
                                    <span className="text-muted-foreground min-w-[80px]">Certificato:</span>
                                    <span className="font-mono font-medium">{installation.certificato_numero || 'N/A'}</span>
                                  </div>
                                  {installation.tipologia_installazione && (
                                    <div className="flex items-start gap-2 text-sm">
                                      <span className="text-muted-foreground min-w-[80px]">N° Pali:</span>
                                      <span className="font-medium">{installation.tipologia_installazione}</span>
                                    </div>
                                  )}
                                  {installation.gps_lat && installation.gps_lng && (
                                    <div className="flex items-start gap-2 text-sm">
                                      <span className="text-muted-foreground min-w-[80px]">GPS:</span>
                                      <a
                                        href={`https://maps.google.com/?q=${installation.gps_lat},${installation.gps_lng}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-mono text-primary hover:underline flex items-center gap-1"
                                      >
                                        {installation.gps_lat.toFixed(6)}, {installation.gps_lng.toFixed(6)}
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                    </div>
                                  )}
                                </div>

                                {installation.note && (
                                  <div className="bg-muted/30 p-3 rounded-md">
                                    <p className="text-sm text-muted-foreground mb-1">Note:</p>
                                    <p className="text-sm">{installation.note}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Construction className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="font-semibold mb-2">Nessuna Installazione</h3>
                          <p className="text-muted-foreground mb-4">
                            Non è stato ancora registrato nessun intervento di installazione per questo prodotto.
                          </p>
                          <Button onClick={handleMaintenance}>
                            <Construction className="w-4 h-4 mr-2" />
                            Registra Installazione
                          </Button>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Manutenzioni Tab */}
            {activeTab === "maintenance" && (
              <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Wrench className="w-5 h-5" />
                      Storico Manutenzioni ({stats.maintenancesCount})
                    </CardTitle>
                    <Button size="sm" onClick={handleMaintenance}>
                      <Wrench className="w-4 h-4 mr-2" />
                      Nuovo Intervento
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const maintenanceRecords = maintenances.filter(m => m.tipo_intervento !== 'installazione');
                    return maintenanceRecords.length > 0 ? (
                    <div className="space-y-4">
                      {maintenanceRecords.map((maintenance, index) => (
                        <div key={maintenance.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              {maintenance.tipo_intervento === 'installazione' && <Shield className="w-4 h-4 text-primary" />}
                              {maintenance.tipo_intervento === 'manutenzione' && <Wrench className="w-4 h-4 text-primary" />}
                              {maintenance.tipo_intervento === 'verifica' && <CheckCircle className="w-4 h-4 text-primary" />}
                              {maintenance.tipo_intervento === 'dismissione' && <AlertCircle className="w-4 h-4 text-destructive" />}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-semibold text-lg">{getTipoInterventoLabel(maintenance.tipo_intervento)}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(maintenance.createdAt).toLocaleString('it-IT')}
                                </p>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                #{index + 1}
                              </Badge>
                            </div>

                            {/* Informazioni Intervento */}
                            <div className="space-y-2 mb-3">
                              <div className="flex items-start gap-2 text-sm">
                                <span className="text-muted-foreground min-w-[80px]">Causale:</span>
                                <span className="font-medium">{maintenance.causale || 'N/A'}</span>
                              </div>
                              <div className="flex items-start gap-2 text-sm">
                                <span className="text-muted-foreground min-w-[80px]">Anno:</span>
                                <span className="font-medium">{maintenance.anno || 'N/A'}</span>
                              </div>
                              <div className="flex items-start gap-2 text-sm">
                                <span className="text-muted-foreground min-w-[80px]">Certificato:</span>
                                <span className="font-mono font-medium">{maintenance.certificato_numero || 'N/A'}</span>
                              </div>
                              {maintenance.tipologia_installazione && (
                                <div className="flex items-start gap-2 text-sm">
                                  <span className="text-muted-foreground min-w-[80px]">N° Pali:</span>
                                  <span className="font-medium">{maintenance.tipologia_installazione}</span>
                                </div>
                              )}
                              {maintenance.gps_lat && maintenance.gps_lng && (
                                <div className="flex items-start gap-2 text-sm">
                                  <span className="text-muted-foreground min-w-[80px]">GPS:</span>
                                  <a
                                    href={`https://maps.google.com/?q=${maintenance.gps_lat},${maintenance.gps_lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-mono text-primary hover:underline flex items-center gap-1"
                                  >
                                    {maintenance.gps_lat.toFixed(6)}, {maintenance.gps_lng.toFixed(6)}
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                              )}
                            </div>

                            {maintenance.note && (
                              <div className="bg-muted/30 p-3 rounded-md">
                                <p className="text-sm text-muted-foreground mb-1">Note:</p>
                                <p className="text-sm">{maintenance.note}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Wrench className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Nessuna Manutenzione</h3>
                      <p className="text-muted-foreground mb-4">
                        Non sono ancora stati registrati interventi di manutenzione per questo prodotto.
                      </p>
                      <Button onClick={handleMaintenance}>
                        <Wrench className="w-4 h-4 mr-2" />
                        Primo Intervento
                      </Button>
                    </div>
                  );
                  })()}
                </CardContent>
              </Card>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === "analytics" && (
              <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <BarChart3 className="w-4 h-4" />
                      Riepilogo Interventi
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(Object.entries(stats.maintenanceTypes) as [string, number][]).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between">
                          <span className="text-sm capitalize">{type}</span>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      ))}
                      {Object.keys(stats.maintenanceTypes).length === 0 && (
                        <p className="text-sm text-muted-foreground">Nessun intervento registrato</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Clock className="w-4 h-4" />
                      Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Creato</span>
                        <span className="font-medium">
                          {new Date(product.createdAt).toLocaleDateString('it-IT')}
                        </span>
                      </div>
                      {stats.installationDate && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Installato</span>
                          <span className="font-medium">
                            {new Date(stats.installationDate).toLocaleDateString('it-IT')}
                          </span>
                        </div>
                      )}
                      {stats.lastMaintenance && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Ultima Manutenzione</span>
                          <span className="font-medium">
                            {new Date(stats.lastMaintenance.createdAt).toLocaleDateString('it-IT')}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Età Prodotto</span>
                        <span className="font-medium">{stats.productAge} anni</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Statistiche</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.totalMaintenances}</div>
                <p className="text-sm text-muted-foreground">Interventi Totali</p>
              </div>
              
              <Separator />
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">QR Code:</span>
                  <span className="font-mono font-medium">{product.qr_code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Anno:</span>
                  <span className="font-medium">{product.anno}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Età:</span>
                  <span className="font-medium">{stats.productAge} anni</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  {productStatus.badge}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-base text-destructive">Zona Pericolosa</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                variant="destructive" 
                className="w-full justify-start" 
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Elimina Prodotto
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Questa azione eliminerà definitivamente il prodotto e tutto il suo storico.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modali */}
      {showEditModal && (
        <Suspense fallback={null}>
          <ProductModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            productToEdit={product}
            mode="edit"
            onSubmit={(data: any) => {
              console.log('Update product:', data);
              setShowEditModal(false);
              // In produzione: aggiornamento dati
            }}
          />
        </Suspense>
      )}

      {showMaintenanceModal && (
        <Suspense fallback={null}>
          <MaintenanceModal
            isOpen={showMaintenanceModal}
            onClose={() => setShowMaintenanceModal(false)}
            preSelectedProductId={product.id}
            mode="add"
            onSubmit={async (maintenanceData: any) => {
              setIsSubmitting(true);
              try {
                console.log('[ProductDetail] Submitting maintenance:', maintenanceData);

                const response = await fetch('/api/maintenance', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(maintenanceData)
                });

                const result = await response.json();
                console.log('[ProductDetail] API Response:', result);

                if (!response.ok || !result.success) {
                  throw new Error(result.message || 'Errore durante il salvataggio');
                }

                toast({
                  variant: "success",
                  title: "Intervento registrato con successo",
                  description: `Intervento salvato e registrato sulla blockchain`
                });

                // Refresh data per mostrare nuovo intervento
                window.location.reload(); // Simple refresh per ora

                setShowMaintenanceModal(false);
              } catch (error) {
                console.error('[ProductDetail] ❌ Error saving maintenance:', error);
                toast({
                  variant: "destructive",
                  title: "Errore durante il salvataggio",
                  description: error instanceof Error ? error.message : "Riprova più tardi"
                });
              } finally {
                setIsSubmitting(false);
              }
            }}
          />
        </Suspense>
      )}

      {showQRModal && (
        <Suspense fallback={null}>
          <QRCodeModal
            isOpen={showQRModal}
            onClose={() => setShowQRModal(false)}
            product={product}
            company={company}
          />
        </Suspense>
      )}
    </div>
  );
}

// Force dynamic per questa pagina
export const dynamic = 'force-dynamic';

export default function CompanyProductDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <ProductDetailContent />
    </Suspense>
  );
}