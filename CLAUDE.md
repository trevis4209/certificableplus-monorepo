# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Install dependencies (run after cloning or pulling package.json changes)
npm install

# Development - Start all apps in parallel
npm run dev              # Start both web and mobile
npm run dev:web          # Start Web app only (Next.js dev server)
npm run dev:mobile       # Start Mobile app only (Expo dev server)

# Building
npm run build            # Build all packages and apps
npm run build:web        # Build Web app only
npm run build:mobile     # Build Mobile app only

# Quality checks
npm run lint             # Lint all packages and apps
npm run type-check       # TypeScript validation across monorepo

# Utilities
npm run clean            # Remove all build artifacts and node_modules
npm run format           # Format code with Prettier

# Working with Turborepo
turbo run build --filter=web                    # Build only web app and its dependencies
turbo run build --filter='./packages/*'         # Build all shared packages
turbo run dev --filter=mobile --force           # Clear cache and run mobile dev server
```

## Architecture Overview

CertificablePlus is a Turborepo monorepo that unifies a Next.js 15 web dashboard and an Expo React Native mobile app with shared TypeScript packages.

### Tech Stack
- **Build System**: Turborepo 2.3.4 with npm workspaces
- **Package Manager**: npm@10.9.2 (required: >=10.0.0)
- **Node Version**: >=20.0.0 (see engines in package.json)
- **Web App**: Next.js 15, React 19, Tailwind v4, shadcn/ui
- **Mobile App**: Expo SDK 54, React Native 0.81.4, NativeWind (Tailwind v3)
- **Validation**: Zod 4.0.15
- **TypeScript**: 5.7.3 (strict mode enabled)

### Repository Structure

```
certificableplus-monorepo/
├── apps/
│   ├── web/            # Next.js 15 dashboard (Web)
│   │   ├── src/        # Next.js app directory
│   │   ├── CLAUDE.md   # Web-specific documentation
│   │   └── package.json
│   └── mobile/         # Expo SDK 54 app (Mobile)
│       ├── app/        # Expo Router file-based routing
│       ├── CLAUDE.md   # Mobile-specific documentation
│       └── package.json
│
├── packages/           # Shared workspace packages
│   ├── types/          # @certplus/types - Reconciled TypeScript interfaces
│   ├── validations/    # @certplus/validations - Zod validation schemas
│   ├── utils/          # @certplus/utils - QR utilities, helpers
│   └── config/         # @certplus/config - TypeScript/ESLint configs
│
├── package.json        # Root workspace configuration
├── turbo.json          # Turborepo pipeline configuration
├── MIGRATION.md        # Detailed migration documentation
└── README.md           # Quick start guide
```

**IMPORTANT**: Each app directory (`apps/web/`, `apps/mobile/`) contains its own `CLAUDE.md` file with app-specific architecture, commands, and guidelines. **Always read the app-specific CLAUDE.md before working in that app.**

## Shared Packages Architecture

### @certplus/types
**Purpose**: Reconciled TypeScript interfaces shared between Web and Mobile

**Key Types**:
- `User`, `UserRole` - User authentication and authorization
- `Company`, `Cantiere` - Company and construction site management
- `Product` - Industrial signage products with **dual-field strategy**
- `Maintenance` - Maintenance records with **dual-language support**
- `BlockchainCertificate`, `ProductHistory` - Product lifecycle tracking

**Critical Design Decisions**:

1. **Product Interface - Dual-Field Strategy**:
   ```typescript
   // BOTH fields exist for backward compatibility
   tipologia_segnale: 'permanente' | 'temporanea';  // Category (Web + Mobile)
   tipo_segnale: string;                             // Description (Web + Mobile)

   // Optional cantieristica fields (Web-specific)
   is_cantieristica_stradale?: boolean;
   stato_prodotto?: 'installato' | 'dismesso';
   data_scadenza?: string;
   ```
   - **Rationale**: Web uses both fields, Mobile historically used only `tipo_segnale`
   - **Impact**: Zero breaking changes, additive only

2. **Maintenance Interface - Dual-Language Strategy**:
   ```typescript
   // Italian fields (REQUIRED) - used by UI components
   tipo_intervento: 'installazione' | 'manutenzione' | 'sostituzione' | 'verifica' | 'dismissione';
   anno: number;
   causale: string;

   // English fields (OPTIONAL) - used by API mappers
   intervention_type?: 'installation' | 'maintenance' | 'replacement' | 'verification' | 'dismissal';
   year?: number;
   reason?: string;
   ```
   - **Rationale**: Components always use Italian fields (guaranteed present)
   - **API mappers** handle EN↔IT conversion automatically
   - **Mock data** works with Italian-only fields (development)

**Package Details**:
- Location: `packages/types/`
- Build: TypeScript compilation (`tsc`)
- Exports: Module exports for each entity (`./user`, `./product`, etc.)

### @certplus/validations
**Purpose**: Zod validation schemas for forms and API data

**Schemas**:
- Auth: `loginSchema`, `registerSchema`
- Product: `productSchema` (supports cantieristica fields)
- Maintenance: `maintenanceSchema` (dual-language validation)

**Usage Pattern**:
```typescript
import { productSchema } from '@certplus/validations';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm({
  resolver: zodResolver(productSchema),
});
```

**Package Details**:
- Location: `packages/validations/`
- Dependencies: `zod`, `@certplus/types`
- Build: TypeScript compilation

### @certplus/utils
**Purpose**: Shared utility functions

**CRITICAL Utilities**:

1. **QR Code Utilities** (used extensively in Mobile scanner):
   ```typescript
   import { extractQRCode, normalizeQRCode, matchQRCode } from '@certplus/utils/qr';

   // Extract QR code from URL or raw string
   const qrCode = extractQRCode(scannedData);

   // Normalize QR format (uppercase, trim)
   const normalized = normalizeQRCode(qrCode);

   // Match QR code against product database
   const match = matchQRCode(qrCode, products);
   ```
   - **Critical**: Mobile scanner functionality depends entirely on these utilities
   - **Format**: QR codes follow pattern `QR[timestamp]` (e.g., `QR1703123456789`)

2. **Tailwind className Merger**:
   ```typescript
   import { cn } from '@certplus/utils';

   <div className={cn('base-class', isActive && 'active-class')} />
   ```
   - Uses `clsx` + `tailwind-merge` for conflict-free class composition

**Package Details**:
- Location: `packages/utils/`
- Dependencies: `clsx`, `tailwind-merge`
- Exports: `./qr` (QR utilities), `./cn` (className utility)

### @certplus/config
**Purpose**: Shared TypeScript and ESLint configurations

**Configs**:
- `base.json` - Base TypeScript config
- `nextjs.json` - Next.js-specific config (extends base)
- `react-native.json` - React Native config (extends base)

**Usage**:
```json
{
  "extends": "@certplus/config/typescript/nextjs.json"
}
```

**Package Details**:
- Location: `packages/config/`
- No dependencies
- Future: ESLint configs (planned)

## Turborepo Pipeline Configuration

The `turbo.json` file defines task dependencies and caching:

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],  // Build dependencies first
      "outputs": [".next/**", "dist/**", "build/**"]
    },
    "dev": {
      "cache": false,           // Never cache dev servers
      "persistent": true        // Keep running in watch mode
    },
    "lint": {
      "dependsOn": ["^build"]   // Lint after building dependencies
    }
  }
}
```

