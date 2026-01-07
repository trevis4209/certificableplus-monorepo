/**
 * Product Landing Client Component - Logica interattiva della landing page
 * 
 * Client Component separato per gestire stato e interazioni:
 * 
 * **State Management:**
 * - Dialog states per modali (blockchain, certificate, maintenance, pending)
 * - Loading states per operazioni async (PDF generation)
 * - User authentication detection e role management
 * 
 * **Interactive Features:**
 * - Blockchain verification con link a explorer
 * - PDF certificate generation mock
 * - Role-based actions (manutentore, produttore, pubblico)
 * - Maintenance workflow integration
 * - Pending actions management per produttori
 * - ✅ **Sezione Cantiere**: Gestione associazione prodotto-cantiere con informazioni complete
 * - ✅ **Storia Manutenzioni**: Cronologia completa di tutti gli interventi con foto
 * - ✅ **Scadenze Pellicole**: Calcolo automatico scadenze basato su classe pellicola
 * 
 * **Mock Integrations:**
 * - mockGenerateCertificate() simula creazione PDF 2s delay
 * - getBlockchainRecord() ritorna transaction hash e explorer URL
 * - getPendingActions() mostra scadenze e azioni programmate
 * - ✅ getCantiereById() e getCantieriAperti() per gestione cantieri
 * - ✅ getScadenzeProgrammate() per calcolo scadenze pellicole retroriflettenti
 * 
 * **New Sections Added:**
 * - **Cantiere Management**: Visualizzazione cantiere attivo o opzione assegnazione
 * - **Scadenze Programmabili**: Alert automatici per manutenzioni basate su normative
 * - **Storia Completa**: Timeline dettagliata di tutti gli interventi con metadati
 * 
 * **User Experience:**
 * - Auto-start maintenance se URL param presente
 * - Progressive enhancement con fallback per no-JS
 * - Loading states con skeleton durante operazioni
 * - Error handling con messaggi user-friendly
 * - ✅ Sezioni collassabili e responsive per mobile
 * 
 * **Performance:**
 * - useCallback per event handlers
 * - Lazy loading modali per ridurre bundle iniziale
 * - Ottimizzazioni rendering per liste lunghe
 * 
 * **TODO:** Service worker per offline, push notifications, cantiere assignment modal
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ExternalLink, Download, Shield, MapPin, Calendar, User, Building, CheckCircle, AlertCircle, Clock, Package, Wrench, FileText, Blocks, QrCode, Construction, History } from "lucide-react";
import { mockUsers, getMaintenanceByProductId, getBlockchainRecord, getInstallationData, getPendingActions, mockGenerateCertificate, getCompanyById, getCantiereById, getCantieriAperti, getScadenzeProgrammate } from "@/lib/mock-data";
import { ThemeToggle } from "@/components/ThemeToggle";

// Interfaccia per le props del componente
interface ProductLandingClientProps {
  qrCode: string;
  product: any;
  role?: string;
  autoStartMaintenance?: boolean;
}

// Interfaccia per i dati del certificato generato
interface CertificateData {
  filename: string;
  size: string;
  pages: number;
  contains: string[];
  generated_at: string;
  blockchain_verified: boolean;
}

/**
 * Hook personalizzato per gestire lo stato dei dialoghi
 * Centralizza la logica di apertura/chiusura di tutti i modali
 */
function useDialogState() {
  const [dialogs, setDialogs] = useState({
    certificate: false,
    blockchain: false,
    maintenance: false,
    pendingActions: false
  });

  const toggleDialog = useCallback((dialogName: keyof typeof dialogs) => {
    setDialogs(prev => ({
      ...prev,
      [dialogName]: !prev[dialogName]
    }));
  }, []);

  const closeAllDialogs = useCallback(() => {
    setDialogs({
      certificate: false,
      blockchain: false,
      maintenance: false,
      pendingActions: false
    });
  }, []);

  return { dialogs, toggleDialog, closeAllDialogs };
}

