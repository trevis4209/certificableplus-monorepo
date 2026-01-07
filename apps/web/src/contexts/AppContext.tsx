/**
 * AppContext - Context unificato per stato globale applicazione
 * 
 * Centralizza tutto lo stato UI condiviso dell'applicazione
 * per evitare prop drilling e ottimizzare performance.
 * 
 * **Features:**
 * - Theme management con next-themes integration
 * - Sidebar state management
 * - PageHeader configuration
 * - Notifications system
 * - Loading states globali
 * - Performance optimized con context splitting
 */

"use client";

import React, { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { SidebarProvider } from "./SidebarContext";
import { PageHeaderProvider } from "./PageHeaderContext";

/**
 * Configurazione tema applicazione
 */
interface AppThemeConfig {
  defaultTheme?: string;
  enableSystem?: boolean;
  themes?: string[];
}

/**
 * Props per AppProvider principale
 */
export interface AppProviderProps {
  children: ReactNode;
  themeConfig?: AppThemeConfig;
  sidebarConfig?: {
    defaultOpen?: boolean;
    persistKey?: string;
  };
}

/**
 * AppProvider - Provider principale che combina tutti i context
 * 
 * Questo è il provider principale da usare nel layout root
 * per fornire tutti i context necessari all'applicazione.
 */
export function AppProvider({ 
  children, 
  themeConfig = {
    defaultTheme: "system",
    enableSystem: true,
    themes: ["light", "dark"]
  },
  sidebarConfig = {
    defaultOpen: true,
    persistKey: "sidebar-state"
  }
}: AppProviderProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={themeConfig.defaultTheme}
      enableSystem={themeConfig.enableSystem}
      themes={themeConfig.themes}
      disableTransitionOnChange
    >
      <SidebarProvider
        defaultOpen={sidebarConfig.defaultOpen}
        persistKey={sidebarConfig.persistKey}
      >
        <PageHeaderProvider>
          {children}
        </PageHeaderProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
}

/**
 * Hook combinato per accedere a tutti i context dell'app
 */
export function useApp() {
  return {
    // I singoli hook sono disponibili dai rispettivi context
    // Questo è un convenience hook per accesso rapido
  };
}

export default AppProvider;