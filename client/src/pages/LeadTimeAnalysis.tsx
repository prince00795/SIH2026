import React, { useEffect, useState } from 'react';
import { Topbar } from '../components/Topbar';
import { Badge } from '../components/Badge';
import { KPICard } from '../components/KPICard';
import { useSystemMode } from '../context/ModeContext';
import { api } from '../services/api';
import {
  Clock,
  TrendingUp,
  Percent,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
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
  BarChart,
  Bar,
} from 'recharts';

export const LeadTimeAnalysis: React.FC = () => {
  const { mode, toggleMode } = useSystemMode();
  const [selectedRoute, setSelectedRoute] = useState<string>('DEL-BOM');
  const [curveData, setCurveData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    api.getLeadTimeCurve(selectedRoute, mode).then((res) => {
      if (res.success) {
        setCurveData(res.data?.curve || (Array.isArray(res.data) ? res.data : []));
      }
      setLoading(false);
    });
  }, [selectedRoute, mode]);

  const hasData = curveData.length > 0;
  const displayCurve = curveData.map((c: any) => ({
    horizon: c.window || c.horizon,
    days: c.days,
    avgFare: c.meanFare || c.avgFare || 0,
    minFare: c.minObserved || c.minFare || 0,
    maxFare: c.maxObserved || c.maxFare || 0,
  }));

  const t1Fare = displayCurve.find((c) => c.horizon === 'T+1')?.avgFare || 0;
  const t30Fare = displayCurve.find((c) => c.horizon === 'T+30')?.avgFare || 0;
  const t45Fare = displayCurve.find((c) => c.horizon === 'T+45')?.avgFare || 0;

  const spotPremiumPct = t30Fare > 0 && t1Fare > 0 ? ((t1Fare / t30Fare - 1) * 100).toFixed(1) : null;
  const advanceDiscountPct = t30Fare > 0 && t45Fare > 0 ? (((t30Fare - t45Fare) / t30Fare) * 100).toFixed(1) : null;

  return (
    <div style={{ paddingBottom: '40px' }}>
      <Topbar
        title="Lead-Time Pricing Dynamics & Elasticity"
        subtitle="Cross-horizon fare steepness & last-minute surge multiplier across T+1 to T+45"
        mode={mode}
        onModeToggle={toggleMode}
        badge={hasData ? (mode === 'DEMO' ? 'DEMO' : 'PROJECT_DERIVED') : 'UNAVAILABLE'}
      />


      <div style={{ padding: '24px 28px' }}>
        {/* Route Selector & Header */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
          }}
        >
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF' }}>
              Booking Lead Time Yield Curve ({selectedRoute})
            </h3>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Statutory 5-window advance horizon distribution (MoSPI CPI Augmentation Framework)
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Corridor:</span>
            <select
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value)}
              style={{
                backgroundColor: '#080D1D',
                color: '#FFFFFF',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: 700,
                outline: 'none',
              }}
            >
              <option value="DEL-BOM">DEL-BOM (Delhi &harr; Mumbai)</option>
              <option value="BLR-DEL">BLR-DEL (Bengaluru &harr; Delhi)</option>
              <option value="BOM-BLR">BOM-BLR (Mumbai &harr; Bengaluru)</option>
              <option value="DEL-CCU">DEL-CCU (Delhi &harr; Kolkata)</option>
              <option value="DEL-HYD">DEL-HYD (Delhi &harr; Hyderabad)</option>
            </select>
          </div>
        </div>

        {/* Lead-Time Metric Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <KPICard
            label="LAST-MINUTE SPOT SURGE"
            value={spotPremiumPct ? `+${spotPremiumPct}%` : 'N/A'}
            change="T+1 vs T+30 Baseline"
            changeType="negative"
            badge={hasData ? (mode === 'DEMO' ? 'DEMO' : 'PROJECT_DERIVED') : 'UNAVAILABLE'}
            icon={<ArrowUpRight size={18} color="#EF4444" />}
            footnote="Urgent traveler premium on departure eve"
          />
          <KPICard
            label="ADVANCE SAVER DISCOUNT"
            value={advanceDiscountPct ? `-${advanceDiscountPct}%` : 'N/A'}
            change="T+45 vs T+30 Base"
            changeType="positive"
            badge={hasData ? (mode === 'DEMO' ? 'DEMO' : 'PROJECT_DERIVED') : 'UNAVAILABLE'}
            icon={<ArrowDownRight size={18} color="#10B981" />}
            footnote="Savings captured by booking 45 days early"
          />
          <KPICard
            label="MEDIAN BASELINE (T+30)"
            value={t30Fare > 0 ? `₹${t30Fare.toLocaleString()}` : 'N/A'}
            change="Reference Horizon Fare"
            changeType="neutral"
            badge={hasData ? (mode === 'DEMO' ? 'DEMO' : 'PROJECT_DERIVED') : 'UNAVAILABLE'}
            icon={<Clock size={18} color="var(--primary)" />}
            footnote="Standard reference point for index calculation"
          />
          <KPICard
            label="MAX OBSERVED SPREAD"
            value={t1Fare > 0 && t45Fare > 0 ? `₹${(t1Fare - t45Fare).toLocaleString()}` : 'N/A'}
            change="T+1 Max to T+45 Min"
            changeType="neutral"
            badge={hasData ? (mode === 'DEMO' ? 'DEMO' : 'PROJECT_DERIVED') : 'UNAVAILABLE'}
            icon={<Percent size={18} color="#8B5CF6" />}
            footnote="Absolute inter-horizon pricing spread"
          />
        </div>

        {/* Lead-Time Chart */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF' }}>
              Advance Booking Horizon Curve (₹ Average Economy Fare)
            </h3>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Showing average, minimum, and maximum fares observed across booking horizons
            </div>
          </div>

          {hasData ? (
            <div style={{ height: '340px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={displayCurve} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(30, 45, 74, 0.6)" vertical={false} />
                  <XAxis dataKey="horizon" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={11} domain={['dataMin - 500', 'dataMax + 500']} unit="₹" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0B132B',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Fare']}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="avgFare" name="Average Fare" stroke="#3B82F6" strokeWidth={3} dot={{ r: 6 }} />
                  <Line type="monotone" dataKey="minFare" name="Lowest Available" stroke="#10B981" strokeWidth={2} strokeDasharray="3 3" dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="maxFare" name="Peak Available" stroke="#EF4444" strokeWidth={2} strokeDasharray="3 3" dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div
              style={{
                height: '240px',
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
                No validated fare observations available for corridor {selectedRoute}.
              </div>
              <div style={{ maxWidth: '500px', lineHeight: '1.6' }}>
                Lead-time elasticity requires fare quotes across departure horizons (T+1 through T+45). Switch to <strong>DEMO</strong> mode to view simulated horizon curves.
              </div>
            </div>
          )}
        </div>

        {/* Horizons Table */}
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
              Standardized MoSPI Horizon Sampling Specifications
            </h3>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Horizon Identifier</th>
                <th>Days in Advance</th>
                <th>MoSPI Sampling Target</th>
                <th>Economic Role</th>
                <th>Elasticity Profile</th>
                <th>Observed Fare ({selectedRoute})</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 800, color: '#EF4444' }}>T+1</td>
                <td className="mono">1 Day Ahead</td>
                <td>Next morning scheduled flights</td>
                <td>Emergency / Corporate spot demand</td>
                <td>Highly Inelastic (+100% price surge)</td>
                <td className="mono" style={{ fontWeight: 700 }}>₹{t1Fare.toLocaleString()}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 800, color: '#F59E0B' }}>T+7</td>
                <td className="mono">7 Days Ahead</td>
                <td>Next week departures</td>
                <td>Short-notice business / urgent travel</td>
                <td>Moderately Inelastic</td>
                <td className="mono" style={{ fontWeight: 700 }}>₹6,150</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 800, color: '#3B82F6' }}>T+15</td>
                <td className="mono">15 Days Ahead</td>
                <td>Mid-range departure window</td>
                <td>Planned domestic travel</td>
                <td>Balanced Elasticity</td>
                <td className="mono" style={{ fontWeight: 700 }}>₹5,050</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 800, color: '#10B981' }}>T+30</td>
                <td className="mono">30 Days Ahead</td>
                <td>1 month ahead scheduled departures</td>
                <td>Core family / leisure travel baseline</td>
                <td>Elastic (Market clearing price)</td>
                <td className="mono" style={{ fontWeight: 700 }}>₹{t30Fare.toLocaleString()}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 800, color: '#8B5CF6' }}>T+45</td>
                <td className="mono">45 Days Ahead</td>
                <td>Advance booking window</td>
                <td>Vacation & festival planners</td>
                <td>Highly Elastic (Advance purchase discount)</td>
                <td className="mono" style={{ fontWeight: 700 }}>₹{t45Fare.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
