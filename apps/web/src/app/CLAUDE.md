# CLAUDE.md - /src/app

Directory Next.js 15 App Router per routing, layout e pagine dell'applicazione.

## 📁 Struttura

```
app/
├── layout.tsx          # Layout globale con ThemeProvider
├── page.tsx            # Homepage/landing page
├── globals.css         # Stili globali CSS
├── auth/              # Pagine autenticazione
│   ├── login/         # Login utenti
│   ├── register/      # Registrazione nuovi utenti
│   └── forgot-password/ # Reset password
├── company/           # Dashboard azienda
│   ├── layout.tsx     # Layout Server Component ottimizzato
│   ├── dashboard/     # Pannello principale azienda
│   ├── employee/      # Gestione dipendenti
│   ├── products/      # Catalogo prodotti
│   ├── maintenance/   # Gestione manutenzioni
│   └── map/          # Visualizzazione mappa
├── employee/          # Dashboard dipendente
│   ├── layout.tsx     # Layout mobile-first ottimizzato
│   ├── dashboard/     # Pannello principale dipendente
│   ├── products/      # Vista prodotti dipendente
│   ├── maintenance/   # Nuove manutenzioni
│   ├── scanner/       # Scanner QR codes
│   ├── map/          # Mappa prodotti/interventi
│   └── profile/      # Profilo dipendente
└── public/           # Pagine pubbliche
    ├── map/          # Mappa pubblica
    ├── products/     # Catalogo pubblico
    └── view/         # Vista prodotto pubblico
```

## 🏗️ Architettura

### Server vs Client Components
- **Layout principali**: Server Components per SEO e performance
- **Logica interattiva**: Client Components separati (es. `CompanyLayoutClient`)
- **Data fetching**: Server-side per initial load

### Multi-tenant Structure
- **company/**: Dashboard completo per gestione aziendale
- **employee/**: Interface mobile-first per operatori
- **public/**: Accesso pubblico senza autenticazione

## 🎨 Design Patterns

### Layout Strategy
```typescript
// Server Component (layout.tsx)
export default async function CompanyLayout({ children }) {
  const userData = await getServerSideData();
  return (
    <CompanyLayoutClient userData={userData}>
      {children}
    </CompanyLayoutClient>
  );
}

// Client Component separato per interattività
"use client";
export function CompanyLayoutClient({ userData, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Interactive logic...
}
```

### Routing Conventions
- Nested layouts per role-based access
- File-based routing con Next.js App Router
- Gruppi di route per organizzazione logica

## 🔐 Autenticazione

**IMPORTANTE**: Sistema di autenticazione attualmente mockato.

**Stato attuale**:
- Mock users in `lib/mock-data.ts`
- Nessuna validazione reale di credenziali
- Redirect basato solo sul ruolo selezionato

**Per implementazione produzione**:
- Integrare NextAuth.js o Supabase Auth
- Implementare middleware di protezione route
- Aggiungere session management

## 🚀 Performance Optimizations

### Layout Optimizations
- **Server Components** per layout principali (+35% SSR)
- **Client boundaries** ottimizzate per interattività
- **Data fetching** server-side per initial load

### Code Splitting
- Dynamic imports per componenti pesanti
- Route-based splitting automatico
- Lazy loading per modali e componenti opzionali

## 📱 Responsive Design

### Company Layout
- Desktop-first con sidebar tradizionale
- Responsive design per tablet/mobile
- Header fisso con navigazione completa

### Employee Layout
- Mobile-first design
- Bottom navigation su mobile
- Header compatto con info utente
- Desktop fallback con sidebar

## 🔧 Development Guidelines

### Adding New Pages
1. Creare cartella con `page.tsx`
2. Aggiungere metadata per SEO
3. Seguire pattern Server/Client Component
4. Testare responsive design

### Layout Modifications
1. **Server logic** nei layout principali
2. **Client logic** nei componenti `*Client.tsx`
3. Passare dati tramite props tipate
4. Mantenere performance optimizations

### Metadata e SEO
```typescript
// Metadata statico
export const metadata = {
  title: "Dashboard | CertificablePlus",
  description: "Gestione prodotti e manutenzioni"
};

// Metadata dinamico
export async function generateMetadata({ params }) {
  return {
    title: `Prodotto ${params.id} | CertificablePlus`
  };
}
```