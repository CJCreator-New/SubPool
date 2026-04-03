import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Share2, Copy, Trophy, Gift, Zap, Users, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useAuth } from '../../lib/supabase/auth';
import { toast } from 'sonner';
import { track } from '../../lib/analytics';
import { useNavigate } from 'react-router';
import { useReferralStats } from '../../lib/supabase/hooks';
import { cn } from '../components/ui/utils';

export function ReferralPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { stats, loading } = useReferralStats();

  const friendsGoal = 3;
  const progressPercent = Math.min((stats.count / friendsGoal) * 100, 100);
  const remainingCount = Math.max(friendsGoal - stats.count, 0);

  const referralUrl = profile?.referral_code
    ? `${window.location.origin}/login?ref=${profile.referral_code}`
    : `${window.location.origin}/login`;

  const handleCopy = async () => {
    try {
        await navigator.clipboard.writeText(referralUrl);
        toast.success("System: Uplink copied to clipboard");
        track('referral_link_copied', { count: stats.count });
    } catch {
        toast.error("Copy failed. Uplink manually.");
    }
  };

  const shareOnTwitter = () => {
    const text = `I'm scaling my subscription throughput on SubPool. Use my uplink to join the network: ${referralUrl}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
    track('referral_share_clicked', { platform: 'twitter' });
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden bg-background py-12 px-4 sm:px-8">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
        
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 contrast-150 brightness-100" />
      </div>

      <div className="mx-auto max-w-6xl relative z-10">
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-12"
        >
            <Button 
                variant="ghost" 
                className="group font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-colors h-10 hover:bg-transparent"
                onClick={() => navigate('/profile')}
            >
                <ArrowLeft className="mr-3 size-4 transition-transform group-hover:-translate-x-1" /> 
                [ Return to Node ]
            </Button>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column: Info & CTA */}
            <div className="space-y-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-6"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono text-[9px] uppercase tracking-[0.2em] mb-4">
                        <Zap size={10} className="fill-current" />
                        Network Expansion Protocol
                    </div>
                    <h1 className="font-display font-black text-5xl sm:text-7xl tracking-tighter text-foreground leading-[0.95]">
                        Scale the <br />
                        <span className="text-primary italic">Network.</span> <br />
                        Earn Rewards.
                    </h1>
                    <p className="text-muted-foreground font-mono text-xs sm:text-sm leading-relaxed max-w-md uppercase tracking-wider opacity-70">
                        Initialise the referral cycle. For every 3 successful node activations, unlock 1 month of <span className="text-foreground font-bold">SubPool Pro Status</span> at no overhead.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="space-y-6"
                >
                    <Card className="glass border-border/40 bg-surface-gradient shadow-2xl rounded-3xl overflow-hidden relative group">
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardContent className="p-8">
                            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-6">Unique Invite Uplink</p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-1 h-14 bg-background/40 border border-border/60 rounded-2xl flex items-center px-4 overflow-hidden shadow-inner group-hover:border-primary/40 transition-colors">
                                    <code className="text-xs font-mono text-muted-foreground/60 truncate flex-1">{referralUrl}</code>
                                    <div className="size-2 rounded-full bg-primary/20 animate-pulse ml-2" />
                                </div>
                                <Button 
                                    onClick={handleCopy} 
                                    className="h-14 px-8 rounded-2xl font-display font-black uppercase tracking-widest bg-primary text-primary-foreground shadow-[0_15px_30px_rgba(200,241,53,0.15)] hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    <Copy className="size-4 mr-3" /> Copy Link
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex flex-wrap gap-4">
                        <Button 
                            variant="outline" 
                            onClick={shareOnTwitter}
                            className="flex-1 h-14 gap-3 font-mono uppercase tracking-[0.2em] text-[10px] rounded-2xl border-border/60 hover:bg-white/5 transition-all"
                        >
                            <Share2 className="size-4 text-primary" /> 
                            Post on X Network
                        </Button>
                        <Button 
                            variant="outline"
                            className="h-14 px-6 rounded-2xl border-border/60 hover:bg-white/5"
                            aria-label="Direct Share"
                        >
                            <ExternalLink size={18} />
                        </Button>
                    </div>
                </motion.div>
            </div>

            {/* Right Column: Stats & Progress */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                className="relative"
            >
                <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
                <Card className="glass border-border/30 bg-surface-gradient shadow-3xl rounded-[40px] overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                    
                    <CardContent className="p-10 sm:p-14 space-y-12 relative z-10">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Network Growth</p>
                                <h3 className="font-display font-black text-2xl tracking-tight leading-none text-foreground">Mission Progress</h3>
                            </div>
                            <div className="size-12 rounded-2xl bg-secondary/80 flex items-center justify-center border border-border/40 shadow-inner">
                                <Trophy size={20} className="text-primary" />
                            </div>
                        </div>

                        <div className="text-center py-6 space-y-4">
                            <div className="relative inline-flex items-center justify-center">
                                <svg className="size-48 -rotate-90 sm:size-56">
                                    <circle
                                        cx="50%"
                                        cy="50%"
                                        r="45%"
                                        className="fill-none stroke-secondary/30 stroke-[8px]"
                                    />
                                    <motion.circle
                                        cx="50%"
                                        cy="50%"
                                        r="45%"
                                        initial={{ strokeDasharray: "0 1000" }}
                                        animate={{ strokeDasharray: `${progressPercent * 2.83} 1000` }}
                                        transition={{ duration: 1.5, ease: "circOut", delay: 0.8 }}
                                        className="fill-none stroke-primary stroke-[8px]"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1">
                                    <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-full" />
                                    <motion.p 
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 1, type: "spring" }}
                                        className="font-display font-black text-6xl sm:text-7xl text-foreground relative z-10"
                                    >
                                        {stats.count}
                                    </motion.p>
                                    <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground relative z-10">Nodes Added</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex justify-between items-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60 px-2">
                                <span>Cycle Progress</span>
                                <span>{stats.count} / {friendsGoal} Initialized</span>
                            </div>

                            <div className="bg-background/30 backdrop-blur-md border border-border/40 rounded-3xl p-6 shadow-inner flex items-center gap-6 group hover:border-primary/40 transition-all duration-500">
                                <div className="size-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-lg group-hover:scale-105 transition-transform">
                                    <Gift size={28} className="text-emerald-400" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className="text-xs font-bold text-foreground">Current Incentive Reward</p>
                                    <p className="text-[11px] leading-relaxed text-muted-foreground font-medium opacity-80">
                                        {remainingCount > 0
                                            ? `Connect ${remainingCount} more node${remainingCount === 1 ? '' : 's'} to activate 30 days of Pro Status.`
                                            : "Reward Payload confirmed. Initialize collection on your profile."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2 flex items-center justify-center gap-4 opacity-40">
                            <Users size={12} className="text-primary" />
                            <p className="font-mono text-[8px] uppercase tracking-[0.4em]">SubPool Referral Protocol v6.2.8</p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
      </div>
    </div>
  );
}
