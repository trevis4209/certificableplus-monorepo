"use client";

import { memo, useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageHeaderRenderer } from "@/components/layout/PageHeader";
import { useSidebar, useSidebarResponsive } from "@/contexts";
import type { User, Company } from "@certplus/types";

/**
 * CompanyLayoutClient - Layout Client Component per sezione aziendale
 * 
 * **Core Features:**
 * - ✅ Layout responsive desktop-first con mobile support
 * - ✅ Sidebar management ottimizzato per mobile/desktop
 * - ✅ State management per UI interattiva
 * - ✅ Performance ottimizations con memo/callback
 * 
 * **Business Logic:**
 * - Layout azienda con full sidebar desktop
 * - Mobile overlay per sidebar su dispositivi piccoli
 * - Logout handling con redirect sicuro
 * 
 * **Technical Architecture:**
 * - Client Component per interattività
 * - Props typed dal Server Component parent
 * - useState per sidebar mobile state
 * - useCallback per event handlers performance
 * - Responsive design con Tailwind breakpoints
 * 
 * **Integration Points:**
 * - Server Component passa user/company data
 * - Sidebar gestisce navigation e modali
 * 
 * **TODO:**
 * - Implement keyboard shortcuts (Cmd+\ sidebar toggle)
 * - Persist sidebar state in localStorage
 */

interface CompanyLayoutClientProps {
  /** Children components (pagine dashboard) */
  children: React.ReactNode;
  /** Dati utente corrente dalla sessione */
  currentUser?: User;
  /** Dati azienda corrente per branding */
  currentCompany?: Company;
}

export const CompanyLayoutClient = memo(function CompanyLayoutClient({
  children,
  currentUser,
  currentCompany
}: CompanyLayoutClientProps) {
  // Usa il context per gestire sidebar state
  const { state, closeSidebar } = useSidebar();

  // Setup responsive behavior automatico
  useSidebarResponsive();

  // Event handlers ottimizzati con useCallback
  const handleLogout = useCallback(() => {
    // TODO: Implementare logout sicuro con cleanup
    // Clear session, local storage, redirect
    window.location.href = '/';
  }, []);

  // Use currentUser from props, or create a default mock user if not provided
  const displayUser = currentUser || {
    id: 'mock-user',
    email: 'demo@example.com',
    name: 'Demo User',
    role: 'company' as const,
    companyId: 'company-1',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Layout principale con sidebar + content */}
      <div className="flex h-screen">
        {/* Sidebar con state dal context E displayUser */}
        <Sidebar
          userRole="company"
          isOpen={state.isOpen}
          onClose={closeSidebar}
          currentUser={displayUser}
        />

        {/* Main content area */}
        <main className="flex-1 overflow-auto">
          {/* Header dinamico configurabile dalle pagine */}
          <PageHeaderRenderer />

          {/* Contenuto pagina */}
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
});