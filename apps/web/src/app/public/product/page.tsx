/**
 * Single Product Landing Page - Landing page singolo cartello
 * 
 * Pagina di destinazione per QR code scans con layout richiesto:
 * 
 * **Layout Structure:**
 * - H1 con nome/identificativo cartello
 * - Sinistra: foto del cartello con metadati blockchain
 * - Destra: informazioni complete (nome, ID, installazione, tipologia, ditta)
 * - Bottoni CTA: Verifica On-Chain, Scarica Certificato
 * 
 * **User Roles Support:**
 * 1. **Utente Pubblico**: Scan QR senza login, visualizza dati
 * 2. **Manutentore**: Login + scan, modale manutenzione dedicata
 * 3. **Produttore**: Verifica azioni effettuate e pending
 * 
 * **QR Code Integration:**
 * - URL parameter ?qr=QR001 per identificazione prodotto
 * - Fallback su ricerca se QR non trovato
 * - Direct links per prodotti specifici
 * 
 * **Mock Features:**
 * - Blockchain verification mock con transaction hash
 * - PDF certificate download simulation
 * - Installation data completa
 * - Pending actions per produttori
 * 
 * **Responsive Design:**
 * - Desktop: Layout side-by-side (foto + info)
 * - Mobile: Layout stacked ottimizzato
 * - Touch-optimized CTA buttons
 * 
 * **TODO:** Dynamic routing [qr_code], user authentication check, role-based actions
 */

"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ExternalLink, Download, Shield, MapPin, Calendar, User, Building, CheckCircle, AlertCircle, Clock, Package, Wrench, FileText, Blocks, QrCode } from "lucide-react";
import { mockProducts, mockUsers, getMaintenanceByProductId, getBlockchainRecord, getInstallationData, getPendingActions, mockGenerateCertificate, getCompanyById } from "@/lib/mock-data";
import { ThemeToggle } from "@/components/ThemeToggle";

function ProductLandingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const qrCode = searchParams.get('qr');
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showCertificateDialog, setShowCertificateDialog] = useState(false);
  const [showBlockchainDialog, setShowBlockchainDialog] = useState(false);
  const [showMaintenanceDialog, setShowMaintenanceDialog] = useState(false);
  const [showPendingActionsDialog, setShowPendingActionsDialog] = useState(false);
  const [certificateLoading, setCertificateLoading] = useState(false);
  const [certificateData, setCertificateData] = useState<any>(null);

  // Mock user detection (in realtà verrebbe da sessione)
  useEffect(() => {
    // Mock: prova a determinare se l'utente è loggato
    const userRole = searchParams.get('role');
    if (userRole) {
      const user = mockUsers.find(u => u.role === userRole);
      setCurrentUser(user);
    }
  }, [searchParams]);

  if (!qrCode) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              QR Code Mancante
            </CardTitle>
            <CardDescription>
              Questa pagina richiede un codice QR valido per funzionare
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Accedi tramite scansione QR code o utilizza un link diretto con parametro ?qr=
            </p>
            <div className="flex flex-col gap-2">
              <Link href="/public/products">
                <Button variant="outline" className="w-full">
                  <Package className="w-4 h-4 mr-2" />
                  Vai al Catalogo
                </Button>
              </Link>
              <Link href="/">
                <Button className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Torna alla Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Trova il prodotto dal QR code
  const product = mockProducts.find(p => p.qr_code === qrCode);
  
  if (!product) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              Prodotto Non Trovato
            </CardTitle>
            <CardDescription>
              Il QR code <code className="bg-muted px-2 py-1 rounded">{qrCode}</code> non corrisponde a nessun prodotto nel database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2">
              <Link href="/public/products">
                <Button variant="outline" className="w-full">
                  <Package className="w-4 h-4 mr-2" />
                  Cerca nel Catalogo
                </Button>
              </Link>
              <Link href="/">
                <Button className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Torna alla Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Carica dati aggiuntivi
  const company = getCompanyById(product.companyId);
  const maintenances = getMaintenanceByProductId(product.id);
  const installationData = getInstallationData(qrCode);
  const blockchainRecord = getBlockchainRecord(qrCode);
  const pendingActions = getPendingActions(qrCode);
  const lastMaintenance = maintenances[maintenances.length - 1];

  const handleDownloadCertificate = async () => {
    setCertificateLoading(true);
    try {
      const cert = await mockGenerateCertificate(qrCode);
      setCertificateData(cert);
      setShowCertificateDialog(true);
    } catch (error) {
      console.error('Error generating certificate:', error);
    } finally {
      setCertificateLoading(false);
    }
  };

  const getStatusInfo = () => {
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
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/public/view">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Indietro
                </Button>
              </Link>
              <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-lg">
                <QrCode className="w-4 h-4 text-primary" />
                <span className="font-mono text-sm font-bold text-primary">{qrCode}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
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
        {/* Main H1 Title */}
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

        {/* Main Layout: Photo + Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* LEFT: Product Photo with Blockchain Metadata */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <div className="relative">
                <img
                  src={product.figura}
                  alt={product.tipo_segnale}
                  className="w-full aspect-square object-cover"
                />
                {blockchainRecord && (
                  <div className="absolute top-4 right-4 bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Blockchain Verified
                  </div>
                )}
              </div>
              
              {/* Blockchain Metadata Overlay */}
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

            {/* GPS Location */}
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

          {/* RIGHT: Product Information */}
          <div className="space-y-6">
            
            {/* Basic Product Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Informazioni Prodotto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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

            {/* Installation Data */}
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

            {/* Maintenance Summary */}
            {maintenances.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-primary" />
                    Ultima Manutenzione
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Tipo Intervento:</span>
                      <Badge variant="outline">{lastMaintenance.tipo_intervento}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Data:</span>
                      <span className="font-semibold">{new Date(lastMaintenance.createdAt).toLocaleDateString('it-IT')}</span>
                    </div>
                    {lastMaintenance.note && (
                      <div>
                        <p className="text-muted-foreground text-sm mb-1">Note:</p>
                        <p className="text-sm bg-muted/50 p-2 rounded">{lastMaintenance.note}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* CTA Buttons Section */}
        <div className="max-w-3xl mx-auto">
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold mb-2">Azioni Disponibili</h3>
                <p className="text-muted-foreground">Verifica l'autenticità e scarica la documentazione completa</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Verifica Blockchain Button */}
                <Button 
                  onClick={() => setShowBlockchainDialog(true)}
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

                {/* Scarica Certificato Button */}
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

              {/* Role-specific buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-6 pt-6 border-t border-primary/20">
                
                {/* Manutentore Actions */}
                {currentUser?.role === 'employee' && (
                  <Button
                    variant="secondary"
                    onClick={() => setShowMaintenanceDialog(true)}
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
                    onClick={() => setShowPendingActionsDialog(true)}
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

      {/* Blockchain Verification Dialog */}
      <Dialog open={showBlockchainDialog} onOpenChange={setShowBlockchainDialog}>
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
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-primary">Verificato su Blockchain</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Questo prodotto è stato registrato e verificato sulla blockchain {blockchainRecord.blockchain}
                </p>
              </div>
              
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

      {/* Certificate Download Dialog */}
      <Dialog open={showCertificateDialog} onOpenChange={setShowCertificateDialog}>
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
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCertificateDialog(false)}>
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

      {/* Maintenance Dialog per Manutentori */}
      <Dialog open={showMaintenanceDialog} onOpenChange={setShowMaintenanceDialog}>
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
              <Button variant="outline" onClick={() => setShowMaintenanceDialog(false)}>
                Annulla
              </Button>
              <Button onClick={() => {
                setShowMaintenanceDialog(false);
                router.push(`/employee/maintenance?product=${product.id}`);
              }}>
                <Wrench className="w-4 h-4 mr-2" />
                Inizia Procedura
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pending Actions Dialog per Produttori */}
      <Dialog open={showPendingActionsDialog} onOpenChange={setShowPendingActionsDialog}>
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
            <Button variant="outline" onClick={() => setShowPendingActionsDialog(false)}>
              Chiudi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

export default function ProductLandingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <ProductLandingContent />
    </Suspense>
  );
}