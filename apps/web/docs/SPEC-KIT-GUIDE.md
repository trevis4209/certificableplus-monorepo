# 📋 Spec-Kit Guide - Sistema di Sviluppo Spec-Driven

**Spec-Kit** è un framework di sviluppo spec-driven che ti guida attraverso l'intero ciclo di sviluppo: dalla specifica iniziale all'implementazione completa, passando per la pianificazione e la generazione di task.

## 🎯 Panoramica del Workflow

```
/sp-specify → /sp-clarify → /sp-plan → /sp-tasks → /sp-analyze → /sp-implement
    ↓            ↓              ↓          ↓           ↓              ↓
 spec.md    clarified     plan.md    tasks.md    analysis    implementation
           spec.md      + docs                     report
```

## 📚 Comandi Disponibili

### 1️⃣ `/sp-specify` - Creare la Specifica Iniziale

**Scopo**: Trasforma una descrizione in linguaggio naturale in una specifica strutturata.

**Come usarlo**:
```bash
/sp-specify Voglio creare un sistema di gestione certificati con autenticazione multi-ruolo
```

**Cosa fa**:
1. Crea un nuovo branch `###-feature-name` basato sulla descrizione
2. Inizializza la struttura della feature in `/specs/###-feature-name/`
3. Genera `spec.md` usando il template con le sezioni:
   - Overview & Context
   - Functional Requirements
   - Non-Functional Requirements
   - User Stories
   - Edge Cases & Error Handling
   - Success Criteria

**Output**:
- Branch: `001-gestione-certificati`
- File: `/specs/001-gestione-certificati/spec.md`

---

### 2️⃣ `/sp-clarify` - Chiarire Ambiguità

**Scopo**: Identifica aree ambigue nella specifica e pone fino a 5 domande mirate per chiarirle.

**Come usarlo**:
```bash
/sp-clarify
```

**Cosa fa**:
1. Carica `spec.md` e analizza le ambiguità usando una tassonomia completa:
   - Functional Scope & Behavior
   - Domain & Data Model
   - Interaction & UX Flow
   - Non-Functional Quality Attributes
   - Integration & External Dependencies
   - Edge Cases & Failure Handling
   - Constraints & Tradeoffs
   - Terminology & Consistency

2. Genera un massimo di **5 domande prioritizzate** basate su:
   - Impatto sull'architettura
   - Impatto sul data modeling
   - Impatto sulla decomposizione dei task
   - Incertezza e rischio di rework

3. **Processo interattivo**:
   - Pone **UNA domanda alla volta**
   - Opzioni multiple choice O risposta breve (≤5 parole)
   - Integra ogni risposta **immediatamente** nella spec
   - Crea sezione `## Clarifications` con `### Session YYYY-MM-DD`

4. **Aggiornamento atomico**:
   - Salva dopo ogni risposta accettata
   - Aggiorna le sezioni rilevanti (Functional Requirements, Data Model, etc.)
   - Rimuove contraddizioni e placeholder vaghi

**Output**:
- `spec.md` aggiornato con:
  - Sezione `## Clarifications` documentando Q&A
  - Requisiti aggiornati con dettagli chiariti
  - Metriche quantificate al posto di aggettivi vaghi
  - Terminologia normalizzata

**Best Practice**:
- ⚠️ **Esegui PRIMA di `/sp-plan`** per ridurre il rischio di rework
- Se salti `/sp-clarify`, `/sp-plan` ti avviserà del rischio aumentato

---

### 3️⃣ `/sp-plan` - Pianificare l'Implementazione

**Scopo**: Genera un piano di implementazione completo con design artifacts.

**Come usarlo**:
```bash
/sp-plan Usa PostgreSQL per il database e Next.js per il frontend
```

**Cosa fa**:
1. **Pre-check**: Verifica che esista una sezione `## Clarifications` in `spec.md`
   - Se manca, suggerisce di eseguire `/sp-clarify` prima
   - Puoi forzare con override esplicito

