# API Consistency Analysis Report

**Data**: 30 Settembre 2025
**Versione**: 1.0.0
**Status**: ⚠️ Discrepanze Trovate

---

## 📋 Executive Summary

Analisi completa della coerenza tra:
- Modal Components (`/components/modals`)
- TypeScript Types (`/types`)
- API Mappers (`/lib/api/mappers.ts`)
- Backend API Documentation (`/docs/AUTHENTICATION-GUIDE.md`)

**Risultato**: Trovate **4 aree critiche** che richiedono correzione per garantire compatibilità con il backend API.

---

## 🔴 PROBLEMI CRITICI

### 1. InstallationModal - Non Compatibile con Backend

**File**: `/components/modals/InstallationModal.tsx`
**Severità**: 🔴 CRITICO
**Impact**: Il modal non può inviare dati al backend

#### Problema

Il modal usa interface `InstallationData` locale:

```typescript
interface InstallationData {
  notes: string;
  installationDate: string;
  installerName: string;
  photos?: string[];
}
```

**Backend richiede** `MaintenanceCreateRequest`:

```typescript
interface MaintenanceCreateRequest {
  intervention_type: string;        // ❌ MANCANTE
  gps_lat: number;                  // ❌ MANCANTE
  gps_lng: number;                  // ❌ MANCANTE
  year?: number;                    // ❌ MANCANTE
  poles_number?: number;            // ❌ MANCANTE
  company_id: string;               // ❌ MANCANTE
  certificate_number: string;       // ❌ MANCANTE
  reason: string;                   // ❌ MANCANTE
  notes: string;                    // ✅ OK
  product_uuid: string;             // ❌ MANCANTE
}
```

#### Impatto

- **Impossibile salvare installazioni** nel backend
- **Dati GPS non catturati** durante installazione
- **Nessun certificato blockchain** generato
- **Tracciabilità persa** - no UUID prodotto associato

#### Fix Required

```typescript
// InstallationModal.tsx - MODIFICHE NECESSARIE

import { MaintenanceCreateRequest } from '@/types/maintenance';
import { mapMaintenanceToCreateRequest } from '@/lib/api/mappers';

interface InstallationModalProps {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
  onInstall: (maintenanceData: Partial<Maintenance>) => void;  // ✅ Cambiare tipo
}

const handleInstall = async () => {
  // ✅ Cattura GPS coordinate
  const location = await Location.getCurrentPositionAsync();

  const maintenance: Partial<Maintenance> = {
    tipo_intervento: 'installazione',
    gps_lat: location.coords.latitude,
    gps_lng: location.coords.longitude,
    note: notes.trim(),
    foto_urls: photos
  };

  // ✅ Map to backend format
  const request = mapMaintenanceToCreateRequest(
    maintenance,
    product.id,           // product_uuid
    user.companyId,       // company_id
    `INST-${Date.now()}`  // certificate_number
  );

  // ✅ Send to backend
  const response = await backendAPI.createMaintenance(request);

  onInstall(maintenance);
};
```

---

### 2. Types Mancanti in maintenance.ts

**File**: `/types/maintenance.ts`
**Severità**: 🟡 MEDIO
**Impact**: TypeScript errors in ProductHistoryModal

#### Problema

`ProductHistoryModal.tsx` importa types non definiti:

```typescript
import { ProductHistory, BlockchainCertificate } from '../../types';
```

**Ma questi types NON esistono** in `/types/maintenance.ts` o `/types/index.ts`

#### Fix Required

Aggiungere in `/types/maintenance.ts`:

```typescript
// ProductHistory - Timeline eventi prodotto
export interface ProductHistory {
  id: string;
  productId: string;
  eventType: 'created' | 'installed' | 'maintained' | 'verified' | 'replaced' | 'dismissed';
  description: string;
  timestamp: string;
  performedBy: string;
  location?: {
    lat: number;
    lng: number;
  };
  certificateId?: string;
}

// BlockchainCertificate - Certificati blockchain
export interface BlockchainCertificate {
  id: string;
  productId: string;
  certificateType: 'installation' | 'maintenance' | 'verification' | 'replacement' | 'dismissal';
  transactionHash: string;
  blockNumber: number;
  timestamp: string;
  verified: boolean;
  metadata: {
    operator: string;
    notes?: string;
    [key: string]: any;
  };
}
```

---

### 3. GPS Validation Mancante

**File**: `/components/modals/ProductFormModal.tsx`
**Severità**: 🟡 MEDIO
**Impact**: Dati GPS invalidi possono essere inviati al backend

#### Problema

Backend richiede GPS con:
- **6 decimali massimi**
- **Max 9 cifre totali** (inclusi decimali)

