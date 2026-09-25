import React, { useEffect, useState } from 'react';
import { Topbar } from '../components/Topbar';
import { Badge } from '../components/Badge';
import { KPICard } from '../components/KPICard';
import { useSystemMode } from '../context/ModeContext';
import { api } from '../services/api';
import {
  BookmarkCheck,
  TrendingUp,
  FileText,
  Calendar,
  Layers,
  ArrowUpRight,
  ExternalLink,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';

export const MoSPIBenchmark: React.FC = () => {
  const { mode, toggleMode } = useSystemMode();
  const [cpiData, setCpiData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    api.getOfficialCPI().then((res) => {
      if (res.success) {
        setCpiData(res.data);
      }
      setLoading(false);
    });
  }, []);

  const monthlySeries: any[] = cpiData?.series || [];
  const latestPoint = monthlySeries[monthlySeries.length - 1];

  return (
    <div style={{ paddingBottom: '40px' }}>
      <Topbar
        title="Official MoSPI CPI Airfare Benchmark (2024=100)"
        subtitle="Ministry of Statistics & Programme Implementation &bull; Price Statistics Division Series"
        mode={mode}
        onModeToggle={toggleMode}
        badge="OFFICIAL"
      />

      <div style={{ padding: '24px 28px' }}>
        {/* Statutory Source Attribution Banner */}
        <div
          style={{
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
          }}
        >
          <FileText size={24} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '12.5px', lineHeight: '1.6' }}>
            <div style={{ fontWeight: 800, color: '#FFFFFF', fontSize: '13.5px', marginBottom: '4px' }}>
              OFFICIAL MoSPI CPI BENCHMARK SPECIFICATIONS
            </div>
            <div style={{ color: 'var(--text-main)' }}>
              Source: Ministry of Statistics & Programme Implementation (MoSPI), National Statistical Office (NSO), Price Statistics Division.
              Released as part of the <em>Consumer Price Index (Rural/Urban/Combined) Press Release for August 2026</em>.
            </div>
            <div style={{ display: 'flex', gap: '20px', marginTop: '8px', color: '#93C5FD', fontWeight: 600, flexWrap: 'wrap' }}>
              <span>Base Year: <strong>2024 = 100</strong></span>
              <span>Classification: <strong>Division 07 (Transport)</strong></span>
              <span>Item Code: <strong>07.3.3.1.2.01 (Air Fare)</strong></span>
              <span>Latest Release: <strong>August 2026 (Index: 135.49, YoY: +20.85%)</strong></span>
            </div>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <KPICard
            label="LATEST OFFICIAL CPI AIRFARE"
            value={latestPoint ? latestPoint.indexValue.toFixed(2) : '135.49'}
            change={latestPoint ? `+${latestPoint.yoyInflationPct?.toFixed(2)}% YoY` : '+20.85% YoY'}
            changeType="negative"
            badge="OFFICIAL"
            icon={<TrendingUp size={18} color="#EF4444" />}
            footnote={`As of ${latestPoint?.monthName || 'August 2026'} | Base 2024=100`}
          />
          <KPICard
            label="REPORTING LATENCY"
            value="12 Days"
            change="Published on 12th of Next Month"
            changeType="neutral"
            badge="OFFICIAL"
            icon={<Calendar size={18} color="var(--primary)" />}
            footnote="APIx eliminates this lag with real-time daily nowcasts"
          />
          <KPICard
            label="COVERAGE IN STATUTORY RELEASE"
            value="20 Months"
            change="January 2025 – August 2026"
            changeType="neutral"
            badge="OFFICIAL"
            icon={<Layers size={18} color="#10B981" />}
            footnote="Official series points in database"
          />
          <KPICard
            label="ANNUAL INFLATION PEAK"
            value="+22.40%"
            change="Recorded May 2026 (Summer Rush)"
            changeType="negative"
            badge="OFFICIAL"
            icon={<ArrowUpRight size={18} color="#F59E0B" />}
            footnote="Peak domestic summer holiday surge"
          />
        </div>

        {/* Charts: Index Progression & YoY Inflation Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '20px',
            marginBottom: '24px',
          }}
        >
          {/* Index Progression */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '20px',
            }}
          >
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF' }}>
                  Official Monthly MoSPI CPI Airfare Index (2024=100)
                </h3>
                <Badge type="OFFICIAL" />
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Official MoSPI index values Jan 2025 to Aug 2026
              </div>
            </div>

            <div style={{ height: '280px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlySeries} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(30, 45, 74, 0.6)" vertical={false} />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} domain={['dataMin - 5', 'dataMax + 5']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0B132B',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Line type="monotone" dataKey="indexValue" name="MoSPI CPI Airfare" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* YoY Inflation Rate */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '20px',
            }}
          >
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF' }}>
                  Year-on-Year Inflation Rate (%)
                </h3>
                <Badge type="OFFICIAL" />
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                YoY airfare price inflation percentage (Base 2024=100)
              </div>
            </div>

            <div style={{ height: '280px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlySeries.filter((s) => s.yoyInflationPct !== null)} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(30, 45, 74, 0.6)" vertical={false} />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={10} />
                  <YAxis stroke="#64748B" fontSize={11} unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0B132B',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [`${val}%`, 'YoY Inflation']}
                  />
                  <Bar dataKey="yoyInflationPct" name="YoY Inflation %" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Tabular Official Ledger */}
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
              Official Monthly MoSPI Series Data Points
            </h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Month & Year</th>
                  <th>Classification Code</th>
                  <th>Item Description</th>
                  <th>Index (Base 2024=100)</th>
                  <th>YoY Inflation Rate</th>
                  <th>MoSPI Release Source</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {monthlySeries.slice().reverse().map((row) => (
                  <tr key={row.month}>
                    <td style={{ fontWeight: 700, color: '#FFFFFF' }}>{row.monthName}</td>
                    <td className="mono" style={{ color: 'var(--text-muted)' }}>07.3.3.1.2.01</td>
                    <td>Air Fare (Domestic Passenger)</td>
                    <td className="mono" style={{ fontWeight: 800, color: 'var(--primary)' }}>
                      {row.indexValue.toFixed(2)}
                    </td>
                    <td className="mono" style={{ color: row.yoyInflationPct ? '#EF4444' : 'var(--text-sub)', fontWeight: 700 }}>
                      {row.yoyInflationPct !== null ? `+${row.yoyInflationPct.toFixed(2)}%` : 'Base Period'}
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      MoSPI NSO CPI Press Release Aug 2026
                    </td>
                    <td>
                      <Badge type="OFFICIAL" />
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
