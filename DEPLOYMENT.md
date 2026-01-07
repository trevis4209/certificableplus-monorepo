# Deployment Guide - CertificablePlus Web App su Coolify

Guida completa per il deployment dell'applicazione Next.js 15 su Coolify con architettura Turborepo monorepo.

## 📋 Prerequisiti

- Account Coolify configurato
- Repository GitHub: `https://github.com/trevis4209/certificableplus-monorepo`
- Branch: `main`
- Node.js: >=20.0.0
- Database PostgreSQL (futuro) o API backend configurata

---

## 🚀 Opzione 1: Deployment con Nixpacks (Raccomandato)

Nixpacks è il metodo più semplice - Coolify rileva automaticamente Next.js e configura tutto.

### Step 1: Crea Nuova Applicazione in Coolify

1. Vai su **Applications** → **+ New Application**
2. Seleziona **Public Repository**
3. Inserisci URL: `https://github.com/trevis4209/certificableplus-monorepo`
4. Branch: `main`

### Step 2: Configurazione Build

**Build Pack**:
```
Build Pack: nixpacks
```

**Base Directory** (IMPORTANTE per monorepo):
```
Base Directory: apps/web
```
> Questo dice a Coolify di eseguire tutti i comandi da `apps/web/` invece della root.

**Build Command** (opzionale, Nixpacks auto-detect):
```
Build Command: npm run build
```

**Start Command**:
```
Start Command: npm run start
```

**Install Command** (opzionale):
```
Install Command: npm install
```

### Step 3: Watch Paths (Opzionale)

Per evitare rebuild inutili quando cambi solo l'app mobile:
```
Watch Paths: apps/web/**, packages/**
```

### Step 4: Configurazione Porte

```
Port: 3000
Expose Port: 3000
```

### Step 5: Environment Variables

Aggiungi in **Environment Variables**:

```bash
# Application
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# API URLs (sostituisci con i tuoi)
NEXT_PUBLIC_API_URL=https://api.tuo-dominio.com
NEXT_PUBLIC_APP_URL=https://app.tuo-dominio.com

# Turborepo Remote Caching (opzionale)
TURBO_TEAM=your-team-id
TURBO_TOKEN=your-token
```

### Step 6: Deploy

1. Clicca **Save**
2. Clicca **Deploy**
3. Monitora i logs per verificare:
   ```
   ✓ Installing dependencies
   ✓ Building Next.js application
   ✓ Starting application on port 3000
   ```

**Tempo stimato**: 3-5 minuti per il primo deploy.

---

## 🐳 Opzione 2: Deployment con Dockerfile (Controllo Avanzato)

Usa il Dockerfile custom per maggior controllo sul processo di build.

### Step 1: Crea Applicazione

1. Vai su **Applications** → **+ New Application**
2. Seleziona repository GitHub
3. Branch: `main`

### Step 2: Configurazione Dockerfile

**Build Pack**:
```
Build Pack: dockerfile
```

**Dockerfile Location**:
```
Dockerfile: ./Dockerfile
```

**Build Context**:
```
Build Context: .
```
> Il Dockerfile è già nella root del monorepo.

**No Base Directory** (il Dockerfile gestisce già il monorepo).

### Step 3: Porte e Health Check

```
Port: 3000
Expose Port: 3000
Health Check Path: /
Health Check Interval: 30s
```

### Step 4: Environment Variables

Stesse variabili dell'Opzione 1:
```bash
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
NEXT_PUBLIC_API_URL=https://api.tuo-dominio.com
NEXT_PUBLIC_APP_URL=https://app.tuo-dominio.com
```

### Step 5: Deploy

Clicca **Deploy** e monitora il build multi-stage:
```
[1/5] Building turbo stage...
[2/5] Pruning workspace...
[3/5] Installing dependencies...
[4/5] Building application...
[5/5] Creating runtime image...
```

**Tempo stimato**: 4-7 minuti per il primo deploy (cache successivamente).

---

## 🔧 Configurazione Avanzata

### Custom Domain

