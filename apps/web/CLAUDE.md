# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development
npm run dev --turbopack    # Start development server with Turbopack
npm run build             # Build production version
npm start                 # Start production server
npm run lint             # Run ESLint

# No test scripts configured - check with user if needed
```

## Architecture Overview

CertificablePlus is a Next.js 15 certificate management application with multi-role authentication:

- **Tech Stack**: Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Authentication**: Mock-based system with three user roles (company, employee, viewer)
- **Data**: Currently using mock data (`src/lib/mock-data.ts`) - no real database integration yet
- **Styling**: Tailwind CSS v4 with shadcn/ui components and dark/light theme support

## Project Structure

```
src/
├── CLAUDE.md               # Documentazione principale del progetto
├── app/                    # Next.js App Router
│   ├── CLAUDE.md          # Documentazione routing e pagine
│   ├── api/               # API routes
│   │   └── products/      # Product API with QR generation
│   ├── auth/              # Authentication pages (login, register, forgot-password)
│   ├── company/           # Company dashboard con CLAUDE.md dedicato
│   ├── employee/          # Employee dashboard mobile-first con CLAUDE.md
│   ├── public/            # Public-facing pages con CLAUDE.md
│   ├── layout.tsx         # Root layout con ThemeProvider
│   ├── page.tsx           # Homepage
│   └── globals.css        # Tailwind CSS globali
├── components/
│   ├── CLAUDE.md          # Documentazione componenti
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Header, Sidebar, Mobile navigation
│   ├── modals/            # Product, Employee, Maintenance modals
│   ├── custom/            # AuthInput, ProductCard e altri custom components
│   ├── calendar/          # MaintenanceCalendar e componenti correlati
│   ├── theme-provider.tsx # Provider per next-themes
│   ├── theme-toggle.tsx   # Toggle component per tema
│   ├── PerformanceMonitor.tsx # Monitoraggio performance
│   └── WebVitalsTracker.tsx   # Tracking Web Vitals
├── contexts/
│   └── CLAUDE.md          # Documentazione context providers
├── lib/
│   ├── CLAUDE.md          # Documentazione utilities e data
│   ├── mock-data.ts       # All mock data and helper functions
│   ├── qr-generator.ts    # ✨ QR code generation utilities
│   ├── utils.ts           # Tailwind utility functions
│   └── validations/       # Zod schemas
├── services/              # ✨ NEW: API services and business logic
│   ├── CLAUDE.md          # Documentazione servizi e API calls
│   └── product-service.ts # ✨ Product service with QR integration
└── types/
    ├── CLAUDE.md          # Documentazione tipi TypeScript
    └── index.ts           # TypeScript interfaces for User, Product, Maintenance, Company
