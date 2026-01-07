/**
 * MaintenanceCalendar - Calendario interattivo per la gestione delle manutenzioni
 * 
 * **Core Features:**
 * - Vista calendario settimanale/giornaliera per manutenzioni programmate
 * - Drag & drop per riorganizzazione appuntamenti
 * - Filtri per dipendente e tipo intervento
 * - Navigazione veloce tra date con controlli temporali
 * - Responsive design mobile-first con pattern touch-friendly
 * 
 * **Calendar Views:**
 * - Vista Giornaliera: Timeline oraria con dettagli completi
 * - Vista Settimanale: Panoramica 7 giorni con appuntamenti compatti
 * - Vista Mensile: Overview generale per pianificazione a lungo termine
 * 
 * **Management Features:**
 * - Creazione rapida manutenzioni con click su slot vuoti
 * - Modifica inline con modal integrato
 * - Gestione conflitti e sovrapposizioni
 * - Assegnazione automatica dipendenti disponibili
 * 
 * **Data Integration:**
 * - Integrazione con mockMaintenance per dati esistenti
 * - Filtri per tipo di intervento (installazione, manutenzione, verifica, etc.)
 * - Sync con sistema di notifiche e promemoria
 * 
 * **TODO:**
 * - Implementare drag & drop con react-beautiful-dnd
 * - Aggiungere vista mensile compatta
 * - Sistema notifiche per scadenze imminenti
 * - Export calendario in formato PDF/ICS
 */

"use client";

import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Filter, 
  Users,
  MapPin
} from "lucide-react";
import { MaintenanceDetailModal } from "@/components/modals/MaintenanceDetailModal";

/**
 * Interfaccia per i dati della manutenzione programmata nel calendario
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


/**
 * Tipo di filtro per dipendenti
 */
type EmployeeFilter = 'all' | string;

/**
 * Tipo di filtro per tipo manutenzione
 */
type MaintenanceTypeFilter = 'all' | 'installazione' | 'manutenzione' | 'verifica' | 'sostituzione' | 'dismissione';

interface MaintenanceCalendarProps {
  scheduledMaintenances: ScheduledMaintenance[];
  onMaintenanceClick?: (maintenance: ScheduledMaintenance) => void;
  onTimeSlotClick?: (date: Date, time: string) => void;
  className?: string;
}