2. **Carica il contesto**:
   - Legge `spec.md` per requisiti e user stories
   - Legge `constitution.md` per principi architetturali
   - Analizza constraints tecnici e dipendenze

3. **Esegue il template di pianificazione** (`plan-template.md`):

   **Phase 0 - Outline & Research** → `research.md`:
   - Ricerca tecnologie per risolvere `NEEDS CLARIFICATION`
   - Best practices per ogni tecnologia scelta
   - Pattern di integrazione
   - Output: Decisioni, Rationale, Alternative considerate

   **Phase 1 - Design & Contracts** → artifacts multipli:
   - **`data-model.md`**: Entità, campi, relazioni, validazioni
   - **`contracts/`**: OpenAPI/GraphQL schemas per ogni endpoint
   - **Contract tests**: Test che verificano gli schema (devono fallire, no impl)
   - **`quickstart.md`**: Scenari di test per validare user stories
   - **Agent file** (es. `CLAUDE.md`): Documentazione per AI agent

   **Phase 2 - Task Planning Approach**:
   - Descrive la strategia di generazione task (NON genera tasks.md)
   - Task ordering (TDD, dependencies)
   - Stima output (es. 25-30 task)

4. **Constitution Check**:
   - Valida compliance con principi costituzionali
   - Documenta violazioni e giustificazioni
   - Re-valuta dopo Phase 1

**Output**:
```
/specs/###-feature-name/
├── plan.md              # Piano completo con execution flow
├── research.md          # Decisioni tecniche ricercate
├── data-model.md        # Data model con entità e relazioni
├── contracts/           # API contracts (OpenAPI/GraphQL)
│   ├── users.yaml
│   └── products.yaml
└── quickstart.md        # Test scenarios integrazione
```

**Importante**:
- `/sp-plan` si ferma alla **descrizione della strategia task**
- NON crea `tasks.md` - questo è il lavoro di `/sp-tasks`

---

### 4️⃣ `/sp-tasks` - Generare Task Eseguibili

**Scopo**: Genera una lista di task ordinati per dipendenze e pronti per l'esecuzione.

**Come usarlo**:
```bash
/sp-tasks
```

**Cosa fa**:
1. **Carica design artifacts**:
   - `plan.md` → tech stack, architecture
   - `data-model.md` → entities (se esiste)
   - `contracts/` → API endpoints (se esiste)
   - `research.md` → decisioni tecniche (se esiste)
   - `quickstart.md` → scenari test (se esiste)

2. **Genera task strutturati** usando `tasks-template.md`:

   **Setup Tasks**:
   - Inizializzazione progetto
   - Installazione dipendenze
   - Configurazione linting/formatting

   **Test Tasks [P]** (Parallel):
   - Un contract test per ogni file in `contracts/`
   - Un integration test per ogni user story
   - Marcati `[P]` perché indipendenti

   **Core Tasks**:
   - Un task per ogni entità in `data-model.md` (marcato `[P]`)
   - Un task per ogni service/endpoint
   - Se stesso file → sequenziale (no `[P]`)

   **Integration Tasks**:
   - DB connections
   - Middleware setup
   - Logging & observability

   **Polish Tasks [P]**:
   - Unit tests
   - Performance optimization
   - Documentation

3. **Regole di ordinamento**:
   - Setup → Tests → Core → Integration → Polish
   - TDD: Test prima dell'implementazione
   - Models → Services → Endpoints
   - `[P]` = file diversi, possono essere paralleli

