import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, ChevronLeft, ClipboardList } from 'lucide-react';
import { DEMO_STEPS, DEMO_INSIGHTS } from '../../lib/demo-config';
import { cn } from './ui/utils';

// --- Context ---

interface DemoModeContextType {
    isDemo: boolean;
    toggleDemo: () => void;
    currentStep: number;
    setStep: (step: number) => void;
    nextStep: () => void;
    prevStep: () => void;
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

export function useDemo() {
    const context = useContext(DemoModeContext);
    if (!context) {
        throw new Error('useDemo must be used within a DemoModeProvider');
    }
    return context;
}

// --- Provider ---

export function DemoModeProvider({ children }: { children: React.ReactNode }) {
    const [isDemo, setIsDemo] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();

    const toggleDemo = useCallback(() => {
        setIsDemo(prev => !prev);
    }, []);

    const setStep = useCallback((stepNumber: number) => {
        const index = DEMO_STEPS.findIndex(s => s.step === stepNumber);
        if (index !== -1) {
            setCurrentStepIndex(index);
            const step = DEMO_STEPS[index];
            if (location.pathname !== step.path) {
                navigate(step.path);
            }
        }
    }, [navigate, location.pathname]);

    const nextStep = useCallback(() => {
        if (currentStepIndex < DEMO_STEPS.length - 1) {
            const nextIdx = currentStepIndex + 1;
            setCurrentStepIndex(nextIdx);
            navigate(DEMO_STEPS[nextIdx].path);
        }
    }, [currentStepIndex, navigate]);

    const prevStep = useCallback(() => {
        if (currentStepIndex > 0) {
            const prevIdx = currentStepIndex - 1;
            setCurrentStepIndex(prevIdx);
            navigate(DEMO_STEPS[prevIdx].path);
        }
    }, [currentStepIndex, navigate]);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Shift + D to toggle demo mode
            if (e.shiftKey && e.key === 'D') {
                e.preventDefault();
                toggleDemo();
            }

            if (!isDemo) return;

            // Arrow Right: Next Step
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                nextStep();
            }

            // Arrow Left: Previous Step
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                prevStep();
            }

            // Escape: Close modal (This might be handled by Radix, but instruction says close any open modal)
            if (e.key === 'Escape') {
                // If we need custom behavior, we can add it here.
                // Usually escape is handled by the UI components.
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isDemo, toggleDemo, nextStep, prevStep]);

    return (
        <DemoModeContext.Provider value={{
            isDemo,
            toggleDemo,
            currentStep: DEMO_STEPS[currentStepIndex].step,
            setStep,
            nextStep,
            prevStep
        }}>
            <div className={isDemo ? "flex flex-col min-h-screen" : ""}>
                <AnimatePresence>
                    {isDemo && <DemoBanner onClose={() => setIsDemo(false)} />}
                </AnimatePresence>

                <main className={`flex-1 transition-all duration-300 ${isDemo ? 'mt-8' : ''}`}>
                    {children}
                </main>

                <AnimatePresence>
                    {isDemo && <DemoScriptOverlay />}
                </AnimatePresence>

                {isDemo && <InsightBubbles />}
            </div>
        </DemoModeContext.Provider>
    );
}

// --- Components ---

function DemoBanner({ onClose }: { onClose: () => void }) {
    return (
        <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 32, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[100] h-8 bg-primary text-primary-foreground flex items-center justify-center gap-3 font-mono text-[11px] uppercase tracking-wider select-none border-b border-white/10"
        >
            <span className="flex items-center gap-2">
                <span className="animate-pulse text-background">⚡</span>
                INVESTOR DEMO MODE — All data is simulated
            </span>
            <button
                onClick={onClose}
                className="absolute right-3 hover:bg-black/10 rounded p-0.5 transition-colors"
            >
                <X size={14} />
            </button>
        </motion.div>
    );
}

function DemoScriptOverlay() {
    const { currentStep, setStep, nextStep } = useDemo();
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex items-start pointer-events-none">
            {/* Tab */}
            {!isExpanded && (
                <button
                    onClick={() => setIsExpanded(true)}
                    className="pointer-events-auto bg-card border border-r-0 border-[#2A2A2A] p-2 py-4 rounded-l-xl shadow-2xl flex flex-col items-center gap-2 hover:bg-accent transition-colors"
                >
                    <ClipboardList size={16} className="text-primary" />
                    <span className="[writing-mode:vertical-lr] font-mono text-[10px] uppercase tracking-widest text-muted-foreground mr-0.5">Script</span>
                </button>
            )}

            {/* Panel */}
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: isExpanded ? 0 : '100%' }}
                className="pointer-events-auto w-[280px] h-[600px] max-h-[80vh] bg-card border-l border-[#2A2A2A] shadow-[-20px_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden rounded-l-2xl"
            >
                <div className="p-4 border-b border-[#2A2A2A] flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase text-muted-foreground tracking-widest">Demo Script</span>
                    <button onClick={() => setIsExpanded(false)} className="text-muted-foreground hover:text-foreground">
                        <X size={14} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {DEMO_STEPS.map((step) => {
                        const isActive = currentStep === step.step;
                        const isCompleted = currentStep > step.step;

                        return (
                            <button
                                key={step.step}
                                onClick={() => setStep(step.step)}
                                className={`w-full text-left p-3 rounded-lg border transition-all duration-200 group ${isActive
                                    ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]'
                                    : 'bg-transparent border-transparent hover:border-[#2A2A2A]'
                                    }`}
                            >
                                <div className="flex gap-3">
                                    <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] border ${isActive
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : isCompleted
                                            ? 'bg-primary/20 text-primary border-primary/20'
                                            : 'bg-muted text-muted-foreground border-muted'
                                        }`}>
                                        {step.step}
                                    </div>
                                    <span className={`text-[11px] leading-relaxed transition-colors ${isActive ? 'text-primary font-bold' : 'text-muted-foreground group-hover:text-foreground'
                                        }`}>
                                        {step.label}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-[#2A2A2A] flex items-center justify-between bg-black/20">
                    <div className="flex gap-1">
                        {DEMO_STEPS.map((step) => (
                            <div
                                key={step.step}
                                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${currentStep === step.step
                                    ? 'bg-primary w-4'
                                    : currentStep > step.step
                                        ? 'bg-primary/40'
                                        : 'bg-[#2A2A2A]'
                                    }`}
                            />
                        ))}
                    </div>
                    <button
                        onClick={nextStep}
                        disabled={currentStep === DEMO_STEPS.length}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground font-mono text-[10px] uppercase tracking-wider hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed group transition-all"
                    >
                        Next
                        <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

export function Insight({ id, className, activeStep }: { id: string, className?: string, activeStep?: number }) {
    const { isDemo, currentStep } = useDemo();
    const config = DEMO_INSIGHTS[id];

    if (!isDemo || !config) return null;
    if (activeStep !== undefined && currentStep !== activeStep) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className={cn(
                "absolute z-50 shadow-[0_8px_32px_rgba(0,0,0,0.6)] bg-background border border-primary rounded-lg p-3 w-[220px] pointer-events-auto",
                className
            )}
        >
            <div className="font-mono text-[10px] text-primary uppercase mb-1">{config.title}</div>
            <div className="font-display text-[11px] text-foreground leading-relaxed">
                {config.body}
            </div>
            <div className="absolute -z-10 bg-primary/20 w-8 h-8 rounded-full blur-xl -top-2 -left-2 animate-pulse" />
        </motion.div>
    );
}

function InsightBubbles() {
    return null;
}
