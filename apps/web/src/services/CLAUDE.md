# CLAUDE.md - /src/services

Servizi API e logica business per comunicazione con backend e gestione dati.

## 📁 Struttura

```
services/
└── product-service.ts     # ✨ NUOVO: Product CRUD con QR code generation
```

## 🎯 Purpose

Directory destinata a **servizi API** e **logica business** per:
- Comunicazione con backend APIs
- Data fetching e caching
- Business logic processing
- Error handling centralizzato
- Data transformation

## 🏗️ Recommended Service Patterns

### API Client Base
```typescript
// services/api-client.ts
class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || '/api';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }
  
  async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };
    
    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new ApiError(response.status, await response.text());
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  
  private handleError(error: unknown): ApiError {
    if (error instanceof ApiError) return error;
    
    return new ApiError(500, 'Network error occurred');
  }
}

export const apiClient = new ApiClient();
```

### product-service.ts ✨ **IMPLEMENTATO**
**Enterprise Product Service** con QR code generation automatico e base64 backend integration:

#### Core Features ✅
- **Complete CRUD Operations**: Create, Read, Update, Delete prodotti
- **Automatic QR Generation**: QR codes generati automaticamente alla creazione
- **Base64 Backend Integration**: QR images convertite in base64 per storage
- **Type-Safe API**: Full TypeScript con ServiceResult pattern
- **Error Handling**: Comprehensive error handling con logging
- **Form Data Transformation**: Automatic ProductModal → API data conversion

#### API Integration Implementata
```typescript
export class ProductService {
  // ✅ IMPLEMENTATO - Crea prodotto con QR automatico
  async createProduct(productData: CreateProductInput): Promise<ServiceResult<{
    product: Product;
    qr_image_base64: string;
    qr_url: string;
  }>>

  // ✅ IMPLEMENTATO - Lista prodotti con filtering
  async getProducts(filters?: ProductFilters): Promise<ServiceResult<Product[]>>

  // ✅ IMPLEMENTATO - Singolo prodotto by ID
  async getProductById(productId: string): Promise<ServiceResult<Product>>

  // ✅ IMPLEMENTATO - Update prodotto (preserva QR code)
  async updateProduct(productId: string, updateData: Partial<CreateProductInput>): Promise<ServiceResult<Product>>

  // ✅ IMPLEMENTATO - Delete prodotto
  async deleteProduct(productId: string): Promise<ServiceResult<Product>>
}

// ✅ Convenience Functions
export async function createProductWithQR(
  productData: Omit<CreateProductInput, 'companyId' | 'createdBy'>,
  currentUser: User
): Promise<ServiceResult<{product, qr_image_base64, qr_url}>>

export async function getCompanyProducts(
  companyId: string,
  searchTerm?: string
): Promise<ServiceResult<Product[]>>

export function transformFormDataToProduct(
  formData: any,
  currentUser: User
): CreateProductInput
```

#### QR Code Integration Automatica
```typescript
// Flusso completo automatico:
1. createProduct() chiamata
2. generateUniqueQRCode() → "QR1703123456789"
3. generateQRCodeBase64() → "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
4. addProduct() al mock data con QR
5. Return: { product, qr_image_base64, qr_url }

// Risultato automatico:
{
  product: {
    id: "product-1703123456789",
    qr_code: "QR1703123456789",
    tipologia_segnale: "permanente",
    // ... altri dati prodotto
  },
  qr_image_base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...", // 3.9KB
  qr_url: "http://localhost:3000/public/product/QR1703123456789"
}
```

#### Integration con Frontend Components
```typescript
// ✅ Sidebar Integration - ProductModal → handleModalSubmit
import { createProductWithQR, transformFormDataToProduct } from '@/services/product-service';

const handleModalSubmit = async (data: any, type: string) => {
  if (type === 'Product') {
    const productData = transformFormDataToProduct(data, currentUser);
    const result = await createProductWithQR(productData, currentUser);

    if (result.success) {
      // ✅ QR Code automaticamente generato!
      alert(`✅ Prodotto creato!\nQR: ${result.data.product.qr_code}`);
    }
  }
}
```

