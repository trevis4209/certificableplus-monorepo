# DATABASE SCHEMA SPECIFICATION
# CertificablePlus - Gestione Segnaletica Stradale Certificata

**Target**: MySQL Database + Blockchain Integration  
**Frontend**: Next.js 15 + TypeScript  
**Backend Expert**: Database design e implementazione API

---

## 🎯 OVERVIEW BUSINESS DOMAIN

**CertificablePlus** è un sistema di gestione della **segnaletica stradale certificata** per aziende che:

- Installano segnali stradali permanenti e temporanei
- Gestiscono manutenzioni programmate e interventi
- Devono rispettare normative di sicurezza e certificazioni
- Tracciano interventi con GPS coordinates e foto documentazione  
- Hanno team di operatori mobile-first
- Necessitano di **certificazione blockchain** per autenticità

---

## 📊 ENTITIES ANALYSIS

### Core Entities identificate dai Mock Data:

1. **Companies** - Aziende di segnaletica stradale
2. **Users** - Sistema autenticazione utenti
3. **Employees** - Dati operatori sul campo
4. **Products** - Segnali stradali con specifiche tecniche complete
5. **Maintenances** - Storico completo di tutti gli interventi
6. **Scheduled_Maintenances** - Pianificazione manutenzioni future
7. **Worksites** - Progetti/cantieri con coordinate geografiche
8. **Blockchain_Records** - Registrazioni blockchain per certificazione
9. **Installation_Data** - Dati dettagliati installazione
10. **Pending_Actions** - Azioni in attesa di esecuzione

---

## 🗄️ DATABASE SCHEMA DESIGN (JSON Format)

### 1. TABLE: `companies`

```json
{
  "table_name": "companies",
  "description": "Aziende certificate per installazione segnaletica stradale",
  "used_in_pages": [
    "/company/* - Tutte le pagine company (dashboard, profile, settings)",
    "/employee/* - Per identificare l'azienda di appartenenza",
    "/api/auth - Durante login per determinare company_id"
  ],
  "business_utility": "Gestione multi-tenant: ogni azienda ha i suoi prodotti, dipendenti e permessi isolati",
  "fields": {
    "id": {
      "type": "UUID",
      "primary_key": true,
      "auto_generated": true,
      "description": "Identificativo univoco azienda"
    },
    "name": {
      "type": "VARCHAR(255)",
      "required": true,
      "description": "Nome azienda (es. 'Segnaletica Stradale SRL')"
    },
    "email": {
      "type": "VARCHAR(255)",
      "required": true,
      "unique": true,
      "description": "Email aziendale per comunicazioni"
    },
    "logo_url": {
      "type": "TEXT",
      "required": false,
      "description": "URL logo aziendale per branding"
    },
    "created_at": {
      "type": "TIMESTAMPTZ",
      "required": true,
      "default": "NOW()",
      "description": "Data registrazione azienda"
    },
    "updated_at": {
      "type": "TIMESTAMPTZ",
      "required": true,
      "default": "NOW()",
      "description": "Ultima modifica"
    }
  },
  "indexes": [
    {
      "name": "idx_companies_email",
      "fields": ["email"],
      "purpose": "Ricerca rapida per login/auth"
    },
    {
      "name": "idx_companies_created_at",
      "fields": ["created_at"],
      "purpose": "Ordinamento cronologico"
    }
  ]
}
```

---

### 2. TABLE: `users`

```json
{
  "table_name": "users",
  "description": "Sistema autenticazione utenti - solo login e controllo accessi",
  "used_in_pages": [
    "/auth/login - Autenticazione utenti",
    "/auth/register - Registrazione nuovi utenti",
    "/api/auth/* - Tutti gli endpoint di autenticazione",
    "Middleware auth - Verifica sessioni e permessi"
  ],
  "business_utility": "Separazione auth logic da business data. Un user può avere un employee record collegato se role='employee'",
  "fields": {
    "id": {
      "type": "UUID",
      "primary_key": true,
      "auto_generated": true,
      "description": "Identificativo univoco utente"
    },
    "email": {
      "type": "VARCHAR(255)",
      "required": true,
      "unique": true,
      "description": "Email per login (username)"
    },
    "password_hash": {
      "type": "VARCHAR(255)",
      "required": true,
      "description": "Password hashata (bcrypt/scrypt)"
    },
    "role": {
      "type": "ENUM",
      "required": true,
      "values": ["company", "employee"],
      "description": "Ruolo utente: company=manager, employee=operatore"
    },
    "company_id": {
      "type": "UUID",
      "required": true,
      "foreign_key": "companies(id)",
      "description": "Azienda di appartenenza"
    },
    "is_active": {
      "type": "BOOLEAN",
      "required": true,
      "default": true,
      "description": "Account attivo/disattivato"
    },
    "last_login": {
      "type": "TIMESTAMPTZ",
      "required": false,
      "description": "Ultimo accesso per security tracking"
    },
    "created_at": {
      "type": "TIMESTAMPTZ",
      "required": true,
      "default": "NOW()",
      "description": "Data registrazione"
    },
    "updated_at": {
      "type": "TIMESTAMPTZ",
      "required": true,
      "default": "NOW()",
      "description": "Ultima modifica"
    }
  },
  "indexes": [
    {
      "name": "idx_users_email",
      "fields": ["email"],
      "purpose": "Login rapido"
    },
    {
      "name": "idx_users_company_id",
      "fields": ["company_id"],
      "purpose": "Filtraggio per azienda"
    },
    {
      "name": "idx_users_role",
      "fields": ["role"],
      "purpose": "Ricerca per ruolo"
    }
  ]
}
```

---

### 3. TABLE: `employees`

