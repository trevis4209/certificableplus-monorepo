"use client";

import { useReportWebVitals } from "next/web-vitals";

export function WebVitalsTracker() {
  useReportWebVitals((metric) => {
    // Log performance metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 Web Vitals:', {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        id: metric.id,
      });
    }

    // Send to analytics in production (example implementations)
    if (process.env.NODE_ENV === 'production') {
      // Google Analytics 4
      if (typeof window !== 'undefined' && 'gtag' in window) {
        (window as any).gtag('event', metric.name, {
          event_category: 'Web Vitals',
          event_label: metric.id,
          value: Math.round(metric.value),
          non_interaction: true,
        });
      }

      // Console log for monitoring
      console.log(`📊 ${metric.name}:`, {
        value: Math.round(metric.value),
        rating: metric.rating,
      });
    }
  });

  return null;
}