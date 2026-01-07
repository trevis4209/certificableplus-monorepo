"use client";

import { useState, useEffect, memo, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ModalHeader } from "@/components/ModalHeader";
import { Textarea } from "@/components/ui/textarea";
import { Wrench, Package, User, Camera, MapPin, Loader2, Search, X } from "lucide-react";
import { Maintenance, Product } from "@certplus/types";
import { useToast } from "@/hooks/use-toast";

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (maintenanceData: MaintenanceFormData) => void;
  maintenanceToEdit?: Maintenance | null;
  mode?: 'add' | 'edit';
  preSelectedProductId?: string;
}

interface MaintenanceFormData {
  product_uuid: string; // RINOMINATO: era productId (deve matchare UUID backend)
  intervention_type: 'installation' | 'maintenance' | 'replacement' | 'verification' | 'dismissal'; // Mappato in inglese per API

  // CAMPI OBBLIGATORI API
  gps_lat: number; // Obbligatorio (max 6 decimali, 10 cifre totali)
  gps_lng: number; // Obbligatorio (max 6 decimali, 10 cifre totali)
  year?: number; // Opzionale (solo per alcuni tipi intervento)
  poles_number?: number; // Opzionale (solo per installation, era tipologia_installazione)
  company_id: string; // ID azienda (obbligatorio)
  certificate_number: string; // Numero certificato (obbligatorio)
  reason: string; // Causale (obbligatorio)
  notes: string; // Note (obbligatorio)

  // CAMPI UI LOCALI (non inviati all'API)
  tipo_intervento?: 'installazione' | 'manutenzione' | 'sostituzione' | 'verifica' | 'dismissione'; // Categoria UI italiana
  foto_urls?: File[]; // File locali (convertiti in base64 per API)
}

type InterventionField = 'year' | 'gps' | 'poles_number' | 'reason' | 'notes' | 'foto';

// Mappatura UI italiana → API inglese
const interventionTypeMap = {
  'installazione': 'installation',
  'manutenzione': 'maintenance',
  'sostituzione': 'replacement',
  'verifica': 'verification',
  'dismissione': 'dismissal'
} as const;

const interventionTypes = [
  {
    value: 'installazione' as const,
    apiValue: 'installation' as const,
    label: 'Installazione',
    description: 'Prima installazione del prodotto con specifiche complete',
    icon: Package,
    fields: ['year', 'gps', 'poles_number', 'reason', 'notes', 'foto'] as InterventionField[]
  },
  {
    value: 'manutenzione' as const,
    apiValue: 'maintenance' as const,
    label: 'Manutenzione',
    description: 'Controllo e manutenzione ordinaria',
    icon: Wrench,
    fields: ['gps', 'reason', 'notes', 'foto'] as InterventionField[]
  },
  {
    value: 'sostituzione' as const,
    apiValue: 'replacement' as const,
    label: 'Sostituzione',
    description: 'Sostituzione completa del segnale',
    icon: Package,
    fields: ['year', 'gps', 'reason', 'notes', 'foto'] as InterventionField[]
  },
  {
    value: 'verifica' as const,
    apiValue: 'verification' as const,
    label: 'Verifica',
    description: 'Controllo visivo e verifica stato conformità',
    icon: Package,
    fields: ['year', 'gps', 'reason', 'notes', 'foto'] as InterventionField[]
  },
  {
    value: 'dismissione' as const,
    apiValue: 'dismissal' as const,
    label: 'Dismissione',
    description: 'Rimozione definitiva del prodotto dal servizio',
    icon: Package,
    fields: ['year', 'gps', 'reason', 'notes', 'foto'] as InterventionField[]
  }
];

