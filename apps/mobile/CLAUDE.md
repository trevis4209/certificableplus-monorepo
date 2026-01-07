# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🤖 AI Context Management

**Enhanced with Claude Code Best Practices:**

### Quick Context Files
- **CONTEXT.md** - Current session state, architecture overview, critical reminders
- **.claudeignore** - Context filtering to focus on relevant files
- **.claude/memory.md** - Session knowledge base and recent changes
- **.claude/project-context.json** - Structured project metadata

### Specialized AI Agents
- **.claude/agents/scanner-specialist.md** - QR scanner and camera integration expert (Markdown with YAML frontmatter)
- **.claude/agents/backend-integration.md** - MySQL backend and API specialist (Markdown with YAML frontmatter)

### Automation Hooks
- **.claude/hooks.json** - Automated context checking and session tracking

## ⚠️ IMPORTANT: READ DIRECTORY CLAUDE.md FIRST

**Before creating, modifying, or deleting ANY file in a directory, you MUST:**

1. **Read the directory's CLAUDE.md file first** to understand:
   - Directory purpose and responsibilities
   - File organization conventions
   - Development patterns and best practices
   - What should and shouldn't be done in that directory

2. **Follow the established patterns** described in the directory's CLAUDE.md

3. **Respect the architectural decisions** and constraints outlined

**Directory Documentation Locations:**
- `/app` → `/app/CLAUDE.md` - Routing and page structure
- `/components` → `/components/CLAUDE.md` - UI component guidelines
- `/hooks` → `/hooks/CLAUDE.md` - Custom React hooks patterns
- `/lib` → `/lib/CLAUDE.md` - Core services and utilities
- `/contexts` → `/contexts/CLAUDE.md` - React Context patterns
- `/types` → `/types/CLAUDE.md` - TypeScript type definitions
- `/utils` → `/utils/CLAUDE.md` - Utility functions
- `/constants` → `/constants/CLAUDE.md` - App constants and config
- `/assets` → `/assets/CLAUDE.md` - Static asset management

**Each CLAUDE.md contains:**
- 📁 Directory structure and organization
- 🎯 Responsibilities and scope
- 📋 Development guidelines and conventions
- ⚠️ Best practices and rules
- 🚨 What NOT to do
- 📚 Common patterns and examples

## 📂 Directory Structure Overview

### Core Application Structure
```
certificableplus-app/
├── app/                     # 🚀 Expo Router - File-based routing
│   ├── (auth)/                  # Authentication flow pages
│   ├── (tabs)/                  # Main app navigation tabs
│   ├── pages/                   # Additional pages outside tabs
│   └── _layout.tsx              # Root layout with providers
│
├── components/              # 🧩 Reusable UI Components
│   ├── ui/                      # Base UI components (Button, Input, etc.)
│   ├── layout/                  # Layout components (Header, Container)
│   ├── cards/                   # Business-specific cards
│   ├── modals/                  # Interactive modals and dialogs
│   └── scanner/                 # QR scanner specific components
│
├── hooks/                   # 🪝 Custom React Hooks
│   ├── scanner/                 # Scanner-specific business logic
│   └── [general-hooks]          # App-wide custom hooks
│
├── lib/                     # 📚 Core Services & Libraries
│   ├── api/                     # Backend communication
│   ├── auth-service.ts          # JWT authentication service
│   └── mock-data.ts             # Development mock data
│
├── contexts/                # 🔄 React Context Providers
│   └── AuthContext.tsx          # Authentication state management
│
├── types/                   # 📝 TypeScript Type Definitions
│   ├── product.ts               # Product-related types
│   ├── maintenance.ts           # Maintenance-related types
│   ├── api-response.ts          # API response types
│   └── index.ts                 # Core app types
│
├── utils/                   # 🛠️ Utility Functions
│   ├── cleanup.ts               # Resource cleanup utilities
│   ├── memoization.ts           # Performance optimization helpers
│   └── [future-utils]           # Additional utility functions
│
├── constants/               # 📊 App Constants & Configuration
│   ├── Colors.ts                # Theme colors and design tokens
│   ├── Icons.ts                 # Icon mappings for consistency
│   └── [future-constants]       # Additional app constants
│
└── assets/                  # 🖼️ Static Assets
    ├── images/                  # App images and illustrations
    ├── fonts/                   # Custom typography
    └── [future-assets]          # Icons, animations, etc.
```

### Directory Responsibilities Quick Reference

