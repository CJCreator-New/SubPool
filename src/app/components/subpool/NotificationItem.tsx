import React from 'react';
import { C, F } from '../../tokens';

interface NotificationItemProps {
  read?: boolean;
  icon: string;
  title: string;
  body: string;
  timestamp: string;
  actions?: React.ReactNode;
}

export function NotificationItem({ read = false, icon, title, body, timestamp, actions }: NotificationItemProps) {
  return (
    <div
      style={{
        width: '100%',
        backgroundColor: C.bgSurface,
        border: `1px solid ${C.borderDefault}`,
        borderLeft: `3px solid ${read ? C.borderDefault : C.accentLime}`,
        borderRadius: 6,
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 14,
        boxSizing: 'border-box',
      }}
    >
      {/* Emoji icon */}
      <span style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>{icon}</span>

      {/* Title + body + optional actions */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span
          style={{
            fontFamily: F.syne,
            fontWeight: 700,
            fontSize: 14,
            color: C.textPrimary,
          }}
        >
          {title}
        </span>
        <span
          style={{
            fontFamily: F.syne,
            fontWeight: 400,
            fontSize: 13,
            color: C.textMuted,
          }}
        >
          {body}
        </span>
        {actions && (
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            {actions}
          </div>
        )}
      </div>

      {/* Timestamp */}
      <span
        style={{
          fontFamily: F.mono,
          fontWeight: 400,
          fontSize: 11,
          color: C.textMuted,
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        {timestamp}
      </span>
    </div>
  );
}