#### ServiceResult Pattern
```typescript
export interface ServiceResult<T> {
  data?: T;
  error?: string;
  loading: boolean;
  success: boolean;
}

// Usage example:
const result = await productService.createProduct(productData);
if (result.success && result.data) {
  // Success: result.data contains product + QR data
} else {
  // Error: result.error contains error message
}
```

#### Product Input/Output Types
```typescript
export interface CreateProductInput {
  tipologia_segnale: 'permanente' | 'temporanea';
  anno: number;
  forma: string;
  dimensioni: string;
  materiale_supporto: string;
  spessore_supporto: number;
  tipologia_attacco: string;
  wl: string;
  materiale_pellicola: string;
  figura?: string;
  fissaggio: string;
  gps_lat?: number;
  gps_lng?: number;
  is_cantieristica_stradale?: boolean;
  stato_prodotto?: 'installato' | 'dismesso';
  data_scadenza?: string;
  companyId: string;
  createdBy: string;
}

export interface ProductFilters {
  companyId?: string;
  tipologia_segnale?: 'permanente' | 'temporanea';
  search?: string;
}
```

#### Default Service Instance
```typescript
// ✅ Ready-to-use service instance
export const productService = new ProductService();

// Usage in components:
import { productService } from '@/services/product-service';

const products = await productService.getProducts({ companyId: 'company-1' });
```

### Authentication Service
```typescript
// services/auth-service.ts
export class AuthService {
  static async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    // Store token
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    
    return response.data;
  }
  
  static async logout(): Promise<void> {
    await apiClient.request('/auth/logout', { method: 'POST' });
    localStorage.removeItem('auth_token');
  }
  
  static async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;
    
    try {
      const response = await apiClient.request<User>('/auth/me');
      return response.data;
    } catch (error) {
      // Token expired or invalid
      this.logout();
      return null;
    }
  }
  
  static async refreshToken(): Promise<string | null> {
    try {
      const response = await apiClient.request<{ token: string }>('/auth/refresh');
      localStorage.setItem('auth_token', response.data.token);
      return response.data.token;
    } catch (error) {
      return null;
    }
  }
}
```

### Maintenance Service
```typescript
// services/maintenance-service.ts
export class MaintenanceService {
  static async getMaintenanceHistory(productId: string): Promise<Maintenance[]> {
    const response = await apiClient.request<Maintenance[]>(
      `/products/${productId}/maintenance`
    );
    return response.data;
  }
  
  static async createMaintenance(
    maintenanceData: CreateMaintenanceInput
  ): Promise<Maintenance> {
    const response = await apiClient.request<Maintenance>('/maintenance', {
      method: 'POST',
      body: JSON.stringify(maintenanceData)
    });
    
    return response.data;
  }
  
  static async uploadMaintenancePhotos(
    maintenanceId: string, 
    photos: File[]
  ): Promise<string[]> {
    const formData = new FormData();
    photos.forEach((photo, index) => {
      formData.append(`photo_${index}`, photo);
    });
    
    const response = await fetch(`/api/maintenance/${maintenanceId}/photos`, {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    return data.photo_urls;
  }
  
  // Business logic
  static getMaintenanceStats(maintenances: Maintenance[]) {
    return {
      total: maintenances.length,
      byType: maintenances.reduce((acc, m) => {
        acc[m.tipo_intervento] = (acc[m.tipo_intervento] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      lastMaintenance: maintenances
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
    };
  }
}
```

