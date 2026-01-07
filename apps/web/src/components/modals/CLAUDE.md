# CLAUDE.md - /src/components/modals

Modal components per operazioni CRUD allineati con API backend.

## 📁 Struttura

```
modals/
├── ProductModal.tsx            # ✅ Allineato con /product/create API
├── MaintenanceModal.tsx        # ✅ Allineato con /maintenance/create API
├── EmployeeModal.tsx           # ⚠️ Endpoint API mancanti
├── MaintenanceDetailModal.tsx  # Modal visualizzazione dettagli
└── QRCodeModal.tsx             # QR code visualization e download
```

## 🎯 Allineamento API

### ✅ ProductModal.tsx → `/product/create`

**Endpoint**: `POST /product/create`

**Campi Form → API Mapping**:
```typescript
{
  qr_code: string;              // ✅ Auto-generato (QR{timestamp})
  tipologia_segnale: 'permanente' | 'temporanea'; // UI value
  signal_type: string;          // ✅ API value (descrittivo)
  anno: string;                 // ✅ → production_year (int)
  forma: string;                // ✅ → shape
  dimensioni: string;           // ✅ → dimension
  wl: string;                   // ✅ → wl_code
  materialeSupporto: string;    // ✅ → support_material
  spessoreSupporto: string;     // ✅ → support_thickness
  materialePellicola: string;   // ✅ → fixation_class
  fissaggio: string;            // ✅ → fixation_method
  created_by: string;           // ✅ User ID (obbligatorio)
}
```

**Validazione Form**:
- ✅ QR code univoco (auto-generato o manuale)
- ✅ signal_type obbligatorio
- ✅ Anno produzione (1990 - anno corrente)
- ✅ Forma geometrica selezionata
- ✅ created_by presente (da parent component)

**Utilizzo**:
```typescript
<ProductModal
  isOpen={showModal}
  onClose={handleClose}
  onSubmit={(data) => {
    // Data già allineato con API /product/create
    const apiRequest = {
      qr_code: data.qr_code,
      signal_type: data.signal_type,
      production_year: parseInt(data.anno),
      shape: data.forma,
      dimension: data.dimensioni,
      wl_code: data.wl,
      support_material: data.materialeSupporto,
      support_thickness: data.spessoreSupporto,
      fixation_class: data.materialePellicola,
      fixation_method: data.fissaggio,
      created_by: currentUser.id
    };

    // POST /product/create
    await backendAPI.createProduct(apiRequest);
  }}
  mode="add"
/>
```

**Caratteristiche**:
- Step wizard (2 passi): Tipologia → Dettagli
- Auto-generazione QR code con timestamp
- Validazione campi obbligatori real-time
- Support per edit mode con pre-popolamento dati

---

### ✅ MaintenanceModal.tsx → `/maintenance/create`

**Endpoint**: `POST /maintenance/create`

**Campi Form → API Mapping**:
```typescript
{
  product_uuid: string;         // ✅ UUID prodotto (obbligatorio)
  intervention_type: 'installation' | 'maintenance' | 'replacement' | 'verification' | 'dismissal'; // ✅ API value inglese
  tipo_intervento: 'installazione' | 'manutenzione' | 'sostituzione' | 'verifica' | 'dismissione'; // UI value italiano

  gps_lat: number;              // ✅ Latitudine (6 decimali, max 9 cifre)
  gps_lng: number;              // ✅ Longitudine (6 decimali, max 9 cifre)
  year?: number;                // ✅ Anno intervento (opzionale)
  poles_number?: number;        // ✅ Numero pali (solo installation)
  company_id: string;           // ✅ ID azienda (obbligatorio)
  certificate_number: string;   // ✅ N° certificato (obbligatorio)
  reason: string;               // ✅ Causale (obbligatorio)
  notes: string;                // ✅ Note dettagliate (obbligatorio)

  foto_urls?: File[];           // File locali (convertiti in base64 per API)
}
```

**Mappatura Tipi Intervento (UI → API)**:
```typescript
const interventionTypeMap = {
  'installazione': 'installation',
  'manutenzione': 'maintenance',
  'sostituzione': 'replacement',
  'verifica': 'verification',
  'dismissione': 'dismissal'
} as const;
```

**Validazione GPS**:
- Max 6 decimali di precisione
- Max 10 cifre totali (inclusi decimali)
- Esempi validi: `45.464211`, `123.456789`, `1234.567890`
- Esempi invalidi: `12345.678901` (11 cifre)

**Validazione Form**:
- ✅ product_uuid selezionato
- ✅ intervention_type valido
- ✅ Coordinate GPS valide
- ✅ company_id presente
- ✅ certificate_number univoco
- ✅ reason e notes compilate
- ✅ poles_number obbligatorio per installation

**Utilizzo**:
```typescript
<MaintenanceModal
  isOpen={showModal}
  onClose={handleClose}
  onSubmit={(data) => {
    // Data già allineato con API /maintenance/create
    const apiRequest = {
      product_uuid: data.product_uuid,
      intervention_type: data.intervention_type, // Già in inglese
      gps_lat: parseFloat(data.gps_lat.toFixed(6)), // Max 6 decimali
      gps_lng: parseFloat(data.gps_lng.toFixed(6)),
      year: data.year,
      poles_number: data.poles_number,
      company_id: data.company_id,
      certificate_number: data.certificate_number,
      reason: data.reason,
      notes: data.notes
    };

    // POST /maintenance/create
    await backendAPI.createMaintenance(apiRequest);
  }}
  mode="add"
  preSelectedProductId={productUuid}
/>
```

