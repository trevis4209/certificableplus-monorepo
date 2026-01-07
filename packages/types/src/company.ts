/**
 * Company Types - CertificablePlus Monorepo
 * Shared between Web and Mobile apps
 */

export interface Company {
  id: string;
  name: string;
  email: string;
  logo_url?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Cantiere interface (Web only - road construction sites)
 * Used for managing temporary construction zones
 */
export interface Cantiere {
  id: string;
  data_inizio: string; // ISO date string
  gps_inizio_lat: number;
  gps_inizio_lng: number;
  gps_fine_lat: number;
  gps_fine_lng: number;
  stato: 'aperto' | 'chiuso';
  companyId: string;
  createdAt: string;
  updatedAt: string;
}