**Output**: `/specs/###-feature-name/tasks.md`
```markdown
## Implementation Tasks

### Phase 1: Setup (1-3)
- [T001] Initialize Next.js project with TypeScript
- [T002] Configure ESLint + Prettier
- [T003] Setup testing framework (Jest/Vitest)

### Phase 2: Tests (4-8) [Parallel Execution Possible]
- [T004] [P] Write contract test: POST /api/users
- [T005] [P] Write contract test: GET /api/products
- [T006] [P] Write integration test: User registration flow
...

### Phase 3: Core Implementation (9-15)
- [T009] [P] Implement User model with validation
- [T010] [P] Implement Product model with relationships
- [T011] Create AuthService with JWT logic
...

### Parallel Execution Examples
```bash
# Execute all contract tests in parallel
claude-code task execute T004 T005 T006 --parallel
```
```

---

### 5️⃣ `/sp-analyze` - Analisi di Consistenza

**Scopo**: Analisi read-only di consistenza cross-artifact prima dell'implementazione.

**Come usarlo**:
```bash
/sp-analyze
```

**Prerequisiti**:
- ✅ `spec.md` deve esistere
- ✅ `plan.md` deve esistere
- ✅ `tasks.md` deve esistere

**Cosa fa**:
1. **Carica artifacts**:
   - Parse `spec.md` → requirements, user stories
   - Parse `plan.md` → architecture, data model
   - Parse `tasks.md` → task IDs, dipendenze
   - Load `constitution.md` → principi

2. **Detection passes** (6 categorie):

   **A. Duplication Detection**:
   - Requisiti near-duplicate
   - Raccomanda consolidamento

   **B. Ambiguity Detection**:
   - Aggettivi vaghi senza metriche (fast, scalable, secure)
   - Placeholder irrisolti (TODO, ???, <placeholder>)

   **C. Underspecification**:
   - Requisiti senza outcome misurabile
   - User stories senza acceptance criteria
   - Task che referenziano file non definiti

   **D. Constitution Alignment** (CRITICAL):
   - Violazioni di principi MUST
   - Sezioni mandatory mancanti
   - Quality gates non rispettati

   **E. Coverage Gaps**:
   - Requisiti senza task associati
   - Task senza requisito mappato
   - Non-functional requirements non riflessi in task

   **F. Inconsistency**:
   - Terminology drift (stesso concetto, nomi diversi)
   - Entità in plan ma assenti in spec (o viceversa)
   - Contraddizioni nell'ordinamento task

3. **Severity Assignment**:
   - **CRITICAL**: Viola constitution MUST, requisito core senza coverage
   - **HIGH**: Requisiti duplicati/conflittuali, attributo security/performance ambiguo
   - **MEDIUM**: Terminology drift, coverage NF incompleto
   - **LOW**: Miglioramenti di stile

**Output**: Report Markdown strutturato
```markdown
### Specification Analysis Report

| ID | Category | Severity | Location(s) | Summary | Recommendation |
|----|----------|----------|-------------|---------|----------------|
| A1 | Duplication | HIGH | spec.md:L120-134 | Two similar requirements for user auth | Merge into single requirement |
| C1 | Constitution | CRITICAL | plan.md:L45 | Missing CLAUDE.md documentation | Add mandatory docs per constitution |
| E1 | Coverage | HIGH | spec.md:L78 | Security requirement has no tasks | Add security audit tasks |

### Coverage Summary
| Requirement Key | Has Task? | Task IDs | Notes |
|-----------------|-----------|----------|-------|
| user-can-upload-file | ✅ | T009, T015 | Covered |
| performance-metrics | ❌ | - | Missing tasks |

### Metrics
- Total Requirements: 24
- Total Tasks: 18
- Coverage %: 75%
- Critical Issues: 1
- Ambiguity Count: 3

### Next Actions
⚠️ CRITICAL issues exist - resolve before /sp-implement
1. Run /sp-plan to add missing CLAUDE.md documentation
2. Manually edit tasks.md to add coverage for 'performance-metrics'
3. Run /sp-clarify to resolve ambiguous security requirements
```

**Best Practice**:
- Esegui **SEMPRE prima di `/sp-implement`**
- Risolvi tutti i CRITICAL prima di procedere
- HIGH/MEDIUM possono essere gestiti ma documentati

