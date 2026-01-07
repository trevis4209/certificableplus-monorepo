# CLAUDE.md - /hooks

**Custom React Hooks** - Business Logic e State Management riutilizzabile

## 📁 Struttura

```
hooks/
├── scanner/                 # Hooks specifici scanner QR
│   ├── useLocationService.ts    # GPS e geolocalizzazione
│   ├── useModalManager.ts       # Gestione state modal scanner
│   ├── useProductForm.ts        # Form validation prodotti
│   ├── useReducers.ts           # Complex state reducers
│   └── useScannerOperations.ts  # Business logic scansione QR
├── useBackendData.ts        # Gestione dati backend API
├── useColorScheme.ts        # Theme detection (dark/light)
├── useDebounce.ts          # Input debouncing utility
└── useThemeColor.ts        # Colors theme-aware
```

## 🎯 Filosofia Hooks

### Separazione Responsabilità
- **Business Logic**: Estratta dai componenti nei custom hooks
- **State Management**: Hooks per state complesso (useReducer patterns)
- **Side Effects**: API calls, timers, subscriptions
- **Utilities**: Funzionalità riutilizzabili (debounce, theme)

### Domain-Driven Organization
- **scanner/**: Hooks specifici per QR scanning workflow
- **auth/**: Hooks per autenticazione (futuro se necessario)
- **api/**: Hooks per data fetching (futuro pattern)

## 📋 Directory Guidelines

### Root Level Hooks
**Scopo**: Hooks generali e utilities riutilizzabili across app

**Esempi**:
- `useBackendData.ts`: Gestione completa dati backend
- `useColorScheme.ts`: Theme detection
- `useDebounce.ts`: Input debouncing

### `/scanner` - Scanner Domain
**Scopo**: Business logic specifica per scanner QR workflow

**Hooks Inclusi**:
- `useLocationService`: GPS permissions + coordinate capture
- `useModalManager`: State management modal scanner
- `useProductForm`: Form validation per creazione prodotti
- `useScannerOperations`: Logic operazioni scan (view, create, maintenance)
- `useReducers`: Complex state management con reducers

## 🔧 Convenzioni di Sviluppo

### Hook Structure Template
```typescript
// 1. Imports
import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';

// 2. Types/Interfaces
interface HookParams {
  param1: string;
  param2?: boolean;
}

interface HookReturn {
  data: T[];
  loading: boolean;
  error: string | null;
  action: (param: string) => void;
}

// 3. Hook Implementation
export const useCustomHook = ({ param1, param2 }: HookParams): HookReturn => {
  // 4. State declarations
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 5. Effects
  useEffect(() => {
    // effect logic
  }, [dependencies]);

  // 6. Handlers (memoized)
  const action = useCallback(async (param: string) => {
    try {
      setLoading(true);
      // logic
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [dependencies]);

  // 7. Return object
  return {
    data,
    loading,
    error,
    action
  };
};
```

### Naming Conventions
- **use** prefix sempre (React convention)
- **Descriptive names**: `useProductForm` vs `useForm`
- **Domain prefix** se necessario: `useScannerOperations`

### Return Patterns
```typescript
// Object return (preferred per multiple values)
return { data, loading, error, submit };

// Array return (per 2 values max, simile a useState)
return [value, setValue];

// Single value return (per utilities)
return debouncedValue;
```

## ⚠️ Best Practices

### Dependencies
- **Accurate dependency arrays**: Include all used values
- **Stable references**: Use `useCallback`/`useMemo` per dependencies
- **Avoid over-optimization**: Non usare `useCallback` everywhere

### Error Handling
```typescript
const useApiCall = () => {
  const [error, setError] = useState<string | null>(null);

  const callApi = useCallback(async () => {
    try {
      setError(null);
      const result = await api.call();
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('API Error:', err);
      throw err; // Re-throw per handling component-level
    }
  }, []);

  return { callApi, error };
};
```

### Cleanup Patterns
```typescript
const useSubscription = () => {
  useEffect(() => {
    const subscription = subscribe();

    return () => {
      // Cleanup
      subscription.unsubscribe();
    };
  }, []);
};
```

## 🚨 Regole Importanti

### ✅ Fare
- Estrarre complex logic dai componenti
- Usare TypeScript per type safety
- Memoize callbacks passati come dependencies
- Gestire loading/error states consistently
- Testare hooks isolatamente

### ❌ Non Fare
- Hooks con side effects non dichiarati
- Conditional hook calls (rules of hooks)
- Hooks monolitici con troppe responsabilità
- Direct DOM manipulation in hooks (use refs)
- Ignore dependency warnings ESLint

## 📚 Pattern Comuni

### API Data Fetching
```typescript
const useApiData = <T>(url: string) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(url);
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
};
```

### Complex State with Reducer
```typescript
interface State {
  loading: boolean;
  data: T[];
  error: string | null;
}

type Action =
  | { type: 'LOADING' }
  | { type: 'SUCCESS'; payload: T[] }
  | { type: 'ERROR'; payload: string };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true, error: null };
    case 'SUCCESS':
      return { loading: false, data: action.payload, error: null };
    case 'ERROR':
      return { loading: false, data: [], error: action.payload };
    default:
      return state;
  }
};

const useDataReducer = () => {
  const [state, dispatch] = useReducer(reducer, {
    loading: false,
    data: [],
    error: null
  });

  return { state, dispatch };
};
```

### Local Storage Hook
```typescript
const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setStoredValue = useCallback((newValue: T) => {
    setValue(newValue);
    localStorage.setItem(key, JSON.stringify(newValue));
  }, [key]);

  return [value, setStoredValue] as const;
};
```