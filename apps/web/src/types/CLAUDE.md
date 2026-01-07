# CLAUDE.md - /src/types

Definizioni TypeScript globali per type safety dell'intera applicazione.

## 📁 Struttura

```
types/
└── index.ts              # Tutte le interfacce e tipi dell'applicazione
```

## 🏗️ Type Architecture

### Core Domain Types

#### User Management
```typescript
// Ruoli utente del sistema
export type UserRole = 'company' | 'employee' | 'viewer';

// Interfaccia utente principale
export interface User {
  id: string;                    // UUID identificativo
  email: string;                 // Email unica per login
  name: string;                  // Nome visualizzato
  role: UserRole;               // Ruolo nel sistema
  companyId?: string;           // Reference a Company (opzionale per viewer)
  isActive?: boolean;           // Account attivo/disattivato
  createdAt: string;            // ISO timestamp
  updatedAt: string;            // ISO timestamp
}
```

#### Company Management
```typescript
export interface Company {
  id: string;                    // UUID identificativo
  name: string;                  // Ragione sociale
  email: string;                 // Email aziendale
  logo_url?: string;            // URL logo aziendale (opzionale)
  createdAt: string;            // ISO timestamp
  updatedAt: string;            // ISO timestamp
}
```

#### Product Management
```typescript
export interface Product {
  id: string;                    // UUID identificativo
  
  // Specifiche tecniche segnaletica
  tipo_segnale: string;          // Categoria segnale (pericolo, obbligo, etc.)
  anno: number;                  // Anno installazione/produzione
  forma: string;                 // Geometria (triangolare, circolare, etc.)
  materiale_supporto: string;    // Materiale base (alluminio, PVC, etc.)
  spessore_supporto: number;     // Spessore in mm
  wl: string;                    // Codice WL identificativo
  fissaggio: string;             // Tipo fissaggio (tasselli, palo, etc.)
  dimensioni: string;            // Dimensioni (formato "60x60cm")
  materiale_pellicola: string;   // Classe pellicola retroriflettente
  
  // Media e identificazione
  figura_url?: string;           // URL immagine prodotto (opzionale)
  qr_code: string;              // QR code unico per identificazione
  
  // Geolocalizzazione
  gps_lat?: number;             // Latitudine GPS (opzionale)
  gps_lng?: number;             // Longitudine GPS (opzionale)
  
  // Metadata
  companyId: string;            // Reference a Company
  createdBy: string;            // Reference a User che ha creato
  createdAt: string;            // ISO timestamp
  updatedAt: string;            // ISO timestamp
}
```

#### Maintenance Management

**⚠️ Dual-Language Interface Design**: L'interfaccia `Maintenance` supporta DUE nomenclature simultaneamente per compatibilità con API esterna e UI esistente.

```typescript
export interface Maintenance {
  id: string;                    // UUID identificativo

  // Product References - Dual field strategy
  product_uuid?: string;         // ✨ OPZIONALE - UUID prodotto per API esterna
  productId: string;             // ✅ OBBLIGATORIO - Reference interno a Product

  // API fields (inglese) - ✨ OPZIONALI - Popolati solo in production con API reale
  intervention_type?: 'installation' | 'maintenance' | 'replacement' | 'verification' | 'dismissal';
  year?: number;                 // Anno intervento (API)
  poles_number?: number;         // Numero pali (solo installation)
  company_id?: string;           // ID azienda (API)
  certificate_number?: string;   // Numero certificato (API)
  reason?: string;               // Causale intervento (API)
  notes?: string;                // Note dettagliate (API)

  // UI fields (italiano) - ✅ OBBLIGATORI - Usati da componenti frontend
  tipo_intervento: 'installazione' | 'manutenzione' | 'sostituzione' | 'verifica' | 'dismissione';
  anno: number;                  // Anno intervento
  causale: string;               // Causale intervento
  certificato_numero: string;    // Numero certificato
  note: string;                  // Note dettagliate
  companyId: string;             // ID azienda
  tipologia_installazione?: string; // Solo per installazione: "1-palo", "2-pali", etc.

  // Geolocalizzazione - OBBLIGATORIA
  gps_lat: number;               // Latitudine GPS (max 6 decimali, 10 cifre totali)
  gps_lng: number;               // Longitudine GPS (max 6 decimali, 10 cifre totali)

  // Documentazione intervento
  foto_urls: string[];           // Array URL foto documentazione

  // Execution details
  userId: string;                // Reference a User che ha eseguito
  createdAt: string;             // ISO timestamp esecuzione

  // Blockchain metadata (opzionali)
  asset_id?: number;             // Algorand asset ID dalla blockchain
  metadata_cid?: string;         // IPFS content identifier per metadata
  transaction_id?: string;       // Transaction ID blockchain
}
```