---

### 6️⃣ `/sp-implement` - Esecuzione Implementazione

**Scopo**: Esegue tutti i task definiti in `tasks.md` seguendo l'ordine e le dipendenze.

**Come usarlo**:
```bash
/sp-implement
```

**Prerequisiti**:
- ✅ `tasks.md` deve esistere e essere completo
- ✅ Analisi `/sp-analyze` consigliata (nessun CRITICAL)

**Cosa fa**:
1. **Carica contesto completo**:
   - `tasks.md` → task list, execution plan
   - `plan.md` → tech stack, architecture
   - `data-model.md` → entities (opzionale)
   - `contracts/` → API specs (opzionale)
   - `research.md` → decisioni tecniche (opzionale)
   - `quickstart.md` → scenari integrazione (opzionale)

2. **Parse task structure**:
   - Fasi: Setup → Tests → Core → Integration → Polish
   - Dipendenze: Sequential vs Parallel `[P]`
   - File paths e marker di parallelismo

3. **Execution Strategy**:

   **Phase-by-Phase**:
   - Completa ogni fase prima della successiva
   - Rispetta le dipendenze sequenziali
   - Esegue task `[P]` in parallelo quando possibile

   **TDD Approach**:
   - Test tasks eseguiti PRIMA dell'implementazione
   - Contract tests → Model implementation → Service implementation

   **File-Based Coordination**:
   - Task sullo stesso file → sequenziali
   - File diversi → possono essere paralleli

4. **Progress Tracking**:
   - Report dopo ogni task completato
   - Marca task completati con `[X]` in `tasks.md`
   - Halt su errore task non-parallel
   - Continue con task parallel anche se alcuni falliscono

**Execution Flow Example**:
```
✅ [T001] Initialize Next.js project → COMPLETED
✅ [T002] Configure ESLint → COMPLETED
✅ [T003] Setup Jest → COMPLETED

Running Parallel Tests Phase...
✅ [T004] Contract test: POST /api/users → PASS
✅ [T005] Contract test: GET /api/products → PASS
⚠️ [T006] Integration test: Registration → FAIL (can continue)

✅ [T009] Implement User model → COMPLETED
✅ [T010] Implement Product model → COMPLETED
...
```

5. **Completion Validation**:
   - Verifica tutti i task richiesti completati
   - Features match specifica originale
   - Test passano e coverage OK
   - Implementazione segue technical plan

**Output**:
- Codice implementato seguendo `tasks.md`
- `tasks.md` aggiornato con `[X]` sui completati
- Report finale con summary del lavoro

---

### 7️⃣ `/sp-constitution` - Gestione Costituzione

**Scopo**: Crea o aggiorna la costituzione del progetto con principi e regole architetturali.

**Come usarlo**:
```bash
/sp-constitution
```

**Cosa fa**:
- Modalità interattiva per definire principi
- Genera/aggiorna `.specify/memory/constitution.md`
- Mantiene template sincronizzati

**Output**: `constitution.md` con:
- Core Principles (I-VII)
- Architecture Standards
- Quality Gates
- Governance Rules

---

## 🔄 Workflow Completo - Esempio Pratico

### Step 1: Inizializzare Feature
```bash
/sp-specify Creare un sistema di notifiche real-time con WebSocket per aggiornamenti istantanei
```
**Output**: `specs/002-notifiche-realtime/spec.md`

### Step 2: Chiarire Ambiguità
```bash
/sp-clarify
```
**Domande Esempio**:
- Q: Qual è il numero massimo di connessioni WebSocket simultanee supportate?
  - A: 10,000 connessioni
- Q: Quale protocollo di fallback se WebSocket non disponibile?
  - A: Server-Sent Events (SSE)

**Output**: `spec.md` aggiornato con clarifications

