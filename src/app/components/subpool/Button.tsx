import React, { useState } from 'react';
import { C, F } from '../../tokens';

type ButtonVariant = 'primary' | 'outline' | 'ghost';
type ButtonState = 'default' | 'hover' | 'disabled';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  forceState?: ButtonState;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function Button({
  variant = 'primary',
  size = 'md',
  forceState,
  disabled: propDisabled,
  children,
  onClick,
  style: customStyle
}: ButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const effectiveState: ButtonState = forceState ?? (propDisabled ? 'disabled' : (isHovered ? 'hover' : 'default'));
  const isDisabled = effectiveState === 'disabled';

  const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
    sm: { padding: '5px 12px', fontSize: 11, height: 28 },
    md: { padding: '8px 16px', fontSize: 13 },
    lg: { padding: '12px 24px', fontSize: 15, height: 48 },
  };

  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...sizeStyles[size],
    borderRadius: 6,
    border: '1px solid transparent',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    fontFamily: F.syne,
    fontWeight: 700,
    lineHeight: '1',
    transition: 'all 0.15s ease',
    outline: 'none',
    whiteSpace: 'nowrap',
    opacity: isDisabled ? 0.38 : 1,
  };

  const variantStyles: Record<ButtonVariant, Record<ButtonState, React.CSSProperties>> = {
    primary: {
      default: {
        backgroundColor: C.accentLime,
        color: C.bgBase,
        borderColor: C.accentLime,
      },
      hover: {
        backgroundColor: C.accentLimeDark,
        color: C.bgBase,
        borderColor: C.accentLimeDark,
        boxShadow: '0 4px 16px rgba(200,241,53,0.2)',
      },
      disabled: {
        backgroundColor: C.accentLime,
        color: C.bgBase,
        borderColor: C.accentLime,
      },
    },
    outline: {
      default: {
        backgroundColor: 'transparent',
        color: C.textPrimary,
        borderColor: C.borderDefault,
      },
      hover: {
        backgroundColor: C.bgHover,
        color: C.textPrimary,
        borderColor: '#3A3A3A',
      },
      disabled: {
        backgroundColor: 'transparent',
        color: C.textPrimary,
        borderColor: C.borderDefault,
      },
    },
    ghost: {
      default: {
        backgroundColor: 'transparent',
        color: C.textMuted,
        borderColor: 'transparent',
      },
      hover: {
        backgroundColor: C.bgHover,
        color: C.textPrimary,
        borderColor: 'transparent',
      },
      disabled: {
        backgroundColor: 'transparent',
        color: C.textMuted,
        borderColor: 'transparent',
      },
    },
  };

  const style: React.CSSProperties = { ...base, ...variantStyles[variant][effectiveState], ...customStyle };

  return (
    <button
      style={style}
      onMouseEnter={() => !forceState && setIsHovered(true)}
      onMouseLeave={() => !forceState && setIsHovered(false)}
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
    >
      {children}
    </button>
  );
}