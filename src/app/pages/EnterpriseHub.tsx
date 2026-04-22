import React from 'react';
import { motion } from 'motion/react';
import { 
    Users, 
    Building2, 
    BarChart3, 
    ShieldCheck, 
    ArrowUpRight, 
    Zap, 
    Heart, 
    Briefcase,
    Plus,
    LayoutGrid,
    Search
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { PremiumCard } from '../components/premium-ui';
import { cn } from '../components/ui/utils';
import { NumberTicker } from '../components/subpool-components';
import { useCurrency } from '../../lib/currency-context';

export function EnterpriseHub() {
    const { formatPrice } = useCurrency();

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Building2 size={14} className="text-primary" />
                        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Corporate Command</span>
                    </div>
                    <h1 className="font-display font-black text-5xl tracking-tighter italic uppercase">Enterprise Hub</h1>
                    <p className="text-muted-foreground font-mono text-[11px] uppercase mt-2 opacity-60">Managing 12 active team nodes across 4 regions.</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="rounded-xl border-white/10 font-display font-bold uppercase text-[10px] tracking-widest h-11 px-6">
                        Provision Node
                    </Button>
                    <Button className="rounded-xl bg-primary text-primary-foreground font-display font-black uppercase text-[10px] tracking-widest h-11 px-6 shadow-glow-primary border-none">
                        Invite Team
                    </Button>
                </div>
            </header>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Team Savings', val: formatPrice(842000), icon: Zap, color: 'text-primary' },
                    { label: 'Active Seats', val: '124', icon: Users, color: 'text-blue-400' },
                    { label: 'Compliance Score', val: '99.8%', icon: ShieldCheck, color: 'text-emerald-400' },
                    { label: 'Wellness ROI', val: '4.2x', icon: Heart, color: 'text-rose-400' },
                ].map((stat, i) => (
                    <PremiumCard key={i} className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</p>
                                <p className={cn("text-2xl font-display font-black italic uppercase", stat.color)}>{stat.val}</p>
                            </div>
                            <stat.icon size={18} className={cn("opacity-20", stat.color)} />
                        </div>
                    </PremiumCard>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Team Management */}
                <div className="lg:col-span-8 space-y-8">
                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="font-display font-black text-xl uppercase italic tracking-tight">Active Team Nodes</h2>
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                                <input 
                                    className="bg-white/[0.02] border border-white/5 rounded-xl pl-9 pr-4 py-2 font-mono text-[10px] w-64 focus:outline-none focus:border-primary/50 transition-all"
                                    placeholder="SEARCH NODES..."
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            {[
                                { name: 'Engineering Alpha', members: 12, platforms: ['Cursor', 'GitHub', 'AWS'], efficiency: 94 },
                                { name: 'Design Studio', members: 8, platforms: ['Figma', 'Adobe', 'Midjourney'], efficiency: 88 },
                                { name: 'Sales Operations', members: 24, platforms: ['Slack', 'Zoom', 'LinkedIn'], efficiency: 72 },
                                { name: 'Marketing Hub', members: 6, platforms: ['Canva', 'Notion', 'Jasper'], efficiency: 91 },
                            ].map((team, i) => (
                                <motion.div 
                                    key={i}
                                    whileHover={{ x: 4 }}
                                    className="group flex flex-col md:flex-row items-center justify-between p-6 rounded-2xl bg-card border border-border hover:border-primary/20 transition-all cursor-pointer"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="size-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                            <LayoutGrid size={20} />
                                        </div>
                                        <div>
                                            <p className="font-display font-black text-lg uppercase italic tracking-tight">{team.name}</p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="font-mono text-[9px] text-muted-foreground uppercase">{team.members} Members</span>
                                                <div className="flex gap-1">
                                                    {team.platforms.map(p => (
                                                        <span key={p} className="size-1.5 rounded-full bg-white/20" />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8 mt-4 md:mt-0">
                                        <div className="text-right">
                                            <p className="font-mono text-[8px] text-muted-foreground uppercase mb-1">Efficiency</p>
                                            <p className={cn("font-mono font-black text-sm", team.efficiency > 90 ? "text-primary" : "text-amber-400")}>{team.efficiency}%</p>
                                        </div>
                                        <Button variant="ghost" size="icon" className="rounded-xl border border-white/5 hover:bg-white/5">
                                            <ArrowUpRight size={16} />
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* Wellness & Partnerships */}
                    <section className="p-8 rounded-[40px] bg-gradient-to-br from-rose-500/10 via-transparent to-transparent border border-rose-500/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                            <Heart size={200} />
                        </div>
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-3">
                                <Heart size={20} className="text-rose-400" />
                                <h2 className="font-display font-black text-2xl uppercase italic tracking-tighter">Wellness Program</h2>
                            </div>
                            <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest max-w-xl leading-relaxed">
                                SubPool Enterprise partners with top-tier wellness platforms to provide subsidized access for your team. 
                                Boost employee satisfaction while maintaining fiscal transparency.
                            </p>
                            <div className="flex gap-4">
                                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex-1 text-center">
                                    <p className="font-mono text-[9px] text-muted-foreground uppercase mb-1">Burnout Prevention</p>
                                    <p className="text-3xl font-display font-black text-rose-400">-24%</p>
                                </div>
                                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex-1 text-center">
                                    <p className="font-mono text-[9px] text-muted-foreground uppercase mb-1">Productivity Uplift</p>
                                    <p className="text-3xl font-display font-black text-emerald-400">+12%</p>
                                </div>
                            </div>
                            <Button className="rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-display font-black uppercase text-[10px] tracking-widest h-12 px-10 shadow-xl shadow-rose-500/20 border-none">
                                Provision Wellness Node
                            </Button>
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    <PremiumCard className="p-8 space-y-6">
                        <div className="flex items-center gap-3">
                            <Briefcase size={18} className="text-primary" />
                            <h3 className="font-display font-black text-xl uppercase italic">Compliance Vault</h3>
                        </div>
                        <div className="space-y-4">
                            {[
                                { label: 'SOC2 Type II', status: 'Verified', date: '2026-Q1' },
                                { label: 'GDPR Node Sync', status: 'Active', date: 'Real-time' },
                                { label: 'ISO 27001', status: 'Pending', date: '2026-Q2' },
                            ].map((item, i) => (
                                <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                    <div>
                                        <p className="font-display font-bold text-xs uppercase">{item.label}</p>
                                        <p className="font-mono text-[8px] text-muted-foreground">{item.date}</p>
                                    </div>
                                    <span className={cn("font-mono text-[9px] uppercase font-bold", item.status === 'Verified' ? "text-primary" : "text-amber-400")}>
                                        {item.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" className="w-full h-11 rounded-xl font-mono text-[9px] uppercase tracking-widest border-white/5 hover:bg-white/5">
                            Generate Audit Report
                        </Button>
                    </PremiumCard>

                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <BarChart3 size={18} className="text-blue-400" />
                            <h3 className="font-display font-black text-xl uppercase italic">Resource Usage</h3>
                        </div>
                        <div className="p-6 rounded-3xl bg-card border border-border space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between font-mono text-[10px] uppercase">
                                    <span className="text-muted-foreground">Seat Capacity</span>
                                    <span>124 / 500</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 shadow-glow-blue" style={{ width: '25%' }} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between font-mono text-[10px] uppercase">
                                    <span className="text-muted-foreground">API Quota</span>
                                    <span>82%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-400 shadow-glow-amber" style={{ width: '82%' }} />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

            </div>
        </div>
    );
}