### Step 3: Pianificare Implementazione
```bash
/sp-plan Usa Socket.io per WebSocket e Redis per pub/sub
```
**Output**:
```
/specs/002-notifiche-realtime/
├── plan.md
├── research.md          # Socket.io vs native WS, Redis pub/sub patterns
├── data-model.md        # Notification entity, Channel, Subscription
├── contracts/
│   ├── websocket.yaml   # WS events schema
│   └── api.yaml         # REST fallback endpoints
└── quickstart.md        # Test scenario: Subscribe → Publish → Receive
```

### Step 4: Generare Tasks
```bash
/sp-tasks
```
**Output**: `tasks.md` con ~25 task:
```markdown
### Phase 1: Setup (1-3)
- [T001] Setup Socket.io server with Express
- [T002] Configure Redis client for pub/sub
- [T003] Setup WebSocket testing tools (wscat)

### Phase 2: Tests (4-9) [P]
- [T004] [P] Contract test: WS connection handshake
- [T005] [P] Contract test: Subscribe to channel
- [T006] [P] Integration test: Multi-client broadcast
...
```

### Step 5: Analizzare Consistenza
```bash
/sp-analyze
```
**Report Example**:
```
✅ No CRITICAL issues
⚠️ 2 MEDIUM issues:
- M1: Performance requirement "fast delivery" lacks metric
  → Recommendation: Add latency target (e.g., <100ms p95)
- M2: Redis failover scenario not covered in tasks
  → Recommendation: Add T025: Implement Redis Sentinel failover

Coverage: 92% (23/25 requirements have tasks)
```

### Step 6: Implementare
```bash
/sp-implement
```
**Execution**:
1. Setup Socket.io + Redis
2. Write + run contract tests (parallel)
3. Implement models (parallel)
4. Build WebSocket handlers (sequential - same file)
5. Integration tests
6. Polish: unit tests, docs, performance tuning

**Output**: Feature completamente implementata e testata

---

## 📋 Constitution - Principi Architetturali

Il file `constitution.md` definisce i principi non negoziabili del progetto.

**Principi CertificablePlus** (esempio):

### I. Type Safety First (NON-NEGOTIABLE)
- TypeScript strict mode
- Zod validation schemas
- ServiceResult pattern

### II. Documentation-Driven Development
- CLAUDE.md obbligatorio per directory
- JSDoc in ogni file
- Docs = first-class deliverable

### III. Component Architecture
- shadcn/ui patterns
- Separation of concerns
- Max 2 livelli prop drilling

### IV. Service Layer Pattern
- Centralizzazione business logic
- `{ success, data, error }` response
- Mock → Service → API migration path

### V. Mock-First Development
- Mock data prima del backend
- CRUD completo su mock
- UI unchanged durante migrazione

### VI. Responsive Multi-Role Design
- Company: Desktop sidebar
- Employee: Mobile bottom nav
- Viewer: Public read-only

### VII. Theme & Accessibility
- Dark mode (next-themes)
- WCAG 2.1 AA minimum
- Keyboard navigation

---

## 🛠️ File e Directory Structure

```
.specify/
├── memory/
│   └── constitution.md        # Principi architetturali progetto
├── scripts/
│   └── bash/
│       ├── create-new-feature.sh      # Crea branch + spec.md
│       ├── setup-plan.sh              # Setup planning phase
│       ├── check-prerequisites.sh     # Valida prerequisiti
│       └── update-agent-context.sh    # Aggiorna agent files
└── templates/
    ├── spec-template.md       # Template specifica
    ├── plan-template.md       # Template pianificazione
    └── tasks-template.md      # Template task list

specs/
└── ###-feature-name/          # Una directory per feature
    ├── spec.md                # Specifica feature
    ├── plan.md                # Piano implementazione
    ├── research.md            # Decisioni tecniche
    ├── data-model.md          # Entità e relazioni
    ├── contracts/             # API contracts
    │   ├── users.yaml
    │   └── products.yaml
    ├── quickstart.md          # Scenari test
    └── tasks.md               # Task list eseguibili

.claude/
└── commands/
    ├── sp-specify.md          # /sp-specify command
    ├── sp-clarify.md          # /sp-clarify command
    ├── sp-plan.md             # /sp-plan command
    ├── sp-tasks.md            # /sp-tasks command
    ├── sp-analyze.md          # /sp-analyze command
    ├── sp-implement.md        # /sp-implement command
    └── sp-constitution.md     # /sp-constitution command
```

