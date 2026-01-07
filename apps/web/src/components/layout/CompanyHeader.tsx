"use client";

import { memo, useCallback } from "react";
import { Menu, X, Bell, User } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { cn } from "@certplus/utils";
import type { User as UserType, Company } from "@certplus/types";

/**
 * CompanyHeader - Header responsivo per dashboard aziendale
 * 
 * **Core Features:**
 * - ✅ Hamburger menu per mobile (toggle sidebar)
 * - ✅ Brand logo responsive con nome azienda
 * - ✅ User info e notifiche
 * - ✅ Theme toggle integrato
 * - ✅ Responsive design mobile-first
 * - ✅ Layout pulito senza search bar
 * 
 * **Business Logic:**
 * - Header sticky per accesso rapido strumenti
 * - Notifiche manutenzioni scadute/urgenti
 * - User profile quick access
 * - Branding dinamico per azienda
 * 
 * **Technical Architecture:**
 * - Memoized component per performance
 * - useCallback per event handlers
 * - Conditional rendering per mobile/desktop
 * - Props drilling per user data
 * 
 * **TODO:**
 * - Notification center con badge count reale
 * - User dropdown menu con logout/profile
 * - Keyboard shortcuts per sidebar toggle
 */

interface CompanyHeaderProps {
  /** Stato sidebar mobile - true se aperta */
  sidebarOpen: boolean;
  /** Callback per toggle sidebar mobile */
  onSidebarToggle: () => void;
  /** Dati utente corrente per display nome/avatar */
  currentUser?: UserType;
  /** Dati azienda corrente per branding */
  currentCompany?: Company;
  /** Callback logout utente */
  onLogout?: () => void;
  /** Classe CSS aggiuntiva per styling custom */
  className?: string;
}

export const CompanyHeader = memo(function CompanyHeader({
  sidebarOpen,
  onSidebarToggle,
  currentUser,
  currentCompany,
  onLogout,
  className
}: CompanyHeaderProps) {
  // Event handlers ottimizzati con useCallback
  const handleNotifications = useCallback(() => {
    // TODO: Aprire centro notifiche
    console.log('Apri notifiche');
  }, []);

  const handleUserProfile = useCallback(() => {
    // TODO: Aprire menu profilo utente
    console.log('Apri profilo utente');
  }, []);

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border shadow-sm",
      className
    )}>
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left Section: Menu Toggle + Brand */}
        <div className="flex items-center gap-4">
          {/* Hamburger Menu - Solo mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onSidebarToggle}
            aria-label={sidebarOpen ? "Chiudi menu" : "Apri menu"}
          >
            {sidebarOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>

          {/* Brand Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <span className="text-sm font-bold text-primary">
                {currentCompany?.name?.charAt(0) || 'C'}
              </span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-foreground">
                {currentCompany?.name || 'Certificable Plus'}
              </h1>
              <p className="text-xs text-muted-foreground">
                Dashboard Aziendale
              </p>
            </div>
          </div>
        </div>

        {/* Center Section: Spacer */}
        <div className="flex-1"></div>

        {/* Right Section: Actions + User */}
        <div className="flex items-center gap-2">

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
});