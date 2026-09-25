import React from 'react';
import { Badge } from './Badge';
import { BadgeType } from '../types';

interface KPICardProps {
  title?: string;
  label?: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  badge: BadgeType | string;
  badgeLabel?: string;
  subtitle?: string;
  footnote?: string;
  icon?: React.ReactNode;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  label,
  value,
  change,
  changeType = 'neutral',
  badge,
  badgeLabel,
  subtitle,
  footnote,
  icon,
}) => {
  const changeColors = {
    positive: '#10B981', // green
    negative: '#EF4444', // red
    neutral: '#94A3B8',  // gray
  };

  const displayTitle = title || label || '';
  const displaySubtitle = subtitle || footnote;

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card, #0F172A)',
        border: '1px solid var(--border, #1E2D4A)',
        borderRadius: '12px',
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {icon}
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted, #94A3B8)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            {displayTitle}
          </span>
        </div>
        <Badge type={badge as BadgeType} label={badgeLabel} size="sm" />
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', margin: '4px 0' }}>
        <span style={{ fontSize: '26px', fontWeight: 900, color: '#FFFFFF', fontFamily: 'var(--font-mono)' }}>
          {value}
        </span>
        {change && (
          <span style={{ fontSize: '12.5px', fontWeight: 700, color: changeColors[changeType], fontFamily: 'var(--font-mono)' }}>
            {change}
          </span>
        )}
      </div>

      {displaySubtitle && (
        <div style={{ fontSize: '11px', color: 'var(--text-sub, #64748B)', marginTop: '6px' }}>
          {displaySubtitle}
        </div>
      )}
    </div>
  );
};