```json
{
  "table_name": "employees",
  "description": "Dati business operatori sul campo - skills, certificazioni, info operative",
  "used_in_pages": [
    "/company/employees - Gestione dipendenti (CRUD)",
    "/company/calendar - Assegnazione manutenzioni agli operatori", 
    "/employee/* - Tutte le pagine employee (profile, schedule, scanner)",
    "/company/dashboard - Statistiche operatori (workload, performance)"
  ],
  "business_utility": "Gestione operatori con competenze specifiche, tracking veicoli, orari disponibilità per ottimizzare assegnazioni lavori",
  "fields": {
    "id": {
      "type": "UUID",
      "primary_key": true,
      "auto_generated": true,
      "description": "ID univoco operatore"
    },
    "user_id": {
      "type": "UUID",
      "required": true,
      "unique": true,
      "foreign_key": "users(id)",
      "description": "Link 1:1 con user account per login"
    },
    "company_id": {
      "type": "UUID",
      "required": true,
      "foreign_key": "companies(id)",
      "description": "Azienda di appartenenza"
    },
    "full_name": {
      "type": "VARCHAR(255)",
      "required": true,
      "description": "Nome completo operatore"
    },
    "phone_number": {
      "type": "VARCHAR(50)",
      "required": false,
      "description": "Telefono per emergenze/coordinamento"
    },
    "skills": {
      "type": "TEXT[]",
      "required": false,
      "description": "Array competenze: ['traffic_signals', 'electrical', 'climbing']"
    },
    "certifications": {
      "type": "TEXT[]",
      "required": false,
      "description": "Certificazioni professionali possedute"
    },
    "available_hours": {
      "type": "VARCHAR(100)",
      "required": false,
      "description": "Orari disponibilità: '08:00-18:00' o custom"
    },
    "vehicle_plate": {
      "type": "VARCHAR(20)",
      "required": false,
      "description": "Targa veicolo aziendale assegnato"
    },
    "gps_tracking_enabled": {
      "type": "BOOLEAN",
      "required": true,
      "default": false,
      "description": "Consenso tracking GPS per ottimizzazione route"
    },
    "status": {
      "type": "ENUM",
      "required": true,
      "values": ["active", "inactive", "vacation", "sick_leave"],
      "default": "active",
      "description": "Status operatore per planning"
    },
    "created_at": {
      "type": "TIMESTAMPTZ",
      "required": true,
      "default": "NOW()",
      "description": "Data assunzione"
    },
    "updated_at": {
      "type": "TIMESTAMPTZ",
      "required": true,
      "default": "NOW()",
      "description": "Ultima modifica dati"
    }
  },
  "indexes": [
    {
      "name": "idx_employees_user_id",
      "fields": ["user_id"],
      "unique": true,
      "purpose": "Link 1:1 con users table"
    },
    {
      "name": "idx_employees_company_id",
      "fields": ["company_id"],
      "purpose": "Filtraggio operatori per azienda"
    },
    {
      "name": "idx_employees_status",
      "fields": ["status"],
      "purpose": "Query operatori disponibili"
    },
    {
      "name": "idx_employees_skills",
      "fields": ["skills"],
      "type": "GIN",
      "purpose": "Ricerca per competenze specifiche"
    }
  ]
}
```

---

### 4. TABLE: `products`

```json
{
  "table_name": "products",
  "description": "Catalogo segnali stradali con specifiche tecniche complete e tracciabilità QR",
  "used_in_pages": [
    "/company/products - Gestione catalogo prodotti (CRUD)",
    "/company/dashboard - Statistiche prodotti installati", 
    "/employee/scanner - Scansione QR per identificazione prodotto",
    "/public/product/[qr_code] - Pagina pubblica di verifica prodotto",
    "/company/maintenance - Storico interventi per prodotto",
    "/company/analytics - Analytics geografiche e per tipologia"
  ],
  "business_utility": "Core business: ogni segnale ha QR univoco per tracciamento completo lifecycle, specifiche tecniche per compliance normative, geolocalizzazione per ottimizzazione interventi",
  "fields": {
    "id": {
      "type": "UUID",
      "primary_key": true,
      "auto_generated": true,
      "description": "ID univoco prodotto"
    },
    "qr_code": {
      "type": "VARCHAR(50)",
      "required": true,
      "unique": true,
      "description": "QR code univoco per identificazione e tracking"
    },
    "signal_type": {
      "type": "ENUM",
      "required": true,
      "values": ["permanent", "temporary"],
      "description": "Tipologia: permanente o temporanea (per cantieri)"
    },
    "year": {
      "type": "INTEGER",
      "required": true,
      "constraints": ">= 2000 AND <= current_year + 5",
      "description": "Anno installazione per calcolo scadenze"
    },
    "shape": {
      "type": "ENUM",
      "required": true,
      "values": ["triangular", "circular", "rectangular", "square", "octagonal", "arrow"],
      "description": "Forma segnale secondo normativa stradale"
    },
    "dimensions": {
      "type": "VARCHAR(50)",
      "required": true,
      "description": "Dimensioni fisiche (es. '60x60cm', '120x80cm')"
    },
    "support_material": {
      "type": "VARCHAR(100)",
      "required": true,
      "description": "Materiale supporto: 'Aluminum', 'PVC', 'Treated_Wood'"
    },
    "support_thickness": {
      "type": "DECIMAL(4,2)",
      "required": true,
      "description": "Spessore supporto in mm"
    },
    "attachment_type": {
      "type": "ENUM",
      "required": true,
      "values": ["bolts", "poles", "clamps", "brackets", "other"],
      "description": "Tipo attacco/fissaggio"
    },
    "fixation": {
      "type": "VARCHAR(255)",
      "required": true,
      "description": "Descrizione dettagliata fissaggio"
    },
    "film_material": {
      "type": "VARCHAR(100)",
      "required": true,
      "description": "Classe pellicola rifrangente: 'class_1', 'class_2', 'class_3', 'class_iis'"
    },
    "wl_code": {
      "type": "VARCHAR(50)",
      "required": false,
      "description": "Codice WL identificativo normativa"
    },
    "figure_url": {
      "type": "TEXT",
      "required": false,
      "description": "URL immagine segnale"
    },
    "gps_lat": {
      "type": "DECIMAL(10,7)",
      "required": true,
      "description": "Latitudine GPS installazione"
    },
    "gps_lng": {
      "type": "DECIMAL(10,7)",
      "required": true,
      "description": "Longitudine GPS installazione"
    },
    "address": {
      "type": "TEXT",
      "required": true,
      "description": "Indirizzo completo leggibile"
    },
    "company_id": {
      "type": "UUID",
      "required": true,
      "foreign_key": "companies(id)",
      "description": "Azienda proprietaria"
    },
    "created_by": {
      "type": "UUID",
      "required": true,
      "foreign_key": "users(id)",
      "description": "Utente che ha creato il record"
    },
    "created_at": {
      "type": "TIMESTAMPTZ",
      "required": true,
      "default": "NOW()",
      "description": "Data creazione record"
    },
    "updated_at": {
      "type": "TIMESTAMPTZ",
      "required": true,
      "default": "NOW()",
      "description": "Ultima modifica"
    }
  },
  "indexes": [
    {
      "name": "idx_products_qr_code",
      "fields": ["qr_code"],
      "unique": true,
      "purpose": "Lookup rapido per scanner QR"
    },
    {
      "name": "idx_products_company_id",
      "fields": ["company_id"],
      "purpose": "Filtraggio prodotti per azienda"
    },
    {
      "name": "idx_products_gps",
      "fields": ["gps_lat", "gps_lng"],
      "purpose": "Ricerche geografiche e proximity"
    },
    {
      "name": "idx_products_address",
      "fields": ["address"],
      "type": "GIN",
      "purpose": "Full-text search su indirizzi"
    },
    {
      "name": "idx_products_signal_type",
      "fields": ["signal_type"],
      "purpose": "Filtraggio per tipologia"
    }
  ]
}
```