**Data Flow Strategy**:
- **Development (Mock Data)**: Solo campi italiani popolati
- **Production (API Integration)**: Campi inglesi + italiani popolati automaticamente
- **Frontend Components**: Accesso trasparente via campi italiani
- **API Mapping**: Conversione automatica EN → IT durante fetch

## 🎯 Usage Patterns

### Type Guards
```typescript
// User role checking
export function isCompanyUser(user: User): boolean {
  return user.role === 'company';
}

export function isEmployee(user: User): boolean {
  return user.role === 'employee';
}

export function hasCompanyAccess(user: User): user is User & { companyId: string } {
  return user.companyId !== undefined;
}
```

### Component Props Typing
```typescript
// Strongly typed component props
interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  showActions?: boolean;
}

interface UserListProps {
  users: User[];
  currentUser: User;
  onUserSelect: (user: User) => void;
  filter?: UserRole;
}
```

### API Response Types
```typescript
// API response wrappers
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

// Paginated responses
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Usage examples
type ProductsResponse = ApiResponse<Product[]>;
type UserResponse = ApiResponse<User>;
type PaginatedProducts = PaginatedResponse<Product>;
```

### Form Data Types
```typescript
// Create/Update DTOs (Data Transfer Objects)
export interface CreateProductInput {
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
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  id: string;
}

export interface CreateMaintenanceInput {
  productId: string;
  tipo_intervento: Maintenance['tipo_intervento'];
  note?: string;
  foto_urls: string[];
  gps_lat?: number;
  gps_lng?: number;
}
```

## 🔧 Development Guidelines

### Adding New Types

1. **Domain-driven**: Raggruppare per domain logic
2. **Consistent naming**: camelCase per proprietà, PascalCase per interfacce
3. **Optional fields**: Usare `?` per campi opzionali
4. **Union types**: Per enum-like values

```typescript
// ✅ GOOD - Well structured interface
export interface Equipment {
  id: string;
  name: string;
  category: EquipmentCategory;
  status: 'active' | 'maintenance' | 'retired';
  specifications: EquipmentSpecs;
  assignedTo?: string;          // Optional field
  lastMaintenance?: string;     // Optional field
  createdAt: string;
  updatedAt: string;
}

export type EquipmentCategory = 'safety' | 'tools' | 'vehicles' | 'electronics';

export interface EquipmentSpecs {
  manufacturer: string;
  model: string;
  serialNumber?: string;
  warrantyExpires?: string;
}
```

### Extending Existing Types

```typescript
// Extend base types for specific use cases
export interface ProductWithMaintenance extends Product {
  maintenanceHistory: Maintenance[];
  nextMaintenanceDue?: string;
  maintenanceCount: number;
}

export interface UserProfile extends User {
  avatar?: string;
  phone?: string;
  address?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'it' | 'en';
  notifications: {
    email: boolean;
    push: boolean;
    maintenance: boolean;
  };
}
```

### Generic Types

```typescript
// Reusable generic patterns
export interface WithTimestamps {
  createdAt: string;
  updatedAt: string;
}

export interface WithCompany {
  companyId: string;
}

export interface WithUser {
  userId: string;
}

// Combine patterns
export interface BaseEntity extends WithTimestamps {
  id: string;
}

export interface CompanyEntity extends BaseEntity, WithCompany {}

export interface UserAction extends WithUser, WithTimestamps {
  action: string;
  entityType: string;
  entityId: string;
}
```

## 📊 Relationship Modeling

### Entity Relationships
```typescript
// One-to-Many: Company -> Users
Company.id -> User.companyId

// One-to-Many: Company -> Products  
Company.id -> Product.companyId

// One-to-Many: Product -> Maintenance
Product.id -> Maintenance.productId

// Many-to-One: User -> Maintenance (performer)
User.id -> Maintenance.userId

// Many-to-One: User -> Product (creator)
User.id -> Product.createdBy
```

