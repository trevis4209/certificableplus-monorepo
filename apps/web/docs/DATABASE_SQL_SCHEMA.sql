-- =====================================================
-- CertificablePlus - Database SQL Schema
-- PostgreSQL Database Schema for Traffic Signal Management
-- =====================================================
-- Target: PostgreSQL 14+ with UUID support
-- Frontend: Next.js 15 + TypeScript
-- Purpose: Complete SQL implementation ready for production
-- =====================================================

-- =====================================================
-- ENUMS DEFINITIONS
-- =====================================================

-- User roles enum
CREATE TYPE user_role_enum AS ENUM ('company', 'employee');

-- Employee status enum
CREATE TYPE employee_status_enum AS ENUM ('active', 'inactive', 'vacation', 'sick_leave');

-- Product signal type enum
CREATE TYPE signal_type_enum AS ENUM ('permanent', 'temporary');

-- Product shape enum
CREATE TYPE product_shape_enum AS ENUM ('triangular', 'circular', 'rectangular', 'square', 'octagonal', 'arrow');

-- Product attachment type enum
CREATE TYPE attachment_type_enum AS ENUM ('bolts', 'poles', 'clamps', 'brackets', 'other');

-- Maintenance intervention type enum
CREATE TYPE intervention_type_enum AS ENUM ('installation', 'maintenance', 'inspection', 'replacement', 'removal');

-- Installation type enum
CREATE TYPE installation_type_enum AS ENUM ('single_pole', 'double_pole', 'triple_pole', 'quad_pole', 'other');

-- Scheduled maintenance status enum
CREATE TYPE scheduled_status_enum AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');

-- Priority enum
CREATE TYPE priority_enum AS ENUM ('low', 'medium', 'high', 'urgent', 'critical');

-- Worksite status enum
CREATE TYPE worksite_status_enum AS ENUM ('planning', 'active', 'suspended', 'completed', 'cancelled');

-- Blockchain enum
CREATE TYPE blockchain_enum AS ENUM ('ethereum', 'polygon', 'binance', 'arbitrum');

-- Blockchain status enum
CREATE TYPE blockchain_status_enum AS ENUM ('pending', 'confirmed', 'failed', 'reverted');

-- Maintenance frequency enum
CREATE TYPE maintenance_frequency_enum AS ENUM ('monthly', 'quarterly', 'biannual', 'annual', 'custom');

-- Action type enum
CREATE TYPE action_type_enum AS ENUM ('scheduled_maintenance', 'inspection_overdue', 'replacement_needed', 'compliance_check', 'damage_repair', 'relocation_required');

-- Action status enum
CREATE TYPE action_status_enum AS ENUM ('pending', 'approved', 'assigned', 'in_progress', 'completed', 'cancelled', 'overdue', 'pending_approval');

-- Action created by enum
CREATE TYPE action_created_by_enum AS ENUM ('system', 'user', 'automation');

-- Risk level enum
CREATE TYPE risk_level_enum AS ENUM ('low', 'medium', 'high', 'critical');

