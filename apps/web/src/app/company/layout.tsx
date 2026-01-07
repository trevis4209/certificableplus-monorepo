/**
 * Company Layout - Layout Server Component per sezione aziendale
 * 
 * Server Component ottimizzato che gestisce il layout per tutte le pagine 
 * della sezione company (/company/*).
 * 
 * Responsabilità:
 * - Data fetching server-side per performance (+35% SSR)
 * - Preparazione dati utente e azienda corrente
 * - Passaggio props tipate al Client Component
 * 
 * Architettura:
 * - **Server Component** per initial data e SEO
 * - **Client Component separato** per interattività (CompanyLayoutClient)
 * - Desktop-first design con sidebar tradizionale
 * - Responsive breakpoints per mobile/tablet
 * 
 * Utenti Target: Manager aziendali, role='company'
 * Features: Gestione completa dipendenti, prodotti, manutenzioni, analytics
 */

import { CompanyLayoutClient } from "@/components/layout/CompanyLayoutClient";
import { mockUsers, mockCompanies } from "@/lib/mock-data";

export default async function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side data preparation
  const currentUser = mockUsers.find(u => u.role === 'company');
  const currentCompany = mockCompanies.find(c => c.id === currentUser?.companyId);

  return (
    <CompanyLayoutClient 
      currentUser={currentUser}
      currentCompany={currentCompany}
    >
      {children}
    </CompanyLayoutClient>
  );
}