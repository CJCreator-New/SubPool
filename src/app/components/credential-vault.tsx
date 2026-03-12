import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck, Eye, EyeOff, Copy, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase/client';
import { encryptString, decryptString } from '../../lib/crypto';

interface CredentialVaultProps {
    poolId: string;
    isOwner: boolean;
}

export function CredentialVault({ poolId, isOwner }: CredentialVaultProps) {
    const [loading, setLoading] = useState(true);
    const [credentials, setCredentials] = useState<{ username?: string; password?: string } | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Form inputs for owner creating credentials
    const [usernameInput, setUsernameInput] = useState('');
    const [passwordInput, setPasswordInput] = useState('');

    useEffect(() => {
        let isMounted = true;

        async function loadCredentials() {
            setLoading(true);
            try {
                const { data, error } = await supabase!
                    .from('credentials')
                    .select('encrypted_data, nonce')
                    .eq('pool_id', poolId)
                    .maybeSingle();

                if (error) throw error;

                if (data && isMounted) {
                    const decryptedString = decryptString(data.encrypted_data, data.nonce);
                    if (decryptedString) {
                        try {
                            const parsed = JSON.parse(decryptedString);
                            setCredentials(parsed);
                        } catch (e) {
                            console.error("Failed to parse vault contents:", e);
                        }
                    }
                }
            } catch (err) {
                console.error("Error loading credentials:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        loadCredentials();
        return () => { isMounted = false; };
    }, [poolId]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!usernameInput || !passwordInput) {
            toast.error("Both username/email and password are required.");
            return;
        }

        setIsSaving(true);
        try {
            const payload = JSON.stringify({
                username: usernameInput.trim(),
                password: passwordInput
            });

            const { cipherBase64, nonceBase64 } = encryptString(payload);

            const { error } = await supabase!
                .from('credentials')
                .upsert({
                    pool_id: poolId,
                    encrypted_data: cipherBase64,
                    nonce: nonceBase64,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'pool_id' });

            if (error) throw error;

            toast.success("Credentials secured in vault.");
            setCredentials({ username: usernameInput.trim(), password: passwordInput });
            setUsernameInput('');
            setPasswordInput('');
        } catch (err) {
            console.error(err);
            toast.error("Failed to save credentials.");
        } finally {
            setIsSaving(false);
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard`);
    };

    if (loading) {
        return (
            <div className="flex justify-center py-6">
                <span className="size-5 border-2 border-primary-foreground/30 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    // Owner setting up credentials for the first time
    if (!credentials && isOwner) {
        return (
            <form onSubmit={handleSave} className="space-y-4 bg-secondary/20 border border-border rounded-lg p-5">
                <div>
                    <h3 className="flex items-center gap-2 font-display text-base font-semibold mb-1">
                        <Lock className="size-4" /> Setup Credential Vault
                    </h3>
                    <p className="text-sm text-muted-foreground font-mono mb-4">
                        Securely share the login details with your approved pool members. These are encrypted before saving.
                    </p>
                </div>

                <div className="space-y-3">
                    <Input
                        placeholder="Login Email or Username"
                        value={usernameInput}
                        onChange={e => setUsernameInput(e.target.value)}
                        className="font-mono"
                    />
                    <Input
                        type="text"
                        placeholder="Password"
                        value={passwordInput}
                        onChange={e => setPasswordInput(e.target.value)}
                        className="font-mono"
                    />
                </div>

                <Button type="submit" disabled={isSaving} className="w-full">
                    {isSaving ? 'Encrypting...' : 'Encrypt & Save Credentials'}
                </Button>
            </form>
        );
    }

    // No credentials yet (member view)
    if (!credentials) {
        return (
            <div className="flex flex-col items-center justify-center p-6 bg-secondary/20 border border-border border-dashed rounded-lg text-center">
                <AlertCircle className="size-6 text-muted-foreground mb-2" />
                <h4 className="font-display text-sm font-medium">Vault Empty</h4>
                <p className="text-xs text-muted-foreground max-w-[200px]">
                    The host hasn't stored any credentials here yet.
                </p>
            </div>
        );
    }

    // Vault View (Has Credentials)
    return (
        <div className="bg-gradient-to-br from-secondary/30 to-background border border-primary/20 rounded-xl p-5 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

            <div className="flex items-center gap-2 mb-4 text-primary">
                <ShieldCheck className="size-5" />
                <h3 className="font-display font-semibold tracking-tight">Pool Credentials Vault</h3>
            </div>

            <div className="space-y-3">
                {/* Username Row */}
                <div className="flex items-center gap-3 bg-secondary/40 border border-border/80 rounded-md px-3 py-2">
                    <span className="w-20 text-xs font-mono text-muted-foreground">Username</span>
                    <span className="flex-1 font-mono text-sm tracking-wide text-foreground font-medium truncate">
                        {credentials.username}
                    </span>
                    <Button variant="ghost" size="icon" className="size-7" onClick={() => copyToClipboard(credentials.username!, 'Username')}>
                        <Copy className="size-3.5" />
                    </Button>
                </div>

                {/* Password Row */}
                <div className="flex items-center gap-3 bg-secondary/40 border border-border/80 rounded-md px-3 py-2">
                    <span className="w-20 text-xs font-mono text-muted-foreground">Password</span>
                    <span className="flex-1 font-mono text-sm tracking-wide text-foreground font-medium truncate">
                        {showPassword ? credentials.password : '••••••••••••••••'}
                    </span>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="size-7" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="size-7" onClick={() => copyToClipboard(credentials.password!, 'Password')}>
                            <Copy className="size-3.5" />
                        </Button>
                    </div>
                </div>
            </div>

            {isOwner && (
                <div className="mt-4 pt-3 border-t border-border/60 flex justify-end">
                    <Button
                        variant="link"
                        size="sm"
                        className="text-[11px] text-muted-foreground h-auto p-0"
                        onClick={() => {
                            setCredentials(null); // allow owner to replace
                            setUsernameInput(credentials.username || '');
                            setPasswordInput(credentials.password || '');
                        }}
                    >
                        Update Credentials
                    </Button>
                </div>
            )}
        </div>
    );
}
