/**
 * MaintenanceCard - Card componente per singole manutenzioni nel calendario
 * 
 * **Core Features:**
 * - Display compatto per vista calendario con informazioni essenziali
 * - Indicatori visivi per priorità, stato e tipo di intervento
 * - Supporto per modalità compatta (settimana) ed espansa (giorno)
 * - Click handlers per apertura dettagli e azioni rapide
 * 
 * **Visual Design:**
 * - Color coding per tipo di intervento e priorità
 * - Badge per stato e progresso
 * - Iconografia coerente con il sistema design
 * - Hover states e interazioni fluide
 * 
 * **Data Display:**
 * - Nome dipendente e prodotto target
 * - Orari di inizio/fine con durata
 * - Location con GPS indicator
 * - Note brevi quando disponibili
 * 
 * **Interactive Features:**
 * - Click per aprire dettagli completi
 * - Quick actions per cambio stato
 * - Drag & drop support (future)
 * - Context menu per azioni avanzate
 * 
 * **TODO:**
 * - Implementare drag & drop handlers
 * - Aggiungere preview tooltip on hover
 * - Context menu con azioni rapide
 * - Animazioni micro-interazioni
 */

"use client";

import { memo, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  MapPin, 
  User, 
  Package, 
  AlertTriangle,
  CheckCircle2,
  PlayCircle,
  XCircle
} from "lucide-react";

/**
 * Interfaccia per la manutenzione programmata (importata dal parent)
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
  startTime: string;
  endTime: string;
  duration: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
  gpsLat?: number;
  gpsLng?: number;
}

interface MaintenanceCardProps {
  maintenance: ScheduledMaintenance;
  onClick?: (maintenance: ScheduledMaintenance) => void;
  onStatusChange?: (maintenanceId: string, newStatus: ScheduledMaintenance['status']) => void;
  compact?: boolean;
  className?: string;
}

/**
 * Configurazione colori per tipi di intervento
 */
const maintenanceTypeConfig = {
  installazione: {
    color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    icon: Package,
    label: 'Installazione'
  },
  manutenzione: {
    color: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    icon: Package,
    label: 'Manutenzione'
  },
  verifica: {
    color: 'bg-green-500/10 text-green-600 border-green-500/20',
    icon: CheckCircle2,
    label: 'Verifica'
  },
  sostituzione: {
    color: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    icon: Package,
    label: 'Sostituzione'
  },
  dismissione: {
    color: 'bg-red-500/10 text-red-600 border-red-500/20',
    icon: XCircle,
    label: 'Dismissione'
  }
};

/**
 * Configurazione colori per priorità
 */
const priorityConfig = {
  low: { color: 'bg-gray-100 text-gray-600', label: 'Bassa' },
  medium: { color: 'bg-yellow-100 text-yellow-700', label: 'Media' },
  high: { color: 'bg-orange-100 text-orange-700', label: 'Alta' },
  urgent: { color: 'bg-red-100 text-red-700', label: 'Urgente' }
};

/**
 * Configurazione colori per stati
 */
const statusConfig = {
  scheduled: { 
    color: 'bg-blue-100 text-blue-700', 
    icon: Clock, 
    label: 'Programmato' 
  },
  in_progress: { 
    color: 'bg-orange-100 text-orange-700', 
    icon: PlayCircle, 
    label: 'In Corso' 
  },
  completed: { 
    color: 'bg-green-100 text-green-700', 
    icon: CheckCircle2, 
    label: 'Completato' 
  },
  cancelled: { 
    color: 'bg-red-100 text-red-700', 
    icon: XCircle, 
    label: 'Annullato' 
  }
};

