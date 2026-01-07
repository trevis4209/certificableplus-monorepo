### Frontend Implementation Checklist (Solo UI/Client)

Documento di riferimento operativo per completare tutte le parti frontend. Mantenerlo aggiornato spuntando i task.

---

### Scopo
- **Sostituire i mock con un layer dati lato client** (fetchers + React Query)
- **Completare i form** con React Hook Form + Zod, upload immagini, toasts e UX
- **Abilitare scanner QR, geolocalizzazione e mappa reale**
- **Rendere le liste usabili** (paginazione, sorting, filtri, skeletons, errori)
- **Migliorare navigazione, a11y, performance, test, meta**

---

### Pacchetti suggeriti
- @tanstack/react-query
- @zxing/browser (scanner QR) oppure jsqr
- leaflet + react-leaflet (mappa) + opzionale: react-leaflet-cluster
- browser-image-compression (compressione immagini) – opzionale
- @testing-library/react, @testing-library/user-event, jest – test

---

### Struttura file da creare
- `src/lib/react-query.ts` (QueryClient e config)
- `src/lib/api/products.ts`, `src/lib/api/maintenance.ts`, `src/lib/api/auth.ts` (fetchers asincroni, per ora puntano a mock)
- `src/hooks/useProducts.ts`, `src/hooks/useMaintenance.ts`, `src/hooks/useSession.ts` (React Query hooks)
- `src/components/forms/ProductForm.tsx`, `src/components/forms/MaintenanceForm.tsx`
- `src/components/upload/ImageUploader.tsx`
- `src/components/scanner/QRScanner.tsx`
- `src/lib/geo.ts` (geolocalizzazione)
- `src/components/map/MapView.tsx` (Leaflet)
- `src/components/common/ErrorBoundary.tsx`

---

### Step-by-step

1) Abilitare React Query (stato remoto client)
- [ ] Aggiungere @tanstack/react-query
- [ ] Creare `src/lib/react-query.ts` con `queryClient` e opzioni (retry, gcTime, staleTime)
- [ ] Wrappare `{children}` in `src/app/layout.tsx` con `QueryClientProvider` (+ `HydrationBoundary` se necessario)
- Done quando: qualunque componente può usare `useQuery`/`useMutation`

2) Sostituire navigazione imperativa
- [ ] Rimuovere `window.location.href` e usare `useRouter().push/replace` e `<Link>`
- File: `company/dashboard`, `employee/maintenance`, `components/layout/EmployeeMobileNavbar`, `employee/scanner`, `employee/products`, `company/products`, `employee/profile`
- Done quando: nessun `window.location.href` rimasto

3) Layer dati lato client (sostituisce accesso diretto ai mock)
- [ ] Creare fetchers asincroni (per ora leggono da `mock-data`)
- [ ] Creare hooks React Query: `useProducts`, `useMaintenance`, `useSession`
- [ ] Rimpiazzare accessi diretti a `mock-data` nelle pagine con gli hook
- Done quando: tutte le pagine consumano dati via hooks

4) Loading/Errore/Skeletons
- [ ] Aggiungere skeletons nelle liste/tabelle/cards durante `isLoading`
- [ ] Visualizzare messaggi di errore coerenti (`isError`/`error`)
- File prioritari: `company/products`, `employee/products`, `employee/maintenance`, `public/products`
- Done quando: UX coerente per loading/errore in tutte le viste dati

5) Form “Nuovo Prodotto” (RHF + Zod)
- [ ] `ProductForm` con `react-hook-form` + `zodResolver(productSchema)`
- [ ] Validazioni inline, stato submit, reset
- [ ] Integrazione in `company/products` (modale “Nuovo Prodotto”) e dove serve
- Done quando: submit mock + toast successo/errore

6) Form “Nuova Manutenzione” (RHF + Zod)
- [ ] `MaintenanceForm` con tipo intervento, note, productId (hidden se da scanner)
- [ ] Auto-fill UI: data/ora, utente (mock session), GPS (placeholder finché Step 9)
- [ ] Integrazione in `employee/maintenance` (modale)
- Done quando: validazioni + submit mock + toast

