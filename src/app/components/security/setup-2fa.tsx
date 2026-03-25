import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase/client';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { toast } from 'sonner';
import { ShieldCheck, ShieldAlert, KeyRound } from 'lucide-react';

export function Setup2FA() {
    const [status, setStatus] = useState<'loading' | 'unenrolled' | 'enrolling' | 'enrolled'>('loading');
    const [qrCode, setQrCode] = useState<string>('');
    const [totpSecret, setTotpSecret] = useState<string>('');
    const [factorId, setFactorId] = useState<string>('');
    const [verifyCode, setVerifyCode] = useState<string>('');
    const [isVerifying, setIsVerifying] = useState(false);

    useEffect(() => {
        checkMfaStatus();
    }, []);

    const checkMfaStatus = async () => {
        try {
            const { data, error } = await supabase!.auth.mfa.getAuthenticatorAssuranceLevel();
            if (error) throw error;

            // If user has verified at least one factor, or has factors enrolled.
            const { data: factorsData, error: factorsErr } = await supabase!.auth.mfa.listFactors();
            if (factorsErr) throw factorsErr;

            const totpFactor = factorsData.totp.find(f => f.status === 'verified');

            if (totpFactor) {
                setStatus('enrolled');
            } else {
                setStatus('unenrolled');
            }
        } catch (error) {
            console.error(error);
            setStatus('unenrolled');
        }
    };

    const handleEnroll = async () => {
        setStatus('loading');
        try {
            const { data, error } = await supabase!.auth.mfa.enroll({
                factorType: 'totp',
            });

            if (error) throw error;

            setFactorId(data.id);
            setQrCode(data.totp.qr_code);
            setTotpSecret(data.totp.secret);
            setStatus('enrolling');
        } catch (error: any) {
            toast.error(error.message || 'Failed to start 2FA enrollment');
            setStatus('unenrolled');
        }
    };

    const handleVerifyEnrollment = async () => {
        if (!verifyCode || verifyCode.length < 6) {
            toast.error("Please enter the 6-digit code.");
            return;
        }

        setIsVerifying(true);
        try {
            const challenge = await supabase!.auth.mfa.challenge({ factorId });
            if (challenge.error) throw challenge.error;

            const verify = await supabase!.auth.mfa.verify({
                factorId,
                challengeId: challenge.data.id,
                code: verifyCode
            });

            if (verify.error) throw verify.error;

            toast.success("2FA successfully enabled!");
            setStatus('enrolled');
        } catch (error: any) {
            toast.error(error.message || 'Failed to verify code');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleUnenroll = async () => {
        // Find factor
        const { data: factorsData } = await supabase!.auth.mfa.listFactors();
        const totpFactor = factorsData?.totp.find(f => f.status === 'verified');

        if (totpFactor) {
            const { error } = await supabase!.auth.mfa.unenroll({ factorId: totpFactor.id });
            if (error) {
                toast.error(error.message);
                return;
            }
            toast.success("2FA disabled.");
            setStatus('unenrolled');
        }
    };

    if (status === 'loading') {
        return (
            <div className="flex animate-pulse items-center gap-3 p-4 border border-border rounded-lg bg-secondary/10">
                <ShieldAlert className="size-5 text-muted-foreground" />
                <span className="font-mono text-sm text-muted-foreground">Checking security status...</span>
            </div>
        );
    }

    if (status === 'enrolled') {
        return (
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-between p-5 border border-primary/20 bg-primary/5 rounded-lg">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <ShieldCheck className="size-5" />
                    </div>
                    <div>
                        <h4 className="font-display font-semibold text-sm">Two-Factor Authentication</h4>
                        <p className="font-mono text-[11px] text-muted-foreground">Your account is secured with 2FA.</p>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleUnenroll} className="border-destructive/30 text-destructive hover:bg-destructive/10">
                    Disable 2FA
                </Button>
            </div>
        );
    }

    if (status === 'enrolling') {
        return (
            <div className="p-5 border border-border bg-card rounded-lg space-y-5">
                <div className="flex items-center gap-3 border-b border-border pb-4">
                    <KeyRound className="size-5 text-primary" />
                    <h4 className="font-display font-semibold text-sm">Setup Authenticator App</h4>
                </div>

                <div className="space-y-4">
                    <p className="font-mono text-xs text-muted-foreground">
                        Scan this QR code with your authenticator app (e.g. Google Authenticator, Authy).
                    </p>

                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        {/* Render SVG from supabase string */}
                        <div
                            className="bg-white p-2 rounded-md ring-1 ring-border shadow-sm shrink-0 [&>svg]:w-32 [&>svg]:h-32"
                            dangerouslySetInnerHTML={{ __html: qrCode }}
                        />

                        <div className="flex-1 space-y-3 w-full">
                            <div>
                                <p className="font-mono text-[10px] uppercase text-muted-foreground mb-1">Manual Entry Code</p>
                                <code className="block bg-secondary/30 p-2 rounded text-xs font-mono font-bold break-all border border-border">
                                    {totpSecret}
                                </code>
                            </div>

                            <div className="space-y-2 pt-2">
                                <label className="font-mono text-[10px] uppercase text-muted-foreground">Verify 6-digit Code</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={verifyCode}
                                        onChange={(e) => setVerifyCode(e.target.value)}
                                        placeholder="000000"
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-mono tracking-widest text-center max-w-[120px]"
                                        maxLength={6}
                                    />
                                    <Button onClick={handleVerifyEnrollment} disabled={isVerifying} className="h-9">
                                        {isVerifying ? 'Verifying...' : 'Verify'}
                                    </Button>
                                    <Button variant="ghost" className="h-9" onClick={() => setStatus('unenrolled')}>
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-between p-5 border border-border bg-card rounded-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

            <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground">
                    <ShieldAlert className="size-5" />
                </div>
                <div>
                    <h4 className="font-display font-semibold text-sm">Two-Factor Authentication</h4>
                    <p className="font-mono text-[11px] text-muted-foreground">Add an extra layer of security to your SubPool and Wallet.</p>
                </div>
            </div>

            <Button onClick={handleEnroll} size="sm" className="shrink-0 relative">
                Enable 2FA
            </Button>
        </div>
    );
}
