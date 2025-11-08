import React from 'react';

interface SimpleToggleProps {
  pressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  className?: string;
  'aria-label'?: string;
}

export function SimpleToggle({ pressed = false, onPressedChange, className, 'aria-label': ariaLabel }: SimpleToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={pressed}
      aria-label={ariaLabel}
      onClick={() => onPressedChange && onPressedChange(!pressed)}
      className={className}
      style={{
        display: 'inline-block',
        width: 40,
        height: 22,
        borderRadius: 9999,
        background: pressed ? '#1A2435' : '#e5e7eb',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        position: 'relative'
      }}
    >
      <span
        style={{
          position: 'absolute',
          left: pressed ? 20 : 2,
          top: 2,
          width: 18,
          height: 18,
          borderRadius: 9999,
          background: '#fff',
          boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
          transition: 'left 160ms cubic-bezier(.4,0,.2,1)'
        }}
      />
    </button>
  );
}
