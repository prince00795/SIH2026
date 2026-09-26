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
  {
    group: 'INTELLIGENCE CORE',
    items: [
      { label: 'National Command Center', path: '/', icon: LayoutDashboard },
      { label: 'APIx Index Explorer', path: '/index-explorer', icon: TrendingUp },
      { label: 'Route Intelligence', path: '/route-intelligence', icon: Compass },
      { label: 'Route Basket & Weights', path: '/route-basket', icon: Database },
    ],
  },
  {
    group: 'PRICING & ANALYTICS',
    items: [
      { label: 'Airline & OTA Source Health', path: '/source-health', icon: Activity },
      { label: 'Raw Fare Explorer', path: '/raw-fares', icon: Receipt },
      { label: 'Lead-Time Elasticity', path: '/lead-time', icon: Clock },
      { label: '20x5 Route Heatmap', path: '/route-heatmap', icon: Grid },
    ],
  },
  {
    group: 'STATUTORY & BENCHMARK',
    items: [
      { label: 'MoSPI CPI Benchmark', path: '/mospi-cpi', icon: BookmarkCheck },
      { label: 'APIx vs CPI Comparison', path: '/cpi-comparison', icon: GitCompare },
      { label: 'Backtest & Validation', path: '/backtest', icon: FileCheck },
      { label: 'Methodology Guide', path: '/methodology', icon: BookOpen },
      { label: 'Data Provenance Ledger', path: '/provenance', icon: ShieldCheck },
      { label: 'Alerts & Anomalies', path: '/alerts', icon: Bell },
      { label: 'API Documentation', path: '/api-docs', icon: Code2 },
    ],
  },
];

export const Sidebar = () => {
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
          padding: '18px 20px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            backgroundColor: '#0F172A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '16px',
            letterSpacing: '-0.5px',
          }}
        >
          A
        </div>
        <div>
          <div
            style={{
              fontSize: '15px',
              fontWeight: 800,
              color: 'var(--text-main)',
              letterSpacing: '-0.3px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            Aerostat
            <span
              style={{
                fontSize: '9.5px',
                backgroundColor: '#F3F4F6',
                border: '1px solid #E5E7EB',
                color: '#374151',
                padding: '1px 5px',
                borderRadius: '4px',
                fontWeight: 700,
              }}
            >
              APIx
            </span>
          </div>
          <div style={{ fontSize: '10.5px', color: 'var(--text-sub)', marginTop: '1px' }}>
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
                fontWeight: 700,
                color: 'var(--text-dim)',
                letterSpacing: '0.8px',
                padding: '0 10px 6px',
              }}
            >
              {section.group}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    fontSize: '12.5px',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#0F172A' : '#4B5563',
                    backgroundColor: isActive ? '#F3F4F6' : 'transparent',
                    border: isActive ? '1px solid #E5E7EB' : '1px solid transparent',
                    marginBottom: '2px',
                    transition: 'all 0.1s ease',
                  })}
                >
                  <Icon size={15} style={{ opacity: 0.85 }} />
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
          padding: '12px 16px',
          borderTop: '1px solid var(--border)',
          backgroundColor: '#F9FAFB',
          fontSize: '11px',
          color: 'var(--text-sub)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: '#16A34A',
            }}
          />
          System Operational
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-dim)' }}>
          v2.0.0
        </span>
      </div>
    </aside>
  );
};