Esempi:
- ✅ `45.464211` (2 int + 6 dec = 8 cifre)
- ✅ `123.456789` (3 int + 6 dec = 9 cifre)
- ❌ `1234.567890` (4 int + 6 dec = 10 cifre)

**ProductFormModal non valida** queste regole prima del submit.

#### Fix Required

Aggiungere validation in `useProductForm` hook:

```typescript
// hooks/scanner/useProductForm.ts

const validateGPSCoordinate = (coord: string, type: 'lat' | 'lng'): string | null => {
  if (!coord) return null;

  const num = parseFloat(coord);

  // Validate range
  if (type === 'lat' && (num < -90 || num > 90)) {
    return 'Latitudine deve essere tra -90 e 90';
  }
  if (type === 'lng' && (num < -180 || num > 180)) {
    return 'Longitudine deve essere tra -180 e 180';
  }

  // Format to 6 decimals
  const formatted = num.toFixed(6);

  // Validate total digits (max 9)
  const totalDigits = formatted.replace('.', '').replace('-', '').length;
  if (totalDigits > 9) {
    return 'Coordinate GPS supera 9 cifre totali (max 6 decimali)';
  }

  return null;
};

// In validateForm:
validateField('gpsLat', formState.gpsLat): {
  const error = validateGPSCoordinate(formState.gpsLat, 'lat');
  if (error) return error;
  return null;
}
```

---

### 4. Mapper Improvements

**File**: `/lib/api/mappers.ts`
**Severità**: 🟢 BASSO
**Impact**: Minor - Può causare dati inconsistenti

#### Problemi Minori

1. **wl_code undefined handling**:
```typescript
// Attuale
wl_code: product.wl || undefined,

// Migliore
wl_code: product.wl && product.wl.trim() !== '' ? product.wl : undefined,
```

2. **GPS formatting potrebbe fallire**:
```typescript
// Attuale
const formatCoord = (coord?: number) => {
  if (!coord) return 0;
  return parseFloat(coord.toFixed(6));
};

// Migliore con validation
const formatCoord = (coord?: number) => {
  if (!coord) return 0;

  const formatted = parseFloat(coord.toFixed(6));
  const str = Math.abs(formatted).toFixed(6).replace('.', '');

  if (str.length > 9) {
    throw new Error(`GPS coordinate ${coord} exceeds 9 total digits`);
  }

  return formatted;
};
```

3. **Year default potrebbe essere errato**:
```typescript
// In mapMaintenanceToCreateRequest
year: new Date().getFullYear(),  // ❌ Sempre anno corrente

// Migliore
year: maintenance.year || new Date().getFullYear(),  // ✅ Usa year se fornito
```

---

## ✅ COMPONENTI CORRETTI

### ProductDetailModal ✅
- **Status**: Completamente compatibile
- **Mapping**: Tutti i campi corretti
- **GPS Display**: Formattato correttamente con `.toFixed(6)`

### ProductFormModal - Struttura ✅
- **Status**: Struttura corretta
- **Mapping**: Hook `useProductForm` mappa correttamente
- **Issue**: Solo GPS validation mancante (vedi sopra)

### Types - Product ✅
- **Status**: Completamente allineato
- **Backend**: `ProductData` → `Product` mapping OK
- **Frontend**: `Product` → `ProductCreateRequest` mapping OK

### Types - Maintenance ✅
- **Status**: Struttura base corretta
- **Backend**: `MaintenanceData` → `Maintenance` mapping OK
- **Frontend**: `Maintenance` → `MaintenanceCreateRequest` mapping OK
- **Issue**: Solo types mancanti (ProductHistory, BlockchainCertificate)

---

## 📊 Impact Assessment

### Compatibilità Backend API

| Component | Product API | Maintenance API | Status |
|-----------|-------------|-----------------|--------|
| ProductFormModal | ✅ Compatible | N/A | ✅ OK |
| ProductDetailModal | ✅ Compatible | N/A | ✅ OK |
| InstallationModal | N/A | ❌ Incompatible | 🔴 BROKEN |
| ProductHistoryModal | ✅ Compatible | ✅ Compatible | 🟡 Types Missing |

### Features Impact

| Feature | Status | Can Save to Backend? | Blockchain Integration? |
|---------|--------|---------------------|------------------------|
| Create Product | ✅ OK | ✅ Yes | ✅ Yes |
| View Product | ✅ OK | N/A | N/A |
| Install Product | 🔴 BROKEN | ❌ No | ❌ No |
| View History | 🟡 WARNING | ✅ Yes | ✅ Yes (if types added) |

---

## 🔧 Recommended Fixes Priority

