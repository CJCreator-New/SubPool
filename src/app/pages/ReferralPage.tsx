import { ArrowLeft, ArrowRight, Share2, Copy } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useAuth } from '../../lib/supabase/auth';
import { toast } from 'sonner';
import { track } from '../../lib/analytics';
import { useNavigate } from 'react-router';

export function ReferralPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const referralUrl = profile?.referral_code
    ? `https://subpool.app/ref/${profile.referral_code}`
    : 'https://subpool.app/ref/unknown';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralUrl);
    toast.success("Referral link copied to clipboard!");
    track('referral_link_copied', {});
  };

  return (
    <div className="mx-auto max-w-4xl py-12 px-4">
      <Button variant="ghost" className="mb-8" onClick={() => navigate('/profile')}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Profile
      </Button>

      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div
           className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500"
        >
          <div className="space-y-2">
            <h1 className="font-display font-black text-4xl tracking-tight text-foreground">
              Invite friends, <br />
              <span className="text-primary">earn months.</span>
            </h1>
            <p className="text-muted-foreground font-mono text-sm leading-relaxed max-w-sm">
              For every 3 friends who join using your link, you get 1 month of SubPool Pro absolutely free.
            </p>
          </div>

          <Card className="border-border/50 bg-card/60 backdrop-blur">
            <CardContent className="p-6">
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">Your Invite Link</p>
              <div className="flex bg-background/50 border border-border/80 rounded-lg overflow-hidden">
                <input
                  type="text"
                  readOnly
                  value={referralUrl}
                  className="flex-1 bg-transparent px-4 font-mono text-sm outline-none"
                />
                <Button onClick={handleCopy} className="rounded-none h-12 px-6">
                  <Copy className="h-4 w-4 mr-2" /> Copy
                </Button>
              </div>
            </CardContent>
          </Card>

          <Button variant="outline" className="w-full gap-2 font-mono uppercase tracking-widest text-xs h-12 border-border/60">
            <Share2 className="w-4 h-4" /> 
            Share on Twitter
          </Button>
        </div>

        <div
           className="relative animate-in fade-in zoom-in-95 duration-700"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-blue-500/20 to-transparent blur-3xl rounded-full" />
          <Card className="border-border/40 bg-card shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2" />
            
            <CardContent className="p-8 space-y-8">
              <div className="text-center space-y-2">
                <p className="font-display font-bold text-6xl text-primary">0</p>
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Friends Joined</p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className="h-2 flex-1 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full bg-primary w-0" />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-mono text-[10px] uppercase text-muted-foreground">
                  <span>Start</span>
                  <span>Free Pro Month</span>
                </div>
              </div>
              
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center">
                 <p className="font-mono text-xs text-primary mb-1">0 / 3 friends invited</p>
                 <p className="text-sm font-medium">You're 3 friends away from your next reward!</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