---

### 5. TABLE: `maintenances`

```json
{
  "table_name": "maintenances",
  "description": "Storico completo interventi su segnali - core per compliance e tracciabilità",
  "used_in_pages": [
    "/company/maintenance - Storico completo interventi",
    "/employee/maintenance - Form inserimento nuovo intervento", 
    "/employee/schedule - Visualizzazione interventi assegnati",
    "/company/dashboard - Statistiche interventi e performance",
    "/company/analytics - Analytics per tipologia intervento",
    "/public/product/[qr_code] - Storico pubblico per prodotto"
  ],
  "business_utility": "Core compliance: tracciamento obbligatorio per legge di tutti gli interventi, documentazione fotografica, certificazioni, geolocalizzazione per audit e ottimizzazione",
  "fields": {
    "id": {
      "type": "UUID",
      "primary_key": true,
      "auto_generated": true,
      "description": "ID univoco intervento"
    },
    "product_id": {
      "type": "UUID",
      "required": true,
      "foreign_key": "products(id)",
      "description": "Prodotto oggetto dell'intervento"
    },
    "employee_id": {
      "type": "UUID",
      "required": true,
      "foreign_key": "employees(id)",
      "description": "Operatore che ha eseguito l'intervento"
    },
    "company_id": {
      "type": "UUID",
      "required": true,
      "foreign_key": "companies(id)",
      "description": "Azienda che ha eseguito l'intervento"
    },
    "intervention_type": {
      "type": "ENUM",
      "required": true,
      "values": ["installation", "maintenance", "inspection", "replacement", "removal"],
      "description": "Tipo intervento per classificazione e reporting"
    },
    "year": {
      "type": "INTEGER",
      "required": true,
      "constraints": ">= 2000",
      "description": "Anno intervento per raggruppamenti statistici"
    },
    "reason": {
      "type": "TEXT",
      "required": true,
      "description": "Causale/motivazione intervento per audit"
    },
    "certificate_number": {
      "type": "VARCHAR(100)",
      "required": true,
      "description": "Numero certificato conformità associato"
    },
    "gps_lat": {
      "type": "DECIMAL(10,7)",
      "required": true,
      "description": "Latitudine GPS punto intervento"
    },
    "gps_lng": {
      "type": "DECIMAL(10,7)",
      "required": true,
      "description": "Longitudine GPS punto intervento"
    },
    "address": {
      "type": "TEXT",
      "required": true,
      "description": "Indirizzo completo leggibile"
    },
    "installation_type": {
      "type": "ENUM",
      "required": false,
      "values": ["single_pole", "double_pole", "triple_pole", "quad_pole", "other"],
      "description": "Tipo installazione (solo per intervention_type='installation')"
    },
    "notes": {
      "type": "TEXT",
      "required": false,
      "description": "Note aggiuntive operatore"
    },
    "photo_urls": {
      "type": "TEXT[]",
      "required": false,
      "description": "Array URL foto documentazione intervento"
    },
    "created_at": {
      "type": "TIMESTAMPTZ",
      "required": true,
      "default": "NOW()",
      "description": "Timestamp esecuzione intervento"
    }
  },
  "indexes": [
    {
      "name": "idx_maintenances_product_id",
      "fields": ["product_id"],
      "purpose": "Storico per singolo prodotto"
    },
    {
      "name": "idx_maintenances_employee_id",
      "fields": ["employee_id"],
      "purpose": "Performance tracking operatore"
    },
    {
      "name": "idx_maintenances_company_id",
      "fields": ["company_id"],
      "purpose": "Filtraggio per azienda"
    },
    {
      "name": "idx_maintenances_intervention_type",
      "fields": ["intervention_type"],
      "purpose": "Analytics per tipologia"
    },
    {
      "name": "idx_maintenances_created_at",
      "fields": ["created_at"],
      "purpose": "Ordinamento cronologico"
    },
    {
      "name": "idx_maintenances_certificate_number",
      "fields": ["certificate_number"],
      "purpose": "Ricerca per certificato"
    }
  ]
}
```

