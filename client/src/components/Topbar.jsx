import React from 'react';
import { Badge } from './Badge';
import { Shield, Sparkles } from 'lucide-react';

export const Topbar = ({
  title,
  subtitle,
  mode,
  onModeToggle,
  badge = 'PROJECT_DERIVED',
}) => {
  return (
    <header
      style={{
        height: '60px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.3px', margin: 0 }}>
            {title}
          </h1>
          <Badge type={mode === 'DEMO' ? 'DEMO' : badge} />
        </div>
        {subtitle && (
          <div style={{ fontSize: '11.5px', color: 'var(--text-sub)', marginTop: '2px' }}>
            {subtitle}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Mode Toggle Button */}
        <button
          onClick={onModeToggle}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '11.5px',
            fontWeight: 700,
            cursor: 'pointer',
            border: mode === 'LIVE' ? '1px solid #BBF7D0' : '1px solid #FDE68A',
            backgroundColor: mode === 'LIVE' ? '#F0FDF4' : '#FFFBEB',
            color: mode === 'LIVE' ? '#166534' : '#92400E',
            transition: 'all 0.15s ease',
          }}
          title="Toggle between Live Collection and Calibrated Simulation Mode"
        >
          {mode === 'LIVE' ? <Shield size={13} /> : <Sparkles size={13} />}
          <span>{mode === 'LIVE' ? 'MODE: LIVE COLLECTION' : 'MODE: DEMO / SIMULATION'}</span>
        </button>

        {/* DGCA / MoSPI Authority Chip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            padding: '5px 11px',
            borderRadius: '6px',
            backgroundColor: '#F9FAFB',
            border: '1px solid var(--border)',
            fontSize: '11.5px',
            color: 'var(--text-muted)',
            fontWeight: 500,
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#2563EB' }} />
          <span>MoSPI NSO &bull; DGCA Top 20</span>
        </div>
      </div>
    </header>
  );
};
