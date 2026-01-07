# CLAUDE.md - /src/app/api

Directory delle API routes di Next.js 15 per l'applicazione CertificablePlus.

## 📁 Struttura

```
api/
├── auth/                    # ✨ Authentication endpoints
│   ├── register/           # User registration
│   ├── login/              # User authentication
│   ├── me/                 # Get current user
│   ├── refresh/            # Token refresh
│   ├── logout/             # User logout
│   └── test-credentials.http  # REST Client test file
└── products/               # Product management endpoints
    └── route.ts            # CRUD operations with QR code integration
```

## 🔐 Authentication System

### Sistema di Autenticazione Implementato

**Status**: ✅ **Completamente implementato** - Sistema auth mock pronto per migrazione a auth reale

**Caratteristiche**:
- Mock authentication per sviluppo rapido
- JWT token generation (access + refresh tokens)
- Role-based access control (company, employee, viewer)
- Protected routes con middleware
- Token expiration e refresh automatico
- Tutti gli utenti usano password: `password123`

### Endpoints Disponibili

#### POST /api/auth/register
**Descrizione**: Registrazione nuovo utente con validazione completa

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name",
  "role": "employee",  // "company" | "employee" | "viewer"
  "companyId": "company-1"
}
```

**Response Success** (200):
```json
{
  "status_code": 200,
  "message": "User registered successfully",
  "payload": {
    "data": {
      "user": {
        "id": "user-123",
        "email": "user@example.com",
        "name": "User Name",
        "role": "employee",
        "companyId": "company-1"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

**Validazioni**:
- ✅ Email format validation
- ✅ Email uniqueness check
- ✅ Password min length (6 caratteri)
- ✅ Role validation (company, employee, viewer)
- ✅ Required fields check

---

#### POST /api/auth/login
**Descrizione**: Autenticazione utente con credenziali

**Request Body**:
```json
{
  "email": "mario.rossi@segnaletica.it",
  "password": "password123"
}
```

**Response Success** (200):
```json
{
  "status_code": 200,
  "message": "Login successful",
  "payload": {
    "data": {
      "user": {
        "id": "user-1",
        "email": "mario.rossi@segnaletica.it",
        "name": "Mario Rossi",
        "role": "company",
        "companyId": "company-1"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

**Token Info**:
- **Access Token**: Expira dopo 24 ore
- **Refresh Token**: Expira dopo 7 giorni
- **Formato**: JWT con userId, email, role, companyId

**Credenziali Test Disponibili**:
```bash
# Company Users
mario.rossi@segnaletica.it | password123
giulia.ferrari@milanosafety.com | password123

# Employee Users
giuseppe.verdi@segnaletica.it | password123
laura.conti@segnaletica.it | password123

# Viewer Users
luca.observer@demo.com | password123
```

---

#### GET /api/auth/me
**Descrizione**: Ottieni dati utente autenticato corrente

**Headers Required**:
```http
Authorization: Bearer <access_token>
```

**Response Success** (200):
```json
{
  "status_code": 200,
  "message": "User retrieved successfully",
  "payload": {
    "data": {
      "id": "user-1",
      "email": "mario.rossi@segnaletica.it",
      "name": "Mario Rossi",
      "role": "company",
      "companyId": "company-1",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

**Errori Comuni**:
- `401`: Missing/invalid Authorization header
- `401`: Invalid or expired token
- `404`: User not found
- `403`: User account inactive

---

#### POST /api/auth/refresh
**Descrizione**: Rinnova access token usando refresh token

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response Success** (200):
```json
{
  "status_code": 200,
  "message": "Token refreshed successfully",
  "payload": {
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

**Token Rotation**:
- Nuovo access token generato (24h expiration)
- Nuovo refresh token generato (7d expiration)
- Vecchi token invalidati automaticamente

---

#### POST /api/auth/logout
**Descrizione**: Logout utente e invalidazione token

**Headers Required**:
```http
Authorization: Bearer <access_token>
```

**Response Success** (200):
```json
{
  "status_code": 200,
  "message": "Logout successful. Please clear local tokens.",
  "payload": { "data": null }
}
```

**Note**:
- Client deve rimuovere tokens da localStorage/AsyncStorage
- Mock implementation: token non viene blacklisted (production: Redis blacklist)
- Logout sempre successful anche con token invalido (per permettere client cleanup)

---

## 🔧 Authentication Middleware

### Utility Functions per Route Protection

**File**: `/src/lib/auth-middleware.ts`

#### `requireAuth(request)`
Richiede autenticazione valida, ritorna User object o errore

**Utilizzo**:
```typescript
import { requireAuth } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);

  if (!authResult.success) {
    return authResult.error; // NextResponse con 401/403/404
  }

  const user = authResult.data; // User object
  // ... logica protetta
}
```

---

#### `requireRole(request, allowedRoles)`
Richiede autenticazione + ruolo specifico

**Utilizzo**:
```typescript
import { requireRole } from '@/lib/auth-middleware';

export async function POST(request: NextRequest) {
  // Solo company e employee possono creare prodotti
  const authResult = await requireRole(request, ['company', 'employee']);

  if (!authResult.success) {
    return authResult.error;
  }

  const user = authResult.data;
  // ... logica per company/employee
}
```

---

#### `requireCompanyAccess(request, resourceCompanyId)`
Verifica che utente possa accedere a risorse della propria azienda

**Utilizzo**:
```typescript
import { requireCompanyAccess } from '@/lib/auth-middleware';

export async function PUT(request: NextRequest) {
  const productCompanyId = "company-1"; // da database

  const authResult = await requireCompanyAccess(request, productCompanyId);

  if (!authResult.success) {
    return authResult.error; // 403 se company diversa
  }

  // ... utente può modificare risorsa
}
```

---

#### `optionalAuth(request)`
Autenticazione opzionale, ritorna User | null

**Utilizzo**:
```typescript
import { optionalAuth } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  const user = await optionalAuth(request);

  if (user) {
    // Logica per utente autenticato
    // Es: filtra per company
  } else {
    // Logica pubblica
    // Es: mostra tutti i dati
  }
}
```

---

## 📦 Products API

### ⚠️ Current Hybrid Architecture

**Status**: Architettura ibrida in fase di sviluppo con limitazioni note.

**Data Source Strategy**:
- **GET /api/products**: ✅ External API proxy (Geosign API) - Production ready
- **POST /api/products**: ✅ External API proxy + QR generation - Production ready
- **PUT /api/products**: ⚠️ Mock data operations - Development only
- **DELETE /api/products**: ⚠️ Mock data operations - Development only

**Known Limitations**:
1. **State Divergence**: Products created via POST → External API, but PUT/DELETE modify local mock data
2. **Data Consistency**: External API state ≠ mock data state
3. **Testing Constraints**: Full CRUD lifecycle testing limitato
4. **Production Blocker**: PUT/DELETE non utilizzabili in produzione senza migrazione

**Why This Design?**:
- External API (Geosign) non fornisce ancora PUT/DELETE endpoints
- Mock data permette sviluppo frontend completo senza bloccare il team
- Migration path chiaro verso full API integration

**Migration Roadmap**:
```
Phase 1 (Current): GET/POST → API, PUT/DELETE → Mock ✅
Phase 2 (Q2 2025): Geosign API implements PUT/DELETE
Phase 3 (Q2 2025): Migrate PUT/DELETE to full API proxy
Phase 4 (Q3 2025): Remove mock data dependencies
Phase 5 (Q3 2025): Add Redis caching layer
```

**Immediate Actions Required**:
- ⚠️ Non utilizzare PUT/DELETE in produzione
- ⚠️ Testare solo su development environment
- ✅ Coordinare con Geosign team per API completion timeline
- ✅ Monitorare state divergence durante development

---

### Protected Endpoints con Authentication

**File**: `/src/app/api/products/route.ts`

#### GET /api/products
**Auth**: ✅ Optional (pubblica con filtri automatici per utenti autenticati)

**Behavior**:
- **Public**: Ritorna tutti i prodotti
- **Authenticated (company/employee)**: Filtra per companyId automaticamente
- **Authenticated (viewer)**: Accesso completo a tutti i prodotti

**Query Params**:
- `companyId`: Filter by company (ignored se autenticato come company/employee)
- `tipo_segnale`: Filter by signal type
- `search`: Search in forma, qr_code, wl

**Example**:
```bash
# Public access
curl http://localhost:3000/api/products

# Authenticated company user (auto-filtered by company)
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/products
```

---

#### POST /api/products
**Auth**: ✅ Required - Roles: `company`, `employee`

**Features**:
- Automatic QR code generation
- CompanyId e createdBy presi da user autenticato
- Base64 QR image per backend storage
- ✅ **signal_category support** (optional field with automatic fallback)

**Field Mapping**:
- `signal_type` → `tipologia_segnale` (required: "permanent" or "temporary")
- `signal_category` → `tipo_segnale` (optional: descriptive text, fallback to signal_type)
- External API schema uses English field names
- Internal Product type uses Italian field names

**Required Fields**:
- `qr_code`, `signal_type`, `production_year`, `shape`

**Optional Fields**:
- `signal_category` (if omitted, defaults to signal_type value)
- `dimension`, `wl_code`, `support_material`, `support_thickness`, `fixation_class`, `fixation_method`

**Example**:
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "qr_code": "QR12345",
    "signal_type": "permanent",
    "signal_category": "Pericolo - Curva pericolosa",
    "production_year": 2024,
    "shape": "Triangolare",
    "dimension": "90x90cm",
    "wl_code": "WL001",
    "support_material": "Alluminio",
    "support_thickness": "2",
    "fixation_class": "Classe II",
    "fixation_method": "Tasselli"
  }'
```

**Response**:
```json
{
  "success": true,
  "data": {
    "product": {
      "id": "uuid-...",
      "qr_code": "QR1703123456",
      "tipologia_segnale": "permanent",
      "tipo_segnale": "Pericolo - Curva pericolosa",
      "anno": 2024,
      "forma": "Triangolare",
      "dimensioni": "90x90cm",
      "asset_id": 123,
      "metadata_cid": "ipfs://...",
      ...
    },
    "qr_image_base64": "data:image/png;base64,...",
    "qr_url": "http://localhost:3000/public/product/QR1703123456"
  },
  "message": "Product created successfully and tokenized on blockchain"
}
```

**Error Responses**:
- `400`: Missing required fields or duplicate SHA-256
- `401`: Missing/invalid authentication token
- `403`: Insufficient permissions
- `500`: External API error or internal server error

---

#### PUT /api/products
**Auth**: ✅ Required - Role: `company` only

**Features**:
- Solo company users possono aggiornare
- Verifica che prodotto appartenga alla company dell'utente
- QR code preservato (non modificabile)

**Example**:
```bash
curl -X PUT http://localhost:3000/api/products \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "product-1",
    "dimensioni": "100x100cm"
  }'
```

---

#### DELETE /api/products
**Auth**: ✅ Required - Role: `company` only

**Features**:
- Solo company users possono eliminare
- Verifica ownership (solo prodotti della propria company)

**Example**:
```bash
curl -X DELETE "http://localhost:3000/api/products?id=product-1" \
  -H "Authorization: Bearer <token>"
```

---

## 🔧 Maintenance API

### Overview

**Status**: ✅ **Fully implemented** - GET and POST using external API

**Data Source Strategy**:
- **GET /api/maintenance**: ✅ External API proxy (Geosign API) - Production ready
- **POST /api/maintenance**: ✅ External API proxy with blockchain integration - Production ready

**Known Limitations**:
1. **GET Endpoint**: External API response may be missing `product_uuid` field for some records
2. **Fallback**: api-mapping.ts includes automatic fallback UUID for compatibility (line 187)
3. **Note**: If product linking shows "N/A", backend needs to include product_uuid in response

---

### Protected Endpoints

#### GET /api/maintenance
**Auth**: ✅ Optional (pubblica con filtri automatici per utenti autenticati)

**Features**:
- Fetches all maintenance records from external Geosign API
- Automatic data mapping from external schema to internal schema
- GPS coordinate parsing (handles both string and number formats)
- Intervention type normalization (installation/maintenance/verification/dismissal/replacement)
- Fallback productId for records missing product_uuid

**Response Format**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "productId": "product-uuid",
      "tipo_intervento": "installazione",
      "intervention_type": "installation",
      "gps_lat": 45.464664,
      "gps_lng": 9.188540,
      "anno": 2024,
      "causale": "Nuova installazione",
      "certificato_numero": "CERT-2024-001",
      "companyId": "company-1",
      "createdAt": "2024-12-21T10:00:00Z"
    }
  ],
  "total": 1,
  "message": "Maintenance records retrieved successfully"
}
```

**Example**:
```bash
# Public access - all records
curl http://localhost:3000/api/maintenance

# Authenticated company user (future: filtered by company)
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/maintenance
```

---

#### POST /api/maintenance
**Auth**: ⚠️ No auth currently (development) - TODO: Add `company`, `employee` role requirement

**Features**:
- Creates maintenance record on blockchain (Algorand)
- Links maintenance to product via product_uuid
- Updates product's metadata CID
- Returns asset_id, metadata_cid, transaction_id
- GPS coordinates with 6 decimal precision

**Field Mapping**:
- `intervention_type` → `tipo_intervento` (required: installation/maintenance/verification/dismissal/replacement)
- `gps_lat`/`gps_lng` → String with 6 decimals (required)
- `year` → `anno` (optional: integer, defaults to current year)
- `poles_number` → `tipologia_installazione` (optional: integer)
- `company_id` → `companyId` (required)
- `certificate_number` → `certificato_numero` (required)
- `reason` → `causale` (required)
- `notes` → `note` (required)
- `product_uuid` → `productId` (required: links to product)

**Required Fields**:
- `intervention_type`, `gps_lat`, `gps_lng`, `company_id`, `certificate_number`, `reason`, `notes`, `product_uuid`

**Optional Fields**:
- `year` (defaults to current year)
- `poles_number` (integer for installation type)

**Example**:
```bash
curl -X POST http://localhost:3000/api/maintenance \
  -H "Content-Type: application/json" \
  -d '{
    "intervention_type": "installation",
    "gps_lat": "45.464664",
    "gps_lng": "9.188540",
    "year": 2024,
    "poles_number": 2,
    "company_id": "company-1",
    "certificate_number": "CERT-2024-001",
    "reason": "Nuova installazione segnale stradale",
    "notes": "Installato in via Roma 123, Milano",
    "product_uuid": "a665a0ee-267e-4fc7-8395-8d8b893c781f"
  }'
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "maintenance-uuid-...",
    "product_uuid": "a665a0ee-267e-4fc7-8395-8d8b893c781f",
    "intervention_type": "installation",
    "tipo_intervento": "installazione",
    "gps_lat": "45.464664",
    "gps_lng": "9.188540",
    "year": 2024,
    "anno": 2024,
    "poles_number": 2,
    "tipologia_installazione": "2-pali",
    "company_id": "company-1",
    "companyId": "company-1",
    "certificate_number": "CERT-2024-001",
    "certificato_numero": "CERT-2024-001",
    "reason": "Nuova installazione segnale stradale",
    "causale": "Nuova installazione segnale stradale",
    "notes": "Installato in via Roma 123, Milano",
    "note": "Installato in via Roma 123, Milano",
    "asset_id": 456,
    "metadata_cid": "ipfs://Qm...",
    "transaction_id": "TXID...",
    "createdAt": "2024-12-21T14:30:00Z"
  },
  "message": "Maintenance record created successfully and recorded on blockchain"
}
```

**Error Responses**:
- `400`: Missing required fields
- `400`: Duplicate SHA-256 (identical maintenance already exists)
- `400`: Product UUID not found
- `500`: External API error or blockchain integration failure

**Blockchain Integration**:
1. Creates Algorand asset for maintenance record
2. Stores metadata on IPFS (intervention details, GPS, timestamps)
3. Updates linked product's metadata CID with new maintenance reference
4. Returns transaction_id for blockchain verification

**GPS Coordinate Format**:
- API expects String format with 6 decimal precision
- Example: `"45.464664"` (not float)
- Automatic conversion: `parseFloat(input).toFixed(6)`

---

## 🧪 Testing

### REST Client Test File

**File**: `/src/app/api/auth/test-credentials.http`

**Utilizzo**:
1. Installa extension "REST Client" in VS Code
2. Apri il file `.http`
3. Clicca "Send Request" sopra ogni richiesta
4. Copia token dalle response e aggiorna variabili

**Test Workflow Completo**:
```http
### 1. Register new user
POST {{baseUrl}}/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123",
  "name": "Test User",
  "role": "employee",
  "companyId": "company-1"
}