---

### 6. TABLE: `scheduled_maintenances`

```json
{
  "table_name": "scheduled_maintenances",
  "description": "Pianificazione manutenzioni future - sistema calendario per operatori mobile",
  "used_in_pages": [
    "/company/calendar - MaintenanceCalendar con vista settimanale/giornaliera",
    "/employee/schedule - Calendario personale operatore mobile", 
    "/employee/dashboard - Prossimi interventi in programma",
    "/company/dashboard - Overview workload team",
    "/company/analytics - Pianificazione vs eseguito"
  ],
  "business_utility": "Ottimizzazione planning: assegnazione intelligente basata su skills, GPS proximity, workload balancing, timeline 30min slots 8:00-18:00",
  "fields": {
    "id": {
      "type": "UUID",
      "primary_key": true,
      "auto_generated": true,
      "description": "ID univoco pianificazione"
    },
    "employee_id": {
      "type": "UUID",
      "required": true,
      "foreign_key": "employees(id)",
      "description": "Operatore assegnato"
    },
    "product_id": {
      "type": "UUID",
      "required": true,
      "foreign_key": "products(id)",
      "description": "Prodotto da manutenere"
    },
    "title": {
      "type": "VARCHAR(255)",
      "required": true,
      "description": "Titolo intervento per calendario"
    },
    "product_name": {
      "type": "VARCHAR(255)",
      "required": true,
      "description": "Nome prodotto (denormalizzato per performance calendario)"
    },
    "product_location": {
      "type": "VARCHAR(255)",
      "required": false,
      "description": "Location abbreviata per UI"
    },
    "employee_name": {
      "type": "VARCHAR(255)",
      "required": true,
      "description": "Nome operatore (denormalizzato per performance)"
    },
    "maintenance_type": {
      "type": "ENUM",
      "required": true,
      "values": ["installation", "maintenance", "inspection", "replacement", "removal"],
      "description": "Tipo manutenzione programmata"
    },
    "scheduled_date": {
      "type": "DATE",
      "required": true,
      "description": "Data programmata intervento"
    },
    "start_time": {
      "type": "TIME",
      "required": true,
      "description": "Ora inizio (timeline 30min slots)"
    },
    "end_time": {
      "type": "TIME",
      "required": true,
      "description": "Ora fine stimata"
    },
    "duration": {
      "type": "INTEGER",
      "required": true,
      "description": "Durata stimata in minuti"
    },
    "status": {
      "type": "ENUM",
      "required": true,
      "values": ["scheduled", "in_progress", "completed", "cancelled"],
      "default": "scheduled",
      "description": "Status per tracking workflow"
    },
    "priority": {
      "type": "ENUM",
      "required": true,
      "values": ["low", "medium", "high", "urgent"],
      "default": "medium",
      "description": "Priorità per scheduling algorithm"
    },
    "gps_lat": {
      "type": "DECIMAL(10,7)",
      "required": true,
      "description": "Latitudine per route optimization"
    },
    "gps_lng": {
      "type": "DECIMAL(10,7)",
      "required": true,
      "description": "Longitudine per proximity matching"
    },
    "address": {
      "type": "TEXT",
      "required": true,
      "description": "Indirizzo completo per operatore"
    },
    "notes": {
      "type": "TEXT",
      "required": false,
      "description": "Note specifiche per l'operatore"
    },
    "created_at": {
      "type": "TIMESTAMPTZ",
      "required": true,
      "default": "NOW()",
      "description": "Quando è stata programmata"
    },
    "updated_at": {
      "type": "TIMESTAMPTZ",
      "required": true,
      "default": "NOW()",
      "description": "Ultima modifica scheduling"
    }
  },
  "indexes": [
    {
      "name": "idx_scheduled_maintenances_employee_id",
      "fields": ["employee_id"],
      "purpose": "Calendario per singolo operatore"
    },
    {
      "name": "idx_scheduled_maintenances_scheduled_date",
      "fields": ["scheduled_date"],
      "purpose": "Vista calendario giornaliera/settimanale"
    },
    {
      "name": "idx_scheduled_maintenances_status",
      "fields": ["status"],
      "purpose": "Filtraggio per status workflow"
    },
    {
      "name": "idx_scheduled_maintenances_priority",
      "fields": ["priority"],
      "purpose": "Ordinamento per priorità"
    },
    {
      "name": "idx_scheduled_date_employee",
      "fields": ["scheduled_date", "employee_id"],
      "purpose": "Query calendario specifiche per performance"
    }
  ]
}
```

---

### 7. TABLE: `worksites`

