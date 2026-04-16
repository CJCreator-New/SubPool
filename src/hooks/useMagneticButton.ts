import { useRef, useState, useEffect } from 'react';

export function useMagneticButton(strength: number = 0.3, active: boolean = true) {
    const ref = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (!active || !ref.current) return;

        const element = ref.current;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = element.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dist = Math.sqrt(Math.pow(e.clientX - cx, 2) + Math.pow(e.clientY - cy, 2));

            if (dist < 60) {
                const dx = (e.clientX - cx) * strength;
                const dy = (e.clientY - cy) * strength;
                setPosition({ x: dx, y: dy });
            } else {
                setPosition({ x: 0, y: 0 });
            }
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [strength, active]);

    return {
        ref,
        style: active ? {
            transform: `translate(${position.x}px, ${position.y}px)`,
            transition: position.x === 0 && position.y === 0 ? 'transform 0.15s ease-out' : 'transform 0s'
        } : {}
    };
}