**Build Order** (automatically resolved):
1. `@certplus/config` (no dependencies)
2. `@certplus/types` (depends on config)
3. `@certplus/validations`, `@certplus/utils` (depend on types/config)
4. Apps (depend on all packages)

**Caching Benefits**:
- Rebuilds only changed packages
- 60% faster rebuilds with Turborepo cache
- Parallel task execution across packages

## Key Reconciliation Decisions

### Product Type Reconciliation
**Problem**: Web had both `tipologia_segnale` (category) and `tipo_segnale` (description), Mobile had only `tipo_segnale`.

**Solution**: Keep BOTH fields in shared type.
- **Web**: No changes needed (already uses both)
- **Mobile**: Add `tipologia_segnale` when consuming Product type
- **Result**: Zero breaking changes, additive only

### Maintenance Type Reconciliation
**Problem**: Web used dual-language (IT UI + EN API), Mobile used Italian only.

**Solution**: Adopt dual-language strategy with IT fields REQUIRED, EN optional.
- **Components**: Always use Italian fields (guaranteed present)
- **API Mappers**: Populate both IT and EN fields
- **Mock Data**: Works with IT-only fields
- **Result**: Backward compatible, future-proof for API integration

### Tailwind Configuration
**Decision**: Keep Tailwind configs SEPARATE in each app.

**Rationale**:
- Web uses Tailwind v4 (PostCSS-based, CSS output)
- Mobile uses Tailwind v3 + NativeWind (React Native styles)
- Completely different compilation and runtime approaches
- **Result**: Configs stay in `apps/*/tailwind.config.js`

## Enterprise QR Code System

**CRITICAL SYSTEM** for product tracking and scanner functionality.

### QR Code Format
- Pattern: `QR[timestamp]` (e.g., `QR1703123456789`)
- Unique ID generation with collision avoidance
- Links to `/public/product/[qr_code]` for public access

