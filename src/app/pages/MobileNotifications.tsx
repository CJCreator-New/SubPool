import React from 'react';
import { C, F } from '../tokens';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

export function MobileNotifications() {
  const navigate = useNavigate();

  const notifications = [
    {
      id: '1',
      type: 'request',
      title: 'New pool request',
      message: 'Alex M wants to join your Netflix Standard pool',
      time: '5m ago',
      unread: true,
    },
    {
      id: '2',
      type: 'payment',
      title: 'Payment received',
      message: 'Sam T paid $3.49 for Spotify Duo',
      time: '2h ago',
      unread: true,
    },
    {
      id: '3',
      type: 'reminder',
      title: 'Payment due soon',
      message: 'Your Figma Pro payment is due in 3 days',
      time: '1d ago',
      unread: false,
    },
    {
      id: '4',
      type: 'approval',
      title: 'Request approved',
      message: 'You\'ve been approved for ChatGPT Plus pool',
      time: '2d ago',
      unread: false,
    },
    {
      id: '5',
      type: 'system',
      title: 'Pool updated',
      message: 'Netflix Standard pool settings have been updated',
      time: '3d ago',
      unread: false,
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'request':
        return '👤';
      case 'payment':
        return '💰';
      case 'reminder':
        return '⏰';
      case 'approval':
        return '✅';
      case 'system':
        return '⚙️';
      default:
        return '🔔';
    }
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 375,
        minHeight: '100vh',
        margin: '0 auto',
        backgroundColor: C.bgBase,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          backgroundColor: C.bgSurface,
          borderBottom: `1px solid ${C.borderDefault}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => navigate(-1)}
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

          <span
            style={{
              fontFamily: F.syne,
              fontWeight: 700,
              fontSize: 15,
              color: C.textPrimary,
            }}
          >
            Notifications
          </span>
        </div>

        <button
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '6px 12px',
            fontFamily: F.syne,
            fontWeight: 600,
            fontSize: 13,
            color: C.accentLime,
          }}
        >
          Mark all read
        </button>
      </div>

      {/* Notification list */}
      <div>
        {notifications.map((notif) => (
          <div
            key={notif.id}
            style={{
              position: 'relative',
              padding: '16px 20px',
              borderBottom: `1px solid ${C.borderDefault}`,
              backgroundColor: notif.unread ? C.bgSurface : C.bgBase,
              borderLeft: notif.unread ? `3px solid ${C.accentLime}` : 'none',
              paddingLeft: notif.unread ? '17px' : '20px',
            }}
          >
            <div style={{ display: 'flex', gap: 12 }}>
              {/* Icon */}
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 6,
                  backgroundColor: notif.unread
                    ? 'rgba(200,241,53,0.15)'
                    : C.bgHover,
                  border: `1px solid ${
                    notif.unread ? C.borderAccent : C.borderDefault
                  }`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  flexShrink: 0,
                }}
              >
                {getIcon(notif.type)}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span
                    style={{
                      fontFamily: F.syne,
                      fontWeight: notif.unread ? 700 : 600,
                      fontSize: 14,
                      color: C.textPrimary,
                    }}
                  >
                    {notif.title}
                  </span>

                  {notif.unread && (
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: C.accentLime,
                        flexShrink: 0,
                        marginLeft: 8,
                        marginTop: 4,
                      }}
                    />
                  )}
                </div>

                <p
                  style={{
                    fontFamily: F.syne,
                    fontSize: 13,
                    color: C.textMuted,
                    margin: '0 0 8px 0',
                    lineHeight: 1.5,
                  }}
                >
                  {notif.message}
                </p>

                <span
                  style={{
                    fontFamily: F.mono,
                    fontSize: 11,
                    color: C.textMuted,
                  }}
                >
                  {notif.time}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pull to refresh hint (visual only) */}
      <div
        style={{
          padding: 20,
          textAlign: 'center',
        }}
      >
        <span
          style={{
            fontFamily: F.mono,
            fontSize: 11,
            color: C.textMuted,
          }}
        >
          Pull to refresh
        </span>
      </div>
    </div>
  );
}