| Directory | Primary Purpose | Key Files |
|-----------|----------------|-----------|
| `/app` | 🚀 **Navigation & Pages** | `_layout.tsx`, route files |
| `/components` | 🧩 **UI Components** | Reusable React components |
| `/hooks` | 🪝 **Business Logic** | Custom hooks, state management |
| `/lib` | 📚 **Core Services** | API clients, auth service |
| `/contexts` | 🔄 **Global State** | React Context providers |
| `/types` | 📝 **Type Safety** | TypeScript interfaces |
| `/utils` | 🛠️ **Helper Functions** | Pure utility functions |
| `/constants` | 📊 **Configuration** | Colors, sizes, constants |
| `/assets` | 🖼️ **Static Files** | Images, fonts, media |

### Development Workflow

1. **Planning**: Start with `/types` to define data structures
2. **Services**: Implement business logic in `/lib` and `/hooks`
3. **UI**: Build components in `/components` using design tokens from `/constants`
4. **Pages**: Create routes in `/app` composing existing components
5. **State**: Add global state via `/contexts` if needed

## Development Commands

**Start Development Server**
```bash
npx expo start
```

**Platform-Specific Development**
```bash
npx expo start --android    # Android emulator
npx expo start --ios        # iOS simulator  
npx expo start --web        # Web browser
```

**Linting**
```bash
npm run lint
```

**Project Reset** (moves starter code to app-example)
```bash
npm run reset-project
```

## Architecture Overview

### Core Stack
- **Framework**: React Native with Expo SDK 53
- **Navigation**: Expo Router with file-based routing
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Backend**: MySQL database with REST API endpoints
- **Authentication**: JWT-based auth with AsyncStorage persistence
- **State Management**: React hooks and context (no external state library)
- **Camera/Scanning**: Expo Camera with barcode scanning
- **Blockchain**: Algorand for product tokenization and IPFS for metadata storage

### Project Structure

**App Directory** (file-based routing with Expo Router)
```
app/
├── _layout.tsx              # Root layout with ThemeProvider
├── (tabs)/                  # Tab navigation group
│   ├── _layout.tsx          # Custom tab bar with haptic feedback
│   ├── index.tsx            # Home/Dashboard
│   ├── maintenance.tsx      # Maintenance interventions
│   ├── scanner.tsx          # QR code scanning
│   ├── map.tsx              # Map view for product locations
│   └── profile.tsx          # User profile
├── (auth)/                  # Authentication group
│   ├── login.tsx
│   ├── register.tsx
│   └── forgot-password.tsx
└── pages/                   # Additional pages outside tabs
    └── product/[id].tsx     # Dynamic product detail page
```

**Component Architecture**
```
components/
├── cards/                   # Reusable card components
├── layout/                  # Layout components (Header, Navbar)
├── modals/                  # Modal dialogs for user interactions
│   ├── AssignedTaskModal.tsx
│   ├── InstallationModal.tsx
│   ├── MaintenanceOptionsModal.tsx
│   ├── ProductDetailModal.tsx
│   └── ProductHistoryModal.tsx
├── scanner/                 # QR scanner related components
│   ├── CameraScanner.tsx    # Camera view with overlay
│   ├── OperationSelector.tsx
│   ├── ProductForm.tsx      # Product creation/editing
│   ├── ProductViewer.tsx    # Product display
│   └── ScanOverlay.tsx      # Visual scanning overlay
└── ui/                      # Base UI components
```

**Business Logic Organization**
```
hooks/
├── scanner/                 # Scanner-specific business logic
│   ├── useLocationService.ts    # GPS and location handling
│   ├── useModalManager.ts       # Modal state management
│   ├── useProductForm.ts        # Product form validation
│   ├── useReducers.ts           # Complex state reducers
│   └── useScannerOperations.ts  # QR scan operation logic
├── useColorScheme.ts        # Theme detection
├── useDebounce.ts           # Input debouncing
└── useThemeColor.ts         # Theme-aware colors
```

### Domain Model (Type System)

The app manages industrial signage with these core entities:

**User Management**
- Users have roles: `company`, `employee`, `viewer`
- Company-scoped access with hierarchical permissions

**Product Management** 
- Products are industrial signs with technical specifications
- QR codes for unique identification and tracking
- GPS coordinates for location-based operations
- Rich metadata (material, dimensions, installation year)

**Maintenance System**
- Maintenance records linked to products
- Operation types: installation, maintenance, replacement, verification, dismissal
- Photo documentation and GPS tracking for interventions
- User assignment and tracking

