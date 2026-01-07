// Utilità per la memoization e ottimizzazione delle performance
// Cache per operazioni costose e lookup frequenti

import { useMemo, useRef, useCallback } from 'react';
import { Product } from '../types/scanner';

/**
 * Cache LRU (Least Recently Used) per memoizzare risultati
 */
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Sposta alla fine (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      // Aggiorna il valore esistente
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Rimuovi il primo (least recently used)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Cache globale per i prodotti
const productCache = new LRUCache<string, Product | null>(50);
const employeePermissionsCache = new LRUCache<string, string[]>(20);

/**
 * Hook per memoizzare lookup di prodotti
 */
export const useProductLookup = () => {
  return useCallback((qrCode: string, products: Product[]): Product | null => {
    // Controlla la cache prima
    if (productCache.has(qrCode)) {
      return productCache.get(qrCode)!;
    }

    // Cerca nel database e cache il risultato
    const product = products.find(p => p.qr_code === qrCode) || null;
    productCache.set(qrCode, product);
    
    return product;
  }, []);
};

/**
 * Hook per memoizzare validazioni di form
 */
export const useValidationMemoization = () => {
  const validationCache = useRef(new Map<string, { isValid: boolean; errors: any }>());

  return useCallback((formDataHash: string, validator: () => { isValid: boolean; errors: any }) => {
    if (validationCache.current.has(formDataHash)) {
      return validationCache.current.get(formDataHash)!;
    }

    const result = validator();
    validationCache.current.set(formDataHash, result);
    
    // Mantieni la cache sotto controllo
    if (validationCache.current.size > 10) {
      const firstKey = validationCache.current.keys().next().value;
      validationCache.current.delete(firstKey);
    }

    return result;
  }, []);
};

/**
 * Crea un hash semplice per i dati del form
 */
export const createFormDataHash = (formData: Record<string, any>): string => {
  return Object.entries(formData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${value}`)
    .join('|');
};

/**
 * Hook per memoizzare ricerche di permessi
 */
export const useEmployeePermissionsMemo = () => {
  return useCallback((qrCode: string, getPermissions: (qr: string) => string[]): string[] => {
    if (employeePermissionsCache.has(qrCode)) {
      return employeePermissionsCache.get(qrCode)!;
    }

    const permissions = getPermissions(qrCode);
    employeePermissionsCache.set(qrCode, permissions);
    
    return permissions;
  }, []);
};

/**
 * Hook per memoizzare calcoli complessi
 */
export const useComputationMemo = <T, Args extends any[]>(
  computeFn: (...args: Args) => T,
  deps: React.DependencyList
): ((...args: Args) => T) => {
  const cache = useRef(new Map<string, T>());

  return useMemo(() => {
    return (...args: Args): T => {
      const key = JSON.stringify(args);
      
      if (cache.current.has(key)) {
        return cache.current.get(key)!;
      }

      const result = computeFn(...args);
      cache.current.set(key, result);
      
      // Mantieni la cache limitata
      if (cache.current.size > 20) {
        const firstKey = cache.current.keys().next().value;
        cache.current.delete(firstKey);
      }

      return result;
    };
  }, deps);
};

/**
 * Hook per memoizzare componenti pesanti con stabilità delle props
 */
export const useStableMemo = <T>(
  factory: () => T,
  deps: React.DependencyList
): T => {
  const lastDepsRef = useRef<React.DependencyList>();
  const lastResultRef = useRef<T>();

  return useMemo(() => {
    // Confronto profondo delle dipendenze per evitare re-render inutili
    const depsChanged = !lastDepsRef.current || 
      deps.length !== lastDepsRef.current.length ||
      deps.some((dep, index) => !Object.is(dep, lastDepsRef.current![index]));

    if (depsChanged) {
      lastResultRef.current = factory();
      lastDepsRef.current = deps;
    }

    return lastResultRef.current!;
  }, deps);
};

/**
 * Utilità per il debouncing di operazioni costose
 */
export const useExpensiveOperation = <T, Args extends any[]>(
  operation: (...args: Args) => Promise<T>,
  delay: number = 300
) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const cache = useRef(new Map<string, Promise<T>>());

  return useCallback((...args: Args): Promise<T> => {
    const key = JSON.stringify(args);
    
    // Se c'è già una operazione in cache per questi argomenti, ritornala
    if (cache.current.has(key)) {
      return cache.current.get(key)!;
    }

    // Cancella il timeout precedente
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Crea una nuova promise per questa operazione
    const operationPromise = new Promise<T>((resolve, reject) => {
      timeoutRef.current = setTimeout(async () => {
        try {
          const result = await operation(...args);
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          // Rimuovi dalla cache dopo che è completata
          cache.current.delete(key);
        }
      }, delay);
    });

    // Cache la promise
    cache.current.set(key, operationPromise);
    
    return operationPromise;
  }, [operation, delay]);
};

/**
 * Pulisce tutte le cache (utile per test o reset dell'applicazione)
 */
export const clearAllCaches = (): void => {
  productCache.clear();
  employeePermissionsCache.clear();
};

/**
 * Statistiche sulle cache per debugging
 */
export const getCacheStats = () => {
  return {
    productCache: {
      size: productCache.size(),
      maxSize: 50,
    },
    employeePermissionsCache: {
      size: employeePermissionsCache.size(),
      maxSize: 20,
    }
  };
};