---

## ✅ Best Practices

### 1. Workflow Sequenziale
```
✅ SEMPRE: /sp-specify → /sp-clarify → /sp-plan → /sp-tasks → /sp-analyze → /sp-implement
❌ MAI: Saltare /sp-clarify (aumenta rischio rework)
❌ MAI: /sp-implement senza /sp-analyze
```

### 2. Clarification Strategy
- Esegui `/sp-clarify` PRIMA di `/sp-plan`
- Rispondi a tutte le 5 domande (o termina early se coverage completo)
- Ogni risposta viene integrata atomicamente → spec sempre consistente

### 3. Constitution Compliance
- Leggi `constitution.md` prima di iniziare
- `/sp-analyze` flagga violazioni come CRITICAL
- Risolvi CRITICAL prima di `/sp-implement`

### 4. Task Execution
- Rispetta l'ordine: Setup → Tests → Core → Integration → Polish
- TDD: Test prima del codice
- Usa `[P]` per indicare parallelismo (file diversi)

### 5. Documentation
- Aggiorna JSDoc durante implementation
- Segui Documentation Maintenance Rules (constitution)
- Ogni PR include doc updates proporzionali

---

## 🚨 Troubleshooting

### Problema: `/sp-plan` dice "Run /sp-clarify first"
**Causa**: Manca sezione `## Clarifications` in `spec.md`
**Soluzione**:
```bash
/sp-clarify
# Rispondi alle domande
/sp-plan
```

### Problema: `/sp-tasks` non trova plan.md
**Causa**: `/sp-plan` non completato
**Soluzione**:
```bash
/sp-plan
/sp-tasks
```

### Problema: `/sp-implement` fallisce su task
**Causa**: Task dependencies non rispettate
**Soluzione**:
1. Controlla `tasks.md` per ordine corretto
2. Verifica che Setup tasks siano completati
3. Esegui `/sp-analyze` per coverage gaps

### Problema: `/sp-analyze` report troppi CRITICAL
**Causa**: Constitution violations o coverage gaps
**Soluzione**:
1. Leggi constitution.md
2. Aggiorna plan.md per compliance
3. Aggiungi task per coprire requisiti mancanti
4. Re-run `/sp-analyze`

---

## 📊 Metriche di Successo

Dopo ogni feature, valuta:

✅ **Spec Quality**:
- Coverage: ≥90% requisiti hanno task
- Clarifications: Tutte le ambiguità risolte
- Consistency: Zero terminologia drift

✅ **Plan Quality**:
- Constitution: Zero violazioni CRITICAL
- Architecture: Allineato con tech stack
- Documentation: Tutti gli artifact generati

✅ **Implementation Quality**:
- Tests: Tutti i contract + integration test passano
- Coverage: ≥80% code coverage
- Performance: Metriche entro budget definiti

---

## 🎓 Risorse Aggiuntive

- **Constitution Template**: `.specify/memory/constitution.md`
- **Spec Template**: `.specify/templates/spec-template.md`
- **Plan Template**: `.specify/templates/plan-template.md`
- **Tasks Template**: `.specify/templates/tasks-template.md`

**GitHub Spec-Kit**: https://github.com/github/spec-kit

---

**Pro Tip**: Usa `/sp-clarify` generosamente - 10 minuti di clarification possono risparmiare ore di rework! 🚀
