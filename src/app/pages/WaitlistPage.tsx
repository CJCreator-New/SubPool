import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase/client';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

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
      const { data, error } = await (supabase as any)
        .from('waitlist')
        .insert({
          email,
          platform: platform || null,
        } as any)
        .select('position')
        .single();

      if (error) {
        if (error.code === '23505') {
          // unique constraint violation on email
          toast.info('You are already on the waitlist!');
          setSuccess(true);
        } else if (error.code === '42P01' || error.message?.includes('waitlist') || error.code === 'PGRST204' || String(error).includes('404')) {
          // Fallback if table doesn't exist (Guest / Demo mode)
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
    } catch (err: any) {
      toast.error(err.message || 'Failed to join waitlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] flex items-center justify-center overflow-hidden py-12 px-4">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] -z-10" />

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card className="w-full max-w-lg border-border/50 bg-card/60 backdrop-blur-xl shadow-2xl">
          <CardContent className="p-8 md:p-12">
              {!success ? (
                <div
                  className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300"
                >
                  <div className="space-y-3 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-2">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h1 className="text-3xl font-display font-black tracking-tight text-foreground">
                      Join the Waitlist
                    </h1>
                    <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest leading-relaxed">
                      Be the first to know when new platforms <br />and premium features drop.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs uppercase tracking-widest font-mono font-bold text-foreground/80">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="h-12 bg-background/50 border-border/80 focus-visible:ring-1 focus-visible:ring-primary/50 transition-shadow"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="platform" className="text-xs uppercase tracking-widest font-mono font-bold text-foreground/80">Requested Platform <span className="text-muted-foreground/50 font-normal">(Optional)</span></Label>
                      <Input
                        id="platform"
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value)}
                        placeholder="e.g. Netflix, Spotify, Figma"
                        className="h-12 bg-background/50 border-border/80 focus-visible:ring-1 focus-visible:ring-primary/50 transition-shadow"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 text-sm uppercase tracking-widest font-mono font-bold group relative overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {loading ? 'Joining...' : 'Secure My Spot'}
                        {!loading && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
                      </span>
                    </Button>
                  </form>
                </div>
              ) : (
                <div
                  className="text-center space-y-6 py-6 animate-in zoom-in-95 duration-500"
                >
                  <div 
                     className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-500 mb-2 animate-bounce"
                  >
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  
                  <div className="space-y-2">
                    <h2 className="text-3xl font-display font-black text-foreground">You're In!</h2>
                    <p className="text-muted-foreground">We've secured your spot on the waitlist.</p>
                  </div>

                  {position && (
                    <div className="bg-background/40 border border-border/50 rounded-2xl p-6 shadow-inner mx-auto max-w-[240px]">
                      <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-2">Your Position</p>
                      <p className="text-5xl font-display font-black text-primary">#{position}</p>
                    </div>
                  )}

                  <div className="pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setSuccess(false)}
                      className="uppercase tracking-widest font-mono text-xs border-border/60 hover:bg-secondary/20"
                    >
                      Join for another
                    </Button>
                  </div>
                </div>
              )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
