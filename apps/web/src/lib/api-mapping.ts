/**
 * API Data Mapping - Transform external API data to internal app schema
 *
 * Maps data between the external Geosign API and the internal app schema.
 * Handles field name differences and data type conversions.
 */

import type { Product, Maintenance } from '@certplus/types';

/**
 * External API Product Schema (from Geosign API)
 */
export interface ApiProduct {
  uuid: string;
  qr_code: string;
  signal_type: string;
  signal_category?: string;        // ✨ NEW: Descriptive category field
  production_year: number;
  shape: string;
  dimension: string;
  wl_code?: string;
  support_material: string;
  support_thickness: string;
  fixation_class: string;
  fixation_method: string;
  created_by: string;
  created_at: string;
  gps_lat?: string | number;       // ✨ NEW: GPS coordinates (may be string from API)
  gps_lng?: string | number;       // ✨ NEW: GPS coordinates (may be string from API)
  maintenances?: ApiMaintenance[]; // ✨ NEW: Nested maintenances array
  // ✨ Blockchain fields from external API
  asset_id?: number;               // Algorand blockchain asset ID
  metadata_cid?: string;           // IPFS content identifier
  product_sha256?: string;         // SHA-256 hash of product data
}

/**
 * API Response wrapper for products
 */
export interface ApiProductsResponse {
  status_code: number;
  message: string;
  payload: {
    data: ApiProduct[];
  };
}

/**
 * Helper function to normalize signal type
 */
function normalizeSignalType(signalType: string): 'permanente' | 'temporanea' {
  const normalized = signalType.toLowerCase();
  if (normalized.includes('temp')) {
    return 'temporanea';
  }
  return 'permanente';
}

/**
 * Helper to safely parse GPS coordinates (handles both string and number)
 */
function parseGpsCoordinate(value: string | number | undefined): number | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'number') return value;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? undefined : parsed;
}

/**
 * Map external API product to internal Product schema
 *
 * **GPS Coordinates Workaround**:
 * - Backend API does NOT provide GPS coordinates at product level
 * - GPS coordinates exist only in nested maintenances array
 * - This function uses GPS from first maintenance as fallback
 * - Products without maintenances will have undefined GPS (won't show on map)
 *
 * **TODO**: Backend should add gps_lat/gps_lng fields to product schema
 */
export function mapApiProductToProduct(apiProduct: ApiProduct): Product {
  // ✨ WORKAROUND: API backend non fornisce GPS a livello prodotto
  // Usiamo le coordinate della prima maintenance come fallback
  const firstMaintenance = apiProduct.maintenances?.[0];
  const fallbackLat = firstMaintenance?.gps_lat ? parseGpsCoordinate(firstMaintenance.gps_lat) : undefined;
  const fallbackLng = firstMaintenance?.gps_lng ? parseGpsCoordinate(firstMaintenance.gps_lng) : undefined;

  return {
    id: apiProduct.uuid,
    qr_code: apiProduct.qr_code,
    tipologia_segnale: normalizeSignalType(apiProduct.signal_type),
    // Use signal_category if available, otherwise fallback to signal_type
    tipo_segnale: apiProduct.signal_category || apiProduct.signal_type,
    anno: apiProduct.production_year,
    forma: apiProduct.shape,
    dimensioni: apiProduct.dimension,
    wl: apiProduct.wl_code || '',
    materiale_supporto: apiProduct.support_material,
    spessore_supporto: parseFloat(apiProduct.support_thickness) || 0,
    materiale_pellicola: '', // Not provided by API
    figura: '', // Not provided by API
    fissaggio: apiProduct.fixation_method,
    // Parse GPS coordinates from product level OR fallback to first maintenance GPS
    // TODO: Backend should provide GPS at product level
    gps_lat: parseGpsCoordinate(apiProduct.gps_lat) || fallbackLat,
    gps_lng: parseGpsCoordinate(apiProduct.gps_lng) || fallbackLng,
    is_cantieristica_stradale: false, // Not provided by API
    stato_prodotto: undefined, // Not provided by API
    data_scadenza: undefined, // Not provided by API
    companyId: 'company-1', // Default company (future: map from created_by)
    createdBy: apiProduct.created_by,
    createdAt: apiProduct.created_at,
    updatedAt: apiProduct.created_at,
    // Map nested maintenances if present in API response
    maintenances: apiProduct.maintenances
      ? mapApiMaintenancesToMaintenances(apiProduct.maintenances)
      : undefined,
    // ✨ Map blockchain fields from external API
    asset_id: apiProduct.asset_id,           // Algorand asset ID
    metadata_cid: apiProduct.metadata_cid,   // IPFS metadata CID
  };
}

/**
 * Map array of API products to internal Product array
 */
export function mapApiProductsToProducts(apiProducts: ApiProduct[]): Product[] {
  return apiProducts.map(mapApiProductToProduct);
}

/**
 * Map internal Product to API product format for creation
 */