**Caratteristiche**:
- Campi condizionali basati su tipo intervento
- GPS auto-detection con navigator.geolocation
- Upload foto multiplo con preview
- Validazione GPS secondo specifica backend
- Mappatura automatica UI italiano → API inglese

---

### ⚠️ EmployeeModal.tsx - API MANCANTI

**Stato**: ❌ **Endpoint non documentati in AUTHENTICATION-GUIDE.md**

**Endpoint Necessari**:
- `POST /employee/create` - Crea dipendente
- `GET /employees?company_id={id}` - Lista dipendenti azienda
- `PUT /employee/{uuid}` - Aggiorna dipendente
- `DELETE /employee/{uuid}` - Elimina dipendente

**Documentazione**: Vedi `/src/app/api/MISSING_ENDPOINTS.md`

**Workaround Attuale**:
- Usa mock data in `/src/lib/mock-data.ts`
- Form completo e validato
- Pronto per integrazione API quando disponibile

**Campi Form**:
```typescript
{
  name: string;          // Nome completo
  email: string;         // Email aziendale
  password: string;      // Password (obbligatoria solo in add mode)
  role: 'employee' | 'manager'; // Ruolo utente
}
```

**Alternativa Temporanea**:
```typescript
// Usare /auth/register per creare utenti
const response = await fetch('/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY
  },
  body: JSON.stringify({
    email: employeeData.email,
    password: employeeData.password,
    name: employeeData.name,
    role: employeeData.role,
    companyId: currentUser.companyId
  })
});
```

**Limitazioni**:
- Non supporta GET lista dipendenti filtrata per company
- Non supporta UPDATE dipendente esistente
- Non supporta DELETE dipendente

---

## 🎨 Pattern Comuni

### Dynamic Loading
```typescript
// Lazy load modals per performance
const ProductModal = dynamic(() =>
  import("@/components/modals/ProductModal")
    .then(mod => ({ default: mod.ProductModal })),
  { ssr: false }
);

// Suspense wrapper
{showModal && (
  <Suspense fallback={<ModalSkeleton />}>
    <ProductModal isOpen={showModal} onClose={handleClose} />
  </Suspense>
)}
```

### Form Validation Pattern
```typescript
const isFormValid = useMemo(() =>
  requiredField1 &&
  requiredField2 &&
  (conditionalField || !needsConditional),
  [requiredField1, requiredField2, conditionalField, needsConditional]
);
```

### Optimized State Management
```typescript
const handleInputChange = useCallback((field, value) => {
  setFormData(prev => ({ ...prev, [field]: value }));
}, []);

const handleSubmit = useCallback(async (e) => {
  e.preventDefault();
  if (isSubmitting) return;

  setIsSubmitting(true);
  try {
    await onSubmit?.(formData);
    handleReset();
    onClose();
  } finally {
    setIsSubmitting(false);
  }
}, [formData, isSubmitting, onSubmit, onClose]);
```

## 🔧 Testing

### Unit Tests
```typescript
describe('ProductModal', () => {
  it('should generate unique QR code on mount', () => {
    render(<ProductModal isOpen={true} />);
    const qrInput = screen.getByLabelText('Codice QR');
    expect(qrInput.value).toMatch(/^QR\d+$/);
  });

  it('should validate required fields', () => {
    render(<ProductModal isOpen={true} />);
    const submitBtn = screen.getByText('Crea Prodotto');
    expect(submitBtn).toBeDisabled();
  });
});
```

### Integration Tests
```typescript
describe('MaintenanceModal API Integration', () => {
  it('should map UI fields to API format correctly', async () => {
    const handleSubmit = jest.fn();
    render(
      <MaintenanceModal
        isOpen={true}
        onSubmit={handleSubmit}
      />
    );

    // Fill form with UI values (italiano)
    await userEvent.selectOptions(
      screen.getByLabelText('Categoria'),
      'installazione'
    );

    // Submit form
    await userEvent.click(screen.getByText('Registra Intervento'));

    // Verify API format (inglese)
    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        intervention_type: 'installation'
      })
    );
  });
});
```

## 📚 Best Practices

### 1. Always Align with API
- Field names must match backend expectations
- Use proper data types (number vs string)
- Implement bi-directional mapping (UI ↔ API)

### 2. Validation Rules
- Client-side validation for UX
- Match backend validation rules exactly
- Provide clear error messages

### 3. Performance
- Lazy load heavy modals
- Memoize expensive computations
- Debounce user input where appropriate

### 4. Error Handling
```typescript
try {
  await onSubmit(formData);
  toast.success('Operazione completata');
  onClose();
} catch (error) {
  if (error.message.includes('duplicate')) {
    toast.error('QR code già esistente');
  } else {
    toast.error('Errore durante il salvataggio');
  }
}
```

## 🚀 Future Improvements

### ProductModal
- [ ] Auto-suggest signal_type basato su tipologia
- [ ] Validazione QR code duplicati real-time
- [ ] Upload immagine prodotto con preview

### MaintenanceModal
- [ ] Map integration per GPS selection
- [ ] Offline support con sync
- [ ] Foto compression prima dell'upload

### EmployeeModal
- [ ] Integrazione con endpoint `/employee/*` quando disponibili
- [ ] Password strength meter
- [ ] Email validation con check esistenza
- [ ] Role permissions visualization

---

**Ultimo Aggiornamento**: 30 Settembre 2025
**Allineamento API**: ProductModal ✅ | MaintenanceModal ✅ | EmployeeModal ⚠️