import React, { useEffect, useState } from 'react';
import { Topbar } from '../components/Topbar';
import { Badge } from '../components/Badge';
import { useSystemMode } from '../context/ModeContext';
import { api } from '../services/api';
import { INationalAPIxData } from '../types';
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

export const IndexExplorer: React.FC = () => {
  const { mode, toggleMode } = useSystemMode();
  const [data, setData] = useState<INationalAPIxData | null>(null);
  const [timeframe, setTimeframe] = useState<string>('30D');
  const [selectedHorizons, setSelectedHorizons] = useState<Record<string, boolean>>({
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

  const toggleHorizon = (h: string) => {
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
    link.setAttribute('download', `vayusutra_apix_${timeframe}_${mode}.csv`);
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
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>
              HORIZON FILTERS:
            </span>
            {[
              { id: 'T+1', color: '#EF4444', label: 'T+1 (Next Day)' },
              { id: 'T+7', color: '#F59E0B', label: 'T+7 (1 Week)' },
              { id: 'T+15', color: '#3B82F6', label: 'T+15 (2 Weeks)' },
              { id: 'T+30', color: '#10B981', label: 'T+30 (1 Month)' },
              { id: 'T+45', color: '#8B5CF6', label: 'T+45 (Advance)' },
            ].map((h) => (
              <button
                key={h.id}
                onClick={() => toggleHorizon(h.id)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  backgroundColor: selectedHorizons[h.id] ? `${h.color}22` : 'transparent',
                  border: `1px solid ${selectedHorizons[h.id] ? h.color : 'var(--border)'}`,
                  color: selectedHorizons[h.id] ? h.color : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
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
                backgroundColor: '#080D1D',
                padding: '3px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
              }}
            >
              {['7D', '30D', '90D', '1Y'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: timeframe === tf ? '#FFFFFF' : 'var(--text-muted)',
                    backgroundColor: timeframe === tf ? 'var(--primary)' : 'transparent',
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
                padding: '6px 14px',
                borderRadius: '8px',
                backgroundColor: 'var(--primary)',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '12px',
              }}
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Multi-Horizon Recharts Chart */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF' }}>
                  Cross-Horizon Price Trajectory Evolution
                </h3>
                <Badge type={mode === 'DEMO' ? 'DEMO' : 'PROJECT_DERIVED'} />
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Comparing short-horizon spot price surge against long-horizon advance booking stability
              </div>
            </div>
          </div>

          {timeSeries.length > 0 ? (
            <div style={{ height: '360px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeries} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(30, 45, 74, 0.6)" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickFormatter={(val) => val.slice(5)} />
                  <YAxis stroke="#64748B" fontSize={11} domain={['dataMin - 3', 'dataMax + 3']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0B132B',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend />
                  {selectedHorizons['T+1'] && (
                    <Line type="monotone" dataKey="horizons.T+1" name="T+1 (Spot Surge)" stroke="#EF4444" strokeWidth={2} dot={false} />
                  )}
                  {selectedHorizons['T+7'] && (
                    <Line type="monotone" dataKey="horizons.T+7" name="T+7 (Weekly)" stroke="#F59E0B" strokeWidth={2} dot={false} />
                  )}
                  {selectedHorizons['T+15'] && (
                    <Line type="monotone" dataKey="horizons.T+15" name="T+15 (Mid-Range)" stroke="#3B82F6" strokeWidth={2} dot={false} />
                  )}
                  {selectedHorizons['T+30'] && (
                    <Line type="monotone" dataKey="horizons.T+30" name="T+30 (1-Month Base)" stroke="#10B981" strokeWidth={2} dot={false} />
                  )}
                  {selectedHorizons['T+45'] && (
                    <Line type="monotone" dataKey="horizons.T+45" name="T+45 (Advance Saver)" stroke="#8B5CF6" strokeWidth={2} dot={false} />
                  )}
                  <Line type="monotone" dataKey="indexValue" name="APIx Composite" stroke="#FFFFFF" strokeWidth={2.5} strokeDasharray="4 4" dot={false} />
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
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                borderRadius: '8px',
                border: '1px dashed var(--border)',
                color: 'var(--text-muted)',
                fontSize: '13px',
                textAlign: 'center',
                padding: '24px',
              }}
            >
              <div style={{ fontWeight: 800, color: '#F8FAFC', fontSize: '15px', marginBottom: '8px' }}>
                APIx unavailable: No validated live fare observations available.
              </div>
              <div style={{ maxWidth: '520px', lineHeight: '1.6', marginBottom: '16px' }}>
                The multi-horizon index explorer calculates chained daily relatives from empirical Playwright quote observations.
                In <strong>LIVE</strong> mode, quotes accumulate over time. Switch to <strong>DEMO</strong> mode to explore the calibrated multi-horizon 30-day simulation.
              </div>
              <button
                onClick={toggleMode}
                style={{
                  backgroundColor: '#F59E0B',
                  color: '#000000',
                  border: 'none',
                  padding: '8px 18px',
                  borderRadius: '6px',
                  fontWeight: 700,
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
            borderRadius: '12px',
            padding: '20px',
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF' }}>
              Daily Price Relatives & Chained Index Ledger
            </h3>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {'Daily Short-Jevons geometric factor J_t chained into cumulative series I(t) = I(t-1) * J_t'}
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Observation Date</th>
                  <th>Chained APIx</th>
                  <th>Short-Jevons Factor ($J_t$)</th>
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
                      <td className="mono" style={{ fontWeight: 800, color: 'var(--primary)' }}>
                        {typeof row.indexValue === 'number' ? row.indexValue.toFixed(2) : '--'}
                      </td>
                      <td className="mono">{typeof row.shortJevonsFactor === 'number' ? row.shortJevonsFactor.toFixed(4) : '--'}</td>
                      <td className="mono" style={{ color: dailyPct >= 0 ? '#10B981' : '#EF4444', fontWeight: 700 }}>
                        {typeof dailyPct === 'number' && !isNaN(dailyPct) ? `${dailyPct >= 0 ? '+' : ''}${dailyPct.toFixed(3)}%` : '--'}
                      </td>
                      <td className="mono" style={{ color: '#EF4444' }}>{row.horizons?.['T+1']?.toFixed(2) || '--'}</td>
                      <td className="mono" style={{ color: '#F59E0B' }}>{row.horizons?.['T+7']?.toFixed(2) || '--'}</td>
                      <td className="mono" style={{ color: '#3B82F6' }}>{row.horizons?.['T+15']?.toFixed(2) || '--'}</td>
                      <td className="mono" style={{ color: '#10B981' }}>{row.horizons?.['T+30']?.toFixed(2) || '--'}</td>
                      <td className="mono" style={{ color: '#8B5CF6' }}>{row.horizons?.['T+45']?.toFixed(2) || '--'}</td>
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
