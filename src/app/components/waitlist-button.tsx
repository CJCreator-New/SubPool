import { useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase/client';
import { Button } from './ui/button';
import { cn } from './ui/utils';
import { Clock, Users } from 'lucide-react';
import { toast } from 'sonner';
import type { Pool } from '../../lib/types';

interface WaitlistButtonProps {
    pool: Pool;
    currentUserId?: string;
    className?: string;
}

interface WaitlistEntry {
    position: number;
    status: 'waiting' | 'promoted' | 'expired' | 'cancelled';
}

export function WaitlistButton({ pool, currentUserId, className }: WaitlistButtonProps) {
    const [entry, setEntry] = useState<WaitlistEntry | null>(null);
    const [loading, setLoading] = useState(false);
    const [checked, setChecked] = useState(false);

    // Check if user is already on waitlist — lazy load on first render
    const checkStatus = useCallback(async () => {
        if (checked || !currentUserId || !supabase) return;
        setChecked(true);

        try {
            const { data } = await supabase
                .from('waitlist')
                .select('position, status')
                .eq('pool_id', pool.id)
                .eq('user_id', currentUserId)
                .eq('status', 'waiting')
                .maybeSingle();

            if (data) setEntry(data as WaitlistEntry);
        } catch { /* silent */ }
    }, [pool.id, currentUserId, checked]);

    // Check on first render
    useState(() => { checkStatus(); });

    const handleJoin = async () => {
        if (!currentUserId) {
            toast.error('Sign in to join the waitlist.');
            return;
        }
        if (!supabase) {
            toast.error('Cannot connect to server.');
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await supabase.rpc('join_waitlist', { p_pool_id: pool.id });

            if (error) throw error;

            const result = data as { ok: boolean; error?: string; position?: number };
            if (!result.ok) {
                toast.error(result.error ?? 'Could not join waitlist.');
                return;
            }

            setEntry({ position: result.position!, status: 'waiting' });
            toast.success(`You're #${result.position} on the waitlist!`, {
                description: "We'll notify you the moment a slot opens.",
            });
        } catch (err: any) {
            toast.error(err.message ?? 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    const isFull = pool.status === 'full' || pool.filled_slots >= pool.total_slots;
    const isOwner = pool.owner_id === currentUserId;

    // Don't show waitlist button for owners or if pool has slots
    if (!isFull || isOwner) return null;

    // Already on waitlist
    if (entry) {
        return (
            <div className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-md border border-primary/20 bg-primary/5 text-primary',
                className
            )}>
                <Clock className="size-3.5 shrink-0" />
                <span className="font-mono text-[11px] font-bold">
                    #{entry.position} on waitlist
                </span>
            </div>
        );
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleJoin}
            disabled={loading}
            className={cn(
                'border-warning/30 text-warning hover:bg-warning/10 hover:border-warning/60 transition-colors font-mono text-[11px]',
                className
            )}
        >
            <Users className="size-3.5 mr-1.5" />
            {loading ? 'Joining...' : 'Join Waitlist'}
        </Button>
    );
}

// Compact badge version for PoolCard
export function WaitlistBadge({ pool }: { pool: Pool }) {
    const isFull = pool.status === 'full' || pool.filled_slots >= pool.total_slots;
    if (!isFull) return null;

    return (
        <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-warning/10 border border-warning/30 text-warning">
            <Clock className="size-2.5" />
            Waitlist
        </span>
    );
}

// Position display component for MyPools / Profile
export function WaitlistPositionDisplay({ position }: { position: number }) {
    return (
        <div className="flex items-center gap-2 p-3 rounded-md border border-primary/20 bg-primary/5">
            <div className="size-8 rounded-full border-2 border-primary/40 flex items-center justify-center font-display font-black text-sm text-primary">
                #{position}
            </div>
            <div>
                <p className="font-display font-semibold text-sm">On the Waitlist</p>
                <p className="font-mono text-[10px] text-muted-foreground">
                    You'll be notified when a slot opens
                </p>
            </div>
        </div>
    );
}
