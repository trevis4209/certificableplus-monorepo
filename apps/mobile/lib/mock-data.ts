import { Company, Maintenance, Product, User, BlockchainCertificate, ProductHistory } from "@certplus/types";

/**
 * ⚠️ DEPRECATION WARNING ⚠️
 *
 * This file contains MOCK DATA for development and testing purposes only.
 *
 * **DO NOT USE IN PRODUCTION!**
 *
 * Real data should now be fetched from the backend API using:
 * - `useProducts()` hook from '@/hooks/useProducts'
 * - `useMaintenances()` hook from '@/hooks/useMaintenance'
 * - `dataService` from '@/lib/data-service'
 *
 * Backend API: https://api-dev.geosign.toknox.com
 *
 * This file is kept for:
 * 1. Local development when backend is unavailable
 * 2. Testing and prototyping new features
 * 3. Fallback mechanism during API failures
 *
 * To switch to real data:
 * 1. Ensure EXPO_PUBLIC_API_URL is set in .env
 * 2. Ensure EXPO_PUBLIC_API_KEY is configured
 * 3. Replace mock data imports with real data hooks
 *
 * Updated pages using real data:
 * ✅ app/(tabs)/index.tsx - Dashboard
 * ✅ app/(tabs)/maintenance.tsx - Maintenance list
 * ✅ app/(tabs)/map.tsx - Map view
 *
 * Pages still using mock data:
 * ⚠️ app/pages/product/[id].tsx - Product details
 * ⚠️ components/modals/ProductHistoryModal.tsx
 * ⚠️ components/modals/MaintenanceOptionsModal.tsx
 * ⚠️ hooks/scanner/useScannerOperations.ts
 *
 * Last updated: 2025-10-01
 */

// Mock Companies - Espanso con più aziende
export const mockCompanies: Company[] = [
  {
    id: "company-1",
    name: "Segnaletica Stradale SRL",
    email: "info@segnaletica.it",
    logo_url: "https://via.placeholder.com/200x80?text=SEGNALETICA+SRL",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "company-2", 
    name: "Milano Traffic Solutions SpA",
    email: "contact@milanosafety.com",
    logo_url: "https://via.placeholder.com/200x80?text=MILANO+TRAFFIC",
    createdAt: "2023-06-15T09:30:00Z",
    updatedAt: "2024-02-10T16:45:00Z",
  },
  {
    id: "company-3",
    name: "Sicurezza Urbana Torino",
    email: "admin@sicurezzatorino.it", 
    logo_url: "https://via.placeholder.com/200x80?text=SICUREZZA+TO",
    createdAt: "2023-11-22T14:20:00Z",
    updatedAt: "2024-01-30T11:15:00Z",
  },
  {
    id: "company-4",
    name: "Romana Segnali & Cartellonistica",
    email: "info@romanasegnali.it",
    logo_url: "https://via.placeholder.com/200x80?text=ROMANA+SEGNALI", 
    createdAt: "2022-03-10T08:00:00Z",
    updatedAt: "2024-02-05T13:30:00Z",
  },
  {
    id: "company-5",
    name: "Venezia Maritime Safety",
    email: "maritime@veneziasafety.com",
    logo_url: "https://via.placeholder.com/200x80?text=VENEZIA+MARITIME",
    createdAt: "2023-09-08T12:45:00Z", 
    updatedAt: "2024-01-20T09:20:00Z",
  }
];

// Mock Users - Significativamente espanso con diversi ruoli e aziende
export const mockUsers: User[] = [
  // Company Users (Managers/Bosses)
  {
    id: "user-1",
    email: "mario.rossi@segnaletica.it",
    name: "Mario Rossi",
    role: "company",
    companyId: "company-1",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "user-2",
    email: "giulia.ferrari@milanosafety.com", 
    name: "Giulia Ferrari",
    role: "company",
    companyId: "company-2",
    isActive: true,
    createdAt: "2023-06-15T09:45:00Z",
    updatedAt: "2024-02-01T14:20:00Z",
  },
  {
    id: "user-3",
    email: "antonio.bianchi@sicurezzatorino.it",
    name: "Antonio Bianchi", 
    role: "company",
    companyId: "company-3",
    isActive: true,
    createdAt: "2023-11-22T15:00:00Z",
    updatedAt: "2024-01-25T10:30:00Z",
  },
  {
    id: "user-4",
    email: "francesca.romano@romanasegnali.it",
    name: "Francesca Romano",
    role: "company", 
    companyId: "company-4",
    isActive: true,
    createdAt: "2022-03-10T09:15:00Z",
    updatedAt: "2024-01-18T16:45:00Z",
  },
  {
    id: "user-5",
    email: "marco.veneziani@veneziasafety.com",
    name: "Marco Veneziani",
    role: "company",
    companyId: "company-5", 
    isActive: true,
    createdAt: "2023-09-08T13:20:00Z",
    updatedAt: "2024-01-15T11:10:00Z",
  },

  // Employee Users (Operatori sul campo)
  {
    id: "user-6",
    email: "giuseppe.verdi@segnaletica.it",
    name: "Giuseppe Verdi",
    role: "employee",
    companyId: "company-1",
    isActive: true,
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
  },
  {
    id: "user-7", 
    email: "laura.conti@segnaletica.it",
    name: "Laura Conti",
    role: "employee",
    companyId: "company-1",
    isActive: true,
    createdAt: "2024-01-05T10:30:00Z",
    updatedAt: "2024-02-08T14:20:00Z",
  },
  {
    id: "user-8",
    email: "alessandro.milani@milanosafety.com",
    name: "Alessandro Milani", 
    role: "employee",
    companyId: "company-2",
    isActive: true,
    createdAt: "2023-07-20T09:15:00Z",
    updatedAt: "2024-02-03T11:45:00Z",
  },
  {
    id: "user-9",
    email: "stefania.lombardi@milanosafety.com",
    name: "Stefania Lombardi",
    role: "employee",
    companyId: "company-2", 
    isActive: true,
    createdAt: "2023-08-12T14:30:00Z",
    updatedAt: "2024-01-28T16:00:00Z",
  },
  {
    id: "user-10",
    email: "roberto.torinese@sicurezzatorino.it",
    name: "Roberto Torinese",
    role: "employee",
    companyId: "company-3",
    isActive: true,
    createdAt: "2023-12-01T08:45:00Z",
    updatedAt: "2024-02-05T13:15:00Z",
  },
  {
    id: "user-11",
    email: "michela.piemonte@sicurezzatorino.it", 
    name: "Michela Piemonte",
    role: "employee",
    companyId: "company-3",
    isActive: true,
    createdAt: "2023-12-15T11:20:00Z",
    updatedAt: "2024-01-30T09:40:00Z",
  },
  {
    id: "user-12",
    email: "davide.capitolino@romanasegnali.it",
    name: "Davide Capitolino",
    role: "employee",
    companyId: "company-4",
    isActive: true,
    createdAt: "2022-05-18T10:00:00Z",
    updatedAt: "2024-02-01T15:30:00Z",
  },
  {
    id: "user-13",
    email: "silvia.latina@romanasegnali.it",
    name: "Silvia Latina", 
    role: "employee",
    companyId: "company-4",
    isActive: true,
    createdAt: "2022-06-25T13:45:00Z",
    updatedAt: "2024-01-22T12:10:00Z",
  },
  {
    id: "user-14",
    email: "andrea.doge@veneziasafety.com",
    name: "Andrea Doge",
    role: "employee",
    companyId: "company-5",
    isActive: true,
    createdAt: "2023-10-12T09:30:00Z",
    updatedAt: "2024-01-18T14:50:00Z",
  },
  {
    id: "user-15",
    email: "valentina.laguna@veneziasafety.com",
    name: "Valentina Laguna",
    role: "employee", 
    companyId: "company-5",
    isActive: true,
    createdAt: "2023-11-05T16:15:00Z",
    updatedAt: "2024-02-02T10:25:00Z",
  },

  // Viewer Users (Solo lettura)
  {
    id: "user-16",
    email: "anna.bianchi@example.com",
    name: "Anna Bianchi",
    role: "viewer",
    isActive: false,
    createdAt: "2024-01-03T00:00:00Z",
    updatedAt: "2024-01-03T00:00:00Z",
  },
  {
    id: "user-17",
    email: "luca.observer@demo.com",
    name: "Luca Observer",
    role: "viewer",
    isActive: true,
    createdAt: "2024-01-10T12:30:00Z",
    updatedAt: "2024-01-25T09:15:00Z",
  },
  {
    id: "user-18",
    email: "maria.controller@audit.gov",
    name: "Maria Controller",
    role: "viewer", 
    isActive: true,
    createdAt: "2023-12-20T14:00:00Z",
    updatedAt: "2024-02-08T11:20:00Z",
  }
];

