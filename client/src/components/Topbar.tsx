import React from 'react';
import { Badge } from './Badge';
import { Shield, Sparkles } from 'lucide-react';

interface TopbarProps {
  title: string;
  subtitle?: string;
  mode: 'LIVE' | 'DEMO';
  onModeToggle: () => void;
  badge?: string;
}

export const Topbar: React.FC<TopbarProps> = ({
  title,
  subtitle,
  mode,
  onModeToggle,
  badge = 'PROJECT_DERIVED',
}) => {
  return (
    <header
      style={{
        height: '64px',
        backgroundColor: 'rgba(8, 13, 29, 0.85)',
        backdropFilter: 'blur(12px)',
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
          <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.2px' }}>
            {title}
          </h1>
          <Badge type={mode === 'DEMO' ? 'DEMO' : badge} />
        </div>
        {subtitle && (
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {subtitle}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Mode Toggle Button */}
        <button
          onClick={onModeToggle}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 14px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            border: mode === 'LIVE' ? '1px solid #10B981' : '1px solid #F59E0B',
            backgroundColor: mode === 'LIVE' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            color: mode === 'LIVE' ? '#34D399' : '#FBBF24',
            transition: 'all 0.2s ease',
          }}
          title="Toggle between Live Collection and Calibrated Simulation Mode"
        >
          {mode === 'LIVE' ? <Shield size={14} /> : <Sparkles size={14} />}
          <span>{mode === 'LIVE' ? 'MODE: LIVE COLLECTION' : 'MODE: DEMO / SIMULATION'}</span>
        </button>

        {/* DGCA / MoSPI Authority Chip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            borderRadius: '8px',
            backgroundColor: '#0F172A',
            border: '1px solid var(--border)',
            fontSize: '11.5px',
            color: 'var(--text-muted)',
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#38BDF8' }} />
          <span>MoSPI NSO &bull; DGCA Top 20</span>
        </div>
      </div>
    </header>
  );
};
