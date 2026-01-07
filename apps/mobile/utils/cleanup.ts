// Utilità per la gestione della memoria e cleanup
// Previene memory leaks e gestisce il cleanup corretto dei componenti

import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook per gestire cleanup di timeout
 */
export const useTimeout = () => {
  const timeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  const addTimeout = useCallback((callback: () => void, delay: number): ReturnType<typeof setTimeout> => {
    const timeoutId = setTimeout(() => {
      callback();
      timeoutsRef.current.delete(timeoutId);
    }, delay);

    timeoutsRef.current.add(timeoutId);
    return timeoutId;
  }, []);

  const clearTimeout = useCallback((timeoutId: ReturnType<typeof setTimeout>) => {
    window.clearTimeout(timeoutId);
    timeoutsRef.current.delete(timeoutId);
  }, []);

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(id => window.clearTimeout(id));
    timeoutsRef.current.clear();
  }, []);

  // Cleanup automatico quando il componente viene unmountato
  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, [clearAllTimeouts]);

  return {
    addTimeout,
    clearTimeout,
    clearAllTimeouts,
  };
};

/**
 * Hook per gestire cleanup di interval
 */
export const useInterval = () => {
  const intervalsRef = useRef<Set<ReturnType<typeof setInterval>>>(new Set());

  const addInterval = useCallback((callback: () => void, delay: number): ReturnType<typeof setInterval> => {
    const intervalId = setInterval(callback, delay);
    intervalsRef.current.add(intervalId);
    return intervalId;
  }, []);

  const clearInterval = useCallback((intervalId: ReturnType<typeof setInterval>) => {
    window.clearInterval(intervalId);
    intervalsRef.current.delete(intervalId);
  }, []);

  const clearAllIntervals = useCallback(() => {
    intervalsRef.current.forEach(id => window.clearInterval(id));
    intervalsRef.current.clear();
  }, []);

  // Cleanup automatico quando il componente viene unmountato
  useEffect(() => {
    return () => {
      clearAllIntervals();
    };
  }, [clearAllIntervals]);

  return {
    addInterval,
    clearInterval,
    clearAllIntervals,
  };
};

/**
 * Hook per gestire listener di eventi
 */
export const useEventListeners = () => {
  const listenersRef = useRef<Array<{
    element: EventTarget;
    event: string;
    handler: EventListener;
  }>>([]);

  const addEventListener = useCallback((
    element: EventTarget,
    event: string,
    handler: EventListener,
    options?: AddEventListenerOptions
  ) => {
    element.addEventListener(event, handler, options);
    listenersRef.current.push({ element, event, handler });
  }, []);

  const removeEventListener = useCallback((
    element: EventTarget,
    event: string,
    handler: EventListener
  ) => {
    element.removeEventListener(event, handler);
    listenersRef.current = listenersRef.current.filter(
      listener => !(listener.element === element && listener.event === event && listener.handler === handler)
    );
  }, []);

  const removeAllEventListeners = useCallback(() => {
    listenersRef.current.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    listenersRef.current = [];
  }, []);

  // Cleanup automatico quando il componente viene unmountato
  useEffect(() => {
    return () => {
      removeAllEventListeners();
    };
  }, [removeAllEventListeners]);

  return {
    addEventListener,
    removeEventListener,
    removeAllEventListeners,
  };
};

/**
 * Hook per gestire promise in corso e prevenire aggiornamenti dopo unmount
 */
export const useAsyncOperations = () => {
  const isMountedRef = useRef(true);
  const pendingOperationsRef = useRef<Set<Promise<any>>>(new Set());

  // Segna il componente come unmounted quando necessario
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const safeAsyncOperation = useCallback(<T>(
    asyncOperation: () => Promise<T>
  ): Promise<T> => {
    return new Promise<T>((resolve, reject) => {
      const operation = asyncOperation();
      pendingOperationsRef.current.add(operation);

      operation
        .then((result) => {
          if (isMountedRef.current) {
            resolve(result);
          }
        })
        .catch((error) => {
          if (isMountedRef.current) {
            reject(error);
          }
        })
        .finally(() => {
          pendingOperationsRef.current.delete(operation);
        });
    });
  }, []);

  const cancelAllOperations = useCallback(() => {
    // Non possiamo cancellare le promise direttamente,
    // ma possiamo impedire che risolvano aggiornando isMountedRef
    isMountedRef.current = false;
    pendingOperationsRef.current.clear();
  }, []);

  const isMounted = useCallback(() => {
    return isMountedRef.current;
  }, []);

  return {
    safeAsyncOperation,
    cancelAllOperations,
    isMounted,
    pendingOperationsCount: () => pendingOperationsRef.current.size,
  };
};

