import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';

export function PaymentConfirmation() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => navigate('/payment/success'), 900);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-10">
      <header className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="font-display font-black text-2xl tracking-tight">Confirm Payment</h1>
          <p className="font-mono text-xs text-muted-foreground mt-1">Review details before paying.</p>
        </div>
      </header>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-md bg-secondary/40 border border-border/60 grid place-items-center text-xl">
              🎬
            </div>
            <div className="min-w-0">
              <CardTitle className="font-display text-lg truncate">Netflix Standard 4K</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Avatar className="size-6">
                  <AvatarFallback className="text-[10px] font-bold bg-primary text-primary-foreground">RK</AvatarFallback>
                </Avatar>
                <p className="font-mono text-[11px] text-muted-foreground">Hosted by Riya K</p>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-md border border-border/70 bg-secondary/10 px-3 py-2">
            <p className="font-mono text-xs text-muted-foreground">Billing period: February 2026</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between font-mono text-sm">
              <span className="text-muted-foreground">Subscription Share</span>
              <span>$4.99</span>
            </div>
            <div className="flex items-center justify-between font-mono text-sm">
              <span className="text-muted-foreground">Platform Fee (5%)</span>
              <span>$0.25</span>
            </div>
            <div className="border-t border-border pt-2 flex items-center justify-between">
              <span className="font-display font-semibold">Total</span>
              <span className="font-display font-black text-lg text-primary">$5.24</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardContent className="p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <CreditCard className="size-4 text-muted-foreground" aria-hidden="true" />
            <div className="min-w-0">
              <p className="font-mono text-sm truncate">Visa •••• 4242</p>
              <p className="font-mono text-[11px] text-muted-foreground mt-1">Expires 12/28</p>
            </div>
          </div>
          <Button variant="link" className="h-auto p-0" onClick={() => navigate('/payment/method')}>
            Change
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Button className="w-full h-11" onClick={handlePay} disabled={isProcessing}>
          {isProcessing ? 'Processing...' : 'Pay $5.24 Now'}
        </Button>
        <Button variant="outline" className="w-full" onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <p className="font-mono text-[11px] text-muted-foreground text-center leading-relaxed">
          Payment is routed to the host. SubPool applies a platform fee for trust and safety.
        </p>
      </div>
    </div>
  );
}