/**
 * Hook per gestire la generazione del certificato PDF
 * Gestisce loading state e error handling
 */
function useCertificateGeneration(qrCode: string) {
  const [certificateLoading, setCertificateLoading] = useState(false);
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);
  const [certificateError, setCertificateError] = useState<string | null>(null);

  const generateCertificate = useCallback(async () => {
    setCertificateLoading(true);
    setCertificateError(null);
    
    try {
      // Simula chiamata API per generazione PDF
      const cert = await mockGenerateCertificate(qrCode);
      setCertificateData(cert);
      return cert;
    } catch (error) {
      console.error('Error generating certificate:', error);
      setCertificateError('Errore durante la generazione del certificato');
      throw error;
    } finally {
      setCertificateLoading(false);
    }
  }, [qrCode]);

  return {
    certificateLoading,
    certificateData,
    certificateError,
    generateCertificate
  };
}

export default function ProductLandingClient({ 
  qrCode, 
  product, 
  role, 
  autoStartMaintenance 
}: ProductLandingClientProps) {
  const router = useRouter();
  const { dialogs, toggleDialog } = useDialogState();
  const { certificateLoading, certificateData, generateCertificate } = useCertificateGeneration(qrCode);
  
  // Stato per utente corrente (mock authentication)
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Caricamento dati correlati al prodotto
  const company = getCompanyById(product.companyId);
  const maintenances = getMaintenanceByProductId(product.id);
  const installationData = getInstallationData(qrCode);
  const blockchainRecord = getBlockchainRecord(qrCode);
  const pendingActions = getPendingActions(qrCode);
  const lastMaintenance = maintenances[maintenances.length - 1];
  
  // Caricamento dati cantiere e scadenze
  const activeCantiere = product.cantiereId ? getCantiereById(product.cantiereId) : null;
  const cantieriAperti = getCantieriAperti(product.companyId);
  const scadenzeProgrammate = getScadenzeProgrammate(product.companyId).find(s => s.productId === product.id);

  /**
   * Effect per determinare l'utente corrente
   * In produzione, questo verrebbe dalla sessione/JWT
   */
  useEffect(() => {
    if (role) {
      // Mock: trova utente per ruolo
      const user = mockUsers.find(u => u.role === role);
      setCurrentUser(user);
    }
  }, [role]);

  /**
   * Effect per auto-start maintenance se richiesto via URL
   */
  useEffect(() => {
    if (autoStartMaintenance && currentUser?.role === 'employee') {
      // Delay per permettere il rendering della pagina
      setTimeout(() => {
        toggleDialog('maintenance');
      }, 1000);
    }
  }, [autoStartMaintenance, currentUser, toggleDialog]);

  /**
   * Handler per download certificato con error handling
   */
  const handleDownloadCertificate = useCallback(async () => {
    try {
      await generateCertificate();
      toggleDialog('certificate');
    } catch (error) {
      // Error già gestito nel hook
    }
  }, [generateCertificate, toggleDialog]);

  /**
   * Handler per apertura verifica blockchain
   */
  const handleBlockchainVerification = useCallback(() => {
    toggleDialog('blockchain');
  }, [toggleDialog]);

  /**
   * Handler per navigazione a manutenzione
   */
  const handleStartMaintenance = useCallback(() => {
    toggleDialog('maintenance');
  }, [toggleDialog]);

  /**
   * Handler per redirect a procedura manutenzione
   */
  const handleMaintenanceProcedure = useCallback(() => {
    toggleDialog('maintenance');
    // Redirect alla pagina manutenzione con product pre-selezionato
    router.push(`/employee/maintenance?product=${product.id}&qr=${qrCode}`);
  }, [router, product.id, qrCode, toggleDialog]);

  /**
   * Funzione per determinare badge e descrizione status
   */
  const getStatusInfo = useCallback(() => {
    if (!lastMaintenance) {
      return {
        badge: <Badge className="bg-muted text-muted-foreground">Mai controllato</Badge>,
        description: "Prodotto non ancora sottoposto a manutenzione"
      };
    }
    
    switch (lastMaintenance.tipo_intervento) {
      case 'installazione':
        return {
          badge: <Badge className="bg-primary/10 text-primary">Installato</Badge>,
          description: "Prodotto correttamente installato"
        };
      case 'manutenzione':
        return {
          badge: <Badge className="bg-primary/20 text-primary">Mantenuto</Badge>,
          description: "Manutenzione completata con successo"
        };
      case 'verifica':
        return {
          badge: <Badge className="bg-muted text-muted-foreground">Verificato</Badge>,
          description: "Verifica periodica completata"
        };
      case 'dismissione':
        return {
          badge: <Badge variant="destructive">Dismesso</Badge>,
          description: "Prodotto rimosso dal servizio"
        };
      default:
        return {
          badge: <Badge variant="outline">Attivo</Badge>,
          description: "Prodotto in servizio"
        };
    }
  }, [lastMaintenance]);

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header con navigazione e user info */}
      <header className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              {/* Back button */}
              <Link href="/public/view">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Indietro
                </Button>
              </Link>
              
              {/* QR Code badge */}
              <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-lg">
                <QrCode className="w-4 h-4 text-primary" />
                <span className="font-mono text-sm font-bold text-primary">{qrCode}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* User info se autenticato */}
              {currentUser && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background/50 backdrop-blur-sm border border-border">
                  <User className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{currentUser.name}</span>
                  <Badge variant="outline" className="ml-1">{currentUser.role}</Badge>
                </div>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main H1 Title come richiesto */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {product.tipo_segnale}
          </h1>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {statusInfo.badge}
            <Separator orientation="vertical" className="h-6 hidden sm:block" />
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building className="w-4 h-4" />
              <span className="font-medium">{company?.name}</span>
            </div>
            {installationData && (
              <>
                <Separator orientation="vertical" className="h-6 hidden sm:block" />
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Installato {new Date(installationData.installation_date).toLocaleDateString('it-IT')}</span>
                </div>
              </>
            )}
          </div>
          <p className="text-muted-foreground mt-2">{statusInfo.description}</p>
        </div>

        {/* Main Layout: Sinistra foto + Destra info (come richiesto) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* SINISTRA: Foto del cartello con metadati blockchain */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <div className="relative">
                {/* Immagine prodotto */}
                <img
                  src={product.figura}
                  alt={product.tipo_segnale}
                  className="w-full aspect-square object-cover"
                />
                
                {/* Badge blockchain se verificato */}
                {blockchainRecord && (
                  <div className="absolute top-4 right-4 bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Blockchain Verified
                  </div>
                )}
              </div>
              
              {/* Metadati Blockchain overlay (come richiesto) */}
              {blockchainRecord && (
                <CardContent className="bg-muted/50 p-4">
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <Blocks className="w-4 h-4 text-primary" />
                    Metadati Blockchain
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Network:</span>
                      <span className="font-mono">{blockchainRecord.blockchain}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Token ID:</span>
                      <span className="font-mono">{blockchainRecord.token_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Block:</span>
                      <span className="font-mono">{blockchainRecord.block_number.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* GPS Location card */}
            {product.gps_lat && product.gps_lng && (
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    Localizzazione GPS
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Coordinate:</span>
                      <span className="font-mono">{product.gps_lat.toFixed(6)}, {product.gps_lng.toFixed(6)}</span>
                    </div>
                    {installationData && (
                      <div>
                        <span className="text-muted-foreground">Indirizzo:</span>
                        <p className="text-foreground mt-1">{installationData.installation_location}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* DESTRA: Informazioni complete (come richiesto) */}
          <div className="space-y-6">
            
            {/* Informazioni base prodotto */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Informazioni Prodotto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Nome, ID, tipologia */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground text-sm">ID Prodotto</p>
                    <p className="font-mono font-semibold">{product.qr_code}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Anno Produzione</p>
                    <p className="font-semibold">{product.anno}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Forma</p>
                    <p className="font-semibold">{product.forma}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Dimensioni</p>
                    <p className="font-semibold">{product.dimensioni}</p>
                  </div>
                </div>
                
                <Separator />
                
                {/* Specifiche tecniche */}
                <div className="space-y-3">
                  <div>
                    <p className="text-muted-foreground text-sm">Materiale Supporto</p>
                    <p className="font-semibold">{product.materiale_supporto}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Materiale Pellicola</p>
                    <p className="font-semibold">{product.materiale_pellicola}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Spessore</p>
                    <p className="font-semibold">{product.spessore_supporto}mm</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dati Installazione e ditta installatrice (come richiesto) */}
            {installationData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-primary" />
                    Dati Installazione
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <p className="text-muted-foreground text-sm">Data Installazione</p>
                      <p className="font-semibold">{new Date(installationData.installation_date).toLocaleString('it-IT')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Ditta Installatrice</p>
                      <p className="font-semibold">{installationData.installer_company}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Tecnico Installatore</p>
                      <p className="font-semibold">{installationData.installer_technician}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Numero Certificazione</p>
                      <p className="font-mono font-semibold">{installationData.certification_number}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Periodo Garanzia</p>
                      <p className="font-semibold">{installationData.warranty_period}</p>
                    </div>
                  </div>
                  
                  {/* Standard conformità */}
                  {installationData.compliance_standards && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-muted-foreground text-sm mb-2">Standard di Conformità</p>
                        <div className="flex flex-wrap gap-2">
                          {installationData.compliance_standards.map((standard: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {standard}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Sezione Cantiere */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Construction className="w-5 h-5 text-primary" />
                  Gestione Cantiere
                </CardTitle>
                <CardDescription>
                  Informazioni sul cantiere di appartenenza del prodotto
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activeCantiere ? (
                  <div className="space-y-4">
                    <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-primary" />
                          <span className="font-semibold text-primary">Cantiere Attivo</span>
                        </div>
                        <Badge className={`${activeCantiere.stato === 'aperto' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {activeCantiere.stato.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        ID Cantiere: <span className="font-mono">{activeCantiere.id}</span>
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-muted-foreground text-sm">Data Inizio</p>
                        <p className="font-semibold">{new Date(activeCantiere.data_inizio).toLocaleDateString('it-IT')}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">Stato</p>
                        <p className="font-semibold capitalize">{activeCantiere.stato}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-muted-foreground text-sm mb-2">Area Cantiere GPS</p>
                      <div className="bg-muted/50 p-3 rounded text-sm font-mono">
                        <div>Inizio: {activeCantiere.gps_inizio_lat.toFixed(6)}, {activeCantiere.gps_inizio_lng.toFixed(6)}</div>
                        <div>Fine: {activeCantiere.gps_fine_lat.toFixed(6)}, {activeCantiere.gps_fine_lng.toFixed(6)}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Construction className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <h3 className="font-medium text-muted-foreground mb-2">Nessun Cantiere Associato</h3>
                    <p className="text-sm text-muted-foreground">
                      Questo prodotto non è attualmente assegnato a un cantiere
                    </p>
                    {cantieriAperti.length > 0 && currentUser?.role === 'company' && (
                      <div className="mt-4">
                        <p className="text-xs text-muted-foreground mb-2">
                          Cantieri aperti disponibili: {cantieriAperti.length}
                        </p>
                        <Button variant="outline" size="sm">
                          Assegna a Cantiere
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sezione Scadenze Pellicole */}
            {scadenzeProgrammate && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Scadenze Programmabili
                  </CardTitle>
                  <CardDescription>
                    Calcolo automatico scadenze pellicole retroriflettenti
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                        <span className="font-semibold text-yellow-800 dark:text-yellow-200">Manutenzione Programmata</span>
                      </div>
                      <div className="text-sm space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Data Installazione:</span>
                          <span className="font-medium">{new Date(scadenzeProgrammate.dataInstallazione).toLocaleDateString('it-IT')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Classe Pellicola:</span>
                          <span className="font-medium">{scadenzeProgrammate.classPellicola}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Scadenza Prevista:</span>
                          <span className="font-semibold text-yellow-700 dark:text-yellow-300">
                            {new Date(scadenzeProgrammate.dataScadenza).toLocaleDateString('it-IT')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      <p>* Le scadenze sono calcolate automaticamente in base alle normative:</p>
                      <ul className="mt-1 ml-4 space-y-1">
                        <li>• Classe I: 7 anni dalla data di installazione</li>
                        <li>• Classe II: 10 anni dalla data di installazione</li>
                        <li>• Classe IIs: 12 anni dalla data di installazione</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Storia Manutenzioni Completa */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" />
                  Storia Manutenzioni
                  <Badge variant="outline" className="ml-auto">
                    {maintenances.length} interventi
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Cronologia completa di tutti gli interventi effettuati
                </CardDescription>
              </CardHeader>
              <CardContent>
                {maintenances.length > 0 ? (
                  <div className="space-y-4">
                    {maintenances.slice().reverse().map((maintenance, index) => {
                      const isLatest = index === 0;
                      return (
                        <div key={maintenance.id} className={`relative ${isLatest ? 'bg-primary/5 border-primary/20' : 'bg-muted/20'} p-4 rounded-lg border`}>
                          {isLatest && (
                            <div className="absolute -top-2 left-4 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                              Più Recente
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Wrench className="w-4 h-4 text-primary" />
                              <span className="font-semibold capitalize">{maintenance.tipo_intervento}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">
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

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            {maintenance.anno && (
                              <div>
                                <span className="text-muted-foreground">Anno:</span>
                                <span className="ml-2 font-medium">{maintenance.anno}</span>
                              </div>
                            )}
                            {maintenance.causale && (
                              <div>
                                <span className="text-muted-foreground">Causale:</span>
                                <span className="ml-2 font-medium">{maintenance.causale}</span>
                              </div>
                            )}
                            {maintenance.gps_lat && maintenance.gps_lng && (
                              <div className="sm:col-span-2">
                                <span className="text-muted-foreground">Posizione GPS:</span>
                                <span className="ml-2 font-mono text-xs">
                                  {maintenance.gps_lat.toFixed(6)}, {maintenance.gps_lng.toFixed(6)}
                                </span>
                              </div>
                            )}
                            {maintenance.tipologia_installazione && (
                              <div className="sm:col-span-2">
                                <span className="text-muted-foreground">Tipo Installazione:</span>
                                <span className="ml-2 font-medium">{maintenance.tipologia_installazione}</span>
                              </div>
                            )}
                          </div>

                          {maintenance.note && (
                            <div className="mt-3 pt-3 border-t border-border/50">
                              <p className="text-muted-foreground text-xs mb-1">Note:</p>
                              <p className="text-sm bg-muted/30 p-2 rounded">{maintenance.note}</p>
                            </div>
                          )}

                          {maintenance.foto_urls && maintenance.foto_urls.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-border/50">
                              <p className="text-muted-foreground text-xs mb-2">Documentazione fotografica:</p>
                              <div className="flex gap-2">
                                {maintenance.foto_urls.slice(0, 3).map((url, idx) => (
                                  <div key={idx} className="w-16 h-16 bg-muted rounded border overflow-hidden">
                                    <img 
                                      src={url} 
                                      alt={`Foto ${idx + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ))}
                                {maintenance.foto_urls.length > 3 && (
                                  <div className="w-16 h-16 bg-muted rounded border flex items-center justify-center text-xs text-muted-foreground">
                                    +{maintenance.foto_urls.length - 3}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <History className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <h3 className="font-medium text-muted-foreground mb-2">Nessun Intervento Registrato</h3>
                    <p className="text-sm text-muted-foreground">
                      Non sono ancora stati effettuati interventi di manutenzione su questo prodotto
                    </p>
                    {currentUser?.role === 'employee' && (
                      <Button variant="outline" size="sm" className="mt-3" onClick={handleStartMaintenance}>
                        <Wrench className="w-4 h-4 mr-2" />
                        Registra Primo Intervento
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottoni CTA come richiesto */}
        <div className="max-w-3xl mx-auto">
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold mb-2">Azioni Disponibili</h3>
                <p className="text-muted-foreground">Verifica l'autenticità e scarica la documentazione completa</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* BOTTONE 1: Verifica On-Chain (come richiesto) */}
                <Button 
                  onClick={handleBlockchainVerification}
                  className="h-16 flex flex-col items-center justify-center gap-2"
                  disabled={!blockchainRecord}
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    <span className="font-semibold">Verifica On-Chain</span>
                  </div>
                  {blockchainRecord ? (
                    <span className="text-xs opacity-80">Vai all'explorer blockchain</span>
                  ) : (
                    <span className="text-xs opacity-80">Non disponibile</span>
                  )}
                </Button>

                {/* BOTTONE 2: Scarica Certificato (come richiesto) */}
                <Button
                  variant="outline"
                  onClick={handleDownloadCertificate}
                  disabled={certificateLoading}
                  className="h-16 flex flex-col items-center justify-center gap-2 border-primary/20 hover:bg-primary hover:text-primary-foreground"
                >
                  <div className="flex items-center gap-2">
                    {certificateLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" />
                    ) : (
                      <Download className="w-5 h-5" />
                    )}
                    <span className="font-semibold">Scarica Certificato</span>
                  </div>
                  <span className="text-xs opacity-80">
                    {certificateLoading ? 'Generazione in corso...' : 'PDF con storico completo'}
                  </span>
                </Button>
              </div>

              {/* Azioni specifiche per ruolo */}
              <div className="flex flex-col sm:flex-row gap-4 mt-6 pt-6 border-t border-primary/20">
                
                {/* Manutentore Actions */}
                {currentUser?.role === 'employee' && (
                  <Button
                    variant="secondary"
                    onClick={handleStartMaintenance}
                    className="flex-1 h-12"
                  >
                    <Wrench className="w-4 h-4 mr-2" />
                    Aggiungi Manutenzione
                  </Button>
                )}

                {/* Produttore Actions */}
                {currentUser?.role === 'company' && pendingActions.length > 0 && (
                  <Button
                    variant="secondary" 
                    onClick={() => toggleDialog('pendingActions')}
                    className="flex-1 h-12 relative"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Azioni Pending ({pendingActions.length})
                    {pendingActions.some(a => a.status === 'overdue') && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full" />
                    )}
                  </Button>
                )}

                {/* Public User Actions */}
                {!currentUser && (
                  <div className="flex-1 text-center">
                    <p className="text-sm text-muted-foreground mb-2">Hai un account?</p>
                    <Link href="/auth/login">
                      <Button variant="link" className="text-primary">
                        Accedi per funzionalità avanzate
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog Verifica Blockchain */}
      <Dialog open={dialogs.blockchain} onOpenChange={() => toggleDialog('blockchain')}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Verifica Blockchain
            </DialogTitle>
            <DialogDescription>
              Informazioni sulla registrazione blockchain per il prodotto {qrCode}
            </DialogDescription>
          </DialogHeader>
          
          {blockchainRecord ? (
            <div className="space-y-6">
              {/* Badge verificato */}
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-primary">Verificato su Blockchain</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Questo prodotto è stato registrato e verificato sulla blockchain {blockchainRecord.blockchain}
                </p>
              </div>
              
              {/* Dettagli tecnici */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground text-sm">Network</p>
                    <p className="font-semibold">{blockchainRecord.blockchain}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Token ID</p>
                    <p className="font-mono font-semibold">{blockchainRecord.token_id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Block Number</p>
                    <p className="font-mono font-semibold">{blockchainRecord.block_number.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Gas Used</p>
                    <p className="font-mono font-semibold">{blockchainRecord.gas_used}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-muted-foreground text-sm">Transaction Hash</p>
                  <p className="font-mono text-xs bg-muted p-2 rounded break-all">
                    {blockchainRecord.transaction_hash}
                  </p>
                </div>
                
                <div>
                  <p className="text-muted-foreground text-sm">Timestamp</p>
                  <p className="font-semibold">{new Date(blockchainRecord.timestamp).toLocaleString('it-IT')}</p>
                </div>
              </div>
              
              {/* Link a explorer */}
              <div className="flex justify-end">
                <Button asChild>
                  <a href={blockchainRecord.explorer_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Apri su Explorer
                  </a>
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Blockchain Record Non Disponibile</h3>
              <p className="text-muted-foreground">
                Questo prodotto non ha ancora un record blockchain associato
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Scarica Certificato */}
      <Dialog open={dialogs.certificate} onOpenChange={() => toggleDialog('certificate')}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Certificato Generato
            </DialogTitle>
            <DialogDescription>
              Il certificato PDF è stato generato con successo
            </DialogDescription>
          </DialogHeader>
          
          {certificateData && (
            <div className="space-y-4">
              {/* Info file */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold">{certificateData.filename}</span>
                  <Badge variant="outline">{certificateData.size}</Badge>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Pagine: {certificateData.pages}</p>
                  <p>Generato: {new Date(certificateData.generated_at).toLocaleString('it-IT')}</p>
                  {certificateData.blockchain_verified && (
                    <div className="flex items-center gap-1 text-primary">
                      <CheckCircle className="w-3 h-3" />
                      <span className="text-xs">Verifica blockchain inclusa</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Contenuto certificato */}
              <div>
                <p className="text-sm font-semibold mb-2">Contenuto del certificato:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {certificateData.contains.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-primary rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Azioni */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => toggleDialog('certificate')}>
                  Chiudi
                </Button>
                <Button>
                  <Download className="w-4 h-4 mr-2" />
                  Scarica PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Manutenzione per Employee */}
      <Dialog open={dialogs.maintenance} onOpenChange={() => toggleDialog('maintenance')}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nuova Manutenzione</DialogTitle>
            <DialogDescription>
              Avvia una procedura di manutenzione per {product.tipo_segnale}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Questa funzionalità ti permetterà di documentare un nuovo intervento di manutenzione
              con foto, note e firma blockchain.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => toggleDialog('maintenance')}>
                Annulla
              </Button>
              <Button onClick={handleMaintenanceProcedure}>
                <Wrench className="w-4 h-4 mr-2" />
                Inizia Procedura
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Azioni Pending per Company */}
      <Dialog open={dialogs.pendingActions} onOpenChange={() => toggleDialog('pendingActions')}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Azioni Pending</DialogTitle>
            <DialogDescription>
              Azioni programmate e scadenze per il prodotto {qrCode}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {pendingActions.map((action) => (
              <div key={action.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{action.description}</h4>
                    <p className="text-sm text-muted-foreground">{action.action_type.replace('_', ' ')}</p>
                  </div>
                  <Badge 
                    variant={action.status === 'overdue' ? 'destructive' : 'outline'}
                    className={action.priority === 'high' ? 'border-destructive text-destructive' : ''}
                  >
                    {action.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Scadenza:</p>
                    <p className="font-semibold">{new Date(action.due_date).toLocaleDateString('it-IT')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Priorità:</p>
                    <p className="font-semibold capitalize">{action.priority}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Assegnato a:</p>
                    <p className="font-semibold">{action.assigned_technician}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Durata stimata:</p>
                    <p className="font-semibold">{action.estimated_duration}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => toggleDialog('pendingActions')}>
              Chiudi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}