### 2. Login
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}

### 3. Get profile (copy token from login)
GET {{baseUrl}}/auth/me
Authorization: Bearer <PASTE_TOKEN_HERE>

### 4. Refresh token
POST {{baseUrl}}/auth/refresh
Content-Type: application/json

{
  "refreshToken": "<PASTE_REFRESH_TOKEN>"
}

### 5. Logout
POST {{baseUrl}}/auth/logout
Authorization: Bearer <TOKEN>
```

---

## 📊 Response Format Standard

### Success Response
```json
{
  "status_code": 200,
  "message": "Operation successful",
  "payload": {
    "data": { /* actual data */ }
  }
}
```

### Error Response
```json
{
  "status_code": 400,
  "message": "Error description",
  "payload": { "data": null }
}
```

### Status Codes
- `200`: Success
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

---

## 🚀 Migration Path: Mock → Real Auth

### Current Implementation (Mock)
- JWT tokens mock (no real signing)
- Password validation hardcoded (`password123`)
- No password hashing
- No token blacklisting
- Users in mock-data.ts

### Production Migration Steps

#### 1. Install Dependencies
```bash
npm install bcrypt jsonwebtoken @types/bcrypt @types/jsonwebtoken
npm install redis ioredis  # For token blacklist
```

#### 2. Replace JWT Generation
```typescript
// Replace mock functions with:
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

