import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Shield, Lock, Eye, Server, Database } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { SEO } from '../components/seo';

export function PrivacyPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background relative overflow-hidden selection:bg-primary/30">
            <SEO title="Privacy Protocol" description="Privacy policy and data handling protocols for the SubPool platform." />
            
            {/* Background Atmosphere */}
            <div className="absolute top-0 right-0 p-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 p-80 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="max-w-4xl mx-auto px-6 py-16 relative z-10">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-12"
                >
                    <Button 
                        variant="ghost" 
                        className="group font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-colors h-10 hover:bg-transparent"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft className="mr-3 size-4 transition-transform group-hover:-translate-x-1" /> 
                        [ Back ]
                    </Button>
                </motion.div>

                <motion.header
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6 mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 font-mono text-[9px] uppercase tracking-[0.2em]">
                        <Lock size={10} className="fill-current" />
                        Privacy Protocol v1.0
                    </div>
                    <h1 className="font-display font-black text-5xl sm:text-7xl tracking-tighter text-foreground leading-none">
                        Data <br />
                        <span className="text-blue-500 italic">Privacy.</span>
                    </h1>
                    <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest opacity-70">
                        Encryption Standard: AES-256 · SubPool Security
                    </p>
                </motion.header>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="prose prose-invert prose-blue max-w-none space-y-12"
                >
                    <section className="space-y-6">
                        <div className="flex items-center gap-4 text-blue-500">
                            <Eye size={20} />
                            <h2 className="font-display font-bold text-2xl m-0 tracking-tight">1. Data Transparency</h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed font-sans text-lg">
                            SubPool operates on a principle of "Minimum Necessary Exposure." We collect identity data (Email, Avatar, Username) exclusively to facilitate secure node pairing. Your payment credentials (Credit Card / Bank info) are handled directly by **Razorpay** or **Stripe** via encrypted PCI-compliant tunnels and are NEVER stored on SubPool servers.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <div className="flex items-center gap-4 text-blue-500">
                            <Server size={20} />
                            <h2 className="font-display font-bold text-2xl m-0 tracking-tight">2. Interaction Logging</h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed font-sans text-lg">
                            We log session activity (login attempts, pool creations, join requests) to maintain the integrity of the Trust Score engine and prevent fraudulent activity. These logs are stored for a maximum of 12 months in an encrypted cold-storage environment before being purged, unless required for legal mediation.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <div className="flex items-center gap-4 text-blue-500">
                            <Database size={20} />
                            <h2 className="font-display font-bold text-2xl m-0 tracking-tight">3. Third-Party Uplinks</h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed font-sans text-lg">
                            SubPool integrates with Supabase (Database), Posthog (Analytics), and Sentry (Error Tracking). We do not sell your personal data to advertisers. Your information is only exposed to other users within the network (e.g., Host seeing a Joiner's username) when a direct peer-to-peer transaction is initiated.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <div className="flex items-center gap-4 text-blue-500">
                            <Shield size={20} />
                            <h2 className="font-display font-bold text-2xl m-0 tracking-tight">4. Your Data Rights</h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed font-sans text-lg">
                            You have the right to request a full dump of your node activity or to permanently delete your account (Uplink Termination). Upon termination, all active pool memberships are severed, and personal identifiable data is scrubbed from our active clusters within 72 hours.
                        </p>
                    </section>
                </motion.div>

                <footer className="mt-20 pt-12 border-t border-border/40">
                    <div className="flex flex-col md:flex-row justify-between gap-8 items-center">
                        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                            © 2026 SubPool Network · Privacy Node Alpha
                        </p>
                        <div className="flex gap-6">
                            <Button variant="link" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-blue-500" onClick={() => navigate('/terms')}>
                                Terms of Service
                            </Button>
                            <Button variant="link" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-blue-500">
                                DPO Contact
                            </Button>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