// Mock Products - Massivamente espanso con categorie diverse e localizzazioni
export const mockProducts: Product[] = [
  // Segnali di Pericolo (Triangolari)
  {
    id: "product-1",
    tipo_segnale: "Segnale di pericolo",
    anno: 2024,
    forma: "Triangolare",
    materiale_supporto: "Alluminio",
    spessore_supporto: 2,
    wl: "WL001",
    fissaggio: "Tasselli",
    dimensioni: "60x60cm",
    materiale_pellicola: "Classe II",
    figura_url: "https://via.placeholder.com/300x300?text=⚠️+CURVA+PERICOLOSA",
    qr_code: "QR001",
    gps_lat: 45.4642,
    gps_lng: 9.1900,
    companyId: "company-1",
    createdBy: "user-6",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "product-2", 
    tipo_segnale: "Segnale di pericolo",
    anno: 2024,
    forma: "Triangolare", 
    materiale_supporto: "Alluminio",
    spessore_supporto: 2.5,
    wl: "WL002",
    fissaggio: "Palo metallico",
    dimensioni: "90x90cm",
    materiale_pellicola: "Classe III",
    figura_url: "https://via.placeholder.com/300x300?text=⚠️+INCROCIO+PERICOLOSO",
    qr_code: "QR002",
    gps_lat: 45.4700,
    gps_lng: 9.1950,
    companyId: "company-1", 
    createdBy: "user-7",
    createdAt: "2024-01-16T14:20:00Z",
    updatedAt: "2024-01-16T14:20:00Z",
  },
  {
    id: "product-3",
    tipo_segnale: "Segnale di pericolo",
    anno: 2024,
    forma: "Triangolare",
    materiale_supporto: "Alluminio", 
    spessore_supporto: 2,
    wl: "WL003",
    fissaggio: "Staffa a muro",
    dimensioni: "60x60cm",
    materiale_pellicola: "Classe II",
    figura_url: "https://via.placeholder.com/300x300?text=⚠️+LAVORI+IN+CORSO",
    qr_code: "QR003",
    gps_lat: 45.4580,
    gps_lng: 9.1820,
    companyId: "company-2",
    createdBy: "user-8",
    createdAt: "2024-01-18T09:45:00Z",
    updatedAt: "2024-01-18T09:45:00Z",
  },

  // Segnali di Obbligo (Circolari Blu)
  {
    id: "product-4",
    tipo_segnale: "Segnale di obbligo",
    anno: 2024,
    forma: "Circolare",
    materiale_supporto: "Alluminio",
    spessore_supporto: 1.5,
    wl: "WL004",
    fissaggio: "Palo metallico", 
    dimensioni: "80x80cm",
    materiale_pellicola: "Classe I",
    figura_url: "https://via.placeholder.com/300x300?text=➡️+DIREZIONE+OBBLIGATORIA",
    qr_code: "QR004",
    gps_lat: 45.4600,
    gps_lng: 9.1800,
    companyId: "company-2",
    createdBy: "user-9",
    createdAt: "2024-01-20T11:15:00Z",
    updatedAt: "2024-01-20T11:15:00Z",
  },
  {
    id: "product-5",
    tipo_segnale: "Segnale di obbligo",
    anno: 2023,
    forma: "Circolare",
    materiale_supporto: "Alluminio",
    spessore_supporto: 2,
    wl: "WL005",
    fissaggio: "Base mobile",
    dimensioni: "100x100cm",
    materiale_pellicola: "Classe II",
    figura_url: "https://via.placeholder.com/300x300?text=🚲+PISTA+CICLABILE", 
    qr_code: "QR005",
    gps_lat: 45.0704,
    gps_lng: 7.6868,
    companyId: "company-3",
    createdBy: "user-10",
    createdAt: "2023-12-10T15:30:00Z",
    updatedAt: "2024-01-05T09:20:00Z",
  },
  {
    id: "product-6",
    tipo_segnale: "Segnale di obbligo", 
    anno: 2024,
    forma: "Circolare",
    materiale_supporto: "PVC Rigido",
    spessore_supporto: 3,
    wl: "WL006", 
    fissaggio: "Adesivo permanente",
    dimensioni: "40x40cm",
    materiale_pellicola: "Classe I",
    figura_url: "https://via.placeholder.com/300x300?text=🦺+CASCO+OBBLIGATORIO",
    qr_code: "QR006",
    gps_lat: 45.0678,
    gps_lng: 7.6820,
    companyId: "company-3",
    createdBy: "user-11", 
    createdAt: "2024-01-22T13:10:00Z",
    updatedAt: "2024-01-22T13:10:00Z",
  },

  // Segnali di Divieto (Circolari Rossi)
  {
    id: "product-7",
    tipo_segnale: "Segnale di divieto",
    anno: 2023,
    forma: "Circolare",
    materiale_supporto: "PVC",
    spessore_supporto: 3,
    wl: "WL007",
    fissaggio: "Adesivo",
    dimensioni: "40x40cm", 
    materiale_pellicola: "Classe III",
    figura_url: "https://via.placeholder.com/300x300?text=🚫+DIVIETO+ACCESSO",
    qr_code: "QR007",
    gps_lat: 41.9028,
    gps_lng: 12.4964,
    companyId: "company-4",
    createdBy: "user-12",
    createdAt: "2023-10-15T10:45:00Z",
    updatedAt: "2024-01-12T16:30:00Z",
  },
  {
    id: "product-8",
    tipo_segnale: "Segnale di divieto",
    anno: 2024,
    forma: "Circolare", 
    materiale_supporto: "Alluminio",
    spessore_supporto: 2,
    wl: "WL008",
    fissaggio: "Palo metallico",
    dimensioni: "80x80cm",
    materiale_pellicola: "Classe II",
    figura_url: "https://via.placeholder.com/300x300?text=🚫+DIVIETO+SOSTA",
    qr_code: "QR008",
    gps_lat: 41.8967,
    gps_lng: 12.4822,
    companyId: "company-4",
    createdBy: "user-13",
    createdAt: "2024-01-25T08:20:00Z",
    updatedAt: "2024-01-25T08:20:00Z",
  },
  {
    id: "product-9",
    tipo_segnale: "Segnale di divieto", 
    anno: 2024,
    forma: "Circolare",
    materiale_supporto: "Alluminio",
    spessore_supporto: 1.5,
    wl: "WL009",
    fissaggio: "Staffa orientabile", 
    dimensioni: "60x60cm",
    materiale_pellicola: "Classe I",
    figura_url: "https://via.placeholder.com/300x300?text=🚫+LIMITE+VELOCITÀ+30",
    qr_code: "QR009",
    gps_lat: 41.8845,
    gps_lng: 12.5105,
    companyId: "company-4",
    createdBy: "user-12",
    createdAt: "2024-02-01T12:00:00Z",
    updatedAt: "2024-02-01T12:00:00Z",
  },

  // Segnali di Indicazione (Rettangolari/Quadrati)
  {
    id: "product-10", 
    tipo_segnale: "Segnale di indicazione",
    anno: 2024,
    forma: "Rettangolare",
    materiale_supporto: "Alluminio",
    spessore_supporto: 2,
    wl: "WL010",
    fissaggio: "Struttura a portale",
    dimensioni: "200x100cm",
    materiale_pellicola: "Classe II", 
    figura_url: "https://via.placeholder.com/300x300?text=→+VENEZIA+15KM",
    qr_code: "QR010",
    gps_lat: 45.4408,
    gps_lng: 12.3155,
    companyId: "company-5",
    createdBy: "user-14",
    createdAt: "2024-01-28T14:45:00Z",
    updatedAt: "2024-01-28T14:45:00Z",
  },
  {
    id: "product-11",
    tipo_segnale: "Segnale di indicazione",
    anno: 2023,
    forma: "Rettangolare",
    materiale_supporto: "Alluminio Marino",
    spessore_supporto: 3,
    wl: "WL011",
    fissaggio: "Palo nautico",
    dimensioni: "120x60cm",
    materiale_pellicola: "Classe III Marina",
    figura_url: "https://via.placeholder.com/300x300?text=⚓+PORTO+TURISTICO",
    qr_code: "QR011",
    gps_lat: 45.4238,
    gps_lng: 12.3012,
    companyId: "company-5", 
    createdBy: "user-15",
    createdAt: "2023-11-20T16:30:00Z",
    updatedAt: "2024-01-10T11:25:00Z",
  },

  // Pannelli Integrativi
  {
    id: "product-12",
    tipo_segnale: "Pannello integrativo",
    anno: 2024,
    forma: "Rettangolare",
    materiale_supporto: "PVC Espanso",
    spessore_supporto: 5,
    wl: "WL012",
    fissaggio: "Staffa sotto segnale", 
    dimensioni: "60x20cm",
    materiale_pellicola: "Stampato digitale",
    figura_url: "https://via.placeholder.com/300x300?text=ECCETTO+RESIDENTI",
    qr_code: "QR012",
    gps_lat: 45.4642,
    gps_lng: 9.1905,
    companyId: "company-1",
    createdBy: "user-6",
    createdAt: "2024-02-05T09:15:00Z",
    updatedAt: "2024-02-05T09:15:00Z",
  },
  {
    id: "product-13", 
    tipo_segnale: "Pannello integrativo",
    anno: 2024,
    forma: "Rettangolare",
    materiale_supporto: "Alluminio",
    spessore_supporto: 1.5,
    wl: "WL013",
    fissaggio: "Integrato principale",
    dimensioni: "80x25cm",
    materiale_pellicola: "Classe II",
    figura_url: "https://via.placeholder.com/300x300?text=ORE+8:00-18:00",
    qr_code: "QR013",
    gps_lat: 45.4685,
    gps_lng: 9.1923,
    companyId: "company-2", 
    createdBy: "user-8",
    createdAt: "2024-02-03T11:40:00Z",
    updatedAt: "2024-02-03T11:40:00Z",
  },

  // Segnali Temporanei (Cantieri)
  {
    id: "product-14",
    tipo_segnale: "Segnale temporaneo",
    anno: 2024,
    forma: "Triangolare",
    materiale_supporto: "PVC Giallo",
    spessore_supporto: 4,
    wl: "WL014",
    fissaggio: "Base zavorrabile",
    dimensioni: "70x70cm",
    materiale_pellicola: "Rifrangente Gialla",
    figura_url: "https://via.placeholder.com/300x300?text=⚠️+DEVIAZIONE+TEMPORANEA", 
    qr_code: "QR014",
    gps_lat: 45.0705,
    gps_lng: 7.6900,
    companyId: "company-3",
    createdBy: "user-10",
    createdAt: "2024-02-08T07:30:00Z",
    updatedAt: "2024-02-08T07:30:00Z",
  },
  {
    id: "product-15",
    tipo_segnale: "Segnale temporaneo",
    anno: 2024,
    forma: "Rettangolare",
    materiale_supporto: "PVC Arancione",
    spessore_supporto: 3,
    wl: "WL015", 
    fissaggio: "Cavalletti mobili",
    dimensioni: "100x50cm",
    materiale_pellicola: "Pellicola Arancione",
    figura_url: "https://via.placeholder.com/300x300?text=🚧+STRADA+CHIUSA",
    qr_code: "QR015",
    gps_lat: 41.9100,
    gps_lng: 12.5000,
    companyId: "company-4",
    createdBy: "user-13",
    createdAt: "2024-02-06T13:20:00Z",
    updatedAt: "2024-02-06T13:20:00Z",
  },

  // Cartellonistica Turistica
  {
    id: "product-16",
    tipo_segnale: "Cartellonistica turistica",
    anno: 2023,
    forma: "Rettangolare", 
    materiale_supporto: "Legno Trattato",
    spessore_supporto: 4,
    wl: "WL016",
    fissaggio: "Pali in legno",
    dimensioni: "150x100cm",
    materiale_pellicola: "Stampa UV Protetta",
    figura_url: "https://via.placeholder.com/300x300?text=🏰+CASTELLO+SFORZESCO",
    qr_code: "QR016",
    gps_lat: 45.4701,
    gps_lng: 9.1789,
    companyId: "company-2", 
    createdBy: "user-9",
    createdAt: "2023-09-12T10:00:00Z",
    updatedAt: "2024-01-15T14:30:00Z",
  },
  {
    id: "product-17",
    tipo_segnale: "Cartellonistica turistica",
    anno: 2024,
    forma: "Quadrata",
    materiale_supporto: "Metallo verniciato",
    spessore_supporto: 2,
    wl: "WL017",
    fissaggio: "Struttura totem",
    dimensioni: "80x80cm",
    materiale_pellicola: "Laminato anti-vandalo", 
    figura_url: "https://via.placeholder.com/300x300?text=🎭+TEATRO+LA+FENICE",
    qr_code: "QR017",
    gps_lat: 45.4338,
    gps_lng: 12.3346,
    companyId: "company-5",
    createdBy: "user-14",
    createdAt: "2024-01-30T12:45:00Z",
    updatedAt: "2024-01-30T12:45:00Z",
  },

  // Segnali Speciali/Personalizzati
  {
    id: "product-18",
    tipo_segnale: "Segnale personalizzato",
    anno: 2024,
    forma: "Ottagonale",
    materiale_supporto: "Alluminio",
    spessore_supporto: 2.5,
    wl: "WL018", 
    fissaggio: "Palo dedicato",
    dimensioni: "80x80cm",
    materiale_pellicola: "Classe III",
    figura_url: "https://via.placeholder.com/300x300?text=🛑+STOP+CONTROLLO",
    qr_code: "QR018",
    gps_lat: 45.4612,
    gps_lng: 9.1856,
    companyId: "company-1",
    createdBy: "user-7",
    createdAt: "2024-02-10T08:50:00Z",
    updatedAt: "2024-02-10T08:50:00Z",
  },
  {
    id: "product-19",
    tipo_segnale: "Segnale informativo",
    anno: 2024, 
    forma: "Freccia",
    materiale_supporto: "Composito",
    spessore_supporto: 3,
    wl: "WL019",
    fissaggio: "Sistema modulare",
    dimensioni: "120x40cm",
    materiale_pellicola: "LED integrati",
    figura_url: "https://via.placeholder.com/300x300?text=→+USCITA+EMERGENZA",
    qr_code: "QR019", 
    gps_lat: 45.4590,
    gps_lng: 9.1710,
    companyId: "company-2",
    createdBy: "user-8",
    createdAt: "2024-02-08T15:25:00Z",
    updatedAt: "2024-02-08T15:25:00Z",
  },

  // Prodotti Aggiuntivi per Dense Data
  {
    id: "product-20",
    tipo_segnale: "Segnale di pericolo",
    anno: 2024,
    forma: "Triangolare",
    materiale_supporto: "Alluminio", 
    spessore_supporto: 2,
    wl: "WL020",
    fissaggio: "Tasselli",
    dimensioni: "60x60cm",
    materiale_pellicola: "Classe II",
    figura_url: "https://via.placeholder.com/300x300?text=⚠️+ATTRAVERSAMENTO+ANIMALI",
    qr_code: "QR020",
    gps_lat: 45.0800,
    gps_lng: 7.6950,
    companyId: "company-3",
    createdBy: "user-11",
    createdAt: "2024-02-09T09:30:00Z",
    updatedAt: "2024-02-09T09:30:00Z",
  },
  // Prodotto di test QR999 - Non installato per testare il modal di installazione
  {
    id: "product-test-999",
    tipo_segnale: "Segnale di Pericolo - Test",
    anno: 2024,
    forma: "Triangolare",
    materiale_supporto: "Alluminio",
    spessore_supporto: 2,
    wl: "TEST999",
    fissaggio: "Paletto zincato",
    dimensioni: "60x60x60 cm",
    materiale_pellicola: "3M Diamond Grade",
    figura_url: "https://via.placeholder.com/300x300?text=TEST+SIGN",
    qr_code: "QR999",
    gps_lat: 45.4642,
    gps_lng: 9.1900,
    companyId: "company-1",
    createdBy: "user-1",
    createdAt: "2024-02-20T10:00:00Z",
    updatedAt: "2024-02-20T10:00:00Z",
  }
];