```json
{
  "table_name": "worksites",
  "description": "Gestione cantieri e progetti temporanei con tracking geografico completo delle aree di lavoro",
  "used_in_pages": [
    "/company/worksites - Gestione cantieri attivi (CRUD)",
    "/company/analytics - Performance e statistiche cantieri",
    "/company/dashboard - Overview cantieri in corso",
    "/employee/worksites - Cantieri assegnati operatore",
    "Future: Planning automatico segnali temporanei per cantieri"
  ],
  "business_utility": "Gestione cantieri temporanei per installazione segnaletica temporanea, coordinamento team su aree specifiche, tracking geografico progetti infrastrutturali",
  "fields": {
    "id": {
      "type": "UUID",
      "primary_key": true,
      "auto_generated": true,
      "description": "ID univoco cantiere"
    },
    "company_id": {
      "type": "UUID",
      "required": true,
      "foreign_key": "companies(id)",
      "description": "Azienda responsabile del cantiere"
    },
    "name": {
      "type": "VARCHAR(255)",
      "required": true,
      "description": "Nome identificativo cantiere/progetto"
    },
    "description": {
      "type": "TEXT",
      "required": false,
      "description": "Descrizione dettagliata del progetto"
    },
    "start_date": {
      "type": "DATE",
      "required": true,
      "description": "Data inizio cantiere"
    },
    "end_date": {
      "type": "DATE",
      "required": false,
      "description": "Data fine prevista cantiere"
    },
    "gps_start_lat": {
      "type": "DECIMAL(10,7)",
      "required": true,
      "description": "Latitudine punto inizio area cantiere"
    },
    "gps_start_lng": {
      "type": "DECIMAL(10,7)",
      "required": true,
      "description": "Longitudine punto inizio area cantiere"
    },
    "gps_end_lat": {
      "type": "DECIMAL(10,7)",
      "required": true,
      "description": "Latitudine punto fine area cantiere"
    },
    "gps_end_lng": {
      "type": "DECIMAL(10,7)",
      "required": true,
      "description": "Longitudine punto fine area cantiere"
    },
    "start_address": {
      "type": "TEXT",
      "required": true,
      "description": "Indirizzo completo punto inizio cantiere"
    },
    "end_address": {
      "type": "TEXT",
      "required": false,
      "description": "Indirizzo completo punto fine cantiere"
    },
    "status": {
      "type": "ENUM",
      "required": true,
      "values": ["planning", "active", "suspended", "completed", "cancelled"],
      "default": "planning",
      "description": "Status cantiere per workflow tracking"
    },
    "project_manager": {
      "type": "VARCHAR(255)",
      "required": false,
      "description": "Responsabile progetto cantiere"
    },
    "estimated_duration": {
      "type": "INTEGER",
      "required": false,
      "description": "Durata stimata in giorni"
    },
    "created_at": {
      "type": "TIMESTAMPTZ",
      "required": true,
      "default": "NOW()",
      "description": "Data creazione cantiere"
    },
    "updated_at": {
      "type": "TIMESTAMPTZ",
      "required": true,
      "default": "NOW()",
      "description": "Ultima modifica"
    }
  },
  "indexes": [
    {
      "name": "idx_worksites_company_id",
      "fields": ["company_id"],
      "purpose": "Filtraggio cantieri per azienda"
    },
    {
      "name": "idx_worksites_status",
      "fields": ["status"],
      "purpose": "Ricerca cantieri per status"
    },
    {
      "name": "idx_worksites_start_date",
      "fields": ["start_date"],
      "purpose": "Ordinamento cronologico"
    },
    {
      "name": "idx_worksites_gps_start",
      "fields": ["gps_start_lat", "gps_start_lng"],
      "purpose": "Query geografiche proximity"
    },
    {
      "name": "idx_worksites_name",
      "fields": ["name"],
      "type": "GIN",
      "purpose": "Full-text search nome cantiere"
    }
  ]
}
```

### 8. TABLE: `blockchain_records`

```json
{
  "table_name": "blockchain_records",
  "description": "Certificazione blockchain per autenticità immutabile e anti-contraffazione prodotti",
  "used_in_pages": [
    "/public/product/[qr_code] - Verifica blockchain pubblica con explorer link",
    "/company/products - Status certificazione e pending transactions",
    "/company/blockchain - Dashboard certificazioni blockchain",
    "/company/analytics - Statistiche certificazioni per compliance",
    "Future: Blockchain audit trail automatico"
  ],
  "business_utility": "Certificazione immutabile per compliance enterprise, anti-contraffazione, audit trail governativo, tracciabilità verificabile pubblicamente",
  "fields": {
    "id": {
      "type": "UUID",
      "primary_key": true,
      "auto_generated": true,
      "description": "ID univoco record blockchain"
    },
    "product_id": {
      "type": "UUID",
      "required": true,
      "foreign_key": "products(id)",
      "description": "Prodotto certificato"
    },
    "qr_code": {
      "type": "VARCHAR(50)",
      "required": true,
      "description": "QR code prodotto (denormalizzato per performance)"
    },
    "transaction_hash": {
      "type": "VARCHAR(255)",
      "required": true,
      "unique": true,
      "description": "Hash transazione blockchain univoco"
    },
    "blockchain": {
      "type": "ENUM",
      "required": true,
      "values": ["ethereum", "polygon", "binance", "arbitrum"],
      "default": "ethereum",
      "description": "Blockchain utilizzata per certificazione"
    },
    "contract_address": {
      "type": "VARCHAR(255)",
      "required": true,
      "description": "Indirizzo smart contract certificazione"
    },
    "token_id": {
      "type": "VARCHAR(100)",
      "required": false,
      "description": "Token ID se NFT certificate"
    },
    "block_number": {
      "type": "BIGINT",
      "required": true,
      "description": "Numero blocco per verifica immutabilità"
    },
    "status": {
      "type": "ENUM",
      "required": true,
      "values": ["pending", "confirmed", "failed", "reverted"],
      "default": "pending",
      "description": "Status transazione blockchain"
    },
    "gas_used": {
      "type": "INTEGER",
      "required": false,
      "description": "Gas utilizzato per transazione"
    },
    "explorer_url": {
      "type": "TEXT",
      "required": false,
      "description": "URL block explorer per verifica pubblica"
    },
    "blockchain_timestamp": {
      "type": "TIMESTAMPTZ",
      "required": true,
      "description": "Timestamp blockchain transazione"
    },
    "created_at": {
      "type": "TIMESTAMPTZ",
      "required": true,
      "default": "NOW()",
      "description": "Data creazione record"
    },
    "updated_at": {
      "type": "TIMESTAMPTZ",
      "required": true,
      "default": "NOW()",
      "description": "Ultimo aggiornamento status"
    }
  },
  "indexes": [
    {
      "name": "idx_blockchain_records_transaction_hash",
      "fields": ["transaction_hash"],
      "unique": true,
      "purpose": "Verifica rapida transazione blockchain"
    },
    {
      "name": "idx_blockchain_records_product_id",
      "fields": ["product_id"],
      "purpose": "Certificazioni per singolo prodotto"
    },
    {
      "name": "idx_blockchain_records_qr_code",
      "fields": ["qr_code"],
      "purpose": "Lookup rapido per scanner QR"
    },
    {
      "name": "idx_blockchain_records_blockchain",
      "fields": ["blockchain"],
      "purpose": "Filtraggio per blockchain specifica"
    },
    {
      "name": "idx_blockchain_records_status",
      "fields": ["status"],
      "purpose": "Query pending/confirmed per monitoring"
    }
  ]
}
```

