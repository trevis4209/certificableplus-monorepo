"use client";

import { useEffect } from "react";

export function PerformanceMonitor() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Monitor bundle sizes and component render times
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            console.log('🔍 Navigation Performance:', {
              domContentLoaded: Math.round(navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart),
              loadComplete: Math.round(navEntry.loadEventEnd - navEntry.loadEventStart),
              ttfb: Math.round(navEntry.responseStart - navEntry.requestStart),
            });
          }

          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            // Log large resources
            if (resourceEntry.transferSize > 100000) { // > 100KB
              console.warn('⚠️ Large Resource:', {
                name: resourceEntry.name.split('/').pop(),
                size: `${Math.round(resourceEntry.transferSize / 1024)}KB`,
                duration: `${Math.round(resourceEntry.duration)}ms`,
              });
            }
          }
        }
      });

      // Observe navigation and resource timing
      observer.observe({ entryTypes: ['navigation', 'resource'] });

      // Memory usage monitoring
      const checkMemoryUsage = () => {
        if ('memory' in performance) {
          const memory = (performance as any).memory;
          const used = Math.round(memory.usedJSHeapSize / 1024 / 1024);
          const total = Math.round(memory.totalJSHeapSize / 1024 / 1024);
          
          if (used > 50) { // Alert if using > 50MB
            console.warn('💾 High Memory Usage:', `${used}MB / ${total}MB`);
          }
        }
      };

      // Check memory every 10 seconds
      const memoryInterval = setInterval(checkMemoryUsage, 10000);

      return () => {
        observer.disconnect();
        clearInterval(memoryInterval);
      };
    }
  }, []);

  return null;
}