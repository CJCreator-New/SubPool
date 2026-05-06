import { useEffect } from 'react';

/**
 * Utility hook to monitor component performance and log slow renders in development.
 */
export function usePerformanceAudit(componentName: string) {
    useEffect(() => {
        if (process.env.NODE_ENV !== 'development') return;

        const startTime = performance.now();

        return () => {
            const endTime = performance.now();
            const duration = endTime - startTime;

            if (duration > 16.67) { // Longer than 1 frame (60fps)
                console.warn(
                    `%c[Performance Audit] %c${componentName} render took %c${duration.toFixed(2)}ms`,
                    'color: #C8F135; font-weight: bold;',
                    'color: inherit;',
                    duration > 50 ? 'color: #ff4d4d; font-weight: bold;' : 'color: #ffa500;'
                );
            }
        };
    });
}