### 9. TABLE: `installation_data`

```json
{
  "table_name": "installation_data",
  "description": "Dati dettagliati installazione con certificazioni conformità e tracking warranty",
  "used_in_pages": [
    "/public/product/[qr_code] - Certificato pubblico con dati installazione",
    "/company/maintenance - Info installazione per planning manutenzioni",
    "/company/products - Dettagli tecnici e scadenze warranty",
    "/company/compliance - Audit trail certificazioni e conformità",
    "/company/dashboard - Overview scadenze warranty e manutenzioni"
  ],
  "business_utility": "Certificazioni conformità normative, warranty tracking automatico, compliance audit trail, scadenze manutenzioni programmate basate su installazione",
  "fields": {
    "id": {
      "type": "UUID",
      "primary_key": true,
      "auto_generated": true,
      "description": "ID univoco record installazione"
    },
    "product_id": {
      "type": "UUID",
      "required": true,
      "unique": true,
      "foreign_key": "products(id)",
      "description": "Prodotto installato (relazione 1:1)"
    },
    "qr_code": {
      "type": "VARCHAR(50)",
      "required": true,
      "description": "QR code prodotto (denormalizzato per performance)"
    },
    "installation_date": {
      "type": "TIMESTAMPTZ",
      "required": true,
      "description": "Data installazione effettiva"
    },
    "installer_company": {
      "type": "VARCHAR(255)",
      "required": true,
      "description": "Azienda che ha eseguito l'installazione"
    },
    "installer_technician": {
      "type": "VARCHAR(255)",
      "required": true,
      "description": "Tecnico responsabile installazione"
    },
    "installation_location": {
      "type": "TEXT",
      "required": true,
      "description": "Descrizione dettagliata location installazione"
    },
    "certification_number": {
      "type": "VARCHAR(100)",
      "required": true,
      "unique": true,
      "description": "Numero certificato conformità univoco"
    },
    "compliance_standards": {
      "type": "TEXT[]",
      "required": false,
      "description": "Array standard rispettati: ['EN_12899', 'CE_marking', 'UNI_8027']"
    },
    "warranty_period": {
      "type": "VARCHAR(50)",
      "required": false,
      "description": "Periodo garanzia: '5 years', '36 months'"
    },
    "warranty_expiry_date": {
      "type": "DATE",
      "required": false,
      "description": "Data scadenza garanzia calcolata"
    },
    "next_maintenance_due": {
      "type": "DATE",
      "required": false,
      "description": "Prossima manutenzione programmata"
    },
    "maintenance_frequency": {
      "type": "ENUM",
      "required": false,
      "values": ["monthly", "quarterly", "biannual", "annual", "custom"],
      "description": "Frequenza manutenzioni raccomandata"
    },
    "installation_photos": {
      "type": "TEXT[]",
      "required": false,
      "description": "Array URL foto installazione"
    },
    "compliance_notes": {
      "type": "TEXT",
      "required": false,
      "description": "Note conformità e compliance"
    },
    "created_at": {
      "type": "TIMESTAMPTZ",
      "required": true,
      "default": "NOW()",
      "description": "Data creazione record"
    },
    "updated_at": {
      "type": "TIMESTAMPTZ",
      "required": true,
      "default": "NOW()",
      "description": "Ultima modifica"
    }
  },
  "indexes": [
    {
      "name": "idx_installation_data_product_id",
      "fields": ["product_id"],
      "unique": true,
      "purpose": "Relazione 1:1 con products"
    },
    {
      "name": "idx_installation_data_qr_code",
      "fields": ["qr_code"],
      "purpose": "Lookup rapido per scanner QR"
    },
    {
      "name": "idx_installation_data_certification_number",
      "fields": ["certification_number"],
      "unique": true,
      "purpose": "Ricerca per certificato conformità"
    },
    {
      "name": "idx_installation_data_next_maintenance_due",
      "fields": ["next_maintenance_due"],
      "purpose": "Query scadenze manutenzioni"
    },
    {
      "name": "idx_installation_data_warranty_expiry",
      "fields": ["warranty_expiry_date"],
      "purpose": "Alert scadenze warranty"
    },
    {
      "name": "idx_installation_data_compliance_standards",
      "fields": ["compliance_standards"],
      "type": "GIN",
      "purpose": "Ricerca per standard conformità"
    }
  ]
}
```

### 10. TABLE: `pending_actions`

