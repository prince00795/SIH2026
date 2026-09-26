import React from 'react';

export const Badge = ({ type, label, size = 'md' }) => {
  const normalizedType = (type || 'PROJECT_DERIVED').toUpperCase();

  const badgeStyles = {
    OFFICIAL: {
      bg: '#F0FDF4',
      text: '#166534',
      border: '#BBF7D0',
      defaultLabel: 'OFFICIAL',
    },
    OFFICIAL_DERIVED: {
      bg: '#EFF6FF',
      text: '#1E40AF',
      border: '#BFDBFE',
      defaultLabel: 'OFFICIAL DERIVED',
    },
    LIVE_COLLECTED: {
      bg: '#ECFDF5',
      text: '#065F46',
      border: '#A7F3D0',
      defaultLabel: 'LIVE COLLECTED',
    },
    PROJECT_DERIVED: {
      bg: '#F8FAFC',
      text: '#334155',
      border: '#CBD5E1',
      defaultLabel: 'PROJECT DERIVED',
    },
    DEMO: {
      bg: '#FFFBEB',
      text: '#92400E',
      border: '#FDE68A',
      defaultLabel: 'DEMO / SIMULATION',
    },
    UNAVAILABLE: {
      bg: '#F3F4F6',
      text: '#4B5563',
      border: '#E5E7EB',
      defaultLabel: 'DATA UNAVAILABLE',
    },
  };

  const current = badgeStyles[normalizedType] || badgeStyles.PROJECT_DERIVED;
  const displayLabel = label || current.defaultLabel;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: size === 'sm' ? '2px 6px' : '3px 8px',
        fontSize: size === 'sm' ? '10px' : '11px',
        fontWeight: 700,
        fontFamily: 'ui-monospace, monospace',
        letterSpacing: '0.4px',
        textTransform: 'uppercase',
        borderRadius: '4px',
        backgroundColor: current.bg,
        color: current.text,
        border: `1px solid ${current.border}`,
        whiteSpace: 'nowrap',
      }}
    >
      {normalizedType === 'LIVE_COLLECTED' && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: '#059669',
            display: 'inline-block',
          }}
        />
      )}
      {displayLabel}
    </span>
  );
};
