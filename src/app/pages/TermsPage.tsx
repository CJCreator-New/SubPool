import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Shield, Scale, FileText, Lock } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { SEO } from '../components/seo';

export function TermsPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background relative overflow-hidden selection:bg-primary/30">
            <SEO title="Terms of Service" description="Legal framework and terms of service for the SubPool platform." />
            
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
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono text-[9px] uppercase tracking-[0.2em]">
                        <Scale size={10} className="fill-current" />
                        Legal Framework v1.0
                    </div>
                    <h1 className="font-display font-black text-5xl sm:text-7xl tracking-tighter text-foreground leading-none">
                        Terms of <br />
                        <span className="text-primary italic">Service.</span>
                    </h1>
                    <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest opacity-70">
                        Last Modified: May 2026 · SubPool Protocol
                    </p>
                </motion.header>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="prose prose-invert prose-primary max-w-none space-y-12"
                >
                    <section className="space-y-6">
                        <div className="flex items-center gap-4 text-primary">
                            <Shield size={20} />
                            <h2 className="font-display font-bold text-2xl m-0 tracking-tight">1. Acceptance of Terms</h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed font-sans text-lg">
                            By accessing or initializing an uplink with the SubPool platform (the "Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, you must terminate your session and disconnect from the network immediately. SubPool provides a peer-to-peer subscription optimization engine; we do not sell subscriptions, we facilitate the collaborative management of existing high-utility nodes.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <div className="flex items-center gap-4 text-primary">
                            <FileText size={20} />
                            <h2 className="font-display font-bold text-2xl m-0 tracking-tight">2. Node Management & Responsibility</h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed font-sans text-lg">
                            Hosts are responsible for the valid maintenance of their original subscription pipelines. Members agree to adhere to the end-user license agreements (EULA) of the respective platforms (e.g., Netflix, ChatGPT, Figma). SubPool is not liable for account terminations resulting from platform-specific policy changes. We maintain a zero-tolerance policy for slot-hopping or unauthorized credential distribution.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <div className="flex items-center gap-4 text-primary">
                            <Lock size={20} />
                            <h2 className="font-display font-bold text-2xl m-0 tracking-tight">3. Payments & Financial Integrity</h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed font-sans text-lg">
                            Financial throughput is managed via integrated settlement layers. All payments are final upon node activation. SubPool takes a nominal platform fee (calculated based on your tier) to maintain the network infrastructure. Pro-rated refunds are only available in the event of a Host-initiated pool termination. Users attempting payment reversals without merit will be permanently banned from the network and their Trust Score zeroed.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <div className="flex items-center gap-4 text-primary">
                            <Scale size={20} />
                            <h2 className="font-display font-bold text-2xl m-0 tracking-tight">4. Trust Score & Verification</h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed font-sans text-lg">
                            The SubPool Trust Score is an algorithmic reputation metric. Maintaining a high score is essential for high-value node access. Verified identities (Aadhaar/Phone) receive priority visibility. Providing fraudulent identification data is a breach of federal law in several jurisdictions and will result in immediate legal escalation.
                        </p>
                    </section>
                </motion.div>

                <footer className="mt-20 pt-12 border-t border-border/40">
                    <div className="flex flex-col md:flex-row justify-between gap-8 items-center">
                        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                            © 2026 SubPool Network · All Rights Reserved
                        </p>
                        <div className="flex gap-6">
                            <Button variant="link" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary" onClick={() => navigate('/privacy')}>
                                Privacy Protocol
                            </Button>
                            <Button variant="link" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary">
                                Support Node
                            </Button>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