export const MaintenanceModal = memo(function MaintenanceModal({
  isOpen,
  onClose,
  onSubmit,
  maintenanceToEdit,
  mode = 'add',
  preSelectedProductId
}: MaintenanceModalProps) {
  const [formData, setFormData] = useState<MaintenanceFormData>({
    product_uuid: preSelectedProductId || "", // UUID prodotto (obbligatorio)
    intervention_type: "maintenance", // API value inglese
    tipo_intervento: "manutenzione", // UI value italiano

    // CAMPI OBBLIGATORI API
    gps_lat: 0,
    gps_lng: 0,
    year: new Date().getFullYear(),
    poles_number: undefined,
    company_id: "1", // Default fisso
    certificate_number: `CERT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
    reason: "",
    notes: "",

    // CAMPI UI
    foto_urls: []
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [checkingInstallation, setCheckingInstallation] = useState(false);
  const { toast } = useToast();

  const handleReset = useCallback(() => {
    setFormData({
      product_uuid: preSelectedProductId || "",
      intervention_type: "maintenance",
      tipo_intervento: "manutenzione",

      gps_lat: 0,
      gps_lng: 0,
      year: new Date().getFullYear(),
      poles_number: undefined,
      company_id: "1",
      certificate_number: `CERT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      reason: "",
      notes: "",

      foto_urls: []
    });
    setSelectedFiles([]);
  }, [preSelectedProductId]);

  // Fetch prodotti reali dall'API quando il modal si apre
  useEffect(() => {
    if (isOpen) {
      const fetchProducts = async () => {
        setLoadingProducts(true);
        try {
          const response = await fetch('/api/products');
          const data = await response.json();

          if (data.success && Array.isArray(data.data)) {
            setProducts(data.data);
            console.log('[MaintenanceModal] Loaded products:', data.data.length);
          } else {
            console.error('[MaintenanceModal] Invalid products response:', data);
            setProducts([]);
          }
        } catch (error) {
          console.error('[MaintenanceModal] Error fetching products:', error);
          setProducts([]);
        } finally {
          setLoadingProducts(false);
        }
      };

      fetchProducts();
    }
  }, [isOpen]);

  // Filtra prodotti in base alla query di ricerca
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;

    const query = searchQuery.toLowerCase();
    return products.filter(product =>
      product.wl?.toLowerCase().includes(query) ||
      product.qr_code?.toLowerCase().includes(query) ||
      product.tipo_segnale?.toLowerCase().includes(query) ||
      product.tipologia_segnale?.toLowerCase().includes(query) ||
      product.forma?.toLowerCase().includes(query) ||
      product.dimensioni?.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  // Effetto per popolare il form quando si modifica una manutenzione esistente
  useEffect(() => {
    if (maintenanceToEdit && mode === 'edit') {
      // Mappa intervention_type da API a UI
      const tipoInterventoUI = Object.entries(interventionTypeMap).find(
        ([_, apiValue]) => apiValue === maintenanceToEdit.intervention_type
      )?.[0] as MaintenanceFormData['tipo_intervento'];

      setFormData({
        product_uuid: maintenanceToEdit.product_uuid || "",
        intervention_type: maintenanceToEdit.intervention_type || "maintenance",
        tipo_intervento: tipoInterventoUI || "manutenzione",

        gps_lat: maintenanceToEdit.gps_lat || 0,
        gps_lng: maintenanceToEdit.gps_lng || 0,
        year: maintenanceToEdit.year || new Date().getFullYear(),
        poles_number: maintenanceToEdit.poles_number,
        company_id: "1", // Sempre 1 di default
        certificate_number: maintenanceToEdit.certificate_number || `CERT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        reason: maintenanceToEdit.reason || "",
        notes: maintenanceToEdit.notes || "",

        foto_urls: []
      });
    } else {
      handleReset();
    }
  }, [maintenanceToEdit, mode, isOpen, handleReset]);

  // Controllo installazione prodotto quando cambia product_uuid (via API)
  useEffect(() => {
    if (!formData.product_uuid) {
      setIsInstalled(false);
      return;
    }

    const checkInstallation = async () => {
      setCheckingInstallation(true);
      try {
        console.log('[MaintenanceModal] Checking installation for product:', formData.product_uuid);

        const response = await fetch(`/api/products?id=${formData.product_uuid}`);
        const result = await response.json();

        if (result.success && result.data) {
          // Controlla se esiste almeno un intervento di tipo 'installazione' nel nested array mappato
          const hasInstallation = result.data.maintenances?.some(
            (m: any) => m.tipo_intervento === 'installazione'
          ) || false;

          console.log('[MaintenanceModal] ✅ Product installation status:', hasInstallation);
          setIsInstalled(hasInstallation);

          // Se il prodotto non è installato, forza tipo_intervento a 'installazione'
          if (!hasInstallation && formData.tipo_intervento !== 'installazione') {
            setFormData(prev => ({
              ...prev,
              tipo_intervento: 'installazione',
              intervention_type: 'installation'
            }));
          }
        } else {
          console.log('[MaintenanceModal] ⚠️ Product not found or invalid response');
          setIsInstalled(false);
        }
      } catch (error) {
        console.error('[MaintenanceModal] ❌ Error checking installation:', error);
        setIsInstalled(false);
      } finally {
        setCheckingInstallation(false);
      }
    };

    checkInstallation();
  }, [formData.product_uuid]);

  const handleInputChange = useCallback((field: keyof MaintenanceFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files]);
      setFormData(prev => ({ 
        ...prev, 
        foto_urls: [...(prev.foto_urls || []), ...files] 
      }));
    }
  }, []);

  const removeFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({ 
      ...prev, 
      foto_urls: (prev.foto_urls || []).filter((_, i) => i !== index)
    }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const dataToSubmit = {
        ...formData,
        company_id: "1", // Forza sempre ID azienda = "1"
        id: maintenanceToEdit?.id,
        createdAt: maintenanceToEdit?.createdAt || new Date().toISOString()
      };

      // Chiama il callback del parent e ASPETTA il completamento
      await onSubmit?.(dataToSubmit);

      // ✅ Toast DOPO successo API (solo se arriva qui = successo)
      toast({
        variant: "success",
        title: "Intervento registrato con successo",
        description: mode === 'add'
          ? "Il nuovo intervento è stato salvato correttamente."
          : "Le modifiche all'intervento sono state salvate.",
      });

      if (mode === 'add') {
        handleReset();
      }
      onClose(); // Chiude modal solo dopo successo
    } catch (error) {
      console.error("Errore durante il salvataggio:", error);

      // ❌ Toast DOPO errore API
      toast({
        variant: "destructive",
        title: "Errore durante il salvataggio",
        description: error instanceof Error ? error.message : "Si è verificato un errore. Riprova più tardi.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, isSubmitting, onSubmit, maintenanceToEdit?.id, maintenanceToEdit?.createdAt, mode, onClose, toast, handleReset]);

  const handleClose = useCallback(() => {
    if (mode === 'add') {
      handleReset();
    }
    setSearchQuery(""); // Reset ricerca
    onClose();
  }, [mode, handleReset, onClose]);

  const selectedIntervention = useMemo(() =>
    interventionTypes.find(t => t.value === formData.tipo_intervento),
    [formData.tipo_intervento]
  );

  const isFormValid = useMemo(() => {
    // Campi base sempre obbligatori
    const baseValid = formData.product_uuid &&
                     formData.intervention_type &&
                     formData.gps_lat &&
                     formData.gps_lng &&
                     formData.certificate_number &&
                     formData.notes;

    // Se è installazione, richiedi campi specifici
    if (formData.intervention_type === 'installation') {
      return baseValid &&
             formData.poles_number !== undefined &&
             formData.poles_number > 0 &&
             formData.reason && // reason obbligatorio per installation
             formData.year;     // year obbligatorio per installation
    }

    // Per altri tipi, controlla solo se reason è visibile nel form (quindi richiesto)
    if (selectedIntervention?.fields?.includes('reason')) {
      return baseValid && formData.reason;
    }

    // Per manutenzione ordinaria (solo gps e notes)
    return baseValid;
  }, [
    formData.product_uuid,
    formData.intervention_type,
    formData.gps_lat,
    formData.gps_lng,
    formData.certificate_number,
    formData.notes,
    formData.reason,
    formData.poles_number,
    formData.year,
    selectedIntervention
  ]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-5xl max-h-[95vh] flex flex-col p-0 gap-0">
        <ModalHeader
          icon={Wrench}
          title={mode === 'edit' ? 'Modifica Intervento' : 'Nuovo Intervento'}
          description={mode === 'edit' 
            ? 'Aggiorna i dettagli della manutenzione selezionata' 
            : 'Registra un nuovo intervento di manutenzione sul campo'}
          className="bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent"
        />

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto px-6 py-2">
          <form id="maintenance-form" onSubmit={handleSubmit} className="space-y-8">
            
            {/* Sezione 1: Identificazione & Tipo Intervento */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b border-orange-500/20">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-orange-500">1</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground">Identificazione & Intervento</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Selezione Prodotto */}
                <div className="space-y-4 p-4 rounded-xl border border-border bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-5 h-5 text-primary" />
                    <h4 className="font-medium text-foreground">Prodotto da Manutenere</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="product_uuid" className="text-sm font-medium">Seleziona Prodotto *</Label>
                    <Select
                      value={formData.product_uuid}
                      onValueChange={(value) => handleInputChange("product_uuid", value)}
                      disabled={loadingProducts}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder={loadingProducts ? "Caricamento prodotti..." : "Cerca prodotto..."} />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Campo di ricerca */}
                        <div className="flex items-center px-3 pb-2 border-b sticky top-0 bg-background z-10">
                          <Search className="w-4 h-4 mr-2 text-muted-foreground" />
                          <Input
                            placeholder="Cerca per WL, QR, tipo..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-8 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                          />
                          {searchQuery && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 ml-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSearchQuery("");
                              }}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          )}
                        </div>

                        {/* Risultati */}
                        {loadingProducts ? (
                          <div className="flex items-center justify-center p-4">
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            <span className="text-sm text-muted-foreground">Caricamento...</span>
                          </div>
                        ) : filteredProducts.length === 0 ? (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            {searchQuery
                              ? `Nessun prodotto trovato per "${searchQuery}"`
                              : "Nessun prodotto disponibile. Crea prima un prodotto."
                            }
                          </div>
                        ) : (
                          <>
                            {/* Conteggio risultati */}
                            {searchQuery && (
                              <div className="px-3 py-2 text-xs text-muted-foreground border-b bg-muted/30">
                                {filteredProducts.length} di {products.length} prodotti
                              </div>
                            )}

                            {/* Lista prodotti filtrati */}
                            {filteredProducts.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                <div className="flex flex-col items-start">
                                  <span className="font-medium">WL: {product.wl}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {product.qr_code} • {product.tipo_segnale || product.tipologia_segnale} • {product.forma} • {product.dimensioni}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </>
                        )}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      💡 Seleziona il prodotto su cui effettuare l'intervento ({searchQuery ? `${filteredProducts.length} di ` : ''}{products.length} prodotti disponibili)
                    </p>

                    {/* Helper text stato installazione */}
                    {formData.product_uuid && (
                      <div className={`mt-3 p-2 rounded-lg border ${
                        checkingInstallation
                          ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900'
                          : isInstalled
                          ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900'
                          : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900'
                      }`}>
                        <p className={`text-xs font-medium flex items-center gap-2 ${
                          checkingInstallation
                            ? 'text-blue-700 dark:text-blue-400'
                            : isInstalled
                            ? 'text-green-700 dark:text-green-400'
                            : 'text-amber-700 dark:text-amber-400'
                        }`}>
                          {checkingInstallation ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Verifica stato installazione...
                            </>
                          ) : isInstalled ? (
                            '✅ Prodotto già installato - disponibili tutti gli interventi tranne installazione'
                          ) : (
                            '⚠️ Prodotto non ancora installato - è necessario prima effettuare l\'installazione'
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tipo di Intervento */}
                <div className="space-y-4 p-4 rounded-xl border border-border bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Wrench className="w-5 h-5 text-orange-500" />
                    <h4 className="font-medium text-foreground">Tipo di Intervento</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="tipo_intervento" className="text-sm font-medium">Categoria *</Label>
                    <Select
                      value={formData.tipo_intervento}
                      onValueChange={(value) => {
                        // Aggiorna sia UI che API value
                        const selectedType = interventionTypes.find(t => t.value === value);
                        if (selectedType) {
                          handleInputChange("tipo_intervento", value);
                          handleInputChange("intervention_type", selectedType.apiValue);
                        }
                      }}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Seleziona tipo..." />
                      </SelectTrigger>
                      <SelectContent>
                        {interventionTypes
                          .filter(type => {
                            // Se nessun prodotto selezionato, mostra tutte le opzioni
                            if (!formData.product_uuid) return true;

                            // Se il prodotto non è installato, mostra solo 'installazione'
                            if (!isInstalled) {
                              return type.value === 'installazione';
                            }

                            // Se il prodotto è installato, nascondi 'installazione'
                            return type.value !== 'installazione';
                          })
                          .map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-3">
                                <type.icon className="w-4 h-4 text-muted-foreground" />
                                <div className="flex flex-col items-start">
                                  <span className="font-medium">{type.label}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {type.description}
                                  </span>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedIntervention && (
                    <div className="p-3 bg-orange-500/5 border border-orange-500/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <selectedIntervention.icon className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-medium text-orange-700">{selectedIntervention.label}</span>
                      </div>
                      <p className="text-xs text-orange-600">
                        {selectedIntervention.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>


            {/* Sezione 2: Localizzazione */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b border-orange-500/20">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-orange-500">2</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground">Localizzazione Intervento</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="gps_lat" className="text-sm font-medium">Latitudine GPS *</Label>
                  <Input
                    id="gps_lat"
                    type="number"
                    step="0.000001"
                    value={formData.gps_lat || ''}
                    onChange={(e) => handleInputChange("gps_lat", parseFloat(e.target.value) || 0)}
                    placeholder="45.464664"
                    className="h-11 font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gps_lng" className="text-sm font-medium">Longitudine GPS *</Label>
                  <Input
                    id="gps_lng"
                    type="number"
                    step="0.000001"
                    value={formData.gps_lng || ''}
                    onChange={(e) => handleInputChange("gps_lng", parseFloat(e.target.value) || 0)}
                    placeholder="9.190000"
                    className="h-11 font-mono"
                  />
                </div>
              </div>
              
              <Button 
                type="button"
                variant="outline" 
                onClick={() => {
                  // Rilevamento posizione GPS
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        // Formatta coordinate con esattamente 10 cifre totali (max 6 decimali)
                        const formatGpsCoordinate = (coord: number): number => {
                          // Arrotonda a 6 decimali
                          const rounded = parseFloat(coord.toFixed(6));

                          // Separa parte intera e decimale
                          const parts = rounded.toString().split('.');
                          const intPart = parts[0];
                          let decPart = parts[1] || '';

                          // Calcola quante cifre decimali servono per raggiungere 10 cifre totali
                          const targetDecDigits = 10 - intPart.length;

                          if (targetDecDigits < 0) {
                            // Coordinate troppo grande (es: 12345.6) - tronca parte intera
                            console.warn(`Coordinate ${coord} ha parte intera troppo grande, troncata`);
                            return parseFloat(intPart.substring(0, 10));
                          }

                          if (targetDecDigits > 6) {
                            // Max 6 decimali anche se servirebbe di più
                            decPart = decPart.substring(0, 6).padEnd(6, '0');
                          } else {
                            // Padda o tronca per raggiungere esattamente targetDecDigits
                            decPart = decPart.substring(0, targetDecDigits).padEnd(targetDecDigits, '0');
                          }

                          return parseFloat(`${intPart}.${decPart}`);
                        };

                        const lat = formatGpsCoordinate(position.coords.latitude);
                        const lng = formatGpsCoordinate(position.coords.longitude);

                        handleInputChange("gps_lat", lat);
                        handleInputChange("gps_lng", lng);
                      },
                      (error) => {
                        console.error("Errore geolocalizzazione:", error);
                        alert("Impossibile rilevare la posizione. Controlla i permessi del browser.");
                      }
                    );
                  } else {
                    alert("Geolocalizzazione non supportata dal browser.");
                  }
                }}
                className="w-full"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Rileva Posizione GPS
              </Button>
            </div>

            {/* Sezione 2.5: Campi Specifici per Tipo Intervento */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b border-primary/20">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">2.5</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground">Dettagli Specifici</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Anno - per installazione, verifica, dismissione (API: year) */}
                {selectedIntervention?.fields?.includes('year') && (
                  <div className="space-y-2">
                    <Label htmlFor="year" className="text-sm font-medium">Anno *</Label>
                    <Input
                      id="year"
                      type="number"
                      min="2020"
                      max={new Date().getFullYear() + 5}
                      value={formData.year || new Date().getFullYear()}
                      onChange={(e) => handleInputChange("year", parseInt(e.target.value) || new Date().getFullYear())}
                      className="h-11"
                    />
                  </div>
                )}

                {/* Numero Pali - solo per installazione (API: poles_number) */}
                {formData.tipo_intervento === 'installazione' && (
                  <div className="space-y-2">
                    <Label htmlFor="poles_number" className="text-sm font-medium">N° Pali *</Label>
                    <Input
                      id="poles_number"
                      type="number"
                      min="1"
                      max="20"
                      value={formData.poles_number || ''}
                      onChange={(e) => handleInputChange("poles_number", parseInt(e.target.value) || undefined)}
                      placeholder="1"
                      className="h-11"
                    />
                    <p className="text-xs text-muted-foreground">
                      🏗️ Numero pali utilizzati per l'installazione
                    </p>
                  </div>
                )}
              </div>

              {/* Campi Obbligatori per Storico - Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="certificate_number" className="text-sm font-medium">N° Certificato *</Label>
                  <Input
                    id="certificate_number"
                    value={formData.certificate_number}
                    onChange={(e) => handleInputChange("certificate_number", e.target.value)}
                    placeholder="CERT-2024-001"
                    className="h-11 font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    🏆 Numero certificato associato all'intervento
                  </p>
                </div>

                {/* Reason - per tutti i tipi di intervento (API: reason) */}
                {selectedIntervention?.fields?.includes('reason') && (
                  <div className="space-y-2">
                    <Label htmlFor="reason" className="text-sm font-medium">Causale *</Label>
                    <Textarea
                      id="reason"
                      value={formData.reason || ''}
                      onChange={(e) => handleInputChange("reason", e.target.value)}
                      placeholder="Descrivi il motivo dell'intervento..."
                      rows={3}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      💡 Specifica dettagliatamente il motivo dell'intervento
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Sezione 3: Documentazione */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b border-orange-500/20">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-orange-500">3</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground">Documentazione Intervento</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Note */}
                <div className="space-y-4 p-4 rounded-xl border border-border bg-muted/30">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    <h4 className="font-medium text-foreground">Note e Dettagli</h4>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm font-medium">Descrizione Intervento *</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleInputChange("notes", e.target.value)}
                      placeholder="Descrivi dettagliatamente l'intervento effettuato:
• Stato del segnale prima dell'intervento
• Operazioni eseguite
• Eventuali anomalie riscontrate
• Materiali utilizzati"
                      rows={6}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      ℹ️ Una descrizione dettagliata aiuta nella tracciabilità (campo obbligatorio API)
                    </p>
                  </div>
                </div>

                {/* Foto */}
                <div className="space-y-4 p-4 rounded-xl border border-dashed border-primary/30 bg-primary/5">
                  <div className="flex items-center gap-2">
                    <Camera className="w-5 h-5 text-primary" />
                    <h4 className="font-medium text-foreground">Documentazione Fotografica</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Input
                        id="foto"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={() => document.getElementById("foto")?.click()}
                        className="flex items-center gap-2 w-full"
                      >
                        <Camera className="w-4 h-4" />
                        {selectedFiles.length > 0 ? `Aggiungi Altre Foto` : `Scatta/Carica Foto`}
                      </Button>
                    </div>
                    
                    {selectedFiles.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-primary">
                          <div className="w-2 h-2 bg-primary rounded-full" />
                          {selectedFiles.length} foto caricate
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                          {selectedFiles.map((file, index) => (
                            <div key={index} className="relative group">
                              <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`Foto ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => removeFile(index)}
                                >
                                  ✕
                                </Button>
                              </div>
                              <p className="text-xs text-center text-muted-foreground mt-1 truncate">
                                {file.name}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <p className="text-xs text-muted-foreground">
                      📸 Consigliato: Foto prima, durante e dopo l'intervento
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Modern Footer with Actions */}
        <div className="flex-shrink-0 p-6 pt-4 border-t bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
            <div className="text-sm text-muted-foreground">
              * Campi obbligatori
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Annulla
              </Button>
              <Button
                type="submit"
                form="maintenance-form"
                size="lg"
                disabled={!isFormValid || isSubmitting}
                className="flex items-center gap-2 min-w-[160px] bg-orange-500 hover:bg-orange-600"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Wrench className="w-4 h-4" />
                    {mode === 'edit' ? "Aggiorna" : "Registra Intervento"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});