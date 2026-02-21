import React, { useState } from 'react';
import { C, F } from '../../tokens';

interface StatCardProps {
  label: string;
  value: string;
  subtext?: string;
  subtextType?: 'default' | 'success' | 'danger';
  style?: React.CSSProperties;
}

export function StatCard({ label, value, subtext, subtextType = 'default', style: customValueStyle }: StatCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const subtextColor =
    subtextType === 'success'
      ? C.statusSuccess
      : subtextType === 'danger'
      ? C.statusDanger
      : C.textMuted;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: C.bgSurface,
        border: `1px solid ${C.borderDefault}`,
        borderRadius: 6,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
        transition: 'border-color 0.2s ease',
        borderColor: isHovered ? C.borderAccent : C.borderDefault,
      }}
    >
      {/* Top lime bar on hover */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          backgroundColor: C.accentLime,
          transform: isHovered ? 'scaleX(1)' : 'scaleX(0)',
          transformOrigin: 'left',
          transition: 'transform 0.25s ease',
        }}
      />
      <span
        style={{
          fontFamily: F.mono,
          fontWeight: 500,
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: '1.2px',
          color: C.textMuted,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: F.syne,
          fontWeight: 800,
          fontSize: 28,
          color: C.textPrimary,
          lineHeight: 1,
          ...customValueStyle,
        }}
      >
        {value}
      </span>
      {subtext && (
        <span
          style={{
            fontFamily: F.mono,
            fontWeight: 400,
            fontSize: 11,
            color: subtextColor,
          }}
        >
          {subtext}
        </span>
      )}
    </div>
  );
}
