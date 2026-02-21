import React from 'react';
import { C, F } from '../../tokens';

export function VerifiedBadge() {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 100,
        border: `1px solid ${C.accentLime}`,
        backgroundColor: 'transparent',
      }}
    >
      {/* Shield icon outline */}
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        style={{ flexShrink: 0 }}
      >
        <path
          d="M6 1L2 2.5V6C2 8.5 4 10.5 6 11C8 10.5 10 8.5 10 6V2.5L6 1Z"
          stroke={C.accentLime}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4.5 6L5.5 7L7.5 5"
          stroke={C.accentLime}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span
        style={{
          fontFamily: F.mono,
          fontWeight: 500,
          fontSize: 10,
          color: C.accentLime,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        Verified
      </span>
    </div>
  );
}
