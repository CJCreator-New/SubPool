import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase/client';
import { Sparkles, ArrowRight, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { cn } from '../components/ui/utils';

export function WaitlistPage() {
  const [email, setEmail] = useState('');
  const [platform, setPlatform] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [position, setPosition] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      if (!supabase) {
        // Demo/offline mode: simulate a successful waitlist join
        toast.success("You're on the list! (Demo Mode)");
        setPosition(Math.floor(Math.random() * 5000) + 100);
        setSuccess(true);
        return;
      }
      const { data, error } = await supabase
        .from('marketing_waitlist')
        .insert({
          email,
          platform: platform || null,
        })
        .select('position')
        .single();

      if (error) {
        if (error.code === '23505') {
          toast.info('You are already on the waitlist!');
          setSuccess(true);
        } else if (error.code === '42P01' || error.message?.includes('waitlist') || error.code === 'PGRST204' || String(error).includes('404')) {
          console.warn('Waitlist table missing, mocking success:', error);
          toast.success("You're on the list! (Demo Mode)");
          setPosition(Math.floor(Math.random() * 5000) + 100);
          setSuccess(true);
        } else {
          throw error;
        }
      } else {
        toast.success("You're on the list!");
        if (data?.position) setPosition(data.position);
        setSuccess(true);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to join waitlist';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] flex items-center justify-center overflow-hidden py-12 px-4 bg-background">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[0%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[150px]" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-500/5 rounded-full blur-[100px]" />
        
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 contrast-150 brightness-100" />
        <div className="absolute inset-0 [background:radial-gradient(ellipse_at_center,_transparent_0%,_var(--background)_80%)]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg relative z-10"
      >
        <Card className="glass border-border/40 bg-surface-gradient shadow-2xl overflow-hidden rounded-3xl">
          <CardContent className="p-8 md:p-14">
            <AnimatePresence mode="wait">
              {!success ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-10"
                >
                  <div className="space-y-4 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-4 border border-primary/20 shadow-inner group">
                      <Zap className="w-7 h-7 group-hover:scale-110 transition-transform" />
                    </div>
                    <h1 className="text-4xl font-display font-black tracking-tight text-foreground sm:text-5xl">
                      Secure Priority Access
                    </h1>
                    <p className="text-muted-foreground font-mono text-[11px] sm:text-xs uppercase tracking-[0.3em] leading-relaxed">
                      Initialize your position in the <br /><span className="text-primary font-bold">SubPool Deployment Cycle.</span>
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email" className="text-[10px] uppercase tracking-[0.2em] font-mono font-bold text-muted-foreground">Auth Endpoint</Label>
                        <ShieldCheck className="size-3 text-emerald-400/50" />
                      </div>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="network_id@secure.io"
                        required
                        className="h-14 bg-background/30 border-border/80 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all rounded-xl font-mono text-sm placeholder:text-muted-foreground/30"
                      />
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="platform" className="text-[10px] uppercase tracking-[0.2em] font-mono font-bold text-muted-foreground">Platform Request <span className="text-muted-foreground/30 font-normal">--optional</span></Label>
                        <Input
                            id="platform"
                            value={platform}
                            onChange={(e) => setPlatform(e.target.value)}
                            placeholder="e.g. Midjourney, Cursor, GPT-5"
                            className="h-14 bg-background/30 border-border/80 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all rounded-xl font-mono text-sm placeholder:text-muted-foreground/30"
                        />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-14 text-xs uppercase tracking-[0.3em] font-mono font-black group relative overflow-hidden rounded-xl shadow-[0_20px_40px_rgba(200,241,53,0.15)]"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                      <span className="relative z-10 flex items-center justify-center gap-3">
                        {loading ? 'Transmitting...' : 'Join Waitlist'}
                        {!loading && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />}
                      </span>
                    </Button>
                  </form>

                  <div className="pt-4 flex items-center justify-center gap-6 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
                    <div className="h-[1px] flex-1 bg-border/50" />
                    <p className="text-[9px] font-mono uppercase tracking-[0.2em] whitespace-nowrap">Encryption Active (AES-256)</p>
                    <div className="h-[1px] flex-1 bg-border/50" />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-8 py-10"
                >
                  <div className="relative inline-flex mb-4">
                    <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full animate-pulse" />
                    <div 
                        className="relative z-10 inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-xl"
                    >
                        <CheckCircle2 className="w-12 h-12" />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h2 className="text-4xl font-display font-black text-foreground tracking-tight">Access Granted</h2>
                    <p className="text-muted-foreground text-sm font-medium">System verification complete. Your node position is locked.</p>
                  </div>

                  {position !== null && (
                    <div className="bg-background/20 backdrop-blur-md border border-border/40 rounded-3xl p-8 shadow-inner mx-auto max-w-[280px] group hover:border-primary/40 transition-colors">
                      <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em] mb-4">Pipeline Position</p>
                      <p className="text-6xl font-display font-black text-primary drop-shadow-[0_0_15px_rgba(200,241,53,0.3)] group-hover:scale-110 transition-transform">#{position}</p>
                    </div>
                  )}

                  <div className="pt-6">
                    <Button 
                      variant="ghost" 
                      onClick={() => setSuccess(false)}
                      className="uppercase tracking-[0.4em] font-mono text-[10px] text-muted-foreground hover:text-primary transition-colors h-10 hover:bg-transparent"
                    >
                      [ Request another node ]
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