/**
 * Hook per gestire subscription e observer
 */
export const useSubscriptions = () => {
  const subscriptionsRef = useRef<Array<() => void>>([]);

  const addSubscription = useCallback((unsubscribe: () => void) => {
    subscriptionsRef.current.push(unsubscribe);
  }, []);

  const removeSubscription = useCallback((unsubscribe: () => void) => {
    subscriptionsRef.current = subscriptionsRef.current.filter(sub => sub !== unsubscribe);
  }, []);

  const unsubscribeAll = useCallback(() => {
    subscriptionsRef.current.forEach(unsubscribe => {
      try {
        unsubscribe();
      } catch (error) {
        console.warn('Errore durante unsubscribe:', error);
      }
    });
    subscriptionsRef.current = [];
  }, []);

  // Cleanup automatico quando il componente viene unmountato
  useEffect(() => {
    return () => {
      unsubscribeAll();
    };
  }, [unsubscribeAll]);

  return {
    addSubscription,
    removeSubscription,
    unsubscribeAll,
  };
};

/**
 * Hook composito per gestire tutto il cleanup in un componente
 */
export const useComponentCleanup = () => {
  const timeouts = useTimeout();
  const intervals = useInterval();
  const eventListeners = useEventListeners();
  const asyncOps = useAsyncOperations();
  const subscriptions = useSubscriptions();

  const cleanupAll = useCallback(() => {
    timeouts.clearAllTimeouts();
    intervals.clearAllIntervals();
    eventListeners.removeAllEventListeners();
    asyncOps.cancelAllOperations();
    subscriptions.unsubscribeAll();
  }, [
    timeouts.clearAllTimeouts,
    intervals.clearAllIntervals,
    eventListeners.removeAllEventListeners,
    asyncOps.cancelAllOperations,
    subscriptions.unsubscribeAll,
  ]);

  // Cleanup globale quando il componente viene unmountato
  useEffect(() => {
    return () => {
      cleanupAll();
    };
  }, [cleanupAll]);

  return {
    timeouts,
    intervals,
    eventListeners,
    asyncOperations: asyncOps,
    subscriptions,
    cleanupAll,
  };
};

/**
 * Hook specifico per il cleanup del router nel scanner
 */
export const useRouterCleanup = (operation: string | undefined, router: any) => {
  const cleanupTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => {
      // Cleanup del timeout esistente
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
      }

      // Gestione sicura del router replace
      if (operation) {
        cleanupTimeoutRef.current = setTimeout(() => {
          try {
            router.replace('/scanner');
          } catch (error) {
            console.warn('Errore nel cleanup del router:', error);
          }
        }, 10);
      }
    };
  }, [operation, router]);

  // Cleanup esplicito quando necessario
  const cleanupRouter = useCallback(() => {
    if (cleanupTimeoutRef.current) {
      clearTimeout(cleanupTimeoutRef.current);
      cleanupTimeoutRef.current = undefined;
    }
  }, []);

  return { cleanupRouter };
};

/**
 * Utilità per monitorare memory leaks in sviluppo
 */
export const useMemoryLeakDetection = (componentName: string) => {
  const mountCountRef = useRef(0);
  const unmountCountRef = useRef(0);

  useEffect(() => {
    mountCountRef.current++;
    console.log(`🟢 ${componentName} mounted (#${mountCountRef.current})`);

    return () => {
      unmountCountRef.current++;
      console.log(`🔴 ${componentName} unmounted (#${unmountCountRef.current})`);

      // Avviso se ci sono più mount che unmount
      if (mountCountRef.current > unmountCountRef.current + 1) {
        console.warn(`⚠️ Potential memory leak in ${componentName}: ${mountCountRef.current} mounts vs ${unmountCountRef.current} unmounts`);
      }
    };
  }, [componentName]);

  return {
    getMountCount: () => mountCountRef.current,
    getUnmountCount: () => unmountCountRef.current,
  };
};