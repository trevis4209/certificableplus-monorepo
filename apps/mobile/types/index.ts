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
  tipo_segnale: string;
  anno: number;
  forma: string;
  materiale_supporto: string;
  spessore_supporto: number;
  wl: string;
  fissaggio: string;
  dimensioni: string;
  materiale_pellicola: string;
  figura_url?: string;
  qr_code: string;
  gps_lat?: number;
  gps_lng?: number;
  companyId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  asset_id?: number;       // Algorand asset ID (opzionale)
  metadata_cid?: string;   // IPFS metadata CID (opzionale)
}

// Maintenance interface
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
  certificate_number?: string;  // Numero certificato
  company_id?: string;     // ID azienda
  asset_id?: number;       // Algorand asset ID (dalla response create)
  metadata_cid?: string;   // IPFS metadata CID (dalla response create)
  transaction_id?: string; // Algorand transaction ID (dalla response create)
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

// Blockchain Certificate interface
export interface BlockchainCertificate {
  id: string;
  productId: string;
  transactionHash: string;
  blockNumber: number;
  certificateType: 'installation' | 'maintenance' | 'verification' | 'replacement' | 'dismissal';
  issuer: string;
  timestamp: string;
  metadata: {
    operator: string;
    location: {
      lat: number;
      lng: number;
    };
    notes?: string;
    photos?: string[];
  };
  verified: boolean;
}

// Product History interface
export interface ProductHistory {
  id: string;
  productId: string;
  eventType: 'created' | 'installed' | 'maintained' | 'verified' | 'replaced' | 'dismissed';
  description: string;
  performedBy: string;
  timestamp: string;
  location?: {
    lat: number;
    lng: number;
  };
  photos?: string[];
  certificateId?: string;
  maintenanceId?: string;
}