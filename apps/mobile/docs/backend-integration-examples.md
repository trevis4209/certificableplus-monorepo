# Backend Integration Examples
**Guida Pratica per Testing API Backend**

Esempi concreti e pronti all'uso per testare l'integrazione tra frontend React Native e backend MySQL con Algorand blockchain.

---

## 📋 Indice

1. [Configurazione Iniziale](#configurazione-iniziale)
2. [Esempi Dati Realistici](#esempi-dati-realistici)
3. [Testing con cURL](#testing-con-curl)
4. [Scenari Completi](#scenari-completi)
5. [Gestione Errori](#gestione-errori)
6. [Script Automatici](#script-automatici)

---

## 🔧 Configurazione Iniziale

### Variabili Environment
```bash
# File: .env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Token JWT di Test
```bash
# Dopo login, salvare il token
export JWT_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNzU0ZWY3YzAtNzhmNi00ZjJhLWI2YjEtMWFlMTFiMDQyYmJkIiwicm9sZSI6ImNvbXBhbnkiLCJpYXQiOjE3MzI5MTUyMDAsImV4cCI6MTczMjkxODgwMH0.1234567890abcdefghijklmnopqrstuvwxyz"

# Oppure in variabile temporanea
TOKEN="your-jwt-token-here"
```

### Base URL
```bash
export API_URL="http://localhost:3000"
# o
export API_URL="http://192.168.1.100:3000"
```

---

## 📦 Esempi Dati Realistici

### Prodotto 1: Segnale di Pericolo Triangolare
```json
{
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
  "created_by": "754ef7c0-78f6-4f2a-b6b1-1ae11b042bbd"
}
```

### Prodotto 2: Segnale di Obbligo Rotondo
```json
{
  "qr_code": "CERT-2024-RM-002",
  "signal_type": "Obbligo - Casco protettivo",
  "production_year": 2023,
  "shape": "Circolare",
  "dimension": "60x60cm",
  "wl_code": "WL-B34",
  "support_material": "Alluminio spessore 15/10",
  "support_thickness": "1.5mm",
  "fixation_class": "Classe RA1",
  "fixation_method": "Fissaggio a parete con tasselli",
  "created_by": "754ef7c0-78f6-4f2a-b6b1-1ae11b042bbd"
}
```

### Prodotto 3: Segnale Divieto
```json
{
  "qr_code": "CERT-2024-TO-003",
  "signal_type": "Divieto - Divieto di accesso",
  "production_year": 2024,
  "shape": "Circolare",
  "dimension": "45x45cm",
  "wl_code": "WL-C56",
  "support_material": "PVC rigido",
  "support_thickness": "3mm",
  "fixation_class": "Classe EG",
  "fixation_method": "Adesivo permanente",
  "created_by": "754ef7c0-78f6-4f2a-b6b1-1ae11b042bbd"
}
```

### Manutenzione 1: Installazione
```json
{
  "intervention_type": "installazione",
  "gps_lat": 45.464211,
  "gps_lng": 9.189982,
  "year": 2024,
  "poles_number": 2,
  "company_id": "c891f3d0-45a1-4b2c-9d7e-8f123abc4567",
  "certificate_number": "CERT-INST-2024-001",
  "reason": "Nuova installazione cantiere edile",
  "notes": "Installato presso Via Roma 123, Milano. Doppio palo di sostegno h=2.5m. Verifica stabilità effettuata.",
  "product_uuid": "prod-uuid-from-previous-call"
}
```

### Manutenzione 2: Manutenzione Ordinaria
```json
{
  "intervention_type": "manutenzione",
  "gps_lat": 41.902783,
  "gps_lng": 12.496366,
  "year": 2024,
  "poles_number": 1,
  "company_id": "c891f3d0-45a1-4b2c-9d7e-8f123abc4567",
  "certificate_number": "CERT-MAINT-2024-042",
  "reason": "Manutenzione ordinaria semestrale",
  "notes": "Pulizia segnale, verifica retroriflettenza, controllo fissaggi. Tutto regolare.",
  "product_uuid": "prod-uuid-from-previous-call"
}
```

### Manutenzione 3: Sostituzione
```json
{
  "intervention_type": "sostituzione",
  "gps_lat": 45.070312,
  "gps_lng": 7.686856,
  "year": 2024,
  "poles_number": 1,
  "company_id": "c891f3d0-45a1-4b2c-9d7e-8f123abc4567",
  "certificate_number": "CERT-REPL-2024-015",
  "reason": "Segnale danneggiato da vandalismo",
  "notes": "Segnale precedente rimosso e sostituito con nuovo. Palo riutilizzato. Documentazione fotografica allegata.",
  "product_uuid": "prod-uuid-from-previous-call"
}
```

---

## 🧪 Testing con cURL

### 1. Creare Prodotto (Tokenizzazione)

#### Request
```bash
curl -X POST "http://localhost:3000/product/create" \
  -H "Authorization: Bearer $JWT_TOKEN" \
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
    "created_by": "754ef7c0-78f6-4f2a-b6b1-1ae11b042bbd"
  }'
```

#### Expected Response (200 OK)
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

### 2. Recuperare Tutti i Prodotti

#### Request
```bash
curl -X GET "http://localhost:3000/product" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

#### Expected Response (200 OK)
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
        "created_by": "754ef7c0-78f6-4f2a-b6b1-1ae11b042bbd",
        "created_at": "2024-09-29T10:30:00.000Z"
      },
      {
        "uuid": "2d3e4f5a-6b7c-8d9e-0f1a-2b3c4d5e6f7a",
        "qr_code": "CERT-2024-RM-002",
        "signal_type": "Obbligo - Casco protettivo",
        "production_year": 2023,
        "shape": "Circolare",
        "dimension": "60x60cm",
        "wl_code": "WL-B34",
        "support_material": "Alluminio spessore 15/10",
        "support_thickness": "1.5mm",
        "fixation_class": "Classe RA1",
        "fixation_method": "Fissaggio a parete con tasselli",
        "created_by": "754ef7c0-78f6-4f2a-b6b1-1ae11b042bbd",
        "created_at": "2024-09-28T15:45:00.000Z"
      }
    ]
  }
}
```

### 3. Creare Manutenzione

#### Request
```bash
curl -X POST "http://localhost:3000/maintenance/create" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "intervention_type": "installazione",
    "gps_lat": 45.464211,
    "gps_lng": 9.189982,
    "year": 2024,
    "poles_number": 2,
    "company_id": "c891f3d0-45a1-4b2c-9d7e-8f123abc4567",
    "certificate_number": "CERT-INST-2024-001",
    "reason": "Nuova installazione cantiere edile",
    "notes": "Installato presso Via Roma 123, Milano. Doppio palo di sostegno h=2.5m.",
    "product_uuid": "8f7e9d2a-3c4b-4a1e-9f8d-7c6b5a4e3d2c"
  }'
