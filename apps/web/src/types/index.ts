// User roles
export type UserRole = 'company' | 'employee' | 'viewer';

// User interface
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyId?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Product interface
export interface Product {
  id: string;
  tipologia_segnale: 'permanente' | 'temporanea'; // MODIFICATO: era tipo_segnale
  tipo_segnale: string; // Descrizione del segnale (es: "Segnale di pericolo - Curva pericolosa")
  anno: number;
  forma: string;
  dimensioni: string; // RIORDINATO per seguire ordine form
  materiale_supporto: string;
  spessore_supporto: number;
  wl: string;
  materiale_pellicola: string; // Ora include "Classe IIs"
  figura: string; // MODIFICATO: era figura_url
  qr_code: string;
  gps_lat?: number;
  gps_lng?: number;
  fissaggio: string; // MANTENUTO
  is_cantieristica_stradale?: boolean; // Flag per prodotti cantieristica stradale
  stato_prodotto?: 'installato' | 'dismesso'; // Solo per cantieristica stradale
  data_scadenza?: string; // Opzionale, null per cantieristica stradale
  companyId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;

  // Blockchain metadata (opzionali, dalla risposta API esterna)
  asset_id?: number; // Algorand asset ID dalla blockchain
  metadata_cid?: string; // IPFS content identifier per metadata

  // Nested maintenances (opzionale, dalla risposta API esterna)
  maintenances?: Maintenance[]; // Array di manutenzioni associate al prodotto
}

// Maintenance interface
export interface Maintenance {
  id: string;
  product_uuid?: string; // ✨ OPZIONALE - UUID prodotto (obbligatorio solo per API reale)
  productId: string; // OBBLIGATORIO - Legacy/UI field per compatibilità

  // API fields (inglese) - ✨ OPZIONALI - allineati con /maintenance/create endpoint
  // Popolati solo quando si usa l'API esterna in produzione
  intervention_type?: 'installation' | 'maintenance' | 'replacement' | 'verification' | 'dismissal';
  year?: number; // Anno intervento (API)
  poles_number?: number; // Numero pali (solo installation)
  company_id?: string; // ID azienda (API)
  certificate_number?: string; // Numero certificato (API)
  reason?: string; // Causale intervento (API)
  notes?: string; // Note dettagliate (API)
  gps_lat: number; // Coordinate GPS (max 6 decimali, 10 cifre totali)
  gps_lng: number; // Coordinate GPS (max 6 decimali, 10 cifre totali)

  // UI fields (italiano) - per compatibilità con componenti esistenti
  tipo_intervento: 'installazione' | 'manutenzione' | 'sostituzione' | 'verifica' | 'dismissione';
  anno: number;
  causale: string;
  certificato_numero: string;
  note: string;
  companyId: string;
  tipologia_installazione?: string; // Solo per installazione: "1-palo", "2-pali", etc.

  // Blockchain metadata (opzionali, dalla risposta API esterna)
  asset_id?: number; // Algorand asset ID dalla blockchain
  metadata_cid?: string; // IPFS content identifier per metadata
  transaction_id?: string; // Transaction ID blockchain

  // Legacy fields
  foto_urls: string[];
  userId: string;
  createdAt: string;
}

// Company interface
export interface Company {
  id: string;
  name: string;
  email: string;
  logo_url?: string;
  createdAt: string;
  updatedAt: string;
}

// Cantiere interface (NUOVA INTERFACCIA)
export interface Cantiere {
  id: string;
  data_inizio: string; // ISO date string
  gps_inizio_lat: number; // Coordinate inizio cantiere
  gps_inizio_lng: number;
  gps_fine_lat: number; // Coordinate fine cantiere  
  gps_fine_lng: number;
  stato: 'aperto' | 'chiuso'; // Stato cantiere
  companyId: string; // Reference alla company
  createdAt: string;
  updatedAt: string;
}