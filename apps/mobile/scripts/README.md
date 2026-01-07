# Backend API Testing Scripts

Script automatici per testare l'integrazione con il backend MySQL + Algorand.

## 📋 Script Disponibili

### 1. `test-product-endpoints.sh`
Testa gli endpoint dei prodotti (creazione e recupero).

**Usage:**
```bash
./scripts/test-product-endpoints.sh [API_URL] [JWT_TOKEN]

# Esempio
./scripts/test-product-endpoints.sh http://localhost:3000 "eyJhbGc..."

# Con variabili environment
export API_URL="http://192.168.1.100:3000"
export JWT_TOKEN="your-jwt-token-here"
./scripts/test-product-endpoints.sh $API_URL $JWT_TOKEN
```

**Tests:**
- ✅ Create Product (POST /product/create)
- ✅ Get All Products (GET /product)
- ✅ Duplicate QR Code validation (should fail with 400)

**Output:**
- Crea un nuovo prodotto e salva il UUID
- Verifica che il backend ritorni asset_id e metadata_cid
- Testa validazione duplicati

---

### 2. `test-maintenance-endpoints.sh`
Testa gli endpoint delle manutenzioni.

**Usage:**
```bash
./scripts/test-maintenance-endpoints.sh [API_URL] [JWT_TOKEN] PRODUCT_UUID

# Esempio
./scripts/test-maintenance-endpoints.sh http://localhost:3000 "eyJhbGc..." "8f7e9d2a-3c4b-..."
```

**⚠️ Prerequisito:** Eseguire prima `test-product-endpoints.sh` per ottenere un PRODUCT_UUID valido.

**Tests:**
- ✅ Create Maintenance - Installazione (POST /maintenance/create)
- ✅ Create Maintenance - Manutenzione ordinaria
- ✅ Get All Maintenances (GET /maintenance)
- ✅ Invalid Product UUID validation (should fail with 400)

**Output:**
- Verifica che il backend ritorni transaction_id Algorand
- Testa creazione multipla per stesso prodotto

---

### 3. `test-gps-validation.sh`
Testa la validazione delle coordinate GPS (6 decimali, max 9 digits).

**Usage:**
```bash
./scripts/test-gps-validation.sh [API_URL] [JWT_TOKEN] PRODUCT_UUID

# Esempio
./scripts/test-gps-validation.sh http://localhost:3000 "eyJhbGc..." "8f7e9d2a-3c4b-..."
```

**Tests:**
- ✅ Valid GPS - Milan (45.464211, 9.189982)
- ✅ Valid GPS - Rome (41.902783, 12.496366)
- ✅ Valid GPS - Max 9 digits (123.456789, -98.765432)
- ❌ Invalid GPS - 10 digits (should fail with 400)
- ❌ Invalid GPS - Latitude out of range (should fail with 400)
- ❌ Invalid GPS - Longitude out of range (should fail with 400)

**Output:**
- Verifica che coordinate valide siano accettate
- Verifica che coordinate invalide siano rifiutate con 400

---

### 4. `test-error-handling.sh`
Testa la gestione degli errori del backend.

**Usage:**
```bash
./scripts/test-error-handling.sh [API_URL] [JWT_TOKEN]

# Esempio
./scripts/test-error-handling.sh http://localhost:3000 "eyJhbGc..."
```

**Tests:**
- 🔐 Unauthorized - No Token (should return 401)
- 🔐 Unauthorized - Invalid Token (should return 401)
- 🔁 Duplicate QR Code (should return 400)
- ❓ Product Not Found (should return 400)
- 📝 Missing Required Fields (should return 400)
- 🔢 Invalid Data Types (should return 400)
- 🌐 Non-existent Endpoint (should return 404)

**Output:**
- Verifica che tutti gli errori ritornino status code corretti
- Testa autenticazione JWT

---

## 🚀 Quick Start Guide

### Step 1: Configurare Environment
```bash
# Nel file .env del progetto
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000

# Nelle variabili bash
export API_URL="http://192.168.1.100:3000"
export JWT_TOKEN="your-jwt-token-here"
```

