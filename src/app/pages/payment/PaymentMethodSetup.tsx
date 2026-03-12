import { useState } from 'react';
import { useNavigate } from 'react-router';
import { CreditCard, Lock, Plus } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Checkbox } from '../../components/ui/checkbox';
import { Label } from '../../components/ui/label';

export function PaymentMethodSetup() {
  const navigate = useNavigate();
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [sameBillingAddress, setSameBillingAddress] = useState(true);
  const [addressLine1, setAddressLine1] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');

  const handleContinue = () => {
    navigate('/payment/confirm');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      <header className="space-y-2">
        <h1 className="font-display font-black text-3xl tracking-tight">Add Payment Method</h1>
        <p className="font-mono text-xs sm:text-sm text-muted-foreground">
          Save a card to complete subscription payments quickly.
        </p>
      </header>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="font-display text-lg">Card Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="card-number" className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Card Number
            </Label>
            <div className="relative">
              <CreditCard className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <Input
                id="card-number"
                value={cardNumber}
                onChange={(event) => setCardNumber(event.target.value)}
                placeholder="0000 0000 0000 0000"
                className="pl-9"
                maxLength={19}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="card-expiry" className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                Expiry
              </Label>
              <Input
                id="card-expiry"
                value={expiry}
                onChange={(event) => setExpiry(event.target.value)}
                placeholder="MM / YY"
                maxLength={5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="card-cvv" className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                CVV
              </Label>
              <Input
                id="card-cvv"
                type="password"
                value={cvv}
                onChange={(event) => setCvv(event.target.value)}
                placeholder="123"
                maxLength={4}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="card-name" className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Name on Card
            </Label>
            <Input
              id="card-name"
              value={nameOnCard}
              onChange={(event) => setNameOnCard(event.target.value)}
              placeholder="J. Appleseed"
            />
          </div>

          <div className="rounded-md border border-border/70 bg-secondary/10 px-3 py-3 space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="same-billing"
                checked={sameBillingAddress}
                onCheckedChange={(checked) => setSameBillingAddress(Boolean(checked))}
              />
              <Label htmlFor="same-billing" className="text-sm">Billing address is same as profile address</Label>
            </div>

            {!sameBillingAddress && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  value={addressLine1}
                  onChange={(event) => setAddressLine1(event.target.value)}
                  placeholder="Address line 1"
                  className="sm:col-span-2"
                />
                <Input
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  placeholder="City"
                />
                <Input
                  value={zipCode}
                  onChange={(event) => setZipCode(event.target.value)}
                  placeholder="ZIP code"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="font-display text-lg">Saved Cards</CardTitle>
            <Button variant="ghost" size="sm">
              <Plus className="size-4" aria-hidden="true" />
              Add New
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border bg-secondary/10 px-3 py-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-mono text-sm">•••• •••• •••• 4242</p>
              <p className="font-mono text-[11px] text-muted-foreground mt-1">Expires 12/28</p>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground border border-border rounded-full px-2 py-0.5">
              Default
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Lock className="size-4 text-muted-foreground" aria-hidden="true" />
          <p className="font-mono text-[11px] text-muted-foreground text-center">
            Secured by Stripe. SubPool does not store your full card details.
          </p>
        </div>
        <Button onClick={handleContinue} className="w-full h-11">
          Save and Continue
        </Button>
      </div>
    </div>
  );
}