### Join Types
```typescript
// Helper types for joined data
export interface ProductWithCompany extends Product {
  company: Company;
}

export interface MaintenanceWithDetails extends Maintenance {
  product: Product;
  performer: User;
}

export interface UserWithCompany extends User {
  company?: Company;
}
```

## 🚀 Future Enhancements

### Database Migration Types
```typescript
// When migrating from mock data to real database
export interface DatabaseProduct extends Omit<Product, 'createdAt' | 'updatedAt'> {
  createdAt: Date;              // Date objects instead of strings
  updatedAt: Date;
}

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

export interface SortOptions {
  field: keyof Product;
  direction: 'asc' | 'desc';
}
```

### API Integration Types
```typescript
// For future API integration
export interface ApiEndpoints {
  products: {
    list: (filters?: ProductFilters) => Promise<Product[]>;
    get: (id: string) => Promise<Product>;
    create: (data: CreateProductInput) => Promise<Product>;
    update: (id: string, data: UpdateProductInput) => Promise<Product>;
    delete: (id: string) => Promise<void>;
  };
  // ... altri endpoints
}
```

## 🌍 Dual-Language Field Strategy (Maintenance Interface)

### Overview

L'interfaccia `Maintenance` implementa una **strategia dual-language** per supportare simultaneamente:
1. **Mock data development** (campi italiani)
2. **External API integration** (campi inglesi)

### Architectural Rationale

**Problema da Risolvere**:
- External API (Geosign) richiede nomenclatura inglese (`intervention_type`, `year`, `company_id`, etc.)
- Frontend components esistenti usano nomenclatura italiana (`tipo_intervento`, `anno`, `companyId`, etc.)
- Mock data per development usa solo campi italiani

**Soluzione Implementata**:
- Campi API inglesi → **Opzionali** (popolati solo in production)
- Campi UI italiani → **Obbligatori** (sempre presenti)
- Backward compatibility garantita

### Field Mapping Table

| Campo Italiano (UI) | Campo Inglese (API) | Required | Note |
|---------------------|---------------------|----------|------|
| `productId` | `product_uuid` | IT only | API field opzionale |
| `tipo_intervento` | `intervention_type` | ✅ IT | API field opzionale |
| `anno` | `year` | ✅ IT | API field opzionale |
| `companyId` | `company_id` | ✅ IT | API field opzionale |
| `certificato_numero` | `certificate_number` | ✅ IT | API field opzionale |
| `causale` | `reason` | ✅ IT | API field opzionale |
| `note` | `notes` | ✅ IT | API field opzionale |

### Data Flow Examples

#### Development Environment (Mock Data)
```typescript
const mockMaintenance: Maintenance = {
  id: "maint-1",
  productId: "product-1",              // ✅ Required
  tipo_intervento: "installazione",    // ✅ Required
  anno: 2024,                          // ✅ Required
  companyId: "company-1",              // ✅ Required
  certificato_numero: "CERT-2024-001", // ✅ Required
  causale: "Prima installazione",      // ✅ Required
  note: "Installato regolarmente",     // ✅ Required
  gps_lat: 45.4642,                    // ✅ Required
  gps_lng: 9.1900,                     // ✅ Required
  foto_urls: [],
  userId: "user-1",
  createdAt: "2024-01-01T00:00:00Z"

  // ✅ NO campi API inglesi - tutti opzionali
};
```

#### Production Environment (API Integration)
```typescript
// API mapping popola ENTRAMBI i set di campi
const apiMaintenance: Maintenance = {
  id: apiResponse.uuid,

  // API fields (inglese) - popolati da API
  product_uuid: apiResponse.product_uuid,
  intervention_type: apiResponse.intervention_type,
  year: apiResponse.year,
  company_id: apiResponse.company_id,
  certificate_number: apiResponse.certificate_number,
  reason: apiResponse.reason,
  notes: apiResponse.notes,

  // UI fields (italiano) - mappati da API
  productId: apiResponse.product_uuid,
  tipo_intervento: mapInterventionType(apiResponse.intervention_type),
  anno: apiResponse.year,
  companyId: apiResponse.company_id,
  certificato_numero: apiResponse.certificate_number,
  causale: apiResponse.reason,
  note: apiResponse.notes,

  gps_lat: apiResponse.gps_lat,
  gps_lng: apiResponse.gps_lng,
  foto_urls: [],
  userId: "",
  createdAt: apiResponse.created_at
};
```