```

#### Expected Response (200 OK)
```json
{
  "status_code": 200,
  "message": "Maintenance Successfully created.",
  "payload": {
    "data": {
      "uuid": "3b4c5d6e-7f8a-9b0c-1d2e-3f4a5b6c7d8e",
      "intervention_type": "installazione",
      "asset_id": 123456789,
      "metadata_cid": "QmY6AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUu",
      "transaction_id": "ALGO-TX-ABC123DEF456GHI789"
    }
  }
}
```

### 4. Recuperare Tutte le Manutenzioni

#### Request
```bash
curl -X GET "http://localhost:3000/maintenance" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

#### Expected Response (200 OK)
```json
{
  "status_code": 200,
  "message": "Maintenances Successfully retrieved.",
  "payload": {
    "data": [
      {
        "uuid": "3b4c5d6e-7f8a-9b0c-1d2e-3f4a5b6c7d8e",
        "intervention_type": "installazione",
        "gps_lat": 45.464211,
        "gps_lng": 9.189982,
        "year": 2024,
        "poles_number": 2,
        "company_id": "c891f3d0-45a1-4b2c-9d7e-8f123abc4567",
        "certificate_number": "CERT-INST-2024-001",
        "reason": "Nuova installazione cantiere edile",
        "notes": "Installato presso Via Roma 123, Milano. Doppio palo di sostegno h=2.5m.",
        "created_at": "2024-09-29T11:15:00.000Z"
      },
      {
        "uuid": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
        "intervention_type": "manutenzione",
        "gps_lat": 41.902783,
        "gps_lng": 12.496366,
        "year": 2024,
        "poles_number": 1,
        "company_id": "c891f3d0-45a1-4b2c-9d7e-8f123abc4567",
        "certificate_number": "CERT-MAINT-2024-042",
        "reason": "Manutenzione ordinaria semestrale",
        "notes": "Pulizia segnale, verifica retroriflettenza, controllo fissaggi.",
        "created_at": "2024-09-25T09:30:00.000Z"
      }
    ]
  }
}
```