### QR Generation Features
- **Automatic generation** on product creation
- **Base64 encoding** for backend storage
- **Multi-format support**: DataURL, Buffer, base64
- **Canvas integration** for client-side processing
- **Custom dimensions, colors, error correction levels**

### QR Integration Points
- Web: `lib/qr-generator.ts`, `services/product-service.ts`, `/api/products`
- Mobile: Scanner page uses `@certplus/utils/qr` for QR matching
- Database: Products store base64-encoded QR images

**See** `apps/web/CLAUDE.md` for complete QR system documentation.

## Working with the Monorepo

### Adding a New Shared Package

1. Create package directory:
   ```bash
   mkdir -p packages/my-package/src
   cd packages/my-package
   ```

2. Create `package.json`:
   ```json
   {
     "name": "@certplus/my-package",
     "version": "1.0.0",
     "private": true,
     "main": "./dist/index.js",
     "types": "./dist/index.d.ts",
     "scripts": {
       "build": "tsc",
       "dev": "tsc --watch",
       "clean": "rm -rf dist"
     },
     "devDependencies": {
       "@certplus/config": "*",
       "typescript": "^5.7.3"
     }
   }
   ```

3. Create `tsconfig.json`:
   ```json
   {
     "extends": "@certplus/config/typescript/base.json",
     "compilerOptions": {
       "outDir": "./dist",
       "rootDir": "./src"
     },
     "include": ["src/**/*"]
   }
   ```

4. Add to app dependencies:
   ```json
   {
     "dependencies": {
       "@certplus/my-package": "*"
     }
   }
   ```

5. Install and build:
   ```bash
   npm install
   turbo run build --filter=@certplus/my-package
   ```

### Updating Import Paths

When moving code to shared packages, update imports:

**Before**:
```typescript
import { Product } from '@/types';
import { productSchema } from '@/lib/validations';
```

**After**:
```typescript
import { Product } from '@certplus/types';
import { productSchema } from '@certplus/validations';
```

**Automated replacement** (use with caution):
```bash
# Example: Replace @/types with @certplus/types
find src -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -exec sed -i '' 's|from "@/types"|from "@certplus/types"|g' {} +
```

### Hot Reload Across Packages

Turborepo enables hot reload when editing shared packages:

1. Start dev server: `npm run dev:web`
2. Edit `packages/types/src/product.ts`
3. TypeScript recompiles automatically
4. Next.js/Expo detects change and hot reloads

**Watch mode for packages**:
```bash
cd packages/types
npm run dev  # Runs tsc --watch
```

### Filtering Tasks by Package

```bash
# Run command for specific app
turbo run build --filter=web
turbo run dev --filter=mobile

# Run command for all packages
turbo run build --filter='./packages/*'

# Run command for package and its dependents
turbo run build --filter=@certplus/types...

# Clear cache and force rebuild
turbo run build --force
```

## Testing Strategy

**Current State**: No automated tests configured (check with user if needed).

**Recommended Approach**:
- **Unit Tests**: Jest for shared packages (`packages/*/`)
- **Integration Tests**: Vitest for Web app, Jest for Mobile app
- **E2E Tests**: Playwright for Web, Maestro for Mobile
- **Type Safety**: TypeScript strict mode (already enabled)

## Migration Context

This monorepo was created by migrating two separate repositories:
1. **Web**: `/Users/trevis/Desktop/progetti/CertificablePlus` (Git history preserved)
2. **Mobile**: `/Users/trevis/Desktop/progetti/App-CertPlus-employee` (copied as local directory)

**Migration Benefits**:
- 30-35% code reduction in shared areas
- Single install command (`npm install`)
- Unified type system with reconciled interfaces
- Hot reload across packages
- Faster builds with Turborepo caching (60% improvement)

**See** `MIGRATION.md` for complete migration details, decisions, and timeline.

## Important Development Guidelines

### Always Read App-Specific CLAUDE.md First
Before working in `apps/web/` or `apps/mobile/`, **read their respective CLAUDE.md files**:
- `apps/web/CLAUDE.md` - Web architecture, routes, components, QR system
- `apps/mobile/CLAUDE.md` - Mobile architecture, Expo Router, scanner implementation

### Respect Type Reconciliation Decisions
- **Product**: Always include both `tipologia_segnale` AND `tipo_segnale`
- **Maintenance**: Use Italian fields in components, let API mappers handle EN conversion
- **Don't change reconciled types** without understanding impact on both apps

