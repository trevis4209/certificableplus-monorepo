"use client";

import { useState, useEffect, memo, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ModalHeader } from "@/components/ModalHeader";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Upload, Construction, Clock, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (productData: ProductApiPayload) => void;
  productToEdit?: Product | null;
  mode?: 'add' | 'edit';
}

interface ProductApiPayload {
  id?: string;
  qr_code: string;
  signal_type: string;        // "permanent" or "temporary"
  signal_category: string;    // Descriptive category
  production_year: number;
  shape: string;
  dimension: string;
  wl_code: string;
  support_material: string;
  support_thickness: string;
  fixation_class: string;
  fixation_method: string;
  created_by: string;
}

interface Product {
  id?: string;
  qr_code?: string;
  signal_type: 'permanent' | 'temporary'; // Signal type
  signal_category?: string;               // Descriptive category
  production_year: number;
  shape: string;
  dimension?: string;
  support_material?: string;
  support_thickness?: number;
  wl_code?: string;
  fixation_class?: string;
  image?: string;
  fixation_method?: string;
  created_by?: string;
}

interface ProductFormData {
  qr_code: string;
  signal_type: 'permanent' | 'temporary' | ''; // Signal type from step 1
  signal_category: string;                      // Descriptive category from step 2
  production_year: string;
  shape: string;
  dimension: string;
  support_material: string;
  support_thickness: string;
  wl_code: string;
  fixation_class: string;
  image?: File;
  fixation_method: string;
  created_by: string;
}


