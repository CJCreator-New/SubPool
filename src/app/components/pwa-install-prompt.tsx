import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { cn } from './ui/utils';

export function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            
            // Show the prompt if we haven't dismissed it this session
            const isDismissed = sessionStorage.getItem('pwa-prompt-dismissed');
            if (!isDismissed) {
                // Show after a short delay to not interrupt initial load
                setTimeout(() => setIsVisible(true), 3000);
            }
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        // Show the prompt
        deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        
        // We've used the prompt, and can't use it again, so clear it
        setDeferredPrompt(null);
        setIsVisible(false);
    };

    const handleDismiss = () => {
        setIsVisible(false);
        sessionStorage.setItem('pwa-prompt-dismissed', 'true');
    };

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                className={cn(
                    "fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:w-[380px] z-[60]",
                    "bg-card border border-primary/20 rounded-2xl p-5 shadow-2xl shadow-black/50 backdrop-blur-xl"
                )}
            >
                <div className="flex gap-4">
                    <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-2xl" role="img" aria-label="SubPool App Icon">⚡</span>
                    </div>
                    <div className="flex-1">
                        <h4 className="font-display font-bold text-base text-foreground leading-tight">
                            Install SubPool App
                        </h4>
                        <p className="font-mono text-[11px] text-muted-foreground mt-1 leading-relaxed">
                            Add SubPool to your home screen for faster access and offline subscription management.
                        </p>
                    </div>
                    <button 
                        onClick={handleDismiss}
                        className="size-6 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors"
                        aria-label="Close prompt"
                    >
                        ✕
                    </button>
                </div>

                <div className="mt-4 flex gap-2">
                    <Button 
                        onClick={handleInstall}
                        className="flex-1 h-10 font-display font-bold text-[13px] shadow-lg shadow-primary/20"
                    >
                        Install App
                    </Button>
                    <Button 
                        variant="outline"
                        onClick={handleDismiss}
                        className="flex-1 h-10 font-mono text-[11px] border-border/50"
                    >
                        Maybe Later
                    </Button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
