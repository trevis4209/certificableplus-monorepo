/**
 * SidebarContext - Gestione stato sidebar globale
 * 
 * Centralizza la gestione dello stato della sidebar per tutti i layout,
 * con supporto per persistenza localStorage e performance ottimizzate.
 * 
 * **Features:**
 * - Stato sidebar condiviso tra componenti
 * - Persistenza stato in localStorage
 * - Responsive behavior ottimizzato
 * - Performance con memoization
 * - TypeScript type safety
 */

"use client";

import React, { 
  createContext, 
  useContext, 
  useState, 
  useCallback, 
  useEffect, 
  ReactNode,
  useMemo 
} from "react";
import { useHydration } from "./useHydration";

/**
 * Stato sidebar interface
 */
interface SidebarState {
  isOpen: boolean;
  isPersistent: boolean; // Se deve persistere in localStorage
  isMobile: boolean; // Se è in modalità mobile
}

/**
 * Context type per sidebar
 */
export interface SidebarContextType {
  // State
  state: SidebarState;
  
  // Actions
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  setMobileMode: (isMobile: boolean) => void;
  
  // Computed values
  shouldShowOverlay: boolean;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

/**
 * Props per SidebarProvider
 */
interface SidebarProviderProps {
  children: ReactNode;
  defaultOpen?: boolean;
  persistKey?: string; // Chiave per localStorage
}

/**
 * SidebarProvider - Provider per gestione sidebar
 */
export function SidebarProvider({ 
  children, 
  defaultOpen = true,
  persistKey = "sidebar-state" 
}: SidebarProviderProps) {
  
  // Hook per gestire hydration mismatch
  const hydrated = useHydration();
  
  // Stato interno - inizializzato senza localStorage per evitare hydration mismatch
  const [state, setState] = useState<SidebarState>({
    isOpen: defaultOpen,
    isPersistent: true,
    isMobile: false
  });

  // Effetto per caricamento da localStorage dopo hydration
  useEffect(() => {
    if (!hydrated) return;
    
    // Carica stato da localStorage dopo hydration
    const savedState = localStorage.getItem(persistKey);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setState(prev => ({
          ...prev,
          isOpen: parsed.isOpen ?? defaultOpen
        }));
      } catch {
        // Ignora errori di parsing
      }
    }
  }, [hydrated, persistKey, defaultOpen]);

  // Persistenza in localStorage (solo dopo hydration)
  useEffect(() => {
    if (hydrated && state.isPersistent) {
      localStorage.setItem(persistKey, JSON.stringify({
        isOpen: state.isOpen
      }));
    }
  }, [hydrated, state.isOpen, state.isPersistent, persistKey]);

  // Actions ottimizzate con useCallback
  const openSidebar = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: true }));
  }, []);

  const closeSidebar = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const toggleSidebar = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: !prev.isOpen }));
  }, []);

  const setMobileMode = useCallback((isMobile: boolean) => {
    setState(prev => ({ 
      ...prev, 
      isMobile,
      // Su mobile, chiudi sidebar di default per UX migliore
      isOpen: isMobile ? false : prev.isOpen
    }));
  }, []);

  // Computed values
  const shouldShowOverlay = state.isMobile && state.isOpen;

  // Valore del context memoizzato per performance
  const contextValue = useMemo<SidebarContextType>(() => ({
    state,
    openSidebar,
    closeSidebar,
    toggleSidebar,
    setMobileMode,
    shouldShowOverlay
  }), [
    state,
    openSidebar,
    closeSidebar,
    toggleSidebar,
    setMobileMode,
    shouldShowOverlay
  ]);

  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  );
}

/**
 * Hook per accedere al sidebar context
 */
export function useSidebar() {
  const context = useContext(SidebarContext);
  
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  
  return context;
}

/**
 * Hook per responsive behavior automatico
 */
export function useSidebarResponsive() {
  const { setMobileMode } = useSidebar();

  useEffect(() => {
    // Check che siamo nel browser
    if (typeof window === 'undefined') return;
    
    const checkMobile = () => {
      const isMobile = window.innerWidth < 768; // md breakpoint
      setMobileMode(isMobile);
    };

    // Check iniziale
    checkMobile();

    // Listener per resize
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [setMobileMode]);
}

export default SidebarProvider;