#### Frontend Component Usage
```typescript
// Components sempre usano campi italiani (sempre presenti)
function MaintenanceCard({ maintenance }: { maintenance: Maintenance }) {
  return (
    <div>
      <h3>{maintenance.tipo_intervento}</h3> {/* ✅ Always available */}
      <p>Anno: {maintenance.anno}</p>        {/* ✅ Always available */}
      <p>{maintenance.causale}</p>           {/* ✅ Always available */}
    </div>
  );
}

// ❌ NON fare questo - campi API potrebbero essere undefined
function BrokenComponent({ maintenance }: { maintenance: Maintenance }) {
  return <div>{maintenance.intervention_type}</div>; // ⚠️ Potrebbe essere undefined!
}
```

### Type Safety Guarantees

**Con questa strategia**:
- ✅ Mock data funziona senza campi API (development)
- ✅ Components accedono sempre campi italiani (garantiti presenti)
- ✅ API mapping popola entrambi i set in produzione
- ✅ Zero breaking changes su codice esistente
- ✅ TypeScript type safety completo

**Migration Path**:
```
Phase 1 (Current): Mock data solo IT fields
Phase 2 (API Integration): API mapping popola IT + EN fields
Phase 3 (Components): Components usano sempre IT fields
Phase 4 (Future): Possibile deprecation EN fields se non necessari
```

### Best Practices

**DO ✅**:
```typescript
// Use Italian fields in components
const interventionType = maintenance.tipo_intervento;
const year = maintenance.anno;
const company = maintenance.companyId;

// Populate both field sets in API mapping
return {
  // API fields
  intervention_type: apiData.intervention_type,
  year: apiData.year,
  // UI fields
  tipo_intervento: mapType(apiData.intervention_type),
  anno: apiData.year,
  // ...
};
```

**DON'T ❌**:
```typescript
// Don't rely on API fields in components
const type = maintenance.intervention_type; // ⚠️ Might be undefined!

// Don't skip Italian fields in API mapping
return {
  intervention_type: apiData.intervention_type,
  // ❌ Missing tipo_intervento - component will break!
};

// Don't add API fields to mock data
const mockData = {
  intervention_type: "installation", // ❌ Unnecessary in mock
  tipo_intervento: "installazione",  // ✅ Only this needed
};
```

### Testing Considerations

**Mock Data Tests**:
```typescript
describe('Maintenance with mock data', () => {
  const mockMaintenance: Maintenance = {
    id: "test-1",
    productId: "product-1",
    tipo_intervento: "manutenzione",
    anno: 2024,
    // ... only Italian fields
  };

  it('should render correctly', () => {
    // Test using Italian fields
    expect(mockMaintenance.tipo_intervento).toBe("manutenzione");
  });
});
```

**API Integration Tests**:
```typescript
describe('Maintenance with API data', () => {
  const apiMaintenance: Maintenance = {
    // Both field sets populated
    intervention_type: "maintenance",
    tipo_intervento: "manutenzione",
    year: 2024,
    anno: 2024,
    // ...
  };

  it('should have both field sets', () => {
    expect(apiMaintenance.intervention_type).toBe("maintenance");
    expect(apiMaintenance.tipo_intervento).toBe("manutenzione");
  });
});
```

## 🔍 Type Safety Best Practices

### Strict Typing
- Evitare `any` type
- Usare `unknown` per dati non tipati
- Type guards per runtime type checking
- Discriminated unions per stati mutualmente esclusivi

### Utility Types Usage
```typescript
// Leverage TypeScript utility types
export type PartialUser = Partial<User>;
export type RequiredProduct = Required<Product>;
export type ProductKeys = keyof Product;
export type UserRoles = User['role'];
export type MaintenanceType = Maintenance['tipo_intervento'];

// Pick and Omit for API types
export type PublicUser = Omit<User, 'email' | 'isActive'>;
export type ProductSummary = Pick<Product, 'id' | 'tipo_segnale' | 'anno' | 'qr_code'>;
```