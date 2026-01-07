# CLAUDE.md - /app

**Directory Routing e Pagine Principali** - File-based routing con Expo Router

## 📁 Struttura

```
app/
├── _layout.tsx              # Root layout con AuthProvider e ThemeProvider
├── (auth)/                  # Gruppo autenticazione - Login, register, password reset
├── (tabs)/                  # Gruppo navigazione tab - Home, manutenzione, scanner, mappa, profilo
├── pages/                   # Pagine aggiuntive fuori dai tab
│   ├── _layout.tsx          # Layout per pagine aggiuntive
│   ├── scanner.tsx          # Pagina scanner QR avanzata
│   └── product/[id].tsx     # Dettagli prodotto dinamici
└── +not-found.tsx          # Pagina 404 (opzionale)
```

## 🎯 Responsabilità

- **Routing**: File-based routing automatico di Expo Router
- **Layout**: Configurazione layout globali e per gruppo
- **Authentication Flow**: Gestione flusso login/logout
- **Navigation**: Configurazione navigazione bottom tabs e stack

## 📋 Convenzioni

### Nomenclatura File
- **_layout.tsx**: File di layout per gruppo/directory
- **(group)**: Directory tra parentesi = gruppo di routing
- **[id].tsx**: Route dinamiche con parametri
- **+not-found.tsx**: Pagina fallback 404

### Layout Hierarchy
1. **app/_layout.tsx**: Root (AuthProvider, ThemeProvider, SafeAreaProvider)
2. **app/(tabs)/_layout.tsx**: Bottom tabs navigation
3. **app/pages/_layout.tsx**: Stack navigation per pagine extra

### Navigation Patterns
```typescript
// Navigation tra tab
router.push('/maintenance');

// Navigation a pagine con parametri
router.push('/pages/product/123');

// Navigation con query params
router.push('/pages/scanner?operation=create_product');
```

## 🔧 Quando Modificare

### Aggiungere Nuovo Tab
1. Creare file in `app/(tabs)/nuovo-tab.tsx`
2. Aggiornare `app/(tabs)/_layout.tsx` per includere il nuovo tab
3. Aggiungere icona in `constants/Icons.ts` se necessaria

### Aggiungere Nuova Pagina
1. Per pagine senza tab: creare in `app/pages/nome-pagina.tsx`
2. Per modali/overlay: creare in `components/modals/`
3. Per route dinamiche: usare `[param].tsx`

### Modificare Layout
- **Globale**: Modificare `app/_layout.tsx`
- **Tab Navigation**: Modificare `app/(tabs)/_layout.tsx`
- **Specifico gruppo**: Creare/modificare `_layout.tsx` nella directory specifica

## ⚠️ Regole Importanti

### Security
- Tutte le pagine ereditano AuthProvider dal root layout
- Protezione route automatica tramite AuthContext
- Controllo permessi utente per operazioni sensibili

### Performance
- Lazy loading automatico per route
- Code splitting per gruppo di pagine
- Evitare import pesanti in _layout.tsx

### State Management
- State locale per pagina-specifica
- Context providers nel layout appropriato
- Evitare prop drilling tra route

## 🚨 Non Fare

- ❌ Non modificare routing structure senza consultare CLAUDE.md
- ❌ Non aggiungere business logic nei file layout
- ❌ Non creare route annidate oltre 3 livelli di profondità
- ❌ Non usare state management globale per dati route-specific

## 📚 Pattern Comuni

### Pagina Protetta
```typescript
export default function ProtectedPage() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPrompt />;
  }

  return <PageContent />;
}
```

### Navigazione Programmatica
```typescript
const router = useRouter();
const { operation } = useLocalSearchParams<{ operation: string }>();

// Navigate con parametri
const handleNavigate = () => {
  router.push({
    pathname: '/pages/scanner',
    params: { operation: 'create_product' }
  });
};
```

### Layout con Provider
```typescript
export default function GroupLayout() {
  return (
    <SpecificProvider>
      <Stack>
        <Stack.Screen name="page1" options={{ title: 'Page 1' }} />
        <Stack.Screen name="page2" options={{ title: 'Page 2' }} />
      </Stack>
    </SpecificProvider>
  );
}
```