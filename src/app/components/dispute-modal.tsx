import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from './ui/select';
import { AlertTriangle, Gavel, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

interface DisputeModalProps {
    open: boolean;
    onClose: () => void;
    poolId: string;
    transactionId?: string;
}

export function DisputeModal({ open, onClose, poolId, transactionId }: DisputeModalProps) {
    const [reason, setReason] = useState('payment_not_verified');
    const [details, setDetails] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!details) {
            toast.error('Evidence log is mandatory for mediation.');
            return;
        }

        setLoading(true);
        try {
            // Simulate dispute filing delay
            await new Promise(r => setTimeout(r, 1500));
            
            toast.success('Dispute protocol initiated.', {
                description: 'An admin mediator will review the logs within 24h.'
            });
            onClose();
        } catch (err: any) {
            toast.error('Failed to initialize mediation.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-md bg-[#0E0E0E] border-[#1A1A1A] rounded-[32px]">
                <DialogHeader>
                    <DialogTitle className="font-display font-black text-2xl uppercase italic tracking-tighter flex items-center gap-2">
                        <Gavel className="text-rose-500" /> Mediation Protocol
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex gap-3">
                        <ShieldAlert className="text-rose-500 shrink-0" size={20} />
                        <p className="font-mono text-[10px] text-rose-500 uppercase font-bold leading-relaxed">
                            WARNING: Filing a false dispute is a protocol violation and may result in node termination.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Mediation Category</Label>
                        <Select value={reason} onValueChange={setReason}>
                            <SelectTrigger className="bg-white/[0.02] border-white/5 rounded-2xl h-12 font-mono text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1A1A1A] border-white/5">
                                <SelectItem value="payment_not_verified" className="font-mono text-xs">Payment Verification Failure</SelectItem>
                                <SelectItem value="access_revoked" className="font-mono text-xs">Access Revoked Prematurely</SelectItem>
                                <SelectItem value="host_unresponsive" className="font-mono text-xs">Host Communication Failure</SelectItem>
                                <SelectItem value="malicious_activity" className="font-mono text-xs">Suspected Malicious Protocol</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Evidence Log</Label>
                        <Textarea 
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            placeholder="Provide timestamps and details for the mediator..."
                            className="bg-white/[0.02] border-white/5 rounded-2xl font-mono text-sm min-h-[120px]"
                        />
                    </div>
                </div>

                <DialogFooter className="sm:justify-between border-t border-white/5 p-6 bg-white/[0.02]">
                    <Button variant="ghost" className="rounded-xl h-12 font-mono text-[10px] uppercase tracking-widest text-muted-foreground" onClick={onClose}>
                        Abort
                    </Button>
                    <Button 
                        className="rounded-xl h-12 font-display font-black text-xs uppercase tracking-widest px-8 bg-rose-600 hover:bg-rose-500"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? 'Transmitting...' : 'Initiate Mediation'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
