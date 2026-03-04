import React, { useState } from 'react';
import { cn } from './ui/utils';

interface CharacterCardProps {
    character: 'sarah' | 'marcus';
    visible: boolean;
}

export function CharacterCard({ character, visible }: CharacterCardProps) {
    const [minimized, setMinimized] = useState(false);

    if (!visible) return null;

    const toggleMinimized = () => setMinimized(!minimized);

    if (character === 'sarah') {
        return (
            <div
                onClick={toggleMinimized}
                className={cn(
                    "fixed top-20 right-4 z-40 bg-card/90 backdrop-blur-sm border border-[#2A2A2A] rounded-[6px] p-3 transition-all duration-200 ease-out cursor-pointer shadow-lg",
                    visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 pointer-events-none",
                    minimized ? "w-auto min-w-0 pb-3" : "w-[200px]"
                )}
            >
                <div className={cn("flex", minimized ? "items-center gap-2" : "flex-col items-start gap-1")}>
                    <div className="flex items-center gap-2">
                        <div className="size-8 rounded-full bg-primary text-background font-display font-black text-[14px] flex items-center justify-center shrink-0">
                            SC
                        </div>
                        <div className={cn("flex flex-col", minimized && "mt-0.5")}>
                            <span className="font-display font-bold text-sm text-foreground leading-none">Sarah, 28</span>
                            <span className={cn("font-mono text-[11px] text-muted-foreground mt-0.5", minimized && "hidden")}>Designer · Mumbai</span>
                        </div>
                    </div>

                    {!minimized && (
                        <div className="mt-2 space-y-1.5 w-full">
                            <p className="font-mono text-[11px] text-[#FF4D4D]">
                                ₹3,200/mo on subscriptions 😵
                            </p>
                            <p className="font-mono text-[10px] text-muted-foreground border-t border-[#2A2A2A] pt-1.5 mt-1">
                                Looking for Netflix at ₹162/slot
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (character === 'marcus') {
        return (
            <div
                onClick={toggleMinimized}
                className={cn(
                    "fixed top-20 right-4 z-40 bg-card/90 backdrop-blur-sm border border-[#2A2A2A] rounded-[6px] p-3 transition-all duration-200 ease-out cursor-pointer shadow-lg",
                    visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 pointer-events-none",
                    minimized ? "w-auto min-w-0 pb-3" : "w-[200px]"
                )}
            >
                <div className={cn("flex", minimized ? "items-center gap-2" : "flex-col items-start gap-1")}>
                    <div className="flex items-center gap-2">
                        <div className="size-8 rounded-full bg-[#0D4F3C] text-[#4DFF91] font-display font-black text-[14px] flex items-center justify-center shrink-0">
                            MK
                        </div>
                        <div className={cn("flex flex-col", minimized && "mt-0.5")}>
                            <span className="font-display font-bold text-sm text-foreground leading-none">Marcus, 32</span>
                            <span className={cn("font-mono text-[11px] text-muted-foreground mt-0.5", minimized && "hidden")}>Developer · Bangalore</span>
                        </div>
                    </div>

                    {!minimized && (
                        <div className="mt-2 space-y-1.5 w-full">
                            <p className="font-mono text-[11px] text-primary">
                                Collecting ₹1,497/mo from 3 members 📈
                            </p>
                            <p className="font-mono text-[10px] text-[#4DFF91] border-t border-[#2A2A2A] pt-1.5 mt-1">
                                His net: ₹−848/mo
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return null;
}
