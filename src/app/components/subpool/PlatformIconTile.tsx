import React, { useState } from 'react';
import { C, F } from '../../tokens';

type TileState = 'default' | 'hover' | 'selected';

interface PlatformIconTileProps {
  emoji: string;
  name: string;
  forceState?: TileState;
  size?: number;
  onClick?: () => void;
}

export function PlatformIconTile({ emoji, name, forceState, size = 80, onClick }: PlatformIconTileProps) {
  const [isHovered, setIsHovered] = useState(false);

  const state: TileState = forceState ?? (isHovered ? 'hover' : 'default');

  const stateStyles: Record<TileState, React.CSSProperties> = {
    default: {
      borderColor: C.borderDefault,
      backgroundColor: 'transparent',
      color: C.textMuted,
    },
    hover: {
      borderColor: C.textMuted,
      backgroundColor: 'transparent',
      color: C.textPrimary,
    },
    selected: {
      borderColor: C.accentLime,
      backgroundColor: 'rgba(200,241,53,0.08)',
      color: C.accentLime,
    },
  };

  const s = stateStyles[state];

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => !forceState && setIsHovered(true)}
      onMouseLeave={() => !forceState && setIsHovered(false)}
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        border: `1px solid ${s.borderColor}`,
        backgroundColor: s.backgroundColor as string,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        userSelect: 'none',
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 28, lineHeight: 1 }}>{emoji}</span>
      <span
        style={{
          fontFamily: F.syne,
          fontWeight: 600,
          fontSize: 11,
          color: s.color as string,
          transition: 'color 0.15s ease',
        }}
      >
        {name}
      </span>
    </div>
  );
}
