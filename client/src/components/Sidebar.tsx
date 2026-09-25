import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  Compass,
  Database,
  Activity,
  Receipt,
  Clock,
  Grid,
  BookmarkCheck,
  GitCompare,
  FileCheck,
  BookOpen,
  ShieldCheck,
  Bell,
  Code2,
} from 'lucide-react';

const NAV_ITEMS = [
  { group: 'INTELLIGENCE CORE', items: [
    { label: 'National Command Center', path: '/', icon: LayoutDashboard },
    { label: 'APIx Index Explorer', path: '/index-explorer', icon: TrendingUp },
    { label: 'Route Intelligence', path: '/route-intelligence', icon: Compass },
    { label: 'Route Basket & Weights', path: '/route-basket', icon: Database },
  ]},
  { group: 'PRICING & ANALYTICS', items: [
    { label: 'Airline & OTA Source Health', path: '/source-health', icon: Activity },
    { label: 'Raw Fare Explorer', path: '/raw-fares', icon: Receipt },
    { label: 'Lead-Time Elasticity', path: '/lead-time', icon: Clock },
    { label: '20x5 Route Heatmap', path: '/route-heatmap', icon: Grid },
  ]},
  { group: 'STATUTORY & BENCHMARK', items: [
    { label: 'MoSPI CPI Benchmark', path: '/mospi-cpi', icon: BookmarkCheck },
    { label: 'APIx vs CPI Comparison', path: '/cpi-comparison', icon: GitCompare },
    { label: 'Backtest & Validation', path: '/backtest', icon: FileCheck },
    { label: 'Methodology Guide', path: '/methodology', icon: BookOpen },
    { label: 'Data Provenance Ledger', path: '/provenance', icon: ShieldCheck },
    { label: 'Alerts & Anomalies', path: '/alerts', icon: Bell },
    { label: 'API Documentation', path: '/api-docs', icon: Code2 },
  ]}
];

export const Sidebar: React.FC = () => {
  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontWeight: 900,
            fontSize: '18px',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
          }}
        >
          V
        </div>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            VayuSutra <span style={{ fontSize: '9px', background: '#F59E0B', color: '#000', padding: '1px 5px', borderRadius: '4px', fontWeight: 900 }}>APIx</span>
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.3px', marginTop: '2px' }}>
            MoSPI SIH26056 Command Center
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px' }}>
        {NAV_ITEMS.map((section, idx) => (
          <div key={idx} style={{ marginBottom: '18px' }}>
            <div
              style={{
                fontSize: '9.5px',
                fontWeight: 800,
                color: 'var(--text-sub)',
                letterSpacing: '1px',
                padding: '0 10px 6px',
              }}
            >
              {section.group}
            </div>
            {section.items.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#FFFFFF' : 'var(--text-muted)',
                    backgroundColor: isActive ? 'rgba(59, 130, 246, 0.18)' : 'transparent',
                    border: isActive ? '1px solid rgba(59, 130, 246, 0.35)' : '1px solid transparent',
                    marginBottom: '3px',
                    transition: 'all 0.15s ease',
                  })}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Status */}
      <div
        style={{
          padding: '14px 16px',
          borderTop: '1px solid var(--border)',
          backgroundColor: 'rgba(11, 19, 43, 0.6)',
          fontSize: '11px',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px #10B981' }} />
          MERN + Playwright
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-sub)' }}>
          v2.0.0
        </span>
      </div>
    </aside>
  );
};
