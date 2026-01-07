# TodoList Dettagliata - Modifiche Richieste CertificablePlus

**Data Aggiornamento**: 29 Agosto 2025  
**Richieste Cliente**: Ristrutturazione form prodotto, interventi e visualizzazioni  

## =� **STATO ANALISI**

 **COMPLETATO**:
- [x] Analizzato ProductModal esistente (src/components/modals/ProductModal.tsx)
- [x] Analizzato MaintenanceModal esistente (src/components/modals/MaintenanceModal.tsx)  
- [x] Verificato struttura dati (src/types/index.ts, src/lib/mock-data.ts)
- [x] Controllato pagina dettaglio prodotto (src/app/company/products/[product]/page.tsx)

##  **FORM CREAZIONE PRODOTTO**

### = **Modifiche Campo per Campo**

**TIPOLOGIA SEGNALE** � **Priority: HIGH**
- [ ] Sostituire input libero con **2 pulsanti radio**:
  - `segnaletica_permanente` 
  - `segnaletica_temporanea`
- [ ] Aggiornare interface `ProductFormData.tipoSegnale` � `tipologia_segnale`
- [ ] File da modificare: `src/components/modals/ProductModal.tsx` linee 201-208

**ANNO** � **OK** 
- [x] Campo gi� presente e corretto (linee 223-234)

**FORMA** � **OK**   
- [x] Select gi� implementato correttamente (linee 212-220)

**DIMENSIONE** � **OK** 
- [x] Campo gi� presente come "Dimensioni" (linee 250-258)

**MATERIALE SUPPORTO** � **OK** 
- [x] Select gi� implementato (linee 289-298)

**SPESSORE SUPPORTO** � **OK** 
- [x] Campo numerico gi� presente (linee 301-312)

**� TIPOLOGIA ATTACCO** � **Priority: HIGH**
- [ ] Aggiungere nuovo campo Select dopo "Spessore Supporto"
- [ ] Opzioni: "Tasselli", "Pali", "Staffe", "Fascette", "Altri"
- [ ] Aggiungere a `ProductFormData.tipologia_attacco`

**WL** � **OK** 
- [x] Campo gi� presente (linee 239-247)

**= MATERIALE PELLICOLA** � **Priority: MEDIUM**
- [ ] Mantenere Select esistente (linee 321-328)
- [ ] **Aggiungere opzione "Classe IIs"** alle opzioni esistenti
- [ ] Aggiornare placeholder: "Classe 1, Classe 2, Classe 2s, Classe IIs, Classe 3"

**� FIGURA** � **Priority: MEDIUM**  
- [ ] Rinominare campo da "figura_url" � "figura"
- [ ] Mantenere funzionalit� upload esistente (linee 358-390)
- [ ] Aggiornare interface e label

**L RIMUOVERE SEZIONE INSTALLAZIONE** � **Priority: HIGH**
- [ ] Eliminare eventuali campi installazione dal ProductModal
- [ ] Verificare che non ci siano riferimenti nell'interfaccia

---

## =' **AGGIUNGI INTERVENTO (MaintenanceModal)**

### = **Ristrutturazione Tipi Intervento**

**=� INSTALLAZIONE** (nuovo tipo) � **Priority: HIGH**
- [ ] Aggiungere "installazione" a `interventionTypes` array (linea 30-61)
- [ ] **Campi specifici**:
  - [ ] Anno installazione (input numerico)
  - [ ] Geolocalizzazione (lat/lng - campi obbligatori)
  - [ ] Tipologia installazione: Select "n� pali 1,2,3,4,..." 
  - [ ] Causale (textarea)
- [ ] Icona: `Package` o `Shield`

**=' MANUTENZIONE** � **OK**   
- [x] Mantenere tipo esistente invariato

**=
 VERIFICA** (era "revisione") � **Priority: HIGH**
- [ ] Rinominare da "verifica" (gi� presente) 
- [ ] Aggiornare label da "Verifica" 
- [ ] **Campi specifici**:
  - [ ] Anno verifica (input numerico)
  - [ ] Geolocalizzazione (obbligatoria)
  - [ ] Causale (textarea)
- [ ] Mantenere icona `Package`

**=� DISMISSIONE** (era "sostituzione") � **Priority: HIGH**  
- [ ] Rinominare "sostituzione" � "dismissione"
- [ ] Aggiornare label e descrizione
- [ ] **Campi specifici**:
  - [ ] Anno dismissione (input numerico)
  - [ ] Geolocalizzazione (obbligatoria)  
  - [ ] Causale (textarea)
- [ ] Icona: `AlertCircle` o `Trash2`

