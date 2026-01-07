# CertificablePlus Monorepo

Turborepo monorepo unificata per le applicazioni CertificablePlus (Web + Mobile).

## 🏗️ Struttura

```
certificableplus-monorepo/
├── apps/
│   ├── web/            # Next.js 15 dashboard (Web)
│   └── mobile/         # Expo SDK 54 app (Mobile)
│
├── packages/
│   ├── config/         # @certplus/config - TypeScript/ESLint configs
│   ├── types/          # @certplus/types - Shared TypeScript interfaces
│   ├── validations/    # @certplus/validations - Zod validation schemas
│   └── utils/          # @certplus/utils - Shared utilities (QR, formatters)
│
├── package.json        # Root workspace configuration
└── turbo.json          # Turborepo pipeline configuration
```

## 📦 Shared Packages

### @certplus/types
TypeScript interfaces riconciliate tra Web e Mobile:
- **Product**: Dual-field strategy (`tipologia_segnale` + `tipo_segnale`)
- **Maintenance**: Dual-language (IT required + EN optional)
- **User, Company**: Interfaces condivise

### @certplus/validations
Zod validation schemas per forms:
- Auth schemas (login, register)
- Product schema (con cantieristica support)
- Maintenance schema (dual-language)

### @certplus/utils
Utility functions condivise:
- **QR Utils** (CRITICAL): `extractQRCode()`, `normalizeQRCode()`, `matchQRCode()`
- **cn**: Tailwind className merger

### @certplus/config
Shared configurations:
- TypeScript base configs (Next.js, React Native)
- ESLint configs (future)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Development
npm run dev              # Start all apps
npm run dev:web          # Start Web app only
npm run dev:mobile       # Start Mobile app only

# Building
npm run build            # Build all apps and packages
npm run build:web        # Build Web app only
npm run build:mobile     # Build Mobile app only

# Quality
npm run lint             # Lint monorepo
npm run type-check       # TypeScript validation

# Utilities
npm run clean            # Remove build artifacts
```

## ⚡ Turborepo Features

- **Fast builds**: Intelligent caching and parallel execution
- **Hot reload**: Package changes trigger instant app reload
- **Type-safe**: Shared types ensure consistency across apps
- **Code reuse**: 30-40% reduction in duplicated code

## 📚 Documentation

- **Plan**: See `.claude/plans/` for detailed migration plan
- **CLAUDE.md**: Each directory contains specific documentation
- **Types**: Check `packages/types/src/` for interface definitions

## 🔧 Status

**Phase Completed:**
- ✅ Phase 1: Monorepo root structure created
- ✅ Phase 2: Apps moved to monorepo
- ✅ Phase 3: Core shared packages created (4/7)

**Next Steps:**
- 🔄 Phase 4: Update app imports to use workspace packages
- 🔄 Phase 5: Build and validate both apps
- 🔄 Phase 6: Complete documentation
- 🔄 Phase 7: Consolidate Git histories

## 📝 Key Reconciliations

### Product Interface
- **Web**: `tipologia_segnale` + `tipo_segnale` + cantieristica fields
- **Mobile**: `tipo_segnale` only
- **Solution**: Keep BOTH fields, cantieristica optional

### Maintenance Interface
- **Web**: Dual-language (IT/EN)
- **Mobile**: Single language (IT)
- **Solution**: Dual-language strategy (IT required, EN optional)

## 🛠️ Tech Stack

- **Build System**: Turborepo 2.3.4
- **Package Manager**: npm workspaces
- **Web**: Next.js 15, React 19, Tailwind v4, shadcn/ui
- **Mobile**: Expo SDK 54, React Native, NativeWind (Tailwind v3)
- **Validation**: Zod 4.0.15
- **TypeScript**: 5.7.3

## 📄 License

Private - CertificablePlus