7) Upload immagini (solo client)
- [ ] `ImageUploader` con input multiplo, anteprima, limiti peso/numero, compressione opzionale
- [ ] Integrare in `ProductForm` e `MaintenanceForm`
- Done quando: immagini selezionabili con preview e stato

8) Scanner QR reale (web)
- [ ] `QRScanner` basato su `@zxing/browser` (o jsQR)
- [ ] Start/stop camera, overlay, gestione permessi/errore, fallback input manuale
- [ ] Integrare in `employee/scanner` sostituendo la simulazione
- Done quando: lettura QR in browser mobile/desktop

9) Geolocalizzazione browser
- [ ] `src/lib/geo.ts` con `getCurrentPosition` (promisified) + timeouts/gestione errori
- [ ] Integrare in `MaintenanceForm` (auto-fill GPS) e pagina mappa (“la tua posizione”)
- Done quando: permessi gestiti, coordinate mostrate, errori gestiti

10) Mappa reale (Leaflet)
- [ ] Installare `leaflet` + `react-leaflet`, dynamic import con `next/dynamic`
- [ ] `MapView` con markers colorati per stato, popup con azioni, clustering (opzionale)
- [ ] Integrare in `employee/map` (e public se serve)
- Done quando: markers da prodotti (con GPS) + popup navigabili

11) Tabelle e liste: sorting/paginazione/filtri client
- [ ] Ordinamento per colonne principali
- [ ] Paginazione (10/25/50)
- [ ] Filtri combinati (tipo/stato/data)
- File: `company/products`, `employee/products`, `public/products`
- Done quando: UX liste migliorata senza fetch server

12) Toasts e conferme
- [ ] Aggiungere provider toasts (shadcn) se non c’è
- [ ] Sostituire `alert`/`console.log` con toasts (success/error)
- [ ] Conferme per azioni invasive (es. abbandono form con modifiche)
- Done quando: feedback coerente su submit/errori

13) Accessibilità e focus management
- [ ] Labels/aria per input e controlli, ruoli ARIA per modali/dialog
- [ ] Gestione focus su apertura/chiusura modali, annunci errori form
- Done quando: navigazione tastiera fluida e controlli etichettati

14) Error boundaries
- [ ] `ErrorBoundary` e wrap delle pagine critiche
- Done quando: crash confinati con fallback + retry

15) Performance e code splitting
- [ ] Dynamic import per componenti pesanti: `QRScanner`, `MapView`, form complessi
- [ ] Lazy icone/risorse pesanti dove utile
- Done quando: bundle ridotto e LCP/TTI migliori



Da fare

16) Testing frontend
- [ ] Setup Jest + RTL + user-event
- [ ] Test: `ProductForm`, `MaintenanceForm` (validazioni), `QRScanner` (mock camera), `MapView` (smoke), hooks con React Query
- Done quando: smoke + test validazioni critici verdi

17) SEO e meta (viste pubbliche)
- [ ] Metadata dinamico per `public/*` (title/description/OG)
- Done quando: titoli/descrizioni significativi presenti

18) PWA (opzionale, solo client)
- [ ] Manifest + Service Worker (es. `next-pwa`)
- [ ] Install prompt e caching base asset
- Done quando: app installabile su mobile, shell offline rudimentale

---

### Linee guida UI/UX
- Niente `window.location.href`; usare router Next
- Skeletons uniformi, empty states chiari
- Toasts coerenti (success/error/info)
- Stati `isLoading`/`isError` sempre gestiti
- Evitare re-render inutili (memo/callback dove necessario)
- Dynamic import per scanner/mappa

### A11y & i18n
- Etichette, `aria-*`, focus management nelle modali
- Struttura per i18n base (IT/EN) pronta a estensione

### Criteri di “Done” Globali
- Ogni pagina dati: loading, errore, empty state, contenuto
- Nessun accesso diretto a `mock-data` dalle pagine (solo via hooks)
- Form con RHF+Zod + toasts + gestione errori
- Scanner e mappa reali funzionanti su web
- Navigazione senza ricariche con router Next
- Test minimi verdi su form e componenti critici


