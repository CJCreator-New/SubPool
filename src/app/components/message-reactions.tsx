// ─── Message Reactions Component ────────────────────────────────────────────
// Displays emoji reactions on a message and allows toggling them.

import { useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase/client';
import { cn } from './ui/utils';

const QUICK_EMOJIS = ['👍', '❤️', '😂', '🔥', '🎉', '👀'];

interface Reaction {
    emoji: string;
    count: number;
    hasReacted: boolean;
}

interface MessageReactionsProps {
    messageId: string;
    currentUserId?: string;
    initial?: { emoji: string; user_id: string }[];
    className?: string;
}

export function MessageReactions({ messageId, currentUserId, initial = [], className }: MessageReactionsProps) {
    const [reactions, setReactions] = useState<{ emoji: string; user_id: string }[]>(initial);
    const [showPicker, setShowPicker] = useState(false);

    const grouped = QUICK_EMOJIS.map((emoji): Reaction => ({
        emoji,
        count: reactions.filter(r => r.emoji === emoji).length,
        hasReacted: reactions.some(r => r.emoji === emoji && r.user_id === currentUserId),
    })).filter(r => r.count > 0);

    const toggle = useCallback(async (emoji: string) => {
        if (!currentUserId || !supabase) return;

        const alreadyReacted = reactions.some(r => r.emoji === emoji && r.user_id === currentUserId);

        if (alreadyReacted) {
            // Remove
            setReactions(prev => prev.filter(r => !(r.emoji === emoji && r.user_id === currentUserId)));
            await supabase.from('message_reactions')
                .delete()
                .eq('message_id', messageId)
                .eq('user_id', currentUserId)
                .eq('emoji', emoji);
        } else {
            // Add
            setReactions(prev => [...prev, { emoji, user_id: currentUserId }]);
            await supabase.from('message_reactions')
                .insert({ message_id: messageId, user_id: currentUserId, emoji });
        }
    }, [messageId, currentUserId, reactions]);

    return (
        <div className={cn('flex flex-wrap items-center gap-1 mt-1', className)}>
            {grouped.map(r => (
                <button
                    key={r.emoji}
                    onClick={() => toggle(r.emoji)}
                    className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] transition-all font-mono',
                        r.hasReacted
                            ? 'border-primary/40 bg-primary/10 text-primary'
                            : 'border-border/60 bg-secondary/30 text-muted-foreground hover:border-primary/30 hover:text-foreground'
                    )}
                >
                    <span>{r.emoji}</span>
                    <span className="font-bold">{r.count}</span>
                </button>
            ))}

            {/* Add reaction button */}
            <div className="relative">
                <button
                    onClick={() => setShowPicker(p => !p)}
                    className="text-[11px] px-1.5 py-0.5 rounded-full border border-dashed border-border/40 text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors"
                >
                    +
                </button>
                {showPicker && (
                    <div className="absolute bottom-full left-0 mb-1 flex gap-1 rounded-lg border border-border bg-card p-2 shadow-xl z-30 animate-in fade-in slide-in-from-bottom-2 duration-150">
                        {QUICK_EMOJIS.map(emoji => (
                            <button
                                key={emoji}
                                onClick={() => { toggle(emoji); setShowPicker(false); }}
                                className="text-base hover:scale-125 transition-transform p-0.5"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
