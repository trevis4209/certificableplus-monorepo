// Backend API Service
// This service handles all communication with the backend API endpoints

import { ApiResponse, DirectApiResponse } from '@/types/api-response';
import {
  MaintenanceCreateRequest,
  MaintenanceCreateResponse,
  MaintenanceData
} from '@/types/maintenance';
import {
  ProductCreateRequest,
  ProductCreateResponse,
  ProductData
} from '@/types/product';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

// Fixed user ID for API calls (backend doesn't have auth yet)
// Using Mario Rossi (company user) from mock data
export const FIXED_USER_ID = 'user-1';

class BackendAPI {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add API Key authentication header
      // Required for all endpoints except /status
      if (API_KEY) {
        headers['x-api-key'] = API_KEY;
      } else {
        console.warn('⚠️ API Key not configured. API calls may fail.');
      }

      // Merge with any existing headers from options
      if (options?.headers) {
        Object.assign(headers, options.headers);
      }

      const url = `${API_BASE_URL}${endpoint}`;
      console.log(`🔄 [BackendAPI] Fetch ${options?.method || 'GET'} ${url}`);

      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log(`📥 [BackendAPI] Response status: ${response.status} ${response.statusText}`);

      const data = await response.json();
      console.log(`📥 [BackendAPI] Response data:`, JSON.stringify(data, null, 2));

      if (!response.ok) {
        console.error(`❌ [BackendAPI] HTTP Error ${response.status}:`, data);
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`❌ [BackendAPI] API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Product endpoints
  async createProduct(product: ProductCreateRequest): Promise<ProductCreateResponse> {
    const response = await this.request<DirectApiResponse<ProductCreateResponse>>('/product/create', {
      method: 'POST',
      body: JSON.stringify(product),
    });
    // Backend returns data directly in payload (no data wrapper)
    return response.payload;
  }

  async getAllProducts(): Promise<ProductData[]> {
    const response = await this.request<ApiResponse<ProductData[]>>('/product', {
      method: 'GET',
    });
    return response.payload.data;
  }

  // Maintenance endpoints
  async createMaintenance(maintenance: MaintenanceCreateRequest): Promise<MaintenanceCreateResponse> {
    console.log('🌐 [BackendAPI] createMaintenance - Starting request...');
    console.log('📋 [BackendAPI] Request payload:', JSON.stringify(maintenance, null, 2));

    // Log each field for validation
    console.log('🔍 [BackendAPI] Field validation:');
    console.log('  - intervention_type:', maintenance.intervention_type, `(${typeof maintenance.intervention_type})`);
    console.log('  - gps_lat:', maintenance.gps_lat, `(${typeof maintenance.gps_lat}) length: ${maintenance.gps_lat.length}`);
    console.log('  - gps_lng:', maintenance.gps_lng, `(${typeof maintenance.gps_lng}) length: ${maintenance.gps_lng.length}`);
    console.log('  - year:', maintenance.year, `(${typeof maintenance.year})`);
    console.log('  - poles_number:', maintenance.poles_number, `(${typeof maintenance.poles_number})`);
    console.log('  - company_id:', maintenance.company_id, `(${typeof maintenance.company_id})`);
    console.log('  - certificate_number:', maintenance.certificate_number, `(${typeof maintenance.certificate_number})`);
    console.log('  - product_uuid:', maintenance.product_uuid, `(${typeof maintenance.product_uuid})`);
    console.log('  - reason length:', maintenance.reason?.length || 0);
    console.log('  - notes length:', maintenance.notes?.length || 0);

    try {
      const response = await this.request<DirectApiResponse<MaintenanceCreateResponse>>('/maintenance/create', {
        method: 'POST',
        body: JSON.stringify(maintenance),
      });

      console.log('✅ [BackendAPI] createMaintenance - Success!');
      console.log('📥 [BackendAPI] Full Response:', JSON.stringify(response, null, 2));
      console.log('📦 [BackendAPI] Payload:', response.payload);

      // Backend returns data directly in payload (no data wrapper)
      if (!response.payload) {
        throw new Error('Backend response.payload è undefined o null');
      }

      return response.payload;
    } catch (error: any) {
      console.error('❌ [BackendAPI] createMaintenance - FAILED');
      console.error('💥 [BackendAPI] Error details:', {
        message: error.message,
        status: error.status,
        name: error.name,
        stack: error.stack?.split('\n').slice(0, 3).join('\n')
      });

      // Re-throw per permettere al chiamante di gestire l'errore
      throw error;
    }
  }

  async getAllMaintenances(): Promise<MaintenanceData[]> {
    const response = await this.request<ApiResponse<MaintenanceData[]>>('/maintenance', {
      method: 'GET',
    });
    return response.payload.data;
  }

  // Utility function to format GPS coordinates with required precision
  formatGPSCoordinate(coord: number): number {
    // Ensure 6 decimal places and max 9 total digits
    return parseFloat(coord.toFixed(6));
  }

  // Validate GPS coordinates before sending
  validateGPSCoordinates(lat: number, lng: number): boolean {
    // Check if coordinates are within valid ranges
    if (lat < -90 || lat > 90) return false;
    if (lng < -180 || lng > 180) return false;

    // Check total digit count (max 9 digits including decimals)
    const latStr = Math.abs(lat).toFixed(6);
    const lngStr = Math.abs(lng).toFixed(6);

    const latDigits = latStr.replace('.', '').length;
    const lngDigits = lngStr.replace('.', '').length;

    return latDigits <= 9 && lngDigits <= 9;
  }
}

export const backendAPI = new BackendAPI();