# CLAUDE.md - /utils

**Utility Functions** - Funzioni helper e utilities riutilizzabili

## 📁 Struttura

```
utils/
├── cleanup.ts               # Utilities cleanup per componenti e routing
├── memoization.ts          # Performance utilities per memoization
└── [future-utils]/         # Future utilities (validation, formatting, etc.)
```

## 🎯 Responsabilità

### Core Utilities
- **Performance**: Memoization, optimization helpers
- **Cleanup**: Memory management, subscription cleanup
- **Validation**: Data validation helpers (futuro)
- **Formatting**: Date, number, string formatting (futuro)

### Design Principles
- **Pure Functions**: No side effects, predictable output
- **Reusability**: Functions utilizzabili across tutta l'app
- **Performance**: Utilities che migliorano performance app
- **Type Safety**: Completamente tipizzate con TypeScript

## 📋 Utility Guidelines

### `cleanup.ts` - Resource Management
**Scopo**: Gestione cleanup memoria e resources

**Exports**:
```typescript
// Component cleanup utilities
export const useComponentCleanup = () => {
  const cleanup = useRef<(() => void)[]>([]);

  const addCleanup = useCallback((cleanupFn: () => void) => {
    cleanup.current.push(cleanupFn);
  }, []);

  const cleanupAll = useCallback(() => {
    cleanup.current.forEach(fn => fn());
    cleanup.current = [];
  }, []);

  return { addCleanup, cleanupAll };
};

// Router cleanup utilities
export const useRouterCleanup = (operation: string, router: Router) => {
  const cleanupRouter = useCallback(() => {
    // Router specific cleanup
  }, [operation, router]);

  return { cleanupRouter };
};
```

### `memoization.ts` - Performance Optimization
**Scopo**: Helper per memoization e performance optimization

**Exports**:
```typescript
// Product lookup con memoization
export const useProductLookup = () => {
  return useCallback((qr: string, products: Product[]) => {
    return products.find(p => p.qr_code === qr) || null;
  }, []);
};

// Generic memoization utilities
export const memoize = <Args extends unknown[], Return>(
  fn: (...args: Args) => Return
): ((...args: Args) => Return) => {
  const cache = new Map();
  return (...args: Args): Return => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};
```

### Future Utilities

#### `validation.ts` (Future)
**Scopo**: Validation helpers per forms e data
```typescript
// Email validation
export const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// GPS coordinates validation
export const isValidCoordinate = (lat: number, lng: number): boolean => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

// QR code validation
export const isValidQRCode = (qr: string): boolean => {
  return qr.length > 0 && /^[A-Za-z0-9-_]+$/.test(qr);
};
```

#### `formatting.ts` (Future)
**Scopo**: Data formatting helpers
```typescript
// Date formatting
export const formatDate = (date: string | Date, locale = 'it-IT'): string => {
  return new Intl.DateTimeFormat(locale).format(new Date(date));
};

// Currency formatting
export const formatCurrency = (amount: number, currency = 'EUR'): string => {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency
  }).format(amount);
};

// GPS coordinates formatting
export const formatCoordinates = (lat: number, lng: number): string => {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
};
```

## 🔧 Convenzioni di Sviluppo

### Pure Function Pattern
```typescript
// ✅ Good: Pure function
export const calculateTotal = (items: Item[]): number => {
  return items.reduce((sum, item) => sum + item.price, 0);
};

// ❌ Bad: Side effects
let globalTotal = 0;
export const calculateTotalBad = (items: Item[]): void => {
  globalTotal = items.reduce((sum, item) => sum + item.price, 0);
};
```

### Generic Utility Pattern
```typescript
// Generic utility con type constraints
export const groupBy = <T, K extends keyof T>(
  array: T[],
  key: K
): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};
```

### Memoization Pattern
```typescript
// Memoization con custom cache
export const createMemoizedFunction = <T extends unknown[], R>(
  fn: (...args: T) => R,
  cacheSize = 100
) => {
  const cache = new Map<string, R>();

  return (...args: T): R => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);

    // LRU cache management
    if (cache.size >= cacheSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    cache.set(key, result);
    return result;
  };
};
```

## ⚠️ Best Practices

### Function Design
- **Single Responsibility**: Una utility = una responsabilità
- **Pure Functions**: No side effects, predictable
- **Immutability**: Non modificare parametri input
- **Type Safety**: TypeScript generics per flessibilità

### Performance Considerations
```typescript
// ✅ Good: Efficient utility
export const debounce = <T extends unknown[]>(
  func: (...args: T) => void,
  wait: number
) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: T): void => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// ❌ Bad: Inefficient implementation
export const debounceBad = (func: Function, wait: number) => {
  return (...args: any[]) => {
    setTimeout(() => func(...args), wait); // No cleanup
  };
};
```

### Error Handling
```typescript
// Utility con error handling
export const safeJsonParse = <T>(json: string): T | null => {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
};

// Utility con error transformation
export const asyncTryCatch = async <T>(
  asyncFn: () => Promise<T>
): Promise<[T | null, Error | null]> => {
  try {
    const result = await asyncFn();
    return [result, null];
  } catch (error) {
    return [null, error as Error];
  }
};
```

## 🚨 Regole Importanti

### ✅ Fare
- Pure functions senza side effects
- Generic types per riusabilità
- Comprehensive error handling
- Performance testing per utilities critiche
- Documentation per complex utilities

### ❌ Non Fare
- Utilities con business logic specifica
- Mutare parametri input
- Global state modification in utilities
- Skip error handling in utilities
- Complex utilities senza documentation

## 📚 Pattern Comuni

### Array Utilities
```typescript
// Chunk array in groups
export const chunk = <T>(array: T[], size: number): T[][] => {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size)
  );
};

// Remove duplicates
export const unique = <T>(array: T[], keyFn?: (item: T) => unknown): T[] => {
  if (!keyFn) {
    return [...new Set(array)];
  }

  const seen = new Set();
  return array.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};
```

### Object Utilities
```typescript
// Deep merge objects
export const deepMerge = <T>(target: T, ...sources: Partial<T>[]): T => {
  if (!sources.length) return target;

  const source = sources.shift();
  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return deepMerge(target, ...sources);
};

// Pick specific keys
export const pick = <T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};
```

### Async Utilities
```typescript
// Retry async function
export const retry = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxAttempts) {
        throw lastError;
      }

      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError!;
};
```