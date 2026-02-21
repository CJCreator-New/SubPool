import React, { useState } from 'react';
import { C, F } from '../tokens';
import { Avatar } from '../components/subpool/Avatar';
import { Button } from '../components/subpool/Button';
import { Send, Paperclip, ArrowLeft } from 'lucide-react';

interface Message {
  id: string;
  sender: 'you' | 'other' | 'system';
  senderName?: string;
  content: string;
  timestamp: string;
  avatar?: string;
}

interface Conversation {
  id: string;
  poolIcon: string;
  poolName: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  messages: Message[];
}

export function Messages() {
  const [selectedConvId, setSelectedConvId] = useState('netflix');
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [selectedConvId]);

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      // In a real app, send message here
      setMessageInput('');
      setTimeout(scrollToBottom, 100);
    }
  };
  const conversations: Conversation[] = [
    {
      id: 'netflix',
      poolIcon: '🎬',
      poolName: 'Netflix Standard',
      lastMessage: 'Riya: Thanks for the quick payment! 🙏',
      timestamp: '2h ago',
      unread: 1,
      messages: [
        {
          id: '1',
          sender: 'other',
          senderName: 'Riya K',
          content: 'Hey everyone! Just a reminder that payment is due in 3 days.',
          timestamp: '2d ago',
          avatar: 'R',
        },
        {
          id: '2',
          sender: 'you',
          content: 'Got it, will send tomorrow!',
          timestamp: '2d ago',
        },
        {
          id: '3',
          sender: 'system',
          content: 'Sam M joined the pool',
          timestamp: '1d ago',
        },
        {
          id: '4',
          sender: 'other',
          senderName: 'Sam M',
          content: 'Hey all! Excited to be part of the pool. When is the next payment?',
          timestamp: '1d ago',
          avatar: 'S',
        },
        {
          id: '5',
          sender: 'other',
          senderName: 'Riya K',
          content: 'Welcome Sam! Next payment is Feb 28th.',
          timestamp: '1d ago',
          avatar: 'R',
        },
        {
          id: '6',
          sender: 'you',
          content: 'Payment sent! ✅',
          timestamp: '4h ago',
        },
        {
          id: '7',
          sender: 'other',
          senderName: 'Riya K',
          content: 'Thanks for the quick payment! 🙏',
          timestamp: '2h ago',
          avatar: 'R',
        },
      ],
    },
    {
      id: 'spotify',
      poolIcon: '🎵',
      poolName: 'Spotify Duo',
      lastMessage: 'You: Got it, will send tomorrow',
      timestamp: 'Yesterday',
      unread: 0,
      messages: [],
    },
    {
      id: 'figma',
      poolIcon: '🎨',
      poolName: 'Figma Professional',
      lastMessage: 'Sam: New billing info...',
      timestamp: '2d ago',
      unread: 3,
      messages: [],
    },
    {
      id: 'youtube',
      poolIcon: '▶️',
      poolName: 'YouTube Premium',
      lastMessage: 'Jay M joined the pool',
      timestamp: '3d ago',
      unread: 0,
      messages: [],
    },
    {
      id: 'chatgpt',
      poolIcon: '🤖',
      poolName: 'ChatGPT Plus',
      lastMessage: 'Elena: Welcome to the pool!',
      timestamp: '1w ago',
      unread: 0,
      messages: [],
    },
  ];

  const selectedConv = conversations.find(c => c.id === selectedConvId) || conversations[0];

  const ConversationList = ({ fullWidth }: { fullWidth?: boolean }) => (
    <div
      style={{
        width: fullWidth ? '100%' : 320,
        height: fullWidth ? 'auto' : '100%',
        backgroundColor: C.bgSurface,
        borderRight: fullWidth ? 'none' : `1px solid ${C.borderDefault}`,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Search */}
      <div style={{ padding: 16, borderBottom: `1px solid ${C.borderDefault}` }}>
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 14px',
            backgroundColor: C.bgBase,
            border: `1px solid ${C.borderDefault}`,
            borderRadius: 6,
            color: C.textPrimary,
            fontFamily: F.syne,
            fontSize: 13,
            outline: 'none',
          }}
        />
      </div>

      {/* Conversation items */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {conversations.map((conv) => {
          const isActive = conv.id === selectedConvId;
          return (
            <div
              key={conv.id}
              onClick={() => setSelectedConvId(conv.id)}
              style={{
                padding: 16,
                borderBottom: `1px solid ${C.borderDefault}`,
                cursor: 'pointer',
                backgroundColor: isActive ? C.bgHover : 'transparent',
                transition: 'background-color 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 6,
                    backgroundColor: C.bgBase,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    flexShrink: 0,
                  }}
                >
                  {conv.poolIcon}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span
                      style={{
                        fontFamily: F.syne,
                        fontWeight: conv.unread > 0 ? 700 : 600,
                        fontSize: 14,
                        color: C.textPrimary,
                      }}
                    >
                      {conv.poolName}
                    </span>
                    <span
                      style={{
                        fontFamily: F.mono,
                        fontSize: 10,
                        color: C.textMuted,
                      }}
                    >
                      {conv.timestamp}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <span
                      style={{
                        fontFamily: F.syne,
                        fontSize: 13,
                        color: C.textMuted,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1,
                      }}
                    >
                      {conv.lastMessage}
                    </span>
                    {conv.unread > 0 && (
                      <>
                        <div
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: C.accentLime,
                            flexShrink: 0,
                          }}
                        />
                        <div
                          style={{
                            padding: '2px 6px',
                            borderRadius: 100,
                            backgroundColor: C.accentLime,
                            color: C.bgBase,
                            fontFamily: F.mono,
                            fontWeight: 600,
                            fontSize: 10,
                            flexShrink: 0,
                          }}
                        >
                          {conv.unread}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const ChatView = () => (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: C.bgBase,
      }}
    >
      {/* Chat header */}
      <div
        style={{
          padding: 16,
          borderBottom: `1px solid ${C.borderDefault}`,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          backgroundColor: C.bgSurface,
        }}
      >
        {isMobile && (
          <button
            onClick={() => setSelectedConvId('')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: C.textPrimary,
            }}
          >
            <ArrowLeft size={20} />
          </button>
        )}

        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 6,
            backgroundColor: C.bgBase,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
          }}
        >
          {selectedConv.poolIcon}
        </div>

        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: F.syne,
              fontWeight: 600,
              fontSize: 15,
              color: C.textPrimary,
              marginBottom: 2,
            }}
          >
            {selectedConv.poolName}
          </div>
          <div
            style={{
              fontFamily: F.mono,
              fontSize: 11,
              color: C.textMuted,
            }}
          >
            4 members
          </div>
        </div>

        <button
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            backgroundColor: 'transparent',
            border: `1px solid ${C.borderDefault}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: 16,
          }}
        >
          ⚙️
        </button>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {selectedConv.messages.map((msg) => {
          if (msg.sender === 'system') {
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  padding: '8px 0',
                }}
              >
                <div
                  style={{
                    padding: '6px 12px',
                    backgroundColor: C.bgSurface,
                    border: `1px solid ${C.borderDefault}`,
                    borderRadius: 100,
                    fontFamily: F.mono,
                    fontSize: 11,
                    color: C.textMuted,
                  }}
                >
                  {msg.content}
                </div>
              </div>
            );
          }

          const isYou = msg.sender === 'you';

          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: isYou ? 'row-reverse' : 'row',
                gap: 10,
                alignItems: 'flex-start',
              }}
            >
              {!isYou && (
                <Avatar
                  initials={msg.avatar || 'U'}
                  size="sm"
                  color={C.accentLime}
                />
              )}

              <div
                style={{
                  maxWidth: '65%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  alignItems: isYou ? 'flex-end' : 'flex-start',
                }}
              >
                {!isYou && (
                  <span
                    style={{
                      fontFamily: F.syne,
                      fontSize: 12,
                      fontWeight: 600,
                      color: C.textMuted,
                      paddingLeft: 12,
                    }}
                  >
                    {msg.senderName}
                  </span>
                )}

                <div
                  style={{
                    padding: '12px 16px',
                    backgroundColor: isYou
                      ? 'rgba(200,241,53,0.15)'
                      : C.bgHover,
                    border: `1px solid ${isYou ? C.borderAccent : C.borderDefault
                      }`,
                    borderRadius: isYou
                      ? '12px 12px 2px 12px'
                      : '12px 12px 12px 2px',
                  }}
                >
                  <p
                    style={{
                      fontFamily: F.syne,
                      fontSize: 14,
                      color: C.textPrimary,
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    {msg.content}
                  </p>
                </div>

                <span
                  style={{
                    fontFamily: F.mono,
                    fontSize: 10,
                    color: C.textMuted,
                    paddingLeft: isYou ? 0 : 12,
                    paddingRight: isYou ? 12 : 0,
                  }}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input bar */}
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: C.bgSurface,
          borderTop: `1px solid ${C.borderDefault}`,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <button
          style={{
            width: 36,
            height: 36,
            borderRadius: 6,
            backgroundColor: 'transparent',
            border: `1px solid ${C.borderDefault}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: C.textMuted,
          }}
        >
          <Paperclip size={18} />
        </button>

        <input
          type="text"
          placeholder={`Message ${selectedConv.poolName} pool...`}
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          style={{
            flex: 1,
            padding: '10px 14px',
            backgroundColor: C.bgBase,
            border: `1px solid ${C.borderDefault}`,
            borderRadius: 6,
            color: C.textPrimary,
            fontFamily: F.syne,
            fontSize: 13,
            outline: 'none',
          }}
        />

        <button
          onClick={handleSendMessage}
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            backgroundColor: C.accentLime,
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: C.bgBase,
          }}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );

  // Mobile: show either list or chat, not both
  if (isMobile) {
    return (
      <div style={{ height: 'calc(100vh - 120px)' }}>
        {!selectedConvId ? (
          <ConversationList fullWidth />
        ) : (
          <ChatView />
        )}
      </div>
    );
  }

  // Desktop: two-panel layout
  return (
    <div
      style={{
        display: 'flex',
        height: 'calc(100vh - 120px)',
        backgroundColor: C.bgSurface,
        border: `1px solid ${C.borderDefault}`,
        borderRadius: 6,
        overflow: 'hidden',
      }}
    >
      <ConversationList />
      <ChatView />
    </div>
  );
}
