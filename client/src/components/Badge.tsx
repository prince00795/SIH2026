import React from 'react';
import { BadgeType } from '../types';

interface BadgeProps {
  type: BadgeType | string;
  label?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ type, label, size = 'md' }) => {
  const normalizedType = (type || 'PROJECT_DERIVED').toUpperCase();

  const badgeStyles: Record<string, { bg: string; text: string; border: string; defaultLabel: string }> = {
    OFFICIAL: {
      bg: 'rgba(5, 150, 105, 0.15)',
      text: '#10B981',
      border: 'rgba(16, 185, 129, 0.35)',
      defaultLabel: 'OFFICIAL',
    },
    OFFICIAL_DERIVED: {
      bg: 'rgba(59, 130, 246, 0.15)',
      text: '#60A5FA',
      border: 'rgba(96, 165, 250, 0.35)',
      defaultLabel: 'OFFICIAL DERIVED',
    },
    LIVE_COLLECTED: {
      bg: 'rgba(16, 185, 129, 0.2)',
      text: '#34D399',
      border: 'rgba(52, 211, 153, 0.45)',
      defaultLabel: 'LIVE COLLECTED',
    },
    PROJECT_DERIVED: {
      bg: 'rgba(139, 92, 246, 0.15)',
      text: '#A78BFA',
      border: 'rgba(167, 139, 250, 0.35)',
      defaultLabel: 'PROJECT DERIVED',
    },
    DEMO: {
      bg: 'rgba(245, 158, 11, 0.18)',
      text: '#FBBF24',
      border: 'rgba(251, 191, 36, 0.45)',
      defaultLabel: 'DEMO / SIMULATION',
    },
    UNAVAILABLE: {
      bg: 'rgba(148, 163, 184, 0.15)',
      text: '#94A3B8',
      border: 'rgba(148, 163, 184, 0.3)',
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
        padding: size === 'sm' ? '2px 7px' : '3px 10px',
        fontSize: size === 'sm' ? '10px' : '11px',
        fontWeight: 700,
        fontFamily: 'ui-monospace, monospace',
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
        borderRadius: '6px',
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
            backgroundColor: '#34D399',
            display: 'inline-block',
            boxShadow: '0 0 6px #34D399',
          }}
        />
      )}
      {displayLabel}
    </span>
  );
};
