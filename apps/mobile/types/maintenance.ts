// Maintenance Types and Interfaces

// Base maintenance interface (già esistente in index.ts, lo estenderemo)
export interface Maintenance {
  id: string;
  productId: string;
  tipo_intervento: 'installazione' | 'manutenzione' | 'sostituzione' | 'verifica' | 'dismissione';
  note?: string;
  foto_urls: string[];
  userId: string;
  gps_lat?: number;
  gps_lng?: number;
  year?: number;           // Anno intervento
  poles_number?: number;   // Numero pali installati/manutenuti
  reason?: string;         // Motivazione intervento
  createdAt: string;
}

// API Request for creating maintenance
export interface MaintenanceCreateRequest {
  intervention_type: string;
  gps_lat: string; // String(10) format - max 10 chars (e.g., "45.753046")
  gps_lng: string; // String(10) format - max 10 chars (e.g., "11.699743")
  year?: number;   // Integer (optional)
  poles_number?: number; // Integer (optional) - despite quotes in docs, GET response shows number
  company_id: string;
  certificate_number: string;
  reason: string;
  notes: string;
  product_uuid: string;
}

// API Response after creating maintenance
export interface MaintenanceCreateResponse {
  uuid: string;
  intervention_type: string;
  asset_id: number;
  metadata_cid: string;
  transaction_id: string;
}

// Maintenance data from backend
export interface MaintenanceData {
  uuid: string;
  intervention_type: string;
  gps_lat: number;
  gps_lng: number;
  year: number;
  poles_number: number;
  company_id: string;
  certificate_number: string;
  reason: string;
  notes: string;
  created_at: string;
}

// Maintenance with product details
export interface MaintenanceWithProduct extends Maintenance {
  product?: {
    tipo_segnale: string;
    qr_code: string;
    wl: string;
  };
}

// Maintenance with user details
export interface MaintenanceWithUser extends Maintenance {
  performer?: {
    name: string;
    email: string;
    role: string;
  };
}

// Complete maintenance details
export interface MaintenanceDetails extends Maintenance {
  certificate_number?: string;
  poles_number?: number;
  reason?: string;
  blockchain_tx?: string;
  metadata_cid?: string;
}

// Maintenance statistics
export interface MaintenanceStats {
  total: number;
  by_type: {
    installazione: number;
    manutenzione: number;
    sostituzione: number;
    verifica: number;
    dismissione: number;
  };
  last_maintenance?: string;
  next_scheduled?: string;
}

// Note: ProductHistory and BlockchainCertificate are defined in types/index.ts