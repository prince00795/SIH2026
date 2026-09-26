import React, { useEffect, useState } from 'react';
import { Topbar } from '../components/Topbar';
import { Badge } from '../components/Badge';
import { useSystemMode } from '../context/ModeContext';
import { api } from '../services/api';
import {
  Grid,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  Info,
} from 'lucide-react';

export const RouteHeatmapPage = () => {
  const { mode, toggleMode } = useSystemMode();
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'SURGE':
        return { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B', fareText: '#7F1D1D' };
      case 'ELEVATED':
        return { bg: '#FFFBEB', border: '#FDE68A', text: '#92400E', fareText: '#78350F' };
      case 'DISCOUNTED':
        return { bg: '#F0FDF4', border: '#BBF7D0', text: '#166534', fareText: '#14532D' };
      default:
        return { bg: '#F8FAFC', border: '#E2E8F0', text: '#475569', fareText: '#0F172A' };
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
        {/* Metric Summary Cards */}
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
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '8px',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#991B1B' }}>SURGE INTERSECTIONS</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#7F1D1D', marginTop: '2px' }}>{surgeCount}</div>
            </div>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#DC2626' }} />
          </div>

          <div
            style={{
              backgroundColor: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: '8px',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#92400E' }}>ELEVATED INTERSECTIONS</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#78350F', marginTop: '2px' }}>{elevatedCount}</div>
            </div>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#D97706' }} />
          </div>

          <div
            style={{
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: '8px',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#1E40AF' }}>NORMAL TARIFFS</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#1E3A8A', marginTop: '2px' }}>{normalCount}</div>
            </div>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#2563EB' }} />
          </div>

          <div
            style={{
              backgroundColor: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: '8px',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#166534' }}>DISCOUNTED WINDOWS</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#14532D', marginTop: '2px' }}>{discountedCount}</div>
            </div>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#16A34A' }} />
          </div>
        </div>

        {/* Heatmap Matrix Table */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)' }}>
                Cross-Corridor Dynamic Tariff Matrix
              </h3>
              <div style={{ fontSize: '12px', color: 'var(--text-sub)', marginTop: '2px' }}>
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
                    <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-sub)' }}>
                      No validated observations available for the heatmap matrix in <strong>{mode}</strong> mode. Switch to DEMO mode or run scrapers to populate.
                    </td>
                  </tr>
                ) : (
                  heatmapData.map((row) => (
                    <tr key={row.routeCode}>
                      <td style={{ fontWeight: 800, color: 'var(--text-main)' }}>
                        <span style={{ color: 'var(--text-sub)', fontSize: '11px', marginRight: '6px' }}>#{row.rank}</span>
                        {row.routeCode}
                      </td>
                      <td>{row.originCity} &harr; {row.destinationCity}</td>
                      <td className="mono" style={{ color: '#2563EB', fontWeight: 700 }}>
                        {(row.weightInBasket * 100).toFixed(1)}%
                      </td>
                      {horizons.map((h) => {
                        const win = row.windows?.[h] || { fare: 0, status: 'NORMAL' };
                        const style = getStatusColor(win.status);
                        return (
                          <td key={h} style={{ textAlign: 'center', padding: '5px 6px' }}>
                            <div
                              style={{
                                backgroundColor: style.bg,
                                border: `1px solid ${style.border}`,
                                borderRadius: '4px',
                                padding: '5px 8px',
                                display: 'inline-flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                minWidth: '82px',
                              }}
                            >
                              <span className="mono" style={{ fontWeight: 700, color: style.fareText, fontSize: '11.5px' }}>
                                {win.fare ? `₹${win.fare.toLocaleString()}` : '--'}
                              </span>
                              <span style={{ fontSize: '9px', fontWeight: 700, color: style.text, marginTop: '1px' }}>
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