export const MaintenanceCard = memo(function MaintenanceCard({
  maintenance,
  onClick,
  onStatusChange,
  compact = false,
  className = ""
}: MaintenanceCardProps) {
  
  // Handler per click sulla card
  const handleCardClick = useCallback(() => {
    onClick?.(maintenance);
  }, [maintenance, onClick]);

  // Handler per cambio stato rapido
  const handleStatusChange = useCallback((e: React.MouseEvent, newStatus: ScheduledMaintenance['status']) => {
    e.stopPropagation();
    onStatusChange?.(maintenance.id, newStatus);
  }, [maintenance.id, onStatusChange]);

  // Configurazioni per questo intervento
  const typeConfig = maintenanceTypeConfig[maintenance.maintenanceType];
  const priorityInfo = priorityConfig[maintenance.priority];
  const statusInfo = statusConfig[maintenance.status];

  // Calcola durata in formato leggibile
  const formatDuration = useCallback((minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h${mins > 0 ? ` ${mins}m` : ''}`;
    }
    return `${mins}m`;
  }, []);

  // Render versione compatta (vista settimanale)
  if (compact) {
    return (
      <div
        className={`
          relative p-3 border rounded-lg cursor-pointer transition-all duration-200 
          hover:shadow-md hover:border-primary/30 group
          ${typeConfig.color}
          ${className}
        `}
        onClick={handleCardClick}
      >
        {/* Header compatto */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <typeConfig.icon className="w-4 h-4" />
            <span className="text-xs font-medium truncate">
              {maintenance.productName}
            </span>
          </div>
          {maintenance.priority === 'urgent' && (
            <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0" />
          )}
        </div>

        {/* Tempo e dipendente */}
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs">
            <Clock className="w-3 h-3" />
            <span>{maintenance.startTime} - {maintenance.endTime}</span>
          </div>
          <div className="flex items-center gap-1 text-xs truncate">
            <User className="w-3 h-3" />
            <span>{maintenance.employeeName}</span>
          </div>
        </div>

        {/* Status badge */}
        <div className="mt-2">
          <Badge className={`text-xs ${statusInfo.color}`}>
            <statusInfo.icon className="w-3 h-3 mr-1" />
            {statusInfo.label}
          </Badge>
        </div>
      </div>
    );
  }

  // Render versione espansa (vista giornaliera)
  return (
    <div
      className={`
        relative p-4 border rounded-lg cursor-pointer transition-all duration-200 
        hover:shadow-lg hover:border-primary/30 bg-card group
        ${className}
      `}
      onClick={handleCardClick}
    >
      {/* Border colorato per tipo */}
      <div className={`absolute left-0 top-0 w-1 h-full rounded-l-lg ${typeConfig.color.split(' ')[0]}`} />

      {/* Header con titolo e priorità */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-foreground mb-1">{maintenance.title}</h4>
          <div className="flex items-center gap-2">
            <Badge className={`text-xs ${typeConfig.color}`}>
              <typeConfig.icon className="w-3 h-3 mr-1" />
              {typeConfig.label}
            </Badge>
            {maintenance.priority !== 'low' && (
              <Badge className={`text-xs ${priorityInfo.color}`}>
                {priorityInfo.label}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Status con quick actions */}
        <div className="flex flex-col items-end gap-2">
          <Badge className={`${statusInfo.color}`}>
            <statusInfo.icon className="w-3 h-3 mr-1" />
            {statusInfo.label}
          </Badge>
          
          {/* Quick status change buttons (visible on hover) */}
          {maintenance.status === 'scheduled' && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="outline"
                className="h-6 px-2 text-xs"
                onClick={(e) => handleStatusChange(e, 'in_progress')}
              >
                <PlayCircle className="w-3 h-3 mr-1" />
                Inizia
              </Button>
            </div>
          )}
          
          {maintenance.status === 'in_progress' && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="outline"
                className="h-6 px-2 text-xs"
                onClick={(e) => handleStatusChange(e, 'completed')}
              >
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Completa
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Dettagli intervento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        {/* Colonna sinistra */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>
              {maintenance.startTime} - {maintenance.endTime} 
              <span className="ml-1 text-xs">({formatDuration(maintenance.duration)})</span>
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="w-4 h-4" />
            <span>{maintenance.employeeName}</span>
          </div>
        </div>

        {/* Colonna destra */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Package className="w-4 h-4" />
            <span className="truncate">{maintenance.productName}</span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{maintenance.productLocation}</span>
            {maintenance.gpsLat && maintenance.gpsLng && (
              <Badge className="text-xs bg-primary/10 text-primary">GPS</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Note se presenti */}
      {maintenance.notes && (
        <div className="mt-3 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
          <span className="font-medium">Note: </span>
          {maintenance.notes}
        </div>
      )}

      {/* Indicatore di hover */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/20 rounded-lg transition-all duration-200 pointer-events-none" />
    </div>
  );
});