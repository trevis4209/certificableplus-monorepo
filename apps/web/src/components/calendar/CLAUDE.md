# components/calendar - Sistema Calendario Manutenzioni

## 📁 Struttura

```
calendar/
├── CLAUDE.md                    # Questo file di documentazione
├── index.ts                     # Barrel exports per tutti i componenti
├── MaintenanceCalendar.tsx      # Componente principale calendario
├── MaintenanceCard.tsx          # Card per singole manutenzioni
└── TimeSlot.tsx                 # Slot temporali per vista giornaliera
```

## 🎯 Scopo e Funzionalità

Sistema di calendario interattivo per la gestione e pianificazione delle manutenzioni programmate, progettato per il dashboard aziendale di CertificablePlus.

### **Core Features:**
- **Vista Calendario Completa**: Supporto per viste giornaliera, settimanale e mensile
- **Gestione Manutenzioni**: Visualizzazione e interazione con manutenzioni programmate
- **Filtri Avanzati**: Per dipendente, stato, tipo intervento e priorità
- **Interazioni Intuitive**: Click su slot vuoti per creare nuovi appuntamenti
- **Responsive Design**: Mobile-first con pattern touch-friendly

### **Management Capabilities:**
- **Pianificazione Interventi**: Creazione rapida tramite click su slot temporali
- **Gestione Conflitti**: Rilevamento automatico sovrapposizioni temporali
- **Statistiche Real-time**: Indicatori di carico lavoro e produttività
- **Status Management**: Controllo stati (scheduled, in_progress, completed, cancelled)

## 🏗️ Architettura

### **MaintenanceCalendar.tsx**
Componente principale che orchestra l'intero sistema calendario:

```tsx
// Interfacce principali
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

// Props principali
interface MaintenanceCalendarProps {
  scheduledMaintenances: ScheduledMaintenance[];
  onMaintenanceClick?: (maintenance: ScheduledMaintenance) => void;
  onTimeSlotClick?: (date: Date, time: string) => void;
  className?: string;
}
```

**Funzionalità Chiave:**
- Navigazione temporale con controlli intuitivi
- Sistema di filtri multi-parametro
- Rendering condizionale per diverse viste calendario
- Gestione stati e interazioni utente

### **MaintenanceCard.tsx**
Componente per la visualizzazione delle singole manutenzioni:

**Modalità Rendering:**
- **Compact Mode**: Per vista settimanale con informazioni essenziali
- **Expanded Mode**: Per vista giornaliera con dettagli completi
- **Color Coding**: Sistema colori per tipo intervento e priorità
- **Quick Actions**: Cambio stato rapido con hover interactions

### **TimeSlot.tsx**
Gestione degli slot temporali per la vista giornaliera:

**Features:**
- **Timeline Oraria**: Slot da 60 minuti per orari lavorativi (8:00-18:00)
- **Conflict Detection**: Rilevamento sovrapposizioni temporali
- **Workload Indicators**: Barre di carico percentuale per slot
- **Empty Slot Actions**: Click-to-create per nuovi appuntamenti

## 📊 Data Integration

### **Mock Data Structure**
Integrazione con `mockScheduledMaintenances` da `/lib/mock-data.ts`:

```typescript
// Esempi di dati con diverse date e stati
export const mockScheduledMaintenances = [
  {
    id: "scheduled-1",
    title: "Verifica segnale stradale",
    employeeId: "user-6",
    employeeName: "Marco Bianchi",
    productId: "product-1",
    productName: "Segnale di pericolo - Curva pericolosa",
    productLocation: "Via Roma 123, Milano",
    maintenanceType: "verifica",
    scheduledDate: new Date(),
    startTime: "09:00",
    endTime: "10:30",
    duration: 90,
    status: "scheduled",
    priority: "medium",
    notes: "Verifica periodica semestrale...",
    gpsLat: 45.4642,
    gpsLng: 9.1900
  },
  // ... altri 10+ record con variazioni temporali
];
```

### **Helper Functions**
Funzioni di supporto per filtraggio e ricerca:
- `getScheduledMaintenancesByDate(date: Date)`
- `getScheduledMaintenancesByEmployee(employeeId: string)`
- `getScheduledMaintenancesByStatus(status: string)`
- `getScheduledMaintenancesByPriority(priority: string)`

## 🎨 Design System