---

## 🎬 Scenari Completi

### Scenario 1: Flusso Completo Scanner → Prodotto → Manutenzione

#### Step 1: Utente apre scanner e crea nuovo prodotto
```typescript
// Frontend chiama
const newProduct = await backendAPI.createProduct({
  qr_code: "CERT-2024-MI-001",
  signal_type: "Pericolo - Lavori in corso",
  production_year: 2024,
  shape: "Triangolare",
  dimension: "90x90cm",
  wl_code: "WL-A12",
  support_material: "Alluminio spessore 25/10",
  support_thickness: "2.5mm",
  fixation_class: "Classe RA2",
  fixation_method: "Palo sostegno diametro 60mm",
  created_by: currentUser.id
});

// Risultato
console.log(newProduct.uuid);         // "8f7e9d2a-3c4b-4a1e-9f8d-7c6b5a4e3d2c"
console.log(newProduct.asset_id);     // 123456789
console.log(newProduct.metadata_cid); // "QmX5ZzPxvxhwYnN3aR8..."
```

#### Step 2: Utente scansiona QR code in un secondo momento
```typescript
// Frontend richiede GPS coordinates
const location = await Location.getCurrentPositionAsync();
// { coords: { latitude: 45.464211, longitude: 9.189982 } }

// Frontend cerca prodotto per QR
const products = await backendAPI.getAllProducts();
const product = products.find(p => p.qr_code === "CERT-2024-MI-001");
```

#### Step 3: Utente seleziona "Installazione" e compila form
```typescript
const maintenance = await backendAPI.createMaintenance({
  intervention_type: "installazione",
  gps_lat: 45.464211,
  gps_lng: 9.189982,
  year: 2024,
  poles_number: 2,
  company_id: currentUser.companyId,
  certificate_number: "CERT-INST-2024-001",
  reason: "Nuova installazione cantiere edile",
  notes: "Installato presso Via Roma 123, Milano",
  product_uuid: product.uuid
});

// Risultato
console.log(maintenance.transaction_id); // "ALGO-TX-ABC123DEF456GHI789"
// Alert: "Manutenzione registrata su blockchain!"
```

### Scenario 2: Ricerca Prodotto per QR Code

```bash
# Backend dovrebbe supportare (future enhancement)
curl -X GET "http://localhost:3000/product?qr_code=CERT-2024-MI-001" \
  -H "Authorization: Bearer $JWT_TOKEN"

# Response
{
  "status_code": 200,
  "message": "Product found.",
  "payload": {
    "data": {
      "uuid": "8f7e9d2a-3c4b-4a1e-9f8d-7c6b5a4e3d2c",
      "qr_code": "CERT-2024-MI-001",
      "signal_type": "Pericolo - Lavori in corso",
      ...
    }
  }
}
```

### Scenario 3: Visualizzazione Storico Manutenzioni Prodotto

```bash
# Backend dovrebbe supportare (future enhancement)
curl -X GET "http://localhost:3000/product/8f7e9d2a-3c4b-4a1e-9f8d-7c6b5a4e3d2c/maintenances" \
  -H "Authorization: Bearer $JWT_TOKEN"

# Response
{
  "status_code": 200,
  "message": "Maintenance history retrieved.",
  "payload": {
    "data": [
      {
        "uuid": "3b4c5d6e-7f8a-9b0c-1d2e-3f4a5b6c7d8e",
        "intervention_type": "installazione",
        "created_at": "2024-09-29T11:15:00.000Z",
        ...
      },
      {
        "uuid": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
        "intervention_type": "manutenzione",
        "created_at": "2024-10-15T14:30:00.000Z",
        ...
      }
    ]
  }
}
```

