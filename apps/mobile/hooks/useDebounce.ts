// Hook per il debouncing dei valori di input
// Ottimizza le performance riducendo le operazioni durante la digitazione

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook per il debouncing di un valore
 * @param value - Il valore da debounce
 * @param delay - Il ritardo in millisecondi
 * @returns Il valore debouncato
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook per il debouncing di callback
 * @param callback - La funzione da debounce
 * @param delay - Il ritardo in millisecondi
 * @param deps - Le dipendenze del callback
 * @returns La funzione debouncata
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay, ...deps]
  ) as T;

  // Cleanup timeout quando il componente viene unmountato
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

/**
 * Hook per input debouncati con validazione
 * @param initialValue - Il valore iniziale
 * @param delay - Il ritardo in millisecondi
 * @param validator - Funzione di validazione opzionale
 * @returns Oggetto con valore, setValue, debouncedValue, isValid, error
 */
export function useDebouncedInput(
  initialValue: string = '',
  delay: number = 300,
  validator?: (value: string) => string | null
) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const debouncedValue = useDebounce(value, delay);

  // Validazione del valore debouncato
  useEffect(() => {
    if (validator && debouncedValue !== '') {
      const validationError = validator(debouncedValue);
      setError(validationError);
    } else {
      setError(null);
    }
  }, [debouncedValue, validator]);

  const handleChange = useCallback((newValue: string) => {
    setValue(newValue);
    // Cancella immediatamente l'errore quando l'utente inizia a digitare
    if (error) {
      setError(null);
    }
  }, [error]);

  return {
    value,
    setValue: handleChange,
    debouncedValue,
    isValid: error === null,
    error,
    reset: useCallback(() => {
      setValue(initialValue);
      setError(null);
    }, [initialValue])
  };
}

/**
 * Hook per form search con debouncing
 * @param searchFunction - Funzione di ricerca asincrona
 * @param delay - Il ritardo in millisecondi
 * @returns Oggetto con query, setQuery, results, isLoading, error
 */
export function useDebouncedSearch<T>(
  searchFunction: (query: string) => Promise<T[]>,
  delay: number = 500
) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const debouncedQuery = useDebounce(query, delay);
  const searchIdRef = useRef<number>(0);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    const currentSearchId = ++searchIdRef.current;
    setIsLoading(true);
    setError(null);

    searchFunction(debouncedQuery)
      .then((searchResults) => {
        // Verifica che questa sia ancora la ricerca più recente
        if (currentSearchId === searchIdRef.current) {
          setResults(searchResults);
          setIsLoading(false);
        }
      })
      .catch((searchError) => {
        if (currentSearchId === searchIdRef.current) {
          setError(searchError.message || 'Errore nella ricerca');
          setResults([]);
          setIsLoading(false);
        }
      });
  }, [debouncedQuery, searchFunction]);

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    clearResults: useCallback(() => {
      setResults([]);
      setQuery('');
      setError(null);
    }, [])
  };
}