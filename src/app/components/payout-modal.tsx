import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Wallet, Landmark, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import { useRequestPayoutMutation } from '../../lib/supabase/queries';
import { useAuth } from '../../lib/supabase/auth';

interface PayoutModalProps {
    open: boolean;
    onClose: () => void;
    availableBalance: number;
    currency: string;
}

export function PayoutModal({ open, onClose, availableBalance, currency }: PayoutModalProps) {
    const [amount, setAmount] = useState(availableBalance.toString());
    const { user } = useAuth();
    const requestPayoutMutation = useRequestPayoutMutation();

    const handleSubmit = async () => {
        const val = parseFloat(amount);
        if (isNaN(val) || val <= 0) {
            toast.error('Invalid amount.');
            return;
        }
        if (val > availableBalance) {
            toast.error('Insufficient settled funds.');
            return;
        }

        try {
            await requestPayoutMutation.mutateAsync({
                userId: user?.id || '',
                amountCents: Math.round(val * 100),
                currency
            });
            toast.success('Payout request transmitted.', {
                description: 'Funds will be transferred to your linked node within 2-3 cycles.'
            });
            onClose();
        } catch (err: any) {
            toast.error(err.message || 'Failed to initiate payout.');
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-md bg-[#0E0E0E] border-[#1A1A1A] rounded-[32px]">
                <DialogHeader>
                    <DialogTitle className="font-display font-black text-2xl uppercase italic tracking-tighter flex items-center gap-2">
                        <Wallet className="text-primary" /> Withdraw Earnings
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Available for Sync</p>
                            <p className="font-display font-black text-2xl tracking-tight">
                                {currency === 'INR' ? '₹' : '$'}{availableBalance.toLocaleString()}
                            </p>
                        </div>
                        <div className="size-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <Landmark className="text-primary" size={24} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Withdrawal Amount</Label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm text-muted-foreground">
                                {currency === 'INR' ? '₹' : '$'}
                            </span>
                            <Input 
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="bg-white/[0.02] border-white/5 rounded-2xl h-14 pl-10 font-mono text-lg"
                                placeholder="0.00"
                            />
                        </div>
                        <p className="font-mono text-[9px] text-muted-foreground ml-1 uppercase">
                            Platform Fee: 5% + Processing Node Cost
                        </p>
                    </div>
                </div>

                <DialogFooter className="sm:justify-between border-t border-white/5 p-6 bg-white/[0.02]">
                    <Button variant="ghost" className="rounded-xl h-12 font-mono text-[10px] uppercase tracking-widest text-muted-foreground" onClick={onClose}>
                        Abort
                    </Button>
                    <Button 
                        className="rounded-xl h-12 font-display font-black text-xs uppercase tracking-widest px-8 shadow-glow-primary"
                        onClick={handleSubmit}
                        disabled={requestPayoutMutation.isPending}
                    >
                        {requestPayoutMutation.isPending ? 'Syncing...' : (
                            <span className="flex items-center gap-2">
                                Initialize Payout <ArrowUpRight size={16} />
                            </span>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
