# Quick Test Guide - Backend Integration

**Guida rapida per testare il backend domani con il tuo esperto**

---

## 🚀 Setup Veloce (5 minuti)

### 1. Configurare Environment
```bash
# Nel terminale, setta queste variabili
export API_URL="http://192.168.1.100:3000"  # <-- Cambia con IP del backend
export JWT_TOKEN="your-jwt-token-here"      # <-- Token dopo login
```

### 2. Test Backend Online
```bash
# Verifica che il backend risponda
curl $API_URL/health
# o
curl $API_URL
```

### 3. Ottenere JWT Token
```bash
# Login per ottenere token (se necessario)
curl -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# Copia il token dalla risposta e salvalo
export JWT_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 🧪 Eseguire i Test (3 modi)

### Opzione A: Test Completo Automatico (Consigliato)
```bash
# Esegue TUTTI i test in sequenza
./scripts/run-all-tests.sh $API_URL $JWT_TOKEN
```

**Output:** Report completo con tutti i risultati ✅/❌

---

### Opzione B: Test Individuali
```bash
# 1. Test Prodotti (ottieni UUID)
./scripts/test-product-endpoints.sh $API_URL $JWT_TOKEN
# Output: "Created Product UUID: 8f7e9d2a-..."

# Salva UUID per i prossimi test
export PRODUCT_UUID="8f7e9d2a-3c4b-4a1e-9f8d-7c6b5a4e3d2c"

# 2. Test Manutenzioni
./scripts/test-maintenance-endpoints.sh $API_URL $JWT_TOKEN $PRODUCT_UUID

# 3. Test GPS
./scripts/test-gps-validation.sh $API_URL $JWT_TOKEN $PRODUCT_UUID

# 4. Test Errori
./scripts/test-error-handling.sh $API_URL $JWT_TOKEN
```

---

### Opzione C: Test Manuale con cURL

#### Creare Prodotto
```bash
curl -X POST "$API_URL/product/create" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "qr_code": "TEST-001",
    "signal_type": "Pericolo - Test",
    "production_year": 2024,
    "shape": "Triangolare",
    "dimension": "90x90cm",
    "wl_code": "WL-TEST",
    "support_material": "Alluminio spessore 25/10",
    "support_thickness": "2.5mm",
    "fixation_class": "Classe RA2",
    "fixation_method": "Palo sostegno diametro 60mm",
    "created_by": "test-user-id"
  }'
```

#### Recuperare Prodotti
```bash
curl -X GET "$API_URL/product" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

#### Creare Manutenzione
```bash
curl -X POST "$API_URL/maintenance/create" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "intervention_type": "installazione",
    "gps_lat": 45.464211,
    "gps_lng": 9.189982,
    "year": 2024,
    "poles_number": 2,
    "company_id": "company-id",
    "certificate_number": "CERT-001",
    "reason": "Nuova installazione",
    "notes": "Test manutenzione",
    "product_uuid": "uuid-from-product-creation"
  }'
```

---

## ✅ Checklist Verifica Backend

Quando il backend è pronto, verifica che:

### Endpoint Product
- [ ] `POST /product/create` ritorna 200 con `uuid`, `asset_id`, `metadata_cid`
- [ ] `GET /product` ritorna array di prodotti
- [ ] QR code duplicato ritorna 400
- [ ] Richiesta senza token ritorna 401

### Endpoint Maintenance
- [ ] `POST /maintenance/create` ritorna 200 con `transaction_id`
- [ ] `GET /maintenance` ritorna array di manutenzioni
- [ ] Product UUID invalido ritorna 400
- [ ] GPS invalido (>9 digits) ritorna 400

### Blockchain
- [ ] `asset_id` Algorand presente nella risposta
- [ ] `metadata_cid` IPFS presente nella risposta
- [ ] `transaction_id` Algorand presente nella risposta
- [ ] SHA-256 calcolato per rilevare duplicati