```json
{
  "table_name": "pending_actions",
  "description": "Sistema task management per azioni richieste e workflow automation sui prodotti",
  "used_in_pages": [
    "/company/dashboard - Azioni pending overview con prioritizzazione",
    "/employee/tasks - Task assegnati operatore con deadline",
    "/company/compliance - Azioni overdue per audit",
    "/company/maintenance - Pipeline manutenzioni automatiche",
    "/employee/schedule - Integrazione con calendario operatore",
    "Future: Workflow automation completo"
  ],
  "business_utility": "Task management automatico, escalation scadenze, workflow compliance, prioritizzazione interventi basata su urgenza e rischio, automation trigger per manutenzioni",
  "fields": {
    "id": {
      "type": "UUID",
      "primary_key": true,
      "auto_generated": true,
      "description": "ID univoco azione pendente"
    },
    "product_id": {
      "type": "UUID",
      "required": true,
      "foreign_key": "products(id)",
      "description": "Prodotto oggetto dell'azione"
    },
    "qr_code": {
      "type": "VARCHAR(50)",
      "required": true,
      "description": "QR code prodotto (denormalizzato)"
    },
    "assigned_company": {
      "type": "VARCHAR(255)",
      "required": true,
      "description": "Azienda assegnata per l'esecuzione"
    },
    "assigned_employee_id": {
      "type": "UUID",
      "required": false,
      "foreign_key": "employees(id)",
      "description": "Operatore specifico assegnato (opzionale)"
    },
    "action_type": {
      "type": "ENUM",
      "required": true,
      "values": ["scheduled_maintenance", "inspection_overdue", "replacement_needed", "compliance_check", "damage_repair", "relocation_required"],
      "description": "Tipo azione da eseguire"
    },
    "description": {
      "type": "TEXT",
      "required": true,
      "description": "Descrizione dettagliata azione richiesta"
    },
    "due_date": {
      "type": "DATE",
      "required": true,
      "description": "Data scadenza azione"
    },
    "priority": {
      "type": "ENUM",
      "required": true,
      "values": ["low", "medium", "high", "urgent", "critical"],
      "default": "medium",
      "description": "Priorità per scheduling algorithm"
    },
    "estimated_duration": {
      "type": "VARCHAR(50)",
      "required": false,
      "description": "Durata stimata: '2 hours', '45 minutes'"
    },
    "status": {
      "type": "ENUM",
      "required": true,
      "values": ["pending", "approved", "assigned", "in_progress", "completed", "cancelled", "overdue", "pending_approval"],
      "default": "pending",
      "description": "Status workflow per tracking"
    },
    "risk_level": {
      "type": "ENUM",
      "required": false,
      "values": ["low", "medium", "high", "critical"],
      "description": "Livello rischio se non eseguita"
    },
    "created_by": {
      "type": "ENUM",
      "required": true,
      "values": ["system", "user", "automation"],
      "default": "system",
      "description": "Chi ha generato l'azione"
    },
    "escalation_date": {
      "type": "DATE",
      "required": false,
      "description": "Data escalation automatica se non completata"
    },
    "completion_notes": {
      "type": "TEXT",
      "required": false,
      "description": "Note compilate dopo completamento"
    },
    "created_at": {
      "type": "TIMESTAMPTZ",
      "required": true,
      "default": "NOW()",
      "description": "Data generazione azione"
    },
    "updated_at": {
      "type": "TIMESTAMPTZ",
      "required": true,
      "default": "NOW()",
      "description": "Ultimo aggiornamento status"
    },
    "completed_at": {
      "type": "TIMESTAMPTZ",
      "required": false,
      "description": "Timestamp completamento azione"
    }
  },
  "indexes": [
    {
      "name": "idx_pending_actions_product_id",
      "fields": ["product_id"],
      "purpose": "Azioni per singolo prodotto"
    },
    {
      "name": "idx_pending_actions_qr_code",
      "fields": ["qr_code"],
      "purpose": "Lookup rapido per scanner QR"
    },
    {
      "name": "idx_pending_actions_assigned_employee_id",
      "fields": ["assigned_employee_id"],
      "purpose": "Task assegnati a operatore"
    },
    {
      "name": "idx_pending_actions_action_type",
      "fields": ["action_type"],
      "purpose": "Filtraggio per tipologia azione"
    },
    {
      "name": "idx_pending_actions_status",
      "fields": ["status"],
      "purpose": "Query per status workflow"
    },
    {
      "name": "idx_pending_actions_due_date",
      "fields": ["due_date"],
      "purpose": "Ordinamento per scadenza"
    },
    {
      "name": "idx_pending_actions_priority",
      "fields": ["priority"],
      "purpose": "Ordinamento per priorità"
    },
    {
      "name": "idx_pending_actions_overdue",
      "fields": ["due_date", "status"],
      "purpose": "Query azioni scadute"
    }
  ]
}
```


---

## 🔗 RELATIONSHIPS MATRIX

```
companies (1) ←→ (N) users
companies (1) ←→ (N) employees  
companies (1) ←→ (N) products  
companies (1) ←→ (N) worksites

users (1) ←→ (1) employees [only if role='employee']
users (1) ←→ (N) products (created_by)

employees (1) ←→ (N) maintenances (employee_id)
employees (1) ←→ (N) scheduled_maintenances (employee_id)

products (1) ←→ (N) maintenances
products (1) ←→ (N) scheduled_maintenances
products (1) ←→ (1) installation_data
products (1) ←→ (N) blockchain_records
products (1) ←→ (N) pending_actions

maintenances (N) ←→ (1) companies (company_id - who performed)
```

---

## 📈 PERFORMANCE CONSIDERATIONS