// Employee Permissions per QR Code - Sistema autorizzazioni
interface EmployeePermission {
  qr_code: string;
  employee_id: string;
  allowed_actions: ('revisione' | 'sostituzione' | 'dismissione' | 'installazione')[];
  authorized_by: string;
  valid_until: string;
  notes?: string;
}

export const employeePermissions: EmployeePermission[] = [
  // QR001 - Solo revisione
  {
    qr_code: "QR001",
    employee_id: "user-6", // Mario Rossi (employee corrente)
    allowed_actions: ['revisione'],
    authorized_by: "user-1",
    valid_until: "2025-12-31T23:59:59Z",
    notes: "Autorizzato solo controlli periodici"
  },
  // QR002 - Solo revisione (come specificato)
  {
    qr_code: "QR002", 
    employee_id: "user-6",
    allowed_actions: ['revisione'],
    authorized_by: "user-1",
    valid_until: "2025-12-31T23:59:59Z",
    notes: "Controllo mensile programmato"
  },
  // QR003 - Revisione e Sostituzione
  {
    qr_code: "QR003",
    employee_id: "user-6", 
    allowed_actions: ['revisione', 'sostituzione'],
    authorized_by: "user-1",
    valid_until: "2025-12-31T23:59:59Z",
    notes: "Segnale da monitorare per eventuale sostituzione"
  },
  // QR004 - Tutte le azioni (manager level)
  {
    qr_code: "QR004",
    employee_id: "user-6",
    allowed_actions: ['revisione', 'sostituzione', 'dismissione'],
    authorized_by: "user-1", 
    valid_until: "2025-12-31T23:59:59Z",
    notes: "Autorizzazione completa per area di competenza"
  },
  // QR005 - Solo revisione
  {
    qr_code: "QR005",
    employee_id: "user-6",
    allowed_actions: ['revisione'],
    authorized_by: "user-1",
    valid_until: "2025-12-31T23:59:59Z",
    notes: "Controllo standard autorizzato"
  },
  // QR006 - Revisione e Sostituzione
  {
    qr_code: "QR006",
    employee_id: "user-6",
    allowed_actions: ['revisione', 'sostituzione'],
    authorized_by: "user-1",
    valid_until: "2025-12-31T23:59:59Z",
    notes: "Segnale casco obbligatorio"
  },
  // QR007 - Solo Dismissione
  {
    qr_code: "QR007",
    employee_id: "user-6",
    allowed_actions: ['dismissione'],
    authorized_by: "user-1",
    valid_until: "2025-12-31T23:59:59Z",
    notes: "Segnale da rimuovere"
  },
  // QR008 - Revisione e Sostituzione
  {
    qr_code: "QR008",
    employee_id: "user-6",
    allowed_actions: ['revisione', 'sostituzione'],
    authorized_by: "user-1",
    valid_until: "2025-12-31T23:59:59Z",
    notes: "Divieto sosta - controlli frequenti"
  },
  // QR009 - Tutte le azioni
  {
    qr_code: "QR009",
    employee_id: "user-6",
    allowed_actions: ['revisione', 'sostituzione', 'dismissione'],
    authorized_by: "user-1",
    valid_until: "2025-12-31T23:59:59Z",
    notes: "Limite velocità - autorizzazione completa"
  },
  // QR010 - Solo revisione
  {
    qr_code: "QR010",
    employee_id: "user-6",
    allowed_actions: ['revisione'],
    authorized_by: "user-1",
    valid_until: "2025-12-31T23:59:59Z",
    notes: "Segnale autostradale Venezia"
  },
  // QR011 - Revisione e Sostituzione
  {
    qr_code: "QR011",
    employee_id: "user-6",
    allowed_actions: ['revisione', 'sostituzione'],
    authorized_by: "user-1",
    valid_until: "2025-12-31T23:59:59Z",
    notes: "Porto turistico - ambiente marino"
  },
  // QR012 - Solo revisione
  {
    qr_code: "QR012",
    employee_id: "user-6",
    allowed_actions: ['revisione'],
    authorized_by: "user-1",
    valid_until: "2025-12-31T23:59:59Z",
    notes: "Pannello eccetto residenti"
  },
  // QR013 - Revisione e Sostituzione
  {
    qr_code: "QR013",
    employee_id: "user-6",
    allowed_actions: ['revisione', 'sostituzione'],
    authorized_by: "user-1",
    valid_until: "2025-12-31T23:59:59Z",
    notes: "Orario ZTL - aggiornamenti frequenti"
  },
  // QR014 - Dismissione (temporaneo)
  {
    qr_code: "QR014",
    employee_id: "user-6",
    allowed_actions: ['dismissione'],
    authorized_by: "user-1",
    valid_until: "2025-12-31T23:59:59Z",
    notes: "Segnale temporaneo da rimuovere"
  },
  // QR015 - Dismissione (temporaneo)
  {
    qr_code: "QR015",
    employee_id: "user-6",
    allowed_actions: ['dismissione'],
    authorized_by: "user-1",
    valid_until: "2025-12-31T23:59:59Z",
    notes: "Strada chiusa - rimuovere a fine lavori"
  },
  // QR016 - Solo revisione
  {
    qr_code: "QR016",
    employee_id: "user-6",
    allowed_actions: ['revisione'],
    authorized_by: "user-1",
    valid_until: "2025-12-31T23:59:59Z",
    notes: "Cartello turistico Castello Sforzesco"
  },
  // QR017 - Revisione e Sostituzione
  {
    qr_code: "QR017",
    employee_id: "user-6",
    allowed_actions: ['revisione', 'sostituzione'],
    authorized_by: "user-1",
    valid_until: "2025-12-31T23:59:59Z",
    notes: "Teatro La Fenice - manutenzione regolare"
  },
  // QR018 - Tutte le azioni
  {
    qr_code: "QR018",
    employee_id: "user-6",
    allowed_actions: ['revisione', 'sostituzione', 'dismissione'],
    authorized_by: "user-1",
    valid_until: "2025-12-31T23:59:59Z",
    notes: "STOP controllo - autorizzazione completa"
  },
  // QR019 - Revisione e Sostituzione
  {
    qr_code: "QR019",
    employee_id: "user-6",
    allowed_actions: ['revisione', 'sostituzione'],
    authorized_by: "user-1",
    valid_until: "2025-12-31T23:59:59Z",
    notes: "Uscita emergenza LED"
  },
  // QR020 - Solo revisione
  {
    qr_code: "QR020",
    employee_id: "user-6",
    allowed_actions: ['revisione'],
    authorized_by: "user-1",
    valid_until: "2025-12-31T23:59:59Z",
    notes: "Attraversamento animali"
  },
  // QR999 - Solo installazione (nuovo prodotto)
  {
    qr_code: "QR999",
    employee_id: "user-6",
    allowed_actions: ['installazione'],
    authorized_by: "user-1",
    valid_until: "2025-12-31T23:59:59Z", 
    notes: "Autorizzato per installazione nuovo segnale"
  }
];