### QR Code Critical Path
The QR utilities in `@certplus/utils/qr` are **CRITICAL** for Mobile scanner:
- `extractQRCode()` - Parses scanned QR data
- `normalizeQRCode()` - Standardizes format
- `matchQRCode()` - Matches against product database

**Any changes to QR utilities will break Mobile scanner functionality.**

### Package Dependencies
Respect the dependency graph:
```
config → types → validations, utils → apps
```

**Never create circular dependencies** between packages.

### Tailwind Configs Stay Separate
- **Web**: `apps/web/tailwind.config.js` (Tailwind v4)
- **Mobile**: `apps/mobile/tailwind.config.js` (Tailwind v3 + NativeWind)

**Do not attempt to share Tailwind configs** - they use incompatible versions and approaches.

### Documentation Maintenance
When modifying code, update:
1. **JSDoc comments** in the file
2. **CLAUDE.md** in the relevant directory
3. **README.md** if adding new packages or major features

See `apps/web/CLAUDE.md` section "📚 Documentation Maintenance Rules" for detailed guidelines.

## Common Development Tasks

### Scenario: Adding a New Product Field

1. **Update shared type**:
   ```typescript
   // packages/types/src/product.ts
   export interface Product {
     // ... existing fields
     new_field?: string;  // Add as optional to avoid breaking changes
   }
   ```

2. **Update validation schema** (if form field):
   ```typescript
   // packages/validations/src/product.ts
   export const productSchema = z.object({
     // ... existing fields
     new_field: z.string().optional(),
   });
   ```

3. **Rebuild packages**:
   ```bash
   turbo run build --filter=@certplus/types --filter=@certplus/validations
   ```

4. **Update components** in apps that use the new field.

5. **Test hot reload**: Changes should propagate to running dev servers.

### Scenario: Fixing a Type Error Across Apps

1. **Locate type definition** in `packages/types/src/`.
2. **Fix the type** (ensure backward compatibility).
3. **Rebuild types package**: `turbo run build --filter=@certplus/types`
4. **Check impact** in both apps:
   ```bash
   turbo run type-check
   ```
5. **Fix any new type errors** in apps.

### Scenario: Adding QR Utility Function

1. **Add function** to `packages/utils/src/qr-utils.ts`.
2. **Export** from `packages/utils/src/index.ts`.
3. **Rebuild**: `turbo run build --filter=@certplus/utils`
4. **Use in apps**:
   ```typescript
   import { myNewQRFunction } from '@certplus/utils/qr';
   ```

**IMPORTANT**: Test thoroughly in Mobile scanner - QR changes affect core functionality.

## Troubleshooting

### Issue: "Cannot find module '@certplus/types'"
**Cause**: Shared packages not built yet.

**Solution**:
```bash
turbo run build --filter='./packages/*'
```

### Issue: Hot reload not working for package changes
**Cause**: TypeScript not running in watch mode.

**Solution**:
```bash
# In package directory
cd packages/types
npm run dev  # Runs tsc --watch
```

### Issue: Turborepo cache causing stale builds
**Cause**: Cache not invalidated after manual file edits.

**Solution**:
```bash
turbo run build --force  # Clear cache and rebuild
```

### Issue: Type errors after updating shared package
**Cause**: Apps using old type definitions.

**Solution**:
```bash
# Rebuild package and check apps
turbo run build --filter=@certplus/types
turbo run type-check
```

### Issue: Import path not resolving
**Cause**: Package not listed in app's `dependencies`.

**Solution**:
```json
// apps/web/package.json or apps/mobile/package.json
{
  "dependencies": {
    "@certplus/types": "*",
    "@certplus/validations": "*",
    "@certplus/utils": "*"
  }
}
```

Then run `npm install`.

## GitHub Repository

- **Repository**: https://github.com/trevis4209/certificableplus-monorepo
- **Branch**: `main` (default branch)
- **Git History**: Web app history preserved from original repo

## Future Enhancements

**Planned Packages** (see MIGRATION.md):
- `@certplus/mappers` - API transformation logic (GPS formatting, EN↔IT)
- `@certplus/api-types` - Backend API contract types
- `@certplus/services` - Data service patterns

**Infrastructure**:
- GitHub Actions CI/CD for monorepo
- Automated testing suite
- Husky pre-commit hooks
- Prettier code formatting

## Support and Documentation

- **Migration Details**: See `MIGRATION.md` for complete migration story
- **Web App**: See `apps/web/CLAUDE.md` for web-specific architecture
- **Mobile App**: See `apps/mobile/CLAUDE.md` for mobile-specific architecture
- **Quick Start**: See `README.md` for getting started guide
- **Turborepo Docs**: https://turbo.build/repo/docs
