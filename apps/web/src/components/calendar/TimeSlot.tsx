/**
 * TimeSlot - Slot temporale per la vista calendario giornaliera
 * 
 * **Core Features:**
 * - Rappresentazione visiva di slot temporali orari nel calendario
 * - Supporto per multiple manutenzioni in contemporanea nello stesso slot
 * - Click handler per creazione rapida nuovi appuntamenti
 * - Visual indicators per slot occupati/liberi e conflitti
 * 
 * **Visual Design:**
 * - Layout orizzontale con ora a sinistra e contenuto a destra
 * - Grid system per gestire sovrapposizioni temporali
 * - Hover states per indicare possibilità di interazione
 * - Color coding per diversi stati (libero, occupato, conflitto)
 * 
 * **Interaction Features:**
 * - Click su slot vuoto per aggiungere nuova manutenzione
 * - Hover per preview e quick actions
 * - Drag & drop support per riorganizzazione (future)
 * - Context menu per azioni avanzate
 * 
 * **Time Management:**
 * - Gestione automatica sovrapposizioni temporali
 * - Calcolo durate e disponibilità
 * - Validazione conflitti di scheduling
 * - Support per fasce orarie personalizzate
 * 
 * **TODO:**
 * - Implementare gestione conflitti avanzata
 * - Drag & drop per moving appointments
 * - Tooltip informativi on hover
 * - Resize handles per modifica durata
 */

"use client";

import { memo, useCallback, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, AlertTriangle } from "lucide-react";
import { MaintenanceCard } from "./MaintenanceCard";

/**
 * Interfaccia per la manutenzione programmata
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

interface TimeSlotProps {
  time: string; // Format: "HH:mm"
  date: Date;
  maintenances: ScheduledMaintenance[];
  onSlotClick?: (date: Date, time: string) => void;
  onMaintenanceClick?: (maintenance: ScheduledMaintenance) => void;
  className?: string;
}

export const TimeSlot = memo(function TimeSlot({
  time,
  date,
  maintenances,
  onSlotClick,
  onMaintenanceClick,
  className = ""
}: TimeSlotProps) {
  
  // Controlla se il time slot ha manutenzioni
  const hasMaintenances = maintenances.length > 0;
  
  // Controlla conflitti temporali (sovrapposizioni)
  const hasConflicts = useMemo(() => {
    if (maintenances.length <= 1) return false;
    
    // Ordina per orario di inizio e controlla sovrapposizioni
    const sorted = [...maintenances].sort((a, b) => 
      a.startTime.localeCompare(b.startTime)
    );
    
    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];
      
      // Converte orari in minuti per confronto
      const currentEnd = timeToMinutes(current.endTime);
      const nextStart = timeToMinutes(next.startTime);
      
      if (currentEnd > nextStart) {
        return true; // Sovrapposizione trovata
      }
    }
    
    return false;
  }, [maintenances]);

  // Utility per convertire "HH:mm" in minuti
  const timeToMinutes = useCallback((timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }, []);

  // Handler per click su slot vuoto
  const handleSlotClick = useCallback(() => {
    if (!hasMaintenances) {
      onSlotClick?.(date, time);
    }
  }, [hasMaintenances, onSlotClick, date, time]);

  // Calcola il carico di lavoro per questo slot (percentuale)
  const workloadPercentage = useMemo(() => {
    if (!hasMaintenances) return 0;
    
    const slotStart = timeToMinutes(time);
    const slotEnd = slotStart + 60; // 1 ora
    
    let totalOverlap = 0;
    
    maintenances.forEach(maintenance => {
      const maintenanceStart = timeToMinutes(maintenance.startTime);
      const maintenanceEnd = timeToMinutes(maintenance.endTime);
      
      // Calcola sovrapposizione con questo slot
      const overlapStart = Math.max(slotStart, maintenanceStart);
      const overlapEnd = Math.min(slotEnd, maintenanceEnd);
      
      if (overlapStart < overlapEnd) {
        totalOverlap += overlapEnd - overlapStart;
      }
    });
    
    return Math.min(100, (totalOverlap / 60) * 100);
  }, [time, maintenances, hasMaintenances, timeToMinutes]);

  // Raggruppa manutenzioni per dipendente
  const maintenancesByEmployee = useMemo(() => {
    const grouped = maintenances.reduce((acc, maintenance) => {
      const employeeId = maintenance.employeeId;
      if (!acc[employeeId]) {
        acc[employeeId] = [];
      }
      acc[employeeId].push(maintenance);
      return acc;
    }, {} as Record<string, ScheduledMaintenance[]>);
    
    return Object.values(grouped);
  }, [maintenances]);

  return (
    <div className={`
      flex min-h-16 border-b border-border/50 hover:bg-muted/30 transition-all duration-200
      ${hasConflicts ? 'bg-red-50 border-red-200' : ''}
      ${className}
    `}>
      {/* Colonna orario */}
      <div className="w-20 flex-shrink-0 p-3 border-r border-border/50">
        <div className="flex flex-col items-center">
          <span className="text-sm font-mono text-muted-foreground">{time}</span>
          
          {/* Indicatore carico di lavoro */}
          {hasMaintenances && (
            <div className="mt-1 w-12 h-1 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  workloadPercentage > 80 ? 'bg-red-500' :
                  workloadPercentage > 60 ? 'bg-orange-500' : 
                  'bg-green-500'
                }`}
                style={{ width: `${workloadPercentage}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Contenuto slot */}
      <div className="flex-1 p-3">
        {hasMaintenances ? (
          <div className="space-y-2">
            {/* Header con statistiche slot se ci sono conflitti */}
            {hasConflicts && (
              <div className="flex items-center gap-2 mb-3 p-2 bg-red-100 border border-red-200 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-700">
                  Conflitto temporale rilevato
                </span>
                <Badge className="text-xs bg-red-200 text-red-700">
                  {maintenances.length} interventi
                </Badge>
              </div>
            )}

            {/* Raggruppa manutenzioni per dipendente per visualizzazione migliore */}
            {maintenancesByEmployee.map((employeeMaintenances, groupIndex) => (
              <div key={groupIndex} className="space-y-1">
                {employeeMaintenances.map(maintenance => (
                  <MaintenanceCard
                    key={maintenance.id}
                    maintenance={maintenance}
                    onClick={onMaintenanceClick}
                    compact
                    className="shadow-sm"
                  />
                ))}
              </div>
            ))}

            {/* Statistica rapida per slot con multiple manutenzioni */}
            {maintenances.length > 1 && (
              <div className="flex items-center gap-3 pt-2 border-t border-border/30">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{maintenances.length} interventi</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>Carico: {Math.round(workloadPercentage)}%</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Slot vuoto - Mostra pulsante per aggiungere */
          <div 
            className="
              h-12 flex items-center justify-center border-2 border-dashed border-muted-foreground/20 
              rounded-lg cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all duration-200
              group
            "
            onClick={handleSlotClick}
          >
            <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary">
              <Plus className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Aggiungi intervento</span>
              <span className="text-sm sm:hidden">{time}</span>
            </div>
          </div>
        )}
      </div>

      {/* Indicatore laterale per stato slot */}
      <div className="w-1 flex-shrink-0">
        <div className={`
          w-full h-full
          ${hasConflicts ? 'bg-red-500' : 
            hasMaintenances ? 'bg-orange-500' : 
            'bg-muted'}
        `} />
      </div>
    </div>
  );
});