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
```typescript
export interface Maintenance {
  id: string;                    // UUID identificativo
  productId: string;             // Reference a Product
  
  // Tipo intervento (enum-like)
  tipo_intervento: 'installazione' | 'manutenzione' | 'sostituzione' | 'verifica' | 'dismissione';
  
  // Documentazione intervento
  note?: string;                 // Note descrittive (opzionali)
  foto_urls: string[];           // Array URL foto documentazione
  
  // Execution details
  userId: string;                // Reference a User che ha eseguito
  
  // Geolocalizzazione intervento
  gps_lat?: number;             // Latitudine GPS (opzionale)
  gps_lng?: number;             // Longitudine GPS (opzionale)
  
  // Metadata
  createdAt: string;            // ISO timestamp esecuzione
}
```

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