See `types/CLAUDE.md` for complete type definitions and usage patterns.

### Scanner Architecture

The QR scanner implements an operation-based workflow:

1. **Operation Selection**: User chooses maintenance type before scanning
2. **QR Code Recognition**: Camera-based scanning with visual overlay
3. **Product Resolution**: Scanned codes resolve to product records
4. **Context-Aware Actions**: Different modals/forms based on operation type
5. **Location Services**: GPS integration for maintenance tracking

**Key Scanner Components**:
- `CameraScanner`: Pure camera view with barcode detection
- `OperationSelector`: Business operation selection UI
- `ProductForm`: Dynamic form for product creation/editing
- `useScannerOperations`: Business logic for different scan operations
- `useLocationService`: GPS permissions and coordinate capture

### Backend Integration

**MySQL Backend with REST API**:
- JWT authentication with Bearer tokens
- Product tokenization on Algorand blockchain
- IPFS storage for metadata
- GPS coordinate validation (6 decimals, max 9 digits)

**API Endpoints**:
- `/auth/*` - Authentication (login, register, refresh)
- `/product/create` - Product tokenization
- `/product` - Get all products
- `/maintenance/create` - Create maintenance records
- `/maintenance` - Get all maintenances

**Environment Variables Required**:
```
EXPO_PUBLIC_API_URL=http://your-backend-url:port
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## Development Guidelines

### Styling Approach
- **Primary**: NativeWind classes (Tailwind CSS)
- **Fallback**: React Native StyleSheet for complex animations
- **Theme**: Automatic dark/light mode with `useColorScheme`
- **Responsive**: Mobile-first design patterns

### Security Best Practices
Reference `.cursor/rules/best-pratices/security-best-pratices.mdc` for comprehensive security guidelines including:
- Supabase RLS policies
- Input validation with Zod schemas  
- Secure token storage
- API rate limiting
- Component-level access controls

### Code Organization Principles
- **Domain-driven folders**: Group by business capability (scanner/, auth/, etc.)
- **Hook-based business logic**: Extract complex state management to custom hooks
- **Modal-based interactions**: Heavy use of modals for focused user tasks
- **Type-safe development**: Comprehensive TypeScript definitions in `types/`

### Mobile-Specific Considerations
- **Permissions**: Camera, location services require runtime permissions
- **Haptic feedback**: Implemented in tab navigation for better UX
- **Offline considerations**: AsyncStorage for critical data persistence
- **Performance**: Memoized components in scanner for camera performance

## AI-Assisted Development Workflow

### Pre-Development Context Loading
1. **Read CONTEXT.md** - Get current project state and session focus
2. **Check .claude/memory.md** - Review recent changes and learnings
3. **Read relevant directory CLAUDE.md** - Understand specific area guidelines
4. **Review .claude/project-context.json** - Get structured project metadata

### Specialized AI Assistance
- **Scanner Issues**: Use scanner-specialist agent for camera, QR codes, GPS
- **Backend Integration**: Use backend-integration agent for API, auth, types
- **General Development**: Follow directory-specific CLAUDE.md guidelines

### Quality Assurance Checklist
- [ ] TypeScript types properly defined in `/types`
- [ ] API calls include proper JWT authentication
- [ ] GPS coordinates formatted correctly (6 decimals)
- [ ] Camera permissions handled gracefully
- [ ] Error handling for network failures
- [ ] Follow existing code patterns in directory

### Session Memory Management
- Update CONTEXT.md with current work progress
- Document important discoveries in .claude/memory.md
- Use .claudeignore to focus AI attention on relevant files
- Maintain session continuity across complex features

### Common AI-Assisted Tasks
- **Feature Development**: Plan types first, then hooks, then components
- **API Integration**: Use backend.ts patterns, proper error handling
- **Scanner Improvements**: Focus on camera performance and UX
- **Type Safety**: Ensure complete TypeScript coverage
- **Authentication**: Follow JWT patterns in AuthContext
- **Testing**: Test critical paths, especially scanner operations

## EAS Build Configuration

**Development builds**: `eas build --profile development`
**Production builds**: `eas build --profile production` (with auto-increment)
**Preview builds**: `eas build --profile preview`

## Testing Approach

- **Mock Data**: `lib/mock-data.ts` provides sample data for development
- **Component Testing**: Focus on scanner operations and form validation
- **Permission Testing**: Camera and location service permissions
- **Offline Testing**: AsyncStorage persistence and offline scenarios