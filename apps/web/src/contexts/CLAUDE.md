# CLAUDE.md - /src/contexts

React Context providers per state management globale dell'applicazione.

## 📁 Struttura

```
contexts/
├── AppContext.tsx           # Provider principale unificato
├── PageHeaderContext.tsx    # Context per configurazione PageHeader
├── SidebarContext.tsx      # Context per stato sidebar globale  
├── index.ts               # Barrel exports per import semplificati
└── CLAUDE.md             # Documentazione context system
```

## 🎯 Purpose

Directory che centralizza tutti i **React Context providers** per gestire stato globale condiviso tra componenti, eliminando prop drilling e ottimizzando performance.

## ✅ Context Implementati

### 1. AppContext.tsx - Provider Principale
**Scopo**: Context unificato che combina tutti i provider dell'applicazione

```typescript
import { AppProvider } from "@/contexts";

// Nel layout principale
export default function RootLayout({ children }) {
  return (
    <AppProvider>
      {children}
    </AppProvider>
  );
}
```

**Features**:
- Combina ThemeProvider (next-themes)
- Integra SidebarProvider con configurazione
- Include PageHeaderProvider per gestione header
- Configurazione centralizzata per temi e sidebar

### 2. PageHeaderContext.tsx - Gestione Header Dinamico
**Scopo**: Permette alle pagine di configurare dinamicamente il PageHeader

```typescript
import { usePageHeader } from "@/contexts";

export default function ProductsPage() {
  const headerConfig = useMemo(() => ({
    icon: Package,
    title: "Gestione Prodotti",
    description: "Database completo prodotti",
    tabs: [...],
    buttons: [...]
  }), [tabs, buttons]);
  
  usePageHeader(headerConfig);
  
  return <div>...</div>;
}
```

**Features**:
- Header configuration tramite hook
- Support per tabs e buttons dinamici
- Auto cleanup al dismount componente
- Performance optimized con useCallback

### 3. SidebarContext.tsx - Stato Sidebar Globale
**Scopo**: Gestisce stato sidebar condiviso con persistenza localStorage

```typescript
import { useSidebar, useSidebarResponsive } from "@/contexts";

export function Layout() {
  const { state, toggleSidebar, closeSidebar } = useSidebar();
  
  // Auto-setup responsive behavior
  useSidebarResponsive();
  
  return (
    <Sidebar 
      isOpen={state.isOpen}
      onClose={closeSidebar}
    />
  );
}
```

**Features**:
- Stato condiviso tra tutti i layout
- Persistenza automatica in localStorage
- Responsive behavior automatico
- Performance optimized con memoization
- Mobile overlay detection

## 🏗️ Context Patterns Utilizzati

### Authentication Context
```typescript
// contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Implementation...
  
  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### Application State Context
```typescript
// contexts/AppContext.tsx
interface AppState {
  sidebarOpen: boolean;
  currentCompany: Company | null;
  notifications: Notification[];
  theme: 'light' | 'dark' | 'system';
}

interface AppContextType {
  state: AppState;
  dispatch: Dispatch<AppAction>;
  // Convenience methods
  toggleSidebar: () => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  setTheme: (theme: AppState['theme']) => void;
}
```

### Data Context (for caching)
```typescript
// contexts/DataContext.tsx
interface DataContextType {
  products: Product[];
  users: User[];
  maintenances: Maintenance[];
  loading: Record<string, boolean>;
  errors: Record<string, string | null>;
  
  // Actions
  fetchProducts: (companyId: string) => Promise<void>;
  createProduct: (product: CreateProductInput) => Promise<Product>;
  updateProduct: (id: string, updates: UpdateProductInput) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
}
```

## 🔧 Implementation Guidelines

### Context Structure
1. **Single Responsibility**: Un context per domain/feature
2. **Type Safety**: Interfacce complete per context value
3. **Error Boundaries**: Proper error handling
4. **Performance**: Memoization per prevenire re-renders

### Performance Best Practices
```typescript
// ✅ GOOD - Memoized context value
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  
  const login = useCallback(async (email: string, password: string) => {
    // Login logic
  }, []);
  
  const logout = useCallback(() => {
    // Logout logic
  }, []);
  
  const contextValue = useMemo(() => ({
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  }), [user, loading, login, logout]);
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
```

### Context Splitting
```typescript
// Split read/write contexts for performance
const UserStateContext = createContext<UserState>();
const UserDispatchContext = createContext<Dispatch<UserAction>>();

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(userReducer, initialState);
  
  return (
    <UserStateContext.Provider value={state}>
      <UserDispatchContext.Provider value={dispatch}>
        {children}
      </UserDispatchContext.Provider>
    </UserStateContext.Provider>
  );
}

// Separate hooks for read/write
export function useUserState() {
  const context = useContext(UserStateContext);
  if (!context) throw new Error('useUserState must be used within UserProvider');
  return context;
}

export function useUserDispatch() {
  const context = useContext(UserDispatchContext);
  if (!context) throw new Error('useUserDispatch must be used within UserProvider');
  return context;
}
```

## 🚀 Future Implementation Plan

### Priority 1: Authentication Context
**Quando implementare**: Dopo sostituzione del sistema mock
**Scopo**: Gestire stato autenticazione, login/logout, user session

### Priority 2: Application State Context  
**Quando implementare**: Per UI state condiviso (sidebar, notifications, theme)
**Scopo**: State globale UI non persistente

### Priority 3: Data Context
**Quando implementare**: Per caching dati API, sincronizzazione stato
**Scopo**: Cache locale dei dati, ottimizzazioni performance

### Priority 4: Settings Context
**Quando implementare**: Per preferenze utente persistenti
**Scopo**: Configurazioni app, preferenze tema, notifiche

## 📱 Integration with Existing Architecture

### With Current Components
```typescript
// Current: Props drilling
<CompanyLayout userData={userData}>
  <Dashboard userData={userData} />
</CompanyLayout>

// With Context: Clean prop passing  
<AuthProvider>
  <CompanyLayout>
    <Dashboard /> {/* userData from useAuth() */}
  </CompanyLayout>
</AuthProvider>
```

### With Server Components
```typescript
// Server Component provides initial data
export default async function RootLayout({ children }) {
  const initialUserData = await getServerUserData();
  
  return (
    <AuthProvider initialData={initialUserData}>
      {children}
    </AuthProvider>
  );
}
```

## ⚠️ Current State

**Status**: Directory vuota, pronta per implementazione
**Alternative attuali**: 
- Props drilling per user data
- Local state nei layout components
- Mock data access diretto

**Quando implementare Context**:
- Sostituire sistema mock con autenticazione reale
- Quando serve state condiviso tra componenti distanti
- Per ottimizzazioni performance con caching

## 🔄 Migration Strategy

### Phase 1: Authentication
1. Creare `AuthContext` con mock integration
2. Sostituire props drilling nei layout
3. Implementare login/logout flow

### Phase 2: Application State
1. Estrarre UI state dai layout components
2. Centralizzare sidebar, notifications, theme state  
3. Ottimizzare re-renders

### Phase 3: Data Management
1. Implementare data fetching context
2. Aggiungere caching layer
3. Sincronizzare con backend APIs

Le implementazioni dovranno seguire i pattern di performance già implementati nell'app (memo, useCallback, useMemo).