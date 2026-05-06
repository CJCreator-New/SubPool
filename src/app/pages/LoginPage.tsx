import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { supabase } from '../../lib/supabase/client';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Github, ShieldCheck, Key } from 'lucide-react';
import { toast } from 'sonner';
import { SEO } from '../components/seo';

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
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
    const [error, setError] = useState<string | null>(null);
    
    const location = useLocation();
    const navigate = useNavigate();
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
            toast.error('Authentication node offline.');
            return;
        }
        try {
            const { error: err } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo },
            });
            if (err) throw err;
        } catch (e) {
            toast.error((e as Error).message);
        }
    };

    const handleMagicLink = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supabase || !email) return;
        
        setSending(true);
        setError(null);
        try {
            const { error: err } = await supabase.auth.signInWithOtp({
                email,
                options: { emailRedirectTo: redirectTo },
            });
            if (err) throw err;
            setSent(true);
            toast.success('Protocol link dispatched to your inbox.');
        } catch (e: any) {
            setError(e.message);
            toast.error(e.message);
        } finally {
            setSending(false);
        }
    };

    const handlePasswordAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supabase || !email || !password) return;

        setSending(true);
        setError(null);
        try {
            if (authMode === 'login') {
                const { error: err } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (err) throw err;
                toast.success('Authentication successful. Uplink established.');
                navigate(nextPath);
            } else {
                const { error: err } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { emailRedirectTo: redirectTo }
                });
                if (err) throw err;
                toast.success('Account initialized. Please verify your email.');
                setSent(true);
            }
        } catch (e: any) {
            setError(e.message);
            toast.error(e.message);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050505] p-4 selection:bg-primary/30">
            <SEO 
                title={authMode === 'login' ? 'Login' : 'Initialize Node'} 
                description="Secure access to your SubPool dashboard. Connect via Node Key or Magic Link."
            />
            {/* Cyber Grid Background */}
            <div className="fixed inset-0 -z-10 opacity-20 pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff10 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            
            <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
                <div className="absolute right-[-10%] top-[-10%] h-[600px] w-[600px] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
                <div className="absolute left-[-5%] bottom-[-5%] h-[500px] w-[500px] rounded-full bg-[#0D4F3C]/20 blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[440px]"
            >
                <div className="mb-8 flex flex-col items-center">
                    <div className="size-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 relative group overflow-hidden">
                        <div className="absolute inset-0 bg-primary/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                        <ShieldCheck className="text-primary relative z-10" size={32} />
                    </div>
                    <h1 className="font-display text-4xl font-black text-foreground tracking-tighter italic uppercase flex items-center gap-1">
                        Sub<span className="text-primary">Pool</span>
                    </h1>
                    <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em] mt-2">Secure Access Protocol v2.1</p>
                </div>

                <Card className="rounded-[32px] border-white/5 bg-white/[0.02] backdrop-blur-3xl overflow-hidden shadow-2xl relative">
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
                    
                    <CardContent className="p-8 md:p-10">
                        <Tabs defaultValue="password" title="Auth Mode" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/5 border border-white/10 rounded-2xl p-1 h-12">
                                <TabsTrigger value="password" title="Password Access" className="rounded-xl font-mono text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black">
                                    Node Key
                                </TabsTrigger>
                                <TabsTrigger value="magic" title="Magic Link Access" className="rounded-xl font-mono text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black">
                                    Magic Link
                                </TabsTrigger>
                            </TabsList>

                            <AnimatePresence mode="wait">
                                <TabsContent value="password">
                                    <form onSubmit={handlePasswordAuth} className="space-y-5">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Account ID (Email)</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={16} />
                                                <Input
                                                    type="email"
                                                    placeholder="identifier@node.network"
                                                    className="h-12 border-white/5 bg-white/5 rounded-2xl pl-12 font-mono text-xs focus:ring-1 focus:ring-primary/50"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center px-1">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Access Token (Password)</Label>
                                                {authMode === 'login' && (
                                                    <button type="button" className="text-[9px] font-mono uppercase text-primary/60 hover:text-primary transition-colors">Recover</button>
                                                )}
                                            </div>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={16} />
                                                <Input
                                                    type={showPassword ? 'text' : 'password'}
                                                    placeholder="••••••••••••"
                                                    className="h-12 border-white/5 bg-white/5 rounded-2xl pl-12 pr-12 font-mono text-xs focus:ring-1 focus:ring-primary/50"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-white transition-colors"
                                                >
                                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </div>

                                        <Button 
                                            type="submit" 
                                            className="h-12 w-full font-display font-black text-xs uppercase tracking-[0.2em] shadow-glow-primary rounded-2xl group overflow-hidden relative" 
                                            disabled={sending}
                                        >
                                            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                            <span className="relative z-10 flex items-center justify-center gap-2">
                                                {sending ? 'Authenticating...' : (
                                                    <>
                                                        {authMode === 'login' ? 'Initialize Uplink' : 'Forge Account'} <ArrowRight size={16} />
                                                    </>
                                                )}
                                            </span>
                                        </Button>
                                    </form>
                                </TabsContent>

                                <TabsContent value="magic">
                                    {!sent ? (
                                        <form onSubmit={handleMagicLink} className="space-y-5">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Dispatch Target (Email)</Label>
                                                <div className="relative">
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={16} />
                                                    <Input
                                                        type="email"
                                                        placeholder="identifier@node.network"
                                                        className="h-12 border-white/5 bg-white/5 rounded-2xl pl-12 font-mono text-xs focus:ring-1 focus:ring-primary/50"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <Button type="submit" className="h-12 w-full font-display font-black text-xs uppercase tracking-[0.2em] shadow-glow-primary rounded-2xl" disabled={sending}>
                                                {sending ? 'Dispatching...' : 'Request Protocol Link →'}
                                            </Button>
                                        </form>
                                    ) : (
                                        <div className="space-y-4 rounded-3xl border border-primary/20 bg-primary/5 p-8 text-center animate-in zoom-in-95 duration-500">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center animate-bounce">
                                                    <Mail className="text-primary" size={20} />
                                                </div>
                                                <p className="font-display text-sm font-black uppercase tracking-wider text-primary">Protocol Link Dispatched</p>
                                            </div>
                                            <p className="font-mono text-[10px] leading-relaxed text-muted-foreground/80 uppercase">
                                                Access signature sent to <span className="text-foreground font-bold">{email}</span>. Use the node key in your terminal to connect.
                                            </p>
                                            <Button variant="ghost" className="h-auto p-0 text-[9px] text-muted-foreground/40 hover:text-primary uppercase tracking-[0.2em] font-black mt-4" onClick={() => setSent(false)}>
                                                Re-attempt Dispatch
                                            </Button>
                                        </div>
                                    )}
                                </TabsContent>
                            </AnimatePresence>
                        </Tabs>

                        <div className="relative my-10">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/5" />
                            </div>
                            <div className="relative flex justify-center text-[8px] uppercase tracking-[0.4em] font-black">
                                <span className="bg-[#0e0e0e] px-4 text-muted-foreground/30">External Providers</span>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            className="h-12 w-full gap-3 rounded-2xl border-white/10 bg-white/[0.03] font-mono text-[10px] uppercase tracking-widest text-foreground hover:bg-white/10 transition-all border shadow-inner"
                            onClick={handleGoogleLogin}
                            disabled={sending}
                        >
                            <svg className="size-4" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor" className="opacity-70" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="currentColor" className="opacity-50" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor" className="opacity-70" />
                            </svg>
                            Sync with Google
                        </Button>

                        <div className="mt-8 text-center">
                            <button 
                                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                                className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60 hover:text-primary transition-colors font-bold"
                            >
                                {authMode === 'login' ? "No Uplink? Initialize Node →" : "Existing Node? Connect via Key ←"}
                            </button>
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-12 flex flex-col items-center gap-6">
                    <Link to="/browse" className="flex items-center gap-2 group">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/40 group-hover:text-primary transition-colors">Enter as Observer</span>
                        <div className="size-1 bg-muted-foreground/20 rounded-full" />
                        <ArrowRight size={14} className="text-muted-foreground/20 group-hover:text-primary transition-colors" />
                    </Link>

                    <div className="flex gap-8 text-[8px] uppercase tracking-[0.4em] text-muted-foreground/20 font-black">
                        <span className="flex items-center gap-1.5"><Key size={10} /> RSA-4096</span>
                        <span className="flex items-center gap-1.5"><ShieldCheck size={10} /> ISO-27001</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
