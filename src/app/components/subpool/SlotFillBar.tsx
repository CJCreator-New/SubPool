import React from 'react';
import { C } from '../../tokens';

interface SlotFillBarProps {
  filled: number;
  total?: number;
  dotSize?: number;
}

export function SlotFillBar({ filled, total = 4, dotSize = 6 }: SlotFillBarProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 6,
        width: '100%',
        alignItems: 'center',
      }}
    >
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: '50%',
            backgroundColor: i < filled ? C.accentLime : '#2A2A2A',
            transition: 'background-color 0.2s ease',
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  );
}
