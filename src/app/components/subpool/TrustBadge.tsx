import React from 'react';
import { C, F } from '../../tokens';

interface TrustBadgeProps {
  icon: string;
  label: string;
}

export function TrustBadge({ icon, label }: TrustBadgeProps) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        borderRadius: 100,
        border: `1px solid ${C.borderDefault}`,
        backgroundColor: 'transparent',
      }}
    >
      <span style={{ fontSize: 14, lineHeight: 1 }}>{icon}</span>
      <span
        style={{
          fontFamily: F.mono,
          fontWeight: 500,
          fontSize: 11,
          color: C.textPrimary,
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
    </div>
  );
}
