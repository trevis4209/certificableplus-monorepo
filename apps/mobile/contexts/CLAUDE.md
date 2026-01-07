# CLAUDE.md - /contexts

**React Contexts e State Management** - Gestione stato globale e providers

## 📁 Struttura

```
contexts/
├── AuthContext.tsx          # Contesto autenticazione globale
└── [future-contexts]        # Futuri context (Theme, User preferences, etc.)
```

## 🎯 Responsabilità

### Global State Management
- **Authentication**: User session, login status, user data
- **Theme**: Dark/Light mode preferences (futuro)
- **User Preferences**: Impostazioni app specifiche (futuro)
- **App State**: Stato applicazione condiviso tra componenti

### Context Design Principles
- **Single Responsibility**: Un context per domain specifico
- **Provider Hierarchy**: Context providers ordinati nel root layout
- **Performance**: Context splitting per evitare re-renders inutili
- **Type Safety**: Tutti i context completamente tipizzati

## 📋 Context Guidelines

### `AuthContext.tsx` - Authentication
**Scopo**: Gestione stato autenticazione globale app-wide

**Responsabilità**:
- User session management
- Login/logout operations
- Token refresh automatico
- Authentication status
- User profile data

**API Expose**:
```typescript
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, companyId?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}
```

**Usage Pattern**:
```typescript
const { user, isAuthenticated, login, logout } = useAuth();
```

### Future Contexts

#### `ThemeContext.tsx` (Future)
**Scopo**: Gestione theme preferences (dark/light mode)
```typescript
interface ThemeContextType {
  theme: 'light' | 'dark' | 'auto';
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  colors: ColorScheme;
}
```

#### `UserPreferencesContext.tsx` (Future)
**Scopo**: Preferenze utente specifiche app
```typescript
interface UserPreferencesType {
  language: 'it' | 'en';
  notifications: NotificationSettings;
  mapSettings: MapPreferences;
  updatePreference: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
}
```

## 🔧 Convenzioni di Sviluppo

### Context Creation Pattern
```typescript
// 1. Define Context Type
interface ContextType {
  // state properties
  // action methods
}

// 2. Create Context
const Context = createContext<ContextType | undefined>(undefined);

// 3. Provider Component
export function ContextProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initialState);

  // Business logic
  const actions = {
    action1: useCallback(() => {
      // implementation
    }, [dependencies]),
    action2: useCallback(() => {
      // implementation
    }, [dependencies])
  };

  const value: ContextType = {
    ...state,
    ...actions
  };

  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
}

// 4. Hook for consuming context
export function useContext() {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error('useContext must be used within ContextProvider');
  }
  return context;
}
```

### Context Provider Hierarchy
```typescript
// app/_layout.tsx
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider>
          <UserPreferencesProvider>
            <AppContent />
          </UserPreferencesProvider>
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
```

### Performance Optimization
```typescript
// Split context se si re-renderizza troppo
const AuthStateContext = createContext<AuthState | undefined>(undefined);
const AuthActionsContext = createContext<AuthActions | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initialState);

  const actions = useMemo(() => ({
    login: () => { /* implementation */ },
    logout: () => { /* implementation */ }
  }), []);

  return (
    <AuthStateContext.Provider value={state}>
      <AuthActionsContext.Provider value={actions}>
        {children}
      </AuthActionsContext.Provider>
    </AuthStateContext.Provider>
  );
}
```

## ⚠️ Best Practices

### Context Design
- **Single Responsibility**: Un context per domain logico
- **Minimal State**: Solo state che deve essere davvero globale
- **Memoization**: `useMemo` per context values, `useCallback` per actions
- **Error Boundaries**: Wrap providers con error boundaries

### Performance Considerations
```typescript
// ✅ Good: Memoized context value
const value = useMemo(() => ({
  user,
  isAuthenticated,
  login,
  logout
}), [user, isAuthenticated, login, logout]);

// ❌ Bad: New object ogni render
const value = {
  user,
  isAuthenticated,
  login,
  logout
};
```

### Error Handling
```typescript
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  if (!context.isInitialized) {
    throw new Error('Auth context not initialized');
  }

  return context;
}
```

### State Persistence
```typescript
// Per contexts che devono persistere
export function PersistentProvider({ children }) {
  const [state, setState] = useState(() => {
    // Load from AsyncStorage
    return loadPersistedState();
  });

  useEffect(() => {
    // Persist state changes
    persistState(state);
  }, [state]);

  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
}
```

## 🚨 Regole Importanti

### ✅ Fare
- Memoize context values per performance
- Type safety completa per context e hooks
- Error handling per invalid context usage
- Persist important state (auth, preferences)
- Test contexts isolatamente

### ❌ Non Fare
- Troppi context providers (max 5-6 levels)
- State locale in context (usare local state invece)
- Complex business logic in providers
- Context per comunicazione parent-child semplice
- Skip context performance optimization

## 📚 Pattern Comuni

### Reducer-based Context
```typescript
interface State {
  user: User | null;
  loading: boolean;
  error: string | null;
}

type Action =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; user: User }
  | { type: 'LOGIN_ERROR'; error: string }
  | { type: 'LOGOUT' };

const authReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return { user: action.user, loading: false, error: null };
    case 'LOGIN_ERROR':
      return { user: null, loading: false, error: action.error };
    case 'LOGOUT':
      return { user: null, loading: false, error: null };
    default:
      return state;
  }
};

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = useCallback(async (credentials) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const user = await authService.login(credentials);
      dispatch({ type: 'LOGIN_SUCCESS', user });
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR', error: error.message });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### Context with Custom Hook
```typescript
// Advanced hook con additional logic
export function useAuthWithRedirect() {
  const auth = useAuth();
  const router = useRouter();

  const loginWithRedirect = useCallback(async (credentials, redirectTo = '/') => {
    try {
      await auth.login(credentials);
      router.replace(redirectTo);
    } catch (error) {
      // Handle error
    }
  }, [auth.login, router]);

  return {
    ...auth,
    loginWithRedirect
  };
}
```