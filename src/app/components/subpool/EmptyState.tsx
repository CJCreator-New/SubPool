import React from 'react';
import { C, F } from '../../tokens';
import { Button } from './Button';

interface EmptyStateProps {
  emoji?: string;
  icon?: React.ReactNode;
  title: string;
  body: string;
  ctaLabel?: string;
  onCta?: () => void;
  action?: React.ReactNode;
  style?: React.CSSProperties;
}

export function EmptyState({ emoji, icon, title, body, ctaLabel, onCta, action, style }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 32px',
        gap: 16,
        textAlign: 'center',
        ...style,
      }}
    >
      {icon ? (
        <span style={{ fontSize: 48, opacity: 0.5, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </span>
      ) : (
        <span style={{ fontSize: 48, opacity: 0.5, lineHeight: 1 }}>{emoji}</span>
      )}
      
      <span
        style={{
          fontFamily: F.syne,
          fontWeight: 700,
          fontSize: 18,
          color: C.textPrimary,
        }}
      >
        {title}
      </span>
      <span
        style={{
          fontFamily: F.syne,
          fontWeight: 400,
          fontSize: 14,
          color: C.textMuted,
          maxWidth: 280,
          lineHeight: 1.6,
        }}
      >
        {body}
      </span>
      
      {(action || ctaLabel) && (
        <div style={{ marginTop: 8 }}>
          {action ? (
            action
          ) : (
            <Button variant="primary" onClick={onCta}>
              {ctaLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
