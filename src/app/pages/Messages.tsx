import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Search, SendHorizontal, Reply, Smile, X } from 'lucide-react';
import { useCurrentUser, useMemberships, useMessages, usePools } from '../../lib/supabase/hooks';
import { getPlatform } from '../../lib/constants';
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

    return [...ownedPools, ...joinedPools].filter(
      (pool, index, all) => all.findIndex((candidate) => candidate.id === pool.id) === index,
    );
  }, [ownedPools, memberships]);

  const filteredPools = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return activePools;
    return activePools.filter((pool) => {
      const platform = getPlatform(pool.platform);
      const label = `${platform?.name ?? pool.platform} ${pool.plan_name}`.toLowerCase();
      return label.includes(query);
    });
  }, [activePools, searchQuery]);

  const selectedPool = activePools.find((pool) => pool.id === selectedPoolId) ?? activePools[0];
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
    if (typeof window === 'undefined') return;
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!selectedPoolId) return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    markAsRead();
  }, [messages, selectedPoolId, markAsRead]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleInputChange = (value: string) => {
    setMessageInput(value);
    setTyping(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setTyping(false), 1800);
  };

  const handleSend = async () => {
    const nextMessage = messageInput.trim();
    if (!nextMessage || !selectedPool) return;

    await sendMessage(nextMessage, replyingTo || undefined);
    setMessageInput('');
    setReplyingTo(null);
    setTyping(false);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
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
    <div className="h-[calc(100vh-120px)] min-h-[520px]">
      <Card className="h-full overflow-hidden border-border bg-card shadow-sm">
        <CardContent className="flex h-full p-0">
          <aside
            className={cn(
              'h-full border-r border-border bg-card/60 flex flex-col',
              isMobile ? 'w-full' : 'w-[320px]',
              showListOnMobile || !isMobile ? 'flex' : 'hidden',
            )}
          >
            <div className="border-b border-border p-4">
              <label htmlFor="message-search" className="sr-only">Search conversations</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="message-search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search conversations"
                  className="h-9 pl-9 bg-background focus-visible:ring-1"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredPools.length === 0 && (
                <div className="grid h-full place-items-center p-6">
                  <p className="font-mono text-xs text-muted-foreground">No matching conversations.</p>
                </div>
              )}

              {filteredPools.map((pool) => {
                const platform = getPlatform(pool.platform);
                const isActive = pool.id === selectedPool?.id;

                return (
                  <button
                    key={pool.id}
                    onClick={() => { setSelectedPoolId(pool.id); setReplyingTo(null); }}
                    className={cn(
                      'w-full border-b border-border/60 px-4 py-3 text-left transition-colors',
                      isActive ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-secondary/30',
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="grid size-10 place-items-center rounded-md border border-border/60 bg-secondary/60 text-lg shadow-sm">
                        {platform?.icon ?? '📦'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={cn("truncate font-display text-sm", isActive ? 'font-bold text-primary' : 'font-semibold text-foreground')}>
                          {platform?.name ?? pool.platform} {pool.plan_name}
                        </p>
                        <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
                          {pool.filled_slots}/{pool.total_slots} members
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <section
            className={cn(
              'h-full flex-1 flex-col bg-background/50 relative',
              isMobile ? (showListOnMobile ? 'hidden' : 'flex') : 'flex',
            )}
          >
            {!selectedPool ? (
              <div className="grid h-full place-items-center p-6">
                <p className="font-mono text-xs text-muted-foreground">Select a conversation.</p>
              </div>
            ) : (
              <>
                <header className="flex items-center gap-3 border-b border-border bg-card/80 backdrop-blur px-4 py-3 sticky top-0 z-10">
                  {isMobile && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedPoolId('')}
                      aria-label="Back to conversations"
                    >
                      <ArrowLeft className="size-4" />
                    </Button>
                  )}

                  <div className="grid size-10 place-items-center rounded-md border border-border/60 bg-secondary/80 text-lg shadow-sm">
                    {selectedPoolPlatform?.icon ?? '📦'}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-display text-sm font-semibold text-foreground">
                      {selectedPoolPlatform?.name ?? selectedPool.platform} {selectedPool.plan_name}
                    </p>
                    <p className="font-mono text-[11px] text-muted-foreground">
                      {selectedPool.filled_slots}/{selectedPool.total_slots} members
                    </p>
                  </div>
                </header>

                {messagesErrorMessage && (
                  <div className="mx-4 mt-4 rounded-md border border-warning/30 bg-warning/10 px-3 py-2">
                    <p className="font-mono text-xs text-warning">{messagesErrorMessage}</p>
                  </div>
                )}

                <div className="flex-1 space-y-4 overflow-y-auto px-4 py-6 scroll-smooth">
                  <div className="mb-6">
                    <CredentialVault poolId={selectedPool.id} isOwner={selectedPool.owner_id === currentUser?.id} />
                  </div>

                  {messagesLoading && (
                    <p role="status" aria-live="polite" className="font-mono text-xs text-muted-foreground animate-pulse text-center">Loading history...</p>
                  )}

                  {!messagesLoading && messages.length === 0 && (
                    <div className="grid h-full min-h-[240px] place-items-center">
                      <div className="text-center space-y-2">
                        <div className="text-3xl">👋</div>
                        <p className="font-mono text-xs text-muted-foreground">No messages yet. Say hello!</p>
                      </div>
                    </div>
                  )}

                  {messages.map((message) => {
                    const isYou = message.sender_id === currentUser?.id;
                    const senderName = message.sender?.display_name ?? message.sender?.username ?? 'Member';
                    const readByOthers = (message.read_by ?? []).filter((id) => id !== currentUser?.id);
                    const receiptText = isYou ? (readByOthers.length > 0 ? ' • ✓✓' : ' • ✓') : '';
                    
                    const repliedTo = message.reply_to_id ? messages.find(m => m.id === message.reply_to_id) : null;
                    const repliedSender = repliedTo ? (repliedTo.sender?.display_name ?? repliedTo.sender?.username ?? 'Someone') : '';

                    // Group reactions
                    const reactions = (message.message_reactions || []).reduce((acc, r: MessageReaction) => {
                      acc[r.emoji] = acc[r.emoji] || [];
                      acc[r.emoji].push(r.user_id);
                      return acc;
                    }, {} as Record<string, string[]>);

                    return (
                      <div
                        key={message.id}
                        className={cn(
                          'flex items-end gap-2 group',
                          isYou ? 'justify-end' : 'justify-start',
                        )}
                      >
                        {!isYou && (
                          <Avatar className="size-8 self-end mb-4 border border-border/50 shadow-sm">
                            <AvatarFallback style={{ backgroundColor: message.sender?.avatar_color ?? '#2A2A2A' }} className="text-[10px] font-bold text-black">
                              {initials(senderName)}
                            </AvatarFallback>
                          </Avatar>
                        )}

                        <div className={cn('max-w-[75%] min-w-[120px] flex flex-col', isYou ? 'items-end' : 'items-start')}>
                          {!isYou && (
                            <p className="mb-1 ml-1 font-mono text-[10px] text-muted-foreground">{senderName}</p>
                          )}
                          
                          <div className={cn('flex items-center gap-1', isYou ? 'flex-row-reverse' : 'flex-row')}>
                            <div
                              className={cn(
                                'rounded-2xl px-3.5 py-2.5 shadow-sm relative',
                                isYou
                                  ? 'rounded-br-sm border border-primary/20 bg-primary/10 text-primary-foreground'
                                  : 'rounded-bl-sm border border-border/80 bg-card text-card-foreground',
                              )}
                            >
                              {repliedTo && (
                                <div className={cn(
                                  "mb-1.5 rounded-lg px-2.5 py-1.5 text-xs select-none border-l-2",
                                  isYou ? "bg-background/20 text-muted-foreground border-primary/50" : "bg-muted/50 text-muted-foreground border-border"
                                )}>
                                  <p className="font-bold text-[10px] opacity-80 mb-0.5">{repliedSender}</p>
                                  <p className="truncate max-w-[200px] opacity-90 font-mono text-[10px] line-clamp-1">{repliedTo.content}</p>
                                </div>
                              )}
                              
                              <p className="break-words text-[13px] leading-relaxed select-text">{message.content}</p>
                            </div>

                            {/* Message Actions (Hover) */}
                            <div className={cn("opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1", isYou ? "mr-1" : "ml-1")}>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-secondary/80">
                                    <Smile className="size-3 cursor-pointer text-muted-foreground" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent side="top" className="w-auto p-1.5 flex gap-1 rounded-full border-border/50 bg-card/95 backdrop-blur shadow-md">
                                  {COMMON_EMOJIS.map(emoji => (
                                    <button 
                                      key={emoji} 
                                      onClick={() => toggleReaction(message.id, emoji)}
                                      className="hover:bg-secondary rounded-full w-8 h-8 flex items-center justify-center text-lg transition-transform hover:scale-110"
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </PopoverContent>
                              </Popover>
                              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-secondary/80" onClick={() => setReplyingTo(message.id)}>
                                <Reply className="size-3 cursor-pointer text-muted-foreground" />
                              </Button>
                            </div>
                          </div>

                          {/* Reactions Display */}
                          {Object.keys(reactions).length > 0 && (
                            <div className={cn("flex flex-wrap gap-1 mt-1 z-10", isYou ? "-mr-2" : "-ml-2")}>
                              {Object.entries(reactions).map(([emoji, users]) => {
                                const iReacted = currentUser && users.includes(currentUser.id);
                                return (
                                  <button
                                    key={emoji}
                                    onClick={() => toggleReaction(message.id, emoji)}
                                    className={cn(
                                      "flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium border shadow-sm transition-colors cursor-pointer",
                                      iReacted ? "bg-primary/20 border-primary/30 text-primary" : "bg-card border-border/60 text-muted-foreground hover:bg-secondary"
                                    )}
                                  >
                                    <span>{emoji}</span>
                                    {users.length > 1 && <span>{users.length}</span>}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          <p className={cn("mt-1.5 font-mono text-[9px] text-muted-foreground/70", isYou ? "mr-1" : "ml-1")}>
                            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {receiptText}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  <div ref={messagesEndRef} className="pt-2" />
                </div>

                {typingUsers.length > 0 && (
                  <div role="status" aria-live="polite" className="absolute bottom-[60px] left-0 w-full px-4 py-1.5 bg-gradient-to-t from-background via-background/90 to-transparent pointer-events-none">
                     <div className="flex items-center gap-2">
                        <div className="flex gap-1 h-1.5 items-end">
                          <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <p className="font-mono text-[10px] text-muted-foreground">
                            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                        </p>
                     </div>
                  </div>
                )}

                <footer className="border-t border-border bg-card/80 backdrop-blur z-20">
                  {replyingMessage && (
                    <div className="flex items-center justify-between px-4 py-2 bg-secondary/30 border-b border-border text-xs">
                      <div className="flex flex-col gap-0.5 max-w-[85%]">
                        <span className="font-bold text-[10px] text-primary">Replying to {replyingMessage.sender?.display_name || replyingMessage.sender?.username || 'Someone'}:</span>
                        <span className="text-muted-foreground truncate opacity-80 line-clamp-1">{replyingMessage.content}</span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-destructive/10 text-muted-foreground" onClick={() => setReplyingTo(null)}>
                        <X className="size-3" />
                      </Button>
                    </div>
                  )}
                  <div className="flex items-end gap-2 px-4 py-3">
                    <label htmlFor="message-compose" className="sr-only">Type a message</label>
                    <Input
                      id="message-compose"
                      value={messageInput}
                      onChange={(event) => handleInputChange(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' && !event.shiftKey) {
                          event.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder={`Message ${selectedPoolPlatform?.name ?? selectedPool.platform}...`}
                      className="min-h-[44px] bg-background focus-visible:ring-1 text-[13px]"
                      autoComplete="off"
                    />
                    <Button
                      size="icon"
                      className="size-[44px] shrink-0 font-medium"
                      onClick={handleSend}
                      disabled={!messageInput.trim()}
                      aria-label="Send message"
                    >
                      <SendHorizontal className="size-4" />
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
