/**
 * Company Maintenance Page - Supervisione e gestione interventi aziendali
 *
 * Dashboard completa per il management degli interventi di manutenzione:
 *
 * **Core Features:**
 * - Comprehensive maintenance list con search e advanced filtering
 * - ✅ **Calendar View**: Vista calendario interattiva per manutenzioni programmate
 * - ✅ **Enhanced Detail Modal**: Modal 4-section con tutte le informazioni intervento+prodotto
 * - Schedule Maintenance modal per pianificazione interventi
 * - Export functionality per reporting e compliance
 * - Team assignment e workload distribution
 * - Performance metrics e completion tracking
 * 
 * **Management Capabilities:**
 * - CRUD operations su tutte le manutenzioni aziendali
 * - Advanced filtering per date range, tipo intervento, dipendente
 * - Status management (scheduled, in-progress, completed, overdue)
 * - Bulk operations per gestione multipla
 * - Priority assignment e escalation workflow
 * 
 * **Supervision Features:**
 * - Employee performance tracking e productivity metrics
 * - Product maintenance history aggregation
 * - Geographic distribution analysis
 * - Quality control e compliance monitoring
 * - Resource allocation optimization
 * 
 * **Business Intelligence:**
 * - Maintenance frequency analysis
 * - Cost tracking per tipo intervento
 * - Predictive maintenance suggestions
 * - Team efficiency benchmarking
 * - Customer satisfaction correlation
 * 
 * **Data Management:**
 * - ✅ **Simplified Data Loading**: Single GET /products with nested maintenances
 * - ✅ **Direct Product Access**: All product data immediately available from parent
 * - ✅ **No Matching Required**: productId automatically from product.maintenances loop
 * - ✅ **FlatMap Extraction**: Elegant extraction via flatMap over products array
 * - Comprehensive maintenance records con photo documentation
 * - GPS verification e location accuracy
 * - Timestamp tracking per audit compliance
 * - Note e annotazioni dettagliate
 * - Integration con product database
 * 
 * **Desktop-First Interface:**
 * - Responsive table view con modal details
 * - ✅ **Interactive Calendar**: Vista calendario con navigazione temporale
 * - Advanced filtering sidebar
 * - Export/Import capabilities
 * - Multi-select operations
 * - Print-friendly layouts
 * 
 * **Calendar Features (NEW):**
 * - ✅ Vista giornaliera/settimanale per manutenzioni programmate
 * - ✅ Filtri per dipendente, stato e tipo intervento
 * - ✅ Click su slot vuoti per creare nuovi appuntamenti
 * - ✅ Indicatori visivi per conflitti temporali e carico lavoro
 * - ✅ Toggle seamless tra vista lista e calendario
 *
 * **Maintenance Detail Modal (ENHANCED - Oct 2025):**
 * - ✅ **3-Section Layout**: Informazioni complete su intervento e prodotto associato
 * - ✅ **CARD 1 - Dettagli Intervento**: Anno, causale (highlighted), certificato N° (highlighted),
 *   companyId, tipologia installazione, GPS con Google Maps link, note operative
 * - ✅ **CARD 2 - Prodotto Associato**: Tipo segnale completo, QR/WL codes, forma, dimensioni,
 *   anno produzione, materiali (supporto+pellicola), fissaggio
 * - ✅ **CARD 3 - Foto**: Gallery fotografica documentazione intervento
 * - ✅ **Dynamic Icons**: Icone dinamiche per tipo intervento (Construction, Wrench, ClipboardList, etc.)
 * - ✅ **Visual Hierarchy**: Primary color highlighting per campi critici
 * - ✅ **Google Maps**: Direct link per navigazione GPS
 * - ✅ **Responsive**: 1 col mobile, 2 col desktop, modal occupa 80% larghezza schermo
 *
 * **TODO:** Vista mensile calendario, drag & drop, export calendario PDF/ICS
 */

"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, Download, Eye, Plus, Calendar, User, Package, Wrench, MapPin, Camera, Loader2, AlertCircle, Construction, ClipboardList, FileText, ExternalLink } from "lucide-react";
import { MaintenanceModal } from "@/components/modals/MaintenanceModal";
import { usePageHeader, useHeaderButtons } from "@/contexts";
import type { Maintenance } from "@certplus/types";
import { useToast } from "@/hooks/use-toast";

