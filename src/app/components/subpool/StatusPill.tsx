import React from 'react';
import { C, F } from '../../tokens';

type PillVariant = 'open' | 'full' | 'pending' | 'owed' | 'paid' | 'active' | 'success';

interface StatusPillProps {
  variant?: PillVariant;
  status?: string;
  label?: string;
}

const pillConfig: Record<PillVariant, { color: string; label: string }> = {
  open:    { color: C.statusSuccess, label: 'Open' },
  full:    { color: C.textMuted,     label: 'Full' },
  pending: { color: C.statusWarning, label: 'Pending' },
  owed:    { color: C.statusWarning, label: 'Owed' },
  paid:    { color: C.statusSuccess, label: 'Paid' },
  active:  { color: C.statusSuccess, label: 'Active' },
  success: { color: C.statusSuccess, label: 'Paid' },
};

export function StatusPill({ variant, status, label }: StatusPillProps) {
  // Support both 'variant' prop (old) and 'status' prop (new)
  const key = (variant || status) as PillVariant;
  const config = pillConfig[key];
  
  // If config is not found, use a default
  if (!config) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '3px 8px',
          borderRadius: 100,
          border: `1px solid ${C.textMuted}`,
          color: C.textMuted,
          fontFamily: F.mono,
          fontWeight: 500,
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
          lineHeight: 1,
          whiteSpace: 'nowrap',
        }}
      >
        {label || key || 'Unknown'}
      </span>
    );
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 8px',
        borderRadius: 100,
        border: `1px solid ${config.color}`,
        color: config.color,
        fontFamily: F.mono,
        fontWeight: 500,
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}
    >
      {label || config.label}
    </span>
  );
}