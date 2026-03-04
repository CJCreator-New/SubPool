import { useState, useEffect } from 'react';

export function useCountUp(target: number, duration: number = 1200, active: boolean = true): number {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!active || reducedMotion) {
            setCount(target);
            return;
        }

        let startTime: number | null = null;
        let animationFrameId: number;

        const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percent = Math.min(progress / duration, 1);

            const currentVal = target * easeOutCubic(percent);
            setCount(currentVal);

            if (percent < 1) {
                animationFrameId = requestAnimationFrame(animate);
            } else {
                setCount(target);
            }
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrameId);
    }, [target, duration, active]);

    return count;
}
