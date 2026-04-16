import { useNavigate } from 'react-router';
import { Check, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

export function PaymentSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-120px)] grid place-items-center px-4 py-10">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="mx-auto size-16 rounded-full bg-primary text-primary-foreground grid place-items-center animate-in zoom-in-90 duration-300">
          <Check className="size-8" strokeWidth={3} />
        </div>

        <div className="space-y-2">
          <h1 className="font-display font-black text-3xl tracking-tight">$4.99 sent to Riya K</h1>
          <p className="font-mono text-xs sm:text-sm text-muted-foreground">February 2026 • Netflix Standard 4K</p>
        </div>

        <Card className="border-border text-left">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base">Receipt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-muted-foreground">Transaction ID</span>
              <span>#TXN-2847364</span>
            </div>
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-muted-foreground">Date</span>
              <span>Feb 18, 2026 • 2:34 PM</span>
            </div>
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-muted-foreground">Method</span>
              <span>Visa •••• 4242</span>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => toast.success('Receipt download started.')}
          >
            <Download className="size-4" aria-hidden="true" />
            Download Receipt
          </Button>
          <Button className="w-full" onClick={() => navigate('/ledger')}>
            Back to Ledger
          </Button>
        </div>
      </div>
    </div>
  );
}