// Funzione helper per ottenere le autorizzazioni di un employee per un QR code
export const getEmployeePermissions = (qrCode: string, employeeId: string = "user-6"): string[] => {
  // Restituisce sempre tutte le azioni disponibili per i test
  return ['revisione', 'installazione', 'sostituzione', 'dismissione'];
};

// Mock Maintenance - Storico molto esteso con tutti i tipi di interventi
export const mockMaintenance: Maintenance[] = [
  // Installazioni
  {
    id: "maint-1",
    productId: "product-1",
    tipo_intervento: "installazione",
    note: "Installato regolarmente in via Roma 123. Verificata stabilità e visibilità. Condizioni meteo: sereno.",
    foto_urls: [
      "https://via.placeholder.com/400x300?text=Prima+installazione",
      "https://via.placeholder.com/400x300?text=Durante+posa",
      "https://via.placeholder.com/400x300?text=Installazione+completata"
    ],
    userId: "user-6",
    gps_lat: 45.4642,
    gps_lng: 9.1900,
    createdAt: "2024-01-15T10:45:00Z",
  },
  {
    id: "maint-2",
    productId: "product-2", 
    tipo_intervento: "installazione",
    note: "Installazione segnale obbligo direzione. Utilizzato palo da 3m, fondazione in cls. Area pedonale sicura.",
    foto_urls: [
      "https://via.placeholder.com/400x300?text=Preparazione+fondazione",
      "https://via.placeholder.com/400x300?text=Posa+palo",
      "https://via.placeholder.com/400x300?text=Segnale+montato"
    ],
    userId: "user-7",
    gps_lat: 45.4700,
    gps_lng: 9.1950,
    createdAt: "2024-01-16T14:20:00Z",
  },
  {
    id: "maint-3",
    productId: "product-3",
    tipo_intervento: "installazione",
    note: "Prima installazione segnale cantiere. Area delimitata correttamente, segnale ben visibile da 50m di distanza.",
    foto_urls: ["https://via.placeholder.com/400x300?text=Installazione+cantiere"],
    userId: "user-8",
    gps_lat: 45.4580,
    gps_lng: 9.1820,
    createdAt: "2024-01-18T09:45:00Z",
  },
  {
    id: "maint-4", 
    productId: "product-4",
    tipo_intervento: "installazione",
    note: "Montaggio segnale obbligatorio direzione. Coordinamento con ufficio tecnico comunale. Autorizzazioni OK.",
    foto_urls: [
      "https://via.placeholder.com/400x300?text=Autorizzazione+comunale",
      "https://via.placeholder.com/400x300?text=Posizionamento+segnale"
    ],
    userId: "user-9",
    gps_lat: 45.4600,
    gps_lng: 9.1800,
    createdAt: "2024-01-20T11:15:00Z",
  },
  {
    id: "maint-5",
    productId: "product-5",
    tipo_intervento: "installazione",
    note: "Installazione pista ciclabile. Verifica interferenze con alberi esistenti. Posizionamento ottimale raggiunto.", 
    foto_urls: [
      "https://via.placeholder.com/400x300?text=Area+prima+installazione",
      "https://via.placeholder.com/400x300?text=Posa+segnale+ciclistico"
    ],
    userId: "user-10",
    gps_lat: 45.0704,
    gps_lng: 7.6868,
    createdAt: "2023-12-10T15:30:00Z",
  },

  // Manutenzioni Ordinarie
  {
    id: "maint-6",
    productId: "product-1",
    tipo_intervento: "manutenzione",
    note: "Pulizia e controllo visivo mensile. Segnale in ottime condizioni. Pellicola rifrangente efficiente.",
    foto_urls: [
      "https://via.placeholder.com/400x300?text=Prima+pulizia", 
      "https://via.placeholder.com/400x300?text=Dopo+pulizia"
    ],
    userId: "user-6",
    gps_lat: 45.4642,
    gps_lng: 9.1900,
    createdAt: "2024-02-15T08:30:00Z",
  },
  {
    id: "maint-7",
    productId: "product-2",
    tipo_intervento: "manutenzione",
    note: "Controllo trimestrale stabilità palo. Verificati bulloni di fissaggio. Tutto regolare, nessun allentamento.",
    foto_urls: ["https://via.placeholder.com/400x300?text=Controllo+bulloni"],
    userId: "user-7",
    gps_lat: 45.4700, 
    gps_lng: 9.1950,
    createdAt: "2024-02-20T10:15:00Z",
  },
  {
    id: "maint-8",
    productId: "product-4",
    tipo_intervento: "manutenzione",
    note: "Manutenzione dopo segnalazione cittadino. Rimossa vegetazione che ostruiva parzialmente il segnale.",
    foto_urls: [
      "https://via.placeholder.com/400x300?text=Vegetazione+ostruente",
      "https://via.placeholder.com/400x300?text=Segnale+liberato"
    ],
    userId: "user-9",
    gps_lat: 45.4600,
    gps_lng: 9.1800, 
    createdAt: "2024-02-18T14:45:00Z",
  },
  {
    id: "maint-9",
    productId: "product-6",
    tipo_intervento: "manutenzione",
    note: "Pulizia segnale dopo temporale. Rimosse foglie e detriti. Controllata tenuta adesivo, tutto OK.",
    foto_urls: ["https://via.placeholder.com/400x300?text=Pulizia+post+temporale"],
    userId: "user-11",
    gps_lat: 45.0678,
    gps_lng: 7.6820,
    createdAt: "2024-02-12T16:20:00Z",
  },

  // Verifiche Periodiche
  {
    id: "maint-10",
    productId: "product-1",
    tipo_intervento: "verifica",
    note: "Verifica semestrale stato conservazione. Segnale conforme, colori vividi, rifrangenza efficace al 95%.",
    foto_urls: [
      "https://via.placeholder.com/400x300?text=Test+rifrangenza+diurno",
      "https://via.placeholder.com/400x300?text=Test+rifrangenza+notturno"
    ],
    userId: "user-6",
    gps_lat: 45.4642,
    gps_lng: 9.1900,
    createdAt: "2024-02-01T11:00:00Z",
  },
  {
    id: "maint-11",
    productId: "product-5",
    tipo_intervento: "verifica",
    note: "Controllo annuale post-installazione. Misurata inclinazione (2°), altezza da terra (2.10m). Tutto a norma.", 
    foto_urls: [
      "https://via.placeholder.com/400x300?text=Misurazioni+altezza",
      "https://via.placeholder.com/400x300?text=Controllo+inclinazione"
    ],
    userId: "user-10",
    gps_lat: 45.0704,
    gps_lng: 7.6868,
    createdAt: "2024-01-10T09:30:00Z",
  },
  {
    id: "maint-12",
    productId: "product-7",
    tipo_intervento: "verifica",
    note: "Verifica dopo esposto cittadino per presunta scarsa visibilità. Segnale regolare, visibile da distanza norma.",
    foto_urls: [
      "https://via.placeholder.com/400x300?text=Verifica+visibilità+50m",
      "https://via.placeholder.com/400x300?text=Verifica+visibilità+100m"
    ],
    userId: "user-12",
    gps_lat: 41.9028,
    gps_lng: 12.4964, 
    createdAt: "2024-01-25T13:15:00Z",
  },

  // Sostituzioni
  {
    id: "maint-13",
    productId: "product-3",
    tipo_intervento: "sostituzione",
    note: "Sostituzione completa segnale danneggiato da atti vandalici. Installato nuovo segnale identico con pellicola anti-graffiti.",
    foto_urls: [
      "https://via.placeholder.com/400x300?text=Segnale+danneggiato",
      "https://via.placeholder.com/400x300?text=Rimozione+vecchio",
      "https://via.placeholder.com/400x300?text=Nuovo+segnale+installato"
    ],
    userId: "user-8",
    gps_lat: 45.4580,
    gps_lng: 9.1820,
    createdAt: "2024-02-05T10:20:00Z", 
  },
  {
    id: "maint-14",
    productId: "product-8",
    tipo_intervento: "sostituzione",
    note: "Sostituzione segnale decolorato dal sole dopo 3 anni. Installata nuova pellicola UV resistente.",
    foto_urls: [
      "https://via.placeholder.com/400x300?text=Segnale+decolorito",
      "https://via.placeholder.com/400x300?text=Sostituzione+pellicola"
    ],
    userId: "user-13",
    gps_lat: 41.8967,
    gps_lng: 12.4822,
    createdAt: "2024-01-30T15:45:00Z",
  },
  {
    id: "maint-15", 
    productId: "product-11",
    tipo_intervento: "sostituzione",
    note: "Sostituzione palo corroso da salsedine marina. Utilizzato nuovo palo in acciaio inox. Segnale riposizionato.",
    foto_urls: [
      "https://via.placeholder.com/400x300?text=Palo+corroso",
      "https://via.placeholder.com/400x300?text=Nuovo+palo+inox",
      "https://via.placeholder.com/400x300?text=Riposizionamento+completo"
    ],
    userId: "user-15",
    gps_lat: 45.4238,
    gps_lng: 12.3012,
    createdAt: "2024-01-20T12:30:00Z",
  },

  // Dismissioni
  {
    id: "maint-16",
    productId: "product-14",
    tipo_intervento: "dismissione",
    note: "Rimozione segnale temporaneo a fine lavori. Area ripristinata, smaltiti materiali secondo normativa RAEE.",
    foto_urls: [
      "https://via.placeholder.com/400x300?text=Prima+rimozione",
      "https://via.placeholder.com/400x300?text=Area+ripristinata"
    ],
    userId: "user-10",
    gps_lat: 45.0705,
    gps_lng: 7.6900, 
    createdAt: "2024-02-10T14:00:00Z",
  },
  {
    id: "maint-17",
    productId: "product-15",
    tipo_intervento: "dismissione", 
    note: "Dismissione segnale cantiere terminato. Materiali recuperati per riutilizzo futuro. Area liberata completamente.",
    foto_urls: [
      "https://via.placeholder.com/400x300?text=Rimozione+segnale+cantiere",
      "https://via.placeholder.com/400x300?text=Materiali+recuperati"
    ],
    userId: "user-13",
    gps_lat: 41.9100,
    gps_lng: 12.5000,
    createdAt: "2024-02-08T11:45:00Z",
  },

  // Altri interventi manutenzioni varie
  {
    id: "maint-18",
    productId: "product-10",
    tipo_intervento: "manutenzione",
    note: "Pulizia cartello direzionale autostradale. Utilizzati detergenti specifici per grande formato. Rifrangenza ripristinata.",
    foto_urls: ["https://via.placeholder.com/400x300?text=Pulizia+cartello+autostradale"],
    userId: "user-14",
    gps_lat: 45.4408,
    gps_lng: 12.3155,
    createdAt: "2024-02-07T08:15:00Z",
  },
  {
    id: "maint-19",
    productId: "product-16",
    tipo_intervento: "manutenzione", 
    note: "Manutenzione cartello turistico dopo segnalazione guida turistica. Ritoccata grafica e sostituita protezione UV.",
    foto_urls: [
      "https://via.placeholder.com/400x300?text=Cartello+prima+manutenzione",
      "https://via.placeholder.com/400x300?text=Ritocchi+grafici"
    ],
    userId: "user-9",
    gps_lat: 45.4701,
    gps_lng: 9.1789,
    createdAt: "2024-01-28T13:20:00Z",
  },
  {
    id: "maint-20",
    productId: "product-17",
    tipo_intervento: "verifica",
    note: "Controllo semestrale totem turistico. Verificato sistema anti-vandalo, pulizia display informativo digitale.",
    foto_urls: ["https://via.placeholder.com/400x300?text=Controllo+totem+digitale"],
    userId: "user-14", 
    gps_lat: 45.4338,
    gps_lng: 12.3346,
    createdAt: "2024-02-11T10:50:00Z",
  },

  // Manutenzioni recenti
  {
    id: "maint-21",
    productId: "product-18",
    tipo_intervento: "installazione",
    note: "Prima installazione segnale STOP controllo. Coordinamento con forze dell'ordine. Posizione strategica ottimale.",
    foto_urls: [
      "https://via.placeholder.com/400x300?text=Coordinamento+con+vigili",
      "https://via.placeholder.com/400x300?text=Installazione+STOP+controllo"
    ],
    userId: "user-7",
    gps_lat: 45.4612,
    gps_lng: 9.1856,
    createdAt: "2024-02-10T09:30:00Z",
  },
  {
    id: "maint-22",
    productId: "product-19",
    tipo_intervento: "installazione",
    note: "Installazione segnale LED emergenza. Collegamento alla rete elettrica, test sistema di illuminazione. Tutto funzionante.", 
    foto_urls: [
      "https://via.placeholder.com/400x300?text=Collegamento+elettrico",
      "https://via.placeholder.com/400x300?text=Test+LED+notturno"
    ],
    userId: "user-8",
    gps_lat: 45.4590,
    gps_lng: 9.1710,
    createdAt: "2024-02-09T16:40:00Z",
  },
  {
    id: "maint-23",
    productId: "product-20",
    tipo_intervento: "installazione",
    note: "Installazione segnale attraversamento fauna. Area boschiva, attenzione a non danneggiare vegetazione esistente.",
    foto_urls: [
      "https://via.placeholder.com/400x300?text=Area+boschiva",
      "https://via.placeholder.com/400x300?text=Segnale+attraversamento+animali"
    ],
    userId: "user-11", 
    gps_lat: 45.0800,
    gps_lng: 7.6950,
    createdAt: "2024-02-09T11:20:00Z",
  },

  // Manutenzioni straordinarie
  {
    id: "maint-24",
    productId: "product-12",
    tipo_intervento: "manutenzione",
    note: "Manutenzione straordinaria pannello integrativo dopo grandinata. Sostituita pellicola danneggiata, verifica tenuta supporto.",
    foto_urls: [
      "https://via.placeholder.com/400x300?text=Danni+da+grandine",
      "https://via.placeholder.com/400x300?text=Sostituzione+pellicola+pannello"
    ],
    userId: "user-6",
    gps_lat: 45.4642,
    gps_lng: 9.1905,
    createdAt: "2024-02-06T14:10:00Z",
  },
  {
    id: "maint-25", 
    productId: "product-13",
    tipo_intervento: "verifica",
    note: "Verifica straordinaria dopo modifica orari ZTL comunale. Conferma conformità pannello orario alle nuove disposizioni.",
    foto_urls: ["https://via.placeholder.com/400x300?text=Verifica+orari+ZTL"],
    userId: "user-8",
    gps_lat: 45.4685,
    gps_lng: 9.1923,
    createdAt: "2024-02-04T12:00:00Z",
  }
];

