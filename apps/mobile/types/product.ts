// Product Types and Interfaces

// Product base interface (già esistente in index.ts, lo estenderemo)
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
}

// API Request for creating a product
// NOTE: GPS coordinates are NOT part of product creation
// They are saved via maintenance/installation records instead
export interface ProductCreateRequest {
  qr_code: string;
  signal_type: string;
  signal_category: string;
  production_year: number;
  shape: string;
  dimension: string;
  wl_code?: string;
  support_material: string;
  support_thickness: string;
  fixation_class: string;
  fixation_method: string;
  created_by: string;
}

// API Response after creating a product
export interface ProductCreateResponse {
  uuid: string;
  signal_type: string;
  asset_id: number;
  metadata_cid: string;
}

// Maintenance record from backend (nested in ProductData)
export interface MaintenanceRecord {
  uuid: string;
  intervention_type: string;
  gps_lat: number;
  gps_lng: number;
  year?: number;
  poles_number?: number;
  company_id: string;
  certificate_number: string;
  reason?: string;
  notes?: string;
  created_at: string;
}

// Product data from backend
// NOTE: GPS coordinates come from maintenances array, not from product directly
export interface ProductData {
  uuid: string;
  qr_code: string;
  signal_type: string;
  production_year: number;
  shape: string;
  dimension: string;
  wl_code: string;
  support_material: string;
  support_thickness: string;
  fixation_class: string;
  fixation_method: string;
  created_by: string;
  created_at: string;
  asset_id: number;           // Algorand asset ID
  metadata_cid: string;       // IPFS metadata CID
  maintenances?: MaintenanceRecord[];  // GPS coordinates are here!
}

// Product with blockchain info
export interface ProductWithBlockchain extends Product {
  asset_id?: number;
  metadata_cid?: string;
  transaction_id?: string;
}

// Product filters for searching
export interface ProductFilters {
  companyId?: string;
  tipo_segnale?: string;
  anno?: number;
  search?: string;
  location?: {
    lat: number;
    lng: number;
    radius: number;
  };
}

// Product summary for lists
export interface ProductSummary {
  id: string;
  tipo_segnale: string;
  anno: number;
  qr_code: string;
  wl: string;
}