/**
 * MaintenanceDetailModal - Modal per visualizzare dettagli completi manutenzione programmata
 * 
 * **Core Features:**
 * - Visualizzazione read-only di tutti i dettagli manutenzione
 * - Design responsive con layout card-based per informazioni
 * - Status indicators con color coding per priorità e stato
 * - Informazioni geografiche con coordinate GPS
 * - Integrazione con sistema di icone per tipologie intervento
 * 
 * **Layout Sections:**
 * - Header: Titolo manutenzione + status badge + priorità
 * - Timing: Data programmata, orari inizio/fine, durata
 * - Location: Prodotto, indirizzo, coordinate GPS
 * - Employee: Dipendente assegnato con avatar placeholder
 * - Notes: Note aggiuntive se presenti
 * 
 * **Integration:**
 * - Usato in MaintenanceCalendar per click su manutenzioni
 * - Mostra dati ScheduledMaintenance in formato user-friendly
 * - Color coding consistente con sistema calendario
 * 
 * **TODO:**
 * - Aggiungere link per modifica manutenzione
 * - Integrare mappa per visualizzare posizione GPS
 * - Aggiungere foto/allegati se disponibili
 */

"use client";

import { memo } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ModalHeader } from "@/components/ModalHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar,
  Clock,
  MapPin,
  User,
  Package,
  Wrench,
  AlertTriangle,
  CheckCircle,
  XCircle,
  PlayCircle
} from "lucide-react";

/**
 * Interfaccia per i dati della manutenzione programmata
 */
interface ScheduledMaintenance {
  id: string;
  title: string;
  employeeId: string;
  employeeName: string;
  productId: string;
  productName: string;
  productLocation: string;
  maintenanceType: 'installazione' | 'manutenzione' | 'verifica' | 'sostituzione' | 'dismissione';
  scheduledDate: Date;
  startTime: string; // "HH:mm" format
  endTime: string;   // "HH:mm" format
  duration: number;  // minutes
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
  gpsLat?: number;
  gpsLng?: number;
}

interface MaintenanceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  maintenance: ScheduledMaintenance | null;
}

/**
 * Ottieni icona per tipo manutenzione
 */
const getMaintenanceTypeIcon = (type: ScheduledMaintenance['maintenanceType']) => {
  switch (type) {
    case 'installazione': return Package;
    case 'manutenzione': return Wrench;
    case 'verifica': return CheckCircle;
    case 'sostituzione': return Package;
    case 'dismissione': return XCircle;
    default: return Wrench;
  }
};

/**
 * Ottieni colore per tipo manutenzione
 */
const getMaintenanceTypeColor = (type: ScheduledMaintenance['maintenanceType']) => {
  switch (type) {
    case 'installazione': return 'text-blue-600 bg-blue-50';
    case 'manutenzione': return 'text-green-600 bg-green-50';
    case 'verifica': return 'text-yellow-600 bg-yellow-50';
    case 'sostituzione': return 'text-orange-600 bg-orange-50';
    case 'dismissione': return 'text-red-600 bg-red-50';
    default: return 'text-gray-600 bg-gray-50';
  }
};

/**
 * Ottieni badge per status
 */
const getStatusBadge = (status: ScheduledMaintenance['status']) => {
  switch (status) {
    case 'scheduled':
      return { icon: Calendar, label: 'Programmato', variant: 'secondary' as const };
    case 'in_progress':
      return { icon: PlayCircle, label: 'In Corso', variant: 'default' as const };
    case 'completed':
      return { icon: CheckCircle, label: 'Completato', variant: 'default' as const };
    case 'cancelled':
      return { icon: XCircle, label: 'Annullato', variant: 'destructive' as const };
    default:
      return { icon: Calendar, label: 'Sconosciuto', variant: 'secondary' as const };
  }
};

/**
 * Ottieni badge per priorità
 */
const getPriorityBadge = (priority: ScheduledMaintenance['priority']) => {
  switch (priority) {
    case 'low':
      return { label: 'Bassa', className: 'bg-gray-100 text-gray-700' };
    case 'medium':
      return { label: 'Media', className: 'bg-yellow-100 text-yellow-700' };
    case 'high':
      return { label: 'Alta', className: 'bg-orange-100 text-orange-700' };
    case 'urgent':
      return { label: 'Urgente', className: 'bg-red-100 text-red-700' };
    default:
      return { label: 'Non specificata', className: 'bg-gray-100 text-gray-700' };
  }
};

