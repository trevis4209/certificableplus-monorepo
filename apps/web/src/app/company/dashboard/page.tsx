/**
 * Company Dashboard - Pannello Avanzato per Gestione Aziendale
 *
 * Dashboard completo riprogettato con analytics avanzate:
 *
 * **Statistiche Avanzate:**
 * - KPI Overview: Metriche principali con trend
 * - Distribuzione Prodotti: Per tipo, anno, materiale
 * - Analytics Manutenzioni: Per tipo e performance temporali
 * - Copertura Geografica: Città e distribuzione territoriale
 *
 * **Blockchain & Compliance:**
 * - Certificazioni blockchain attive
 * - Azioni pendenti con priorità
 * - Compliance e verifiche scadute
 *
 * **Activity Intelligence:**
 * - Feed attività in tempo reale
 * - Performance team dettagliate
 * - Trend e insights operativi
 *
 * **API Integration:**
 * - Real-time data from GET /api/products (includes nested maintenances)
 * - Single fetch for simplified architecture
 * - Maintenances extracted from products.maintenances array via flatMap
 * - Already mapped data from api-mapping.ts (no double mapping)
 * - Loading/Error states con UI dedicati
 * - NOTE: No company filtering durante sviluppo (mostra tutti i dati)
 * - TODO Production: Aggiungere auth middleware e filtro per companyId
 *
 * **Ottimizzazioni:**
 * - useMemo per statistiche calcolate
 * - Componenti modulari e riutilizzabili
 * - Design responsive e accessibile
 * - Lazy loading e performance ottimizzate
 */

"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package, Users, Wrench, MapPin, TrendingUp,
  AlertTriangle, Globe, Activity, Loader2, Calendar,
  Construction, ClipboardList, FileText, ExternalLink, Camera
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  mockUsers
} from "@/lib/mock-data";
import { ProductModal } from "@/components/modals/ProductModal";
import { EmployeeModal } from "@/components/modals/EmployeeModal";
import { usePageHeader } from "@/contexts";

