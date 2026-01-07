// Custom hook for managing maintenance data from backend API
import { useState, useEffect, useCallback } from 'react';
import { Maintenance } from '@certplus/types';
import { backendAPI } from '@/lib/api/backend';
import {
  mapMaintenanceDataToMaintenance,
  mapMaintenanceToCreateRequest,
  mapMaintenanceCreateResponseToMaintenance
} from '@/lib/api/mappers';
import type { MaintenanceCreateRequest } from '@/types/maintenance';

interface UseMaintenancesResult {
  maintenances: Maintenance[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  createMaintenance: (
    maintenance: Partial<Maintenance>,
    productUuid: string,
    companyId: string,
    userId: string,
    certificateNumber?: string
  ) => Promise<Maintenance>;
}

interface UseMaintenancesByProductResult {
  maintenances: Maintenance[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// Temporary fallback UUID for maintenance records without product_uuid
// This is a workaround for backend issue where GET /maintenance doesn't return product_uuid
const FALLBACK_PRODUCT_UUID = 'a665a0ee-267e-4fc7-8395-8d8b893c781f';

/**
 * Hook to fetch and manage all maintenance records from the backend
 * @param userId - User ID for filtering maintenances
 * @returns maintenances array, loading state, error, and CRUD functions
 */
export function useMaintenances(userId: string = 'default-user'): UseMaintenancesResult {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMaintenances = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch products first to build maintenance_uuid -> product_uuid mapping
      // Backend nests maintenances inside products in GET /product response
      const productsData = await backendAPI.getAllProducts();

      // Build mapping: maintenance.uuid -> product.uuid
      const maintenanceToProductMap = new Map<string, string>();
      productsData.forEach(product => {
        const maintenances = (product as any).maintenances || [];
        maintenances.forEach((maintenance: any) => {
          maintenanceToProductMap.set(maintenance.uuid, product.uuid);
        });
      });

      console.log(`📦 Built mapping for ${maintenanceToProductMap.size} maintenances from ${productsData.length} products`);

      // Now fetch maintenances and use the mapping
      const data = await backendAPI.getAllMaintenances();

      // Map backend data to frontend Maintenance type with correct product_uuid
      const mapped = data.map(maintenanceData => {
        // Use the mapping from products to get the correct product_uuid
        const productId = maintenanceToProductMap.get(maintenanceData.uuid) || FALLBACK_PRODUCT_UUID;

        if (!maintenanceToProductMap.has(maintenanceData.uuid)) {
          console.warn(
            `⚠️ Maintenance ${maintenanceData.uuid} not found in any product's maintenances array. ` +
            `Using fallback UUID.`
          );
        }

        return mapMaintenanceDataToMaintenance(maintenanceData, productId, userId);
      });

      setMaintenances(mapped);
      console.log(`✅ Fetched ${mapped.length} maintenance records from backend`);

      // Log warning if any maintenances are using fallback
      const fallbackCount = mapped.filter(m => m.productId === FALLBACK_PRODUCT_UUID).length;
      if (fallbackCount > 0) {
        console.warn(
          `⚠️ ${fallbackCount} maintenance records using fallback product UUID.`
        );
      }
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error('❌ Failed to fetch maintenances:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchMaintenances();
  }, [fetchMaintenances]);

  const createMaintenance = useCallback(async (
    maintenance: Partial<Maintenance>,
    productUuid: string,
    companyId: string,
    userId: string,
    certificateNumber: string = `CERT-${Date.now()}`
  ): Promise<Maintenance> => {
    try {
      // Map frontend Maintenance to backend request format
      const request: MaintenanceCreateRequest = mapMaintenanceToCreateRequest(
        maintenance,
        productUuid,
        companyId,
        certificateNumber
      );

      // Validate GPS coordinates before sending
      if (request.gps_lat && request.gps_lng) {
        const isValid = backendAPI.validateGPSCoordinates(
          parseFloat(request.gps_lat),
          parseFloat(request.gps_lng)
        );
        if (!isValid) {
          throw new Error(
            'Invalid GPS coordinates. Must be 6 decimals max and 9 total digits max.'
          );
        }
      }

      // Create maintenance via API
      const response = await backendAPI.createMaintenance(request);

      // Map response to Maintenance and add to local state
      const newMaintenance = mapMaintenanceCreateResponseToMaintenance(
        response,
        request,
        userId
      );

      setMaintenances(prev => [...prev, newMaintenance as Maintenance]);
      console.log('✅ Maintenance created successfully:', response.uuid);
      console.log('📦 Blockchain Asset ID:', response.asset_id);
      console.log('🔗 IPFS Metadata CID:', response.metadata_cid);
      console.log('⛓️ Transaction ID:', response.transaction_id);

      return newMaintenance as Maintenance;
    } catch (err) {
      console.error('❌ Failed to create maintenance:', err);
      throw err;
    }
  }, []);

  return {
    maintenances,
    loading,
    error,
    refetch: fetchMaintenances,
    createMaintenance,
  };
}

/**
 * Hook to fetch maintenances filtered by product ID
 * @param productId - Product UUID to filter by
 * @param userId - User ID for mapping
 * @returns filtered maintenances array, loading state, error, and refetch
 */
export function useMaintenancesByProduct(
  productId: string | null,
  userId: string = 'default-user'
): UseMaintenancesByProductResult {
  const { maintenances, loading, error, refetch } = useMaintenances(userId);

  // Filter maintenances for specific product
  // WORKAROUND: Esclude interventi con FALLBACK_PRODUCT_UUID se il product corrente non è quello
  // Questo previene che interventi vecchi (senza product_uuid dal backend) appaiano in prodotti sbagliati
  const filteredMaintenances = maintenances.filter(m => {
    // Se il productId corrente è il FALLBACK, mostra solo quelli con FALLBACK
    if (productId === FALLBACK_PRODUCT_UUID) {
      return m.productId === productId;
    }

    // Se il productId corrente NON è il FALLBACK, escludi TUTTI i FALLBACK
    // (perché non sappiamo a quale prodotto appartengono realmente)
    return m.productId === productId && m.productId !== FALLBACK_PRODUCT_UUID;
  });

  return {
    maintenances: filteredMaintenances,
    loading,
    error,
    refetch,
  };
}

/**
 * Hook to fetch maintenances filtered by intervention type
 * @param interventionType - Type of intervention to filter by
 * @param userId - User ID for mapping
 * @returns filtered maintenances array
 */
export function useMaintenancesByType(
  interventionType: Maintenance['tipo_intervento'] | 'tutti',
  userId: string = 'default-user'
) {
  const { maintenances, loading, error, refetch } = useMaintenances(userId);

  // Filter by intervention type
  const filteredMaintenances = interventionType === 'tutti'
    ? maintenances
    : maintenances.filter(m => m.tipo_intervento === interventionType);

  return {
    maintenances: filteredMaintenances,
    loading,
    error,
    refetch,
  };
}

/**
 * Hook to fetch maintenances with GPS coordinates (for map view)
 * @param userId - User ID for mapping
 * @returns maintenances with valid GPS coordinates
 */
export function useMaintenancesWithLocation(userId: string = 'default-user') {
  const { maintenances, loading, error, refetch } = useMaintenances(userId);

  // Filter maintenances that have valid GPS coordinates
  const maintenancesWithLocation = maintenances.filter(m =>
    m.gps_lat !== undefined &&
    m.gps_lng !== undefined &&
    !isNaN(m.gps_lat) &&
    !isNaN(m.gps_lng)
  );

  return {
    maintenances: maintenancesWithLocation,
    loading,
    error,
    refetch,
  };
}