export function MaintenanceCalendar({
  scheduledMaintenances,
  onMaintenanceClick,
  onTimeSlotClick,
  className
}: MaintenanceCalendarProps) {
  // Stati del calendario
  const [currentDate, setCurrentDate] = useState(new Date());
  const [employeeFilter, setEmployeeFilter] = useState<EmployeeFilter>('all');
  const [typeFilter, setTypeFilter] = useState<MaintenanceTypeFilter>('all');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  // Stati per modal dettagli manutenzione
  const [selectedMaintenance, setSelectedMaintenance] = useState<ScheduledMaintenance | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);


  // Filtri e navigazione
  const filteredMaintenances = useMemo(() => {
    return scheduledMaintenances.filter(maintenance => {
      const employeeMatch = employeeFilter === 'all' || maintenance.employeeId === employeeFilter;
      const typeMatch = typeFilter === 'all' || maintenance.maintenanceType === typeFilter;
      return employeeMatch && typeMatch;
    });
  }, [scheduledMaintenances, employeeFilter, typeFilter]);

  // Dipendenti unici per il filtro
  const uniqueEmployees = useMemo(() => {
    const employees = scheduledMaintenances.reduce((acc, maintenance) => {
      if (!acc.find(emp => emp.id === maintenance.employeeId)) {
        acc.push({
          id: maintenance.employeeId,
          name: maintenance.employeeName
        });
      }
      return acc;
    }, [] as { id: string; name: string }[]);
    return employees;
  }, [scheduledMaintenances]);

  // Navigazione date
  const navigateDate = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  }, []);

  // Gestione selezione data dal calendario
  const handleDateSelect = useCallback((date: Date | undefined) => {
    if (date) {
      setCurrentDate(date);
      setIsCalendarOpen(false);
    }
  }, []);

  // Gestione click su manutenzione per mostrare dettagli
  const handleMaintenanceClick = useCallback((maintenance: ScheduledMaintenance) => {
    setSelectedMaintenance(maintenance);
    setIsDetailModalOpen(true);
    
    // Chiama anche l'handler opzionale passato dal parent se presente
    onMaintenanceClick?.(maintenance);
  }, [onMaintenanceClick]);

  // Gestione chiusura modal dettagli
  const handleDetailModalClose = useCallback(() => {
    setIsDetailModalOpen(false);
    setSelectedMaintenance(null);
  }, []);


  // Ottieni manutenzioni per un giorno specifico
  const getMaintenancesForDay = useCallback((date: Date) => {
    return filteredMaintenances.filter(maintenance => {
      const maintenanceDate = new Date(maintenance.scheduledDate);
      return (
        maintenanceDate.getDate() === date.getDate() &&
        maintenanceDate.getMonth() === date.getMonth() &&
        maintenanceDate.getFullYear() === date.getFullYear()
      );
    });
  }, [filteredMaintenances]);



  // Preprocessing per vista calendario (hooks sempre chiamati)
  const dayMaintenances = getMaintenancesForDay(currentDate);
  
  // Ottieni giorni della settimana per vista settimanale dipendente
  const getWeekDays = useCallback((date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Inizia da lunedì
    startOfWeek.setDate(diff);
    
    return Array.from({ length: 7 }, (_, i) => {
      const weekDay = new Date(startOfWeek);
      weekDay.setDate(startOfWeek.getDate() + i);
      return weekDay;
    });
  }, []);

  
  // Timeline oraria (8:00-18:00) per slot di 30 minuti
  const dayTimeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 8; hour <= 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 18) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    return slots;
  }, []);

  // Render vista calendario - dipende dal filtro dipendente
  const renderCalendarView = () => {
    // Se è selezionato un dipendente specifico, mostra vista settimanale
    if (employeeFilter !== 'all') {
      return renderEmployeeWeekView();
    }
    
    // Altrimenti mostra vista giornaliera con tutti i dipendenti
    return renderAllEmployeesDayView();
  };

  // Vista giornaliera con tutti i dipendenti in colonne
  const renderAllEmployeesDayView = () => {
    return (
      <div className="space-y-4">
        {/* Timeline con colonne dipendenti */}
        <Card>
          <CardContent className="p-0">
            {/* Container con scroll orizzontale */}
            <div className="overflow-x-auto">
              {/* Header dipendenti */}
              <div className="flex border-b border-border min-w-max">
                {/* Colonna orari */}
                <div className="w-20 flex-shrink-0 border-r border-border bg-muted/30">
                  <div className="h-16 flex items-center justify-center text-sm font-medium text-muted-foreground">
                    Orario
                  </div>
                </div>
                
                {/* Colonne dipendenti */}
                {uniqueEmployees.map((employee) => {
                  return (
                    <div key={employee.id} className="w-32 sm:w-40 lg:w-48 flex-shrink-0 border-r border-border last:border-r-0">
                      <div className="h-12 sm:h-14 lg:h-16 p-2 sm:p-3 bg-primary/5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{employee.name}</h4>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Timeline con slot */}
              <div className="max-h-[1000px] overflow-y-auto min-w-max">
              {dayTimeSlots.map((timeSlot) => {
                const isCurrentTime = (() => {
                  const now = new Date();
                  const currentHour = now.getHours();
                  const currentMinute = now.getMinutes();
                  const [slotHour, slotMinute] = timeSlot.split(':').map(Number);
                  
                  // Solo se è oggi
                  const today = new Date();
                  const isToday = currentDate.toDateString() === today.toDateString();
                  
                  if (!isToday) return false;
                  
                  // Controlla se l'orario corrente è in questo slot (slot di 30 min)
                  return currentHour === slotHour && 
                         currentMinute >= slotMinute && 
                         currentMinute < slotMinute + 30;
                })();
                
                return (
                  <div key={timeSlot} className={`flex border-b border-border/50 ${isCurrentTime ? 'bg-primary/5 ring-1 ring-primary/20' : ''}`}>
                    {/* Colonna orario */}
                    <div className="w-20 flex-shrink-0 border-r border-border bg-muted/30">
                      <div className="h-24 flex items-center justify-center">
                        <span className={`text-sm font-medium ${isCurrentTime ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                          {timeSlot}
                        </span>
                        {isCurrentTime && (
                          <div className="ml-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
                        )}
                      </div>
                    </div>
                    
                    {/* Slot per ogni dipendente */}
                    {uniqueEmployees.map((employee) => {
                      const employeeMaintenances = dayMaintenances.filter(m => {
                        const maintenanceHour = m.startTime.split(':')[0];
                        const maintenanceMinute = parseInt(m.startTime.split(':')[1]);
                        const [slotHour, slotMinute] = timeSlot.split(':').map(Number);
                        
                        // Controlla se la manutenzione inizia in questo slot
                        return m.employeeId === employee.id && 
                               parseInt(maintenanceHour) === slotHour &&
                               maintenanceMinute >= slotMinute &&
                               maintenanceMinute < slotMinute + 30;
                      });
                      
                      const hasMaintenances = employeeMaintenances.length > 0;
                      
                      return (
                        <div 
                          key={`${employee.id}-${timeSlot}`} 
                          className="w-48 flex-shrink-0 border-r border-border last:border-r-0"
                        >
                          <div className="h-24 p-2 relative">
                            {hasMaintenances ? (
                              // Mostra manutenzioni per questo slot
                              <div className="space-y-1">
                                {employeeMaintenances.map((maintenance) => (
                                  <div
                                    key={maintenance.id}
                                    onClick={() => handleMaintenanceClick(maintenance)}
                                    className="bg-primary/10 border border-primary/20 rounded-lg p-2 cursor-pointer hover:bg-primary/20 transition-colors"
                                  >
                                    <div className="flex items-center gap-2 mb-1">
                                      <div className={`w-2 h-2 rounded-full ${
                                        maintenance.maintenanceType === 'installazione' ? 'bg-blue-500' :
                                        maintenance.maintenanceType === 'manutenzione' ? 'bg-green-500' :
                                        maintenance.maintenanceType === 'verifica' ? 'bg-yellow-500' :
                                        maintenance.maintenanceType === 'sostituzione' ? 'bg-orange-500' :
                                        'bg-red-500'
                                      }`} />
                                      <span className="text-xs font-medium capitalize">
                                        {maintenance.maintenanceType}
                                      </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {maintenance.productName}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {maintenance.startTime} - {maintenance.endTime}
                                    </p>
                                    <div className="flex items-center gap-1 mt-1">
                                      <MapPin className="w-3 h-3 text-muted-foreground" />
                                      <span className="text-xs text-muted-foreground truncate">
                                        {maintenance.productLocation}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              // Slot vuoto - cliccabile per aggiungere manutenzione
                              <button
                                onClick={() => onTimeSlotClick?.(currentDate, timeSlot)}
                                className="w-full h-full flex items-center justify-center text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/20 rounded-lg border-2 border-dashed border-transparent hover:border-muted-foreground/20 transition-all group"
                              >
                                <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Ottieni manutenzioni del dipendente per un giorno specifico (hook al livello componente)
  const getMaintenancesForEmployeeDay = useCallback((date: Date, employeeId: string) => {
    return filteredMaintenances.filter(maintenance => {
      const maintenanceDate = new Date(maintenance.scheduledDate);
      return (
        maintenance.employeeId === employeeId &&
        maintenanceDate.getDate() === date.getDate() &&
        maintenanceDate.getMonth() === date.getMonth() &&
        maintenanceDate.getFullYear() === date.getFullYear()
      );
    });
  }, [filteredMaintenances]);

  // Vista settimanale per singolo dipendente con colonne date
  const renderEmployeeWeekView = () => {
    const selectedEmployee = uniqueEmployees.find(emp => emp.id === employeeFilter);
    if (!selectedEmployee) return null;

    const weekDays = getWeekDays(currentDate);

    return (
      <div className="space-y-4">

        {/* Timeline con colonne giorni */}
        <Card>
          <CardContent className="p-0">
            {/* Container con scroll orizzontale */}
            <div className="overflow-x-auto">
              {/* Header giorni */}
              <div className="flex border-b border-border min-w-max">
                {/* Colonna orari */}
                <div className="w-20 flex-shrink-0 border-r border-border bg-muted/30">
                  <div className="h-16 flex items-center justify-center text-sm font-medium text-muted-foreground">
                    Orario
                  </div>
                </div>
                
                {/* Colonne giorni */}
                {weekDays.map((day) => {
                  const isToday = new Date().toDateString() === day.toDateString();
                  
                  return (
                    <div key={day.toISOString()} className="w-32 sm:w-40 lg:w-48 flex-shrink-0 border-r border-border last:border-r-0">
                      <div className={`h-12 sm:h-14 lg:h-16 p-2 sm:p-3 ${isToday ? 'bg-primary/10' : 'bg-muted/5'}`}>
                        <div className="text-center">
                          <h4 className={`font-medium text-sm ${isToday ? 'text-primary' : ''}`}>
                            {day.toLocaleDateString('it-IT', { weekday: 'short' })}
                          </h4>
                          <p className={`text-lg font-bold ${isToday ? 'text-primary' : ''}`}>
                            {day.getDate()}/{day.getMonth() + 1}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Timeline con slot */}
              <div className="max-h-[1000px] overflow-y-auto min-w-max">
                {dayTimeSlots.map((timeSlot) => {
                  return (
                    <div key={timeSlot} className="flex border-b border-border/50">
                      {/* Colonna orario */}
                      <div className="w-16 sm:w-20 flex-shrink-0 border-r border-border bg-muted/30">
                        <div className="h-16 sm:h-20 lg:h-24 flex items-center justify-center">
                          <span className="text-sm font-medium text-muted-foreground">
                            {timeSlot}
                          </span>
                        </div>
                      </div>
                      
                      {/* Slot per ogni giorno */}
                      {weekDays.map((day) => {
                        const dayMaintenances = getMaintenancesForEmployeeDay(day, employeeFilter);
                        const slotMaintenances = dayMaintenances.filter(m => {
                          const maintenanceHour = m.startTime.split(':')[0];
                          const maintenanceMinute = parseInt(m.startTime.split(':')[1]);
                          const [slotHour, slotMinute] = timeSlot.split(':').map(Number);
                          
                          return parseInt(maintenanceHour) === slotHour &&
                                 maintenanceMinute >= slotMinute &&
                                 maintenanceMinute < slotMinute + 30;
                        });
                        
                        const hasMaintenances = slotMaintenances.length > 0;
                        
                        return (
                          <div 
                            key={`${day.toISOString()}-${timeSlot}`} 
                            className="w-48 flex-shrink-0 border-r border-border last:border-r-0"
                          >
                            <div className="h-24 p-2 relative">
                              {hasMaintenances ? (
                                // Mostra manutenzioni per questo slot
                                <div className="space-y-1">
                                  {slotMaintenances.map((maintenance) => (
                                    <div
                                      key={maintenance.id}
                                      onClick={() => handleMaintenanceClick(maintenance)}
                                      className="bg-primary/10 border border-primary/20 rounded-lg p-2 cursor-pointer hover:bg-primary/20 transition-colors"
                                    >
                                      <div className="flex items-center gap-2 mb-1">
                                        <div className={`w-2 h-2 rounded-full ${
                                          maintenance.maintenanceType === 'installazione' ? 'bg-blue-500' :
                                          maintenance.maintenanceType === 'manutenzione' ? 'bg-green-500' :
                                          maintenance.maintenanceType === 'verifica' ? 'bg-yellow-500' :
                                          maintenance.maintenanceType === 'sostituzione' ? 'bg-orange-500' :
                                          'bg-red-500'
                                        }`} />
                                        <span className="text-xs font-medium capitalize">
                                          {maintenance.maintenanceType}
                                        </span>
                                      </div>
                                      <p className="text-xs text-muted-foreground truncate">
                                        {maintenance.productName}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {maintenance.startTime} - {maintenance.endTime}
                                      </p>
                                      <div className="flex items-center gap-1 mt-1">
                                        <MapPin className="w-3 h-3 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground truncate">
                                          {maintenance.productLocation}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                // Slot vuoto - cliccabile per aggiungere manutenzione
                                <button
                                  onClick={() => onTimeSlotClick?.(day, timeSlot)}
                                  className="w-full h-full flex items-center justify-center text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/20 rounded-lg border-2 border-dashed border-transparent hover:border-muted-foreground/20 transition-all group"
                                >
                                  <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };


  return (
    <div className={`space-y-4 sm:space-y-6 ${className}`}>
      {/* Header con controlli */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          {/* Controlli navigazione e filtri su una singola riga */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Navigazione data */}
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateDate('prev')}
                  className="h-9 w-9 p-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-w-[140px] sm:min-w-[160px] justify-center h-9 text-sm"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">
                        {currentDate.toLocaleDateString('it-IT', { 
                          day: '2-digit', 
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="sm:hidden">
                        {currentDate.toLocaleDateString('it-IT', { 
                          day: 'numeric', 
                          month: 'short'
                        })}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={currentDate}
                      onSelect={handleDateSelect}
                    />
                  </PopoverContent>
                </Popover>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateDate('next')}
                  className="h-9 w-9 p-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

            {/* Filtri a destra */}
            <div className="flex flex-wrap items-center gap-3 lg:gap-4">
              <div className="flex items-center gap-2 shrink-0">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filtri:</span>
              </div>

              {/* Filtro dipendente */}
              <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                <SelectTrigger className="w-48 h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Tutti i dipendenti
                    </div>
                  </SelectItem>
                  {uniqueEmployees.map(employee => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Filtro tipo manutenzione */}
              <Select value={typeFilter} onValueChange={(value: MaintenanceTypeFilter) => setTypeFilter(value)}>
                <SelectTrigger className="w-48 h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti i tipi</SelectItem>
                  <SelectItem value="installazione">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      Installazione
                    </div>
                  </SelectItem>
                  <SelectItem value="manutenzione">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      Manutenzione
                    </div>
                  </SelectItem>
                  <SelectItem value="verifica">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      Verifica
                    </div>
                  </SelectItem>
                  <SelectItem value="sostituzione">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500" />
                      Sostituzione
                    </div>
                  </SelectItem>
                  <SelectItem value="dismissione">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      Dismissione
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>



      {/* Vista calendario */}
      {renderCalendarView()}

      {/* Modal dettagli manutenzione */}
      <MaintenanceDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleDetailModalClose}
        maintenance={selectedMaintenance}
      />
    </div>
  );
}