/**
 * Maintenance Types - CertificablePlus Monorepo
 * RECONCILED version with dual-language strategy
 *
 * Reconciliation Notes:
 * - Web: Uses dual-language approach (Italian UI fields REQUIRED + English API fields OPTIONAL)
 * - Mobile: Uses single language (Italian fields only)
 * - SOLUTION: Adopt Web's dual-language strategy
 *
 * Dual-Language Strategy:
 * - API fields (English): intervention_type, year, company_id, etc. - OPTIONAL
 * - UI fields (Italian): tipo_intervento, anno, companyId, etc. - REQUIRED
 *
 * Benefits:
 * - Components always use Italian fields (guaranteed present)
 * - API mappers populate both field sets
 * - Mock data works with Italian-only fields (development)
 * - Production API integration populates both sets (via mappers)
 */

export interface Maintenance {
  id: string;

  // Product references - Dual field strategy
  product_uuid?: string;         // OPTIONAL - API field (external API uses this)
  productId: string;             // REQUIRED - Internal reference (always present)

  // ========================================
  // API FIELDS (English) - OPTIONAL
  // Populated only in production when using external API
  // ========================================
  intervention_type?: 'installation' | 'maintenance' | 'replacement' | 'verification' | 'dismissal';
  year?: number;               // Intervention year (API)
  poles_number?: number;       // Number of poles (installation only)
  company_id?: string;         // Company ID (API)
  certificate_number?: string; // Certificate number (API)
  reason?: string;             // Intervention reason (API)
  notes?: string;              // Detailed notes (API)

  // ========================================
  // UI FIELDS (Italian) - REQUIRED
  // Always present, used by components
  // ========================================
  tipo_intervento: 'installazione' | 'manutenzione' | 'sostituzione' | 'verifica' | 'dismissione';
  anno: number;                    // Intervention year (UI)
  causale: string;                 // Intervention reason (UI)
  certificato_numero: string;      // Certificate number (UI)
  note: string;                    // Detailed notes (UI)
  companyId: string;               // Company ID (UI)
  tipologia_installazione?: string; // Installation type (only for installation): "1-palo", "2-pali", etc.

  // GPS coordinates
  // Web: REQUIRED
  // Mobile: OPTIONAL
  // Solution: REQUIRED (more strict validation)
  gps_lat: number;  // Max 6 decimals, 10 total digits
  gps_lng: number;  // Max 6 decimals, 10 total digits

  // Documentation
  foto_urls: string[];         // Photo URLs/paths
  userId: string;              // User who performed the maintenance
  createdAt: string;           // ISO date string

  // Blockchain metadata (optional, from external API)
  asset_id?: number;           // Algorand asset ID
  metadata_cid?: string;       // IPFS content identifier
  transaction_id?: string;     // Blockchain transaction ID
}

/**
 * Maintenance type enum (Italian)
 * Used for type-safe maintenance operations
 */
export enum MaintenanceTypeIT {
  Installazione = 'installazione',
  Manutenzione = 'manutenzione',
  Sostituzione = 'sostituzione',
  Verifica = 'verifica',
  Dismissione = 'dismissione'
}

/**
 * Maintenance type enum (English)
 * Used for API integration
 */
export enum MaintenanceTypeEN {
  Installation = 'installation',
  Maintenance = 'maintenance',
  Replacement = 'replacement',
  Verification = 'verification',
  Dismissal = 'dismissal'
}

/**
 * Map Italian maintenance types to English
 */
export const maintenanceTypeITtoEN: Record<string, string> = {
  'installazione': 'installation',
  'manutenzione': 'maintenance',
  'sostituzione': 'replacement',
  'verifica': 'verification',
  'dismissione': 'dismissal'
};

/**
 * Map English maintenance types to Italian
 */
export const maintenanceTypeENtoIT: Record<string, string> = {
  'installation': 'installazione',
  'maintenance': 'manutenzione',
  'replacement': 'sostituzione',
  'verification': 'verifica',
  'dismissal': 'dismissione'
};
