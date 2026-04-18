import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { cn } from '../lib/ui/utils';

interface PremiumCardProps {
    children: React.ReactNode;
    className?: string;
    hoverLift?: boolean;
    flareColor?: string;
}

export function PremiumCard({ 
    children, 
    className, 
    hoverLift = true,
    flareColor = 'rgba(200, 241, 53, 0.15)' 
}: PremiumCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    
    // Mouse tracking for flare
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Tilt effects
    const rotateX = useSpring(useTransform(mouseY, [-100, 100], [5, -5]), { stiffness: 150, damping: 20 });
    const rotateY = useSpring(useTransform(mouseX, [-100, 100], [-5, 5]), { stiffness: 150, damping: 20 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        mouseX.set(e.clientX - centerX);
        mouseY.set(e.clientY - centerY);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    return (
        <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX: hoverLift ? rotateX : 0,
                rotateY: hoverLift ? rotateY : 0,
                transformStyle: 'preserve-3d',
            }}
            whileHover={hoverLift ? { y: -5, transition: { duration: 0.2 } } : {}}
            className={cn(
                "relative group rounded-3xl border border-white/5 bg-transparent overflow-hidden glass-premium",
                className
            )}
        >
            {/* Dynamic Flare Overlay */}
            <motion.div
                className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                    background: useTransform(
                        [mouseX, mouseY],
                        ([x, y]) => `radial-gradient(600px circle at ${Number(x) + (cardRef.current?.offsetWidth || 0) / 2}px ${Number(y) + (cardRef.current?.offsetHeight || 0) / 2}px, ${flareColor}, transparent 40%)`
                    ),
                }}
            />
            
            {/* Inner Content */}
            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
}

export function MagneticButton({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springX = useSpring(mouseX, { stiffness: 150, damping: 15 });
    const springY = useSpring(mouseY, { stiffness: 150, damping: 15 });

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!buttonRef.current) return;
        const { left, top, width, height } = buttonRef.current.getBoundingClientRect();
        const x = e.clientX - (left + width / 2);
        const y = e.clientY - (top + height / 2);
        mouseX.set(x * 0.4);
        mouseY.set(y * 0.4);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    return (
        <motion.button
            ref={buttonRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            style={{ x: springX, y: springY }}
            className={cn("relative transition-colors", className)}
        >
            {children}
        </motion.button>
    );
}
