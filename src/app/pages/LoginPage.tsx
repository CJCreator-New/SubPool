import React, { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Card, CardContent } from '../components/ui/card';
import { supabase } from '../../lib/supabase/client';

function resolveNextPath(search: string, fallback = '/browse') {
    const params = new URLSearchParams(search);
    const next = params.get('next')?.trim() ?? '';
    if (!next.startsWith('/')) return fallback;
    if (next.startsWith('//')) return fallback;
    if (next === '/login') return fallback;
    return next;
}

export function LoginPage() {
    const [email, setEmail] = useState('');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const location = useLocation();
    const nextPath = resolveNextPath(location.search);
    const redirectTo = `${window.location.origin}/login?next=${encodeURIComponent(nextPath)}`;

    const handleGoogleLogin = async () => {
        if (!supabase) {
            setError('Authentication is unavailable right now. Please try again later.');
            return;
        }
        try {
            const { error: err } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo },
            });
            if (err) throw err;
        } catch (e) {
            setError((e as Error).message);
        }
    };

    const handleMagicLink = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supabase || !email) {
            if (!supabase) {
                setError('Authentication is unavailable right now. Please try again later.');
            }
            return;
        }
        setSending(true);
        setError(null);
        try {
            const { error: err } = await supabase.auth.signInWithOtp({
                email,
                options: { emailRedirectTo: redirectTo },
            });
            if (err) throw err;
            setSent(true);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
            <div className="fixed inset-0 -z-10 pointer-events-none" aria-hidden="true">
                <div className="absolute right-0 top-0 h-[250px] w-[500px] rounded-full bg-primary/10 blur-[100px]" />
                <div className="absolute left-0 top-1/2 h-[300px] w-[400px] rounded-full bg-[#0D4F3C]/10 blur-[80px]" />
            </div>

            <Card className="w-full max-w-[480px] rounded-xl border-border bg-card/50 backdrop-blur-md">
                <CardContent className="p-10">
                    <div className="mb-8 flex items-center gap-0.5">
                        <span className="font-display text-2xl font-black text-foreground">Sub</span>
                        <span className="font-display text-2xl font-black text-primary">Pool</span>
                    </div>

                    <h2 className="font-display text-2xl font-bold text-foreground">Welcome back</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Save on subscriptions today</p>

                    <Button
                        variant="outline"
                        className="mt-8 h-12 w-full gap-3 rounded-lg border-transparent bg-white font-display text-sm font-semibold text-[#1A1A1A] hover:bg-white/90"
                        onClick={handleGoogleLogin}
                        disabled={sending}
                    >
                        <svg className="size-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </Button>

                    <div className="relative mb-8 mt-8">
                        <div className="absolute inset-0 flex items-center">
                            <Separator />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-3 font-mono text-muted-foreground">or</span>
                        </div>
                    </div>

                    {!sent ? (
                        <form onSubmit={handleMagicLink} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    className="h-11 border-border bg-background"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="h-11 w-full font-display font-bold" disabled={sending}>
                                {sending ? 'Sending...' : 'Send magic link →'}
                            </Button>
                        </form>
                    ) : (
                        <div className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-6">
                            <div className="flex items-center gap-2 text-primary">
                                <span aria-label="Email" className="text-xl" role="img">✉️</span>
                                <p className="font-display text-sm font-bold">Magic link sent</p>
                            </div>
                            <p className="text-[11px] leading-relaxed text-muted-foreground">
                                Check <span className="font-bold text-foreground">{email}</span> and click the link to sign in automatically.
                            </p>
                            <Button variant="ghost" className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground" onClick={() => setSent(false)}>
                                Use a different email
                            </Button>
                        </div>
                    )}

                    {error && (
                        <p className="mt-4 text-center font-mono text-xs text-destructive">
                            {error}
                        </p>
                    )}

                    <Link to="/browse" className="mt-8 block text-center text-sm font-display text-muted-foreground transition-colors hover:text-foreground">
                        No account? Browse as guest →
                    </Link>

                    <div className="mt-4 flex justify-center gap-4 text-[10px] uppercase tracking-widest text-muted-foreground opacity-60">
                        <span>🔒 No password needed</span>
                        <span aria-hidden="true">·</span>
                        <span>Free</span>
                        <span aria-hidden="true">·</span>
                        <span>Cancel anytime</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
