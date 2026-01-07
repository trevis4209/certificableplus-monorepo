# CLAUDE.md - /constants

**Constants e Configurazioni** - Valori costanti, colori, configurazioni app

## 📁 Struttura

```
constants/
├── Colors.ts               # Definizioni colori theme-aware
├── Icons.ts                # Icone mapping per consistenza
└── [future-constants]/     # Future constants (API endpoints, etc.)
```

## 🎯 Responsabilità

### App Constants
- **Colors**: Theme colors, brand colors, semantic colors
- **Icons**: Icon name mapping per consistenza UI
- **Sizing**: Spacing, font sizes, dimensions (futuro)
- **Configuration**: App settings, feature flags (futuro)

### Design System
- **Consistency**: Valori centrali per design consistency
- **Theme Support**: Light/dark mode automatic support
- **Accessibility**: Color contrast, sizing per accessibility
- **Brand Identity**: Corporate colors e styling

## 📋 Constants Guidelines

### `Colors.ts` - Color System
**Scopo**: Gestione colori centrali con supporto theme

**Structure**:
```typescript
const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

// Semantic colors (non theme-dependent)
export const SemanticColors = {
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};

// Brand colors
export const BrandColors = {
  primary: '#0a7ea4',
  secondary: '#f59e0b',
  accent: '#8b5cf6',
};
```

### `Icons.ts` - Icon System
**Scopo**: Mapping icone per consistenza e facilità manutenzione

**Structure**:
```typescript
import { Ionicons } from '@expo/vector-icons';

export const Icons = {
  // Navigation
  home: 'home-outline' as keyof typeof Ionicons.glyphMap,
  maintenance: 'construct-outline' as keyof typeof Ionicons.glyphMap,
  scanner: 'qr-code-outline' as keyof typeof Ionicons.glyphMap,
  map: 'map-outline' as keyof typeof Ionicons.glyphMap,
  profile: 'person-outline' as keyof typeof Ionicons.glyphMap,

  // Actions
  add: 'add-outline' as keyof typeof Ionicons.glyphMap,
  edit: 'create-outline' as keyof typeof Ionicons.glyphMap,
  delete: 'trash-outline' as keyof typeof Ionicons.glyphMap,
  save: 'save-outline' as keyof typeof Ionicons.glyphMap,

  // Status
  success: 'checkmark-circle-outline' as keyof typeof Ionicons.glyphMap,
  warning: 'warning-outline' as keyof typeof Ionicons.glyphMap,
  error: 'close-circle-outline' as keyof typeof Ionicons.glyphMap,
  info: 'information-circle-outline' as keyof typeof Ionicons.glyphMap,
} as const;

// Icon size constants
export const IconSizes = {
  small: 16,
  medium: 24,
  large: 32,
  xlarge: 48,
} as const;
```

### Future Constants

#### `Sizing.ts` (Future)
**Scopo**: Sizing constants per design consistency
```typescript
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const FontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  title: 28,
} as const;

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;
```

#### `Config.ts` (Future)
**Scopo**: App configuration e feature flags
```typescript
export const AppConfig = {
  API_TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes

  // Feature flags
  FEATURES: {
    DARK_MODE: true,
    OFFLINE_MODE: false,
    ADVANCED_SCANNER: true,
    BLOCKCHAIN_INFO: true,
  },

  // Validation
  VALIDATION: {
    MIN_PASSWORD_LENGTH: 8,
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    SUPPORTED_IMAGE_TYPES: ['jpg', 'jpeg', 'png'],
  },
} as const;
```

## 🔧 Convenzioni di Sviluppo

### Constant Naming
```typescript
// ✅ Good: Descriptive, grouped constants
export const Colors = {
  light: { /* colors */ },
  dark: { /* colors */ }
} as const;

export const API_ENDPOINTS = {
  PRODUCTS: '/product',
  MAINTENANCE: '/maintenance',
} as const;

// ❌ Bad: Magic numbers, unclear names
const PRIMARY_COLOR = '#0a7ea4';
const TIMEOUT = 5000;
```

### Type Safety
```typescript
// Use 'as const' per literal types
export const STATUS_TYPES = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
} as const;

export type StatusType = typeof STATUS_TYPES[keyof typeof STATUS_TYPES];

// Creare utility types
export type ColorScheme = keyof typeof Colors;
export type IconName = keyof typeof Icons;
```

### Theme Integration
```typescript
// Hook per access theme-aware colors
export const useThemeColor = (
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) => {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
};
```

## ⚠️ Best Practices

### Organization
- **Logical Grouping**: Group related constants together
- **Hierarchical Structure**: Use nested objects per categories
- **Consistent Naming**: Use consistent naming patterns
- **Type Safety**: Use `as const` e type definitions

### Color System
```typescript
// ✅ Good: Semantic color system
export const Colors = {
  light: {
    primary: '#0a7ea4',
    secondary: '#f59e0b',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    surface: '#ffffff',
    onSurface: '#000000',
  },
  dark: {
    primary: '#60a5fa',
    secondary: '#fbbf24',
    success: '#4ade80',
    warning: '#fbbf24',
    error: '#f87171',
    surface: '#1f2937',
    onSurface: '#ffffff',
  },
};

// ❌ Bad: Hard-coded colors throughout app
const buttonStyle = { backgroundColor: '#0a7ea4' };
```

### Icon Consistency
```typescript
// ✅ Good: Centralized icon mapping
const getIcon = (iconName: keyof typeof Icons) => Icons[iconName];

// ❌ Bad: Hard-coded icon names
<Ionicons name="home-outline" size={24} />
```

## 🚨 Regole Importanti

### ✅ Fare
- Centralize all magic numbers e strings
- Use semantic naming per colors
- Implement theme support consistently
- Document color accessibility ratios
- Type safety con `as const`

### ❌ Non Fare
- Hard-code values throughout app
- Skip theme support per colors
- Use unclear constant names
- Mix constants with business logic
- Ignore accessibility guidelines

## 📚 Pattern Comuni

### Environment-based Constants
```typescript
const isDevelopment = process.env.NODE_ENV === 'development';

export const Config = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_URL || (
    isDevelopment
      ? 'http://localhost:3000'
      : 'https://api.production.com'
  ),

  LOGGING: {
    ENABLED: isDevelopment,
    LEVEL: isDevelopment ? 'debug' : 'error',
  },

  CACHE: {
    ENABLED: !isDevelopment,
    DURATION: isDevelopment ? 1000 : 300000,
  },
} as const;
```

### Responsive Constants
```typescript
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const Breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
} as const;

export const Layout = {
  window: { width, height },
  isSmallDevice: width < 375,
  isTablet: width >= Breakpoints.tablet,
} as const;
```

### Validation Constants
```typescript
export const Validation = {
  EMAIL: {
    REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MAX_LENGTH: 254,
  },

  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: true,
  },

  QR_CODE: {
    REGEX: /^[A-Za-z0-9-_]+$/,
    MIN_LENGTH: 1,
    MAX_LENGTH: 100,
  },

  GPS: {
    LAT_MIN: -90,
    LAT_MAX: 90,
    LNG_MIN: -180,
    LNG_MAX: 180,
    PRECISION: 6, // decimal places
  },
} as const;
```