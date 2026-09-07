import React from 'react';

interface PixelPanelProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const PixelPanel: React.FC<PixelPanelProps> = ({ title, children, className = '', style }) => {
  return (
    <div
      className={`pixel-panel ${className}`}
      style={{
        background: 'var(--cth-paper-100)',
        border: '2px solid var(--cth-ink-900)',
        boxShadow: 'var(--cth-shadow-hard)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        ...style,
      }}
    >
      {title && (
        <div
          style={{
            background: 'var(--cth-ink-900)',
            color: 'var(--cth-cream-50)',
            fontFamily: 'var(--cth-font-display)',
            fontSize: '10px',
            padding: '6px 10px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{title}</span>
        </div>
      )}
      <div style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>{children}</div>
    </div>
  );
};
