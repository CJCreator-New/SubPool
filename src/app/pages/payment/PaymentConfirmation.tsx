import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ArrowLeft, CreditCard, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { useCurrency } from '../../lib/currency-context';
import { supabase } from '../../lib/supabase/client';
import { PlatformIcon } from '../../components/subpool-components';
import { getPlatform } from '../../lib/constants';
import { toast } from 'sonner';
import { recordPoolPayment } from '../../lib/supabase/mutations';
import { useAuth } from '../../lib/supabase/auth';

export function PaymentConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const params = new URLSearchParams(location.search);
  const poolId = params.get('poolId');
  const membershipId = params.get('membershipId');

  useEffect(() => {
    async function loadPaymentDetails() {
      if (!poolId && !membershipId) {
        setLoading(false);
        return;
      }

      try {
        let query = supabase.from('pools').select('*, owner:profiles(*)');
        
        if (poolId) {
          query = query.eq('id', poolId);
        } else {
          // If membershipId provided, we join to find the pool
          const { data: memData } = await supabase
            .from('memberships')
            .select('pool_id')
            .eq('id', membershipId)
            .single();
          if (memData) {
            query = query.eq('id', memData.pool_id);
          }
        }

        const { data: poolData, error } = await query.single();
        if (error) throw error;
        setData(poolData);
      } catch (err) {
        console.error('Failed to load payment details:', err);
        toast.error('Uplink failed. Could not retrieve payment parameters.');
      } finally {
        setLoading(false);
      }
    }

    loadPaymentDetails();
  }, [poolId, membershipId]);

  const handlePay = async () => {
    if (!user || !data) return;
    setIsProcessing(true);
    try {
      const basePrice = data.price_per_slot / 100;
      const platformFee = basePrice * 0.05;
      const totalCents = Math.round((basePrice + platformFee) * 100);

      const result = await recordPoolPayment(data.id, user.id, totalCents);
      
      if (!result.success) {
        throw new Error(result.error || 'Payment failed');
      }

      toast.success('Financial settlement authorized.');
      navigate('/payment/success');
    } catch (err: any) {
      toast.error(err.message || 'Financial settlement failed.');
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090909]">
        <div className="animate-pulse font-mono text-[10px] text-primary uppercase tracking-[0.3em]">Calibrating Ledger...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-6">
        <h1 className="font-display font-black text-3xl uppercase italic text-destructive">Invalid Protocol</h1>
        <p className="text-muted-foreground font-mono text-xs">No active payment request detected at this frequency.</p>
        <Button onClick={() => navigate('/browse')}>Return to Market Hub</Button>
      </div>
    );
  }

  const platform = getPlatform(data.platform);
  const basePrice = data.price_per_slot / 100;
  const platformFee = basePrice * 0.05;
  const total = basePrice + platformFee;

  return (
    <div className="max-w-xl mx-auto space-y-8 pb-20 pt-8 px-4">
      <header className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-xl border border-white/5 hover:bg-white/5">
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="font-display font-black text-4xl tracking-tighter uppercase italic">Settlement</h1>
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Review ledger parameters before authorization.</p>
        </div>
      </header>

      <Card className="border-white/5 bg-transparent glass-premium overflow-hidden rounded-[32px]">
        <CardHeader className="pb-6 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-5">
            <PlatformIcon platformId={data.platform} size="md" className="shadow-glow-primary" />
            <div className="min-w-0">
              <CardTitle className="font-display font-black text-2xl uppercase tracking-tighter truncate leading-none">
                {platform?.name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Avatar className="size-6 border border-white/10 ring-2 ring-black">
                  <AvatarFallback className="text-[9px] font-black bg-primary text-black">
                    {(data.owner?.username?.[0] ?? 'H').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                   Authorized by {data.owner?.display_name || data.owner?.username || 'Host'}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8 space-y-6">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 flex items-center gap-3">
             <ShieldCheck size={16} className="text-primary" />
             <p className="font-mono text-[10px] text-primary uppercase tracking-wider">Secure Escrow Protocol Active</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-widest">
              <span className="text-muted-foreground">Node Access Fee</span>
              <span className="text-foreground font-black">{formatPrice(basePrice)}</span>
            </div>
            <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-widest">
              <span className="text-muted-foreground">Network Fee (5%)</span>
              <span className="text-foreground font-black">{formatPrice(platformFee)}</span>
            </div>
            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="font-display font-black text-sm uppercase italic">Final Settlement</span>
              <span className="font-display font-black text-3xl text-primary tracking-tighter italic">
                {formatPrice(total)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/5 bg-white/[0.02] rounded-2xl">
        <CardContent className="p-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-4 min-w-0">
            <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground border border-white/5">
                <CreditCard className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="font-mono text-xs uppercase font-black tracking-widest truncate">Visa •••• 4242</p>
              <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-tighter mt-1 opacity-60">Vault Protected</p>
            </div>
          </div>
          <Button variant="ghost" className="font-mono text-[10px] uppercase tracking-widest text-primary hover:bg-primary/10" onClick={() => navigate('/payment/method')}>
            Switch
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Button 
          className="w-full h-16 font-display font-black text-lg uppercase tracking-[0.2em] shadow-glow-primary rounded-2xl group relative overflow-hidden" 
          onClick={handlePay} 
          disabled={isProcessing}
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="relative z-10 flex items-center justify-center gap-3">
            {isProcessing ? (
               <span className="animate-pulse">Authorizing Ledger...</span>
            ) : (
               <>Authorize {formatPrice(total)} →</>
            )}
          </span>
        </Button>
        <Button variant="ghost" className="w-full font-mono text-[10px] uppercase tracking-widest text-muted-foreground" onClick={() => navigate(-1)}>
          Terminate Uplink
        </Button>
      </div>
    </div>
  );
}
