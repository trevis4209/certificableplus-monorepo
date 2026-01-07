/**
 * Product Types - CertificablePlus Monorepo
 * RECONCILED version between Web and Mobile apps
 *
 * Reconciliation Notes:
 * - Web: Has both `tipologia_segnale` (category) AND `tipo_segnale` (description)
 * - Mobile: Has only `tipo_segnale`
 * - SOLUTION: Keep BOTH fields - tipologia_segnale required, tipo_segnale required
 *
 * - Web: Uses `figura` for image
 * - Mobile: Uses `figura_url` for image
 * - SOLUTION: Support both fields as aliases (backward compatible)
 *
 * - Web: Has cantieristica-specific fields (`is_cantieristica_stradale`, `stato_prodotto`, `data_scadenza`)
 * - Mobile: Doesn't have cantieristica fields
 * - SOLUTION: Make cantieristica fields optional
 */

// Import Maintenance for nested type
import type { Maintenance } from './maintenance';

export interface Product {
  id: string;

  // Signal type fields (RECONCILED)
  // Web uses both tipologia_segnale (category) AND tipo_segnale (description)
  // Mobile uses only tipo_segnale
  // Solution: Keep BOTH fields
  tipologia_segnale: 'permanente' | 'temporanea'; // Signal category (required)
  tipo_segnale: string;                           // Full description (e.g., "Segnale di pericolo - Curva pericolosa")

  // Technical specifications
  anno: number;
  forma: string;
  dimensioni: string;
  materiale_supporto: string;
  spessore_supporto: number;
  wl: string;
  materiale_pellicola: string;
  fissaggio: string;

  // Media and identification
  // Web uses `figura`, Mobile uses `figura_url`
  // Support both for backward compatibility
  figura?: string;              // Primary field (Web uses this)
  figura_url?: string;          // Alias (Mobile uses this)
  qr_code: string;

  // GPS coordinates (optional)
  gps_lat?: number;
  gps_lng?: number;

  // Metadata
  companyId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;

  // Web-specific fields for road construction (cantieristica stradale)
  // Optional - only used in Web app for temporary construction signage
  is_cantieristica_stradale?: boolean;
  stato_prodotto?: 'installato' | 'dismesso';
  data_scadenza?: string; // ISO date string

  // Blockchain metadata (optional, from external API)
  asset_id?: number;           // Algorand asset ID
  metadata_cid?: string;       // IPFS content identifier

  // Nested maintenances (optional, from API responses)
  maintenances?: Maintenance[]; // Associated maintenance records
}

/**
 * Blockchain Certificate interface (Mobile only)
 * Used for product blockchain verification
 */
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

/**
 * Product History interface (Mobile only)
 * Used for tracking product lifecycle events
 */
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
