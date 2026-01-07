import React from "react";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { LucideIcon } from "lucide-react";

interface ModalHeaderProps {
  /** Icona da mostrare nell'header */
  icon: LucideIcon;
  /** Titolo principale del modal */
  title: string;
  /** Descrizione opzionale sotto il titolo */
  description?: string;
  /** Classe CSS personalizzata per il contenitore */
  className?: string;
  /** Se mostrare il gradiente di sfondo */
  showGradient?: boolean;
}

/**
 * Componente riutilizzabile per l'header dei modal con design moderno e gradiente
 */
export function ModalHeader({
  icon: Icon,
  title,
  description,
  className = "",
  showGradient = true
}: ModalHeaderProps) {
  return (
    <div className={`relative overflow-hidden flex-shrink-0 sticky top-0 z-10  border-b ${className}`}>
      {showGradient && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
      )}
      <DialogHeader className="relative flex-shrink-0 p-6">
        <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <div>
            {title}
            {description && (
              <DialogDescription className="text-base text-muted-foreground mt-1">
                {description}
              </DialogDescription>
            )}
          </div>
        </DialogTitle>
      </DialogHeader>
    </div>
  );
}

export default ModalHeader;