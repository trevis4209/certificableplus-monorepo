// Type mappers between frontend types and backend API types
import { Product, Maintenance } from '@certplus/types';
import {
  ProductData,
  ProductCreateRequest,
  ProductCreateResponse,
} from '@/types/product';
import {
  MaintenanceData,
  MaintenanceCreateRequest,
  MaintenanceCreateResponse,
} from '@/types/maintenance';

// Map frontend Product to backend ProductCreateRequest
// NOTE: GPS coordinates are NOT included - they go in maintenance/installation records
export function mapProductToCreateRequest(
  product: Partial<Product>,
  userId: string
): ProductCreateRequest {
  // Better handling of optional wl_code field
  const wlCode = product.wl && product.wl.trim() !== ''
    ? product.wl.trim()
    : undefined;

  // Extract signal_type and signal_category from tipo_segnale
  // Format: "permanent - Pericolo" or "temporary - Obbligo"
  const tipoSegnale = product.tipo_segnale || '';
  const [signalType, ...categoryParts] = tipoSegnale.split(' - ');
  const signalCategory = categoryParts.join(' - ').trim(); // Rejoin in case category contains " - "

  return {
    qr_code: product.qr_code || '',
    signal_type: signalType.trim(),
    signal_category: signalCategory || signalType.trim(), // Fallback to signal_type if no separator
    production_year: product.anno || new Date().getFullYear(),
    shape: product.forma || '',
    dimension: product.dimensioni || '',
    wl_code: wlCode,
    support_material: product.materiale_supporto || '',
    support_thickness: String(product.spessore_supporto || 0),
    fixation_class: product.materiale_pellicola || '',
    fixation_method: product.fissaggio || '',
    created_by: userId,
  };
}

// Map backend ProductData to frontend Product
export function mapProductDataToProduct(
  data: ProductData,
  companyId: string
): Product {
  // Extract GPS coordinates from the first maintenance record (usually installation)
  // Backend returns maintenances array with each maintenance having gps_lat/gps_lng
  const firstMaintenance = data.maintenances?.[0];
  const gpsLat = firstMaintenance?.gps_lat;
  const gpsLng = firstMaintenance?.gps_lng;

  // Debug log for GPS extraction
  if (data.maintenances && data.maintenances.length > 0) {
    console.log(`📍 [MAPPER] Product ${data.uuid.substring(0, 8)} has ${data.maintenances.length} maintenance(s):`, {
      qr_code: data.qr_code,
      signal_type: data.signal_type,
      first_maintenance_type: firstMaintenance?.intervention_type,
      gps_lat: gpsLat,
      gps_lng: gpsLng,
      hasGPS: !!(gpsLat && gpsLng)
    });
  } else {
    console.log(`⚠️ [MAPPER] Product ${data.uuid.substring(0, 8)} has NO maintenances - will not appear on map`);
  }

  // Normalize signal_type (permanent/temporary → permanente/temporanea)
  const normalizeSignalType = (type: string): 'permanente' | 'temporanea' => {
    if (type === 'permanent') return 'permanente';
    if (type === 'temporary') return 'temporanea';
    return type as 'permanente' | 'temporanea';
  };

  return {
    id: data.uuid,
    // Map BOTH fields separately (aligns with @certplus/types Product interface)
    tipologia_segnale: normalizeSignalType(data.signal_type),  // Category: "permanente"/"temporanea"
    tipo_segnale: data.signal_category || data.signal_type,    // Description: "Modello. 1/a 50 metri." or fallback
    anno: data.production_year,
    forma: data.shape,
    materiale_supporto: data.support_material,
    spessore_supporto: parseFloat(data.support_thickness),
    wl: data.wl_code || '',
    fissaggio: data.fixation_method,
    dimensioni: data.dimension,
    materiale_pellicola: data.fixation_class,
    figura_url: undefined, // Not provided by backend
    qr_code: data.qr_code,
    // GPS coordinates come from maintenance records, not product itself
    gps_lat: gpsLat !== undefined && gpsLat !== null ? Number(gpsLat) : undefined,
    gps_lng: gpsLng !== undefined && gpsLng !== null ? Number(gpsLng) : undefined,
    companyId: companyId,
    createdBy: data.created_by,
    createdAt: data.created_at,
    updatedAt: data.created_at, // Backend doesn't provide updatedAt
    asset_id: data.asset_id || undefined,         // Algorand asset ID
    metadata_cid: data.metadata_cid || undefined, // IPFS metadata CID
  };
}

