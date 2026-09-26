import React from 'react';
import { Badge } from './Badge';

export const KPICard = ({
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
    positive: '#15803D', // clean forest green
    negative: '#B91C1C', // clean deep crimson
    neutral: '#6B7280',  // muted grey
  };

  const displayTitle = title || label || '';
  const displaySubtitle = subtitle || footnote;

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card, #FFFFFF)',
        border: '1px solid var(--border, #E5E7EB)',
        borderRadius: '8px',
        padding: '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: 'var(--card-shadow)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          {icon}
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-sub, #6B7280)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {displayTitle}
          </span>
        </div>
        {badge && <Badge type={badge} label={badgeLabel} size="sm" />}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '2px 0' }}>
        <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main, #111827)', fontFamily: 'var(--font-mono)' }}>
          {value}
        </span>
        {change && (
          <span style={{ fontSize: '12px', fontWeight: 700, color: changeColors[changeType], fontFamily: 'var(--font-mono)' }}>
            {change}
          </span>
        )}
      </div>

      {displaySubtitle && (
        <div style={{ fontSize: '11px', color: 'var(--text-sub, #6B7280)', marginTop: '6px' }}>
          {displaySubtitle}
        </div>
      )}
    </div>
  );
};
