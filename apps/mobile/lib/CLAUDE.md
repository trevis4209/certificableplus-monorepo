# CLAUDE.md - /lib

**Librerie e Servizi Core** - Utilities, servizi API e funzioni di supporto

## 📁 Struttura

```
lib/
├── api/                     # Servizi API e comunicazione backend
│   ├── backend.ts               # Client API principale
│   └── mappers.ts               # Mapping types frontend ↔ backend
├── auth-service.ts          # Servizio autenticazione JWT
└── mock-data.ts            # Dati mock per sviluppo/fallback
```

## 🎯 Responsabilità

### Core Services
- **API Communication**: Client HTTP per backend MySQL
- **Authentication**: Gestione JWT tokens e sessioni
- **Data Transformation**: Mapping tra types frontend/backend
- **Development Support**: Mock data per testing

### Design Principles
- **Single Responsibility**: Ogni modulo ha uno scopo specifico
- **Type Safety**: Tutti i servizi completamente tipizzati
- **Error Handling**: Gestione errori consistente e centralizzata
- **Configurability**: Parametri environment-based

## 📋 Directory Guidelines

### `/api` - API Services
**Scopo**: Comunicazione con backend MySQL e trasformazione dati

#### `backend.ts` - API Client
**Responsabilità**:
- HTTP client con autenticazione automatica JWT
- Gestione headers, timeout, retry logic
- Type-safe API calls con validation
- Error handling centralizzato

**Pattern**:
```typescript
class BackendAPI {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>>;

  // Product endpoints
  async createProduct(product: ProductCreateRequest): Promise<ProductCreateResponse>;
  async getAllProducts(): Promise<ProductData[]>;

  // Maintenance endpoints
  async createMaintenance(maintenance: MaintenanceCreateRequest): Promise<MaintenanceCreateResponse>;
  async getAllMaintenances(): Promise<MaintenanceData[]>;
}
```

#### `mappers.ts` - Type Mappers
**Responsabilità**:
- Conversione types frontend → backend request
- Conversione types backend response → frontend
- Field mapping (es. `tipo_segnale` ↔ `signal_type`)
- Data validation e formatting

**Pattern**:
```typescript
// Frontend → Backend
export function mapProductToCreateRequest(product: Partial<Product>, userId: string): ProductCreateRequest;

// Backend → Frontend
export function mapProductDataToProduct(data: ProductData, companyId: string): Product;
```

### Root Level Services

#### `auth-service.ts` - Authentication
**Responsabilità**:
- JWT token management (access + refresh)
- AsyncStorage persistence
- Login/logout/register flows
- Automatic token refresh
- Session validation

**API**:
```typescript
class AuthService {
  async login(credentials: LoginCredentials): Promise<User>;
  async logout(): Promise<void>;
  async getCurrentUser(): Promise<User | null>;
  isAuthenticated(): boolean;
  getToken(): string | null;
}
```

#### `mock-data.ts` - Development Data
**Responsabilità**:
- Dati mock per sviluppo e testing
- Fallback quando backend non disponibile
- Structured data per UI development

## 🔧 Convenzioni di Sviluppo

### Service Class Pattern
```typescript
class ServiceName {
  private baseUrl: string;
  private config: ServiceConfig;

  constructor(config?: Partial<ServiceConfig>) {
    this.config = { ...defaultConfig, ...config };
  }

  private async request<T>(): Promise<T> {
    // Common request logic
  }

  public async specificMethod(): Promise<ReturnType> {
    // Specific implementation
  }
}

export const serviceName = new ServiceName();
```

### Error Handling Strategy
```typescript
// Centralized error types
interface ApiError {
  message: string;
  status: number;
  code?: string;
}

// Error handling in services
const handleApiError = (error: unknown): never => {
  if (error instanceof Error) {
    throw new ApiError(error.message);
  }
  throw new ApiError('Unknown error occurred');
};
```

### Environment Configuration
```typescript
const config = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3
};
```

## ⚠️ Best Practices

### API Client Design
- **Automatic auth**: Inject JWT token automaticamente
- **Error interceptors**: Handle common errors (401, 500) centralmente
- **Request/Response logging**: Per debugging in development
- **Type safety**: Tutti i endpoint completamente tipizzati

### Authentication Security
- **Token storage**: AsyncStorage sicuro per tokens
- **Automatic refresh**: Refresh token prima expiration
- **Logout cleanup**: Clear all stored auth data
- **Session validation**: Check token validity on app start

### Data Transformation
- **Bidirectional mapping**: Frontend ↔ Backend per ogni entity
- **Field validation**: Validate data prima/dopo transformation
- **Default handling**: Provide sensible defaults per missing fields
- **Type preservation**: Maintain type safety through transformations

## 🚨 Regole Importanti

### ✅ Fare
- Services come singleton instances quando appropriato
- Error handling consistente across all services
- Environment-based configuration
- Comprehensive TypeScript types
- Service testing con mock backends

### ❌ Non Fare
- Hard-code API URLs o credentials
- Skip error handling in service methods
- Expose internal service details to consumers
- Mix business logic with service calls
- Ignore TypeScript warnings in service files

## 📚 Pattern Comuni

### Retry Logic
```typescript
const withRetry = async <T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (attempt === maxAttempts) break;

      // Exponential backoff
      await new Promise(resolve =>
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }

  throw lastError!;
};
```

### Request Interceptor
```typescript
class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit): Promise<T> {
    // Pre-request interceptor
    const headers = await this.buildHeaders(options.headers);

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers
    });

    // Response interceptor
    if (!response.ok) {
      await this.handleErrorResponse(response);
    }

    return response.json();
  }

  private async handleErrorResponse(response: Response): Promise<never> {
    if (response.status === 401) {
      await this.handleUnauthorized();
    }
    throw new Error(`API Error: ${response.status}`);
  }
}
```

### Cache Strategy
```typescript
class CachedService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async get<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);

    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    const data = await fetcher();
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }
}
```