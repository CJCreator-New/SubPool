import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase/client';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { toast } from 'sonner';

interface Require2FAProps {
    onSuccess: () => void;
    onCancel?: () => void;
    actionName: string;
    isOpen: boolean;
}

export function Require2FAModal({
    onSuccess,
    onCancel,
    actionName,
    isOpen
}: Require2FAProps) {
    const [status, setStatus] = useState<'checking' | 'prompting' | 'verifying'>('checking');
    const [totpFactorId, setTotpFactorId] = useState<string | null>(null);
    const [verifyCode, setVerifyCode] = useState('');

    useEffect(() => {
        if (isOpen) {
            checkAndChallenge();
        } else {
            // reset state when closed
            setStatus('checking');
            setVerifyCode('');
        }
    }, [isOpen]);

    const checkAndChallenge = async () => {
        setStatus('checking');
        try {
            // AAL (Authenticator Assurance Level)
            const { data: aal, error: aalErr } = await supabase!.auth.mfa.getAuthenticatorAssuranceLevel();
            if (aalErr) throw aalErr;

            if (aal.currentLevel === 'aal2' || !aal.nextLevel) {
                // User either already verified this session or doesn't have 2FA setup!
                onSuccess();
                return;
            }

            // User has AAL1 but needs AAL2 (they have 2FA enabled but haven't verified)
            const { data: factors, error: factorsErr } = await supabase!.auth.mfa.listFactors();
            if (factorsErr) throw factorsErr;

            const totpFactor = factors?.totp.find(f => f.status === 'verified');
            if (totpFactor) {
                setTotpFactorId(totpFactor.id);
                setStatus('prompting');
            } else {
                // If they don't have it verified, fall back to success (no 2fa)
                onSuccess();
            }
        } catch (error) {
            console.error("MFA Check failed", error);
            toast.error("Security check failed.");
            if (onCancel) onCancel();
        }
    };

    const handleVerify = async () => {
        if (!totpFactorId || !verifyCode) return;

        setStatus('verifying');
        try {
            const challenge = await supabase!.auth.mfa.challenge({ factorId: totpFactorId });
            if (challenge.error) throw challenge.error;

            const verify = await supabase!.auth.mfa.verify({
                factorId: totpFactorId,
                challengeId: challenge.data.id,
                code: verifyCode
            });

            if (verify.error) throw verify.error;

            toast.success("Identity verified.");
            onSuccess();
        } catch (error: any) {
            toast.error(error.message || "Invalid 2FA code");
            setStatus('prompting'); // Reset so they can try again
            setVerifyCode('');
        }
    };

    if (!isOpen || status === 'checking') return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel?.()}>
            <DialogContent className="sm:max-w-md bg-card border border-border">
                <DialogHeader>
                    <DialogTitle>Verify Identity</DialogTitle>
                    <DialogDescription>
                        To continue with "{actionName}", please enter your 6-digit Authenticator code.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Input
                            value={verifyCode}
                            onChange={(e) => setVerifyCode(e.target.value)}
                            placeholder="000 000"
                            className="font-mono text-center tracking-widest text-lg h-12"
                            maxLength={6}
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleVerify();
                            }}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Button variant="ghost" onClick={onCancel} disabled={status === 'verifying'}>
                        Cancel
                    </Button>
                    <Button onClick={handleVerify} disabled={status === 'verifying' || verifyCode.length < 6}>
                        {status === 'verifying' ? 'Verifying...' : 'Confirm'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Higher Order usage hook or wrapper
export function useRequire2FA(actionName: string, onVerifiedFn: () => void) {
    const [isOpen, setIsOpen] = useState(false);

    const Modal = () => (
        <Require2FAModal
            isOpen={isOpen}
            actionName={actionName}
            onSuccess={() => {
                setIsOpen(false);
                onVerifiedFn();
            }}
            onCancel={() => setIsOpen(false)}
        />
    );

    return {
        prompt2FA: () => setIsOpen(true),
        Require2FAModal: Modal
    };
}