-- =====================================================
-- TABLE: companies
-- Aziende certificate per installazione segnaletica stradale
-- 
-- DESCRIPTION: 
-- Core entity per multi-tenancy. Ogni azienda ha i suoi prodotti, dipendenti 
-- e manutenzioni isolati. Supporta branding con logo e gestione profilo aziendale.
--
-- USED IN PAGES:
-- - /company/dashboard - Dashboard principale con statistiche aziendali
-- - /company/profile - Gestione profilo e settings aziendali (future)
-- - /auth/register - Registrazione nuove aziende
-- - /auth/login - Identificazione azienda per multi-tenant
-- - /public/products - Branding pubblico con logo e nome azienda
-- - /api/auth/* - Tutti gli endpoint autenticazione per company isolation
--
-- BUSINESS LOGIC:
-- Gestione multi-tenant: ogni azienda vede solo i propri dati (products, employees, 
-- maintenances). Il company_id viene usato come filtro in tutte le query per 
-- garantire isolamento dati. Logo utilizzato per branding nella sezione pubblica.
-- =====================================================

CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    logo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Companies indexes
CREATE INDEX idx_companies_email ON companies(email);
CREATE INDEX idx_companies_created_at ON companies(created_at);

-- =====================================================
-- TABLE: users
-- Sistema autenticazione utenti con ruoli company/employee
-- 
-- DESCRIPTION: 
-- Tabella authentication separata da business data. Gestisce solo login e 
-- controllo accessi. I dati business sono nella tabella employees per role='employee'.
--
-- USED IN PAGES:
-- - /auth/login - Autenticazione con email/password
-- - /auth/register - Registrazione nuovi account
-- - /auth/forgot-password - Reset password workflow
-- - /api/auth/login - Endpoint login con JWT tokens
-- - /api/auth/me - Verifica sessione utente corrente
-- - Middleware - Protezione route e verifica permissions
--
-- BUSINESS LOGIC:
-- Separazione auth/business: users contiene solo credenziali e ruoli, employees 
-- contiene dati operativi. Role 'company' = manager aziendale, role 'employee' = 
-- operatore campo. Un user employee ha sempre un record employees collegato 1:1.
-- =====================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role_enum NOT NULL,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_role ON users(role);

-- =====================================================
-- TABLE: employees
-- Dati business operatori sul campo con skills e certificazioni
-- 
-- DESCRIPTION: 
-- Dati operativi degli operatori: competenze, veicoli, orari, tracking GPS.
-- Separato da users per clean architecture. Supporta planning intelligente 
-- basato su skills, disponibilità e posizione per ottimizzazione assegnazioni.
--
-- USED IN PAGES:
-- - /company/employees - CRUD gestione dipendenti con modal form
-- - /company/dashboard - Statistiche team e performance operatori
-- - /company/calendar - Assegnazione manutenzioni con skill matching
-- - /employee/profile - Profilo personale operatore (self-service)
-- - /employee/dashboard - Info personali e statistiche individuali
-- - /company/map - Tracking GPS operatori (se abilitato)
--
-- BUSINESS LOGIC:
-- Relazione 1:1 con users per role='employee'. Skills array per matching 
-- automatico con requisiti manutenzioni. Status per planning (vacation, 
-- sick_leave). GPS tracking opzionale per route optimization. Available_hours 
-- per scheduling intelligente calendario manutenzioni.
-- =====================================================

CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50),
    skills TEXT[],
    certifications TEXT[],
    available_hours VARCHAR(100),
    vehicle_plate VARCHAR(20),
    gps_tracking_enabled BOOLEAN NOT NULL DEFAULT false,
    status employee_status_enum NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Employees indexes
CREATE UNIQUE INDEX idx_employees_user_id ON employees(user_id);
CREATE INDEX idx_employees_company_id ON employees(company_id);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_skills ON employees USING GIN(skills);

-- =====================================================
-- TABLE: products
-- Catalogo segnali stradali con specifiche tecniche e QR tracking
-- 
-- DESCRIPTION: 
-- Core business entity. Ogni segnale stradale certificato con QR code univoco 
-- per tracking completo lifecycle. Specifiche tecniche dettagliate per 
-- compliance normative e geolocalizzazione per ottimizzazione interventi.
--
-- USED IN PAGES:
-- - /company/products - CRUD catalogo con modal form e vista cards/table
-- - /company/dashboard - Statistiche prodotti installati e distribuzione
-- - /employee/scanner - Scansione QR codes per identificazione sul campo
-- - /public/product/[qr] - Landing page pubblica verifica prodotto
-- - /public/products - Catalogo pubblico con branding aziendale
-- - /company/map - Visualizzazione geografica prodotti installati
-- - /company/maintenance - Storico interventi per singolo prodotto
--
-- BUSINESS LOGIC:
-- QR code univoco per tracking. GPS coordinates per route optimization.
-- Address per user-friendly location. Signal_type + shape + materials per 
-- compliance verifiche. Created_by per audit trail. Company_id per multi-tenant.
-- Figure_url per documentazione visiva. WL_code per normative italiane.
-- =====================================================

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qr_code VARCHAR(50) NOT NULL UNIQUE,
    signal_type signal_type_enum NOT NULL,
    year INTEGER NOT NULL CHECK (year >= 2000 AND year <= EXTRACT(YEAR FROM CURRENT_DATE) + 5),
    shape product_shape_enum NOT NULL,
    dimensions VARCHAR(50) NOT NULL,
    support_material VARCHAR(100) NOT NULL,
    support_thickness DECIMAL(4,2) NOT NULL,
    attachment_type attachment_type_enum NOT NULL,
    fixation VARCHAR(255) NOT NULL,
    film_material VARCHAR(100) NOT NULL,
    wl_code VARCHAR(50),
    figure_url TEXT,
    gps_lat DECIMAL(10,7) NOT NULL,
    gps_lng DECIMAL(10,7) NOT NULL,
    address TEXT NOT NULL,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Products indexes
CREATE UNIQUE INDEX idx_products_qr_code ON products(qr_code);
CREATE INDEX idx_products_company_id ON products(company_id);
CREATE INDEX idx_products_gps ON products(gps_lat, gps_lng);
CREATE INDEX idx_products_address ON products USING GIN(to_tsvector('english', address));
CREATE INDEX idx_products_signal_type ON products(signal_type);

-- =====================================================
-- TABLE: maintenances
-- Storico completo interventi per compliance e tracciabilità
-- 
-- DESCRIPTION: 
-- Core compliance entity. Tracking obbligatorio per legge di tutti gli interventi
-- su segnaletica stradale. Documentazione fotografica, certificazioni,
-- geolocalizzazione per audit e ottimizzazione route future.
--
-- USED IN PAGES:
-- - /company/maintenance - Lista completa interventi con filtri avanzati
-- - /employee/maintenance - Form inserimento nuovo intervento mobile-first
-- - /employee/dashboard - Cronologia interventi operatore
-- - /company/dashboard - Statistiche interventi e performance team
-- - /public/product/[qr] - Storico pubblico manutenzioni per trasparenza
-- - /company/analytics - Analytics per tipologia intervento e trend
--
-- BUSINESS LOGIC:
-- Immutable record per compliance legale. Photo_urls array per documentazione
-- prima/dopo. GPS verification del punto intervento. Certificate_number per
-- conformità normative. Employee_id per performance tracking e responsabilità.
-- Intervention_type per classificazione e reporting. Year per raggruppamenti.
-- =====================================================

CREATE TABLE maintenances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    intervention_type intervention_type_enum NOT NULL,
    year INTEGER NOT NULL CHECK (year >= 2000),
    reason TEXT NOT NULL,
    certificate_number VARCHAR(100) NOT NULL,
    gps_lat DECIMAL(10,7) NOT NULL,
    gps_lng DECIMAL(10,7) NOT NULL,
    address TEXT NOT NULL,
    installation_type installation_type_enum,
    notes TEXT,
    photo_urls TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Maintenances indexes
CREATE INDEX idx_maintenances_product_id ON maintenances(product_id);
CREATE INDEX idx_maintenances_employee_id ON maintenances(employee_id);
CREATE INDEX idx_maintenances_company_id ON maintenances(company_id);
CREATE INDEX idx_maintenances_intervention_type ON maintenances(intervention_type);
CREATE INDEX idx_maintenances_created_at ON maintenances(created_at);
CREATE INDEX idx_maintenances_certificate_number ON maintenances(certificate_number);

-- =====================================================
-- TABLE: scheduled_maintenances
-- Pianificazione manutenzioni future con calendario mobile
-- 
-- DESCRIPTION: 
-- Sistema calendario per pianificazione ottimale manutenzioni. Timeline 30min 
-- slots 8:00-18:00, workload balancing, skill matching automatico. Dati 
-- denormalizzati (employee_name, product_name) per performance calendario.
--
-- USED IN PAGES:
-- - /company/maintenance - Vista calendario interattiva con navigazione temporale
-- - /company/calendar - MaintenanceCalendar con vista giornaliera/settimanale
-- - /employee/schedule - Calendario personale operatore mobile-first
-- - /employee/dashboard - Prossimi interventi in programma
-- - /company/dashboard - Overview workload team e distribuzione lavoro
--
-- BUSINESS LOGIC:
-- Timeline-based scheduling con slot 30min. Status workflow per tracking.
-- Priority per smart scheduling. GPS coordinates per route optimization.
-- Dati denormalizzati (employee_name, product_name) per performance UI.
-- Duration in minuti per calcolo automatico end_time e workload percentages.
-- =====================================================

CREATE TABLE scheduled_maintenances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_location VARCHAR(255),
    employee_name VARCHAR(255) NOT NULL,
    maintenance_type intervention_type_enum NOT NULL,
    scheduled_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration INTEGER NOT NULL,
    status scheduled_status_enum NOT NULL DEFAULT 'scheduled',
    priority priority_enum NOT NULL DEFAULT 'medium',
    gps_lat DECIMAL(10,7) NOT NULL,
    gps_lng DECIMAL(10,7) NOT NULL,
    address TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Scheduled maintenances indexes
CREATE INDEX idx_scheduled_maintenances_employee_id ON scheduled_maintenances(employee_id);
CREATE INDEX idx_scheduled_maintenances_scheduled_date ON scheduled_maintenances(scheduled_date);
CREATE INDEX idx_scheduled_maintenances_status ON scheduled_maintenances(status);
CREATE INDEX idx_scheduled_maintenances_priority ON scheduled_maintenances(priority);
CREATE INDEX idx_scheduled_date_employee ON scheduled_maintenances(scheduled_date, employee_id);

-- =====================================================
-- TABLE: worksites
-- Gestione cantieri temporanei con tracking geografico
-- 
-- DESCRIPTION: 
-- Gestione progetti/cantieri temporanei per installazione segnaletica temporanea.
-- Tracking aree geografiche, coordinamento team, planning automatico segnali.
--
-- USED IN PAGES:
-- - /company/worksites - CRUD gestione cantieri attivi
-- - /company/analytics - Performance e statistiche cantieri
-- - /company/dashboard - Overview cantieri in corso
-- - /employee/worksites - Cantieri assegnati operatore (future)
--
-- BUSINESS LOGIC:
-- Area geografica definita da GPS start/end. Status workflow per tracking.
-- Project_manager per coordinamento. Duration per planning risorse.
-- =====================================================

CREATE TABLE worksites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    gps_start_lat DECIMAL(10,7) NOT NULL,
    gps_start_lng DECIMAL(10,7) NOT NULL,
    gps_end_lat DECIMAL(10,7) NOT NULL,
    gps_end_lng DECIMAL(10,7) NOT NULL,
    start_address TEXT NOT NULL,
    end_address TEXT,
    status worksite_status_enum NOT NULL DEFAULT 'planning',
    project_manager VARCHAR(255),
    estimated_duration INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Worksites indexes
CREATE INDEX idx_worksites_company_id ON worksites(company_id);
CREATE INDEX idx_worksites_status ON worksites(status);
CREATE INDEX idx_worksites_start_date ON worksites(start_date);
CREATE INDEX idx_worksites_gps_start ON worksites(gps_start_lat, gps_start_lng);
CREATE INDEX idx_worksites_name ON worksites USING GIN(to_tsvector('english', name));

-- =====================================================
-- TABLE: blockchain_records
-- Certificazione blockchain per autenticità immutabile
-- 
-- DESCRIPTION: 
-- Certificazione blockchain per anti-contraffazione e compliance enterprise.
-- Tracking transazioni, explorer links, gas costs per audit trail governativo.
--
-- USED IN PAGES:
-- - /public/product/[qr] - Verifica blockchain pubblica con explorer link
-- - /company/products - Status certificazione e pending transactions
-- - /company/blockchain - Dashboard certificazioni (future)
-- - /company/analytics - Statistiche certificazioni per compliance
--
-- BUSINESS LOGIC:
-- Transaction_hash univoco per verifica immutabilità. Blockchain enum per
-- multi-chain support. Status per monitoring pending/confirmed. Explorer_url
-- per verifica pubblica trasparente. Token_id per NFT certificates.
-- =====================================================

CREATE TABLE blockchain_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    qr_code VARCHAR(50) NOT NULL,
    transaction_hash VARCHAR(255) NOT NULL UNIQUE,
    blockchain blockchain_enum NOT NULL DEFAULT 'ethereum',
    contract_address VARCHAR(255) NOT NULL,
    token_id VARCHAR(100),
    block_number BIGINT NOT NULL,
    status blockchain_status_enum NOT NULL DEFAULT 'pending',
    gas_used INTEGER,
    explorer_url TEXT,
    blockchain_timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Blockchain records indexes
CREATE UNIQUE INDEX idx_blockchain_records_transaction_hash ON blockchain_records(transaction_hash);
CREATE INDEX idx_blockchain_records_product_id ON blockchain_records(product_id);
CREATE INDEX idx_blockchain_records_qr_code ON blockchain_records(qr_code);
CREATE INDEX idx_blockchain_records_blockchain ON blockchain_records(blockchain);
CREATE INDEX idx_blockchain_records_status ON blockchain_records(status);

-- =====================================================
-- TABLE: installation_data
-- Dati dettagliati installazione con certificazioni e warranty
-- 
-- DESCRIPTION: 
-- Dati certificazioni conformità, warranty tracking automatico, compliance
-- audit trail, scadenze manutenzioni programmate basate su installazione.
--
-- USED IN PAGES:
-- - /public/product/[qr] - Certificato pubblico con dati installazione
-- - /company/maintenance - Info installazione per planning manutenzioni
-- - /company/products - Dettagli tecnici e scadenze warranty
-- - /company/compliance - Audit trail certificazioni (future)
--
-- BUSINESS LOGIC:
-- Relazione 1:1 con products. Certification_number univoco per conformità.
-- Warranty_expiry_date per alert automatici. Compliance_standards array
-- per audit. Next_maintenance_due per planning automatico.
-- =====================================================

CREATE TABLE installation_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
    qr_code VARCHAR(50) NOT NULL,
    installation_date TIMESTAMPTZ NOT NULL,
    installer_company VARCHAR(255) NOT NULL,
    installer_technician VARCHAR(255) NOT NULL,
    installation_location TEXT NOT NULL,
    certification_number VARCHAR(100) NOT NULL UNIQUE,
    compliance_standards TEXT[],
    warranty_period VARCHAR(50),
    warranty_expiry_date DATE,
    next_maintenance_due DATE,
    maintenance_frequency maintenance_frequency_enum,
    installation_photos TEXT[],
    compliance_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Installation data indexes
CREATE UNIQUE INDEX idx_installation_data_product_id ON installation_data(product_id);
CREATE INDEX idx_installation_data_qr_code ON installation_data(qr_code);
CREATE UNIQUE INDEX idx_installation_data_certification_number ON installation_data(certification_number);
CREATE INDEX idx_installation_data_next_maintenance_due ON installation_data(next_maintenance_due);
CREATE INDEX idx_installation_data_warranty_expiry ON installation_data(warranty_expiry_date);
CREATE INDEX idx_installation_data_compliance_standards ON installation_data USING GIN(compliance_standards);

-- =====================================================
-- TABLE: pending_actions
-- Sistema task management per workflow automation
-- 
-- DESCRIPTION: 
-- Task management automatico, escalation scadenze, workflow compliance,
-- prioritizzazione interventi basata su urgenza e rischio, trigger manutenzioni.
--
-- USED IN PAGES:
-- - /company/dashboard - Azioni pending overview con prioritizzazione
-- - /employee/tasks - Task assegnati operatore con deadline (future)
-- - /company/compliance - Azioni overdue per audit
-- - /company/maintenance - Pipeline manutenzioni automatiche
-- - /employee/schedule - Integrazione con calendario operatore
--
-- BUSINESS LOGIC:
-- Action_type enum per classificazione task. Priority per scheduling algorithm.
-- Status workflow per tracking. Risk_level per escalation. Due_date per alerts.
-- Created_by per distinguere system/user/automation. Assigned_employee_id
-- per task specifici. Escalation_date per workflow automatico.
-- =====================================================

CREATE TABLE pending_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    qr_code VARCHAR(50) NOT NULL,
    assigned_company VARCHAR(255) NOT NULL,
    assigned_employee_id UUID REFERENCES employees(id),
    action_type action_type_enum NOT NULL,
    description TEXT NOT NULL,
    due_date DATE NOT NULL,
    priority priority_enum NOT NULL DEFAULT 'medium',
    estimated_duration VARCHAR(50),
    status action_status_enum NOT NULL DEFAULT 'pending',
    risk_level risk_level_enum,
    created_by action_created_by_enum NOT NULL DEFAULT 'system',
    escalation_date DATE,
    completion_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Pending actions indexes
CREATE INDEX idx_pending_actions_product_id ON pending_actions(product_id);
CREATE INDEX idx_pending_actions_qr_code ON pending_actions(qr_code);
CREATE INDEX idx_pending_actions_assigned_employee_id ON pending_actions(assigned_employee_id);
CREATE INDEX idx_pending_actions_action_type ON pending_actions(action_type);
CREATE INDEX idx_pending_actions_status ON pending_actions(status);
CREATE INDEX idx_pending_actions_due_date ON pending_actions(due_date);
CREATE INDEX idx_pending_actions_priority ON pending_actions(priority);
CREATE INDEX idx_pending_actions_overdue ON pending_actions(due_date, status);

-- =====================================================
-- PERFORMANCE OPTIMIZATION INDEXES
-- =====================================================

-- Geospatial queries (nearby products)
CREATE INDEX idx_products_gps_spatial ON products USING GIST (
    point(gps_lng, gps_lat)
);

-- Maintenance history queries
CREATE INDEX idx_maintenance_product_created ON maintenances(product_id, created_at DESC);

-- Calendar queries optimization
CREATE INDEX idx_scheduled_date_employee_status ON scheduled_maintenances(scheduled_date, employee_id, status);

-- Company dashboards
CREATE INDEX idx_products_company_created ON products(company_id, created_at DESC);

-- Full-text search optimization
CREATE INDEX idx_products_search ON products USING GIN(
    to_tsvector('english', address || ' ' || COALESCE(wl_code, ''))
);

-- =====================================================
-- DATABASE TRIGGERS & FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_maintenances_updated_at BEFORE UPDATE ON scheduled_maintenances 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_worksites_updated_at BEFORE UPDATE ON worksites 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blockchain_records_updated_at BEFORE UPDATE ON blockchain_records 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_installation_data_updated_at BEFORE UPDATE ON installation_data 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pending_actions_updated_at BEFORE UPDATE ON pending_actions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA INSERTION (Optional)
-- =====================================================

-- Insert sample company
-- INSERT INTO companies (name, email) VALUES ('Segnaletica Stradale SRL', 'info@segnaletica.it');

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

-- Database table comments for documentation
COMMENT ON TABLE companies IS 'Multi-tenant companies - Core entity for traffic signal installation businesses';
COMMENT ON TABLE users IS 'Authentication system - Login credentials and role-based access control';  
COMMENT ON TABLE employees IS 'Employee business data - Skills, vehicles, GPS tracking for field operations';
COMMENT ON TABLE products IS 'Traffic signal catalog - Complete technical specs with QR code tracking';
COMMENT ON TABLE maintenances IS 'Maintenance history - Immutable compliance records with photo documentation';
COMMENT ON TABLE scheduled_maintenances IS 'Calendar scheduling - Future maintenance planning with mobile optimization';
COMMENT ON TABLE worksites IS 'Temporary worksites - Construction project management with geographic tracking';
COMMENT ON TABLE blockchain_records IS 'Blockchain certificates - Immutable authenticity verification';
COMMENT ON TABLE installation_data IS 'Installation details - Certifications, warranties, and compliance tracking';
COMMENT ON TABLE pending_actions IS 'Task management - Automated workflow with priority and escalation';

-- =====================================================
-- END OF SCHEMA
-- =====================================================