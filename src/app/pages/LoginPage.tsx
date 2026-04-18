import React, { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Card, CardContent } from '../components/ui/card';
import { supabase } from '../../lib/supabase/client';
import { motion } from 'motion/react';

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

    // Capture referral code if present
    React.useEffect(() => {
        const params = new URLSearchParams(location.search);
        const ref = params.get('ref');
        if (ref) {
            localStorage.setItem('subpool_referral_code', ref);
        }
    }, [location.search]);

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
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#090909] p-4 noise-overlay selection:bg-primary selection:text-primary-foreground">
            <div className="fixed inset-0 -z-10 pointer-events-none" aria-hidden="true">
                <div className="absolute right-0 top-0 h-[350px] w-[500px] rounded-full bg-primary/10 blur-[120px] animate-pulse" style={{ animationDuration: '10s' }} />
                <div className="absolute left-1/4 top-1/2 h-[400px] w-[600px] rounded-full bg-[#0D4F3C]/15 blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[480px]"
            >
                <Card className="rounded-2xl border-white/5 bg-transparent glass-premium overflow-hidden">
                    <CardContent className="p-8 md:p-12">
                        <div className="mb-10 flex items-center justify-center gap-0">
                            <span className="font-display text-3xl font-black text-foreground tracking-tighter">Sub</span>
                            <span className="font-display text-3xl font-black text-primary tracking-tighter">Pool</span>
                        </div>

                        <div className="text-center mb-8">
                            <h2 className="font-display text-2xl font-black text-foreground tracking-tight">Welcome back</h2>
                            <p className="mt-2 text-[13px] text-muted-foreground/80 font-display">Save on subscriptions today</p>
                        </div>

                        <Button
                            variant="outline"
                            className="h-12 w-full gap-3 rounded-xl border-white/10 bg-white font-display text-sm font-black text-[#000000] hover:bg-white/90 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg"
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
                                <div className="w-full border-t border-white/5" />
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black">
                                <span className="bg-[#121212]/50 px-3 text-muted-foreground/60">or magic link</span>
                            </div>
                        </div>

                        {!sent ? (
                            <form onSubmit={handleMagicLink} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-[11px] font-black uppercase tracking-wider text-muted-foreground ml-1">Email address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        className="h-12 border-white/5 bg-white/5 rounded-xl font-display text-foreground placeholder:text-muted-foreground/30 focus:border-primary/50 transition-colors"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <Button type="submit" className="h-12 w-full font-display font-black text-[13px] uppercase tracking-wider shadow-glow-primary" disabled={sending}>
                                    {sending ? 'Sending...' : 'Send Magic Link →'}
                                </Button>
                            </form>
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-3 rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center"
                            >
                                <div className="flex flex-col items-center gap-2 text-primary">
                                    <span aria-label="Email" className="text-3xl mb-1" role="img">✉️</span>
                                    <p className="font-display text-sm font-black uppercase tracking-wider">Magic Link Sent</p>
                                </div>
                                <p className="text-[12px] leading-relaxed text-muted-foreground/80 font-display">
                                    Check <span className="font-black text-foreground">{email}</span> to sign in.
                                </p>
                                <Button variant="ghost" className="h-auto p-0 text-[10px] text-muted-foreground/60 hover:text-foreground uppercase tracking-widest font-bold mt-2" onClick={() => setSent(false)}>
                                    Try another email
                                </Button>
                            </motion.div>
                        )}

                        {error && (
                            <p className="mt-4 text-center font-mono text-[10px] text-destructive uppercase tracking-wide">
                                {error}
                            </p>
                        )}

                        <div className="mt-10 pt-6 border-t border-white/5 space-y-4">
                            <Link to="/browse" className="block text-center text-xs font-display font-black uppercase tracking-widest text-muted-foreground/60 transition-colors hover:text-primary">
                                Browse as Guest →
                            </Link>

                            <div className="flex justify-center gap-4 text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40 font-black">
                                <span>🔒 Encrypted</span>
                                <span aria-hidden="true">·</span>
                                <span>Free</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