// Mock Scheduled Maintenances - Manutenzioni programmate per il calendario
export const mockScheduledMaintenances = [
  // Manutenzioni di oggi
  {
    id: "scheduled-1",
    title: "Verifica segnale stradale",
    employeeId: "user-6",
    employeeName: "Marco Bianchi",
    productId: "product-1",
    productName: "Segnale di pericolo - Curva pericolosa",
    productLocation: "Via Roma 123, Milano",
    maintenanceType: "verifica" as const,
    scheduledDate: new Date(),
    startTime: "09:00",
    endTime: "10:30",
    duration: 90,
    status: "scheduled" as const,
    priority: "medium" as const,
    notes: "Verifica periodica semestrale, controllare stato pellicola retroriflettente",
    gpsLat: 45.4642,
    gpsLng: 9.1900,
  },
  {
    id: "scheduled-2",
    title: "Sostituzione pellicola deteriorata",
    employeeId: "user-7",
    employeeName: "Giuseppe Verdi",
    productId: "product-3",
    productName: "Segnale di pericolo - Lavori in corso",
    productLocation: "Viale Monza 67, Milano",
    maintenanceType: "sostituzione" as const,
    scheduledDate: new Date(),
    startTime: "11:00",
    endTime: "13:00",
    duration: 120,
    status: "in_progress" as const,
    priority: "high" as const,
    notes: "Pellicola danneggiata da atti vandalici, sostituzione urgente",
    gpsLat: 45.4580,
    gpsLng: 9.1820,
  },
  {
    id: "scheduled-3",
    title: "Installazione nuovo segnale STOP",
    employeeId: "user-8",
    employeeName: "Lucia Ferrari",
    productId: "product-5",
    productName: "Segnale di obbligo - STOP",
    productLocation: "Piazza Duomo 45, Milano",
    maintenanceType: "installazione" as const,
    scheduledDate: new Date(),
    startTime: "14:00",
    endTime: "16:30",
    duration: 150,
    status: "scheduled" as const,
    priority: "medium" as const,
    notes: "Installazione presso nuovo incrocio, preparazione supporto inclusa",
    gpsLat: 45.4700,
    gpsLng: 9.1950,
  },

  // Manutenzioni di domani
  {
    id: "scheduled-4",
    title: "Manutenzione ordinaria segnaletica ZTL",
    employeeId: "user-9",
    employeeName: "Sara Lombardi",
    productId: "product-8",
    productName: "Pannello integrativo - Orari ZTL",
    productLocation: "Corso Buenos Aires 123, Milano",
    maintenanceType: "manutenzione" as const,
    scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Domani
    startTime: "08:30",
    endTime: "10:00",
    duration: 90,
    status: "scheduled" as const,
    priority: "low" as const,
    notes: "Pulizia pannello LED e verifica funzionalità timer",
    gpsLat: 45.4740,
    gpsLng: 9.1980,
  },
  {
    id: "scheduled-5",
    title: "Verifica dopo installazione",
    employeeId: "user-10",
    employeeName: "Andrea Doge",
    productId: "product-10",
    productName: "Segnale di divieto - Accesso limitato",
    productLocation: "Via Brera 15, Milano",
    maintenanceType: "verifica" as const,
    scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    startTime: "10:30",
    endTime: "11:30",
    duration: 60,
    status: "scheduled" as const,
    priority: "medium" as const,
    notes: "Controllo stabilità e visibilità dopo installazione di 7 giorni fa",
    gpsLat: 45.4680,
    gpsLng: 9.1850,
  },

  // Manutenzioni di dopodomani
  {
    id: "scheduled-6",
    title: "Dismissione segnale danneggiato",
    employeeId: "user-11",
    employeeName: "Silvia Latina",
    productId: "product-6",
    productName: "Segnale di divieto - Sosta vietata",
    productLocation: "Via Nazionale 456, Roma",
    maintenanceType: "dismissione" as const,
    scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    startTime: "09:00",
    endTime: "11:00",
    duration: 120,
    status: "scheduled" as const,
    priority: "urgent" as const,
    notes: "Segnale completamente danneggiato da incidente stradale, rimozione immediata",
    gpsLat: 41.9028,
    gpsLng: 12.4964,
  },
  {
    id: "scheduled-7",
    title: "Installazione segnaletica turistica",
    employeeId: "user-12",
    employeeName: "Alessandro Milani",
    productId: "product-12",
    productName: "Cartellonistica turistica - Direzione monumenti",
    productLocation: "Piazza San Marco, Venezia",
    maintenanceType: "installazione" as const,
    scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    startTime: "15:00",
    endTime: "17:30",
    duration: 150,
    status: "scheduled" as const,
    priority: "low" as const,
    notes: "Installazione cartello turistico multilingue per stagione estiva",
    gpsLat: 45.4340,
    gpsLng: 12.3380,
  },

  // Manutenzioni della settimana prossima
  {
    id: "scheduled-8",
    title: "Manutenzione straordinaria semaforo",
    employeeId: "user-13",
    employeeName: "Michela Piemonte",
    productId: "product-15",
    productName: "Segnale temporaneo - Cantiere stradale",
    productLocation: "Corso Vittorio Emanuele, Torino",
    maintenanceType: "manutenzione" as const,
    scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    startTime: "08:00",
    endTime: "12:00",
    duration: 240,
    status: "scheduled" as const,
    priority: "high" as const,
    notes: "Sostituzione centralina elettronica e aggiornamento programmazione",
    gpsLat: 45.0703,
    gpsLng: 7.6869,
  },
  {
    id: "scheduled-9", 
    title: "Verifica conformità nuove normative",
    employeeId: "user-14",
    employeeName: "Laura Conti",
    productId: "product-11",
    productName: "Segnale di indicazione - Direzione ospedale",
    productLocation: "Via del Policlinico, Roma",
    maintenanceType: "verifica" as const,
    scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    startTime: "14:00",
    endTime: "15:30",
    duration: 90,
    status: "scheduled" as const,
    priority: "medium" as const,
    notes: "Controllo conformità decreto ministeriale 2024 su segnaletica ospedaliera",
    gpsLat: 41.9109,
    gpsLng: 12.5133,
  },

  // Manutenzioni completate (per statistiche)
  {
    id: "scheduled-10",
    title: "Sostituzione supporto danneggiato",
    employeeId: "user-6",
    employeeName: "Marco Bianchi", 
    productId: "product-2",
    productName: "Segnale di pericolo - Incrocio pericoloso",
    productLocation: "Viale Libertà 89, Milano",
    maintenanceType: "sostituzione" as const,
    scheduledDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Ieri
    startTime: "10:00",
    endTime: "12:30",
    duration: 150,
    status: "completed" as const,
    priority: "high" as const,
    notes: "Supporto sostituito dopo danneggiamento da vento forte",
    gpsLat: 45.4700,
    gpsLng: 9.1950,
  },
  {
    id: "scheduled-11",
    title: "Verifica trimestrale completata",
    employeeId: "user-8",
    employeeName: "Lucia Ferrari",
    productId: "product-4",
    productName: "Segnale di obbligo - Direzione obbligatoria",
    productLocation: "Piazza della Repubblica, Milano",
    maintenanceType: "verifica" as const,
    scheduledDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Due giorni fa
    startTime: "09:30",
    endTime: "10:30",
    duration: 60,
    status: "completed" as const,
    priority: "low" as const,
    notes: "Verifica completata con esito positivo, nessuna anomalia riscontrata",
    gpsLat: 45.4707,
    gpsLng: 9.1979,
  }
];

