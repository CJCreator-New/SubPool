import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Search, SendHorizontal } from 'lucide-react';
import { useCurrentUser, useMemberships, useMessages, usePools } from '../../lib/supabase/hooks';
import { getPlatform } from '../../lib/constants';
import type { Pool } from '../../lib/types';
import { getUserFacingError } from '../../lib/error-feedback';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { EmptyState } from '../components/empty-state';
import { CredentialVault } from '../components/credential-vault';
import { cn } from '../components/ui/utils';

function initials(name: string): string {
  const chunks = name.trim().split(/\s+/).filter(Boolean);
  if (chunks.length === 0) return '?';
  if (chunks.length === 1) return chunks[0].slice(0, 1).toUpperCase();
  return (chunks[0][0] + chunks[1][0]).toUpperCase();
}

export function Messages() {
  const [selectedPoolId, setSelectedPoolId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
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

    await sendMessage(nextMessage);
    setMessageInput('');
    setTyping(false);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 20);
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

  return (
    <div className="h-[calc(100vh-120px)] min-h-[520px]">
      <Card className="h-full overflow-hidden border-border">
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
                  className="h-9 pl-9"
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
                    onClick={() => setSelectedPoolId(pool.id)}
                    className={cn(
                      'w-full border-b border-border/60 px-4 py-3 text-left transition-colors',
                      isActive ? 'bg-primary/10' : 'hover:bg-secondary/30',
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="grid size-10 place-items-center rounded-md border border-border/60 bg-secondary/60 text-lg">
                        {platform?.icon ?? '📦'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-display text-sm font-semibold">
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
              'h-full flex-1 flex-col bg-background',
              isMobile ? (showListOnMobile ? 'hidden' : 'flex') : 'flex',
            )}
          >
            {!selectedPool ? (
              <div className="grid h-full place-items-center p-6">
                <p className="font-mono text-xs text-muted-foreground">Select a conversation.</p>
              </div>
            ) : (
              <>
                <header className="flex items-center gap-3 border-b border-border bg-card/50 px-4 py-3">
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

                  <div className="grid size-10 place-items-center rounded-md border border-border/60 bg-secondary/60 text-lg">
                    {selectedPoolPlatform?.icon ?? '📦'}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-display text-sm font-semibold">
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

                <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                  <div className="mb-6">
                    <CredentialVault poolId={selectedPool.id} isOwner={selectedPool.owner_id === currentUser?.id} />
                  </div>

                  {messagesLoading && (
                    <p role="status" aria-live="polite" className="font-mono text-xs text-muted-foreground">Loading messages...</p>
                  )}

                  {!messagesLoading && messages.length === 0 && (
                    <div className="grid h-full min-h-[240px] place-items-center">
                      <p className="font-mono text-xs text-muted-foreground">No messages yet. Start the conversation.</p>
                    </div>
                  )}

                  {messages.map((message) => {
                    const isYou = message.sender_id === currentUser?.id;
                    const senderName = message.sender?.display_name ?? message.sender?.username ?? 'Member';
                    const readByOthers = (message.read_by ?? []).filter((id) => id !== currentUser?.id);
                    const receiptText = isYou ? (readByOthers.length > 0 ? ' • ✓✓' : ' • ✓') : '';

                    return (
                      <div
                        key={message.id}
                        className={cn(
                          'flex items-end gap-2',
                          isYou ? 'justify-end' : 'justify-start',
                        )}
                      >
                        {!isYou && (
                          <Avatar className="size-7">
                            <AvatarFallback style={{ backgroundColor: message.sender?.avatar_color ?? '#2A2A2A' }} className="text-[10px] font-bold text-black">
                              {initials(senderName)}
                            </AvatarFallback>
                          </Avatar>
                        )}

                        <div className={cn('max-w-[72%] min-w-[90px]', isYou ? 'text-right' : 'text-left')}>
                          {!isYou && (
                            <p className="mb-1 font-mono text-[10px] text-muted-foreground">{senderName}</p>
                          )}
                          <div
                            className={cn(
                              'rounded-xl border px-3 py-2',
                              isYou
                                ? 'rounded-br-sm border-primary/30 bg-primary/15'
                                : 'rounded-bl-sm border-border bg-secondary/30',
                            )}
                          >
                            <p className="break-words text-sm leading-relaxed">{message.content}</p>
                          </div>
                          <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {receiptText}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  <div ref={messagesEndRef} />
                </div>

                {typingUsers.length > 0 && (
                  <div role="status" aria-live="polite" className="border-t border-border/60 bg-card/40 px-4 py-2">
                    <p className="font-mono text-[10px] text-muted-foreground">
                      {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                    </p>
                  </div>
                )}

                <footer className="flex items-center gap-2 border-t border-border bg-card/50 px-4 py-3">
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
                    placeholder={`Message ${selectedPoolPlatform?.name ?? selectedPool.platform}`}
                    className="h-10"
                  />
                  <Button
                    size="icon"
                    onClick={handleSend}
                    disabled={!messageInput.trim()}
                    aria-label="Send message"
                  >
                    <SendHorizontal className="size-4" />
                  </Button>
                </footer>
              </>
            )}
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
