import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { cn } from './ui/utils';

interface BeforeAfterSliderProps {
    leftLabel: string;
    leftContent: React.ReactNode;
    rightContent: React.ReactNode;
    rightLabel: string;
    className?: string;
}

export function BeforeAfterSlider({
    leftLabel,
    leftContent,
    rightContent,
    rightLabel,
    className
}: BeforeAfterSliderProps) {
    const [position, setPosition] = useState(50);
    const [dragging, setDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMove = (clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const pct = ((clientX - rect.left) / rect.width) * 100;
        setPosition(Math.max(10, Math.min(90, pct)));
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (dragging) handleMove(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
        if (dragging) handleMove(e.touches[0].clientX);
    };

    const handleMouseUp = () => setDragging(false);

    useEffect(() => {
        if (dragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.addEventListener('touchmove', handleTouchMove, { passive: false });
            document.addEventListener('touchend', handleMouseUp);
        } else {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleMouseUp);
        };
    }, [dragging]);

    return (
        <div
            ref={containerRef}
            className={cn(
                "relative overflow-hidden rounded-[8px] w-full min-h-[200px]",
                dragging && "select-none",
                className
            )}
            onMouseDown={() => setDragging(true)}
            onTouchStart={() => setDragging(true)}
        >
            {/* RIGHT half (bottom layer) */}
            <div
                className="absolute inset-0 bg-primary/5 border-l border-primary/20"
            >
                <div className="absolute top-3 right-3 font-mono text-[10px] text-primary uppercase select-none z-10">
                    {rightLabel}
                </div>
                <div className="absolute inset-0 p-6 pt-10">
                    {rightContent}
                </div>
            </div>

            {/* LEFT half (clipped layer) */}
            <div
                className="absolute left-0 top-0 bottom-0 bg-[#1A0000] border-r border-[#FF4D4D]/20 overflow-hidden shadow-[2px_0_12px_rgba(0,0,0,0.5)] z-10"
                style={{ width: `${position}%` }}
            >
                <div className="absolute inset-0 w-full whitespace-nowrap">
                    {/* The width of this inner wrapper must match the container's full width
                       so the left content doesn't reposition/squish, but simply gets clipped.
                       Using min-w-[max(100%, ...)] or forcing the width via ref is needed if responsive.
                       For simplicity, we'll use a hack or assume container width is known, 
                       but standard before/after sliders set an explicit width to the inner child matching the parent.
                   */}
                    <div className="absolute inset-0" style={{ width: containerRef.current?.offsetWidth || '100vw' }}>
                        <div className="absolute top-3 left-3 font-mono text-[10px] text-[#FF4D4D] uppercase select-none z-10">
                            {leftLabel}
                        </div>
                        <div className="absolute inset-0 p-6 pt-10">
                            {leftContent}
                        </div>
                    </div>
                </div>
            </div>

            {/* DIVIDER (drag handle) */}
            <div
                className="absolute top-0 bottom-0 z-20"
                style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
            >
                <div className="w-[2px] h-full bg-white/40 cursor-ew-resize absolute left-1/2 -translate-x-1/2" />

                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-[#2A2A2A] shadow-lg hover:scale-110 active:scale-95 transition-transform text-[#0E0E0E]"
                    style={{ cursor: dragging ? 'grabbing' : 'grab' }}
                >
                    <ArrowLeftRight className="size-4" strokeWidth={2.5} />
                </div>
            </div>
        </div>
    );
}