export function mapProductToApiProduct(product: Partial<Product>): Partial<ApiProduct> {
  return {
    qr_code: product.qr_code || '',
    signal_type: product.tipologia_segnale || '',
    production_year: product.anno || new Date().getFullYear(),
    shape: product.forma || '',
    dimension: product.dimensioni || '',
    wl_code: product.wl,
    support_material: product.materiale_supporto || '',
    support_thickness: String(product.spessore_supporto || 0),
    fixation_class: '', // Not used in app currently
    fixation_method: product.fissaggio || '',
    created_by: product.createdBy || 'system',
  };
}

/**
 * External API Maintenance Schema (from Geosign API)
 */
export interface ApiMaintenance {
  uuid: string;
  intervention_type?: string;      // ✨ OPTIONAL: May be missing from legacy data
  gps_lat: string | number;        // ✨ Can be string from API
  gps_lng: string | number;        // ✨ Can be string from API
  year: number;
  poles_number?: number | string;  // ✨ Can be string from API
  company_id: string;
  certificate_number: string;
  reason: string;
  notes?: string;
  product_uuid?: string; // Link to product (may be missing from API)
  created_at: string;
}

/**
 * API Response wrapper for maintenance
 */
export interface ApiMaintenanceResponse {
  status_code: number;
  message: string;
  payload: {
    data: ApiMaintenance[];
  };
}

/**
 * Map external API maintenance to internal Maintenance schema
 *
 * **Note**: API doesn't provide productId or userId, so these are set to placeholders.
 * Frontend should handle productId lookup via product QR code matching if needed.
 */
export function mapApiMaintenanceToMaintenance(apiMaintenance: ApiMaintenance): Maintenance {
  // Map intervention type (API uses different naming)
  const tipoInterventoMap: Record<string, Maintenance['tipo_intervento']> = {
    'installation': 'installazione',
    'installazione': 'installazione',
    'maintenance': 'manutenzione',
    'manutenzione': 'manutenzione',
    'verification': 'verifica',
    'verifica': 'verifica',
    'decommissioning': 'dismissione',
    'dismissione': 'dismissione',
    'remove': 'dismissione',        // ✨ NEW: Map "Remove" to dismissione
    'remove2': 'dismissione',        // ✨ NEW: Map "Remove2" to dismissione
    'replacement': 'sostituzione',   // ✨ NEW: Map "replacement" to sostituzione
    'sostituzione': 'sostituzione',
  };

  // Safe access: handle missing intervention_type field
  const tipoIntervento = apiMaintenance.intervention_type
    ? (tipoInterventoMap[apiMaintenance.intervention_type.toLowerCase()] || 'manutenzione')
    : 'manutenzione';

  // Parse poles_number (handle both string and number)
  const polesNumber = apiMaintenance.poles_number
    ? (typeof apiMaintenance.poles_number === 'string'
        ? parseInt(apiMaintenance.poles_number)
        : apiMaintenance.poles_number)
    : undefined;

  return {
    id: apiMaintenance.uuid,
    // TEMPORARY FIX: Use first product UUID for testing until backend adds product_uuid to API response
    // TODO: Remove this when GET /maintenance includes product_uuid field
    productId: apiMaintenance.product_uuid || 'a665a0ee-267e-4fc7-8395-8d8b893c781f',
    tipo_intervento: tipoIntervento,
    anno: apiMaintenance.year,
    // Parse GPS coordinates (handle both string and number)
    gps_lat: parseGpsCoordinate(apiMaintenance.gps_lat) || 0,
    gps_lng: parseGpsCoordinate(apiMaintenance.gps_lng) || 0,
    causale: apiMaintenance.reason,
    companyId: apiMaintenance.company_id,
    certificato_numero: apiMaintenance.certificate_number,
    tipologia_installazione: polesNumber ? `${polesNumber}-pali` : undefined,
    note: apiMaintenance.notes || '',
    foto_urls: [], // NOT PROVIDED BY API - empty array default
    userId: '', // NOT PROVIDED BY API - needs to be populated by frontend if needed
    createdAt: apiMaintenance.created_at,
  };
}

/**
 * Map array of API maintenances to internal Maintenance array
 */
export function mapApiMaintenancesToMaintenances(apiMaintenances: ApiMaintenance[]): Maintenance[] {
  return apiMaintenances.map(mapApiMaintenanceToMaintenance);
}

/**
 * Map internal Maintenance to API maintenance format for creation
 */
export function mapMaintenanceToApiMaintenance(maintenance: Partial<Maintenance>, productUuid: string): any {
  // Parse poles number from tipologia_installazione (e.g., "2-pali" -> 2)
  const polesNumber = maintenance.tipologia_installazione
    ? parseInt(maintenance.tipologia_installazione.split('-')[0])
    : undefined;

  return {
    intervention_type: maintenance.tipo_intervento || 'manutenzione',
    gps_lat: maintenance.gps_lat || 0,
    gps_lng: maintenance.gps_lng || 0,
    year: maintenance.anno || new Date().getFullYear(),
    poles_number: polesNumber,
    company_id: maintenance.companyId || '',
    certificate_number: maintenance.certificato_numero || '',
    reason: maintenance.causale || '',
    notes: maintenance.note || '',
    product_uuid: productUuid, // Required for linking maintenance to product
  };
}
