import React, { useEffect, useState } from 'react';
import { Topbar } from '../components/Topbar';
import { Badge } from '../components/Badge';
import { useSystemMode } from '../context/ModeContext';
import { api } from '../services/api';
import { IHeatmapRow } from '../types';
import {
  Grid,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  Info,
} from 'lucide-react';

export const RouteHeatmapPage: React.FC = () => {
  const { mode, toggleMode } = useSystemMode();
  const [heatmapData, setHeatmapData] = useState<IHeatmapRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    api.getHeatmap(mode).then((res) => {
      if (res.success) {
        const list = res.data?.matrix || (Array.isArray(res.data) ? res.data : []);
        setHeatmapData(list);
      }
      setLoading(false);
    });
  }, [mode]);


  const horizons = ['T+1', 'T+7', 'T+15', 'T+30', 'T+45'];

  // Calculate summary counts
  let surgeCount = 0;
  let elevatedCount = 0;
  let normalCount = 0;
  let discountedCount = 0;

  heatmapData.forEach((row) => {
    horizons.forEach((h) => {
      const status = row.windows?.[h]?.status;
      if (status === 'SURGE') surgeCount++;
      else if (status === 'ELEVATED') elevatedCount++;
      else if (status === 'DISCOUNTED') discountedCount++;
      else normalCount++;
    });
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SURGE':
        return { bg: 'rgba(239, 68, 68, 0.25)', border: 'rgba(239, 68, 68, 0.6)', text: '#FCA5A5' };
      case 'ELEVATED':
        return { bg: 'rgba(245, 158, 11, 0.22)', border: 'rgba(245, 158, 11, 0.5)', text: '#FCD34D' };
      case 'DISCOUNTED':
        return { bg: 'rgba(16, 185, 129, 0.22)', border: 'rgba(16, 185, 129, 0.5)', text: '#6EE7B7' };
      default:
        return { bg: 'rgba(59, 130, 246, 0.12)', border: 'rgba(59, 130, 246, 0.3)', text: '#93C5FD' };
    }
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      <Topbar
        title="20 × 5 Corridor Pricing Heatmap Matrix"
        subtitle="100 Market Intersections across Top 20 DGCA Corridors and 5 Standard Advance Horizons"
        mode={mode}
        onModeToggle={toggleMode}
        badge={mode === 'DEMO' ? 'DEMO' : 'PROJECT_DERIVED'}
      />

      <div style={{ padding: '24px 28px' }}>
        {/* Status Breakdown Chips */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '10px',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#FCA5A5' }}>SURGE INTERSECTIONS</div>
              <div style={{ fontSize: '22px', fontWeight: 900, color: '#FFFFFF', marginTop: '2px' }}>{surgeCount}</div>
            </div>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
          </div>

          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              borderRadius: '10px',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#FCD34D' }}>ELEVATED INTERSECTIONS</div>
              <div style={{ fontSize: '22px', fontWeight: 900, color: '#FFFFFF', marginTop: '2px' }}>{elevatedCount}</div>
            </div>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
          </div>

          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              borderRadius: '10px',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#93C5FD' }}>NORMAL TARIFFS</div>
              <div style={{ fontSize: '22px', fontWeight: 900, color: '#FFFFFF', marginTop: '2px' }}>{normalCount}</div>
            </div>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#3B82F6' }} />
          </div>

          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '10px',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#6EE7B7' }}>DISCOUNTED WINDOWS</div>
              <div style={{ fontSize: '22px', fontWeight: 900, color: '#FFFFFF', marginTop: '2px' }}>{discountedCount}</div>
            </div>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10B981' }} />
          </div>
        </div>

        {/* Heatmap Matrix Table */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '20px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF' }}>
                National Fare Regime Matrix (20 Routes &times; 5 Advance Horizons)
              </h3>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Color thresholds: Surge (&gt;+35% vs baseline), Elevated (+10% to +35%), Normal (&plusmn;10%), Discounted (&lt;-10%)
              </div>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rank & Corridor</th>
                  <th>City-Pair Name</th>
                  <th>Basket Wt</th>
                  <th style={{ textAlign: 'center' }}>T+1 (Next Day)</th>
                  <th style={{ textAlign: 'center' }}>T+7 (1 Week)</th>
                  <th style={{ textAlign: 'center' }}>T+15 (2 Weeks)</th>
                  <th style={{ textAlign: 'center' }}>T+30 (1 Month)</th>
                  <th style={{ textAlign: 'center' }}>T+45 (Advance)</th>
                </tr>
              </thead>
              <tbody>
                {heatmapData.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      No validated observations available for the heatmap matrix in <strong>{mode}</strong> mode. Switch to DEMO mode or run scrapers to populate.
                    </td>
                  </tr>
                ) : (
                  heatmapData.map((row) => (
                    <tr key={row.routeCode}>
                      <td style={{ fontWeight: 800, color: '#FFFFFF' }}>
                        <span style={{ color: 'var(--text-sub)', fontSize: '11px', marginRight: '6px' }}>#{row.rank}</span>
                        {row.routeCode}
                      </td>
                      <td>{row.originCity} &harr; {row.destinationCity}</td>
                      <td className="mono" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                        {(row.weightInBasket * 100).toFixed(1)}%
                      </td>
                      {horizons.map((h) => {
                        const win = row.windows?.[h] || { fare: 0, status: 'NORMAL' };
                        const style = getStatusColor(win.status);
                        return (
                          <td key={h} style={{ textAlign: 'center', padding: '6px 8px' }}>
                            <div
                              style={{
                                backgroundColor: style.bg,
                                border: `1px solid ${style.border}`,
                                borderRadius: '6px',
                                padding: '6px 10px',
                                display: 'inline-flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                minWidth: '85px',
                              }}
                            >
                              <span className="mono" style={{ fontWeight: 800, color: '#FFFFFF', fontSize: '12px' }}>
                                {win.fare ? `₹${win.fare.toLocaleString()}` : '--'}
                              </span>
                              <span style={{ fontSize: '9px', fontWeight: 800, color: style.text, marginTop: '2px' }}>
                                {win.fare ? win.status : 'N/A'}
                              </span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
