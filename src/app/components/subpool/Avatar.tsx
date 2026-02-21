import React from 'react';
import { C, F } from '../../tokens';

type AvatarSize = 'sm' | 'md' | 'lg';

interface AvatarProps {
  initials: string;
  size?: AvatarSize;
  color?: string;
}

const sizeConfig: Record<AvatarSize, { px: number; fontSize: number }> = {
  sm: { px: 24, fontSize: 10 },
  md: { px: 32, fontSize: 13 },
  lg: { px: 72, fontSize: 28 },
};

export function Avatar({ initials, size = 'md', color = C.accentLime }: AvatarProps) {
  const cfg = sizeConfig[size];

  return (
    <div
      style={{
        width: cfg.px,
        height: cfg.px,
        borderRadius: '50%',
        backgroundColor: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontFamily: F.syne,
        fontWeight: 800,
        fontSize: cfg.fontSize,
        color: C.bgBase,
        userSelect: 'none',
      }}
    >
      {initials.slice(0, 2).toUpperCase()}
    </div>
  );
}