1. Vai su **Domains** nella tua applicazione
2. Aggiungi dominio: `app.tuo-dominio.com`
3. Configura DNS:
   - **Type**: A Record
   - **Name**: app
   - **Value**: `<IP-del-tuo-server-Coolify>`
4. Coolify genera automaticamente certificato SSL con Let's Encrypt

### SSL/TLS

Coolify configura automaticamente HTTPS con Let's Encrypt quando aggiungi un custom domain.

### Database Connection (Futuro)

Quando integrerai un database PostgreSQL:

1. Crea database in Coolify: **Databases** → **+ New Database**
2. Ottieni connection string
3. Aggiungi environment variable:
   ```bash
   DATABASE_URL=postgresql://user:password@host:5432/dbname
   ```

### Logging e Monitoring

Coolify offre logs in tempo reale:
1. Vai su **Logs** nella tua applicazione
2. Filtra per:
   - **Build logs**: errori durante il build
   - **Runtime logs**: errori dell'applicazione
   - **System logs**: problemi del container

### Automatic Deployments

Per abilitare deploy automatici ad ogni push su `main`:

1. Vai su **Settings** → **Webhooks**
2. Abilita **Auto Deploy on Push**
3. Configura webhook su GitHub:
   - **Payload URL**: fornito da Coolify
   - **Content Type**: application/json
   - **Events**: Push events

---

## 📊 Architettura del Build

### Multi-Stage Dockerfile Workflow

```
┌─────────────────┐
│  Base (Alpine)  │  → Node 20 + libc6-compat
└────────┬────────┘
         │
    ┌────▼────────┐
    │   Turbo     │  → Install Turbo CLI globally
    └────┬────────┘
         │
    ┌────▼────────┐
    │   Pruner    │  → turbo prune web --docker
    └────┬────────┘     (creates minimal dependency tree)
         │
    ┌────▼────────┐
    │  Installer  │  → npm ci (install only web dependencies)
    └────┬────────┘
         │
    ┌────▼────────┐
    │   Builder   │  → npm run build --filter=web
    └────┬────────┘     (builds web + packages/*)
         │
    ┌────▼────────┐
    │   Runner    │  → Final image with standalone output
    └─────────────┘     (60-70% smaller than full build)
```

### Cache Layers

Docker/Coolify cachea ogni stage:
- **Layer 1-3**: Cached unless `package.json` changes
- **Layer 4-5**: Cached unless source code changes

**Risultato**: Rebuild da 4 minuti a ~30 secondi per modifiche al codice.

---

## 🐛 Troubleshooting

### Errore: "Cannot find module '@certplus/types'"

**Causa**: Packages non buildati correttamente.

**Soluzione**:
```bash
# Locale - test build
npm install
turbo run build --filter=web

# Se funziona localmente, verifica Coolify logs per errori di build
```

### Errore: "ENOENT: no such file or directory, open '.next/standalone'"

**Causa**: `output: 'standalone'` non configurato in `next.config.js`.

**Soluzione**: Il file è già configurato. Se persiste:
```bash
# Verifica che next.config.js contenga:
# output: 'standalone'
```

### Build Timeout

**Causa**: Build troppo lento o risorse insufficienti.

**Soluzione**:
1. Aumenta timeout in Coolify: **Settings** → **Build Timeout**: 900s
2. Verifica risorse server (RAM >= 2GB)
3. Abilita Turbo remote caching

### Port Already in Use

**Causa**: Porta 3000 già occupata sul server.

**Soluzione**:
1. Cambia porta in Coolify: **Port**: 3001
2. Aggiungi env var: `PORT=3001`

### Environment Variables Not Loading

**Causa**: Variabili non prefissate correttamente.

**Soluzione**:
- **Browser-side**: DEVE iniziare con `NEXT_PUBLIC_`
- **Server-side**: Qualsiasi nome (es. `DATABASE_URL`)

Verifica in Coolify: **Environment Variables** → Restart application.

### Image Size Too Large

**Causa**: Dockerfile non sta usando standalone output.

