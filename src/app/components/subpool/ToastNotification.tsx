import React from 'react';
import { C, F } from '../../tokens';

interface ToastNotificationProps {
  message: string;
}

export function ToastNotification({ message }: ToastNotificationProps) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        backgroundColor: C.bgSurface,
        border: `1px solid ${C.accentLime}`,
        borderRadius: 6,
        padding: '14px 18px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        maxWidth: 340,
      }}
    >
      <span
        style={{
          fontFamily: F.syne,
          fontWeight: 600,
          fontSize: 13,
          color: C.accentLime,
          flexShrink: 0,
        }}
      >
        ✓
      </span>
      <span
        style={{
          fontFamily: F.syne,
          fontWeight: 600,
          fontSize: 13,
          color: C.textPrimary,
        }}
      >
        {message}
      </span>
    </div>
  );
}