**=� GEOLOCALIZZAZIONE OBBLIGATORIA** � **Priority: HIGH**
- [ ] Aggiungere campi GPS lat/lng obbligatori per tutti i tipi
- [ ] Sostituire campo "indirizzo" opzionale con GPS obbligatorio
- [ ] Implementare validazione: `gps_lat` e `gps_lng` required
- [ ] UI: Button "Rileva Posizione" con HTML5 Geolocation API

---

## =� **VISUALIZZAZIONE PRODOTTO**

### **� Nuove Sezioni da Aggiungere**

**<� SEZIONE: AGGIUNGI CANTIERE** � **Priority: MEDIUM**
- [ ] Aggiungere sezione **all'inizio** della pagina (prima delle tabs esistenti)
- [ ] **Campi form**:
  - [ ] Data inizio (date picker)
  - [ ] Geolocalizzazione inizio cantiere (GPS)  
  - [ ] Geolocalizzazione fine cantiere (GPS)
- [ ] Card/Modal per gestione cantiere
- [ ] File: `src/app/company/products/[product]/page.tsx`

**= SEZIONE: CHIUSURA CANTIERE** � **Priority: MEDIUM**
- [ ] Sezione per chiudere cantiere attivo
- [ ] Mostrare solo se cantiere aperto
- [ ] Form minimale con conferma
- [ ] Aggiornare stato cantiere: `aperto` � `chiuso`

**=' SEZIONE: MANUTENZIONI PROGRAMMABILI** � **Priority: HIGH**
- [ ] Nuova sezione **all'inizio** (prima delle tabs)
- [ ] **Logica business scadenze**:
  - [ ] **Permanente + Classe 1**: 7 anni dalla installazione  
  - [ ] **Permanente + Classe 2/2s**: 10 anni dalla installazione
  - [ ] **Permanente + Classe 3**: 12 anni dalla installazione
- [ ] Lista prodotti con scadenza imminente/scaduti
- [ ] Badge colore: Verde (ok), Arancione (scadenza vicina), Rosso (scaduto)
- [ ] Pulsante "Programma Manutenzione" per ogni item

**=� STORICO INTERVENTI COMPLETO** � **Priority: MEDIUM**  
- [ ] **Aggiornare tab "Manutenzioni" esistente**:
  - [ ] Mostrare **tutte informazioni generali** prodotto
  - [ ] **Elenco installazioni** con geolocalizzazione
  - [ ] **ID Azienda + Numero Certificato** per ogni intervento
  - [ ] **L RIMUOVERE**: nomi operatori (privacy compliance)
- [ ] File: `src/app/company/products/[product]/page.tsx` linee 424-488

---

## =� **IMPLEMENTAZIONE TECNICA**

### **<� Aggiornamento Tipi TypeScript** � **Priority: CRITICAL**

**src/types/index.ts**:
```typescript
// Product interface updates
interface Product {
  // MODIFICARE
  tipologia_segnale: 'permanente' | 'temporanea'; // era tipo_segnale
  tipologia_attacco: string; // NUOVO
  figura: string; // era figura_url
  
  // MANTENERE esistenti
  anno: number;
  forma: string; 
  dimensioni: string;
  materiale_supporto: string;
  spessore_supporto: number;
  wl: string;
  materiale_pellicola: string; // aggiungere "Classe IIs"
  qr_code: string;
  gps_lat?: number;
  gps_lng?: number;
  companyId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Maintenance interface updates  
interface Maintenance {
  id: string;
  productId: string;
  // MODIFICARE enum
  tipo_intervento: 'installazione' | 'manutenzione' | 'verifica' | 'dismissione';
  
  // NUOVI CAMPI OBBLIGATORI
  anno: number;
  gps_lat: number; // ora obbligatorio
  gps_lng: number; // ora obbligatorio
  causale: string;
  
  // CAMPI CONDIZIONALI
  tipologia_installazione?: string; // solo per installazione
  note?: string; // opzionale per tutti
  foto_urls: string[];
  userId: string;
  createdAt: string;
}

// NUOVA INTERFACE
interface Cantiere {
  id: string;
  data_inizio: string;
  gps_inizio_lat: number;
  gps_inizio_lng: number; 
  gps_fine_lat: number;
  gps_fine_lng: number;
  stato: 'aperto' | 'chiuso';
  companyId: string;
  createdAt: string;
  updatedAt: string;
}
```

### **=� Aggiornamento Mock Data** � **Priority: HIGH**

**src/lib/mock-data.ts**:
- [ ] Aggiungere `mockCantieri: Cantiere[]`
- [ ] Aggiornare `mockProducts` con nuovi campi
- [ ] Aggiornare `mockMaintenance` con campi obbligatori
- [ ] Aggiungere helper: `getCantieriByCompanyId()`
- [ ] Aggiungere helper: `getScadenzeProgrammate()`

### **<� Logica Business Scadenze** � **Priority: HIGH**

