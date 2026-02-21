import React, { useState, useRef, useEffect } from 'react';
import { C, F } from '../../tokens';

interface MenuOption {
  icon?: string;
  label: string;
  onClick: () => void;
  isDivider?: boolean;
  isDanger?: boolean;
}

interface OverflowMenuProps {
  options: MenuOption[];
}

export function OverflowMenu({ options }: OverflowMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div style={{ position: 'relative' }}>
      {/* Overflow button */}
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        style={{
          width: 32,
          height: 32,
          borderRadius: 6,
          backgroundColor: 'transparent',
          border: `1px solid ${C.borderDefault}`,
          color: C.textMuted,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = C.bgBase;
          e.currentTarget.style.borderColor = C.borderAccent;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.borderColor = C.borderDefault;
        }}
      >
        ⋯
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          ref={menuRef}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 8,
            minWidth: 200,
            backgroundColor: C.bgSurface,
            border: `1px solid ${C.borderDefault}`,
            borderRadius: 6,
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            overflow: 'hidden',
            zIndex: 100,
          }}
        >
          {options.map((option, idx) => {
            if (option.isDivider) {
              return (
                <div
                  key={idx}
                  style={{
                    height: 1,
                    backgroundColor: C.borderDefault,
                    margin: '4px 0',
                  }}
                />
              );
            }

            return (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  option.onClick();
                  setIsOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: option.isDanger ? '#FF4D4D' : C.textPrimary,
                  fontFamily: F.syne,
                  fontWeight: 500,
                  fontSize: 13,
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = C.bgBase;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {option.icon && <span style={{ fontSize: 14 }}>{option.icon}</span>}
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
