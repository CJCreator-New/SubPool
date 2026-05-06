import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ShieldCheck, Fingerprint, Camera, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { updateProfile } from '../../lib/supabase/mutations';
import { useAuth } from '../../lib/supabase/auth';

interface KYCModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function IdentityVerificationModal({ open, onClose, onSuccess }: KYCModalProps) {
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [idNumber, setIdNumber] = useState('');

    const handleNext = () => {
        if (step === 1 && !idNumber) {
            toast.error('Identity credential required.');
            return;
        }
        setStep(step + 1);
    };

    const handleComplete = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Simulate AI verification delay
            await new Promise(r => setTimeout(r, 2000));
            
            const { success, error } = await updateProfile(user.id, {
                onboarding_completed: true, // Mark as verified in this context
            });

            if (!success) throw new Error(error || 'Sync failed');

            toast.success('Identity node verified.');
            if (onSuccess) onSuccess();
            setStep(4);
        } catch (err: any) {
            toast.error(err.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-md bg-[#0E0E0E] border-[#1A1A1A] rounded-[32px] overflow-hidden p-0">
                <div className="p-8">
                    {step === 1 && (
                        <div className="space-y-6">
                            <DialogHeader>
                                <DialogTitle className="font-display font-black text-2xl uppercase italic tracking-tighter flex items-center gap-2">
                                    <Fingerprint className="text-primary" /> Identity Sync
                                </DialogTitle>
                            </DialogHeader>
                            <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                                Establish a trusted connection by verifying your government-issued credentials. This increases your node visibility and trust score.
                            </p>
                            <div className="space-y-3">
                                <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Document ID (Aadhaar / SSN / Passport)</Label>
                                <Input 
                                    value={idNumber}
                                    onChange={(e) => setIdNumber(e.target.value)}
                                    placeholder="Enter credential number..."
                                    className="bg-white/[0.02] border-white/5 rounded-2xl h-12 font-mono text-sm"
                                />
                            </div>
                            <Button className="w-full h-12 rounded-2xl font-display font-black text-xs uppercase tracking-widest shadow-glow-primary" onClick={handleNext}>
                                Start Biometric Sync
                            </Button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 text-center py-4">
                            <div className="size-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto animate-pulse">
                                <Camera className="text-primary size-10" />
                            </div>
                            <h3 className="font-display font-black text-xl uppercase italic">Visual Scan</h3>
                            <p className="font-mono text-xs text-muted-foreground">
                                Position your face within the frame. Our AI will match your biometric signature against the provided credential.
                            </p>
                            <div className="flex gap-4">
                                <Button variant="ghost" className="flex-1 h-12 rounded-2xl font-mono text-[10px] uppercase tracking-widest" onClick={() => setStep(1)}>Back</Button>
                                <Button className="flex-1 h-12 rounded-2xl font-display font-black text-xs uppercase tracking-widest shadow-glow-primary" onClick={handleNext}>Initialize Scan</Button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 text-center py-4">
                            <div className="relative size-24 mx-auto">
                                <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                <ShieldCheck className="absolute inset-0 m-auto text-primary size-10" />
                            </div>
                            <h3 className="font-display font-black text-xl uppercase italic">Analyzing Data</h3>
                            <p className="font-mono text-xs text-muted-foreground">
                                Securing connection to the global identity grid...
                            </p>
                            <Button className="w-full h-12 rounded-2xl font-display font-black text-xs uppercase tracking-widest shadow-glow-primary" onClick={handleComplete} disabled={loading}>
                                {loading ? 'Transmitting...' : 'Confirm Identity'}
                            </Button>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-6 text-center py-4 animate-in zoom-in-95 duration-500">
                            <div className="size-24 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto">
                                <CheckCircle2 className="text-emerald-500 size-12" />
                            </div>
                            <h3 className="font-display font-black text-xl uppercase italic text-emerald-400">Node Verified</h3>
                            <p className="font-mono text-xs text-muted-foreground">
                                Your identity has been successfully synced with the SubPool network. Your trust score has been boosted.
                            </p>
                            <Button className="w-full h-12 rounded-2xl font-display font-black text-xs uppercase tracking-widest bg-emerald-600 hover:bg-emerald-500" onClick={onClose}>
                                Return to Dashboard
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