---

## ⚠️ Gestione Errori

### Errore 1: QR Code Duplicato

#### Request
```bash
curl -X POST "http://localhost:3000/product/create" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "qr_code": "CERT-2024-MI-001",
    ...
  }'
```

#### Expected Response (400 Bad Request)
```json
{
  "status_code": 400,
  "message": "Product with this SHA-256 already exists",
  "payload": {
    "data": null
  }
}
```

#### Frontend Handling
```typescript
try {
  await backendAPI.createProduct(productData);
} catch (error) {
  if (error.message.includes('SHA-256')) {
    Alert.alert(
      'QR Code Duplicato',
      'Questo QR code è già stato registrato nel sistema.'
    );
  }
}
```

### Errore 2: Prodotto Non Trovato

#### Request
```bash
curl -X POST "http://localhost:3000/maintenance/create" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "product_uuid": "non-existent-uuid-999",
    ...
  }'
```

#### Expected Response (400 Bad Request)
```json
{
  "status_code": 400,
  "message": "Product not found with UUID: non-existent-uuid-999",
  "payload": {
    "data": null
  }
}
```

#### Frontend Handling
```typescript
try {
  await backendAPI.createMaintenance(maintenanceData);
} catch (error) {
  if (error.message.includes('not found')) {
    Alert.alert(
      'Prodotto Non Trovato',
      'Il prodotto associato non esiste nel sistema.'
    );
  }
}
```

### Errore 3: GPS Coordinate Invalide

#### Request
```bash
curl -X POST "http://localhost:3000/maintenance/create" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "gps_lat": 1234.567890,  # INVALID: 10 digits totali
    "gps_lng": 9.189982,
    ...
  }'
```

#### Expected Response (400 Bad Request)
```json
{
  "status_code": 400,
  "message": "Invalid GPS coordinates: gps_lat exceeds 9 total digits (6 decimals max)",
  "payload": {
    "data": null
  }
}
```

#### Frontend Validation (Pre-Request)
```typescript
const validateGPS = (lat: number, lng: number): boolean => {
  return backendAPI.validateGPSCoordinates(lat, lng);
};

if (!validateGPS(gpsLat, gpsLng)) {
  Alert.alert('GPS Invalido', 'Coordinate GPS non valide');
  return;
}
```

### Errore 4: Token JWT Scaduto

#### Request
```bash
curl -X GET "http://localhost:3000/product" \
  -H "Authorization: Bearer EXPIRED_TOKEN"
```

#### Expected Response (401 Unauthorized)
```json
{
  "status_code": 401,
  "message": "Token expired or invalid",
  "payload": {
    "data": null
  }
}
```

#### Frontend Handling
```typescript
// Il servizio auth gestisce automaticamente
// Vedi: lib/auth-service.ts

// Se 401, redirect a login
if (response.status === 401) {
  await authService.logout();
  router.replace('/login');
}
```

### Errore 5: Server Non Disponibile

#### Frontend Handling
```typescript
try {
  await backendAPI.createProduct(data);
} catch (error) {
  if (error.message.includes('Network request failed')) {
    Alert.alert(
      'Server Non Raggiungibile',
      'Impossibile connettersi al server. Verifica la connessione.'
    );
  }
}
```

---

## 🚀 Script Automatici

### Script 1: Test Completo Endpoint Product

```bash
#!/bin/bash
# File: scripts/test-product-endpoints.sh

API_URL="http://localhost:3000"
JWT_TOKEN="your-jwt-token-here"

echo "=== Testing Product Endpoints ==="
echo ""

# Test 1: Create Product
echo "1. Creating new product..."
CREATE_RESPONSE=$(curl -s -X POST "$API_URL/product/create" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "qr_code": "TEST-'$(date +%s)'",
    "signal_type": "Test Signal",
    "production_year": 2024,
    "shape": "Triangolare",
    "dimension": "90x90cm",
    "wl_code": "WL-TEST",
    "support_material": "Alluminio",
    "support_thickness": "2.5mm",
    "fixation_class": "Classe RA2",
    "fixation_method": "Palo sostegno",
    "created_by": "test-user-id"
  }')

echo "$CREATE_RESPONSE" | jq '.'

# Extract UUID for next tests
PRODUCT_UUID=$(echo "$CREATE_RESPONSE" | jq -r '.payload.data.uuid')
echo "Product UUID: $PRODUCT_UUID"
echo ""

# Test 2: Get All Products
echo "2. Retrieving all products..."
curl -s -X GET "$API_URL/product" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.'
echo ""

echo "=== Tests Completed ==="
```