### **Color Coding per Tipi Intervento:**
```scss
installazione: bg-blue-500/10 text-blue-600    // Blu per nuove installazioni
manutenzione:  bg-orange-500/10 text-orange-600 // Arancione per manutenzioni
verifica:      bg-green-500/10 text-green-600   // Verde per verifiche
sostituzione:  bg-purple-500/10 text-purple-600 // Viola per sostituzioni
dismissione:   bg-red-500/10 text-red-600       // Rosso per dismissioni
```

### **Priority Indicators:**
```scss
low:    bg-gray-100 text-gray-600    // Grigio per bassa priorità
medium: bg-yellow-100 text-yellow-700 // Giallo per media priorità
high:   bg-orange-100 text-orange-700 // Arancione per alta priorità
urgent: bg-red-100 text-red-700       // Rosso per urgente
```

### **Status Colors:**
```scss
scheduled:   bg-blue-100 text-blue-700     // Blu per programmato
in_progress: bg-orange-100 text-orange-700 // Arancione per in corso
completed:   bg-green-100 text-green-700   // Verde per completato
cancelled:   bg-red-100 text-red-700       // Rosso per annullato
```

## 🔧 Integration Usage

### **Implementazione in Company Dashboard:**
```tsx
// In /app/company/maintenance/page.tsx
import { MaintenanceCalendar } from "@/components/calendar";
import { mockScheduledMaintenances } from "@/lib/mock-data";

export default function CompanyMaintenancePage() {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const handleScheduledMaintenanceClick = useCallback((maintenance: any) => {
    console.log("Manutenzione programmata selezionata:", maintenance);
  }, []);

  const handleTimeSlotClick = useCallback((date: Date, time: string) => {
    console.log("Slot temporale selezionato:", date, time);
    setShowAddMaintenanceModal(true);
  }, []);

  return (
    <div>
      {/* Toggle Vista Lista/Calendario */}
      <div className="flex rounded-lg bg-muted p-1">
        <Button variant={viewMode === 'list' ? 'default' : 'ghost'} 
                onClick={() => setViewMode('list')}>
          <List className="h-4 w-4" /> Lista
        </Button>
        <Button variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                onClick={() => setViewMode('calendar')}>
          <CalendarDays className="h-4 w-4" /> Calendario
        </Button>
      </div>

      {/* Render Condizionale */}
      {viewMode === 'calendar' ? (
        <MaintenanceCalendar
          scheduledMaintenances={mockScheduledMaintenances}
          onMaintenanceClick={handleScheduledMaintenanceClick}
          onTimeSlotClick={handleTimeSlotClick}
        />
      ) : (
        // Vista lista esistente...
      )}
    </div>
  );
}
```

## 🚀 Future Enhancements

### **Drag & Drop Support:**
- React Beautiful DnD per riorganizzazione appuntamenti
- Resize handles per modifica durata
- Validazione conflitti in tempo reale

### **Advanced Features:**
- **Vista Mensile**: Overview completo per pianificazione long-term
- **Notifiche**: Sistema alerts per scadenze imminenti
- **Export**: PDF/ICS per integrazione calendar esterni
- **Ricorrenze**: Manutenzioni periodiche automatiche

### **Performance Optimizations:**
- Virtualizzazione per grandi dataset
- Memoization avanzata per re-render
- Lazy loading per viste future/passate

### **Mobile Enhancements:**
- Gesture support per navigazione touch
- Modal calendar picker per date
- Bottom sheet per quick actions

## 📱 Responsive Behavior

### **Desktop (lg+):**
- Vista settimanale 7 colonne full-width
- Sidebar filtri sempre visibili
- Hover states e tooltip informativi

### **Tablet (md):**
- Grid compatta con 5 giorni visibili
- Filtri collapsible in dropdown
- Touch-friendly card interactions

### **Mobile (sm):**
- Vista giornaliera prioritaria
- Swipe navigation tra giorni
- Bottom navigation per filtri
- Modal full-screen per dettagli

## 🧪 Testing & Validation

### **Data Validation:**
- TypeScript strict mode per type safety
- Validazione date ranges e conflitti temporali
- Error boundaries per gestione fallback

### **Accessibility:**
- ARIA labels per screen readers
- Keyboard navigation support
- Focus management per modal interactions
- Color contrast WCAG AA compliant

---

**Last Updated:** 2024-08-12
**Version:** 1.0.0
**Dependencies:** React 19, Next.js 15, Tailwind CSS, shadcn/ui, Lucide Icons