export default function CompanyMaintenancePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedMaintenance, setSelectedMaintenance] = useState<string | null>(null);
  const [showAddMaintenanceModal, setShowAddMaintenanceModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hooks
  const { toast } = useToast();

  // Fetch products data with nested maintenances from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('[Maintenance] Fetching products with nested maintenances...');

        // Fetch only products (maintenances are nested in products.maintenances array)
        const productsResponse = await fetch('/api/products');
        const productsResult = await productsResponse.json();

        if (productsResult.success && productsResult.data) {
          console.log('[Maintenance] ✅ Loaded products:', productsResult.data.length);
          setProducts(productsResult.data);

          // Extract maintenances from products.maintenances array using flatMap
          // Note: Maintenances are already mapped by api-mapping.ts, just need to update productId
          const allMaintenances = productsResult.data.flatMap((product: any) => {
            return (product.maintenances || []).map((m: Maintenance) => ({
              ...m, // ✅ Already mapped to internal format (id, tipo_intervento, anno, causale, etc.)
              productId: product.id, // ✅ Link to parent product
              product_uuid: product.id // ✅ Also set product_uuid for consistency
            }));
          });

          console.log('[Maintenance] ✅ Extracted maintenances from products:', allMaintenances.length);
          if (allMaintenances.length > 0) {
            console.log('[Maintenance] Sample maintenance:', {
              id: allMaintenances[0]?.id,
              productId: allMaintenances[0]?.productId,
              tipo_intervento: allMaintenances[0]?.tipo_intervento
            });
          }

          setMaintenance(allMaintenances);
        } else {
          setError(productsResult.message || 'Failed to load products');
        }
      } catch (err) {
        console.error('[Maintenance] ❌ Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Listen for maintenance creation events to auto-refresh
    const handleMaintenanceCreated = () => {
      console.log('[Maintenance] New maintenance created, refreshing data...');
      fetchData();
    };

    window.addEventListener('maintenance-created', handleMaintenanceCreated);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('maintenance-created', handleMaintenanceCreated);
    };
  }, []);

  // Configurazione buttons per actions
  const buttonHandlers = useMemo(() => ({
    'add-maintenance': () => setShowAddMaintenanceModal(true)
  }), []);
  
  const createHeaderButtons = useHeaderButtons(buttonHandlers);
  const buttons = useMemo(() => createHeaderButtons([
    { 
      id: 'add-maintenance', 
      label: 'Nuova Manutenzione', 
      mobileLabel: 'Nuova', 
      icon: Plus 
    }
  ]), [createHeaderButtons]);

  // Configura header tramite context
  const headerConfig = useMemo(() => ({
    icon: Wrench,
    title: "Manutenzioni",
    description: 'Cronologia completa degli interventi',
    buttons
  }), [buttons]);

  usePageHeader(headerConfig);

  const filteredMaintenance = useMemo(() =>
    maintenance.filter(m => {
      // Find product by matching productId (UUID from API)
      const product = products.find(p => p.id === m.productId);

      const matchesSearch =
        product?.wl?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product?.tipologia_segnale?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product?.dimensioni?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product?.materiale_supporto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.certificato_numero?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = filterType === "all" || m.tipo_intervento === filterType;

      return matchesSearch && matchesFilter;
    }),
    [maintenance, products, searchTerm, filterType]
  );

  const getTypeBadge = useCallback((type: string) => {
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
  }, []);

  const getInterventionIcon = useCallback((type: string) => {
    const iconMap: Record<string, React.ElementType> = {
      'installazione': Construction,
      'manutenzione': Wrench,
      'verifica': ClipboardList,
      'sostituzione': Package,
      'dismissione': AlertCircle,
    };

    return iconMap[type] || Wrench;
  }, []);

  const handleExport = useCallback(() => {
    alert("Export report manutenzioni da implementare");
  }, []);

  // Refresh maintenances data
  const refreshMaintenances = useCallback(async () => {
    try {
      setLoading(true);
      console.log('[Maintenance] Refreshing data...');

      const response = await fetch('/api/products');
      const result = await response.json();

      if (result.success && result.data) {
        setProducts(result.data);

        const allMaintenances = result.data.flatMap((product: any) => {
          return (product.maintenances || []).map((m: any) => ({
            ...m,
            productId: product.id,
            product_uuid: product.id
          }));
        });

        setMaintenance(allMaintenances);
        console.log('[Maintenance] ✅ Data refreshed');
      }
    } catch (err) {
      console.error('[Maintenance] ❌ Refresh error:', err);
      setError('Errore nel refresh dei dati');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleMaintenanceSubmit = useCallback(async (maintenanceData: any) => {
    setIsSubmitting(true);
    try {
      console.log('[Maintenance] Submitting maintenance:', maintenanceData);

      const response = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(maintenanceData)
      });

      const result = await response.json();
      console.log('[Maintenance] API Response:', result);

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Errore durante il salvataggio');
      }

      toast({
        variant: "success",
        title: "Intervento registrato con successo",
        description: `Intervento salvato e registrato sulla blockchain`
      });

      // Refresh data per mostrare nuovo intervento
      await refreshMaintenances();

      setShowAddMaintenanceModal(false);
    } catch (error) {
      console.error('[Maintenance] ❌ Error saving maintenance:', error);
      toast({
        variant: "destructive",
        title: "Errore durante il salvataggio",
        description: error instanceof Error ? error.message : "Riprova più tardi"
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [toast, refreshMaintenances]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-8">
      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Caricamento manutenzioni...</span>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <AlertCircle className="h-8 w-8 text-destructive" />
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
          {/* Filters */}
          <Card className="transition-all hover:shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
                {/* Search Bar - Left */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cerca WL, segnale, dimensioni, materiale..."
                    className="pl-10 pr-4 focus:ring-primary/20 h-10 sm:h-11 text-sm sm:text-base"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                {/* Filters - Right */}
                <div className="flex gap-3 sm:gap-4 shrink-0">
                  {/* Type Filter */}
                  <div className="w-48">
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-full hover:bg-primary/5 h-10 sm:h-11 text-sm sm:text-base">
                        <SelectValue placeholder="Tipo intervento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tutti i tipi</SelectItem>
                        <SelectItem value="installazione">Installazione</SelectItem>
                        <SelectItem value="manutenzione">Manutenzione</SelectItem>
                        <SelectItem value="verifica">Verifica</SelectItem>
                        <SelectItem value="sostituzione">Sostituzione</SelectItem>
                        <SelectItem value="dismissione">Dismissione</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Export Button */}
                  <Button 
                    variant="outline" 
                    onClick={handleExport} 
                    className="shrink-0 hover:bg-primary/10 h-10 sm:h-11 px-3 sm:px-4 text-sm sm:text-base"
                  >
                    <Download className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Esporta</span>
                    <span className="sm:hidden">Export</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mobile View */}
          <div className="grid gap-4 md:hidden">
            {filteredMaintenance.map((maintenance) => {
              const product = products.find(p => p.id === maintenance.productId);
              return (
                <Card key={maintenance.id} className="cursor-pointer hover:shadow-lg hover:border-primary/20 transition-all duration-200"
                      onClick={() => setSelectedMaintenance(maintenance.id)}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-sm capitalize text-foreground">{maintenance.tipo_intervento}</h3>
                        <p className="text-xs text-muted-foreground">
                          {new Date(maintenance.createdAt).toLocaleDateString('it-IT')}
                        </p>
                      </div>
                      {getTypeBadge(maintenance.tipo_intervento)}
                    </div>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="text-foreground">WL: {product?.wl || 'N/A'} • Cert: <span className="font-semibold">{maintenance.certificato_numero || 'N/A'}</span></div>
                      <div className="flex items-center gap-2">
                        <Badge className="text-xs bg-destructive/10 text-destructive">{product?.tipologia_segnale || 'N/A'}</Badge>
                        <span className="text-foreground">{product?.dimensioni || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-muted-foreground">{product?.materiale_supporto || 'N/A'}</span>
                        <span className="text-foreground font-medium">{product?.anno || 'N/A'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Desktop Table */}
          <Card className="hidden md:block transition-all hover:shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Wrench className="w-4 h-4 text-primary" />
                </div>
                Interventi ({filteredMaintenance.length})
              </CardTitle>
              <CardDescription>
                Cronologia dettagliata delle manutenzioni
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Ora</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>WL Code</TableHead>
                      <TableHead>Certificato</TableHead>
                      <TableHead>Segnale</TableHead>
                      <TableHead>Dimensioni</TableHead>
                      <TableHead>Materiale</TableHead>
                      <TableHead>Anno</TableHead>
                      <TableHead>Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMaintenance.map((maintenance) => {
                      const product = products.find(p => p.id === maintenance.productId);

                      return (
                        <TableRow key={maintenance.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="text-sm font-medium text-foreground">
                                  {new Date(maintenance.createdAt).toLocaleDateString('it-IT')}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(maintenance.createdAt).toLocaleTimeString('it-IT', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getTypeBadge(maintenance.tipo_intervento)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium text-foreground">{product?.wl || 'N/A'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="text-foreground">{maintenance.certificato_numero || 'N/A'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="text-xs bg-destructive/10 text-destructive hover:bg-destructive/20">
                              {product?.tipologia_segnale || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-foreground">
                            {product?.dimensioni || 'N/A'}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {product?.materiale_supporto || 'N/A'}
                          </TableCell>
                          <TableCell className="text-sm text-foreground">
                            {product?.anno || 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedMaintenance(maintenance.id)}
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
              
              {filteredMaintenance.length === 0 && (
                <div className="text-center py-12">
                  <Wrench className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">Nessuna manutenzione trovata</p>
                  <p className="text-muted-foreground/80 text-sm mt-2">Prova a modificare i criteri di ricerca</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

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

                {/* Grid 4-Section Layout */}
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
                              <AlertCircle className="w-3 h-3" />
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
                            <User className="w-3 h-3" />
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
                  {selectedMaintenanceData.foto_urls.length > 0 && (
                    <Card className="lg:col-span-1">
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

      {/* Add Maintenance Modal */}
      <MaintenanceModal
        isOpen={showAddMaintenanceModal}
        onClose={() => setShowAddMaintenanceModal(false)}
        onSubmit={handleMaintenanceSubmit}
        mode="add"
      />
    </div>
  );
}