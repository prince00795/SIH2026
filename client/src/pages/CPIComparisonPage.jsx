import React, { useEffect, useState } from 'react';
import { Topbar } from '../components/Topbar';
import { Badge } from '../components/Badge';
import { KPICard } from '../components/KPICard';
import { useSystemMode } from '../context/ModeContext';
import { api } from '../services/api';
import {
  GitCompare,
  TrendingUp,
  Clock,
  Activity,
  AlertCircle,
  FileCheck,
  CheckCircle2,
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

export const CPIComparisonPage = () => {
  const { mode, toggleMode } = useSystemMode();
  const [comparisonData, setComparisonData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getCPIComparison(mode).then((res) => {
      if (res.success) {
        const list = res.data?.comparison || (Array.isArray(res.data) ? res.data : []);
        setComparisonData(list);
      }
      setLoading(false);
    });
  }, [mode]);

  return (
    <div style={{ paddingBottom: '40px' }}>
      <Topbar
        title="High-Frequency APIx vs MoSPI CPI Comparison"
        subtitle="Nowcasting official headline airfare inflation with zero reporting lag"
        mode={mode}
        onModeToggle={toggleMode}
        badge={mode === 'DEMO' ? 'DEMO' : 'PROJECT_DERIVED'}
      />

      <div style={{ padding: '24px 28px' }}>
        {/* Value Proposition Callout */}
        <div
          style={{
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: '8px',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
          }}
        >
          <GitCompare size={22} color="#1E40AF" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '12.5px', lineHeight: '1.6' }}>
            <div style={{ fontWeight: 800, color: '#1E3A8A', fontSize: '13px', marginBottom: '3px' }}>
              HOW AEROSTAT APIx AUGMENTS THE OFFICIAL MoSPI CPI
            </div>
            <div style={{ color: 'var(--text-muted)' }}>
              Official MoSPI CPI (Item Code <code>07.3.3.1.2.01</code>) is published monthly on the 12th of the following month, creating a <strong>12 to 42 day information lag</strong> for RBI monetary policy and economic planners.
              Aerostat APIx computes a high-frequency daily Short-Jevons chained index that serves as a <strong>real-time leading nowcast</strong>, tracking airline pricing inflection points weeks before the official release.
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <KPICard
            label="REPORTING LATENCY REDUCTION"
            value="12-42 Days"
            change="Instant Daily Nowcast"
            changeType="positive"
            badge="PROJECT_DERIVED"
            icon={<Clock size={18} color="#15803D" />}
            footnote="Continuous daily pricing updates vs monthly release"
          />
          <KPICard
            label="SURGE CAPTURE RESOLUTION"
            value="Daily (24h)"
            change="5 Advance Horizons"
            changeType="neutral"
            badge="PROJECT_DERIVED"
            icon={<Activity size={18} color="#0F172A" />}
            footnote="Captures intra-month holiday & festival spikes"
          />
          <KPICard
            label="BASE RE-INDEXATION"
            value="Jan 2025 = 100"
            change="Re-indexed for parity"
            changeType="neutral"
            badge="PROJECT_DERIVED"
            icon={<FileCheck size={18} color="#2563EB" />}
            footnote="MoSPI base 2024=100 re-aligned to Jan 2025 start"
          />
          <KPICard
            label="DIRECTIONAL COHERENCE"
            value="Consistent"
            change="Co-movement confirmed"
            changeType="positive"
            badge={mode === 'DEMO' ? 'DEMO' : 'PROJECT_DERIVED'}
            icon={<TrendingUp size={18} color="#B45309" />}
            footnote="Both indices track seasonal summer surge"
          />
        </div>

        {/* Comparative Chart */}
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
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)' }}>
              MoSPI CPI Airfare vs Aerostat APIx Monthly Aggregate (Re-indexed)
            </h3>
            <div style={{ fontSize: '12px', color: 'var(--text-sub)', marginTop: '2px' }}>
              Comparing statutory monthly MoSPI CPI Airfare values against Aerostat monthly composite
            </div>
          </div>

          <div style={{ height: '320px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={comparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="monthName" stroke="#6B7280" fontSize={11} />
                <YAxis stroke="#6B7280" fontSize={11} domain={['dataMin - 5', 'dataMax + 5']} />
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
                <Line
                  type="monotone"
                  dataKey="officialMoSPIIndex"
                  name="Official MoSPI CPI (2024=100)"
                  stroke="#0F172A"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="projectDerivedAPIx"
                  name="Aerostat APIx (Calibrated Re-index)"
                  stroke="#2563EB"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Comparison Table */}
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
              Monthly Comparison Ledger & Spread Analysis
            </h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Month & Year</th>
                  <th>Official MoSPI Index</th>
                  <th>Official YoY Inflation</th>
                  <th>Aerostat APIx (Monthly)</th>
                  <th>Index Spread</th>
                  <th>Nowcast Accuracy</th>
                  <th>Provenance Type</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.slice().reverse().map((row) => (
                  <tr key={row.month}>
                    <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{row.monthName}</td>
                    <td className="mono" style={{ fontWeight: 700, color: '#0F172A' }}>
                      {row.officialMoSPIIndex.toFixed(2)}
                    </td>
                    <td className="mono" style={{ color: row.officialYoYInflationPct ? '#B91C1C' : 'var(--text-sub)' }}>
                      {row.officialYoYInflationPct !== null ? `+${row.officialYoYInflationPct.toFixed(2)}%` : '--'}
                    </td>
                    <td className="mono" style={{ fontWeight: 700, color: '#2563EB' }}>
                      {row.projectDerivedAPIx ? row.projectDerivedAPIx.toFixed(2) : '--'}
                    </td>
                    <td className="mono" style={{ color: row.spread && Math.abs(row.spread) < 2 ? '#15803D' : 'var(--text-sub)' }}>
                      {row.spread !== null ? `${row.spread >= 0 ? '+' : ''}${row.spread.toFixed(2)} pts` : '--'}
                    </td>
                    <td>
                      <span style={{ fontSize: '11px', color: '#15803D', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={12} /> Leading Indicator
                      </span>
                    </td>
                    <td>
                      <Badge type={mode === 'DEMO' ? 'DEMO' : 'PROJECT_DERIVED'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