### Critical Indexes Needed:
```sql
-- Geospatial queries (prodotti vicini)
CREATE INDEX idx_products_gps_spatial ON products USING GIST (
  point(gps_lng, gps_lat)
);

-- Maintenance history queries
CREATE INDEX idx_maintenance_product_created ON maintenance(product_id, created_at DESC);

-- Calendar queries
CREATE INDEX idx_scheduled_date_employee ON scheduled_maintenances(scheduled_date, employee_id);

-- Company dashboards
CREATE INDEX idx_products_company_created ON products(company_id, created_at DESC);
```

### Denormalization Strategy:
- `employee_name`, `product_name` in `scheduled_maintenances` per performance calendario
- `qr_code` in `blockchain_records` e `installation_data` per lookup diretti
- Considerare materialized views per dashboard analytics

---

## 🚀 API ENDPOINTS SUGGESTIONS (per Backend Expert)

### Authentication & Users
```
POST /api/auth/login
POST /api/auth/register  
GET  /api/auth/me
POST /api/auth/logout
```

### Products Management
```
GET    /api/products?company_id=X&page=1&limit=20
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
GET    /api/products/:qr_code/details
GET    /api/products/:qr_code/maintenance-history
```

### Employees Management
```
GET    /api/employees?company_id=X
POST   /api/employees
PUT    /api/employees/:id
DELETE /api/employees/:id
GET    /api/employees/:id/schedule
```

### Maintenance Operations
```
GET  /api/maintenances?product_id=X&type=installation
POST /api/maintenances
PUT  /api/maintenances/:id
GET  /api/maintenances/stats/:company_id
```

### Scheduled Maintenances (Calendar)
```
GET  /api/scheduled-maintenances?date=2024-02-15&employee_id=X
POST /api/scheduled-maintenances
PUT  /api/scheduled-maintenances/:id/status
DELETE /api/scheduled-maintenances/:id
```

### Blockchain Integration
```
POST /api/blockchain/certify/:product_id
GET  /api/blockchain/verify/:qr_code
GET  /api/blockchain/status/:transaction_hash
```

---

## 🔐 SECURITY CONSIDERATIONS

### Authentication & Authorization:
- **JWT tokens** con refresh token mechanism
- **Role-based access control** (RBAC):
  - `company`: Full CRUD su propri prodotti/manutenzioni
  - `employee`: Read + Create manutenzioni assegnate
- **Company isolation**: Users vedono solo data della propria company

### Data Protection:
- **Field-level encryption** per dati sensibili
- **Audit log** per tracking modifiche critiche
- **Rate limiting** su API endpoints
- **Input validation** e SQL injection protection

### Blockchain Security:
- **Private key management** per signing transactions
- **Multi-signature** per operazioni critiche
- **Gas price optimization** per cost management

---

## 📊 MIGRATION STRATEGY (from Mock Data)

### Phase 1: Core Tables
1. Create `companies`, `users`, `products` 
2. Migrate existing mock data
3. Test authentication e basic CRUD

### Phase 2: Operations
1. Add `maintenance`, `scheduled_maintenances`
2. Implement calendar functionality
3. Add file upload per foto documentation

### Phase 3: Advanced Features  
1. `blockchain_records`, `installation_data`
2. `pending_actions`, `cantieri`
3. Analytics e reporting

### Phase 4: Production Optimizations
1. Add monitoring e logging
2. Performance tuning indexes
3. Backup e disaster recovery

---

## 🎯 FRONTEND-BACKEND CONTRACT

### Data Models Types (TypeScript):
```typescript
// Frontend TypeScript interfaces matching DB schema
export interface User {
  id: string;
  email: string;
  role: 'company' | 'employee';
  company_id: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  user_id: string;
  company_id: string;
  full_name: string;
  phone_number?: string;
  skills: string[];
  certifications: string[];
  available_hours?: string;
  vehicle_plate?: string;
  gps_tracking_enabled: boolean;
  status: 'active' | 'inactive' | 'vacation' | 'sick_leave';
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  qr_code: string;
  signal_type: 'permanent' | 'temporary';
  year: number;
  shape: 'triangular' | 'circular' | 'rectangular' | 'square' | 'octagonal' | 'arrow';
  dimensions: string;
  support_material: string;
  support_thickness: number;
  attachment_type: 'bolts' | 'poles' | 'clamps' | 'brackets' | 'other';
  fixation: string;
  film_material: string;
  wl_code?: string;
  figure_url?: string;
  gps_lat: number;
  gps_lng: number;
  address: string; // Full address in plain text
  company_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Maintenance {
  id: string;
  product_id: string;
  employee_id: string;
  company_id: string;
  intervention_type: 'installation' | 'maintenance' | 'inspection' | 'replacement' | 'removal';
  year: number;
  reason: string;
  certificate_number: string;
  gps_lat: number;
  gps_lng: number;
  address: string; // Full address in plain text
  installation_type?: 'single_pole' | 'double_pole' | 'triple_pole' | 'quad_pole' | 'other';
  notes?: string;
  photo_urls: string[];
  created_at: string;
}

export interface ScheduledMaintenance {
  id: string;
  employee_id: string;
  product_id: string;
  title: string;
  product_name: string;
  product_location: string;
  employee_name: string;
  maintenance_type: 'installation' | 'maintenance' | 'inspection' | 'replacement' | 'removal';
  scheduled_date: string;
  start_time: string;
  end_time: string;
  duration: number; // Duration in minutes
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  gps_lat: number;
  gps_lng: number;
  address: string; // Full address in plain text
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Worksite {
  id: string;
  start_date: string;
  end_date?: string;
  gps_start_lat: number;
  gps_start_lng: number;
  gps_end_lat: number;
  gps_end_lng: number;
  start_address: string; // Full start address in plain text
  end_address?: string; // Full end address in plain text
  status: 'open' | 'closed' | 'suspended';
  company_id: string;
  name?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}
```

### API Response Format:
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    has_more: boolean;
  };
}
```

---
