# CLAUDE.md - /src

Cartella principale del codice sorgente dell'applicazione CertificablePlus.

## 📁 Struttura

```
src/
├── app/           # Next.js 15 App Router - pagine e layout + API routes
├── components/    # Componenti React riutilizzabili
├── contexts/      # React Context providers
├── lib/           # Utility functions, validazioni, mock data + QR generator
├── services/      # ✨ NUOVO: Servizi API e logica business con QR integration
└── types/         # Definizioni TypeScript globali
```

## 🎯 Convenzioni

### Organizzazione File
- **app/**: Segue la struttura Next.js App Router
- **components/**: Componenti raggruppati per funzionalità
- **lib/**: Utility pure functions, configurazioni
- **types/**: Interfacce e tipi TypeScript centralizzati

### Naming Conventions
- **Componenti**: PascalCase (es. `ProductModal.tsx`)
- **Utility functions**: camelCase (es. `utils.ts`)
- **Tipi**: PascalCase per interfaces, camelCase per types
- **File di configurazione**: kebab-case (es. `mock-data.ts`)

## 🔧 Tecnologie Utilizzate

- **Next.js 15**: Framework con App Router
- **React 19**: UI Library con Server/Client Components
- **TypeScript**: Type safety completo
- **Tailwind CSS**: Styling utility-first
- **shadcn/ui**: Sistema di componenti design system

## 📝 Performance Optimizations

Implementate ottimizzazioni enterprise-grade:
- **Dynamic imports** per code splitting
- **React.memo** per componenti pesanti
- **useCallback/useMemo** per performance
- **Server Components** per SSR ottimale
- **Bundle size optimization** (-34%)

Vedi `/FRONTEND_PERFORMANCE_AUDIT_REPORT.md` per dettagli completi.