import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Search, SendHorizontal, Reply, Smile, X, Hash, Info, CheckCheck, Check } from 'lucide-react';
import { useCurrentUser, useMemberships, useMessages, usePools } from '../../lib/supabase/hooks';
import { getPlatform } from '../../lib/constants';
import { sanitizeInput } from '../../lib/validation';
import type { Pool, MessageReaction } from '../../lib/types';
import { getUserFacingError } from '../../lib/error-feedback';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { EmptyState } from '../components/empty-state';
import { CredentialVault } from '../components/credential-vault';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { cn } from '../components/ui/utils';

function initials(name: string): string {
  const chunks = name.trim().split(/\s+/).filter(Boolean);
  if (chunks.length === 0) return '?';
  if (chunks.length === 1) return chunks[0].slice(0, 1).toUpperCase();
  return (chunks[0][0] + chunks[1][0]).toUpperCase();
}

const COMMON_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

const Badge = ({ children, variant = 'default', className }: { children: React.ReactNode; variant?: 'default' | 'outline'; className?: string }) => (
    <span className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-tight",
        variant === 'default' ? "bg-primary text-primary-foreground" : "border border-border/40 bg-transparent text-muted-foreground",
        className
    )}>
        {children}
    </span>
);

export function Messages() {
  const [selectedPoolId, setSelectedPoolId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 768 : false));

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: currentUser } = useCurrentUser();
  const { data: ownedPools } = usePools({ ownerId: currentUser?.id ?? 'none' });
  const { data: memberships } = useMemberships();

  const activePools = useMemo(() => {
    const joinedPools = memberships
      .filter((membership) => membership.status === 'active')
      .map((membership) => membership.pool)
      .filter((pool): pool is Pool => Boolean(pool));

    const all = [...ownedPools, ...joinedPools];
    return all.filter((pool, index) => all.findIndex(p => p.id === pool.id) === index);
  }, [ownedPools, memberships]);

  const filteredPools = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return activePools;
    return activePools.filter((pool) => {
      const platform = getPlatform(pool.platform);
      return `${platform?.name ?? pool.platform} ${pool.plan_name}`.toLowerCase().includes(query);
    });
  }, [activePools, searchQuery]);

  const selectedPool = useMemo(() => 
    activePools.find((pool) => pool.id === selectedPoolId) ?? activePools[0],
    [activePools, selectedPoolId]
  );

  const selectedPoolPlatform = selectedPool ? getPlatform(selectedPool.platform) : null;

  const {
    data: messages,
    loading: messagesLoading,
    error: messagesError,
    sendMessage,
    markAsRead,
    toggleReaction,
    typingUsers,
    setTyping,
  } = useMessages(selectedPool?.id);

  const messagesErrorMessage = messagesError
    ? getUserFacingError(messagesError, 'load messages').message
    : null;

  useEffect(() => {
    if (!selectedPoolId && activePools.length > 0) {
      setSelectedPoolId(activePools[0].id);
    }
  }, [activePools, selectedPoolId]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
    }, 100);
  }, []);

  useEffect(() => {
    if (selectedPoolId) {
      scrollToBottom(messages.length <= 1 ? 'auto' : 'smooth');
      markAsRead();
    }
  }, [messages.length, selectedPoolId, markAsRead, scrollToBottom]);

  const handleInputChange = (value: string) => {
    setMessageInput(value);
    setTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setTyping(false), 2000);
  };

  const handleSend = async () => {
    const rawContent = messageInput.trim();
    if (!rawContent || !selectedPool) return;

    // Apply Level 5 SecOps HTML/XSS Sanitization bounds
    const secureContent = sanitizeInput(rawContent);

    setMessageInput('');
    setReplyingTo(null);
    setTyping(false);
    
    await sendMessage(secureContent, replyingTo || undefined);
    scrollToBottom();
  };

  if (activePools.length === 0) {
    return (
      <EmptyState
        icon="✉️"
        title="No conversations yet"
        description="Join or host a pool to start messaging members."
      />
    );
  }

  const showListOnMobile = isMobile && !selectedPoolId;
  const replyingMessage = replyingTo ? messages.find(m => m.id === replyingTo) : null;

  return (
    <div className="h-[calc(100vh-140px)] min-h-[580px] py-4">
      <Card className="h-full overflow-hidden border-border/40 glass bg-surface-gradient shadow-2xl rounded-3xl">
        <CardContent className="flex h-full p-0">
          {/* Sidebar */}
          <aside
            className={cn(
              'h-full border-r border-border/40 bg-card/40 backdrop-blur-xl flex flex-col transition-all duration-500',
              isMobile ? 'w-full' : 'w-[360px]',
              showListOnMobile || !isMobile ? 'flex' : 'hidden',
            )}
          >
            <div className="p-6 border-b border-border/40">
              <h1 className="font-display font-black text-2xl tracking-tight mb-4">Messages</h1>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter nodes..."
                  className="h-11 pl-10 bg-background/30 border-border/60 focus-visible:ring-primary/20 rounded-xl font-mono text-xs"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {filteredPools.length === 0 && (
                <div className="p-10 text-center">
                  <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">No active channels</p>
                </div>
              )}

              <motion.div 
                initial="hidden"
                animate="show"
                variants={{
                    hidden: { opacity: 0 },
                    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
                }}
              >
                {filteredPools.map((pool) => {
                    const platform = getPlatform(pool.platform);
                    const isActive = pool.id === selectedPool?.id;

                    return (
                    <motion.button
                        variants={{
                            hidden: { opacity: 0, x: -10 },
                            show: { opacity: 1, x: 0 }
                        }}
                        key={pool.id}
                        onClick={() => { setSelectedPoolId(pool.id); setReplyingTo(null); }}
                        className={cn(
                        'w-full px-6 py-4 text-left transition-all relative group',
                        isActive ? 'bg-primary/5' : 'hover:bg-white/5',
                        )}
                    >
                        {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
                        
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="size-12 rounded-2xl bg-secondary/80 flex items-center justify-center border border-border/60 shadow-inner overflow-hidden group-hover:scale-105 transition-transform duration-300">
                                    {platform?.icon ? (
                                        <div className="text-xl">{platform.icon}</div>
                                    ) : (
                                        <Hash size={20} className="text-muted-foreground" />
                                    )}
                                </div>
                                <div className="absolute -bottom-1 -right-1 size-4 rounded-full bg-background border-2 border-card flex items-center justify-center">
                                    <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                                </div>
                            </div>
                            
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between mb-0.5">
                                    <p className={cn("truncate font-display text-sm tracking-tight", isActive ? 'font-black text-foreground' : 'font-bold text-muted-foreground group-hover:text-foreground')}>
                                        {platform?.name ?? pool.platform}
                                    </p>
                                    <span className="font-mono text-[9px] text-muted-foreground/50">{pool.plan_name}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="truncate font-mono text-[10px] text-muted-foreground/60 uppercase tracking-tighter">
                                        {pool.filled_slots}/{pool.total_slots} active nodes
                                    </p>
                                    {isActive && <div className="size-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />}
                                </div>
                            </div>
                        </div>
                    </motion.button>
                    );
                })}
              </motion.div>
            </div>
          </aside>

          {/* Chat Section */}
          <section
            className={cn(
              'h-full flex-1 flex flex-col bg-background/20 relative',
              isMobile ? (showListOnMobile ? 'hidden' : 'flex') : 'flex',
            )}
          >
            {!selectedPool ? (
              <div className="flex-1 flex flex-col items-center justify-center p-10 opacity-40">
                <div className="p-6 rounded-3xl bg-secondary/50 border border-dashed border-border mb-4">
                    <SendHorizontal size={32} className="text-muted-foreground" />
                </div>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Select uplink to initialize</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <header className="flex items-center justify-between border-b border-border/40 bg-card/60 backdrop-blur-xl px-8 py-5 sticky top-0 z-10">
                  <div className="flex items-center gap-4">
                    {isMobile && (
                        <Button variant="ghost" size="icon" onClick={() => setSelectedPoolId('')} className="rounded-xl mr-2" aria-label="Go back to node list">
                            <ArrowLeft size={18} />
                        </Button>
                    )}
                    <div className="size-10 rounded-xl bg-secondary/80 flex items-center justify-center border border-border/40 shadow-sm">
                        {selectedPoolPlatform?.icon ?? '📦'}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="font-display font-black text-base text-foreground tracking-tight">
                                {selectedPoolPlatform?.name ?? selectedPool.platform}
                            </h2>
                            <Badge variant="outline" className="text-[9px] h-4 font-mono px-1.5 opacity-50 capitalize">{selectedPool.category}</Badge>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-[9px] text-muted-foreground uppercase tracking-widest">
                            <span className="flex items-center gap-1.5">
                                <div className="size-1.5 rounded-full bg-emerald-500" />
                                {selectedPool.filled_slots} Members Active
                            </span>
                        </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:text-foreground" aria-label="View node information">
                        <Info size={18} />
                    </Button>
                  </div>
                </header>

                {/* Messages Area */}
                <div className="flex-1 flex flex-col overflow-hidden relative">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
                    
                    <div className="flex-1 overflow-y-auto px-8 py-10 custom-scrollbar scroll-smooth flex flex-col gap-8">
                        <div className="max-w-md mx-auto w-full">
                            <CredentialVault poolId={selectedPool.id} isOwner={selectedPool.owner_id === currentUser?.id} />
                        </div>

                        {messagesLoading && (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="flex gap-2">
                                    <div className="size-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="size-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="size-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        )}

                        {!messagesLoading && messages.length === 0 && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex-1 flex flex-col items-center justify-center text-center opacity-30"
                            >
                                <div className="size-20 rounded-full border border-dashed border-border mb-6 flex items-center justify-center text-3xl">👋</div>
                                <p className="font-display font-bold text-lg mb-2">New Node Initialized</p>
                                <p className="font-mono text-[10px] uppercase tracking-widest">Transmit the first message to sync</p>
                            </motion.div>
                        )}

                        <AnimatePresence initial={false}>
                            {messages.map((message) => {
                                const isYou = message.sender_id === currentUser?.id;
                                const senderName = message.sender?.display_name ?? message.sender?.username ?? 'Member';
                                const readByOthers = (message.read_by ?? []).filter((id) => id !== currentUser?.id);
                                
                                const repliedTo = message.reply_to_id ? messages.find(m => m.id === message.reply_to_id) : null;
                                const repliedSender = repliedTo ? (repliedTo.sender?.display_name ?? repliedTo.sender?.username ?? 'Someone') : '';

                                const reactions = (message.message_reactions || []).reduce((acc: Record<string, string[]>, r: MessageReaction) => {
                                    acc[r.emoji] = acc[r.emoji] || [];
                                    acc[r.emoji].push(r.user_id);
                                    return acc;
                                }, {});

                                return (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                        className={cn(
                                            'flex gap-4 group max-w-2xl',
                                            isYou ? 'ml-auto flex-row-reverse' : 'mr-auto'
                                        )}
                                    >
                                        {!isYou && (
                                            <Avatar className="size-10 border border-border/40 shadow-lg shrink-0 mt-auto">
                                                <AvatarFallback style={{ backgroundColor: message.sender?.avatar_color ?? '#2A2A2A' }} className="text-xs font-black text-black">
                                                    {initials(senderName)}
                                                </AvatarFallback>
                                            </Avatar>
                                        )}

                                        <div className={cn('flex flex-col gap-1', isYou ? 'items-end' : 'items-start')}>
                                            <div className="flex items-center gap-2 mb-1">
                                                {!isYou && <span className="font-display font-black text-[11px] text-foreground tracking-tight">{senderName}</span>}
                                                <span className="font-mono text-[9px] text-muted-foreground/40 uppercase">
                                                    {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>

                                            <div className={cn('flex items-end gap-2', isYou ? 'flex-row-reverse' : 'flex-row')}>
                                                <div className={cn(
                                                    'relative px-5 py-4 rounded-3xl shadow-lg border transition-all duration-300',
                                                    isYou 
                                                        ? 'bg-primary text-primary-foreground border-primary/20 rounded-br-md shadow-primary/10'
                                                        : 'bg-card/80 backdrop-blur-md border-border/40 text-foreground rounded-bl-md hover:bg-card hover:border-border/60'
                                                )}>
                                                    {repliedTo && (
                                                        <div className={cn(
                                                            "mb-3 rounded-2xl px-4 py-2 text-xs border-l-4",
                                                            isYou ? "bg-black/10 border-white/20 text-white/70" : "bg-muted/30 border-primary/40 text-muted-foreground"
                                                        )}>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Reply size={10} />
                                                                <span className="font-bold text-[10px] uppercase tracking-wide">Replying to {repliedSender}</span>
                                                            </div>
                                                            <p className="line-clamp-2 text-[11px] opacity-80 leading-relaxed italic">{repliedTo.content}</p>
                                                        </div>
                                                    )}
                                                    
                                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                                                    
                                                    {isYou && (
                                                        <div className="absolute -bottom-1 -right-6 flex items-center opacity-40">
                                                            {readByOthers.length > 0 ? <CheckCheck size={12} className="text-primary" /> : <Check size={12} />}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="size-8 rounded-xl bg-secondary/50 hover:bg-secondary border border-border/40" aria-label="Add reaction">
                                                                <Smile size={14} className="text-muted-foreground" />
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent side="top" className="w-auto p-2 flex gap-2 rounded-2xl border-border/40 glass backdrop-blur shadow-2xl">
                                                            {COMMON_EMOJIS.map(emoji => (
                                                                <button 
                                                                    key={emoji} 
                                                                    onClick={() => toggleReaction(message.id, emoji)}
                                                                    className="hover:bg-primary/20 rounded-xl size-10 flex items-center justify-center text-xl transition-transform hover:scale-110 active:scale-95"
                                                                >
                                                                    {emoji}
                                                                </button>
                                                            ))}
                                                        </PopoverContent>
                                                    </Popover>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="size-8 rounded-xl bg-secondary/50 hover:bg-secondary border border-border/40"
                                                        onClick={() => {
                                                            setReplyingTo(message.id);
                                                            document.getElementById('message-compose')?.focus();
                                                        }}
                                                    >
                                                        <Reply size={14} className="text-muted-foreground" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {Object.keys(reactions).length > 0 && (
                                                <div className={cn("flex flex-wrap gap-1.5 mt-2", isYou ? "justify-end" : "justify-start")}>
                                                    {Object.entries(reactions).map(([emoji, users]) => {
                                                        const iReacted = currentUser && users.includes(currentUser.id);
                                                        return (
                                                            <button
                                                                key={emoji}
                                                                onClick={() => toggleReaction(message.id, emoji)}
                                                                className={cn(
                                                                    "flex items-center gap-2 rounded-full px-2.5 py-1 text-[10px] font-bold border transition-all active:scale-95",
                                                                    iReacted ? "bg-primary/20 border-primary/40 text-primary" : "bg-background/40 border-border/40 text-muted-foreground hover:border-border"
                                                                )}
                                                            >
                                                                <span>{emoji}</span>
                                                                {users.length > 1 && <span>{users.length}</span>}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                        <div ref={messagesEndRef} className="h-4" />
                    </div>

                    {/* Typing Indicator Overlay */}
                    <AnimatePresence>
                        {typingUsers.length > 0 && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute bottom-4 left-8 z-10"
                            >
                                <div className="bg-card/80 backdrop-blur-md border border-border/40 px-4 py-2 rounded-2xl shadow-xl flex items-center gap-3">
                                    <div className="flex gap-1">
                                        <div className="size-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="size-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="size-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                    <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                                        {typingUsers.length === 1 ? `${typingUsers[0]} is typing` : 'Sequential transmission in progress'}
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Input Area */}
                <footer className="p-6 bg-card/60 backdrop-blur-xl border-t border-border/40 relative z-20">
                    {replyingMessage && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mb-4 bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <Reply size={14} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-mono uppercase tracking-widest text-primary font-black mb-0.5">Uplink Target: {replyingMessage.sender?.display_name || 'Member'}</p>
                                    <p className="text-xs text-muted-foreground truncate opacity-80">{replyingMessage.content}</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="size-8 rounded-xl hover:bg-destructive/10 text-muted-foreground" onClick={() => setReplyingTo(null)}>
                                <X size={14} />
                            </Button>
                        </motion.div>
                    )}

                    <div className="flex items-end gap-3 max-w-4xl mx-auto">
                        <div className="flex-1 relative">
                            <Input
                                id="message-compose"
                                value={messageInput}
                                onChange={(e) => handleInputChange(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                placeholder={`Transmit to ${selectedPoolPlatform?.name ?? 'Node'} pipeline...`}
                                className="min-h-[56px] py-4 bg-background/50 border-border/60 focus-visible:ring-primary/20 rounded-2xl font-mono text-sm shadow-inner"
                                autoComplete="off"
                            />
                        </div>
                        <Button
                            className="size-[56px] rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-transform active:scale-95"
                            onClick={handleSend}
                            disabled={!messageInput.trim()}
                            aria-label="Send message"
                        >
                            <SendHorizontal className="size-5" />
                        </Button>
                    </div>
                </footer>
              </>
            )}
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
