import React, { useState } from 'react';
import { C, F } from '../../tokens';

type InputState = 'default' | 'focused' | 'error';

interface InputFieldProps {
  label?: string;
  placeholder?: string;
  helperText?: string;
  forceState?: InputState;
  value?: string;
  onChange?: (v: string) => void;
}

const borderColor: Record<InputState, string> = {
  default: C.borderDefault,
  focused: C.accentLime,
  error:   C.statusDanger,
};

export function InputField({
  label,
  placeholder = 'Placeholder text',
  helperText,
  forceState,
  value,
  onChange,
}: InputFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [internalValue, setInternalValue] = useState('');

  const state: InputState = forceState ?? (isFocused ? 'focused' : 'default');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value);
    onChange?.(e.target.value);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
      {label && (
        <label
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
        </label>
      )}
      <input
        type="text"
        placeholder={placeholder}
        value={value ?? internalValue}
        onChange={handleChange}
        onFocus={() => !forceState && setIsFocused(true)}
        onBlur={() => !forceState && setIsFocused(false)}
        className="sp-input"
        style={{
          width: '100%',
          height: 40,
          backgroundColor: C.bgSurface,
          border: `1px solid ${borderColor[state]}`,
          borderRadius: 6,
          padding: '11px 14px',
          fontFamily: F.syne,
          fontWeight: 400,
          fontSize: 14,
          color: C.textPrimary,
          outline: 'none',
          transition: 'border-color 0.15s ease',
          boxSizing: 'border-box',
        }}
      />
      {helperText && (
        <span
          style={{
            fontFamily: F.mono,
            fontWeight: 400,
            fontSize: 11,
            color: state === 'error' ? C.statusDanger : C.textMuted,
          }}
        >
          {helperText}
        </span>
      )}
    </div>
  );
}