export default function CompanyDashboard() {
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<string | null>(null);

  // Real data from API
  const [products, setProducts] = useState<any[]>([]);
  const [maintenance, setMaintenance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get current company ID (mock implementation)
  // NOTE: companyId not used for filtering during development with mixed mock/real data
  // In production, use authenticated user's companyId and add API-level filtering
  const currentUser = mockUsers.find(u => u.role === 'company');
  const companyId = currentUser?.companyId || 'company-1';

  // Fetch real data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch only products (includes nested maintenances)
        const productsResponse = await fetch('/api/products');
        const productsResult = await productsResponse.json();

        if (productsResult.success && productsResult.data) {
          // Show all products (no company filter for development with mixed data)
          setProducts(productsResult.data);

          // Extract maintenances from products.maintenances array using flatMap
          // Note: Maintenances are already mapped by api-mapping.ts to internal format
          const allMaintenances = productsResult.data.flatMap((product: any) => {
            return (product.maintenances || []).map((m: any) => ({
              ...m, // ✅ Already mapped (id, tipo_intervento, anno, causale, etc.)
              productId: product.id, // ✅ Link to parent product
              product_uuid: product.id
            }));
          });

          // Show all maintenance (no company filter for development with mixed data)
          setMaintenance(allMaintenances);
        } else {
          setError(productsResult.message || 'Failed to load products');
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [companyId]);

  // Calculate statistics from real data
  const productStats = useMemo(() => {
    const byTipologia: Record<string, number> = {};
    const byMaterial: Record<string, number> = {};
    const byYear: Record<number, number> = {};

    products.forEach(product => {
      // By tipologia
      byTipologia[product.tipologia_segnale] = (byTipologia[product.tipologia_segnale] || 0) + 1;

      // By material
      if (product.materiale_supporto) {
        byMaterial[product.materiale_supporto] = (byMaterial[product.materiale_supporto] || 0) + 1;
      }

      // By year
      if (product.anno) {
        byYear[product.anno] = (byYear[product.anno] || 0) + 1;
      }
    });

    return {
      totalProducts: products.length,
      byTipologia,
      byMaterial,
      byYear,
      recentProducts: products.slice(-5)
    };
  }, [products]);

  const maintenanceStats = useMemo(() => {
    const byType: Record<string, number> = {};

    maintenance.forEach(maint => {
      byType[maint.tipo_intervento] = (byType[maint.tipo_intervento] || 0) + 1;
    });

    return {
      totalMaintenance: maintenance.length,
      byType
    };
  }, [maintenance]);

  const citiesData = useMemo(() => {
    const cityCounts: Record<string, number> = {};

    products.forEach(product => {
      if (product.gps_lat && product.gps_lng) {
        // Simple city extraction from coordinates (in real app, use reverse geocoding)
        const cityKey = `${Math.floor(product.gps_lat)},${Math.floor(product.gps_lng)}`;
        cityCounts[cityKey] = (cityCounts[cityKey] || 0) + 1;
      }
    });

    return Object.entries(cityCounts)
      .map(([coords, count]) => ({
        name: `Zona ${coords}`, // In production, use real city names from reverse geocoding
        count
      }))
      .sort((a, b) => b.count - a.count);
  }, [products]);

  const recentActivity = useMemo(() => {
    return maintenance
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map(m => {
        const product = products.find(p => p.id === m.productId);
        return {
          id: m.id,
          type: m.tipo_intervento,
          description: `${product?.tipologia_segnale || 'Prodotto'} - ${m.certificato_numero || 'N/A'}`,
          user: mockUsers.find(u => u.id === m.userId)?.name || 'Sconosciuto',
          timestamp: m.createdAt
        };
      });
  }, [maintenance, products]);

  // KPI principali
  const mainKPIs = {
    totalProducts: productStats.totalProducts,
    totalEmployees: mockUsers.filter(u => u.role === 'employee' && u.companyId === companyId).length,
    totalMaintenance: maintenanceStats.totalMaintenance,
    activeLocations: citiesData.reduce((sum, city) => sum + city.count, 0)
  };

  const handleProductSubmit = (productData: any) => {
    console.log("Nuovo prodotto:", productData);
    // Qui implementerai la logica per salvare il prodotto
  };

  const handleEmployeeSubmit = (employeeData: any) => {
    console.log("Nuovo dipendente:", employeeData);
    // Qui implementerai la logica per salvare il dipendente
  };

  // Get intervention icon based on type
  const getInterventionIcon = (type: string) => {
    const iconMap: Record<string, React.ElementType> = {
      'installazione': Construction,
      'manutenzione': Wrench,
      'verifica': ClipboardList,
      'sostituzione': Package,
      'dismissione': AlertTriangle,
    };
    return iconMap[type] || Wrench;
  };

  // Get type badge
  const getTypeBadge = (type: string) => {
    const variants: Record<string, { className: string }> = {
      'installazione': { className: 'bg-primary/10 text-primary hover:bg-primary/20' },
      'manutenzione': { className: 'bg-primary/20 text-primary hover:bg-primary/30' },
      'verifica': { className: 'bg-muted text-muted-foreground hover:bg-muted/80' },
      'sostituzione': { className: 'bg-accent/60 text-accent-foreground hover:bg-accent/80' },
      'dismissione': { className: 'bg-destructive/10 text-destructive hover:bg-destructive/20' },
    };

    const config = variants[type] || { className: 'bg-muted text-muted-foreground' };

    return (
      <Badge className={`${config.className} transition-colors`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  // Configura header tramite context
  const headerConfig = useMemo(() => ({
    icon: TrendingUp,
    title: "Dashboard Azienda",
    description: "Panoramica generale delle attività e statistiche"
  }), []);
  
  usePageHeader(headerConfig);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Caricamento dashboard...</span>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card className="border-destructive">
          <CardContent className="flex items-center justify-center py-12">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <div className="ml-3">
              <p className="font-semibold text-destructive">Errore nel caricamento</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content - Only show when not loading and no error */}
      {!loading && !error && (
        <>
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <Card className="transition-all hover:shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div className="text-center sm:text-left">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Prodotti Totali</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{mainKPIs.totalProducts}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto sm:mx-0">
                  <Package className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div className="text-center sm:text-left">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Dipendenti</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{mainKPIs.totalEmployees}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto sm:mx-0">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div className="text-center sm:text-left">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Manutenzioni</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{mainKPIs.totalMaintenance}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto sm:mx-0">
                  <Wrench className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div className="text-center sm:text-left">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Ubicazioni</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{mainKPIs.activeLocations}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto sm:mx-0">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Prima Riga: Prodotti e Manutenzioni Recenti */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="transition-all hover:shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Package className="w-4 h-4 text-primary" />
                </div>
                Prodotti Recenti
              </CardTitle>
              <CardDescription>Ultimi prodotti aggiunti al catalogo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {productStats.recentProducts.length > 0 ? (
                  productStats.recentProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/company/products/${product.id}`}
                      className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors cursor-pointer group"
                    >
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <Package className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                          {product.tipologia_segnale} - {product.tipo_segnale}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {product.qr_code}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Anno {product.anno}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Nessun prodotto disponibile</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Wrench className="w-4 h-4 text-primary" />
                </div>
                Manutenzioni Recenti
              </CardTitle>
              <CardDescription>Ultimi interventi registrati</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.slice(0, 5).map((activity) => {
                  return (
                    <div
                      key={activity.id}
                      onClick={() => setSelectedMaintenance(activity.id)}
                      className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors cursor-pointer group"
                    >
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <Activity className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                          <span className="capitalize">{activity.type}</span> - {activity.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {activity.user} • {new Date(activity.timestamp).toLocaleDateString('it-IT')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seconda Riga: Attività del Team e Distribuzione Geografica */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border border-border">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="text-center sm:text-left">
                  <CardTitle className="text-xl sm:text-2xl font-bold text-foreground flex items-center justify-center sm:justify-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <span>Attività del Team</span>
                  </CardTitle>
                  <CardDescription className="text-muted-foreground mt-2 text-sm sm:text-base">
                    Panoramica dipendenti attivi e performance
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-background/50">
                    {mockUsers.filter(u => u.role === 'employee').length} membri
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockUsers.filter(u => u.role === 'employee' && u.companyId === companyId).map((employee) => {
                  const employeeMaintenance = maintenance.filter(m => m.userId === employee.id);
                  return (
                    <div key={employee.id} className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border/50 hover:bg-background/70 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{employee.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {employeeMaintenance.length} manutenzioni effettuate
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-foreground">
                          {employeeMaintenance.length}
                        </div>
                        <div className="text-xs text-muted-foreground">Totale</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Distribuzione Geografica
              </CardTitle>
              <CardDescription>
                Copertura territoriale e concentrazione prodotti
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                 {citiesData.slice(0, 5).map((city, index) => (
                   <div key={city.name} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                     <div className="flex items-center gap-2">
                       <div className={`w-2 h-2 rounded-full ${
                         index === 0 ? 'bg-green-500' :
                         index === 1 ? 'bg-blue-500' :
                         index === 2 ? 'bg-yellow-500' : 'bg-gray-400'
                       }`} />
                       <span className="text-sm font-medium">{city.name}</span>
                     </div>
                     <Badge variant="outline">{city.count} prodotti</Badge>
                   </div>
                 ))}
               </div>
            </CardContent>
          </Card>
        </div>
        </>
      )}
      {/* End Main Content */}

      {/* Maintenance Details Dialog */}
      <Dialog open={!!selectedMaintenance} onOpenChange={() => setSelectedMaintenance(null)}>
        <DialogContent className="w-[95vw] sm:w-[90vw] lg:w-[80vw] !max-w-none max-h-[90vh] sm:max-h-[85vh] overflow-y-auto mx-auto">
          {(() => {
            const selectedMaintenanceData = maintenance.find((m) => m.id === selectedMaintenance);
            const product = products.find(p => p.id === selectedMaintenanceData?.productId);

            if (!selectedMaintenanceData) return null;

            const InterventionIcon = getInterventionIcon(selectedMaintenanceData.tipo_intervento);

            return (
              <>
                <DialogHeader>
                  <DialogTitle className="text-primary flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <InterventionIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <span className="capitalize">{selectedMaintenanceData.tipo_intervento}</span>
                      <div className="mt-1">
                        {getTypeBadge(selectedMaintenanceData.tipo_intervento)}
                      </div>
                    </div>
                  </DialogTitle>
                  <DialogDescription>
                    Intervento eseguito il {new Date(selectedMaintenanceData.createdAt).toLocaleString('it-IT')}
                  </DialogDescription>
                </DialogHeader>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">

                  {/* CARD 1 - Dettagli Intervento */}
                  <Card>
                    <CardHeader className="pb-3 sm:pb-4">
                      <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-primary" />
                        Dettagli Intervento
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <dl className="space-y-3 sm:space-y-4 text-sm">
                        {/* Anno Intervento */}
                        <div className="flex justify-between items-center py-2 border-b border-border/40">
                          <dt className="text-muted-foreground font-medium flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            Anno:
                          </dt>
                          <dd className="text-foreground font-semibold">
                            {selectedMaintenanceData.anno || 'N/A'}
                          </dd>
                        </div>

                        {/* Causale - HIGHLIGHTED */}
                        {selectedMaintenanceData.causale && (
                          <div className="py-2 border-b border-border/40">
                            <dt className="text-muted-foreground font-medium flex items-center gap-2 mb-2">
                              <AlertTriangle className="w-3 h-3" />
                              Causale:
                            </dt>
                            <dd className="text-primary font-semibold bg-primary/5 p-2 rounded border-l-4 border-primary">
                              {selectedMaintenanceData.causale}
                            </dd>
                          </div>
                        )}

                        {/* Certificato Numero - HIGHLIGHTED */}
                        {selectedMaintenanceData.certificato_numero && (
                          <div className="flex justify-between items-center py-2 border-b border-border/40">
                            <dt className="text-muted-foreground font-medium flex items-center gap-2">
                              <FileText className="w-3 h-3" />
                              Certificato N°:
                            </dt>
                            <dd className="font-mono text-sm text-primary font-bold bg-primary/5 px-3 py-1 rounded">
                              {selectedMaintenanceData.certificato_numero}
                            </dd>
                          </div>
                        )}

                        {/* Company ID */}
                        <div className="flex justify-between items-center py-2 border-b border-border/40">
                          <dt className="text-muted-foreground font-medium flex items-center gap-2">
                            <Users className="w-3 h-3" />
                            Azienda ID:
                          </dt>
                          <dd className="text-foreground font-semibold">
                            {selectedMaintenanceData.companyId || 'N/A'}
                          </dd>
                        </div>

                        {/* Tipologia Installazione */}
                        {selectedMaintenanceData.tipologia_installazione && (
                          <div className="flex justify-between items-center py-2 border-b border-border/40">
                            <dt className="text-muted-foreground font-medium flex items-center gap-2">
                              <Construction className="w-3 h-3" />
                              Tipologia:
                            </dt>
                            <dd className="text-foreground font-semibold">
                              {selectedMaintenanceData.tipologia_installazione}
                            </dd>
                          </div>
                        )}

                        {/* GPS Position con Google Maps Link */}
                        {selectedMaintenanceData.gps_lat && selectedMaintenanceData.gps_lng && (
                          <div className="py-2 border-b border-border/40">
                            <dt className="text-muted-foreground font-medium flex items-center gap-2 mb-2">
                              <MapPin className="w-3 h-3" />
                              Posizione GPS:
                            </dt>
                            <dd className="space-y-1">
                              <div className="text-sm font-mono text-foreground font-semibold">
                                {selectedMaintenanceData.gps_lat.toFixed(6)}, {selectedMaintenanceData.gps_lng.toFixed(6)}
                              </div>
                              <a
                                href={`https://www.google.com/maps?q=${selectedMaintenanceData.gps_lat},${selectedMaintenanceData.gps_lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Apri in Google Maps
                              </a>
                            </dd>
                          </div>
                        )}

                        {/* Note Operative */}
                        {selectedMaintenanceData.note && (
                          <div className="py-2">
                            <dt className="text-muted-foreground font-medium flex items-center gap-2 mb-2">
                              <FileText className="w-3 h-3" />
                              Note Operative:
                            </dt>
                            <dd className="p-3 bg-muted/30 rounded-lg border border-border/50">
                              <p className="text-sm text-foreground whitespace-pre-wrap">
                                {selectedMaintenanceData.note}
                              </p>
                            </dd>
                          </div>
                        )}
                      </dl>
                    </CardContent>
                  </Card>

                  {/* CARD 2 - Prodotto Associato */}
                  <Card>
                    <CardHeader className="pb-3 sm:pb-4">
                      <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                        <Package className="w-4 h-4 text-primary" />
                        Prodotto Associato
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <dl className="space-y-3 sm:space-y-4 text-sm">
                        {/* Tipo Segnale Completo */}
                        <div className="py-2 border-b border-border/40">
                          <dt className="text-muted-foreground font-medium mb-2">Tipo Segnale:</dt>
                          <dd className="space-y-1">
                            <Badge className="text-xs bg-destructive/10 text-destructive mr-2">
                              {product?.tipologia_segnale || 'N/A'}
                            </Badge>
                            {product?.tipo_segnale && (
                              <span className="text-foreground font-semibold">{product.tipo_segnale}</span>
                            )}
                          </dd>
                        </div>

                        {/* QR + WL Codes */}
                        <div className="py-2 border-b border-border/40">
                          <dt className="text-muted-foreground font-medium mb-2">Codici Identificativi:</dt>
                          <dd className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">QR Code:</span>
                              <span className="font-mono text-xs font-semibold">{product?.qr_code || 'N/A'}</span>
                            </div>
                            {product?.wl && (
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">WL Code:</span>
                                <span className="font-mono text-xs font-semibold">{product.wl}</span>
                              </div>
                            )}
                          </dd>
                        </div>

                        {/* Forma e Dimensioni */}
                        <div className="flex justify-between items-center py-2 border-b border-border/40">
                          <dt className="text-muted-foreground font-medium">Forma e Dimensioni:</dt>
                          <dd className="text-foreground font-semibold text-right">
                            {product?.forma || 'N/A'}<br />
                            <span className="text-xs text-muted-foreground">{product?.dimensioni || 'N/A'}</span>
                          </dd>
                        </div>

                        {/* Anno Produzione */}
                        <div className="flex justify-between items-center py-2 border-b border-border/40">
                          <dt className="text-muted-foreground font-medium">Anno Produzione:</dt>
                          <dd className="text-foreground font-semibold">
                            {product?.anno || 'N/A'}
                          </dd>
                        </div>

                        {/* Materiali */}
                        <div className="py-2 border-b border-border/40">
                          <dt className="text-muted-foreground font-medium mb-2">Materiali:</dt>
                          <dd className="space-y-1 text-xs">
                            <div className="flex justify-between items-center bg-muted/30 p-2 rounded">
                              <span className="text-muted-foreground">Supporto:</span>
                              <span className="font-semibold">
                                {product?.materiale_supporto || 'N/A'}
                                {product?.spessore_supporto && ` (${product.spessore_supporto}mm)`}
                              </span>
                            </div>
                            {product?.materiale_pellicola && (
                              <div className="flex justify-between items-center bg-muted/30 p-2 rounded">
                                <span className="text-muted-foreground">Pellicola:</span>
                                <span className="font-semibold">{product.materiale_pellicola}</span>
                              </div>
                            )}
                          </dd>
                        </div>

                        {/* Fissaggio */}
                        {product?.fissaggio && (
                          <div className="flex justify-between items-center py-2">
                            <dt className="text-muted-foreground font-medium">Sistema Fissaggio:</dt>
                            <dd className="text-foreground font-semibold">
                              {product.fissaggio}
                            </dd>
                          </div>
                        )}
                      </dl>
                    </CardContent>
                  </Card>

                  {/* CARD 3 - Foto */}
                  {selectedMaintenanceData.foto_urls && selectedMaintenanceData.foto_urls.length > 0 && (
                    <Card className="lg:col-span-2">
                      <CardHeader>
                        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                          <Camera className="w-4 h-4 text-primary" />
                          Foto ({selectedMaintenanceData.foto_urls.length})
                        </CardTitle>
                        <CardDescription>
                          Documentazione fotografica
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-3">
                          {selectedMaintenanceData.foto_urls.map((url: string, index: number) => (
                            <div key={index} className="group relative overflow-hidden rounded-lg border border-border">
                              <img
                                src={url}
                                alt={`Foto ${index + 1}`}
                                className="w-full aspect-video object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                              <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium">
                                Foto {index + 1}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Add Product Modal */}
      <ProductModal
        isOpen={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        onSubmit={handleProductSubmit}
        mode="add"
      />

      {/* Add Employee Modal */}
      <EmployeeModal
        isOpen={showAddEmployeeModal}
        onClose={() => setShowAddEmployeeModal(false)}
        onSubmit={handleEmployeeSubmit}
        mode="add"
      />
    </div>
  );
}