import React, { useEffect, useState } from 'react';
import { Topbar } from '../components/Topbar';
import { Badge } from '../components/Badge';
import { useSystemMode } from '../context/ModeContext';
import { api } from '../services/api';
import {
  Download,
  Filter,
  Layers,
  Info,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export const IndexExplorer = () => {
  const { mode, toggleMode } = useSystemMode();
  const [data, setData] = useState(null);
  const [timeframe, setTimeframe] = useState('30D');
  const [selectedHorizons, setSelectedHorizons] = useState({
    'T+1': true,
    'T+7': true,
    'T+15': true,
    'T+30': true,
    'T+45': true,
  });

  useEffect(() => {
    api.getNationalIndex(mode, timeframe).then((res) => {
      if (res.success) setData(res.data);
    });
  }, [mode, timeframe]);

  const toggleHorizon = (h) => {
    setSelectedHorizons((prev) => ({ ...prev, [h]: !prev[h] }));
  };

  const timeSeries = data?.timeSeries || [];

  // Export CSV
  const handleExportCSV = () => {
    if (!timeSeries.length) return;
    const headers = ['Date', 'National_APIx', 'Short_Jevons_Factor', 'T+1', 'T+7', 'T+15', 'T+30', 'T+45'];
    const rows = timeSeries.map((row) => [
      row.date,
      row.indexValue.toFixed(4),
      row.shortJevonsFactor.toFixed(4),
      row.horizons?.['T+1']?.toFixed(2) || '',
      row.horizons?.['T+7']?.toFixed(2) || '',
      row.horizons?.['T+15']?.toFixed(2) || '',
      row.horizons?.['T+30']?.toFixed(2) || '',
      row.horizons?.['T+45']?.toFixed(2) || '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aerostat_apix_${timeframe}_${mode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      <Topbar
        title="APIx Multi-Horizon Index Explorer"
        subtitle="Disaggregated advance booking horizons &bull; Short-Jevons chained series"
        mode={mode}
        onModeToggle={toggleMode}
        badge={mode === 'DEMO' ? 'DEMO' : 'PROJECT_DERIVED'}
      />

      <div style={{ padding: '24px 28px' }}>
        {/* Controls & Horizon Toggles */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '16px 20px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              HORIZONS:
            </span>
            {[
              { id: 'T+1', color: '#B91C1C', bg: '#FEF2F2', border: '#FECACA', label: 'T+1 (Next Day)' },
              { id: 'T+7', color: '#B45309', bg: '#FFFBEB', border: '#FDE68A', label: 'T+7 (1 Week)' },
              { id: 'T+15', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', label: 'T+15 (2 Weeks)' },
              { id: 'T+30', color: '#15803D', bg: '#F0FDF4', border: '#BBF7D0', label: 'T+30 (1 Month)' },
              { id: 'T+45', color: '#6D28D9', bg: '#F5F3FF', border: '#DDD6FE', label: 'T+45 (Advance)' },
            ].map((h) => (
              <button
                key={h.id}
                onClick={() => toggleHorizon(h.id)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  backgroundColor: selectedHorizons[h.id] ? h.bg : '#FFFFFF',
                  border: `1px solid ${selectedHorizons[h.id] ? h.border : 'var(--border)'}`,
                  color: selectedHorizons[h.id] ? h.color : 'var(--text-sub)',
                  cursor: 'pointer',
                  transition: 'all 0.1s ease',
                }}
              >
                {h.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Timeframe selector */}
            <div
              style={{
                display: 'flex',
                backgroundColor: '#F3F4F6',
                padding: '3px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
              }}
            >
              {['7D', '30D', '90D', '1Y'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: timeframe === tf ? '#111827' : 'var(--text-sub)',
                    backgroundColor: timeframe === tf ? '#FFFFFF' : 'transparent',
                    border: timeframe === tf ? '1px solid #D1D5DB' : '1px solid transparent',
                    boxShadow: timeframe === tf ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                  }}
                >
                  {tf}
                </button>
              ))}
            </div>

            <button
              onClick={handleExportCSV}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                backgroundColor: '#0F172A',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '12px',
              }}
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Multi-Horizon Recharts Chart */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '24px',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)' }}>
                  Cross-Horizon Price Trajectory Evolution
                </h3>
                <Badge type={mode === 'DEMO' ? 'DEMO' : 'PROJECT_DERIVED'} />
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-sub)', marginTop: '2px' }}>
                Comparing short-horizon spot price surge against long-horizon advance booking stability
              </div>
            </div>
          </div>

          {timeSeries.length > 0 ? (
            <div style={{ height: '360px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeries} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis dataKey="date" stroke="#6B7280" fontSize={11} tickFormatter={(val) => val.slice(5)} />
                  <YAxis stroke="#6B7280" fontSize={11} domain={['dataMin - 3', 'dataMax + 3']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: '#111827',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    }}
                  />
                  <Legend />
                  {selectedHorizons['T+1'] && (
                    <Line type="monotone" dataKey="horizons.T+1" name="T+1 (Spot Surge)" stroke="#B91C1C" strokeWidth={2} dot={false} />
                  )}
                  {selectedHorizons['T+7'] && (
                    <Line type="monotone" dataKey="horizons.T+7" name="T+7 (Weekly)" stroke="#B45309" strokeWidth={2} dot={false} />
                  )}
                  {selectedHorizons['T+15'] && (
                    <Line type="monotone" dataKey="horizons.T+15" name="T+15 (Mid-Range)" stroke="#2563EB" strokeWidth={2} dot={false} />
                  )}
                  {selectedHorizons['T+30'] && (
                    <Line type="monotone" dataKey="horizons.T+30" name="T+30 (1-Month Base)" stroke="#15803D" strokeWidth={2} dot={false} />
                  )}
                  {selectedHorizons['T+45'] && (
                    <Line type="monotone" dataKey="horizons.T+45" name="T+45 (Advance Saver)" stroke="#6D28D9" strokeWidth={2} dot={false} />
                  )}
                  <Line type="monotone" dataKey="indexValue" name="APIx Composite" stroke="#0F172A" strokeWidth={2.5} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div
              style={{
                height: '280px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#F9FAFB',
                borderRadius: '6px',
                border: '1px dashed var(--border)',
                color: 'var(--text-sub)',
                fontSize: '13px',
                textAlign: 'center',
                padding: '24px',
              }}
            >
              <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '14.5px', marginBottom: '8px' }}>
                APIx unavailable: No validated live fare observations available.
              </div>
              <div style={{ maxWidth: '520px', lineHeight: '1.6', marginBottom: '16px', color: 'var(--text-muted)' }}>
                The multi-horizon index explorer calculates chained daily relatives from empirical Playwright quote observations.
                In <strong>LIVE</strong> mode, quotes accumulate over time. Switch to <strong>DEMO</strong> mode to explore the calibrated multi-horizon 30-day simulation.
              </div>
              <button
                onClick={toggleMode}
                style={{
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Switch to Demo Simulation Mode
              </button>
            </div>
          )}
        </div>

        {/* Tabular Chained Relatives Progression */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)' }}>
              Daily Price Relatives & Chained Index Ledger
            </h3>
            <div style={{ fontSize: '12px', color: 'var(--text-sub)', marginTop: '2px' }}>
              Daily Short-Jevons geometric factor J(t) chained into cumulative series I(t) = I(t-1) &times; J(t)
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Observation Date</th>
                  <th>Chained APIx</th>
                  <th>Short-Jevons Factor (J_t)</th>
                  <th>Daily Relative (%)</th>
                  <th>T+1 Horizon</th>
                  <th>T+7 Horizon</th>
                  <th>T+15 Horizon</th>
                  <th>T+30 Horizon</th>
                  <th>T+45 Horizon</th>
                  <th>Quotes Sampled</th>
                </tr>
              </thead>
              <tbody>
                {timeSeries.slice(-15).reverse().map((row) => {
                  const dailyPct = (row.shortJevonsFactor - 1) * 100;
                  return (
                    <tr key={row.date}>
                      <td className="mono" style={{ fontWeight: 600 }}>{row.date}</td>
                      <td className="mono" style={{ fontWeight: 700, color: '#2563EB' }}>
                        {typeof row.indexValue === 'number' ? row.indexValue.toFixed(2) : '--'}
                      </td>
                      <td className="mono">{typeof row.shortJevonsFactor === 'number' ? row.shortJevonsFactor.toFixed(4) : '--'}</td>
                      <td className="mono" style={{ color: dailyPct >= 0 ? '#15803D' : '#B91C1C', fontWeight: 600 }}>
                        {typeof dailyPct === 'number' && !isNaN(dailyPct) ? `${dailyPct >= 0 ? '+' : ''}${dailyPct.toFixed(3)}%` : '--'}
                      </td>
                      <td className="mono" style={{ color: '#B91C1C' }}>{row.horizons?.['T+1']?.toFixed(2) || '--'}</td>
                      <td className="mono" style={{ color: '#B45309' }}>{row.horizons?.['T+7']?.toFixed(2) || '--'}</td>
                      <td className="mono" style={{ color: '#2563EB' }}>{row.horizons?.['T+15']?.toFixed(2) || '--'}</td>
                      <td className="mono" style={{ color: '#15803D' }}>{row.horizons?.['T+30']?.toFixed(2) || '--'}</td>
                      <td className="mono" style={{ color: '#6D28D9' }}>{row.horizons?.['T+45']?.toFixed(2) || '--'}</td>
                      <td className="mono">{typeof row.sampleQuotesCount === 'number' ? row.sampleQuotesCount.toLocaleString() : '--'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