### Script 2: Test Completo Endpoint Maintenance

```bash
#!/bin/bash
# File: scripts/test-maintenance-endpoints.sh

API_URL="http://localhost:3000"
JWT_TOKEN="your-jwt-token-here"
PRODUCT_UUID="8f7e9d2a-3c4b-4a1e-9f8d-7c6b5a4e3d2c" # UUID prodotto esistente

echo "=== Testing Maintenance Endpoints ==="
echo ""

# Test 1: Create Maintenance
echo "1. Creating new maintenance..."
CREATE_RESPONSE=$(curl -s -X POST "$API_URL/maintenance/create" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "intervention_type": "installazione",
    "gps_lat": 45.464211,
    "gps_lng": 9.189982,
    "year": 2024,
    "poles_number": 2,
    "company_id": "test-company-id",
    "certificate_number": "TEST-CERT-'$(date +%s)'",
    "reason": "Test installation",
    "notes": "Automated test maintenance",
    "product_uuid": "'$PRODUCT_UUID'"
  }')

echo "$CREATE_RESPONSE" | jq '.'

# Extract transaction_id
TX_ID=$(echo "$CREATE_RESPONSE" | jq -r '.payload.data.transaction_id')
echo "Transaction ID: $TX_ID"
echo ""

# Test 2: Get All Maintenances
echo "2. Retrieving all maintenances..."
curl -s -X GET "$API_URL/maintenance" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.'
echo ""

echo "=== Tests Completed ==="
```

### Script 3: Test GPS Validation

```bash
#!/bin/bash
# File: scripts/test-gps-validation.sh

API_URL="http://localhost:3000"
JWT_TOKEN="your-jwt-token-here"
PRODUCT_UUID="existing-product-uuid"

echo "=== Testing GPS Coordinate Validation ==="
echo ""

# Valid GPS (should succeed)
echo "1. Testing VALID GPS (45.464211, 9.189982)..."
curl -s -X POST "$API_URL/maintenance/create" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "intervention_type": "verifica",
    "gps_lat": 45.464211,
    "gps_lng": 9.189982,
    "company_id": "test-company",
    "certificate_number": "GPS-TEST-1",
    "reason": "GPS validation test",
    "notes": "Valid GPS test",
    "product_uuid": "'$PRODUCT_UUID'"
  }' | jq '.'
echo ""

# Invalid GPS - Too many digits (should fail)
echo "2. Testing INVALID GPS (1234.567890, 9.189982)..."
curl -s -X POST "$API_URL/maintenance/create" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "intervention_type": "verifica",
    "gps_lat": 1234.567890,
    "gps_lng": 9.189982,
    "company_id": "test-company",
    "certificate_number": "GPS-TEST-2",
    "reason": "GPS validation test",
    "notes": "Invalid GPS test",
    "product_uuid": "'$PRODUCT_UUID'"
  }' | jq '.'
echo ""

echo "=== GPS Tests Completed ==="
```

### Script 4: Test Error Handling