**Soluzione**: Il Dockerfile è già ottimizzato con:
- Alpine base image (~50MB vs ~200MB)
- Multi-stage build
- Standalone output Next.js
- .dockerignore per escludere file non necessari

**Dimensione finale attesa**: 150-200MB (vs 800MB+ senza ottimizzazioni).

---

## 🔄 Workflow di Sviluppo e Deploy

### Locale → Staging → Production

```bash
# 1. Sviluppo locale
npm run dev

# 2. Test build locale
npm run build
npm run start

# 3. Commit e push
git add .
git commit -m "feat: new feature"
git push origin main

# 4. Coolify auto-deploy (se webhook abilitato)
# Oppure: Deploy manuale da dashboard Coolify
```

### Rollback in Caso di Errore

1. Vai su **Deployments** in Coolify
2. Trova deployment precedente funzionante
3. Clicca **Redeploy**

Oppure:
```bash
# Git rollback
git revert HEAD
git push origin main
```

---

## 📈 Performance e Ottimizzazioni

### Build Time Optimization

1. **Turbo Remote Caching**: Riduci build da 4min a 30sec
   ```bash
   TURBO_TEAM=your-team
   TURBO_TOKEN=your-token
   ```

2. **Docker Layer Caching**: Coolify cachea automaticamente

3. **Watch Paths**: Evita rebuild inutili
   ```
   apps/web/**, packages/**
   ```

### Runtime Optimization

- **Standalone Output**: Abilitato in `next.config.js` (riduce bundle 60-70%)
- **Image Optimization**: Next.js 15 ottimizza automaticamente immagini
- **Bundle Analyzer**: Analizza bundle con `npm run analyze`

### Health Monitoring

Dockerfile include health check:
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3
```

Coolify rileva automaticamente container non healthy e restart.

---

## 🔐 Security Best Practices

### Non-Root User

Il Dockerfile crea e usa utente `nextjs` (UID 1001) invece di root.

### Environment Secrets

**MAI committare** file `.env` nel repository. Usa sempre Coolify Environment Variables per:
- API keys
- Database credentials
- JWT secrets

### SSL/TLS

Coolify configura automaticamente HTTPS con Let's Encrypt su custom domains.

### Firewall

Assicurati che solo le porte necessarie siano esposte:
- **3000**: Application (HTTP)
- **443**: HTTPS (Coolify reverse proxy)
- **80**: HTTP redirect to HTTPS

---

## 📞 Support e Risorse

### Coolify Documentation
- [Applications Guide](https://coolify.io/docs/applications/)
- [Next.js Deployment](https://coolify.io/docs/applications/nextjs)
- [Environment Variables](https://coolify.io/docs/knowledge-base/environment-variables)

### Repository
- **GitHub**: https://github.com/trevis4209/certificableplus-monorepo
- **Branch**: main

### Turborepo Resources
- [Docker Guide](https://turborepo.com/docs/guides/tools/docker)
- [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching)

---

## ✅ Checklist Pre-Deploy

Prima di fare il primo deploy, verifica:

- [ ] `next.config.js` ha `output: 'standalone'` ✅ (già configurato)
- [ ] `Dockerfile` presente nella root ✅ (già creato)
- [ ] `.dockerignore` presente nella root ✅ (già creato)
- [ ] Environment variables configurate in Coolify
- [ ] Custom domain configurato (opzionale)
- [ ] DNS configurato per dominio custom (opzionale)
- [ ] Webhook GitHub configurato per auto-deploy (opzionale)
- [ ] Build locale testato: `npm run build && npm start`

---

## 🎉 Dopo il Deploy

Una volta deployato con successo:

1. **Verifica applicazione**: Visita il dominio assegnato da Coolify
2. **Testa funzionalità chiave**:
   - Login/Authentication
   - Product listing
   - QR code generation
   - Responsive design
3. **Monitora logs**: Controlla per errori runtime
4. **Setup monitoring**: Considera Sentry/LogRocket per error tracking

---

**Autore**: Claude Code
**Data**: 7 Gennaio 2026
**Versione**: 1.0.0