// Map frontend Maintenance to backend MaintenanceCreateRequest
export function mapMaintenanceToCreateRequest(
  maintenance: Partial<Maintenance>,
  productUuid: string,
  companyId: string,
  certificateNumber: string = ''
): MaintenanceCreateRequest {
  // Format GPS coordinates to meet backend requirements (6 decimals, max 9 total digits, as string)
  // NOTE: Backend validation requires STRING format despite documentation saying "float"
  const formatCoord = (coord?: number): string => {
    // GPS coordinates are required - throw error if missing or zero
    if (!coord || coord === 0) {
      throw new Error(
        'GPS coordinates are required for maintenance. ' +
        'Please ensure location services are enabled and coordinates are captured.'
      );
    }

    const formatted = parseFloat(coord.toFixed(6));
    const str = Math.abs(formatted).toFixed(6).replace('.', '');

    // Validate total digits (max 9)
    if (str.length > 9) {
      throw new Error(
        `GPS coordinate ${coord} exceeds 9 total digits limit (${str.length} digits). ` +
        `Backend requires max 6 decimals and 9 total digits.`
      );
    }

    // Return as string with exactly 6 decimals (backend validation requires string format)
    return formatted.toFixed(6);
  };

  // Map intervention type from Italian to English (if needed)
  const interventionTypeMap: Record<string, string> = {
    'installazione': 'installation',
    'manutenzione': 'maintenance',
    'sostituzione': 'replacement',
    'verifica': 'verification',
    'dismissione': 'dismissal'
  };

  // Get intervention type in English
  const interventionTypeEn = interventionTypeMap[maintenance.tipo_intervento || 'manutenzione'] || 'maintenance';

  // Build request with required fields (ALIGNED WITH WEB VERSION)
  const request: MaintenanceCreateRequest = {
    intervention_type: interventionTypeEn,
    gps_lat: formatCoord(maintenance.gps_lat),
    gps_lng: formatCoord(maintenance.gps_lng),
    company_id: companyId,
    certificate_number: certificateNumber || `CERT-${Date.now()}`,
    // Reason and notes: pass as-is (can be empty for non-installation types)
    reason: maintenance.reason?.trim() || '',
    notes: maintenance.note?.trim() || '',
    product_uuid: productUuid,
    // Year: always send, fallback to current year (matching web version behavior)
    year: maintenance.year ? parseInt(String(maintenance.year)) : new Date().getFullYear(),
  };

  // Add poles_number only if provided (optional field)
  // NOTE: GET /product response shows poles_number as integer (number type), not string
  if (maintenance.poles_number !== undefined && maintenance.poles_number !== null) {
    request.poles_number = parseInt(String(maintenance.poles_number));
  }

  return request;
}

// Map backend MaintenanceData to frontend Maintenance
export function mapMaintenanceDataToMaintenance(
  data: MaintenanceData,
  productId: string,
  userId: string
): Maintenance {
  // Map intervention type from English to Italian (if needed)
  const interventionTypeMap: Record<string, Maintenance['tipo_intervento']> = {
    'installation': 'installazione',
    'maintenance': 'manutenzione',
    'replacement': 'sostituzione',
    'verification': 'verifica',
    'dismissal': 'dismissione'
  };

  return {
    id: data.uuid,
    productId: productId,
    tipo_intervento: interventionTypeMap[data.intervention_type] || 'manutenzione',
    note: data.notes || undefined,
    foto_urls: [], // Backend doesn't provide photo URLs yet
    userId: userId,
    gps_lat: data.gps_lat || undefined,
    gps_lng: data.gps_lng || undefined,
    year: data.year || undefined,
    poles_number: data.poles_number || undefined,
    reason: data.reason || undefined,
    certificate_number: data.certificate_number || undefined,
    company_id: data.company_id || undefined,
    createdAt: data.created_at,
  };
}

// Map ProductCreateResponse to partial Product for immediate use
export function mapProductCreateResponseToProduct(
  response: ProductCreateResponse,
  request: ProductCreateRequest,
  companyId: string
): Partial<Product> {
  // Normalize signal_type (permanent/temporary → permanente/temporanea)
  const normalizeSignalType = (type: string): 'permanente' | 'temporanea' => {
    if (type === 'permanent') return 'permanente';
    if (type === 'temporary') return 'temporanea';
    return type as 'permanente' | 'temporanea';
  };

  return {
    id: response.uuid,
    // Map BOTH fields separately (aligns with @certplus/types Product interface)
    tipologia_segnale: normalizeSignalType(request.signal_type),  // Category: "permanente"/"temporanea"
    tipo_segnale: request.signal_category || request.signal_type, // Description: "Modello. 1/a 50 metri." or fallback
    anno: request.production_year,
    forma: request.shape,
    materiale_supporto: request.support_material,
    spessore_supporto: parseFloat(request.support_thickness),
    wl: request.wl_code || '',
    fissaggio: request.fixation_method,
    dimensioni: request.dimension,
    materiale_pellicola: request.fixation_class,
    qr_code: request.qr_code,
    companyId: companyId,
    createdBy: request.created_by,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Map MaintenanceCreateResponse to partial Maintenance for immediate use
export function mapMaintenanceCreateResponseToMaintenance(
  response: MaintenanceCreateResponse,
  request: MaintenanceCreateRequest,
  userId: string
): Partial<Maintenance> {
  const interventionTypeMap: Record<string, Maintenance['tipo_intervento']> = {
    'installation': 'installazione',
    'maintenance': 'manutenzione',
    'replacement': 'sostituzione',
    'verification': 'verifica',
    'dismissal': 'dismissione'
  };

  return {
    id: response.uuid,
    productId: request.product_uuid,
    tipo_intervento: interventionTypeMap[request.intervention_type] || 'manutenzione',
    note: request.notes || undefined,
    foto_urls: [],
    userId: userId,
    gps_lat: request.gps_lat ? parseFloat(request.gps_lat) : undefined,
    gps_lng: request.gps_lng ? parseFloat(request.gps_lng) : undefined,
    year: request.year || undefined,
    poles_number: request.poles_number || undefined,
    reason: request.reason || undefined,
    certificate_number: request.certificate_number || undefined,
    company_id: request.company_id || undefined,
    asset_id: response.asset_id || undefined,
    metadata_cid: response.metadata_cid || undefined,
    transaction_id: response.transaction_id || undefined,
    createdAt: new Date().toISOString(),
  };
}