export const ProductModal = memo(function ProductModal({ isOpen, onClose, onSubmit, productToEdit, mode = 'add' }: ProductModalProps) {
  const [currentStep, setCurrentStep] = useState(1);

  // Helper per generare QR code univoco
  const generateQRCode = () => `QR${Date.now()}`;

  const [formData, setFormData] = useState<ProductFormData>({
    qr_code: generateQRCode(),
    signal_type: "",        // "permanent" or "temporary" from step 1
    signal_category: "",    // Descriptive text from step 2
    production_year: "",
    shape: "",
    dimension: "",
    support_material: "",
    support_thickness: "",
    wl_code: "",
    fixation_class: "",
    fixation_method: "",
    created_by: ""
  });

  // Effetto per popolare il form quando si modifica un prodotto esistente
  useEffect(() => {
    if (productToEdit && mode === 'edit') {
      setFormData({
        qr_code: productToEdit.qr_code || generateQRCode(),
        signal_type: productToEdit.signal_type || "",
        signal_category: productToEdit.signal_category || "",
        production_year: productToEdit.production_year?.toString() || "",
        shape: productToEdit.shape || "",
        dimension: productToEdit.dimension || "",
        support_material: productToEdit.support_material || "",
        support_thickness: productToEdit.support_thickness?.toString() || "",
        wl_code: productToEdit.wl_code || "",
        fixation_class: productToEdit.fixation_class || "",
        fixation_method: productToEdit.fixation_method || "",
        created_by: productToEdit.created_by || ""
      });
      // Se stiamo modificando, vai direttamente al step 2
      setCurrentStep(2);
    } else {
      handleReset();
      setCurrentStep(1);
    }
  }, [productToEdit, mode, isOpen]);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = useCallback((field: keyof ProductFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFormData(prev => ({ ...prev, image: file }));
    }
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Transform form data to API format (English payload)
      const apiPayload = {
        id: productToEdit?.id,
        qr_code: formData.qr_code,
        signal_type: formData.signal_type,
        signal_category: formData.signal_category,
        production_year: parseInt(formData.production_year),
        shape: formData.shape,
        dimension: formData.dimension,
        wl_code: formData.wl_code,
        support_material: formData.support_material,
        support_thickness: formData.support_thickness,
        fixation_class: formData.fixation_class,
        fixation_method: formData.fixation_method,
        created_by: formData.created_by
      };

      // ✅ Aspetta il completamento dell'API call
      await onSubmit?.(apiPayload);

      // ✅ Toast success DOPO completamento
      toast({
        variant: "success",
        title: mode === 'edit' ? "Prodotto aggiornato" : "Prodotto creato con successo",
        description: `QR Code: ${formData.qr_code}`,
      });

      // ✅ Reset e chiudi SOLO DOPO successo
      if (mode === 'add') {
        handleReset();
      }
      onClose();
    } catch (error) {
      console.error("Errore durante il salvataggio:", error);

      // ✅ Toast errore con dettagli
      toast({
        variant: "destructive",
        title: "Errore durante il salvataggio",
        description: error instanceof Error ? error.message : "Si è verificato un errore. Riprova più tardi.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, isSubmitting, onSubmit, productToEdit?.id, mode, onClose, toast]);

  const handleReset = useCallback(() => {
    setFormData({
      qr_code: generateQRCode(),
      signal_type: "",
      signal_category: "",
      production_year: "",
      shape: "",
      dimension: "",
      support_material: "",
      support_thickness: "",
      wl_code: "",
      fixation_class: "",
      fixation_method: "",
      created_by: ""
    });
    setSelectedFile(null);
    setCurrentStep(1);
  }, []);

  const handleClose = useCallback(() => {
    if (mode === 'add') {
      handleReset();
    }
    setCurrentStep(1);
    onClose();
  }, [mode, handleReset, onClose]);

  const handleNextStep = useCallback(() => {
    if (currentStep === 1 && formData.signal_type) {
      setCurrentStep(2);
    }
  }, [currentStep, formData.signal_type]);

  const handlePrevStep = useCallback(() => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  }, [currentStep]);

  const handleSignalTypeSelect = useCallback((type: 'permanent' | 'temporary') => {
    handleInputChange("signal_type", type);
    // Auto-advance to next step after selection
    setTimeout(() => {
      setCurrentStep(2);
    }, 300);
  }, [handleInputChange]);

  const isFormValid = useMemo(() =>
    formData.qr_code &&
    formData.signal_type &&
    formData.signal_category &&
    formData.production_year &&
    formData.shape &&
    formData.dimension &&
    formData.wl_code &&
    formData.support_material &&
    formData.support_thickness &&
    formData.fixation_class &&
    formData.fixation_method,
    [formData.qr_code, formData.signal_type, formData.signal_category, formData.production_year, formData.shape, formData.dimension, formData.wl_code, formData.support_material, formData.support_thickness, formData.fixation_class, formData.fixation_method]
  );

  const isStep1Valid = useMemo(() =>
    formData.signal_type !== "",
    [formData.signal_type]
  );

  const renderStepContent = () => {
    if (currentStep === 1) {
      return (
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="max-w-2xl w-full space-y-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Package className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Seleziona Tipologia Segnaletica</h2>
              <p className="text-muted-foreground">Scegli il tipo di segnaletica che vuoi creare</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                type="button"
                onClick={() => handleSignalTypeSelect("permanent")}
                className={`group relative p-8 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                  formData.signal_type === "permanent"
                    ? "border-[#2A9D8F] bg-[#2A9D8F]/5 shadow-lg"
                    : "border-border hover:border-[#2A9D8F]/50 hover:bg-muted/30"
                }`}
              >
                <div className="space-y-4">
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-colors ${
                    formData.signal_type === "permanent"
                      ? "bg-[#2A9D8F] text-white"
                      : "bg-muted group-hover:bg-[#2A9D8F]/10 text-muted-foreground group-hover:text-[#2A9D8F]"
                  }`}>
                    <Shield className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-foreground">Segnaletica Permanente</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Segnali fissi installati in modo permanente per la regolamentazione del traffico
                    </p>
                  </div>
                </div>
                {formData.signal_type === "permanent" && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-[#2A9D8F] rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleSignalTypeSelect("temporary")}
                className={`group relative p-8 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                  formData.signal_type === "temporary"
                    ? "border-[#2A9D8F] bg-[#2A9D8F]/5 shadow-lg"
                    : "border-border hover:border-[#2A9D8F]/50 hover:bg-muted/30"
                }`}
              >
                <div className="space-y-4">
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-colors ${
                    formData.signal_type === "temporary"
                      ? "bg-[#2A9D8F] text-white"
                      : "bg-muted group-hover:bg-[#2A9D8F]/10 text-muted-foreground group-hover:text-[#2A9D8F]"
                  }`}>
                    <Clock className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-foreground">Segnaletica Temporanea</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Segnali temporanei per cantieri, eventi o situazioni di emergenza
                    </p>
                  </div>
                </div>
                {formData.signal_type === "temporary" && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-[#2A9D8F] rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 overflow-y-auto px-6 py-2">
        <form id="product-form" onSubmit={handleSubmit} className="space-y-8">
          {/* Sezione 1: Identificazione */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-primary/20">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">1</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground">Identificazione Segnale</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="qr_code" className="text-sm font-medium">Codice QR *</Label>
                <Input
                  id="qr_code"
                  value={formData.qr_code}
                  onChange={(e) => handleInputChange("qr_code", e.target.value)}
                  placeholder="QR1703123456789"
                  className="h-11 font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  ℹ️ Codice univoco generato automaticamente (modificabile)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signal_category" className="text-sm font-medium">Categoria Segnale *</Label>
                <Input
                  id="signal_category"
                  value={formData.signal_category}
                  onChange={(e) => handleInputChange("signal_category", e.target.value)}
                  placeholder="Pericolo - Lavori in corso"
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  💡 Descrizione dettagliata della categoria di segnale
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="production_year" className="text-sm font-medium">Anno Produzione *</Label>
                <Input
                  id="production_year"
                  type="number"
                  min="1990"
                  max={new Date().getFullYear()}
                  value={formData.production_year}
                  onChange={(e) => handleInputChange("production_year", e.target.value)}
                  placeholder="2024"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shape" className="text-sm font-medium">Forma Geometrica *</Label>
                <Select
                  value={formData.shape}
                  onValueChange={(value) => handleInputChange("shape", value)}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Seleziona forma geometrica..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="triangolare">Triangolare</SelectItem>
                    <SelectItem value="circolare">Circolare</SelectItem>
                    <SelectItem value="rettangolare">Rettangolare</SelectItem>
                    <SelectItem value="quadrata">Quadrata</SelectItem>
                    <SelectItem value="ottagonale">Ottagonale</SelectItem>
                    <SelectItem value="romboidale">Romboidale</SelectItem>
                    <SelectItem value="freccia">Freccia</SelectItem>
                    <SelectItem value="personalizzata">Personalizzata</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="dimension" className="text-sm font-medium">Dimensioni *</Label>
                <Input
                  id="dimension"
                  value={formData.dimension}
                  onChange={(e) => handleInputChange("dimension", e.target.value)}
                  placeholder="60x60 cm"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="wl_code" className="text-sm font-medium">Codice WL *</Label>
                <Input
                  id="wl_code"
                  value={formData.wl_code}
                  onChange={(e) => handleInputChange("wl_code", e.target.value)}
                  placeholder="WL001"
                  className="h-11 font-mono"
                />
              </div>
            </div>

          </div>

          {/* Sezione 2: Specifiche Materiali */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-primary/20">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">2</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground">Specifiche Materiali</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4 p-4 rounded-xl border border-border bg-muted/30">
                <h4 className="font-medium text-foreground">Supporto</h4>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="support_material" className="text-sm">Materiale *</Label>
                    <Input
                      id="support_material"
                      value={formData.support_material}
                      onChange={(e) => handleInputChange("support_material", e.target.value)}
                      placeholder="Alluminio, Acciaio..."
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="support_thickness" className="text-sm">Spessore (mm) *</Label>
                    <Input
                      id="support_thickness"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.support_thickness}
                      onChange={(e) => handleInputChange("support_thickness", e.target.value)}
                      placeholder="2.0"
                      className="h-10"
                    />
                  </div>

                </div>
              </div>

              <div className="space-y-4 p-4 rounded-xl border border-border bg-muted/30">
                <h4 className="font-medium text-foreground">Pellicola & Montaggio</h4>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="fixation_class" className="text-sm">Classe Pellicola *</Label>
                    <Select
                      value={formData.fixation_class}
                      onValueChange={(value) => handleInputChange("fixation_class", value)}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Seleziona classe pellicola..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="classe-1">Classe 1</SelectItem>
                        <SelectItem value="classe-2">Classe 2</SelectItem>
                        <SelectItem value="classe-2s">Classe 2s</SelectItem>
                        <SelectItem value="classe-IIs">Classe IIs</SelectItem>
                        <SelectItem value="classe-3">Classe 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fixation_method" className="text-sm">Metodo Fissaggio *</Label>
                    <Select
                      value={formData.fixation_method}
                      onValueChange={(value) => handleInputChange("fixation_method", value)}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Seleziona metodo fissaggio..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tasselli">Tasselli</SelectItem>
                        <SelectItem value="Pali">Pali</SelectItem>
                        <SelectItem value="Viti">Viti</SelectItem>
                        <SelectItem value="Fascette">Fascette</SelectItem>
                        <SelectItem value="Staffe">Staffe</SelectItem>
                        <SelectItem value="Struttura a portale">Struttura a portale</SelectItem>
                        <SelectItem value="Base zavorrabile">Base zavorrabile</SelectItem>
                        <SelectItem value="Sistema modulare">Sistema modulare</SelectItem>
                        <SelectItem value="Altri">Altri</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sezione 3: Documentazione */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-primary/20">
              <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
                <span className="text-sm font-medium text-muted-foreground">3</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Documentazione</h3>
                <p className="text-sm text-muted-foreground">Opzionale - L'icona viene generata automaticamente</p>
              </div>
            </div>
            
            <div className="p-4 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/10">
              <div className="space-y-3">
                <Label htmlFor="image" className="text-sm font-medium">Figura Prodotto (Opzionale)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => document.getElementById("image")?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {selectedFile ? "Cambia Immagine" : "Carica Immagine"}
                  </Button>
                  {selectedFile && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      {selectedFile.name}
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  ℹ️ Le icone vengono generate automaticamente in base al tipo e forma del segnale
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[95vh] flex flex-col p-0 gap-0">
        <ModalHeader
          icon={Package}
          title={mode === 'edit' ? 'Modifica Prodotto' : 'Nuovo Prodotto'}
          description={mode === 'edit' 
            ? 'Aggiorna le informazioni del segnale selezionato' 
            : 'Crea un nuovo segnale nel database aziendale'}
        />

        {/* Step Content */}
        {renderStepContent()}

        {/* Footer with Timeline and Actions */}
        <div className="p-6 border-t-1">
          <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
            
            {/* Step Timeline */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                  currentStep >= 1 
                    ? "bg-[#2A9D8F] text-white" 
                    : "bg-muted text-muted-foreground"
                }`}>
                  1
                </div>
                <span className={`text-sm font-medium transition-colors ${
                  currentStep >= 1 ? "text-foreground" : "text-muted-foreground"
                }`}>
                  Tipologia
                </span>
              </div>
              
              <div className={`w-8 h-0.5 transition-colors ${
                currentStep >= 2 ? "bg-[#2A9D8F]" : "bg-muted"
              }`} />
              
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                  currentStep >= 2 
                    ? "bg-[#2A9D8F] text-white" 
                    : "bg-muted text-muted-foreground"
                }`}>
                  2
                </div>
                <span className={`text-sm font-medium transition-colors ${
                  currentStep >= 2 ? "text-foreground" : "text-muted-foreground"
                }`}>
                  Dettagli
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {currentStep === 2 && (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={handlePrevStep}
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Indietro
                </Button>
              )}
              
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Annulla
              </Button>
              
              {currentStep === 1 ? (
                <Button
                  type="button"
                  size="lg"
                  onClick={handleNextStep}
                  disabled={!isStep1Valid}
                  className="flex items-center gap-2 min-w-[140px]"
                >
                  Continua
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  form="product-form"
                  size="lg"
                  disabled={!isFormValid || isSubmitting}
                  className="flex items-center gap-2 min-w-[140px]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Package className="w-4 h-4" />
                      {mode === 'edit' ? "Aggiorna" : "Crea Prodotto"}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});