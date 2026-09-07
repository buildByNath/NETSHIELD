import React from 'react';

interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
}

export const PixelButton: React.FC<PixelButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled,
  style,
  ...props
}) => {
  const getBgColor = () => {
    switch (variant) {
      case 'primary': return 'var(--cth-lemon)';
      case 'secondary': return 'var(--cth-cream-200)';
      case 'danger': return 'var(--cth-coral)';
      case 'success': return 'var(--cth-mint)';
      default: return 'var(--cth-lemon)';
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'sm': return '4px 8px';
      case 'md': return '6px 12px';
      case 'lg': return '10px 18px';
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm': return '8px';
      case 'md': return '10px';
      case 'lg': return '12px';
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: getBgColor(),
        color: 'var(--cth-ink-900)',
        fontFamily: 'var(--cth-font-display)',
        fontSize: getFontSize(),
        padding: getPadding(),
        border: '2px solid var(--cth-ink-900)',
        boxShadow: disabled ? 'none' : '2px 2px 0 var(--cth-ink-900)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'transform 0.05s ease, box-shadow 0.05s ease',
        outline: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
};
