"use client";

import { useState, useEffect, memo, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ModalHeader } from "@/components/ModalHeader";
import { Users, Mail } from "lucide-react";
import { UserRole } from "@certplus/types";

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (employeeData: EmployeeFormData) => void;
  employeeToEdit?: Employee | null;
  mode?: 'add' | 'edit';
}

interface Employee {
  id?: string;
  email: string;
  name: string;
  role: UserRole;
  companyId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface EmployeeFormData {
  email: string;
  name: string;
  role: UserRole;
  password?: string;
}


export const EmployeeModal = memo(function EmployeeModal({ isOpen, onClose, onSubmit, employeeToEdit, mode = 'add' }: EmployeeModalProps) {
  const [formData, setFormData] = useState<EmployeeFormData>({
    email: "",
    name: "",
    role: "employee",
    password: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Effetto per popolare il form quando si modifica un dipendente esistente
  useEffect(() => {
    if (employeeToEdit && mode === 'edit') {
      setFormData({
        email: employeeToEdit.email || "",
        name: employeeToEdit.name || "",
        role: employeeToEdit.role || "employee",
        password: "" // Non mostriamo mai la password esistente
      });
    } else {
      handleReset();
    }
  }, [employeeToEdit, mode, isOpen]);

  const handleInputChange = useCallback((field: keyof EmployeeFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);


  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      const dataToSubmit = {
        ...formData,
        id: employeeToEdit?.id // Includi l'ID se stiamo modificando
      };
      onSubmit?.(dataToSubmit);
      if (mode === 'add') {
        handleReset();
      }
      onClose();
    } catch (error) {
      console.error("Errore durante il salvataggio:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, isSubmitting, onSubmit, employeeToEdit?.id, mode, onClose]);

  const handleReset = useCallback(() => {
    setFormData({
      email: "",
      name: "",
      role: "employee",
      password: ""
    });
  }, []);

  const handleClose = useCallback(() => {
    if (mode === 'add') {
      handleReset();
    }
    onClose();
  }, [mode, handleReset, onClose]);

  const isFormValid = useMemo(() => 
    formData.email && formData.name && formData.role && 
    (mode === 'edit' || formData.password), // Password obbligatoria solo per nuovi utenti
    [formData.email, formData.name, formData.role, formData.password, mode]
  );


  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl max-h-[95vh] flex flex-col p-0 gap-0">
        <ModalHeader
          icon={Users}
          title={mode === 'edit' ? 'Modifica Dipendente' : 'Nuovo Dipendente'}
          description={mode === 'edit' 
            ? 'Aggiorna le informazioni del dipendente selezionato' 
            : 'Aggiungi un nuovo membro al team aziendale'}
        />

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto px-6 py-2">
          <form id="employee-form" onSubmit={handleSubmit} className="space-y-8">
            
            {/* Sezione 1: Informazioni Personali */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b border-primary/20">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">1</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground">Informazioni Personali</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Mario Rossi"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="mario.rossi@azienda.com"
                      className="h-11 pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sezione 2: Ruolo e Permessi */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b border-primary/20">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">2</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground">Ruolo e Permessi</h3>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium">Ruolo *</Label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => handleInputChange("role", e.target.value as UserRole)}
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="employee">Dipendente</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
            </div>

            {/* Sezione 3: Credenziali di Accesso */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b border-primary/20">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">3</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {mode === 'edit' ? 'Sicurezza' : 'Credenziali di Accesso'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {mode === 'edit' ? 'Modifica password (opzionale)' : 'Imposta credenziali di login'}
                  </p>
                </div>
              </div>
              
              <div className="p-4 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/10">
                <div className="space-y-3">
                  <Label htmlFor="password" className="text-sm font-medium">
                    {mode === 'edit' ? 'Nuova Password (lascia vuoto per non modificare)' : 'Password *'}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      placeholder={mode === 'edit' ? "Nuova password..." : "Password sicura..."}
                      minLength={8}
                      className="h-11 pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {mode === 'add' 
                      ? "🔒 La password deve essere di almeno 8 caratteri" 
                      : "ℹ️ Lascia vuoto per mantenere la password attuale"}
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Modern Footer with Actions */}
        <div className="flex-shrink-0 p-6 pt-4 border-t">
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
                form="employee-form"
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
                    <Users className="w-4 h-4" />
                    {mode === 'edit' ? "Aggiorna" : "Crea Dipendente"}
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