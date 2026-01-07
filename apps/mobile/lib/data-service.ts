// Centralized Data Service - Manages all data operations with graceful fallback
import { Product, Maintenance } from '@certplus/types';
import { backendAPI } from './api/backend';
import {
  mapProductDataToProduct,
  mapMaintenanceDataToMaintenance,
  mapProductToCreateRequest,
  mapMaintenanceToCreateRequest,
  mapProductCreateResponseToProduct,
  mapMaintenanceCreateResponseToMaintenance
} from './api/mappers';
import type { ProductCreateRequest } from '@/types/product';
import type { MaintenanceCreateRequest } from '@/types/maintenance';

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const FALLBACK_PRODUCT_UUID = 'a665a0ee-267e-4fc7-8395-8d8b893c781f';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class DataService {
  private productCache: CacheEntry<Product[]> | null = null;
  private maintenanceCache: CacheEntry<Maintenance[]> | null = null;

  /**
   * Check if cache is still valid
   */
  private isCacheValid<T>(cache: CacheEntry<T> | null): boolean {
    if (!cache) return false;
    return Date.now() - cache.timestamp < CACHE_DURATION;
  }

  /**
   * Fetch all products with caching
   */
  async getProducts(companyId: string = 'default-company', forceRefresh = false): Promise<Product[]> {
    try {
      // Return cached data if valid and not forcing refresh
      if (!forceRefresh && this.isCacheValid(this.productCache)) {
        console.log('📦 Using cached products');
        return this.productCache!.data;
      }

      console.log('🌐 Fetching products from backend...');
      const data = await backendAPI.getAllProducts();

      // Map to frontend format
      const products = data.map(productData =>
        mapProductDataToProduct(productData, companyId)
      );

      // Update cache
      this.productCache = {
        data: products,
        timestamp: Date.now()
      };

      console.log(`✅ Fetched ${products.length} products`);
      return products;

    } catch (error) {
      console.error('❌ Failed to fetch products:', error);

      // Return cached data if available, even if expired
      if (this.productCache) {
        console.warn('⚠️ Using expired cache due to API error');
        return this.productCache.data;
      }

      throw error;
    }
  }

  /**
   * Fetch single product by ID
   */
  async getProductById(
    productId: string,
    companyId: string = 'default-company'
  ): Promise<Product | null> {
    try {
      const products = await this.getProducts(companyId);
      return products.find(p => p.id === productId) || null;
    } catch (error) {
      console.error('❌ Failed to fetch product:', error);
      return null;
    }
  }

  /**
   * Create new product
   */
  async createProduct(
    product: Partial<Product>,
    userId: string,
    companyId: string = 'default-company'
  ): Promise<Product> {
    try {
      console.log('🌐 Creating product...');

      // Map to backend format
      const request: ProductCreateRequest = mapProductToCreateRequest(product, userId);

      // Create via API
      const response = await backendAPI.createProduct(request);

      // Map response to Product
      const newProduct = mapProductCreateResponseToProduct(response, request, companyId) as Product;

      // Invalidate cache to force refresh on next fetch
      this.productCache = null;

      console.log('✅ Product created:', response.uuid);
      console.log('📦 Blockchain Asset ID:', response.asset_id);
      console.log('🔗 IPFS Metadata CID:', response.metadata_cid);

      return newProduct;

    } catch (error) {
      console.error('❌ Failed to create product:', error);
      throw error;
    }
  }

  /**
   * Fetch all maintenances with caching
   */
  async getMaintenances(userId: string = 'default-user', forceRefresh = false): Promise<Maintenance[]> {
    try {
      // Return cached data if valid and not forcing refresh
      if (!forceRefresh && this.isCacheValid(this.maintenanceCache)) {
        console.log('📦 Using cached maintenances');
        return this.maintenanceCache!.data;
      }

      console.log('🌐 Fetching maintenances from backend...');
      const data = await backendAPI.getAllMaintenances();

      // Map to frontend format
      const maintenances = data.map(maintenanceData => {
        // ⚠️ BACKEND ISSUE: product_uuid is missing from GET /maintenance response
        const productId = (maintenanceData as any).product_uuid || FALLBACK_PRODUCT_UUID;

        if (!(maintenanceData as any).product_uuid) {
          console.warn(
            `⚠️ Backend Issue: product_uuid missing for maintenance ${maintenanceData.uuid}. ` +
            `Using fallback. See endpoint.md line 187-243.`
          );
        }

        return mapMaintenanceDataToMaintenance(maintenanceData, productId, userId);
      });

      // Update cache
      this.maintenanceCache = {
        data: maintenances,
        timestamp: Date.now()
      };

      console.log(`✅ Fetched ${maintenances.length} maintenance records`);

      // Log warning if any using fallback
      const fallbackCount = maintenances.filter(m => m.productId === FALLBACK_PRODUCT_UUID).length;
      if (fallbackCount > 0) {
        console.warn(
          `⚠️ ${fallbackCount}/${maintenances.length} maintenances using fallback UUID. ` +
          `Backend team: Add product_uuid to GET /maintenance response!`
        );
      }

      return maintenances;

    } catch (error) {
      console.error('❌ Failed to fetch maintenances:', error);

      // Return cached data if available, even if expired
      if (this.maintenanceCache) {
        console.warn('⚠️ Using expired cache due to API error');
        return this.maintenanceCache.data;
      }

      throw error;
    }
  }

  /**
   * Fetch maintenances by product ID
   */
  async getMaintenancesByProduct(
    productId: string,
    userId: string = 'default-user'
  ): Promise<Maintenance[]> {
    try {
      const maintenances = await this.getMaintenances(userId);
      return maintenances.filter(m => m.productId === productId);
    } catch (error) {
      console.error('❌ Failed to fetch maintenances by product:', error);
      return [];
    }
  }

  /**
   * Create new maintenance
   */
  async createMaintenance(
    maintenance: Partial<Maintenance>,
    productUuid: string,
    companyId: string,
    userId: string,
    certificateNumber: string = `CERT-${Date.now()}`
  ): Promise<Maintenance> {
    try {
      console.log('🌐 Creating maintenance...');

      // Map to backend format
      const request: MaintenanceCreateRequest = mapMaintenanceToCreateRequest(
        maintenance,
        productUuid,
        companyId,
        certificateNumber
      );

      // Validate GPS coordinates
      if (request.gps_lat && request.gps_lng) {
        const isValid = backendAPI.validateGPSCoordinates(request.gps_lat, request.gps_lng);
        if (!isValid) {
          throw new Error(
            'Invalid GPS coordinates. Must be 6 decimals max and 9 total digits max.'
          );
        }
      }

      // Create via API
      const response = await backendAPI.createMaintenance(request);

      // Map response to Maintenance
      const newMaintenance = mapMaintenanceCreateResponseToMaintenance(
        response,
        request,
        userId
      ) as Maintenance;

      // Invalidate cache to force refresh on next fetch
      this.maintenanceCache = null;

      console.log('✅ Maintenance created:', response.uuid);
      console.log('📦 Blockchain Asset ID:', response.asset_id);
      console.log('🔗 IPFS Metadata CID:', response.metadata_cid);
      console.log('⛓️ Transaction ID:', response.transaction_id);

      return newMaintenance;

    } catch (error) {
      console.error('❌ Failed to create maintenance:', error);
      throw error;
    }
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.productCache = null;
    this.maintenanceCache = null;
    console.log('🗑️ Cache cleared');
  }

  /**
   * Get cache status for debugging
   */
  getCacheStatus() {
    return {
      products: {
        cached: !!this.productCache,
        valid: this.isCacheValid(this.productCache),
        count: this.productCache?.data.length || 0,
        age: this.productCache ? Date.now() - this.productCache.timestamp : null
      },
      maintenances: {
        cached: !!this.maintenanceCache,
        valid: this.isCacheValid(this.maintenanceCache),
        count: this.maintenanceCache?.data.length || 0,
        age: this.maintenanceCache ? Date.now() - this.maintenanceCache.timestamp : null
      }
    };
  }
}

// Export singleton instance
export const dataService = new DataService();

// Helper functions for common operations
export async function fetchProducts(companyId?: string): Promise<Product[]> {
  return dataService.getProducts(companyId);
}

export async function fetchProductById(id: string, companyId?: string): Promise<Product | null> {
  return dataService.getProductById(id, companyId);
}

export async function createProduct(
  product: Partial<Product>,
  userId: string,
  companyId?: string
): Promise<Product> {
  return dataService.createProduct(product, userId, companyId);
}

export async function fetchMaintenances(userId?: string): Promise<Maintenance[]> {
  return dataService.getMaintenances(userId);
}

export async function fetchMaintenancesByProduct(
  productId: string,
  userId?: string
): Promise<Maintenance[]> {
  return dataService.getMaintenancesByProduct(productId, userId);
}

export async function createMaintenance(
  maintenance: Partial<Maintenance>,
  productUuid: string,
  companyId: string,
  userId: string,
  certificateNumber?: string
): Promise<Maintenance> {
  return dataService.createMaintenance(
    maintenance,
    productUuid,
    companyId,
    userId,
    certificateNumber
  );
}
