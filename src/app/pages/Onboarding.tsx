import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
  ArrowRight, 
  Check, 
  Sparkles, 
  Wallet, 
  Users, 
  ChevronLeft,
  LayoutDashboard,
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { cn } from '../components/ui/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../lib/supabase/auth';
import { updateProfile } from '../../lib/supabase/mutations';
import { PLATFORMS } from '../../lib/constants';

type OnboardingRole = 'host' | 'joiner';

const roleCopy = {
  joiner: {
    title: 'Join smarter',
    subtitle: 'Find trusted hosts, compare savings, and join faster.',
    path: '/browse',
    icon: Users,
    checklist: [
      'Browse open pools with pricing context',
      'Track renewals and payment history',
      'Get notified when matching slots appear',
    ],
  },
  host: {
    title: 'Host with control',
    subtitle: 'List your pool, review requests, and track earnings.',
    path: '/list',
    icon: Wallet,
    checklist: [
      'Publish a pool with trust and pricing signals',
      'Approve members and manage chat securely',
      'Monitor earnings and payout status',
    ],
  },
} satisfies Record<OnboardingRole, {
  title: string;
  subtitle: string;
  path: string;
  icon: typeof Users;
  checklist: string[];
 }>;

export function Onboarding() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<OnboardingRole>('joiner');
  const [interests, setInterests] = useState<string[]>([]);
  const [profileData, setProfileData] = useState({
    displayName: profile?.display_name || '',
    bio: profile?.bio || '',
    username: profile?.username || ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const platforms = useMemo(() => PLATFORMS.slice(0, 8), []);

  const activeRole = useMemo(() => roleCopy[role], [role]);
  const ActiveIcon = activeRole.icon;

  const toggleInterest = (id: string) => {
    setInterests(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleContinue = async () => {
    if (step < 4) {
      setStep((current) => current + 1);
      return;
    }
    
    if (user) {
      setIsSaving(true);
      try {
        await updateProfile(user.id, {
          onboarding_role: role,
          onboarding_completed: true,
          onboarding_step: 4,
          display_name: profileData.displayName,
          bio: profileData.bio,
          username: profileData.username || user.email?.split('@')[0]
        });
        await refreshProfile();
      } catch (e) {
        console.error('Failed to save onboarding:', e);
      } finally {
        setIsSaving(false);
      }
    }
    
    navigate(activeRole.path);
  };

  const handleBack = () => {
    if (step === 0) {
      navigate('/');
      return;
    }
    setStep((current) => current - 1);
  };

  const stepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(200,241,53,0.12),_transparent_30%),linear-gradient(180deg,#0E0E0E_0%,#131313_100%)] px-4 py-8 text-foreground overflow-hidden">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center justify-center">
        <Card className="w-full overflow-hidden border-white/5 bg-black/40 backdrop-blur-xl shadow-premium">
          <CardContent className="grid gap-0 p-0 md:grid-cols-[1.2fr_0.8fr]">
            <section className="relative overflow-hidden border-b border-white/5 p-8 md:border-b-0 md:border-r">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(200,241,53,0.05),_transparent_40%)]" />
              
              <div className="relative z-10">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.3em] text-primary">
                  <Sparkles size={12} />
                  Mission Protocol v2.5
                </div>

                <div className="mb-10 flex gap-2">
                  {[0, 1, 2, 3, 4].map((index) => (
                    <div
                      key={index}
                      className={cn(
                        'h-1 flex-1 rounded-full transition-all duration-500',
                        index <= step ? 'bg-primary shadow-[0_0_8px_rgba(200,241,53,0.5)]' : 'bg-white/10',
                      )}
                    />
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    variants={stepVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                  >
                    {step === 0 && (
                      <div className="space-y-8">
                        <div className="space-y-3">
                          <h1 className="font-display text-5xl font-black tracking-tighter leading-none">
                            SELECT YOUR <span className="text-primary">SECTOR.</span>
                          </h1>
                          <p className="max-w-xl text-sm text-muted-foreground font-mono uppercase tracking-wider opacity-70">
                            Configure your initial workspace parameters for optimal throughput.
                          </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          {(['joiner', 'host'] as OnboardingRole[]).map((candidate) => {
                            const candidateCopy = roleCopy[candidate];
                            const CandidateIcon = candidateCopy.icon;

                            return (
                              <button
                                key={candidate}
                                type="button"
                                onClick={() => setRole(candidate)}
                                className={cn(
                                  'group relative rounded-2xl border p-6 text-left transition-all duration-500',
                                  role === candidate
                                    ? 'border-primary bg-primary/5 shadow-glow-primary'
                                    : 'border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]',
                                )}
                              >
                                <div className="mb-6 flex items-center justify-between">
                                  <div className={cn(
                                    "grid size-12 place-items-center rounded-xl transition-colors duration-500",
                                    role === candidate ? "bg-primary text-black" : "bg-white/5 text-muted-foreground group-hover:text-primary"
                                  )}>
                                    <CandidateIcon size={20} />
                                  </div>
                                  {role === candidate && (
                                    <motion.div 
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="grid size-6 place-items-center rounded-full bg-primary text-black"
                                    >
                                      <Check size={14} strokeWidth={3} />
                                    </motion.div>
                                  )}
                                </div>
                                <h2 className="font-display text-xl font-black uppercase tracking-tight">{candidateCopy.title}</h2>
                                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{candidateCopy.subtitle}</p>
                                
                                {role === candidate && (
                                  <motion.div 
                                    layoutId="role-active"
                                    className="absolute inset-0 border-2 border-primary rounded-2xl pointer-events-none"
                                  />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {step === 1 && (
                      <div className="space-y-8">
                        <div className="space-y-3">
                          <h1 className="font-display text-5xl font-black tracking-tighter leading-none">
                            CALIBRATE <span className="text-primary">TARGETS.</span>
                          </h1>
                          <p className="max-w-xl text-sm text-muted-foreground font-mono uppercase tracking-wider opacity-70">
                            Select platforms you already use or want to optimize.
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {platforms.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => toggleInterest(p.id)}
                              className={cn(
                                "flex flex-col items-center gap-3 p-4 rounded-xl border transition-all duration-300",
                                interests.includes(p.id)
                                  ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(200,241,53,0.1)]"
                                  : "border-white/5 bg-white/[0.02] hover:border-white/10"
                              )}
                            >
                              <span className="text-2xl">{p.icon}</span>
                              <span className="font-mono text-[9px] font-black uppercase tracking-widest truncate w-full text-center">
                                {p.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {step === 2 && (
                      <div className="space-y-8">
                        <div className="space-y-3">
                          <h1 className="font-display text-5xl font-black tracking-tighter leading-none">
                            IDENTITY <span className="text-primary">SYNC.</span>
                          </h1>
                          <p className="max-w-xl text-sm text-muted-foreground font-mono uppercase tracking-wider opacity-70">
                            Establish your credentials within the decentralized grid.
                          </p>
                        </div>
                        
                        <div className="grid gap-6">
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-mono text-muted-foreground">Display Name</Label>
                            <Input 
                              value={profileData.displayName} 
                              onChange={e => setProfileData(p => ({ ...p, displayName: e.target.value }))}
                              placeholder="e.g. Commander Sarah"
                              className="h-12 bg-white/5 border-white/10 rounded-xl font-display font-bold"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-mono text-muted-foreground">Bio / Objective</Label>
                            <Textarea 
                              value={profileData.bio} 
                              onChange={e => setProfileData(p => ({ ...p, bio: e.target.value }))}
                              placeholder="Optimize my overhead by 40%..."
                              className="bg-white/5 border-white/10 rounded-xl font-display text-sm min-h-[100px]"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {step === 3 && (
                      <div className="space-y-8">
                        <div className="grid size-16 place-items-center rounded-2xl bg-primary shadow-glow-primary text-black">
                          <ActiveIcon size={32} />
                        </div>
                        <div className="space-y-3">
                          <h1 className="font-display text-5xl font-black tracking-tighter leading-none">{activeRole.title.toUpperCase()}</h1>
                          <p className="max-w-xl text-sm text-muted-foreground font-mono uppercase tracking-wider opacity-70">Operational capability review.</p>
                        </div>
                        <div className="grid gap-3">
                          {activeRole.checklist.map((item, i) => (
                            <motion.div 
                              key={item} 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] px-5 py-4"
                            >
                              <div className="grid size-8 place-items-center rounded-full bg-primary/20 text-primary">
                                <Check size={16} />
                              </div>
                              <p className="font-display font-bold text-sm text-foreground">{item}</p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {step === 4 && (
                      <div className="space-y-8">
                        <div className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.3em] text-primary">
                          SYSTEM READY
                        </div>
                        <div className="space-y-3">
                          <h1 className="font-display text-5xl font-black tracking-tighter leading-none">
                            INTERFACE <span className="text-primary">SYNCED.</span>
                          </h1>
                          <p className="max-w-xl text-sm text-muted-foreground font-mono uppercase tracking-wider opacity-70">
                            Dashboard established for {role === 'host' ? 'host-tier' : 'member-tier'} operations.
                          </p>
                        </div>
                        
                        <div className="relative rounded-2xl border border-white/5 bg-white/[0.02] p-8 overflow-hidden group">
                          <div className="absolute top-0 right-0 p-4 opacity-10">
                            <LayoutDashboard size={120} />
                          </div>
                          
                          <div className="relative z-10 space-y-6">
                            <div className="space-y-1">
                              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-primary/60">Deployment target</p>
                              <p className="font-display text-3xl font-black tracking-tight">{role === 'host' ? 'POOL FORGE' : 'MARKET HUB'}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                              <div className="space-y-1">
                                <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Primary Action</p>
                                <div className="flex items-center gap-2 text-xs font-bold">
                                  <Zap size={12} className="text-primary" />
                                  {role === 'host' ? 'List Asset' : 'Discovery Scan'}
                                </div>
                              </div>
                              <div className="space-y-1">
                                <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Trust Protocol</p>
                                <div className="flex items-center gap-2 text-xs font-bold">
                                  <ShieldCheck size={12} className="text-primary" />
                                  Verified Nodes
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 flex items-start gap-4 p-4 rounded-xl border border-primary/10 bg-primary/5">
                          <input 
                            type="checkbox" 
                            id="terms"
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                            className="mt-1 size-4 rounded border-primary bg-background text-primary focus:ring-primary/40 cursor-pointer"
                          />
                          <label htmlFor="terms" className="text-[11px] text-muted-foreground leading-relaxed cursor-pointer select-none">
                            I accept the <a href="/terms" target="_blank" className="text-primary hover:underline font-bold">Terms of Service</a> and <a href="/privacy" target="_blank" className="text-primary hover:underline font-bold">Privacy Protocol</a>. I understand that SubPool is a peer-to-peer facilitation node.
                          </label>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </section>

            <aside className="flex flex-col justify-between bg-white/[0.02] p-10 border-l border-white/5 relative">
              <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
              
              <div className="relative">
                <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-primary/60 mb-6">
                  Intelligence Feed
                </p>
                <div className="space-y-6">
                  <div>
                    <h2 className="font-display text-2xl font-black tracking-tight uppercase">Precision Control.</h2>
                    <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                      SubPool uses an algorithmic matching system to ensure high-trust interactions. Your selection here calibrates your dashboard algorithms.
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-xl border border-white/5 bg-black/20 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="size-1.5 rounded-full bg-primary animate-pulse" />
                      <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-primary">Live Optimization</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-mono leading-tight">
                      Phase 3 implementation: reducing first-run friction by 40% through cognitive load balancing.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 relative">
                <Button 
                  onClick={handleContinue} 
                  disabled={isSaving || (step === 4 && !agreedToTerms)}
                  className="h-14 w-full justify-between font-display font-black uppercase tracking-widest group shadow-glow-primary transition-all duration-500 hover:scale-[1.02]"
                >
                  <span className="flex items-center gap-2">
                    {isSaving && <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="size-4 border-2 border-black/20 border-t-black rounded-full" />}
                    {step < 3 ? 'Execute Next Step' : `Enter ${role === 'host' ? 'Forge' : 'Hub'}`}
                  </span>
                  <ArrowRight size={18} className="transition-transform duration-500 group-hover:translate-x-1" />
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={handleBack} 
                  className="h-12 w-full font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
                >
                  <ChevronLeft size={14} className="mr-2" />
                  {step === 0 ? 'Abort Sequence' : 'Previous Module'}
                </Button>
              </div>
            </aside>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
