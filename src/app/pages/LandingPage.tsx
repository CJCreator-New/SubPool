import React from 'react';
import { useNavigate, Link, Navigate } from 'react-router';
import { Button } from '../components/ui/button';
import { PoolCard, PlatformIcon } from '../components/subpool-components';
import { PLATFORMS } from '../../lib/constants';
import type { Pool } from '../../lib/types';
import { cn } from '../components/ui/utils';
import { useAuth } from '../../lib/supabase/auth';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';

export function LandingPage() {
    const navigate = useNavigate();
    const { user, loading } = useAuth();

    if (!loading && user) {
        return <Navigate to="/browse" replace />;
    }

    // Mock pools for the floating cards to match mission exactly
    const cardPools: Pool[] = [
        {
            id: 'hero-netflix',
            platform: 'netflix',
            plan_name: 'Standard 4K',
            filled_slots: 3,
            total_slots: 4,
            price_per_slot: 499,
            status: 'open',
            category: 'entertainment',
            owner_id: 'owner-1',
            owner: {
                id: 'owner-1',
                username: 'riyak',
                display_name: 'Riya K',
                avatar_color: '#C8F135',
                is_verified: true,
                is_pro: false,
                rating: 4.8,
                review_count: 12,
                created_at: new Date().toISOString(),
                bio: null
            },
            auto_approve: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            description: '',
        },
        {
            id: 'hero-chatgpt',
            platform: 'chatgpt',
            plan_name: 'Plus',
            filled_slots: 1,
            total_slots: 2,
            price_per_slot: 999,
            status: 'open',
            category: 'ai',
            owner_id: 'owner-2',
            owner: {
                id: 'owner-2',
                username: 'marcusw',
                display_name: 'Marcus W',
                avatar_color: '#4DFF91',
                is_verified: true,
                is_pro: true,
                rating: 4.9,
                review_count: 24,
                created_at: new Date().toISOString(),
                bio: null
            },
            auto_approve: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            description: '',
        },
        {
            id: 'hero-figma',
            platform: 'figma',
            plan_name: 'Professional',
            filled_slots: 4,
            total_slots: 5,
            price_per_slot: 600,
            status: 'open',
            category: 'work',
            owner_id: 'owner-3',
            owner: {
                id: 'owner-3',
                username: 'samd',
                display_name: 'Sam D',
                avatar_color: '#A259FF',
                is_verified: true,
                is_pro: false,
                rating: 5.0,
                review_count: 8,
                created_at: new Date().toISOString(),
                bio: null
            },
            auto_approve: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            description: '',
        },
    ];

    const { scrollYProgress } = useScroll();
    const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
    const heroOpacity = useTransform(smoothProgress, [0, 0.2], [1, 0]);
    const heroScale = useTransform(smoothProgress, [0, 0.2], [1, 0.95]);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };


    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY } = e;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        mouseX.set((clientX - centerX) / 50);
        mouseY.set((clientY - centerY) / 50);
    };

    return (
        <div 
            onMouseMove={handleMouseMove}
            className="relative min-h-screen bg-[#090909] text-foreground overflow-x-hidden selection:bg-primary selection:text-primary-foreground noise-overlay"
        >

            {/* ━━━ BACKGROUND ATMOSPHERE ━━━ */}
            <div className="fixed inset-0 bg-background -z-20 aria-hidden pointer-events-none" />
            <div className="fixed top-0 right-0 w-[600px] h-[300px] bg-primary/10 blur-[120px] rounded-full -z-10 aria-hidden pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
            <div className="fixed bottom-0 left-0 w-[500px] h-[400px] bg-[#0D4F3C]/20 blur-[100px] rounded-full -z-10 aria-hidden pointer-events-none" />

            {/* ━━━ NAVBAR ━━━ */}
            <nav className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-6 md:px-12 bg-background/80 backdrop-blur-md border-b border-[#2A2A2A]/50 z-50">
                <Link to="/" className="flex items-center gap-0">
                    <span className="font-display font-black text-xl text-white">Sub</span>
                    <span className="font-display font-black text-xl text-primary">Pool</span>
                </Link>

                <div className="flex items-center gap-2 md:gap-4">
                    <Button variant="ghost" className="hidden sm:flex text-muted-foreground hover:text-foreground text-sm font-display font-semibold" asChild>
                        <Link to="/browse">Browse Pools</Link>
                    </Button>
                    <Button variant="outline" size="sm" className="h-9 px-4 font-display font-bold text-xs" asChild>
                        <Link to="/login">Sign In</Link>
                    </Button>
                    <Button size="sm" className="h-9 px-4 font-display font-bold text-xs bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                        <Link to="/browse">Get Started →</Link>
                    </Button>
                </div>
            </nav>

            {/* ━━━ HERO SECTION ━━━ */}
            <div className="pt-16 max-w-[1440px] mx-auto min-h-screen flex flex-col md:flex-row relative">

                {/* Ambient ellipses — pointer-events-none */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                    <div className="absolute top-0 right-0 w-[600px] h-[300px] 
                        bg-primary opacity-[0.04] blur-[120px] rounded-full
                        animate-[floatEllipse_20s_ease-in-out_infinite]" style={{ willChange: 'transform' }} />
                    <div className="absolute top-1/4 left-0 w-[800px] h-[400px] 
                        opacity-[0.08] blur-[100px] rounded-full
                        bg-[#0D4F3C]
                        animate-[floatEllipse_25s_ease-in-out_infinite_reverse]" style={{ willChange: 'transform' }} />
                </div>

                {/* LEFT HALF */}
                <motion.div 
                    style={{ opacity: heroOpacity, scale: heroScale }}
                    className="w-full md:w-1/2 px-6 md:px-16 py-16 md:py-24 flex flex-col justify-center relative z-10"
                >
                    {/* Mobile Logo Repeat */}
                    <div className="md:hidden flex items-center gap-0 mb-10">
                        <span className="font-display font-black text-2xl text-white">Sub</span>
                        <span className="font-display font-black text-2xl text-primary">Pool</span>
                    </div>

                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="mt-4 md:mt-12 space-y-1"
                    >
                        <h1 className="font-display font-black text-[42px] md:text-[64px] leading-[0.95] tracking-[-3px] text-foreground">
                            Share subscriptions.
                        </h1>
                        <h1 className="font-display font-black text-[42px] md:text-[64px] leading-[0.95] tracking-[-3px] text-primary">
                            Split the cost.
                        </h1>
                    </motion.div>

                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                        className="mt-6 max-w-[460px] font-display font-normal text-base md:text-[20px] text-muted-foreground/80 leading-relaxed"
                    >
                        No awkward group chats. No ghosting. No overpaying for a plan nobody else is using.
                    </motion.p>

                    <div className="mt-8 space-y-3.5">
                        {[
                            "Access Netflix, Spotify, Figma & 25+ platforms",
                            "Save 40–75% every month vs solo pricing",
                            "Verified pools. Real ratings. Zero awkward DMs."
                        ].map((text, i) => (
                            <div key={i} className="flex items-center gap-3.5">
                                <div className="size-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                                    <div className="size-2.5 rounded-full bg-primary" />
                                </div>
                                <span className="font-display font-normal text-[15px] text-foreground">{text}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 flex flex-wrap items-center gap-4">
                        <Button
                            className="h-13 px-8 text-[15px] md:text-base font-display font-bold bg-primary text-primary-foreground shadow-[0_8px_32px_rgba(200,241,53,0.25)] hover:shadow-[0_12px_40px_rgba(200,241,53,0.35)] hover:-translate-y-0.5 transition-all"
                            onClick={() => navigate('/browse')}
                        >
                            Get Started — It's Free
                        </Button>
                        <Button
                            variant="ghost"
                            className="h-13 px-4 text-muted-foreground hover:text-foreground font-display font-semibold transition-colors"
                            onClick={() => navigate('/browse')}
                        >
                            See how it works
                        </Button>
                    </div>

                    {/* Social Proof */}
                    <div className="mt-8 flex items-center gap-4">
                        <div className="flex items-center">
                            {[
                                { bg: 'bg-primary', initials: 'R' },
                                { bg: 'bg-[#4DFF91]', initials: 'A' },
                                { bg: 'bg-[#A259FF]', initials: 'S' },
                                { bg: 'bg-[#F5A623]', initials: 'J' },
                                { bg: 'bg-[#20B8CD]', initials: 'M' }
                            ].map((avatar, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "size-8 rounded-full border-2 border-[#0E0E0E] flex items-center justify-center",
                                        "font-display font-black text-xs text-[#0E0E0E]",
                                        avatar.bg,
                                        i !== 0 && "-ml-2.5"
                                    )}
                                >
                                    {avatar.initials}
                                </div>
                            ))}
                        </div>
                        <span className="font-mono text-xs md:text-sm text-muted-foreground">
                            Join 3,200+ members already saving
                        </span>
                    </div>

                    {/* Trust Badges */}
                    <div className="mt-6 flex gap-4 flex-wrap">
                        {["🔒 No passwords", "⭐ 4.9 avg rating", "🆓 Free to join"].map((badge, i) => (
                            <div key={i} className="border border-[#2A2A2A] rounded-full px-3 py-1 font-mono text-[11px] text-muted-foreground/60 uppercase tracking-wider">
                                {badge}
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT HALF */}
                <div className="hidden md:flex flex-1 relative items-center justify-center overflow-visible">
                    {/* Background Glow */}
                    <div className="absolute w-[400px] h-[400px] bg-primary/10 blur-[100px] rounded-full aria-hidden pointer-events-none" />

                    {/* Card A (Netflix) */}
                    <motion.div 
                        initial={{ opacity: 0, x: -50, rotate: -5 }}
                        animate={{ opacity: 1, x: 0, rotate: -3 }}
                        transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        style={{ 
                            translateY: useTransform(smoothProgress, [0, 1], [-80, -200]),
                            x: useSpring(useTransform(mouseX, [-20, 20], [20, -20]), { stiffness: 50, damping: 20 }),
                            y: useSpring(useTransform(mouseY, [-20, 20], [20, -20]), { stiffness: 50, damping: 20 })
                        }}
                        className="absolute z-10"
                    >
                        <div className="w-[300px] shadow-premium hover:scale-[1.02] transition-transform duration-500">
                            <PoolCard pool={cardPools[0]} animate />
                        </div>
                    </motion.div>

                    {/* Card B (ChatGPT) */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        style={{ 
                            translateY: useTransform(smoothProgress, [0, 1], [0, -100]),
                            x: useSpring(useTransform(mouseX, [-20, 20], [-30, 30]), { stiffness: 100, damping: 30 }),
                            y: useSpring(useTransform(mouseY, [-20, 20], [-30, 30]), { stiffness: 100, damping: 30 })
                        }}
                        className="absolute z-20"
                    >
                        <div className="w-[300px] shadow-premium hover:scale-[1.05] transition-transform duration-500">
                            <PoolCard pool={cardPools[1]} animate />
                        </div>
                    </motion.div>

                    {/* Card C (Figma) */}
                    <motion.div 
                        initial={{ opacity: 0, x: 50, rotate: 5 }}
                        animate={{ opacity: 1, x: 0, rotate: 3 }}
                        transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        style={{ 
                            translateY: useTransform(smoothProgress, [0, 1], [80, 0]),
                            x: useSpring(useTransform(mouseX, [-20, 20], [10, -10]), { stiffness: 30, damping: 10 }),
                            y: useSpring(useTransform(mouseY, [-20, 20], [10, -10]), { stiffness: 30, damping: 10 })
                        }}
                        className="absolute z-10"
                    >
                        <div className="w-[300px] shadow-premium hover:scale-[1.02] transition-transform duration-500">
                            <PoolCard pool={cardPools[2]} animate />
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* ━━━ HOW IT WORKS SECTION ━━━ */}
            <section className="py-24 border-t border-[#2A2A2A] relative overflow-hidden bg-background">
                <div className="max-w-6xl mx-auto px-6 relative z-10">
                    <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-primary text-center mb-4">How it works</p>
                    <h2 className="font-display font-black text-[36px] tracking-tight text-center text-foreground mb-16 px-4">
                        Three steps to start saving
                    </h2>

                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-100px" }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                        {[
                            {
                                num: '1',
                                icon: '🔍',
                                title: 'Browse open pools',
                                body: 'See 100+ live subscription slots. Filter by platform, price, or category. Find your perfect match in minutes.'
                            },
                            {
                                num: '2',
                                icon: '🤝',
                                title: 'Request to join',
                                body: 'Send a join request to the pool owner. They review your profile and rating. Most requests approved in <2 hours.'
                            },
                            {
                                num: '3',
                                icon: '💸',
                                title: 'Split and save',
                                body: 'Pay your share each month via the built-in ledger. Track payments, get reminders. Save 40–75% forever.'
                            }
                        ].map((step, i) => (
                            <motion.div 
                                key={i} 
                                variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }}
                                className="bg-card border border-[#2A2A2A] rounded-[6px] p-8 relative group transition-all duration-300 hover:border-primary/20"
                            >
                                <div className="absolute -top-4 left-6 size-8 rounded-full bg-primary text-primary-foreground font-display font-black text-sm flex items-center justify-center shadow-lg">
                                    {step.num}
                                </div>
                                <div className="text-3xl mb-4">{step.icon}</div>
                                <h3 className="font-display font-bold text-lg text-foreground mb-2">{step.title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    {step.body}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ━━━ PLATFORMS SECTION ━━━ */}
            <section className="py-20 border-t border-[#2A2A2A] bg-background/50">
                <div className="max-w-[1440px] mx-auto px-6 text-center">
                    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-8">WORKS WITH</p>

                    <div className="flex flex-wrap items-center justify-center gap-4 max-w-5xl mx-auto pb-4 scrollbar-hide">
                        {PLATFORMS.map((platform) => (
                            <div key={platform.id} className="flex flex-col items-center gap-2 group">
                                <PlatformIcon platformId={platform.id} size="md" />
                                <span className="font-display font-semibold text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">{platform.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ━━━ STATS SECTION ━━━ */}
            <section className="py-20 border-t border-[#2A2A2A] bg-background">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-0">
                        {[
                            { value: 3241, label: 'Members saving' },
                            { value: 142, label: 'Open pools today' },
                            { value: 64, label: 'Average savings', suffix: '%' },
                            { value: 4103, label: 'Market value matched', prefix: '$' },
                            { value: 22560, label: 'Avg. saved per year', prefix: '₹' }
                        ].map((stat, idx) => (
                            <div key={idx} className="flex flex-col">
                                <span className="font-display font-black text-4xl text-foreground tracking-tight">
                                    <NumberTicker value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                                </span>
                                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                                    {stat.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ━━━ CTA SECTION ━━━ */}
            <section className="py-24 border-t border-[#2A2A2A] relative overflow-hidden bg-background">
                <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
                    <h2 className="font-display font-black text-[36px] tracking-tight text-foreground mb-4">
                        Ready to stop overpaying?
                    </h2>
                    <p className="text-muted-foreground text-base md:text-lg mb-8 max-w-sm mx-auto font-display">
                        Join 3,200+ members. Free forever.
                    </p>
                    <Button
                        size="lg"
                        className="h-13 px-8 text-base font-display font-bold bg-primary text-primary-foreground shadow-[0_8px_32px_rgba(200,241,53,0.25)] hover:shadow-[0_12px_40px_rgba(200,241,53,0.35)] hover:-translate-y-0.5 transition-all"
                        onClick={() => navigate('/browse')}
                    >
                        Get Started — It's Free
                    </Button>
                </div>
            </section>

            {/* ━━━ FOOTER ━━━ */}
            <footer className="py-8 border-t border-[#2A2A2A] bg-background">
                <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex justify-between items-center">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-4">
                        <div className="flex items-center gap-0">
                            <span className="font-display font-black text-xs text-white">Sub[lime]</span>
                            <span className="font-display font-black text-xs text-primary">Pool</span>
                        </div>
                        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest leading-none">© 2026 SubPool</p>
                    </div>

                    <div className="flex items-center gap-6">
                        {['Browse', 'Sign In', 'Terms', 'Privacy'].map((item) => (
                            <Link
                                key={item}
                                to={item === 'Browse' ? '/browse' : item === 'Sign In' ? '/login' : '#'}
                                className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
                            >
                                {item}
                            </Link>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    );
}