**Nuovo file: `src/lib/maintenance-scheduler.ts`**:
```typescript
interface ScadenzaInfo {
  productId: string;
  dataInstallazione: string;
  classPellicola: string;
  dataScadenza: string;
  giorniRimanenti: number;
  status: 'ok' | 'warning' | 'expired';
}

export function calculateScadenze(products: Product[]): ScadenzaInfo[] {
  // Logica calcolo scadenze basata su classe pellicola
}

export function getMaintenanceDue(companyId: string): ScadenzaInfo[] {
  // Prodotti con manutenzione dovuta/prossima
}
```

---

## =� **PRIORIT� IMPLEMENTAZIONE**

### **>G FASE 1 - Core Updates** (1-2 giorni)
- [ ] **HIGH**: Aggiornare tipi TypeScript (`src/types/index.ts`)
- [ ] **HIGH**: Modificare ProductModal - tipologia segnale radio buttons
- [ ] **HIGH**: Aggiungere campo "Tipologia Attacco" al ProductModal
- [ ] **HIGH**: Ristrutturare MaintenanceModal - nuovi tipi intervento
- [ ] **CRITICAL**: Aggiornare mock data con nuovi campi

### **>H FASE 2 - Business Logic** (2-3 giorni)  
- [ ] **HIGH**: Implementare logica calcolo scadenze pellicole
- [ ] **HIGH**: Geolocalizzazione obbligatoria per tutti gli interventi
- [ ] **MEDIUM**: Sistema gestione cantieri (CRUD base)
- [ ] **MEDIUM**: Sezione "Manutenzioni Programmabili" 

### **>I FASE 3 - UI/UX Advanced** (2-3 giorni)
- [ ] **MEDIUM**: Pagina dettaglio prodotto - nuove sezioni cantiere
- [ ] **MEDIUM**: Sistema notifiche manutenzioni con badge colorati
- [ ] **LOW**: Testing completo e bug fixing
- [ ] **LOW**: Ottimizzazioni performance e UX

---

## � **NOTE TECNICHE**

### **Breaking Changes**
- **Product.tipo_segnale** � **Product.tipologia_segnale** (renaming)
- **Maintenance.gps_*** ora **obbligatori** (era opzionale)
- **MaintenanceModal** form completamente ristrutturato

### **Database Migration Required** 
```sql
-- Future: quando si migra da mock data a database reale
ALTER TABLE products 
  RENAME COLUMN tipo_segnale TO tipologia_segnale,
  ADD COLUMN tipologia_attacco VARCHAR(255),
  ALTER COLUMN tipologia_segnale SET DATA TYPE ENUM('permanente', 'temporanea');

ALTER TABLE maintenance
  ADD COLUMN anno INTEGER NOT NULL,
  ADD COLUMN causale TEXT NOT NULL,  
  ALTER COLUMN gps_lat SET NOT NULL,
  ALTER COLUMN gps_lng SET NOT NULL;

CREATE TABLE cantieri (
  id UUID PRIMARY KEY,
  data_inizio DATE NOT NULL,
  gps_inizio_lat DECIMAL(10,8) NOT NULL,
  gps_inizio_lng DECIMAL(11,8) NOT NULL,
  -- ... altri campi
);
```

### **Validation Updates**
- Aggiornare schema Zod in `src/lib/validations/`
- Form validation per campi GPS obbligatori
- Business rules per calcolo scadenze

---

## <� **ACCETTAZIONE CRITERI**

### ** Form Creazione Prodotto**
- [ ] Tipologia segnale: 2 radio buttons (permanente/temporanea)
- [ ] Tutti i campi richiesti presenti e funzionanti
- [ ] Classe IIs disponibile nelle opzioni pellicola
- [ ] Sezione installazione rimossa

### ** Aggiungi Intervento**  
- [ ] 4 tipi: installazione, manutenzione, verifica, dismissione
- [ ] Geolocalizzazione obbligatoria per tutti
- [ ] Campi specifici per ogni tipo (anno, causale, ecc.)
- [ ] Form validation appropriato

### ** Visualizzazione Prodotto**
- [ ] Sezione "Aggiungi Cantiere" funzionante
- [ ] Sezione "Chiusura Cantiere" visibile se cantiere aperto  
- [ ] "Manutenzioni Programmabili" con logica scadenze corretta
- [ ] Storico interventi completo senza nomi operatori

### ** Business Logic**
- [ ] Calcolo automatico scadenze: 7/10/12 anni per classe pellicola
- [ ] Sistema cantieri aperto/chiuso
- [ ] Validazioni dati appropriate
- [ ] Mock data aggiornato per testing

**<� Target Completion**: 7-10 giorni lavorativi  
**=e Team Required**: 1 Frontend Developer  
**>� Testing**: Manuale + automated per business logic