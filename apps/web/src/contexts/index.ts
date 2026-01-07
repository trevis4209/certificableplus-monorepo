/**
 * Contexts - Barrel exports per tutti i context dell'applicazione
 * 
 * Centralizza tutti gli export dei context per import semplificati
 * e migliore developer experience.
 */

// Main App Context
export { AppProvider, useApp } from "./AppContext";
export type { AppProviderProps } from "./AppContext";

// Sidebar Context
export { 
  SidebarProvider, 
  useSidebar, 
  useSidebarResponsive
} from "./SidebarContext";
export type { SidebarContextType } from "./SidebarContext";

// PageHeader Context
export { 
  PageHeaderProvider, 
  usePageHeader
} from "./PageHeaderContext";

// PageHeader Components e Types
export { 
  PageHeader, 
  PageHeaderRenderer, 
  useHeaderTabs, 
  useHeaderButtons,
  type HeaderTab,
  type HeaderButton 
} from "@/components/layout/PageHeader";

// Hydration utility hook
export { useHydration, useHydrationValue } from "./useHydration";

// Re-export theme provider for convenience
export { useTheme } from "next-themes";