export const MaintenanceDetailModal = memo(function MaintenanceDetailModal({
  isOpen,
  onClose,
  maintenance
}: MaintenanceDetailModalProps) {
  if (!maintenance) return null;

  const MaintenanceIcon = getMaintenanceTypeIcon(maintenance.maintenanceType);
  const typeColor = getMaintenanceTypeColor(maintenance.maintenanceType);
  const statusBadge = getStatusBadge(maintenance.status);
  const priorityBadge = getPriorityBadge(maintenance.priority);
  const StatusIcon = statusBadge.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[95vh] flex flex-col p-0 gap-0">
        <ModalHeader
          icon={MaintenanceIcon}
          title={maintenance.title}
          className={typeColor}
        />
        
        {/* Status and Priority Badges */}
        <div className="px-6 pb-4 -mt-2">
          <div className="flex items-center gap-2">
            <Badge variant={statusBadge.variant} className="flex items-center gap-1">
              <StatusIcon className="w-3 h-3" />
              {statusBadge.label}
            </Badge>
            <Badge className={priorityBadge.className}>
              <AlertTriangle className="w-3 h-3 mr-1" />
              Priorità {priorityBadge.label}
            </Badge>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-2">
          <div className="space-y-6">
            {/* Sezione 1: Programmazione Temporale */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b border-primary/20">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">1</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Programmazione Temporale</h3>
                  <p className="text-sm text-muted-foreground">Orari e durata dell'intervento</p>
                </div>
              </div>
              
              <div className="p-4 rounded-xl border border-border bg-muted/30">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <Label className="text-sm font-medium text-muted-foreground">Data Programmata</Label>
                    </div>
                    <p className="text-base font-medium pl-6">
                      {maintenance.scheduledDate.toLocaleDateString('it-IT', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <Label className="text-sm font-medium text-muted-foreground">Orario</Label>
                    </div>
                    <p className="text-base font-medium pl-6">
                      {maintenance.startTime} - {maintenance.endTime}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <Label className="text-sm font-medium text-muted-foreground">Durata Stimata</Label>
                    </div>
                    <p className="text-base font-medium pl-6">
                      {Math.floor(maintenance.duration / 60)}h {maintenance.duration % 60}m
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sezione 2: Prodotto e Ubicazione */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b border-primary/20">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">2</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Prodotto e Ubicazione</h3>
                  <p className="text-sm text-muted-foreground">Dettagli del prodotto e posizione geografica</p>
                </div>
              </div>
              
              <div className="p-4 rounded-xl border border-border bg-muted/30">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                    <Package className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <Label className="text-sm font-medium text-muted-foreground">Prodotto</Label>
                      <p className="text-base font-medium">{maintenance.productName}</p>
                      <p className="text-sm text-muted-foreground">ID: {maintenance.productId}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                    <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <Label className="text-sm font-medium text-muted-foreground">Indirizzo</Label>
                      <p className="text-base">{maintenance.productLocation}</p>
                      {(maintenance.gpsLat && maintenance.gpsLng) && (
                        <p className="text-sm font-mono text-muted-foreground mt-1">
                          GPS: {maintenance.gpsLat.toFixed(6)}, {maintenance.gpsLng.toFixed(6)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sezione 3: Dipendente e Tipo Intervento */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b border-primary/20">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">3</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Assegnazione e Tipo Intervento</h3>
                  <p className="text-sm text-muted-foreground">Dipendente responsabile e tipologia di manutenzione</p>
                </div>
              </div>
              
              <div className="p-4 rounded-xl border border-border bg-muted/30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                    <User className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <Label className="text-sm font-medium text-muted-foreground">Dipendente Assegnato</Label>
                      <p className="text-base font-medium">{maintenance.employeeName}</p>
                      <p className="text-sm text-muted-foreground">ID: {maintenance.employeeId}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                    <MaintenanceIcon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <Label className="text-sm font-medium text-muted-foreground">Tipo Intervento</Label>
                      <p className="text-base font-medium capitalize">{maintenance.maintenanceType}</p>
                      <p className="text-sm text-muted-foreground">
                        {maintenance.maintenanceType === 'installazione' && 'Prima installazione del prodotto'}
                        {maintenance.maintenanceType === 'manutenzione' && 'Controllo e manutenzione ordinaria'}
                        {maintenance.maintenanceType === 'verifica' && 'Controllo visivo e verifica stato'}
                        {maintenance.maintenanceType === 'sostituzione' && 'Sostituzione componenti'}
                        {maintenance.maintenanceType === 'dismissione' && 'Rimozione definitiva prodotto'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sezione 4: Note Aggiuntive (solo se presenti) */}
            {maintenance.notes && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-2 border-b border-primary/20">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">4</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Note Aggiuntive</h3>
                    <p className="text-sm text-muted-foreground">Informazioni e istruzioni specifiche</p>
                  </div>
                </div>
                
                <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
                  <p className="text-base leading-relaxed">{maintenance.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer con azioni */}
        <div className="flex-shrink-0 p-6 pt-4 border-t border-border bg-muted/20">
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Chiudi
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

// Helper Label component se non importato
const Label = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={className}>{children}</div>
);