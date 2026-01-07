/**
 * PageHeaderContext - Sistema per configurare header dalle pagine
 * 
 * Permette alle pagine company di configurare il PageHeader
 * senza duplicare il componente in ogni pagina.
 * 
 * **Usage Pattern:**
 * 1. Layout include PageHeaderProvider e PageHeaderRenderer
 * 2. Pagine usano usePageHeader hook per configurare header
 * 3. Header viene automaticamente renderizzato nel layout
 */

"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { LucideIcon } from "lucide-react";
import type { HeaderTab, HeaderButton } from "@/components/layout/PageHeader";

/**
 * Configurazione header da passare dal contesto
 */
interface PageHeaderConfig {
  icon: LucideIcon;
  title: string;
  description: string;
  tabs?: HeaderTab[];
  buttons?: HeaderButton[];
}

/**
 * Context per configurazione header
 */
interface PageHeaderContextType {
  config: PageHeaderConfig | null;
  setConfig: (config: PageHeaderConfig | null) => void;
}

const PageHeaderContext = createContext<PageHeaderContextType | undefined>(undefined);

/**
 * Provider per il contesto header
 */
export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<PageHeaderConfig | null>(null);
  
  // Stabilizza setConfig per evitare re-renders
  const stableSetConfig = useCallback((newConfig: PageHeaderConfig | null) => {
    setConfig(newConfig);
  }, []);

  return (
    <PageHeaderContext.Provider value={{ config, setConfig: stableSetConfig }}>
      {children}
    </PageHeaderContext.Provider>
  );
}

/**
 * Hook per configurare l'header dalle pagine
 */
export function usePageHeader(config: PageHeaderConfig | null) {
  const context = useContext(PageHeaderContext);
  
  if (!context) {
    throw new Error('usePageHeader must be used within PageHeaderProvider');
  }

  React.useEffect(() => {
    context.setConfig(config);
    
    // Cleanup quando il componente si smonta
    return () => {
      context.setConfig(null);
    };
  }, [config, context.setConfig]); // Aggiungiamo context.setConfig che è stabile
}

/**
 * Hook per accedere direttamente al context (per PageHeaderRenderer)
 */
export function usePageHeaderContext() {
  return useContext(PageHeaderContext);
}

export default PageHeaderProvider;