### Cache Service
```typescript
// services/cache-service.ts
export class CacheService {
  private static cache = new Map<string, { data: any; expires: number }>();
  
  static set<T>(key: string, data: T, ttlMs = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + ttlMs
    });
  }
  
  static get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() > cached.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }
  
  static clear(keyPrefix?: string): void {
    if (keyPrefix) {
      Array.from(this.cache.keys())
        .filter(key => key.startsWith(keyPrefix))
        .forEach(key => this.cache.delete(key));
    } else {
      this.cache.clear();
    }
  }
  
  // Cached API calls
  static async getCachedProducts(companyId: string): Promise<Product[]> {
    const cacheKey = `products_${companyId}`;
    let products = this.get<Product[]>(cacheKey);
    
    if (!products) {
      products = await ProductService.getProducts(companyId);
      this.set(cacheKey, products, 2 * 60 * 1000); // 2 minutes
    }
    
    return products;
  }
}
```

## 🔧 Implementation Guidelines

### Service Architecture
1. **Single Responsibility**: Un service per domain entity
2. **Static Methods**: Per utility functions e API calls
3. **Error Handling**: Consistent error handling across services
4. **Type Safety**: Complete typing per tutti i methods

### Error Handling
```typescript
// services/errors.ts
export class ApiError extends Error {
  constructor(
    public status: number, 
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class BusinessLogicError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'BusinessLogicError';
  }
}

// Error handling utility
export function handleServiceError(error: unknown): never {
  if (error instanceof ApiError) {
    // Log API error
    console.error('API Error:', error.status, error.message);
    throw error;
  }
  
  if (error instanceof BusinessLogicError) {
    // Handle business logic error
    throw error;
  }
  
  // Unknown error
  console.error('Unknown service error:', error);
  throw new Error('An unexpected error occurred');
}
```

### Data Transformation
```typescript
// services/transformers.ts
export class DataTransformers {
  static toDisplayProduct(product: Product): DisplayProduct {
    return {
      ...product,
      displayName: `${product.tipo_segnale} (${product.qr_code})`,
      formattedDimensions: this.formatDimensions(product.dimensioni),
      ageInYears: new Date().getFullYear() - product.anno,
      hasLocation: !!(product.gps_lat && product.gps_lng)
    };
  }
  
  static toApiProduct(formData: CreateProductInput): CreateProductInput {
    return {
      ...formData,
      qr_code: formData.qr_code.toUpperCase(),
      tipo_segnale: formData.tipo_segnale.trim(),
      // Normalize data for API
    };
  }
  
  private static formatDimensions(dimensioni: string): string {
    // Business logic per formatting
    return dimensioni.replace(/x/g, ' × ');
  }
}
```

## 🚀 Future Implementation Plan

### Priority 1: Authentication Service
**Scopo**: Sostituire sistema mock con autenticazione reale
**Includes**: Login, logout, token refresh, user session

### Priority 2: Core CRUD Services
**Scopo**: Products, Maintenance, Users CRUD operations
**Includes**: API integration, validation, error handling

### Priority 3: File Upload Service
**Scopo**: Photo uploads per maintenance, product images
**Includes**: File validation, progress tracking, cloud storage

### Priority 4: Caching & Optimization
**Scopo**: Performance optimization con caching intelligente
**Includes**: Memory cache, persistence, cache invalidation

## 📊 Integration with Current Architecture

### With Server Components
```typescript
// Server Component data fetching
export default async function ProductsPage({ params }) {
  const products = await ProductService.getProducts(params.companyId);
  
  return <ProductsList initialProducts={products} />;
}
```

### With Client Components
```typescript
// Client Component con service integration
export function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  
  const fetchProducts = useCallback(async (companyId: string) => {
    setLoading(true);
    try {
      const products = await ProductService.getProducts(companyId);
      setProducts(products);
    } catch (error) {
      handleServiceError(error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Component implementation...
}
```

### With React Query (Future)
```typescript
// React Query integration
export function useProducts(companyId: string) {
  return useQuery({
    queryKey: ['products', companyId],
    queryFn: () => ProductService.getProducts(companyId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
```

## ⚠️ Current State

**Status**: Directory vuota, usando mock data directo
**Migration necessaria da**: `lib/mock-data.ts` → Services API

**Quando implementare**:
- Dopo setup database backend
- Prima della rimozione mock data
- Insieme a implementazione autenticazione reale

Il pattern dei servizi seguirà le ottimizzazioni performance già implementate nell'app.