### Priority 1 - CRITICAL (Immediate)
1. ✅ **Fix InstallationModal** - Add full MaintenanceCreateRequest support
2. ✅ **Add GPS Validation** - Implement 6 decimals / 9 digits validation

### Priority 2 - HIGH (This Week)
3. ✅ **Add Missing Types** - ProductHistory, BlockchainCertificate
4. ✅ **Improve Mappers** - Better error handling and validation

### Priority 3 - MEDIUM (Next Sprint)
5. ✅ **Add Integration Tests** - Test mapper conversions
6. ✅ **Add Type Guards** - Runtime validation for API responses

---

## 📝 Implementation Checklist

### InstallationModal Fix

- [ ] Importare `MaintenanceCreateRequest` type
- [ ] Aggiungere GPS location capture
- [ ] Usare `mapMaintenanceToCreateRequest`
- [ ] Integrare con `backendAPI.createMaintenance`
- [ ] Gestire response (uuid, asset_id, transaction_id)
- [ ] Testare flusso completo end-to-end

### GPS Validation

- [ ] Aggiungere `validateGPSCoordinate` in `useProductForm`
- [ ] Validare range (-90/90 lat, -180/180 lng)
- [ ] Validare formato (6 decimals, max 9 digits)
- [ ] Mostrare errori user-friendly
- [ ] Testare edge cases

### Missing Types

- [ ] Definire `ProductHistory` in `types/maintenance.ts`
- [ ] Definire `BlockchainCertificate` in `types/maintenance.ts`
- [ ] Esportare da `types/index.ts`
- [ ] Aggiornare imports in `ProductHistoryModal`
- [ ] Verificare no TypeScript errors

### Mapper Improvements

- [ ] Migliorare `formatCoord` con validation
- [ ] Migliorare handling di `wl_code` undefined
- [ ] Fix `year` default in maintenance mapper
- [ ] Aggiungere error handling per GPS invalid
- [ ] Unit tests per tutti i mappers

---

## 🧪 Testing Strategy

### Unit Tests Required

```typescript
// mappers.test.ts
describe('GPS Coordinate Formatting', () => {
  it('should format valid coordinates', () => {
    expect(formatCoord(45.4642111)).toBe(45.464211);
  });

  it('should throw on coordinates exceeding 9 digits', () => {
    expect(() => formatCoord(1234.567890)).toThrow();
  });
});

describe('Product Mapping', () => {
  it('should map frontend Product to backend ProductCreateRequest', () => {
    const product: Partial<Product> = { /* ... */ };
    const request = mapProductToCreateRequest(product, 'user-1');
    expect(request.signal_type).toBe(product.tipo_segnale);
  });
});
```

### Integration Tests Required

```typescript
// installation.integration.test.ts
describe('Installation Flow', () => {
  it('should create maintenance record with valid GPS', async () => {
    const product = mockProduct();
    const maintenance = await createInstallation(product);

    expect(maintenance.gps_lat).toBeLessThanOrEqual(90);
    expect(maintenance.uuid).toBeDefined();
    expect(maintenance.transaction_id).toBeDefined();
  });
});
```

---

## 📚 Documentation Updates Required

### Files to Update

1. **AUTHENTICATION-GUIDE.md** ✅ Already correct
2. **components/modals/CLAUDE.md** - Add InstallationModal example
3. **types/CLAUDE.md** - Document ProductHistory, BlockchainCertificate
4. **lib/CLAUDE.md** - Document mapper validation rules

---

## 🎯 Success Criteria

Fix è completo quando:

- ✅ InstallationModal salva correttamente nel backend
- ✅ Backend ritorna uuid, asset_id, transaction_id
- ✅ GPS coordinates rispettano vincoli (6 dec, 9 digits)
- ✅ No TypeScript errors in ProductHistoryModal
- ✅ Unit tests passano al 100%
- ✅ Integration test completo funziona

---

## 🔗 Related Files

### Files da Modificare

```
components/modals/InstallationModal.tsx       🔴 CRITICAL
hooks/scanner/useProductForm.ts               🟡 MEDIUM
types/maintenance.ts                          🟡 MEDIUM
lib/api/mappers.ts                            🟢 LOW
```

### Files di Reference

```
docs/AUTHENTICATION-GUIDE.md                  ✅ Already correct
lib/api/backend.ts                            ✅ Already correct
types/product.ts                              ✅ Already correct
```

---

## 📞 Support

Per domande o chiarimenti su questo report:
- **Backend API**: Team backend per conferma validazioni
- **Frontend Implementation**: Team frontend per fix dei modal
- **Testing**: Team QA per integration tests

---

**Report generato**: 30 Settembre 2025
**Prossima review**: Dopo implementazione fix Priority 1