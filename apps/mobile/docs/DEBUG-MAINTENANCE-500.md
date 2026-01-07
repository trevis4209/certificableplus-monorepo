# Debug Guide: Errore 500 su /maintenance/create

## Situazione Attuale

**Errore**: `500 Internal Server Error` quando si tenta di creare una manutenzione
**Product UUID**: `a6f00b3b-688e-412f-a0ee-159bb6015ed9`
**Tipo intervento**: `installation`

**JSON inviato** (CORRETTO secondo documentazione):
```json
{
  "intervention_type": "installation",
  "gps_lat": "45.753017",
  "gps_lng": "11.699731",
  "company_id": "1",
  "certificate_number": "CERT-2025-262",
  "reason": "Hshshsjs",
  "notes": "Hsjsjsjs",
  "product_uuid": "a6f00b3b-688e-412f-a0ee-159bb6015ed9",
  "year": 2025,
  "poles_number": 1
}
```

## Cosa significa errore 500?

- **500 = Server crash**, NON problema di validazione
- Il backend sta crashando durante l'elaborazione della richiesta
- Possibili cause:
  - Errore Algorand blockchain
  - Errore IPFS upload
  - Product UUID non esiste nel database
  - Installazione duplicata (vincolo UNIQUE)
  - Bug nel codice backend

## Steps di Debug

### 1. Logging Migliorato ✅

Ho aggiunto logging dettagliato in `backend.ts`. Ora vedrai:

```
🌐 [BackendAPI] createMaintenance - Starting request...
📋 [BackendAPI] Request payload: {...}
🔍 [BackendAPI] Field validation:
  - intervention_type: installation (string)
  - gps_lat: 45.753017 (string) length: 9
  - gps_lng: 11.699731 (string) length: 9
  - year: 2025 (number)
  - poles_number: 1 (number)
  ...
```

### 2. Verifica Product Esiste

**Opzione A - Manualmente via API:**
```bash
curl -H "x-api-key: Dm6hNWqD0T64hBpvlwmOB3WC2cBEEmFAa2C3ETz4" \
  https://api-dev.geosign.toknox.com/product
```

Cerca `a6f00b3b-688e-412f-a0ee-159bb6015ed9` nella risposta.

**Opzione B - Via App:**
Ho creato `utils/debug-backend.ts` con funzioni helper. Puoi usarle così:

```typescript
import { verifyProductExists, getProductDetails } from '@/utils/debug-backend';

// In un componente o hook
useEffect(() => {
  getProductDetails('a6f00b3b-688e-412f-a0ee-159bb6015ed9');
}, []);
```

### 3. Verifica Installazioni Esistenti

**⚠️ PROBLEMA NOTO**: GET `/maintenance` NON ritorna `product_uuid`, quindi non possiamo verificare se esiste già un'installazione per questo specifico prodotto.

**Workaround**: Controlla manualmente via API:
```bash
curl -H "x-api-key: Dm6hNWqD0T64hBpvlwmOB3WC2cBEEmFAa2C3ETz4" \
  https://api-dev.geosign.toknox.com/maintenance
```

Conta quante installazioni (`intervention_type: "installation"`) esistono.

### 4. Test con Nuovo Prodotto

**Strategia**: Crea un prodotto NUOVO da zero e prova l'installazione su quello.

**Passi**:
1. Crea un nuovo prodotto via scanner con QR code univoco
2. Annota il UUID del prodotto creato
3. Prova l'installazione su quel prodotto
4. Se funziona → il problema è specifico al prodotto `a6f00b3b-688e-412f-a0ee-159bb6015ed9`

### 5. Contattare Team Backend (NECESSARIO)

Il 500 è un crash lato server. **Solo il team backend può risolverlo** fornendo:

**Richiedi dal backend team**:
- ✅ Stack trace completo del crash
- ✅ Log del server al momento dell'errore
- ✅ Stato Algorand blockchain connection
- ✅ Stato IPFS upload service
- ✅ Verificare vincoli database non documentati

**Dati da fornire al backend**:
```
Timestamp: [quando hai provato]
Endpoint: POST /maintenance/create
Product UUID: a6f00b3b-688e-412f-a0ee-159bb6015ed9
Company ID: 1
Error: 500 Internal Server Error

Request payload: (copia il JSON dalla console)
```

## Possibili Cause Specifiche

### Causa 1: Product Non Esiste
**Sintomo**: 500 error
**Test**: GET `/product` e cerca l'UUID
**Soluzione**: Creare il prodotto prima

### Causa 2: Installazione Duplicata
**Sintomo**: 500 error
**Ipotesi**: Database ha vincolo UNIQUE su `(product_uuid, intervention_type='installation')`
**Test**: Controllare GET `/maintenance` per installazioni esistenti
**Soluzione**: Non si può fare una seconda installazione

### Causa 3: Algorand/IPFS Failure
**Sintomo**: 500 error
**Endpoint dice**: "Updates the product's metadata CID and Algorand asset"
**Test**: Solo backend può verificare
**Soluzione**: Backend deve fixare connessione blockchain/IPFS

### Causa 4: Company ID Invalido
**Sintomo**: 500 error
**Test**: Verificare che `company_id: "1"` esista nel database
**Soluzione**: Usare company ID valido

## Workaround Temporanei

### Workaround 1: Prova con Altro Prodotto
Scansiona un nuovo QR code, crea il prodotto, poi fai l'installazione.

### Workaround 2: Usa Tipo Intervento Diverso
Se l'installazione fallisce, prova con:
- `maintenance` (manutenzione ordinaria)
- `verification` (verifica stato)

**NOTA**: Questo non risolve il problema ma ti permette di testare se è specifico a `installation`.

## Conclusione

**Frontend: ✅ CORRETTO** - Il JSON inviato è perfetto secondo documentazione
**Backend: ❌ CRASHING** - Serve intervento del team backend

**Prossimi Step**:
1. ✅ Logging migliorato (fatto)
2. 🔄 Verifica product esiste
3. 🔄 Testa con nuovo prodotto
4. ⏳ Contatta backend team con log dettagliati

## File Modificati

- ✅ `/lib/api/backend.ts` - Logging dettagliato aggiunto
- ✅ `/utils/debug-backend.ts` - Utility di debug create
- ✅ `/types/maintenance.ts` - Tipi corretti (GPS string, poles_number number)
- ✅ `/lib/api/mappers.ts` - Mapper allineato con endpoint

**Tutti i file frontend sono corretti e compliant con la documentazione API.**