```

**Nota**: Ogni directory contiene un file `CLAUDE.md` per la documentazione specifica di quella sezione del progetto. Questo garantisce documentazione granulare e aggiornabile per ogni area funzionale.

## Key Architecture Patterns

### Multi-Role Layouts
- Company dashboard: Desktop-focused with traditional sidebar
- Employee dashboard: Mobile-first with bottom navigation
- Different layouts for different user roles with responsive design

### Mock Data System ✨
All data is currently mocked in `src/lib/mock-data.ts`:
- **Data Collections**: `mockUsers`, `mockProducts`, `mockMaintenance`, `mockCompanies`
- **Read Functions**: `getUserById()`, `getProductById()`, `getMaintenanceById()`, etc.
- **CRUD Operations**: Complete Create, Update, Delete functions for products and maintenance
- **Statistics**: `getProductStats()`, `getMaintenanceStats()` for dashboard analytics
- **QR Integration**: Automatic QR code assignment in `addProduct()` function
- **Unique ID Generation**: Timestamp-based ID generation with collision avoidance
- **Validation**: Data integrity checks and relationship validation
- **Authentication**: Mock authentication by role simulation
- **Search & Filter**: Product search by name, QR code, and tipologia_segnale
- **Batch Operations**: Support for multiple data operations
- **Data Relationships**: Proper foreign key relationships between entities

### Component Organization
- UI components follow shadcn/ui patterns
- Custom components in `components/custom/`
- Modals for CRUD operations in `components/modals/`
- Layout components handle role-specific navigation

### Services Architecture ✨
**NEW**: Enterprise service layer for API integration and business logic
- **ProductService**: Complete CRUD operations with QR code integration
- **ServiceResult Pattern**: Consistent response format with error handling
- **Type Safety**: Full TypeScript interfaces for all operations
- **Mock Integration**: Seamless integration with existing mock data system
- **API Ready**: Prepared for real backend API integration
- **Error Boundaries**: Comprehensive error handling and logging
- **Business Logic**: Centralized business rules and data transformations
- **Future Services**: Architecture ready for AuthService, MaintenanceService, etc.

### Form Validation
- React Hook Form with Zod validation schemas
- Validation schemas in `src/lib/validations/`
- Custom AuthInput component for consistent form styling

## Important Implementation Details

### Theme System
- Uses `next-themes` with system preference detection
- Custom ThemeProvider in root layout
- Theme toggle component available globally

### Responsive Design
- Employee interface is mobile-first with bottom navigation
- Company interface is desktop-focused
- Different layouts render based on screen size and user role

### GPS/Location Features
- Products and maintenance records include GPS coordinates
- Map functionality planned but not fully implemented

### QR Code System ✨
**Enterprise-grade QR code generation and management system**

- **Automatic Generation**: QR codes generated automatically on product creation
- **Base64 Backend Integration**: QR images converted to base64 for API storage
- **Unique ID System**: Timestamp-based QR codes with collision avoidance (`QR1703123456789`)
- **Multi-Format Support**: DataURL, Buffer, and base64 output formats
- **Canvas Integration**: Client-side canvas conversion for image processing
- **URL Integration**: QR codes link to `/public/product/[qr_code]` for direct access
- **Enterprise Features**: Custom dimensions, colors, error correction levels
- **Service Layer**: Complete ProductService with CRUD operations and QR integration
- **API Integration**: RESTful API endpoints at `/api/products` with full QR workflow
- **Type Safety**: Full TypeScript support with ServiceResult pattern
- **Error Handling**: Comprehensive error handling and validation
- **Scanner Integration**: Ready for employee scanner page implementation

### Calendar System
- MaintenanceCalendar component for interactive maintenance scheduling
- Dual view modes: day view (all employees) and week view (single employee)
- Timeline-based interface with 30-minute slots from 8:00-18:00
- Employee workload calculation and percentage tracking
- Drag & drop capability for maintenance rescheduling (planned)
- Filter by employee and maintenance status
- Real-time current time indicator for today's view

## Recent Updates (August 2025)

### Enterprise QR Code System Implementation ✨
**Data**: 24 settembre 2025
**Modifiche**:
- ✅ **QR Generator Library**: Implementato `qr-generator.ts` con supporto multi-format
- ✅ **API Routes**: Creato `/api/products` con generazione automatica QR su POST
- ✅ **Product Service**: Sviluppato `ProductService` con QR integration e ServiceResult pattern
- ✅ **Mock Data CRUD**: Aggiunte funzioni complete CRUD in `mock-data.ts`
- ✅ **Base64 Conversion**: Canvas-based QR to base64 conversion per backend storage
- ✅ **Unique ID Generation**: Timestamp-based IDs con collision avoidance
- ✅ **Sidebar Integration**: Aggiornato `handleModalSubmit` con real product creation
- ✅ **Type Safety**: Full TypeScript con interfaces `CreateProductInput`, `ServiceResult`
- ✅ **Error Handling**: Enterprise-grade error handling e logging
- ✅ **Testing**: Test scripts per validazione QR generation workflow

**Impatto**:
- Sistema QR completamente funzionale dalla creazione prodotto alla storage
- QR codes generati automaticamente con formato `QR1703123456789`
- Integrazione completa mock → service → API → frontend
- Base64 image data pronta per backend storage
- Foundation solida per scanner implementation
- **Architecture**: Services layer aggiunta per future API real integration

### QR Code Integration - ProductCard Enhancement  
**Data**: 23 agosto 2025  
**Modifiche**:
- ✅ **shadcn/ui QR Component**: Installato componente QR ufficiale 
- ✅ **QRCodeModal**: Nuovo modal per visualizzazione e download QR codes
- ✅ **ProductCard Integration**: Quick scan button ora apre QR modal
- ✅ **Download Features**: PNG/SVG download con canvas conversion
- ✅ **Sharing Features**: Web Share API con copy fallback
- ✅ **Print Support**: Layout ottimizzato per stampa QR codes
- ✅ **Dynamic Loading**: QRCodeModal lazy-loaded per performance
- ✅ **TypeScript Safety**: Full type safety e error handling
- ✅ **Company Products Modal Removal**: Rimosso modal dettagli prodotto da `/company/products`

**Impatto**:
- Ogni prodotto ha ora un QR code associato univoco
- QR codes linkano a `/public/product/[qr_code]` per accesso diretto
- UX migliorata con modal interattivo QR invece di callback semplice
- Features enterprise-grade: download, sharing, stampa
- Performance ottimizzata con dynamic imports e Suspense
- **Company Products**: Nessun modal si apre più cliccando le card prodotto

### MaintenanceCalendar Component Modifications
**Data**: 13 agosto 2025  
**Modifiche**:
- ✅ **UI Simplification**: Rimossa card header giornaliera nella vista "Tutti i dipendenti"
- ✅ **Code Cleanup**: Rimossi import non utilizzati (CardHeader, CardTitle)
- ✅ **Performance**: Ottimizzata visualizzazione eliminando elementi ridondanti
- 🔧 **TypeScript Issues**: Rilevate variabili non utilizzate da correggere

**Impatto**:
- Interface più pulita senza header date ridondanti
- Migliore focus sulla timeline e calendario interattivo
- Mantenuta funzionalità completa di navigazione e filtri

## 📚 Documentation Maintenance Rules

**IMPORTANTE**: Ogni volta che viene modificato un file o una funzionalità, è **OBBLIGATORIO** aggiornare:

### 1. File CLAUDE.md della Directory
**REGOLA OBBLIGATORIA**: Ogni volta che viene fatta una modifica dentro una directory, **DEVE** essere aggiornato il file `CLAUDE.md` di quella directory.

Quando si modifica qualsiasi file in una directory, aggiornare il file `CLAUDE.md` di quella directory con:
- Nuove funzionalità aggiunte
- Modifiche architetturali
- Nuovi pattern implementati
- Breaking changes o deprecations
- Nuove dependencies o integrazioni
- Data e natura della modifica effettuata

### 2. Commenti JSDoc nel File
Aggiornare i commenti JSDoc all'inizio di ogni file modificato:
- Aggiungere nuove features nella sezione **Core Features**
- Aggiornare la sezione **TODO** rimuovendo task completati
- Modificare **Business Logic** se cambia il comportamento
- Aggiornare **Technical Architecture** per modifiche strutturali
- Revisionare **Integration Points** per nuove integrazioni

### 3. Esempio di Workflow di Aggiornamento Documentazione:

```bash
# 1. Modifichi un file
vim src/app/employee/scanner/page.tsx