```bash
#!/bin/bash
# File: scripts/test-error-handling.sh

API_URL="http://localhost:3000"
JWT_TOKEN="your-jwt-token-here"

echo "=== Testing Error Handling ==="
echo ""

# Test 1: Duplicate QR Code
echo "1. Testing duplicate QR code error..."
curl -s -X POST "$API_URL/product/create" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "qr_code": "DUPLICATE-QR-001",
    "signal_type": "Test",
    "production_year": 2024,
    "shape": "Test",
    "dimension": "Test",
    "support_material": "Test",
    "support_thickness": "Test",
    "fixation_class": "Test",
    "fixation_method": "Test",
    "created_by": "test"
  }' | jq '.'
echo ""

# Create same product again (should fail)
echo "2. Creating duplicate (should fail)..."
curl -s -X POST "$API_URL/product/create" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "qr_code": "DUPLICATE-QR-001",
    "signal_type": "Test",
    "production_year": 2024,
    "shape": "Test",
    "dimension": "Test",
    "support_material": "Test",
    "support_thickness": "Test",
    "fixation_class": "Test",
    "fixation_method": "Test",
    "created_by": "test"
  }' | jq '.'
echo ""

# Test 2: Product Not Found
echo "3. Testing product not found error..."
curl -s -X POST "$API_URL/maintenance/create" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "intervention_type": "installazione",
    "gps_lat": 45.464211,
    "gps_lng": 9.189982,
    "company_id": "test",
    "certificate_number": "TEST",
    "reason": "Test",
    "notes": "Test",
    "product_uuid": "non-existent-uuid-999"
  }' | jq '.'
echo ""

# Test 3: Invalid Token
echo "4. Testing invalid token error..."
curl -s -X GET "$API_URL/product" \
  -H "Authorization: Bearer INVALID_TOKEN" | jq '.'
echo ""

echo "=== Error Tests Completed ==="
```

---

## 📊 Checklist Testing Backend

### ✅ Endpoint Product
- [ ] POST `/product/create` ritorna 200 con uuid, asset_id, metadata_cid
- [ ] POST `/product/create` con QR duplicato ritorna 400
- [ ] GET `/product` ritorna array di prodotti con tutti i campi
- [ ] GET `/product` senza token ritorna 401

### ✅ Endpoint Maintenance
- [ ] POST `/maintenance/create` ritorna 200 con uuid, transaction_id
- [ ] POST `/maintenance/create` con product_uuid invalido ritorna 400
- [ ] POST `/maintenance/create` con GPS invalido ritorna 400
- [ ] GET `/maintenance` ritorna array di manutenzioni

### ✅ Validazione GPS
- [ ] GPS valido (45.464211) accettato ✅
- [ ] GPS valido (9.189982) accettato ✅
- [ ] GPS con 10 digit totali rifiutato ❌
- [ ] GPS fuori range (-90/90, -180/180) rifiutato ❌

### ✅ Autenticazione
- [ ] Richieste senza token ritornano 401
- [ ] Richieste con token scaduto ritornano 401
- [ ] Richieste con token valido ritornano 200
- [ ] Token refresh implementato

### ✅ Blockchain Integration
- [ ] Algorand asset_id generato correttamente
- [ ] IPFS metadata_cid salvato
- [ ] Transaction ID Algorand registrato
- [ ] SHA-256 calcolato per rilevare duplicati

---

## 🎯 Prossimi Passi

### Domani con Backend Developer:

1. **Setup Environment**
   - Condividere URL backend (`http://192.168.1.x:3000`)
   - Ottenere token JWT valido per test
   - Configurare `.env` con `EXPO_PUBLIC_API_URL`

2. **Eseguire Script Test**
   - Lanciare `test-product-endpoints.sh`
   - Lanciare `test-maintenance-endpoints.sh`
   - Verificare risposte conformi a documentazione

3. **Debug Issues**
   - Confrontare response attese vs ricevute
   - Verificare validazione GPS (max 9 digits)
   - Testare error handling (400, 401, 500)

4. **Integration Testing**
   - Testare flusso completo da app mobile
   - Scanner → Create Product → Create Maintenance
   - Verificare blockchain transaction_id ricevuto

5. **Production Readiness**
   - Verificare SSL/TLS per production URL
   - Rate limiting implementato
   - Logging e monitoring configurati
   - Backup database configurato

---

## 📚 Riferimenti

- **Frontend API Client**: `lib/api/backend.ts`
- **Type Definitions**: `types/product.ts`, `types/maintenance.ts`
- **API Response Types**: `types/api-response.ts`
- **Authentication Service**: `lib/auth-service.ts`
- **Scanner Business Logic**: `hooks/scanner/useScannerOperations.ts`

---

**Ultimo Aggiornamento**: 29 Settembre 2024
**Versione**: 1.0.0
**Autore**: Claude Code Assistant


https://api-dev.geosign.toknox.com/