// ─── Message Reactions Component ────────────────────────────────────────────
// Displays emoji reactions on a message and allows toggling them.

import { useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase/client';
import { cn } from './ui/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Smile, Plus } from 'lucide-react';

const QUICK_EMOJIS = ['👍', '❤️', '😂', '🔥', '🎉', '👀', '🚀', '💯'];

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
            // Remove locally
            setReactions(prev => prev.filter(r => !(r.emoji === emoji && r.user_id === currentUserId)));
            await supabase.from('message_reactions')
                .delete()
                .eq('message_id', messageId)
                .eq('user_id', currentUserId)
                .eq('emoji', emoji);
        } else {
            // Add locally
            setReactions(prev => [...prev, { emoji, user_id: currentUserId }]);
            await supabase.from('message_reactions')
                .insert({ message_id: messageId, user_id: currentUserId, emoji });
        }
    }, [messageId, currentUserId, reactions]);

    return (
        <div className={cn('flex flex-wrap items-center gap-2 mt-2', className)}>
            <AnimatePresence initial={false}>
                {grouped.map(r => (
                    <motion.button
                        key={r.emoji}
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggle(r.emoji)}
                        className={cn(
                            'inline-flex items-center gap-2 px-3 py-1 rounded-xl border text-[11px] transition-all font-mono relative overflow-hidden group',
                            r.hasReacted
                                ? 'border-primary/40 bg-primary/10 text-primary shadow-[0_0_10px_rgba(200,241,53,0.1)]'
                                : 'border-white/5 bg-white/[0.02] text-muted-foreground hover:border-white/10 hover:text-foreground'
                        )}
                    >
                        {r.hasReacted && (
                            <div className="absolute inset-0 bg-primary/5 scan-line opacity-20" />
                        )}
                        <span className="text-sm">{r.emoji}</span>
                        <span className="font-black tracking-tighter">{r.count}</span>
                    </motion.button>
                ))}
            </AnimatePresence>

            {/* Add reaction button */}
            <div className="relative">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowPicker(p => !p)}
                    className={cn(
                        "size-8 rounded-xl border border-dashed border-white/10 flex items-center justify-center text-muted-foreground transition-all",
                        showPicker ? "bg-primary/20 border-primary/40 text-primary" : "hover:border-white/20 hover:bg-white/5"
                    )}
                >
                    <Plus size={14} />
                </motion.button>

                <AnimatePresence>
                    {showPicker && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowPicker(false)} />
                            <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                className="absolute bottom-full left-0 mb-3 p-3 rounded-2xl border border-white/10 glass backdrop-blur-xl shadow-2xl z-50 flex gap-1 min-w-[240px] flex-wrap justify-center"
                            >
                                {QUICK_EMOJIS.map(emoji => (
                                    <motion.button
                                        key={emoji}
                                        whileHover={{ scale: 1.2 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => { toggle(emoji); setShowPicker(false); }}
                                        className="size-10 flex items-center justify-center text-xl hover:bg-white/5 rounded-xl transition-colors"
                                    >
                                        {emoji}
                                    </motion.button>
                                ))}
                                <div className="absolute -bottom-1.5 left-4 size-3 bg-card border-r border-b border-white/10 rotate-45" />
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