function generateJWT(user: User): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}
```

#### 3. Add Password Hashing
```typescript
import bcrypt from 'bcrypt';

// Register
const hashedPassword = await bcrypt.hash(password, 10);
// Save hashedPassword to database

// Login
const isValid = await bcrypt.compare(password, user.passwordHash);
```

#### 4. Implement Token Blacklist
```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Logout
await redis.setex(
  `blacklist:${token}`,
  tokenExpirationSeconds,
  'true'
);

// Middleware check
const isBlacklisted = await redis.get(`blacklist:${token}`);
if (isBlacklisted) {
  return unauthorized();
}
```

#### 5. Connect Real Database
```typescript
// Replace mockUsers with PostgreSQL queries
import { db } from '@/lib/database';

const user = await db.user.findUnique({
  where: { email }
});
```

#### 6. Environment Variables
```bash
# .env.production
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgresql://user:pass@localhost:5432/db
```

---

## 🔒 Security Best Practices

### Implemented ✅
- JWT token expiration (24h access, 7d refresh)
- Role-based access control
- Authorization header validation
- User active status check
- Company resource isolation

### Production TODO 🔄
- [ ] HTTPS only in production
- [ ] Rate limiting (express-rate-limit)
- [ ] Password hashing with bcrypt
- [ ] JWT signing con secrets reali
- [ ] Token blacklist con Redis
- [ ] CORS configuration
- [ ] HTTP-only cookies per refresh tokens
- [ ] 2FA authentication option
- [ ] Password reset con email verification
- [ ] Account lockout dopo failed attempts
- [ ] Security headers (helmet.js)
- [ ] Input sanitization avanzata
- [ ] SQL injection prevention
- [ ] XSS protection

---

## 📝 Development Guidelines

### Adding New Protected Endpoint

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireRole } from '@/lib/auth-middleware';

export async function POST(request: NextRequest) {
  // Step 1: Check authentication
  const authResult = await requireRole(request, ['company']);

  if (!authResult.success) {
    return authResult.error;
  }

  const user = authResult.data;

  // Step 2: Your business logic
  const body = await request.json();

  // Step 3: Verify resource ownership
  if (resource.companyId !== user.companyId) {
    return NextResponse.json(
      {
        status_code: 403,
        message: 'Access denied',
        payload: { data: null }
      },
      { status: 403 }
    );
  }

  // Step 4: Perform operation
  // ...

  return NextResponse.json({
    status_code: 200,
    message: 'Success',
    payload: { data: result }
  });
}
```

### Error Handling Pattern
```typescript
try {
  // Operation
} catch (error) {
  console.error('API Error:', error);
  return NextResponse.json(
    {
      status_code: 500,
      message: 'Internal server error',
      payload: { data: null }
    },
    { status: 500 }
  );
}
```

---

## 📚 References

- **AUTHENTICATION-GUIDE.md**: Guida completa sistema auth mock + backend integration
- **Next.js API Routes**: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- **JWT Best Practices**: https://jwt.io/introduction
- **OWASP Authentication**: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html