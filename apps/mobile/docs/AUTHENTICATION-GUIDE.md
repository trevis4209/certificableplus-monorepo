# Guida Completa - Sistema di Autenticazione Mock + API Backend

**Versione**: 1.0.0
**Data**: 30 Settembre 2025
**Autore**: Claude Code Assistant

---

## 📋 Indice

1. [Panoramica Sistema](#panoramica-sistema)
2. [Architettura](#architettura)
3. [Setup Iniziale](#setup-iniziale)
4. [Mock Authentication](#mock-authentication)
5. [Backend API Integration](#backend-api-integration)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [Migrazione a Auth Reale](#migrazione-a-auth-reale)
9. [Troubleshooting](#troubleshooting)
10. [FAQ](#faq)

---

## 📊 Panoramica Sistema

### Cos'è questo sistema?

Questo progetto implementa un **sistema ibrido di autenticazione** che permette lo sviluppo frontend completo anche senza un backend di autenticazione funzionante.

### Componenti Principali

1. **Mock Authentication** (Locale)
   - Login/logout simulati
   - Gestione sessione con AsyncStorage
   - Token JWT fittizi
   - 18+ utenti test con ruoli diversi

2. **Backend API Real** (Remoto)
   - Chiamate API reali a `https://api-dev.geosign.toknox.com`
   - Autenticazione con API Key
   - Endpoints prodotti e manutenzioni
   - Integrazione blockchain Algorand

### Vantaggi

✅ **Sviluppo rapido**: Frontend completamente funzionale senza attendere backend auth
✅ **Testing semplice**: Credenziali note per test immediati
✅ **Facile transizione**: Switch a auth reale con un solo flag
✅ **Zero breaking changes**: Backend API già integrato e funzionante

---

## 🏗️ Architettura

### Diagramma Flusso

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND APP                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐      ┌──────────────┐                   │
│  │  Login UI    │─────▶│ AuthContext  │                   │
│  │ (login.tsx)  │      │              │                   │
│  └──────────────┘      └──────┬───────┘                   │
│                                │                            │
│                                ▼                            │
│                    ┌────────────────────┐                  │
│                    │  auth-service.ts   │                  │
│                    │                    │                  │
│                    │ if USE_MOCK_AUTH   │                  │
│                    └─────┬──────┬───────┘                  │
│                          │      │                          │
│              ┌───────────┘      └──────────┐               │
│              │                              │               │
│              ▼                              ▼               │
│    ┌──────────────────┐          ┌──────────────────┐    │
│    │ mock-auth-service│          │ Real Auth (future)│    │
│    │                  │          │                   │    │
│    │ - mockUsers      │          │ - JWT Backend     │    │
│    │ - Local tokens   │          │ - OAuth          │    │
│    │ - AsyncStorage   │          │ - 2FA            │    │
│    └──────────────────┘          └──────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                               │
                               │ API Calls
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND API                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Headers: {                                                 │
│    'Content-Type': 'application/json',                     │
│    'x-api-key': 'Dm6hNW...'                                │
│  }                                                          │
│                                                             │
│  Endpoints:                                                 │
│  - GET  /product          → Lista prodotti                 │
│  - POST /product/create   → Crea prodotto + blockchain     │
│  - GET  /maintenance      → Lista manutenzioni             │
│  - POST /maintenance/create → Crea manutenzione + blockchain│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### File Structure

```
certificableplus-app/
├── .env                                    # ⚙️ Environment variables
│   ├── EXPO_PUBLIC_API_URL                # Backend URL
│   ├── EXPO_PUBLIC_API_KEY                # API Key authentication
│   └── EXPO_PUBLIC_USE_MOCK_AUTH          # Mock auth flag
│
├── lib/
│   ├── auth-service.ts                    # 🔐 Auth service (switch mock/real)
│   ├── mock-auth-service.ts               # 🎭 Mock authentication
│   └── api/
│       ├── backend.ts                     # 📡 Backend API client
│       └── mappers.ts                     # 🔄 Type conversions
│
├── contexts/
│   └── AuthContext.tsx                    # 🌐 Global auth state
│
├── app/(auth)/
│   └── login.tsx                          # 📱 Login screen
│
└── lib/mock-data.ts                       # 📊 Test data (18+ users)
```

---

## 🚀 Setup Iniziale

### Step 1: Clonare il Repository

```bash
git clone <repository-url>
cd App-CertPlus-1
```

### Step 2: Installare Dipendenze

```bash
npm install
# o
yarn install
```

### Step 3: Configurare Environment Variables

Copia `.env.example` a `.env`:

```bash
cp .env.example .env
```

Modifica `.env` con le tue configurazioni:

```bash
# Backend API Configuration
EXPO_PUBLIC_API_URL=https://api-dev.geosign.toknox.com

# Backend API Key Authentication
EXPO_PUBLIC_API_KEY=Dm6hNWqD0T64hBpvlwmOB3WC2cBEEmFAa2C3ETz4

# Authentication Mode (true = mock, false = real backend auth)
EXPO_PUBLIC_USE_MOCK_AUTH=true

# Google Maps API Key (opzionale per mappe)
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### Step 4: Avviare il Server di Sviluppo

```bash
# Start Expo development server
npx expo start

# Con cache pulita (consigliato dopo modifica .env)
npx expo start --clear
```

### Step 5: Scegliere Piattaforma

Dalla console Expo, premi:
- `a` - Android emulator
- `i` - iOS simulator
- `w` - Web browser

---

## 🎭 Mock Authentication

### Come Funziona

Il mock authentication service simula un sistema di autenticazione completo **interamente lato client**, senza fare chiamate a un backend di autenticazione.

### File Principali

#### `lib/mock-auth-service.ts`

**Responsabilità**:
- Validare credenziali contro `mockUsers`
- Generare token JWT fittizi
- Gestire sessione con AsyncStorage
- Simulare delay realistici (500ms)

**Metodi Principali**:

```typescript
class MockAuthService {
  // Login con validazione credenziali
  async login(credentials: LoginCredentials): Promise<User>

  // Logout con pulizia AsyncStorage
  async logout(): Promise<void>

  // Get current user da cache/storage
  async getCurrentUser(): Promise<User | null>

  // Check se autenticato
  isAuthenticated(): boolean

  // Get token mock
  getToken(): string | null
}
```

### Utenti Test Disponibili

Tutti gli utenti hanno password: **`password123`**

#### Company Users (Managers)

| Email | Nome | Ruolo | Company |
|-------|------|-------|---------|
| `mario.rossi@segnaletica.it` | Mario Rossi | company | Segnaletica Stradale SRL |
| `giulia.ferrari@milanosafety.com` | Giulia Ferrari | company | Milano Traffic Solutions |
| `antonio.bianchi@sicurezzatorino.it` | Antonio Bianchi | company | Sicurezza Urbana Torino |
| `francesca.romano@romanasegnali.it` | Francesca Romano | company | Romana Segnali |
| `marco.veneziani@veneziasafety.com` | Marco Veneziani | company | Venezia Maritime Safety |

#### Employee Users (Operatori)

| Email | Nome | Ruolo | Company |
|-------|------|-------|---------|
| `giuseppe.verdi@segnaletica.it` | Giuseppe Verdi | employee | Segnaletica Stradale SRL |
| `laura.conti@segnaletica.it` | Laura Conti | employee | Segnaletica Stradale SRL |
| `alessandro.milani@milanosafety.com` | Alessandro Milani | employee | Milano Traffic Solutions |
| `stefania.lombardi@milanosafety.com` | Stefania Lombardi | employee | Milano Traffic Solutions |
| `roberto.torinese@sicurezzatorino.it` | Roberto Torinese | employee | Sicurezza Urbana Torino |

#### Viewer Users (Solo Lettura)

| Email | Nome | Ruolo |
|-------|------|-------|
| `luca.observer@demo.com` | Luca Observer | viewer |
| `maria.controller@audit.gov` | Maria Controller | viewer |

### Test Login

1. Apri l'app
2. Nella schermata login vedrai un **banner blu** con credenziali test
3. Clicca "Usa credenziali test" per auto-compilare
4. Oppure inserisci manualmente:
   - Email: `mario.rossi@segnaletica.it`
   - Password: `password123`
5. Premi "Accedi"

**Risultato atteso**:
- ✅ Login immediato (500ms delay simulato)
- ✅ Redirect a schermata principale `/(tabs)`
- ✅ Token salvato in AsyncStorage
- ✅ User data caricato in AuthContext

### Persistenza Sessione

Il mock auth salva i dati in AsyncStorage:

```typescript
// Keys utilizzate
'mockAuthToken'        // Token JWT fittizio
'mockRefreshToken'     // Refresh token fittizio
'mockCurrentUser'      // Dati utente JSON
```

**Comportamento**:
- App chiusa e riaperta → Rimani loggato
- Logout → Tutti i dati cancellati da AsyncStorage
- Token non scadono mai (mock mode)

---

## 📡 Backend API Integration

### Configurazione API Client

#### Base URL
```
https://api-dev.geosign.toknox.com
```

#### `lib/api/backend.ts`

**Headers Inviati**:

```typescript
{
  'Content-Type': 'application/json',
  'x-api-key': 'Dm6hNWqD0T64hBpvlwmOB3WC2cBEEmFAa2C3ETz4'
}
```

**Note importanti**:
- ✅ **API Key obbligatoria** per tutti gli endpoint tranne `/status`
- ✅ **Header name**: `x-api-key` (lowercase con trattino)
- ❌ **NO Authorization JWT header** (non ancora implementato dal backend)
- ℹ️ **User ID**: Usa `created_by` field nelle request

### 🔐 Authentication

#### Header Richiesto

```http
x-api-key: Dm6hNWqD0T64hBpvlwmOB3WC2cBEEmFAa2C3ETz4
```

**Applicato a**:
- ✅ Tutti gli endpoint API
- ❌ Escluso: `/status` (endpoint pubblico per health check)

**Formato Request**:
```bash
curl -X GET "https://api-dev.geosign.toknox.com/product" \
  -H "x-api-key: Dm6hNWqD0T64hBpvlwmOB3WC2cBEEmFAa2C3ETz4"
```

### 📦 Product Endpoints

#### Caratteristiche Speciali

**Blockchain Integration**:
- 🔗 **Algorand Asset**: Ogni prodotto viene tokenizzato sulla blockchain Algorand
- 📂 **IPFS Storage**: Metadata salvati su IPFS con CID univoco
- 🔒 **SHA-256 Digest**: Prevenzione duplicati tramite hash prodotto
- 🆔 **Asset ID**: ID univoco sulla blockchain Algorand

### Endpoints Disponibili

#### 1. GET /product - Get All Products

**Descrizione**: Recupera tutti i prodotti dal database con informazioni complete di tokenizzazione blockchain.

**URL**: `/product`

**Method**: `GET`

**Headers Richiesti**:
```http
x-api-key: Dm6hNWqD0T64hBpvlwmOB3WC2cBEEmFAa2C3ETz4
```

**Request**:
```bash
curl -X GET "https://api-dev.geosign.toknox.com/product" \
  -H "x-api-key: Dm6hNWqD0T64hBpvlwmOB3WC2cBEEmFAa2C3ETz4"
```

**Response** (200 OK):
```json
{
  "status_code": 200,
  "message": "Products Successfully retrieved.",
  "payload": {
    "data": [
      {
        "uuid": "8f7e9d2a-3c4b-4a1e-9f8d-7c6b5a4e3d2c",
        "qr_code": "CERT-2024-MI-001",
        "signal_type": "Pericolo - Lavori in corso",
        "production_year": 2024,
        "shape": "Triangolare",
        "dimension": "90x90cm",
        "wl_code": "WL-A12",
        "support_material": "Alluminio spessore 25/10",
        "support_thickness": "2.5mm",
        "fixation_class": "Classe RA2",
        "fixation_method": "Palo sostegno diametro 60mm",
        "created_by": "user-1",
        "created_at": "2024-09-29T10:30:00.000Z"
      }
    ]
  }
}
```

**Response Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | UUID univoco prodotto (generato dal backend) |
| `qr_code` | string | Codice QR univoco per identificazione fisica |
| `signal_type` | string | Tipologia segnale (Pericolo, Obbligo, Divieto, ecc.) |
| `production_year` | integer | Anno di produzione/installazione |
| `shape` | string | Forma geometrica (Triangolare, Circolare, Rettangolare) |
| `dimension` | string | Dimensioni fisiche (es. "90x90cm") |
| `wl_code` | string | Codice WL identificativo (opzionale) |
| `support_material` | string | Materiale supporto (Alluminio, PVC, etc.) |
| `support_thickness` | string | Spessore supporto (es. "2.5mm") |
| `fixation_class` | string | Classe fissaggio/pellicola retroriflettente |
| `fixation_method` | string | Metodo di fissaggio (Palo, Parete, etc.) |
| `created_by` | string | User ID che ha creato il prodotto |
| `created_at` | string | Timestamp ISO 8601 creazione |

**Frontend Usage**:
```typescript
import { backendAPI } from '@/lib/api/backend';
import { mapProductDataToProduct } from '@/lib/api/mappers';

// Get all products
const productsData = await backendAPI.getAllProducts();

// Map to frontend types
const products = productsData.map(p =>
  mapProductDataToProduct(p, user.companyId)
);

console.log(`Loaded ${products.length} products`);
```

**Note**:
- Ritorna **tutti** i prodotti nel database (nessuna paginazione al momento)
- I prodotti sono già tokenizzati su Algorand blockchain
- Per dettagli blockchain usa asset_id e metadata_cid (non inclusi in questa response)

#### 2. POST /product/create - Tokenize Product

**Descrizione**: Crea un nuovo prodotto, calcola SHA-256 digest, salva metadata su IPFS e crea asset su blockchain Algorand.

**URL**: `/product/create`

**Method**: `POST`

**Headers Richiesti**:
```http
x-api-key: Dm6hNWqD0T64hBpvlwmOB3WC2cBEEmFAa2C3ETz4
Content-Type: application/json
```

**Request Body**:
```json
{
  "qr_code": "string",
  "signal_type": "string",
  "production_year": "integer",
  "shape": "string",
  "dimension": "string",
  "wl_code": "string (optional)",
  "support_material": "string",
  "support_thickness": "string",
  "fixation_class": "string",
  "fixation_method": "string",
  "created_by": "string"
}
```

**Request Body Fields**:

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `qr_code` | string | ✅ Yes | Codice QR univoco | `"CERT-2024-MI-001"` |
| `signal_type` | string | ✅ Yes | Tipo segnale | `"Pericolo - Lavori in corso"` |
| `production_year` | integer | ✅ Yes | Anno produzione | `2024` |
| `shape` | string | ✅ Yes | Forma | `"Triangolare"` |
| `dimension` | string | ✅ Yes | Dimensioni | `"90x90cm"` |
| `wl_code` | string | ❌ No | Codice WL | `"WL-A12"` |
| `support_material` | string | ✅ Yes | Materiale supporto | `"Alluminio spessore 25/10"` |
| `support_thickness` | string | ✅ Yes | Spessore | `"2.5mm"` |
| `fixation_class` | string | ✅ Yes | Classe fissaggio | `"Classe RA2"` |
| `fixation_method` | string | ✅ Yes | Metodo fissaggio | `"Palo sostegno diametro 60mm"` |
| `created_by` | string | ✅ Yes | User ID creatore | `"user-1"` |

**Request Example**:
```bash
curl -X POST "https://api-dev.geosign.toknox.com/product/create" \
  -H "x-api-key: Dm6hNWqD0T64hBpvlwmOB3WC2cBEEmFAa2C3ETz4" \
  -H "Content-Type: application/json" \
  -d '{
    "qr_code": "CERT-2024-MI-001",
    "signal_type": "Pericolo - Lavori in corso",
    "production_year": 2024,
    "shape": "Triangolare",
    "dimension": "90x90cm",
    "wl_code": "WL-A12",
    "support_material": "Alluminio spessore 25/10",
    "support_thickness": "2.5mm",
    "fixation_class": "Classe RA2",
    "fixation_method": "Palo sostegno diametro 60mm",
    "created_by": "user-1"
  }'
```

**Response** (200 OK):
```json
{
  "status_code": 200,
  "message": "Product Successfully Created and Tokenized.",
  "payload": {
    "data": {
      "uuid": "8f7e9d2a-3c4b-4a1e-9f8d-7c6b5a4e3d2c",
      "signal_type": "Pericolo - Lavori in corso",
      "asset_id": 123456789,
      "metadata_cid": "QmX5ZzPxvxhwYnN3aR8dKjT9qLmP2sW4vB6cN7eM8fG1hJ"
    }
  }
}
```

**Response Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | UUID univoco prodotto generato |
| `signal_type` | string | Tipo segnale (echo della request) |
| `asset_id` | integer | **Algorand Asset ID** sulla blockchain |
| `metadata_cid` | string | **IPFS CID** per i metadata del prodotto |

**Response** (400 Bad Request) - Duplicate:
```json
{
  "status_code": 400,
  "message": "Product with this SHA-256 already exists",
  "payload": {
    "data": null
  }
}
```

**Frontend Usage**:
```typescript
import { backendAPI } from '@/lib/api/backend';
import { mapProductToCreateRequest } from '@/lib/api/mappers';

// Frontend product object
const product = {
  qr_code: 'CERT-2024-MI-001',
  tipo_segnale: 'Pericolo - Lavori in corso',
  anno: 2024,
  forma: 'Triangolare',
  dimensioni: '90x90cm',
  wl: 'WL-A12',
  materiale_supporto: 'Alluminio spessore 25/10',
  spessore_supporto: 2.5,
  materiale_pellicola: 'Classe RA2',
  fissaggio: 'Palo sostegno diametro 60mm'
};

// Map to backend format
const request = mapProductToCreateRequest(product, 'user-1');

try {
  const response = await backendAPI.createProduct(request);

  console.log('✅ Prodotto creato con successo!');
  console.log('UUID:', response.uuid);
  console.log('🔗 Algorand Asset ID:', response.asset_id);
  console.log('📂 IPFS Metadata CID:', response.metadata_cid);

  // Visualizza su blockchain explorer
  const explorerUrl = `https://testnet.algoexplorer.io/asset/${response.asset_id}`;
  console.log('🔍 Blockchain Explorer:', explorerUrl);

} catch (error) {
  if (error.message.includes('SHA-256')) {
    Alert.alert('QR Code Duplicato', 'Questo prodotto è già stato registrato');
  } else {
    Alert.alert('Errore', error.message);
  }
}
```

**Processo Backend**:

1. **Validazione**: Controlla campi richiesti
2. **SHA-256 Digest**: Calcola hash del prodotto per prevenire duplicati
3. **Check Duplicati**: Verifica se SHA-256 già esiste → 400 se duplicato
4. **IPFS Upload**: Salva metadata su IPFS → ottiene CID
5. **Algorand Mint**: Crea asset sulla blockchain Algorand → ottiene asset_id
6. **Database Save**: Salva prodotto con asset_id e metadata_cid
7. **Response**: Ritorna uuid, asset_id, metadata_cid

**Note Importanti**:
- ⚠️ **QR Code deve essere univoco**: Stesso QR code → stesso SHA-256 → errore 400
- 🔗 **Asset permanente**: Una volta sulla blockchain, non può essere cancellato
- 📂 **Metadata immutabile**: IPFS CID identifica metadata immutabili
- 🔍 **Tracciabilità**: Asset ID permette verifica su Algorand blockchain explorer

### 🔧 Maintenance Endpoints

#### Caratteristiche Speciali

**GPS Validation**:
- 📍 **Precisione**: 6 decimali massimi
- 📏 **Limiti**: Max 9 cifre totali (inclusi decimali)
- ✅ **Valido**: `45.464211` (2 int + 6 dec = 8 cifre)
- ✅ **Valido**: `123.456789` (3 int + 6 dec = 9 cifre)
- ❌ **Invalido**: `1234.567890` (4 int + 6 dec = 10 cifre)

**Blockchain Integration**:
- 🔗 **Algorand Transaction**: Ogni manutenzione registrata su blockchain
- 📂 **IPFS Metadata**: Dettagli intervento salvati su IPFS
- 🔄 **Asset Update**: Aggiorna metadata dell'asset prodotto esistente

#### 3. GET /maintenance - Get All Maintenances

**Descrizione**: Recupera tutte le manutenzioni dal database con informazioni GPS e certificazione.

**URL**: `/maintenance`

**Method**: `GET`

**Headers Richiesti**:
```http
x-api-key: Dm6hNWqD0T64hBpvlwmOB3WC2cBEEmFAa2C3ETz4
```

**Request**:
```bash
curl -X GET "https://api-dev.geosign.toknox.com/maintenance" \
  -H "x-api-key: Dm6hNWqD0T64hBpvlwmOB3WC2cBEEmFAa2C3ETz4"
```

**Response** (200 OK):
```json
{
  "status_code": 200,
  "message": "Maintenances Successfully retrieved.",
  "payload": {
    "data": [
      {
        "uuid": "3b4c5d6e-7f8a-9b0c-1d2e-3f4a5b6c7d8e",
        "intervention_type": "installation",
        "gps_lat": 45.464211,
        "gps_lng": 9.189982,
        "year": 2024,
        "poles_number": 2,
        "company_id": "company-1",
        "certificate_number": "CERT-INST-2024-001",
        "reason": "Nuova installazione cantiere edile",
        "notes": "Installato presso Via Roma 123, Milano. Doppio palo di sostegno h=2.5m.",
        "created_at": "2024-09-29T11:15:00.000Z"
      }
    ]
  }
}
```

**Response Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | UUID univoco manutenzione |
| `intervention_type` | string | Tipo intervento (installation, maintenance, replacement, verification, dismissal) |
| `gps_lat` | float | Latitudine GPS (6 decimali, max 9 cifre totali) |
| `gps_lng` | float | Longitudine GPS (6 decimali, max 9 cifre totali) |
| `year` | integer | Anno intervento |
| `poles_number` | integer | Numero pali installati/manutenuti |
| `company_id` | string | ID azienda che ha effettuato intervento |
| `certificate_number` | string | Numero certificato intervento |
| `reason` | string | Motivazione intervento |
| `notes` | string | Note dettagliate intervento |
| `created_at` | string | Timestamp ISO 8601 creazione |

**Frontend Usage**:
```typescript
import { backendAPI } from '@/lib/api/backend';

const maintenances = await backendAPI.getAllMaintenances();

console.log(`Loaded ${maintenances.length} maintenance records`);

// Filter by intervention type
const installations = maintenances.filter(
  m => m.intervention_type === 'installation'
);
```

**Note**:
- Ritorna **tutte** le manutenzioni (nessuna paginazione)
- GPS coordinates già validate dal backend
- Per associare a prodotto, serve query separata con product_uuid

#### 4. POST /maintenance/create - Create Maintenance

**Descrizione**: Crea record manutenzione, lo associa a un prodotto esistente, salva metadata su IPFS e registra transazione su Algorand blockchain.

**URL**: `/maintenance/create`

**Method**: `POST`

**Headers Richiesti**:
```http
x-api-key: Dm6hNWqD0T64hBpvlwmOB3WC2cBEEmFAa2C3ETz4
Content-Type: application/json
```

**Request Body**:
```json
{
  "intervention_type": "string",
  "gps_lat": "float",
  "gps_lng": "float",
  "year": "integer (optional)",
  "poles_number": "integer (optional)",
  "company_id": "string",
  "certificate_number": "string",
  "reason": "string",
  "notes": "string",
  "product_uuid": "string"
}
```

**Request Body Fields**:

| Field | Type | Required | Description | Example | Validation |
|-------|------|----------|-------------|---------|------------|
| `intervention_type` | string | ✅ Yes | Tipo intervento | `"installation"` | installation, maintenance, replacement, verification, dismissal |
| `gps_lat` | float | ✅ Yes | Latitudine GPS | `45.464211` | 6 decimali max, 9 cifre totali |
| `gps_lng` | float | ✅ Yes | Longitudine GPS | `9.189982` | 6 decimali max, 9 cifre totali |
| `year` | integer | ❌ No | Anno intervento | `2024` | - |
| `poles_number` | integer | ❌ No | Numero pali | `2` | - |
| `company_id` | string | ✅ Yes | ID azienda | `"company-1"` | - |
| `certificate_number` | string | ✅ Yes | N° certificato | `"CERT-INST-2024-001"` | Univoco |
| `reason` | string | ✅ Yes | Motivo intervento | `"Nuova installazione"` | - |
| `notes` | string | ✅ Yes | Note dettagliate | `"Installato presso..."` | - |
| `product_uuid` | string | ✅ Yes | UUID prodotto | `"8f7e9d2a..."` | Deve esistere |

**GPS Coordinates Validation Examples**:

| Latitude | Longitude | Valid? | Reason |
|----------|-----------|--------|--------|
| `45.464211` | `9.189982` | ✅ Yes | 2+6=8 digits, 3+6=9 digits |
| `123.456789` | `12.345678` | ✅ Yes | 3+6=9 digits, 2+6=8 digits |
| `1234.567890` | `9.189982` | ❌ No | 4+6=10 digits (exceeds limit) |
| `45.4642112` | `9.189982` | ❌ No | 7 decimals (max 6) |

**Request Example**:
```bash
curl -X POST "https://api-dev.geosign.toknox.com/maintenance/create" \
  -H "x-api-key: Dm6hNWqD0T64hBpvlwmOB3WC2cBEEmFAa2C3ETz4" \
  -H "Content-Type: application/json" \
  -d '{
    "intervention_type": "installation",
    "gps_lat": 45.464211,
    "gps_lng": 9.189982,
    "year": 2024,
    "poles_number": 2,
    "company_id": "company-1",
    "certificate_number": "CERT-INST-2024-001",
    "reason": "Nuova installazione cantiere edile",
    "notes": "Installato presso Via Roma 123, Milano. Doppio palo di sostegno h=2.5m. Verifica stabilità effettuata.",
    "product_uuid": "8f7e9d2a-3c4b-4a1e-9f8d-7c6b5a4e3d2c"
  }'
```

**Response** (200 OK):
```json
{
  "status_code": 200,
  "message": "Maintenance Successfully created.",
  "payload": {
    "data": {
      "uuid": "3b4c5d6e-7f8a-9b0c-1d2e-3f4a5b6c7d8e",
      "intervention_type": "installation",
      "asset_id": 123456789,
      "metadata_cid": "QmY6AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUu",
      "transaction_id": "ALGO-TX-ABC123DEF456GHI789"
    }
  }
}
```

**Response Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | UUID univoco manutenzione generato |
| `intervention_type` | string | Tipo intervento (echo della request) |
| `asset_id` | integer | **Algorand Asset ID** del prodotto aggiornato |
| `metadata_cid` | string | **IPFS CID** per metadata manutenzione |
| `transaction_id` | string | **Algorand Transaction ID** sulla blockchain |

**Response** (400 Bad Request) - Product Not Found:
```json
{
  "status_code": 400,
  "message": "Product not found with UUID: 8f7e9d2a-3c4b-4a1e-9f8d-7c6b5a4e3d2c",
  "payload": {
    "data": null
  }
}
```

**Response** (400 Bad Request) - Invalid GPS:
```json
{
  "status_code": 400,
  "message": "Invalid GPS coordinates: gps_lat exceeds 9 total digits (6 decimals max)",
  "payload": {
    "data": null
  }
}
```

**Frontend Usage**:
```typescript
import { backendAPI } from '@/lib/api/backend';
import { mapMaintenanceToCreateRequest } from '@/lib/api/mappers';
import * as Location from 'expo-location';

// Get current GPS location
const location = await Location.getCurrentPositionAsync({
  accuracy: Location.Accuracy.High
});

const maintenance = {
  tipo_intervento: 'installazione',
  gps_lat: location.coords.latitude,   // Auto from GPS
  gps_lng: location.coords.longitude,  // Auto from GPS
  note: 'Installazione completata con successo',
  foto_urls: []
};

// Map to backend format
const request = mapMaintenanceToCreateRequest(
  maintenance,
  productUuid,
  'company-1',
  'CERT-INST-2024-001'
);

// Validate GPS before sending
if (!backendAPI.validateGPSCoordinates(request.gps_lat, request.gps_lng)) {
  Alert.alert('GPS Invalido', 'Coordinate GPS non valide per il backend');
  return;
}

try {
  const response = await backendAPI.createMaintenance(request);

  console.log('✅ Manutenzione registrata!');
  console.log('UUID:', response.uuid);
  console.log('🔗 Asset ID:', response.asset_id);
  console.log('📂 IPFS CID:', response.metadata_cid);
  console.log('💳 Transaction ID:', response.transaction_id);

  // Visualizza su blockchain
  const txUrl = `https://testnet.algoexplorer.io/tx/${response.transaction_id}`;
  console.log('🔍 Blockchain TX:', txUrl);

} catch (error) {
  if (error.message.includes('not found')) {
    Alert.alert('Errore', 'Prodotto non trovato');
  } else if (error.message.includes('GPS')) {
    Alert.alert('GPS Invalido', error.message);
  } else {
    Alert.alert('Errore', error.message);
  }
}
```

**Processo Backend**:

1. **Validazione Input**: Controlla campi richiesti
2. **GPS Validation**: Verifica formato coordinate (6 decimali, max 9 cifre)
3. **Product Lookup**: Verifica che product_uuid esiste → 400 se non trovato
4. **SHA-256 Check**: Calcola hash manutenzione, verifica duplicati → 400 se duplicato
5. **IPFS Upload**: Salva metadata manutenzione su IPFS → ottiene nuovo CID
6. **Asset Update**: Aggiorna metadata dell'asset prodotto sulla blockchain
7. **Blockchain TX**: Registra transazione su Algorand → ottiene transaction_id
8. **Database Save**: Salva manutenzione con tutti i riferimenti blockchain
9. **Response**: Ritorna uuid, asset_id, metadata_cid, transaction_id

**Note Importanti**:
- ⚠️ **GPS Precision**: Usa `toFixed(6)` per garantire max 6 decimali
- 🔗 **Product Required**: Deve esistere product_uuid valido nel database
- 📍 **Location Services**: Richiedi permessi GPS prima di chiamare l'endpoint
- 🔍 **Blockchain Verification**: Transaction ID permette verifica su Algorand explorer
- 📂 **Metadata Update**: Aggiorna CID del prodotto con nuova manutenzione
- 💾 **Immutabile**: Una volta su blockchain, non può essere modificato

### Type Mappers

Il sistema usa mappers per convertire tra types frontend e backend:

**Frontend → Backend** (prima dell'invio):
```typescript
import { mapProductToCreateRequest } from '@/lib/api/mappers';

const frontendProduct = {
  tipo_segnale: 'Pericolo',  // Italian
  anno: 2024,
  dimensioni: '90x90cm',
  // ...
};

const backendRequest = mapProductToCreateRequest(frontendProduct, userId);
// {
//   signal_type: 'Pericolo',  // English
//   production_year: 2024,
//   dimension: '90x90cm',
//   // ...
// }
```

**Backend → Frontend** (dopo ricezione):
```typescript
import { mapProductDataToProduct } from '@/lib/api/mappers';

const backendProduct = {
  uuid: '123',
  signal_type: 'Pericolo',
  production_year: 2024,
  // ...
};

const frontendProduct = mapProductDataToProduct(backendProduct, companyId);
// {
//   id: '123',
//   tipo_segnale: 'Pericolo',
//   anno: 2024,
//   // ...
// }
```

### Error Handling

Tutti gli errori API sono catturati e loggati:

```typescript
try {
  const products = await backendAPI.getAllProducts();
} catch (error) {
  // Error già loggato in console da backend.ts
  // error.message contiene il messaggio user-friendly
  Alert.alert('Errore', error.message);
}
```

**Errori Comuni**:

| Status | Messaggio | Causa | Soluzione |
|--------|-----------|-------|-----------|
| 403 | Forbidden | API Key mancante/errata | Verifica `.env` |
| 400 | Bad Request | Dati request invalidi | Controlla types richiesti |
| 500 | Server Error | Errore backend | Contatta backend team |
| Network | Network request failed | No connessione | Verifica WiFi/VPN |

---

## 🧪 Testing

### Testing Manuale

#### Test 1: Login Mock

**Steps**:
1. Apri app
2. Login con `mario.rossi@segnaletica.it` / `password123`
3. Verifica redirect a home
4. Chiudi app
5. Riapri app
6. Verifica che sei ancora loggato

**Risultato Atteso**: ✅ Sessione persistente

#### Test 2: API Calls

**Steps**:
1. Login come sopra
2. Naviga a sezione prodotti
3. Verifica che i prodotti si caricano dal backend
4. Crea un nuovo prodotto
5. Verifica che appare nella lista

**Risultato Atteso**: ✅ Dati real-time dal backend

#### Test 3: Logout

**Steps**:
1. Login come sopra
2. Vai a profilo
3. Fai logout
4. Verifica redirect a login
5. Riapri app
6. Verifica che sei disconnesso

**Risultato Atteso**: ✅ Sessione cancellata

### Testing con Script

#### Test API con cURL

Crea file `scripts/test-api.sh`:

```bash
#!/bin/bash

API_URL="https://api-dev.geosign.toknox.com"
API_KEY="Dm6hNWqD0T64hBpvlwmOB3WC2cBEEmFAa2C3ETz4"

echo "=== Testing Backend API ==="
echo ""

# Test 1: Get Products
echo "1. Testing GET /product..."
curl -s -X GET "$API_URL/product" \
  -H "x-api-key: $API_KEY" | jq '.'
echo ""

# Test 2: Get Maintenances
echo "2. Testing GET /maintenance..."
curl -s -X GET "$API_URL/maintenance" \
  -H "x-api-key: $API_KEY" | jq '.'
echo ""

echo "=== Tests Completed ==="
```

Esegui:
```bash
chmod +x scripts/test-api.sh
./scripts/test-api.sh
```

### Testing Credenziali

Testa tutti i ruoli utente:

```bash
# Company user
Email: mario.rossi@segnaletica.it
Password: password123
Expected: Full access to all features

# Employee user
Email: giuseppe.verdi@segnaletica.it
Password: password123
Expected: Limited access (no admin features)

# Viewer user
Email: luca.observer@demo.com
Password: password123
Expected: Read-only access
```

---

## 📦 Deployment

### Preparazione per Production

#### 1. Verificare Environment Variables

**Development** (`.env`):
```bash
EXPO_PUBLIC_API_URL=https://api-dev.geosign.toknox.com
EXPO_PUBLIC_API_KEY=Dm6hNWqD0T64hBpvlwmOB3WC2cBEEmFAa2C3ETz4
EXPO_PUBLIC_USE_MOCK_AUTH=true
```

**Production** (`.env.production`):
```bash
EXPO_PUBLIC_API_URL=https://api.geosign.toknox.com
EXPO_PUBLIC_API_KEY=<production-api-key>
EXPO_PUBLIC_USE_MOCK_AUTH=false  # Usare auth reale in production!
```

#### 2. Build con EAS (Expo Application Services)

**Setup EAS**:
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure
```

**Build Android**:
```bash
# Development build
eas build --profile development --platform android

# Production build
eas build --profile production --platform android
```

**Build iOS**:
```bash
# Development build
eas build --profile development --platform ios

# Production build
eas build --profile production --platform ios
```

#### 3. Configurare Secrets in EAS

Non committare API keys in git! Usa secrets:

```bash
# Set secrets for EAS builds
eas secret:create --scope project --name API_KEY --value "your-key"
eas secret:create --scope project --name API_URL --value "https://api.geosign.toknox.com"
```

In `eas.json`:
```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "@API_URL",
        "EXPO_PUBLIC_API_KEY": "@API_KEY"
      }
    }
  }
}
```

### App Store Submission

#### iOS App Store

**Requisiti**:
- Apple Developer Account ($99/anno)
- Provisioning profiles configurati
- App icons (tutti i size)
- Screenshots device diversi

**Steps**:
1. Build production con EAS
2. Download `.ipa` file
3. Upload a App Store Connect
4. Fill metadata (descrizione, keywords, etc.)
5. Submit for review

#### Google Play Store

**Requisiti**:
- Google Play Developer Account ($25 one-time)
- App signing key configurato
- Store listing completo

**Steps**:
1. Build production con EAS
2. Download `.aab` file
3. Upload a Google Play Console
4. Create store listing
5. Submit for review

---

## 🔄 Migrazione a Auth Reale

### Quando Implementare Auth Reale

Passa da mock auth a auth reale quando:
- ✅ Backend ha implementato JWT authentication
- ✅ Endpoint `/auth/login`, `/auth/register` disponibili
- ✅ Token refresh mechanism implementato
- ✅ Password reset funzionante

### Step-by-Step Migration

#### Step 1: Implementare Real Auth nel Backend

Backend deve fornire questi endpoint:

**POST /auth/register**:
```json
Request: {
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "User Name",
  "companyId": "company-1",
  "role": "employee"
}

Response: {
  "status_code": 200,
  "payload": {
    "data": {
      "user": { "id": "...", "email": "...", ... },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

**POST /auth/login**:
```json
Request: {
  "email": "user@example.com",
  "password": "securePassword123"
}

Response: {
  "status_code": 200,
  "payload": {
    "data": {
      "user": { "id": "...", "email": "...", ... },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

**POST /auth/refresh**:
```json
Request: {
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Response: {
  "status_code": 200,
  "payload": {
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

**GET /auth/me** (con Authorization header):
```json
Request Headers: {
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Response: {
  "status_code": 200,
  "payload": {
    "data": {
      "id": "user-1",
      "email": "user@example.com",
      "name": "User Name",
      "role": "employee",
      "companyId": "company-1"
    }
  }
}
```

#### Step 2: Aggiornare Frontend

**Modificare `.env`**:
```bash
# Change this flag
EXPO_PUBLIC_USE_MOCK_AUTH=false
```

**Modificare `lib/api/backend.ts`**:

Riabilitare Authorization header:

```typescript
// In backend.ts, nel metodo request()
const headers: Record<string, string> = {
  'Content-Type': 'application/json',
  'x-api-key': API_KEY || '',
};

// Add JWT token when available
const token = authService.getToken();
if (token && !USE_MOCK_AUTH) {
  headers['Authorization'] = `Bearer ${token}`;
}
```

**Modificare `lib/auth-service.ts`**:

Già pronto! Il servizio verifica `USE_MOCK_AUTH` flag e usa automaticamente auth reale quando `false`.

#### Step 3: Testare Transizione

**Test Checklist**:
- [ ] Login con credenziali reali funziona
- [ ] Token JWT salvato correttamente
- [ ] API calls includono Authorization header
- [ ] Token refresh automatico funziona
- [ ] Logout pulisce tokens
- [ ] Persistenza sessione funziona
- [ ] Password reset funziona
- [ ] Registrazione nuovi utenti funziona

#### Step 4: Rimuovere Mock Auth (Opzionale)

Dopo migrazione completa e testing, puoi rimuovere:

```bash
# File da rimuovere (opzionale - tenerli per future reference)
lib/mock-auth-service.ts
lib/mock-data.ts (o commentare sezione users)
```

Oppure mantienili per:
- Testing locale senza backend
- Demo per clienti
- Onboarding nuovi sviluppatori

---

## 🔧 Troubleshooting

### Problema: 403 Forbidden

**Sintomo**:
```
ERROR API Error [/product]: [Error: Forbidden]
```

**Cause Possibili**:
1. API Key mancante o errata
2. API Key non configurata in `.env`
3. Server Expo non riavviato dopo modifica `.env`

**Soluzione**:
```bash
# 1. Verifica .env
cat .env | grep EXPO_PUBLIC_API_KEY
# Deve mostrare: EXPO_PUBLIC_API_KEY=Dm6hNWqD0T64hBpvlwmOB3WC2cBEEmFAa2C3ETz4

# 2. Verifica che il valore è corretto (confronta con backend team)

# 3. Riavvia Expo con cache pulita
npx expo start --clear

# 4. Verifica che l'header viene inviato
# Aggiungi console.log in backend.ts:
console.log('Headers:', headers);
```

### Problema: Login Non Funziona

**Sintomo**:
```
Errore di Login: Credenziali non valide
```

**Cause Possibili**:
1. Password errata (deve essere esattamente `password123`)
2. Email non presente in `mockUsers`
3. Account disattivato (`isActive: false`)

**Soluzione**:
```typescript
// Verifica utenti disponibili in lib/mock-data.ts
export const mockUsers: User[] = [
  {
    id: "user-1",
    email: "mario.rossi@segnaletica.it",  // ← Usa questa
    name: "Mario Rossi",
    role: "company",
    companyId: "company-1",
    isActive: true,  // ← Deve essere true
    // ...
  }
];

// Password hardcoded in mock-auth-service.ts
const MOCK_PASSWORD = 'password123';  // ← Deve matchare
```

### Problema: Prodotti Non Si Caricano

**Sintomo**:
```
Error loading products: [Error: Network request failed]
```

**Cause Possibili**:
1. Backend non raggiungibile
2. URL errato in `.env`
3. Firewall/VPN blocca connessione
4. CORS issues (solo web)

**Soluzione**:
```bash
# 1. Test connessione backend
curl https://api-dev.geosign.toknox.com/status
# Deve rispondere 200 OK

# 2. Verifica URL in .env
cat .env | grep EXPO_PUBLIC_API_URL
# Deve essere: https://api-dev.geosign.toknox.com

# 3. Test con API key
curl -H "x-api-key: Dm6hNWqD0T64hBpvlwmOB3WC2cBEEmFAa2C3ETz4" \
  https://api-dev.geosign.toknox.com/product

# 4. Verifica che non ci siano proxy/VPN che bloccano
```

### Problema: Sessione Non Persiste

**Sintomo**:
App richiede login ogni volta che riapri

**Causa**:
AsyncStorage non salva correttamente

**Soluzione**:
```typescript
// Aggiungi debug logging in mock-auth-service.ts
private async saveAuth(token: string, refreshToken: string, user: User) {
  try {
    console.log('💾 Saving auth to AsyncStorage...');
    await AsyncStorage.setItem('mockAuthToken', token);
    console.log('✅ Token saved:', token.substring(0, 20));

    // ... resto del codice
  } catch (error) {
    console.error('❌ Error saving auth:', error);
    throw error;
  }
}

// Poi verifica storage
import AsyncStorage from '@react-native-async-storage/async-storage';
AsyncStorage.getAllKeys().then(keys => {
  console.log('AsyncStorage keys:', keys);
});
```

### Problema: Banner Mock Auth Non Appare

**Sintomo**:
Login screen non mostra banner credenziali test

**Causa**:
`USE_MOCK_AUTH` flag non rilevato

**Soluzione**:
```typescript
// In login.tsx, aggiungi debug
const USE_MOCK_AUTH = process.env.EXPO_PUBLIC_USE_MOCK_AUTH === 'true';
console.log('USE_MOCK_AUTH:', USE_MOCK_AUTH);
console.log('Env var:', process.env.EXPO_PUBLIC_USE_MOCK_AUTH);

// Se undefined, problema con .env
// Riavvia: npx expo start --clear
```

### Problema: Type Errors dopo Update

**Sintomo**:
```
Type 'ProductData' is not assignable to type 'Product'
```

**Causa**:
Mismatch tra types frontend e backend

**Soluzione**:
```bash
# 1. Verifica types sono aggiornati
cat types/product.ts
cat types/maintenance.ts

# 2. Verifica mappers esistono
cat lib/api/mappers.ts

# 3. Rigenera types se necessario
npx expo start --clear

# 4. Se persiste, controlla che usi mappers:
import { mapProductDataToProduct } from '@/lib/api/mappers';
const product = mapProductDataToProduct(backendData, companyId);
```

---

## ❓ FAQ

### Q: Posso usare questo sistema in production?

**A**:
- ✅ **API backend calls**: SÌ, completamente production-ready
- ⚠️ **Mock auth**: NO, solo per development
- 🔄 **Soluzione**: Passa a auth reale (`USE_MOCK_AUTH=false`) prima di production

### Q: Come aggiungo nuovi utenti mock?

**A**: Modifica `lib/mock-data.ts`:

```typescript
export const mockUsers: User[] = [
  // ... utenti esistenti
  {
    id: "user-new",
    email: "nuovo.utente@example.com",
    name: "Nuovo Utente",
    role: "employee",
    companyId: "company-1",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];
```

Password sarà sempre `password123` (definita in `mock-auth-service.ts`).

### Q: Posso cambiare la password mock?

**A**: SÌ, modifica `lib/mock-auth-service.ts`:

```typescript
// Change this line
const MOCK_PASSWORD = 'password123';  // ← Cambia qui

// E anche in MOCK_TEST_CREDENTIALS per il banner
export const MOCK_TEST_CREDENTIALS = {
  password: 'password123',  // ← E qui
  // ...
};
```

### Q: Come testiamo permessi diversi per ruoli?

**A**: Implementa permission checks basati su `user.role`:

```typescript
// Esempio in component
import { useAuth } from '@/contexts/AuthContext';

function AdminButton() {
  const { user } = useAuth();

  // Only show for company users
  if (user?.role !== 'company') {
    return null;
  }

  return <Button title="Admin Action" />;
}
```

### Q: Backend ha cambiato API key. Cosa fare?

**A**:
1. Aggiorna `.env`:
   ```bash
   EXPO_PUBLIC_API_KEY=new_api_key_here
   ```
2. Riavvia Expo:
   ```bash
   npx expo start --clear
   ```
3. Test che funziona

### Q: Come debug request/response API?

**A**: Aggiungi logging in `lib/api/backend.ts`:

```typescript
private async request<T>(endpoint: string, options?: RequestInit) {
  console.log('📤 API Request:', endpoint);
  console.log('Headers:', headers);
  console.log('Body:', options?.body);

  const response = await fetch(...);
  const data = await response.json();

  console.log('📥 API Response:', {
    status: response.status,
    data: data
  });

  return data;
}
```

### Q: Posso usare altri servizi auth (OAuth, Firebase)?

**A**: SÌ! Il sistema è modulare:

1. Implementa nuovo service in `lib/oauth-service.ts`
2. Modifica `lib/auth-service.ts` per usarlo:
   ```typescript
   if (USE_OAUTH) {
     return oauthService.login(credentials);
   }
   ```
3. Aggiungi flag `.env`:
   ```bash
   EXPO_PUBLIC_USE_OAUTH=true
   ```

### Q: Come sincronizzare mock users con backend?

**A**: Quando backend è pronto:

```typescript
// In mock-data.ts
export const syncUsersFromBackend = async () => {
  const response = await fetch('https://api.../users', {
    headers: { 'x-api-key': API_KEY }
  });
  const backendUsers = await response.json();

  // Save to mockUsers
  return backendUsers.payload.data;
};
```

---

## 📚 Risorse Aggiuntive

### Documentazione Ufficiale

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [AsyncStorage Documentation](https://react-native-async-storage.github.io/async-storage/)
- [Expo Router Guide](https://expo.github.io/router/docs/)

### File Correlati in Questo Progetto

- `docs/backend-integration-examples.md` - Esempi API backend
- `docs/QUICK-TEST-GUIDE.md` - Guida test rapidi
- `scripts/README.md` - Script di testing
- `CLAUDE.md` - Guida generale progetto
- `CONTEXT.md` - Context progetto per Claude Code

### Backend API Documentation

Contatta il backend team per:
- API documentation completa
- Postman collection
- Swagger/OpenAPI specs
- Webhook documentation

---

## 📞 Supporto

### Problemi Tecnici

1. **Check documentazione**: Questa guida + `docs/`
2. **Search issues**: GitHub repository issues
3. **Team chat**: Slack/Discord canale dev
4. **Backend team**: Per problemi API/autenticazione

### Contribuire

Per migliorare questa guida:
1. Crea issue con suggerimenti
2. Proponi modifiche via PR
3. Documenta nuovi use cases trovati

---

**Ultimo Aggiornamento**: 30 Settembre 2025
**Versione Documento**: 1.0.0
**Maintainer**: Team Development

---

## 🎯 Quick Reference

### Comandi Essenziali

```bash
# Start development
npx expo start --clear

# Test API
./scripts/test-api.sh

# Build production
eas build --profile production --platform all
```

### Credenziali Test

```
Email: mario.rossi@segnaletica.it
Password: password123
```

### Environment Variables

```bash
EXPO_PUBLIC_API_URL=https://api-dev.geosign.toknox.com
EXPO_PUBLIC_API_KEY=Dm6hNWqD0T64hBpvlwmOB3WC2cBEEmFAa2C3ETz4
EXPO_PUBLIC_USE_MOCK_AUTH=true
```

### Chiavi AsyncStorage Mock Auth

```
mockAuthToken
mockRefreshToken
mockCurrentUser
```

---

✨ **Happy Coding!** ✨