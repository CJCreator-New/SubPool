import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase/client';
import type { Pool } from '../../lib/types';
import { AlertCircle, ShieldAlert, Trash2, Save } from 'lucide-react';

interface PoolSettingsModalProps {
    pool: Pool | null;
    open: boolean;
    onClose: () => void;
    onUpdate?: () => void;
}

export function PoolSettingsModal({ pool, open, onClose, onUpdate }: PoolSettingsModalProps) {
    const [loading, setLoading] = useState(false);
    const [price, setPrice] = useState('');
    const [status, setStatus] = useState<Pool['status']>('open');
    const [autoApprove, setAutoApprove] = useState(false);
    const [description, setDescription] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (pool) {
            setPrice((pool.price_per_slot / 100).toString());
            setStatus(pool.status);
            setAutoApprove(pool.auto_approve || false);
            setDescription(pool.description || '');
        }
    }, [pool]);

    const handleSave = async () => {
        if (!pool) return;
        setLoading(true);
        try {
            const priceCents = Math.round(parseFloat(price) * 100);
            if (isNaN(priceCents) || priceCents <= 0) throw new Error('Invalid price format');

            const { error } = await supabase!.from('pools')
                .update({
                    price_per_slot: priceCents,
                    status,
                    auto_approve: autoApprove,
                    description,
                    updated_at: new Date().toISOString()
                })
                .eq('id', pool.id);

            if (error) throw error;

            toast.success('Protocol configuration updated.');
            if (onUpdate) onUpdate();
            onClose();
        } catch (err: any) {
            toast.error(err.message || 'Failed to update protocol');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!pool) return;
        setLoading(true);
        try {
            const { error } = await supabase!
                .from('pools')
                .delete()
                .eq('id', pool.id);

            if (error) throw error;

            toast.success('Node terminated successfully.');
            if (onUpdate) onUpdate();
            onClose();
        } catch (err: any) {
            toast.error(err.message || 'Termination failed');
        } finally {
            setLoading(false);
        }
    };

    if (!pool) return null;

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-md bg-[#0E0E0E] border-[#1A1A1A] rounded-[32px] overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="font-display font-black text-2xl uppercase italic tracking-tighter">
                        Node Configuration
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Price per Slot</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">$</span>
                                <Input 
                                    type="number" 
                                    value={price} 
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="pl-7 bg-white/[0.02] border-white/5 rounded-xl font-mono"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Status</Label>
                            <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                                <SelectTrigger className="bg-white/[0.02] border-white/5 rounded-xl font-mono text-xs capitalize">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1A1A1A] border-white/5">
                                    <SelectItem value="open" className="font-mono text-xs capitalize">Open</SelectItem>
                                    <SelectItem value="full" className="font-mono text-xs capitalize">Full</SelectItem>
                                    <SelectItem value="closed" className="font-mono text-xs capitalize">Closed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Uplink Description</Label>
                        <Textarea 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Define the rules for this cluster..."
                            className="bg-white/[0.02] border-white/5 rounded-xl font-mono text-xs min-h-[100px]"
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                        <div className="space-y-0.5">
                            <Label className="font-mono text-[11px] uppercase tracking-widest text-foreground font-black">Auto-Approve</Label>
                            <p className="text-[10px] text-muted-foreground font-mono">Bypass manual review for new joiners.</p>
                        </div>
                        <Switch checked={autoApprove} onCheckedChange={setAutoApprove} />
                    </div>

                    {showDeleteConfirm ? (
                        <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 space-y-4">
                            <div className="flex gap-3">
                                <AlertCircle className="size-5 text-destructive shrink-0" />
                                <p className="text-[10px] font-mono text-destructive uppercase font-bold leading-relaxed">
                                    DANGER: Terminating this node will dissolve all current memberships and stop billing. This cannot be undone.
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="destructive" className="flex-1 rounded-xl h-10 font-mono text-[10px] uppercase tracking-widest" onClick={handleDelete} disabled={loading}>
                                    Confirm Termination
                                </Button>
                                <Button variant="ghost" className="flex-1 rounded-xl h-10 font-mono text-[10px] uppercase tracking-widest" onClick={() => setShowDeleteConfirm(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Button 
                            variant="ghost" 
                            className="w-full h-12 rounded-2xl border border-destructive/20 text-destructive/60 hover:text-destructive hover:bg-destructive/5 font-mono text-[10px] uppercase tracking-widest flex items-center gap-2"
                            onClick={() => setShowDeleteConfirm(true)}
                        >
                            <Trash2 size={14} /> Terminate Protocol
                        </Button>
                    )}
                </div>

                <DialogFooter className="sm:justify-between gap-4 border-t border-white/5 p-6 bg-white/[0.02]">
                    <Button variant="ghost" className="rounded-xl h-12 font-mono text-[10px] uppercase tracking-widest text-muted-foreground" onClick={onClose}>
                        Close
                    </Button>
                    <Button 
                        className="rounded-xl h-12 font-display font-black text-xs uppercase tracking-widest px-8 shadow-glow-primary flex items-center gap-2"
                        onClick={handleSave}
                        disabled={loading}
                    >
                        {loading ? 'Syncing...' : <><Save size={16} /> Save Changes</>}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