// Helper functions estese
export const getUserById = (id: string) => mockUsers.find(user => user.id === id);
export const getProductById = (id: string) => mockProducts.find(product => product.id === id);
export const getMaintenanceByProductId = (productId: string) => 
  mockMaintenance.filter(maint => maint.productId === productId);
export const getCompanyById = (id: string) => mockCompanies.find(company => company.id === id);

// Nuove helper functions per analisi e statistiche
export const getProductsByCompany = (companyId: string) => 
  mockProducts.filter(product => product.companyId === companyId);

export const getUsersByCompany = (companyId: string) => 
  mockUsers.filter(user => user.companyId === companyId);

export const getUsersByRole = (role: 'company' | 'employee' | 'viewer') => 
  mockUsers.filter(user => user.role === role);

export const getMaintenanceByUser = (userId: string) => 
  mockMaintenance.filter(maint => maint.userId === userId);

export const getMaintenanceByType = (tipo: 'installazione' | 'manutenzione' | 'sostituzione' | 'verifica' | 'dismissione') => 
  mockMaintenance.filter(maint => maint.tipo_intervento === tipo);

// Helper functions per manutenzioni programmate
export const getScheduledMaintenanceById = (id: string) => 
  mockScheduledMaintenances.find(scheduled => scheduled.id === id);

export const getScheduledMaintenancesByEmployee = (employeeId: string) => 
  mockScheduledMaintenances.filter(scheduled => scheduled.employeeId === employeeId);