# 2. Aggiorna il commento JSDoc nel file
/**
 * Employee Scanner Page - Centro scansione QR/NFC per operatori
 * 
 * **Core Features:** (AGGIORNATO)
 * - ✅ Real QR scanning con react-qr-scanner  # NUOVO
 * - Camera-based QR scanning con viewfinder overlay
 * - Manual search fallback per QR illeggibili
 * 
 * **TODO:** (AGGIORNATO)
 * - ❌ Real QR scanning library  # RIMOSSO - completato
 * - Offline support, batch scanning  # MANTENUTO
 */

# 3. Aggiorna il CLAUDE.md della directory
vim src/app/employee/CLAUDE.md

# Aggiungi nella sezione Scanner:
# - ✅ **Real QR Integration**: Implementato react-qr-scanner
# - **Performance**: Ottimizzato per device Android/iOS
# - **Error Handling**: Gestione permessi camera migliorata
```

### 4. Sezioni CLAUDE.md da Aggiornare Sempre:
- **📁 Struttura**: Se aggiungi/rimuovi file
- **🎯 Scopo e Funzionalità**: Per nuove features
- **🏗️ Architettura**: Per modifiche tecniche
- **📊 Pagine e Responsabilità**: Per cambi comportamentali  
- **🚀 Future Enhancements**: Per rimuovere TODO completati

### 5. Pattern di Commit Consigliato:
```bash
git add .
git commit -m "feat(scanner): implement real QR scanning

- Add react-qr-scanner integration
- Update camera permissions handling
- Improve error states and user feedback
- Update JSDoc comments and CLAUDE.md docs
- Remove completed TODO items

📚 Documentation updated:
- src/app/employee/CLAUDE.md: Scanner section
- JSDoc in scanner/page.tsx: Core features & TODO
"
```

### 6. Responsabilità Documentazione:
- **Developer**: Aggiorna commenti JSDoc durante development
- **Code Review**: Verifica completezza documentation updates
- **Claude**: Suggerisci aggiornamenti documentation quando rileva modifiche
- **Team Lead**: Assicura consistency across CLAUDE.md files

### 7. Tools per Automation (Future):
```bash
# Script per verificare documentazione outdated
npm run docs:check

# Auto-generate TOC per CLAUDE.md files
npm run docs:generate-toc

# Lint documentation consistency
npm run docs:lint
```

**Regola d'oro**: **Ogni PR deve includere aggiornamenti documentation proporzionali alle modifiche del codice.**