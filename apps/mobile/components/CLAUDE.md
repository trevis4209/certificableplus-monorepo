# CLAUDE.md - /components

**Componenti Riutilizzabili UI** - Libreria componenti modulare dell'applicazione

## 📁 Struttura

```
components/
├── ui/                      # Componenti base UI (Button, Input, Card, etc.)
├── layout/                  # Componenti layout (Header, Navbar, Container)
├── cards/                   # Componenti card specifici (ProductCard, UserCard)
├── modals/                  # Dialog e modal per interazioni utente
├── scanner/                 # Componenti specifici scanner QR
├── examples/                # Componenti esempio/demo (mantenere per reference)
└── [future-domains]/        # Futuri domini specifici
```

## 🎯 Filosofia Componenti

### Design System
- **Atomic Design**: Atoms (ui/) → Molecules (layout/) → Organisms (cards/, modals/)
- **Domain-Driven**: Componenti scanner/, auth/, etc. raggruppati per business domain
- **Reusability**: Preferire composizione vs. inheritance

### Styling Approach
- **Primary**: NativeWind (Tailwind CSS) per styling consistente
- **Fallback**: React Native StyleSheet per animazioni complesse
- **Theme-Aware**: `useColorScheme()` per dark/light mode automatico

## 📋 Directory Guidelines

### `/ui` - Base UI Components
**Cosa include**:
- Componenti base riutilizzabili (Button, Input, Text, Card)
- Nessuna business logic, solo presentation
- Props interface completa e tipizzata
- Varianti di stile tramite props

**Esempio**:
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline';
  size: 'sm' | 'md' | 'lg';
  onPress: () => void;
  children: React.ReactNode;
}
```

### `/layout` - Layout Components
**Cosa include**:
- Header, Navbar, Container, Grid
- Strutture layout riutilizzabili
- Responsive design patterns

### `/cards` - Domain Cards
**Cosa include**:
- ProductCard, MaintenanceCard, UserCard
- Componenti card business-specific
- Display formattato di entity data

### `/modals` - Interactive Modals
**Cosa include**:
- ProductFormModal, MaintenanceOptionsModal
- Dialog per user interactions
- Form complessi in overlay

### `/scanner` - Scanner Domain
**Cosa include**:
- CameraScanner, ScanOverlay, OperationSelector
- Componenti specifici QR scanning workflow
- Business logic scanner-related

## 🔧 Convenzioni di Sviluppo

### File Naming
```
ComponentName.tsx           # PascalCase sempre
ComponentName.types.ts      # Types separati se complessi
ComponentName.test.tsx      # Test co-locati
ComponentName.stories.tsx   # Storybook (futuro)
```

### Component Structure
```typescript
// 1. Imports
import React from 'react';
import { ViewProps } from 'react-native';

// 2. Types/Interfaces
interface ComponentProps extends ViewProps {
  // props specifiche
}

// 3. Component con memo se necessario
const Component: React.FC<ComponentProps> = React.memo(({
  prop1,
  prop2,
  ...rest
}) => {
  // 4. Logic hooks
  // 5. Event handlers
  // 6. Render
});

// 7. Export
export default Component;
```

### Props Guidelines
- **Required props first**, optional dopo
- **Event handlers** con prefix `on` (onPress, onSubmit)
- **Render props** per composizione avanzata
- **Rest props** per estendibilità (`...rest`)

## ⚠️ Best Practices

### Performance
- `React.memo()` per componenti con props complesse
- `useCallback()` per event handlers passati come props
- `useMemo()` per expensive computations
- Avoid inline objects/functions come props

### Accessibilità
- `accessibilityLabel` per screen readers
- `accessibilityRole` appropriato
- Keyboard navigation supporto
- Color contrast compliance

### Error Handling
- PropTypes o TypeScript per type safety
- Default props per optional values
- Graceful fallbacks per missing data

## 🚨 Regole di Sviluppo

### ✅ Fare
- Componenti piccoli e focused (single responsibility)
- Props interface chiara e bem documentata
- Testare componenti isolatamente
- Usare TypeScript per type safety
- Co-locate related files (types, tests)

### ❌ Non Fare
- Business logic in UI components
- Direct API calls nei componenti
- Hard-coded colors/spacing (usare theme)
- Componenti monolitici >200 lines
- State management globale per UI state

## 📚 Pattern Comuni

### Compound Component
```typescript
const Card = ({ children }) => <View>{children}</View>;
Card.Header = ({ children }) => <View>{children}</View>;
Card.Body = ({ children }) => <View>{children}</View>;

// Usage: <Card><Card.Header>Title</Card.Header></Card>
```

### Render Props
```typescript
interface RenderProps {
  data: T[];
  loading: boolean;
  error?: string;
}

const DataProvider = ({ children }: { children: (props: RenderProps) => React.ReactNode }) => {
  // logic
  return children({ data, loading, error });
};
```

### Controlled vs Uncontrolled
```typescript
// Controlled (parent manages state)
const ControlledInput = ({ value, onChangeText }) => {
  return <TextInput value={value} onChangeText={onChangeText} />;
};

// Uncontrolled (internal state)
const UncontrolledInput = ({ onSubmit }) => {
  const [value, setValue] = useState('');
  return <TextInput value={value} onChangeText={setValue} />;
};
```

## 🔍 Testing Strategy

### Unit Tests
- Test props variations
- Test event handlers
- Test conditional rendering
- Snapshot tests per regressions

### Integration Tests
- Test component composition
- Test con real contexts (AuthContext, etc.)
- Test user interaction flows