### Step 2: Test Completo in Sequenza
```bash
# 1. Test prodotti (salva il UUID output)
./scripts/test-product-endpoints.sh $API_URL $JWT_TOKEN

# Output finale contiene: "Created Product UUID for further testing: 8f7e9d2a-..."
# Copia il UUID

# 2. Test manutenzioni (usa UUID dal passo 1)
PRODUCT_UUID="8f7e9d2a-3c4b-4a1e-9f8d-7c6b5a4e3d2c"
./scripts/test-maintenance-endpoints.sh $API_URL $JWT_TOKEN $PRODUCT_UUID

# 3. Test GPS validation (usa stesso UUID)
./scripts/test-gps-validation.sh $API_URL $JWT_TOKEN $PRODUCT_UUID

# 4. Test error handling
./scripts/test-error-handling.sh $API_URL $JWT_TOKEN
```

### Step 3: Eseguire Tutti i Test Automaticamente
```bash
# Usa il master script (crea prodotto automaticamente)
./scripts/run-all-tests.sh $API_URL $JWT_TOKEN
```

---

## 📊 Interpretare i Risultati

### ✅ Test Passed
```
✅ Product created successfully!
   UUID: 8f7e9d2a-3c4b-4a1e-9f8d-7c6b5a4e3d2c
   Asset ID: 123456789
   Metadata CID: QmX5ZzPxvxhwYnN3aR8...
```

### ❌ Test Failed
```
❌ Product creation failed!
Status: 500
Message: Internal server error
```

### Summary Report
Alla fine di ogni script, viene mostrato un riepilogo:
```
==========================================
   Test Summary
==========================================
Product Creation: ✅ PASS
Get All Products: ✅ PASS
Duplicate Check:  ✅ PASS
==========================================
```

---

## 🛠️ Troubleshooting

### Errore: "Connection refused"
```bash
# Verifica che il backend sia in esecuzione
curl http://localhost:3000/health

# Verifica l'IP corretto per network access
ipconfig getifaddr en0  # macOS
ip addr show           # Linux
```

### Errore: "401 Unauthorized"
```bash
# Token scaduto o invalido - richiedi nuovo token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password"}'

# Salva il nuovo token
export JWT_TOKEN="new-token-here"
```

### Errore: "jq: command not found"
```bash
# Installa jq per parsing JSON
# macOS
brew install jq

# Linux
sudo apt-get install jq
```

### Script non eseguibile
```bash
# Rendi eseguibili tutti gli script
chmod +x scripts/test-*.sh
```

---

## 📝 Note per Backend Developer

Quando implementi il backend, assicurati che:

### Product Endpoints
- [ ] POST `/product/create` ritorna `{ status_code: 200, payload: { data: { uuid, signal_type, asset_id, metadata_cid } } }`
- [ ] GET `/product` ritorna array di prodotti
- [ ] Duplicate SHA-256 check ritorna 400
- [ ] JWT authentication verificata su ogni richiesta

### Maintenance Endpoints
- [ ] POST `/maintenance/create` ritorna `{ status_code: 200, payload: { data: { uuid, intervention_type, asset_id, metadata_cid, transaction_id } } }`
- [ ] GET `/maintenance` ritorna array di manutenzioni
- [ ] Product UUID validation (400 se non esiste)
- [ ] GPS validation (6 decimali, max 9 digit totali)

### Error Handling
- [ ] 401 per token mancante/invalido
- [ ] 400 per validazione fallita
- [ ] 404 per endpoint non esistente
- [ ] 500 per errori server

### Blockchain Integration
- [ ] Algorand asset_id generato
- [ ] IPFS metadata_cid salvato
- [ ] Transaction ID ritornato
- [ ] SHA-256 calcolato per rilevare duplicati

---

## 🔍 Debug Mode

Per vedere le richieste complete:

```bash
# Aggiungi -v a curl per verbose output
curl -v -X POST "$API_URL/product/create" ...

# Oppure usa lo script di debug
DEBUG=1 ./scripts/test-product-endpoints.sh $API_URL $JWT_TOKEN
```

---

## 📚 Riferimenti

- [Backend API Documentation](../docs/backend-integration-examples.md)
- [Frontend API Client](../lib/api/backend.ts)
- [Type Definitions](../types/)

---

**Ultimo Aggiornamento**: 29 Settembre 2024
**Versione**: 1.0.0