export const getScheduledMaintenancesByStatus = (status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled') => 
  mockScheduledMaintenances.filter(scheduled => scheduled.status === status);

export const getScheduledMaintenancesByDate = (date: Date) => 
  mockScheduledMaintenances.filter(scheduled => {
    const scheduledDate = new Date(scheduled.scheduledDate);
    return (
      scheduledDate.getDate() === date.getDate() &&
      scheduledDate.getMonth() === date.getMonth() &&
      scheduledDate.getFullYear() === date.getFullYear()
    );
  });

export const getScheduledMaintenancesByDateRange = (startDate: Date, endDate: Date) => 
  mockScheduledMaintenances.filter(scheduled => {
    const scheduledDate = new Date(scheduled.scheduledDate);
    return scheduledDate >= startDate && scheduledDate <= endDate;
  });

export const getScheduledMaintenancesByPriority = (priority: 'low' | 'medium' | 'high' | 'urgent') => 
  mockScheduledMaintenances.filter(scheduled => scheduled.priority === priority);

export const getScheduledMaintenancesByType = (type: 'installazione' | 'manutenzione' | 'verifica' | 'sostituzione' | 'dismissione') => 
  mockScheduledMaintenances.filter(scheduled => scheduled.maintenanceType === type);

export const getMaintenanceByDateRange = (startDate: string, endDate: string) => 
  mockMaintenance.filter(maint => 
    maint.createdAt >= startDate && maint.createdAt <= endDate
  );

export const getProductsBySignalType = (tipo: string) => 
  mockProducts.filter(product => product.tipo_segnale === tipo);

export const getProductsByYear = (year: number) => 
  mockProducts.filter(product => product.anno === year);

export const getProductsByMaterial = (material: string) => 
  mockProducts.filter(product => product.materiale_supporto === material);

// Funzioni per statistiche avanzate
export const getMaintenanceStats = () => ({
  total: mockMaintenance.length,
  byType: {
    installazione: getMaintenanceByType('installazione').length,
    manutenzione: getMaintenanceByType('manutenzione').length,
    verifica: getMaintenanceByType('verifica').length,
    sostituzione: getMaintenanceByType('sostituzione').length,
    dismissione: getMaintenanceByType('dismissione').length,
  },
  thisMonth: getMaintenanceByDateRange('2024-02-01T00:00:00Z', '2024-02-29T23:59:59Z').length,
  thisWeek: getMaintenanceByDateRange('2024-02-05T00:00:00Z', '2024-02-11T23:59:59Z').length,
});

export const getProductStats = () => ({
  total: mockProducts.length,
  byType: {
    'Segnale di pericolo': getProductsBySignalType('Segnale di pericolo').length,
    'Segnale di obbligo': getProductsBySignalType('Segnale di obbligo').length,
    'Segnale di divieto': getProductsBySignalType('Segnale di divieto').length,
    'Segnale di indicazione': getProductsBySignalType('Segnale di indicazione').length,
    'Pannello integrativo': getProductsBySignalType('Pannello integrativo').length,
    'Segnale temporaneo': getProductsBySignalType('Segnale temporaneo').length,
    'Cartellonistica turistica': getProductsBySignalType('Cartellonistica turistica').length,
  },
  byYear: {
    2024: getProductsByYear(2024).length,
    2023: getProductsByYear(2023).length,
    2022: getProductsByYear(2022).length,
  },
  byMaterial: {
    'Alluminio': getProductsByMaterial('Alluminio').length,
    'PVC': getProductsByMaterial('PVC').length,
    'PVC Rigido': getProductsByMaterial('PVC Rigido').length,
    'Legno Trattato': getProductsByMaterial('Legno Trattato').length,
  }
});

export const getCompanyStats = () => ({
  total: mockCompanies.length,
  totalUsers: mockUsers.length,
  byRole: {
    company: getUsersByRole('company').length,
    employee: getUsersByRole('employee').length, 
    viewer: getUsersByRole('viewer').length,
  },
  avgProductsPerCompany: Math.round(mockProducts.length / mockCompanies.length),
  avgUsersPerCompany: Math.round(mockUsers.filter(u => u.companyId).length / mockCompanies.length),
});

// Dati geografici per analytics
export const getCitiesRepresented = () => [
  { name: 'Milano', count: mockProducts.filter(p => p.gps_lat && p.gps_lng && p.gps_lat > 45.4 && p.gps_lat < 45.5 && p.gps_lng > 9.1 && p.gps_lng < 9.3).length },
  { name: 'Roma', count: mockProducts.filter(p => p.gps_lat && p.gps_lng && p.gps_lat > 41.8 && p.gps_lat < 42.0 && p.gps_lng > 12.4 && p.gps_lng < 12.6).length },
  { name: 'Torino', count: mockProducts.filter(p => p.gps_lat && p.gps_lng && p.gps_lat > 45.0 && p.gps_lat < 45.1 && p.gps_lng > 7.6 && p.gps_lng < 7.7).length },
  { name: 'Venezia', count: mockProducts.filter(p => p.gps_lat && p.gps_lng && p.gps_lat > 45.4 && p.gps_lat < 45.5 && p.gps_lng > 12.2 && p.gps_lng < 12.4).length },
];

// Mock Recent Activity per dashboard
export const getRecentActivity = () => [
  {
    id: 'activity-1',
    type: 'maintenance',
    description: 'Manutenzione completata su segnale QR020',
    user: 'Michela Piemonte',
    timestamp: '2024-02-10T16:30:00Z',
    location: 'Torino'
  },
  {
    id: 'activity-2', 
    type: 'installation',
    description: 'Nuovo segnale STOP installato QR018',
    user: 'Laura Conti',
    timestamp: '2024-02-10T09:30:00Z',
    location: 'Milano'
  },
  {
    id: 'activity-3',
    type: 'verification',
    description: 'Verifica periodica completata QR017',
    user: 'Andrea Doge',
    timestamp: '2024-02-09T14:20:00Z',
    location: 'Venezia'
  },
  {
    id: 'activity-4',
    type: 'replacement',
    description: 'Sostituzione pellicola segnale QR008',
    user: 'Silvia Latina', 
    timestamp: '2024-02-09T11:45:00Z',
    location: 'Roma'
  },
  {
    id: 'activity-5',
    type: 'installation',
    description: 'Segnale LED emergenza installato QR019',
    user: 'Alessandro Milani',
    timestamp: '2024-02-08T16:40:00Z',
    location: 'Milano'
  }
];

// Mock Blockchain Records per verifiche on-chain
export const mockBlockchainRecords = [
  {
    qr_code: "QR001",
    transaction_hash: "0x1234567890abcdef1234567890abcdef12345678",
    blockchain: "Ethereum",
    contract_address: "0xabcdef1234567890abcdef1234567890abcdef12",
    token_id: "1001",
    block_number: 18500000,
    timestamp: "2024-01-15T10:45:00Z",
    gas_used: "21000",
    status: "confirmed",
    explorer_url: "https://etherscan.io/tx/0x1234567890abcdef1234567890abcdef12345678"
  },
  {
    qr_code: "QR002", 
    transaction_hash: "0x2345678901bcdef12345678901bcdef123456789",
    blockchain: "Polygon",
    contract_address: "0xbcdef12345678901bcdef12345678901bcdef123",
    token_id: "1002",
    block_number: 45600000,
    timestamp: "2024-01-16T14:20:00Z",
    gas_used: "18500",
    status: "confirmed",
    explorer_url: "https://polygonscan.com/tx/0x2345678901bcdef12345678901bcdef123456789"
  },
  {
    qr_code: "QR003",
    transaction_hash: "0x3456789012cdef123456789012cdef1234567890",
    blockchain: "Ethereum", 
    contract_address: "0xabcdef1234567890abcdef1234567890abcdef12",
    token_id: "1003",
    block_number: 18502000,
    timestamp: "2024-01-18T09:45:00Z",
    gas_used: "22000",
    status: "confirmed",
    explorer_url: "https://etherscan.io/tx/0x3456789012cdef123456789012cdef1234567890"
  }
];

// Mock Data Installazioni con info complete
export const mockInstallationData = [
  {
    qr_code: "QR001",
    installation_date: "2024-01-15T10:30:00Z",
    installer_company: "Segnaletica Stradale SRL",
    installer_technician: "Marco Bianchi",
    installation_location: "Via Roma 123, Milano",
    certification_number: "CERT-2024-001",
    compliance_standards: ["UNI EN 12899-1", "Codice della Strada Art. 77"],
    warranty_period: "5 anni",
    next_maintenance_due: "2024-07-15T00:00:00Z"
  },
  {
    qr_code: "QR002",
    installation_date: "2024-01-16T14:15:00Z", 
    installer_company: "Milano Traffic Solutions SpA",
    installer_technician: "Giuseppe Verdi",
    installation_location: "Piazza Duomo 45, Milano",
    certification_number: "CERT-2024-002",
    compliance_standards: ["UNI EN 12899-1", "D.Lgs 285/1992"],
    warranty_period: "3 anni",
    next_maintenance_due: "2024-10-16T00:00:00Z"
  },
  {
    qr_code: "QR003",
    installation_date: "2024-01-18T09:30:00Z",
    installer_company: "Milano Traffic Solutions SpA", 
    installer_technician: "Lucia Ferrari",
    installation_location: "Viale Monza 67, Milano",
    certification_number: "CERT-2024-003", 
    compliance_standards: ["UNI EN 12899-1", "Regolamento Comunale Milano"],
    warranty_period: "2 anni",
    next_maintenance_due: "2024-04-18T00:00:00Z"
  }
];

// Mock Scadenze e Azioni Pending per produttori
export const mockPendingActions = [
  {
    id: "pending-1",
    qr_code: "QR001",
    action_type: "scheduled_maintenance", 
    description: "Manutenzione programmata semestralet",
    due_date: "2024-07-15T00:00:00Z",
    assigned_company: "Segnaletica Stradale SRL",
    assigned_technician: "Marco Bianchi",
    priority: "medium",
    estimated_duration: "2 ore",
    status: "scheduled"
  },
  {
    id: "pending-2", 
    qr_code: "QR008",
    action_type: "inspection_overdue",
    description: "Verifica periodica scaduta da 15 giorni",
    due_date: "2024-01-25T00:00:00Z",
    assigned_company: "Romana Segnali & Cartellonistica",
    assigned_technician: "Andrea Rossi", 
    priority: "high",
    estimated_duration: "1 ora",
    status: "overdue"
  },
  {
    id: "pending-3",
    qr_code: "QR012", 
    action_type: "replacement_needed",
    description: "Sostituzione pellicola deteriorata",
    due_date: "2024-03-10T00:00:00Z",
    assigned_company: "Venezia Maritime Safety",
    assigned_technician: "Laura Conti",
    priority: "medium",
    estimated_duration: "3 ore", 
    status: "approved"
  },
  {
    id: "pending-4",
    qr_code: "QR015",
    action_type: "compliance_check",
    description: "Verifica conformità nuove normative 2024",
    due_date: "2024-04-01T00:00:00Z", 
    assigned_company: "Sicurezza Urbana Torino",
    assigned_technician: "Michela Piemonte",
    priority: "low",
    estimated_duration: "45 minuti",
    status: "pending_approval"
  }
];

// Helper functions per nuove funzionalità
export const getBlockchainRecord = (qr_code: string) => 
  mockBlockchainRecords.find(record => record.qr_code === qr_code);

export const getInstallationData = (qr_code: string) =>
  mockInstallationData.find(install => install.qr_code === qr_code);

export const getPendingActions = (qr_code?: string) => {
  if (qr_code) {
    return mockPendingActions.filter(action => action.qr_code === qr_code);
  }
  return mockPendingActions;
};

export const getPendingActionsByPriority = (priority: 'high' | 'medium' | 'low') =>
  mockPendingActions.filter(action => action.priority === priority);

export const getOverdueActions = () =>
  mockPendingActions.filter(action => action.status === 'overdue');

// Mock PDF Certificate generation
export const mockGenerateCertificate = async (qr_code: string) => {
  // Simula generazione PDF
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const product = mockProducts.find(p => p.qr_code === qr_code);
  const installation = getInstallationData(qr_code);
  const maintenances = getMaintenanceByProductId(
    mockProducts.find(p => p.qr_code === qr_code)?.id || ''
  );
  
  return {
    filename: `certificato_${qr_code}_${new Date().toISOString().split('T')[0]}.pdf`,
    size: "2.4 MB",
    pages: 8,
    contains: [
      "Scheda tecnica prodotto",
      "Dati installazione", 
      "Storico manutenzioni completo",
      "Certificazioni conformità",
      "Verifica blockchain",
      "QR code di verifica"
    ],
    generated_at: new Date().toISOString(),
    blockchain_verified: !!getBlockchainRecord(qr_code)
  };
};

// Mock Blockchain Certificates
export const mockBlockchainCertificates: BlockchainCertificate[] = [
  {
    id: "cert-1",
    productId: "product-1",
    transactionHash: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890",
    blockNumber: 18456789,
    certificateType: "installation",
    issuer: "CertPlus Authority",
    timestamp: "2024-01-15T10:45:00Z",
    metadata: {
      operator: "Giuseppe Verdi",
      location: {
        lat: 45.4642,
        lng: 9.1900
      },
      notes: "Installazione regolare completata con successo",
      photos: [
        "https://via.placeholder.com/400x300?text=Installazione+QR001"
      ]
    },
    verified: true
  },
  {
    id: "cert-2",
    productId: "product-1",
    transactionHash: "0x2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890ab",
    blockNumber: 18567890,
    certificateType: "verification",
    issuer: "CertPlus Authority",
    timestamp: "2024-02-01T14:30:00Z",
    metadata: {
      operator: "Laura Conti",
      location: {
        lat: 45.4642,
        lng: 9.1900
      },
      notes: "Verifica mensile - Segnale in ottime condizioni",
      photos: [
        "https://via.placeholder.com/400x300?text=Verifica+QR001"
      ]
    },
    verified: true
  },
  {
    id: "cert-3",
    productId: "product-2",
    transactionHash: "0x3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcd",
    blockNumber: 18567891,
    certificateType: "installation",
    issuer: "CertPlus Authority",
    timestamp: "2024-01-16T14:20:00Z",
    metadata: {
      operator: "Laura Conti",
      location: {
        lat: 45.4700,
        lng: 9.1950
      },
      notes: "Installazione segnale obbligo direzione",
      photos: [
        "https://via.placeholder.com/400x300?text=Installazione+QR002"
      ]
    },
    verified: true
  },
  {
    id: "cert-4",
    productId: "product-3",
    transactionHash: "0x4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    blockNumber: 18567892,
    certificateType: "installation",
    issuer: "CertPlus Authority",
    timestamp: "2024-01-18T09:45:00Z",
    metadata: {
      operator: "Alessandro Milani",
      location: {
        lat: 45.4580,
        lng: 9.1820
      },
      notes: "Installazione segnale cantiere temporaneo",
      photos: [
        "https://via.placeholder.com/400x300?text=Installazione+QR003"
      ]
    },
    verified: true
  }
];

// Mock Product History
export const mockProductHistory: ProductHistory[] = [
  {
    id: "hist-1",
    productId: "product-1",
    eventType: "created",
    description: "Segnale creato nel sistema",
    performedBy: "user-6",
    timestamp: "2024-01-15T10:30:00Z"
  },
  {
    id: "hist-2",
    productId: "product-1",
    eventType: "installed",
    description: "Segnale installato in via Roma 123",
    performedBy: "user-6",
    timestamp: "2024-01-15T10:45:00Z",
    location: {
      lat: 45.4642,
      lng: 9.1900
    },
    photos: [
      "https://via.placeholder.com/400x300?text=Installazione+QR001"
    ],
    certificateId: "cert-1",
    maintenanceId: "maint-1"
  },
  {
    id: "hist-3",
    productId: "product-1",
    eventType: "verified",
    description: "Verifica mensile completata",
    performedBy: "user-7",
    timestamp: "2024-02-01T14:30:00Z",
    location: {
      lat: 45.4642,
      lng: 9.1900
    },
    photos: [
      "https://via.placeholder.com/400x300?text=Verifica+QR001"
    ],
    certificateId: "cert-2"
  },
  {
    id: "hist-4",
    productId: "product-2",
    eventType: "created",
    description: "Segnale creato nel sistema",
    performedBy: "user-7",
    timestamp: "2024-01-16T14:00:00Z"
  },
  {
    id: "hist-5",
    productId: "product-2",
    eventType: "installed",
    description: "Segnale obbligo direzione installato",
    performedBy: "user-7",
    timestamp: "2024-01-16T14:20:00Z",
    location: {
      lat: 45.4700,
      lng: 9.1950
    },
    photos: [
      "https://via.placeholder.com/400x300?text=Installazione+QR002"
    ],
    certificateId: "cert-3",
    maintenanceId: "maint-2"
  },
  {
    id: "hist-6",
    productId: "product-3",
    eventType: "created",
    description: "Segnale creato nel sistema",
    performedBy: "user-8",
    timestamp: "2024-01-18T09:30:00Z"
  },
  {
    id: "hist-7",
    productId: "product-3",
    eventType: "installed",
    description: "Segnale cantiere installato",
    performedBy: "user-8",
    timestamp: "2024-01-18T09:45:00Z",
    location: {
      lat: 45.4580,
      lng: 9.1820
    },
    photos: [
      "https://via.placeholder.com/400x300?text=Installazione+QR003"
    ],
    certificateId: "cert-4",
    maintenanceId: "maint-3"
  }
];

// Helper functions
export const getProductHistory = (productId: string): ProductHistory[] => {
  return mockProductHistory.filter(history => history.productId === productId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const getBlockchainCertificates = (productId: string): BlockchainCertificate[] => {
  return mockBlockchainCertificates.filter(cert => cert.productId === productId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const getInstallationDate = (productId: string): string | null => {
  const installationHistory = mockProductHistory.find(
    history => history.productId === productId && history.eventType === 'installed'
  );
  return installationHistory ? installationHistory.timestamp : null;
};

// Mock Assigned Tasks - Lavori assegnati agli employee
export interface AssignedTask {
  id: string;
  productId: string;
  qr_code: string;
  employee_id: string;
  task_type: 'revisione' | 'sostituzione' | 'dismissione' | 'installazione';
  status: 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_date: string;
  due_date: string;
  assigned_by: string;
  description: string;
  notes?: string;
  estimated_duration?: number; // in minuti
}

export const mockAssignedTasks: AssignedTask[] = [
  // Task assegnati all'employee corrente (user-6)
  {
    id: "task-1",
    productId: "product-1", 
    qr_code: "QR001",
    employee_id: "user-6",
    task_type: "revisione",
    status: "assigned",
    priority: "medium",
    assigned_date: "2025-01-19T08:00:00Z",
    due_date: "2025-01-22T18:00:00Z",
    assigned_by: "user-1",
    description: "Controllo mensile segnale curva pericolosa - Via Roma 123",
    notes: "Verificare stato pellicola retroriflettente e stabilità supporto",
    estimated_duration: 30
  },
  {
    id: "task-2",
    productId: "product-8",
    qr_code: "QR008", 
    employee_id: "user-6",
    task_type: "sostituzione",
    status: "assigned",
    priority: "high",
    assigned_date: "2025-01-19T09:30:00Z",
    due_date: "2025-01-20T17:00:00Z",
    assigned_by: "user-1",
    description: "Sostituzione pellicola danneggiata segnale divieto sosta",
    notes: "Pellicola deteriorata dalle intemperie, da sostituire con classe II",
    estimated_duration: 90
  },
  {
    id: "task-3",
    productId: "product-15",
    qr_code: "QR015",
    employee_id: "user-6", 
    task_type: "dismissione",
    status: "assigned",
    priority: "medium",
    assigned_date: "2025-01-19T10:15:00Z",
    due_date: "2025-01-25T16:00:00Z",
    assigned_by: "user-1",
    description: "Rimozione segnale temporaneo strada chiusa - Fine lavori",
    notes: "Lavori stradali terminati, rimuovere segnaletica temporanea e ripristinare area",
    estimated_duration: 60
  },
  {
    id: "task-4",
    productId: "product-test-999",
    qr_code: "QR999",
    employee_id: "user-6",
    task_type: "installazione",
    status: "assigned", 
    priority: "high",
    assigned_date: "2025-01-19T11:00:00Z",
    due_date: "2025-01-21T12:00:00Z",
    assigned_by: "user-1",
    description: "Installazione nuovo segnale pericolo test",
    notes: "Nuovo cartello da installare in posizione strategica, seguire specifiche tecniche",
    estimated_duration: 120
  },
  {
    id: "task-5",
    productId: "product-3",
    qr_code: "QR003",
    employee_id: "user-6",
    task_type: "revisione",
    status: "in_progress",
    priority: "low",
    assigned_date: "2025-01-18T14:30:00Z",
    due_date: "2025-01-24T16:00:00Z",
    assigned_by: "user-1",
    description: "Verifica segnale lavori in corso - Controllo settimanale",
    notes: "Controllo routine area cantiere, verifica visibilità e posizionamento",
    estimated_duration: 45
  }
];

// Helper functions per assigned tasks
export const getAssignedTasksByEmployee = (employeeId: string = "user-6"): AssignedTask[] => {
  return mockAssignedTasks.filter(task => task.employee_id === employeeId);
};

export const getPendingTasksByEmployee = (employeeId: string = "user-6"): AssignedTask[] => {
  return mockAssignedTasks.filter(task => 
    task.employee_id === employeeId && 
    (task.status === 'assigned' || task.status === 'in_progress')
  );
};

export const getTasksByStatus = (status: AssignedTask['status'], employeeId: string = "user-6"): AssignedTask[] => {
  return mockAssignedTasks.filter(task => 
    task.employee_id === employeeId && task.status === status
  );
};

export const getTasksByPriority = (priority: AssignedTask['priority'], employeeId: string = "user-6"): AssignedTask[] => {
  return mockAssignedTasks.filter(task => 
    task.employee_id === employeeId && task.priority === priority
  );
};

export const getOverdueTasks = (employeeId: string = "user-6"): AssignedTask[] => {
  const now = new Date();
  return mockAssignedTasks.filter(task => 
    task.employee_id === employeeId && 
    (task.status === 'assigned' || task.status === 'in_progress') &&
    new Date(task.due_date) < now
  );
};