---

## 🔍 Cosa Aspettarsi

### ✅ Risposta Corretta - Prodotto Creato
```json
{
  "status_code": 200,
  "message": "Product Successfully Created and Tokenized.",
  "payload": {
    "data": {
      "uuid": "8f7e9d2a-3c4b-4a1e-9f8d-7c6b5a4e3d2c",
      "signal_type": "Pericolo - Test",
      "asset_id": 123456789,
      "metadata_cid": "QmX5ZzPxvxhwYnN3aR8dKjT9qLmP2sW4vB6cN7eM8fG1hJ"
    }
  }
}
```

### ✅ Risposta Corretta - Manutenzione Creata
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

### ❌ Errore Atteso - QR Duplicato
```json
{
  "status_code": 400,
  "message": "Product with this SHA-256 already exists",
  "payload": {
    "data": null
  }
}
```

### ❌ Errore Atteso - Token Invalido
```json
{
  "status_code": 401,
  "message": "Token expired or invalid",
  "payload": {
    "data": null
  }
}
```

---

## 🚨 Troubleshooting Veloce

### Backend non raggiungibile
```bash
# Test connessione
ping 192.168.1.100

# Test porta
telnet 192.168.1.100 3000

# Verifica backend in esecuzione sul server
# (sul server backend)
netstat -an | grep 3000
```

### Token scaduto
```bash
# Richiedi nuovo token
curl -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

### GPS validation fallita
```bash
# GPS validi (devono essere accettati)
"gps_lat": 45.464211    # ✅ 8 digits totali
"gps_lng": 9.189982     # ✅ 7 digits totali
"gps_lat": 123.456789   # ✅ 9 digits totali (MAX)

# GPS invalidi (devono essere rifiutati con 400)
"gps_lat": 1234.567890  # ❌ 10 digits totali (TROPPI)
```

---

## 📊 Interpretare i Risultati Test

### Script Automatico Output
```
==========================================
   Test Summary
==========================================
Product Creation: ✅ PASS
Get All Products: ✅ PASS
Duplicate Check:  ✅ PASS
==========================================
```

### Se vedi ❌ FAIL
1. Leggi il messaggio di errore nel JSON response
2. Verifica il `status_code` ricevuto vs atteso
3. Controlla il formato dei dati inviati
4. Verifica il token JWT sia valido

---

## 📞 Domande da Fare al Backend Developer

### Setup
- ✅ Qual è l'URL del backend? (es: http://192.168.1.100:3000)
- ✅ Come ottengo un token JWT di test?
- ✅ Quali credenziali usare per login?

### Implementazione
- ✅ Algorand è configurato? (asset_id generato?)
- ✅ IPFS è configurato? (metadata_cid salvato?)
- ✅ SHA-256 check per duplicati implementato?
- ✅ GPS validation (max 9 digits) implementata?

### Testing
- ✅ Possiamo eseguire gli script di test insieme?
- ✅ Ci sono log backend per debug?
- ✅ Database MySQL è accessibile per verifica dati?

---

## 📚 File di Riferimento

- **Documentazione Completa**: `docs/backend-integration-examples.md`
- **Script di Test**: `scripts/` directory
- **README Script**: `scripts/README.md`
- **Frontend API Client**: `lib/api/backend.ts`
- **Type Definitions**: `types/product.ts`, `types/maintenance.ts`

---

## 🎯 Prossimi Passi Dopo Test Positivi

1. **Aggiornare .env** con URL production
2. **Testare da App Mobile**
   - Aprire app su device/simulator
   - Scanner QR → Creare prodotto
   - Verificare transaction_id blockchain
3. **Deploy Backend** su server production
4. **Monitoraggio**: Setup logging e monitoring

---

**Ultimo Aggiornamento**: 29 Settembre 2024
**Pronto per Testing**: ✅
**Tempo Stimato Testing Completo**: ~15-30 minuti