import React, { useState } from 'react';
import { C, F } from '../../tokens';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: string;
  onClick?: () => void;
}

export function NavItem({ icon, label, active = false, badge, onClick }: NavItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  const isActive = active;
  const color = isActive ? C.accentLime : isHovered ? C.textPrimary : C.textMuted;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: 220,
        height: 40,
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        cursor: 'pointer',
        borderLeft: `3px solid ${isActive ? C.accentLime : 'transparent'}`,
        backgroundColor: isActive ? 'rgba(200,241,53,0.05)' : isHovered ? C.bgHover : 'transparent',
        transition: 'all 0.15s ease',
        boxSizing: 'border-box',
        borderRadius: '0 4px 4px 0',
        userSelect: 'none',
      }}
    >
      <span style={{ color, fontSize: 16, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        {icon}
      </span>
      <span
        style={{
          fontFamily: F.syne,
          fontWeight: 600,
          fontSize: 14,
          color,
          flex: 1,
          transition: 'color 0.15s ease',
        }}
      >
        {label}
      </span>
      {badge && (
        <span
          style={{
            padding: '2px 7px',
            borderRadius: 100,
            backgroundColor: C.accentLime,
            color: C.bgBase,
            fontFamily: F.mono,
            fontWeight: 500,
            fontSize: 10,
          }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}
