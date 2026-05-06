import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Star } from 'lucide-react';
import { cn } from './ui/utils';
import { toast } from 'sonner';
import { submitRating } from '../../lib/supabase/mutations';
import type { Pool } from '../../lib/types';

interface RatingModalProps {
    pool: Pool | null;
    raterId: string;
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function RatingModal({ pool, raterId, open, onClose, onSuccess }: RatingModalProps) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [review, setReview] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!pool || rating === 0) {
            toast.error('Select a rating before transmitting.');
            return;
        }

        setLoading(true);
        try {
            const result = await submitRating(
                pool.id,
                raterId,
                pool.owner_id,
                rating,
                review.trim() || null
            );

            if (!result.success) throw new Error(result.error || 'Submission failed');

            toast.success('Reputation feedback logged.');
            if (onSuccess) onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.message || 'Feedback sync failed');
        } finally {
            setLoading(false);
        }
    };

    if (!pool) return null;

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-md bg-[#0E0E0E] border-[#1A1A1A] rounded-[32px]">
                <DialogHeader>
                    <DialogTitle className="font-display font-black text-2xl uppercase italic tracking-tighter">
                        Rate Node Host
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-8 py-6">
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onMouseEnter={() => setHover(star)}
                                    onMouseLeave={() => setHover(0)}
                                    onClick={() => setRating(star)}
                                    className="transition-transform active:scale-90"
                                >
                                    <Star 
                                        size={40} 
                                        className={cn(
                                            "transition-all duration-300",
                                            (hover || rating) >= star 
                                                ? "text-primary fill-primary shadow-glow-primary" 
                                                : "text-white/10"
                                        )}
                                    />
                                </button>
                            ))}
                        </div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black">
                            {rating === 0 ? 'Select Trust Level' : rating === 5 ? 'Elite Protocol Execution' : rating === 1 ? 'Critical Failure' : 'Standard Performance'}
                        </p>
                    </div>

                    <div className="space-y-3">
                        <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground px-1">Detailed Log (Optional)</Label>
                        <Textarea 
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            placeholder="Provide operational feedback for the host..."
                            className="bg-white/[0.02] border-white/5 rounded-2xl font-mono text-sm min-h-[120px] focus-visible:ring-primary/20"
                        />
                    </div>
                </div>

                <DialogFooter className="sm:justify-between border-t border-white/5 p-6 bg-white/[0.02]">
                    <Button variant="ghost" className="rounded-xl h-12 font-mono text-[10px] uppercase tracking-widest text-muted-foreground" onClick={onClose}>
                        Abort
                    </Button>
                    <Button 
                        className="rounded-xl h-12 font-display font-black text-xs uppercase tracking-widest px-8 shadow-glow-primary"
                        onClick={handleSubmit}
                        disabled={loading || rating === 0}
                    >
                        {loading ? 'Transmitting...' : 'Log Feedback'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
