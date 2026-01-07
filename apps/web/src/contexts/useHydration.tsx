/**
 * useHydration - Hook per gestire l'hydration mismatch
 * 
 * Evita errori di hydration fornendo un flag che indica
 * se il componente è stato hydrated sul client.
 */

"use client";

import { useEffect, useState } from "react";

/**
 * Hook per detectare quando il component è stato hydrated
 * 
 * Utile per evitare hydration mismatch quando si accede
 * a APIs browser-only come localStorage, window, document.
 * 
 * @returns boolean - true dopo che il component è stato hydrated sul client
 */
export function useHydration() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}

/**
 * Hook per gestire valori che differiscono tra server e client
 * 
 * @param serverValue - Valore utilizzato durante il server rendering
 * @param clientValue - Valore utilizzato dopo l'hydration
 * @returns Il valore appropriato basato sullo stato di hydration
 */
export function useHydrationValue<T>(serverValue: T, clientValue: T): T {
  const hydrated = useHydration();
  return hydrated ? clientValue : serverValue;
}

export default useHydration;