import React, { useEffect, useState } from 'react';
import { Topbar } from '../components/Topbar';
import { Badge } from '../components/Badge';
import { KPICard } from '../components/KPICard';
import { useSystemMode } from '../context/ModeContext';
import { api } from '../services/api';
import {
  Compass,
  TrendingUp,
  Plane,
  GitCompare,
  ArrowRight,
  Info,
  Calendar,
  Clock,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export const RouteIntelligence = () => {
  const { mode, toggleMode } = useSystemMode();
  const [routes, setRoutes] = useState([]);
  const [selectedRouteCode, setSelectedRouteCode] = useState('DEL-BOM');
  const [routeDossier, setRouteDossier] = useState(null);
  const [compareCode, setCompareCode] = useState('BLR-DEL');
  const [compareData, setCompareData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getRoutes(20).then((res) => {
      const list = res.data?.routes || (Array.isArray(res.data) ? res.data : []);
      if (res.success && list.length) {
        setRoutes(list);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedRouteCode) return;
    setLoading(true);
    api.getRouteDossier(selectedRouteCode, mode).then((res) => {
      if (res.success) setRouteDossier(res.data);
      setLoading(false);
    });
  }, [selectedRouteCode, mode]);

  const handleCompare = () => {
    if (!selectedRouteCode || !compareCode) return;
    api.compareRoutes(selectedRouteCode, compareCode, mode).then((res) => {
      if (res.success) setCompareData(res.data);
    });
  };

  const currentRoute = routes.find((r) => r.routeCode === selectedRouteCode);

  // Derive curve dynamically from real or demo observations
  const rawBreakdown = routeDossier?.horizonBreakdown || [];
  const yieldCurveData = rawBreakdown
    .filter((h) => typeof h.meanFare === 'number' && h.meanFare > 0)
    .map((h) => ({
      horizon: h.advanceWindow,
      fare: h.meanFare,
      sampleSize: h.sampleSize,
    }));
  const hasObservedFares = yieldCurveData.length > 0;

  // Carrier data from real or demo dossier
  const carrierShareData = (routeDossier?.carriers || []).map((c) => ({
    carrier: `${c.name} (${c.code})`,
    share: c.estimatedSharePct,
    avgFare: c.avgFare,
  }));
  const hasCarrierData = carrierShareData.length > 0;

  return (
    <div style={{ paddingBottom: '40px' }}>
      <Topbar
        title="Corridor 360° Intelligence & Yield Curves"
        subtitle="Route-level fare structures, passenger density & carrier dispersion"
        mode={mode}
        onModeToggle={toggleMode}
        badge="OFFICIAL_DERIVED"
      />

      <div style={{ padding: '24px 28px' }}>
        {/* Route Selector Banner */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Compass size={24} color="#0F172A" />
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-sub)', letterSpacing: '0.5px' }}>
                ACTIVE CITY-PAIR CORRIDOR
              </div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)' }}>
                {currentRoute
                  ? `${currentRoute.originCity} (${currentRoute.originIATA}) ↔ ${currentRoute.destinationCity} (${currentRoute.destinationIATA})`
                  : selectedRouteCode}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-sub)' }}>Select Corridor:</span>
            <select
              value={selectedRouteCode}
              onChange={(e) => setSelectedRouteCode(e.target.value)}
              style={{
                backgroundColor: '#FFFFFF',
                color: 'var(--text-main)',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                padding: '7px 12px',
                fontSize: '12.5px',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {routes.map((r) => (
                <option key={r.routeCode} value={r.routeCode}>
                  #{r.rank} {r.routeCode} &bull; {r.originCity} &harr; {r.destinationCity}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Corridor Metric Cards */}
        {currentRoute && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
              marginBottom: '24px',
            }}
          >
            <KPICard
              label="ANNUAL PASSENGERS (DGCA)"
              value={typeof currentRoute.totalTwoWayTraffic === 'number' ? `${(currentRoute.totalTwoWayTraffic / 1e6).toFixed(2)}M` : '--'}
              change={`Rank #${currentRoute.rank} nationally`}
              changeType="neutral"
              badge="OFFICIAL"
              icon={<Plane size={18} color="#2563EB" />}
              footnote="DGCA Scheduled Domestic Passenger Traffic (2022-23)"
            />
            <KPICard
              label="DOMESTIC NETWORK SHARE"
              value={typeof currentRoute.networkSharePct === 'number' ? `${currentRoute.networkSharePct.toFixed(2)}%` : '--'}
              change="Share of All-India Scheduled Traffic"
              changeType="neutral"
              badge="OFFICIAL_DERIVED"
              icon={<Layers size={18} color="#0F172A" />}
              footnote="Out of 136.03M annual passenger movements"
            />
            <KPICard
              label="DGCA BASKET WEIGHT"
              value={typeof currentRoute.weightInBasket === 'number' ? `${(currentRoute.weightInBasket * 100).toFixed(2)}%` : '--'}
              change={currentRoute.weightLabel || 'TOP 20 BASKET'}
              changeType="positive"
              badge="OFFICIAL_DERIVED"
              icon={<TrendingUp size={18} color="#15803D" />}
              footnote="Normalized weight in Short-Jevons aggregator"
            />
            <KPICard
              label="OBSERVATION COVERAGE"
              value="5 Horizons"
              change="T+1 to T+45 Daily Scrapes"
              changeType="neutral"
              badge={mode === 'DEMO' ? 'DEMO' : 'LIVE_COLLECTED'}
              icon={<Clock size={18} color="#B45309" />}
              footnote="Continuously updated by Playwright scraper"
            />
          </div>
        )}

        {/* Dynamic Yield Curve & Capacity Share Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr',
            gap: '20px',
            marginBottom: '24px',
          }}
        >
          {/* Yield Curve Chart */}
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)' }}>
                  Advance Booking Lead-Time Yield Curve
                </h3>
                <Badge type={mode === 'DEMO' ? 'DEMO' : 'PROJECT_DERIVED'} />
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-sub)', marginTop: '2px' }}>
                Average Economy fare progression across 5 standardized DGCA horizons
              </div>
            </div>

            {hasObservedFares ? (
              <div style={{ height: '280px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={yieldCurveData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                    <XAxis dataKey="horizon" stroke="#6B7280" fontSize={11} />
                    <YAxis stroke="#6B7280" fontSize={11} domain={['dataMin - 500', 'dataMax + 500']} unit="₹" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#111827',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                      }}
                      formatter={(val) => [`₹${Number(val).toLocaleString()}`, 'Fare']}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="fare" name="Route Observed Fare" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 4 }} />
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
                  backgroundColor: '#F9FAFB',
                  borderRadius: '6px',
                  border: '1px dashed var(--border)',
                  color: 'var(--text-sub)',
                  fontSize: '13px',
                  textAlign: 'center',
                  padding: '20px',
                }}
              >
                <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                  No validated fare observations available for this route.
                </div>
                <div>
                  Mode: <strong style={{ color: mode === 'LIVE' ? '#15803D' : '#B45309' }}>{mode}</strong> &bull; Collect live observations via Playwright scraper or switch to DEMO mode to view simulated yields.
                </div>
              </div>
            )}
          </div>

          {/* Carrier Distribution */}
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)' }}>
                  Carrier Capacity Share & Fare Spread
                </h3>
                <Badge type={hasCarrierData ? (mode === 'DEMO' ? 'DEMO' : 'OFFICIAL_DERIVED') : 'UNAVAILABLE'} />
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-sub)', marginTop: '2px' }}>
                Corridor capacity shares based on DGCA scheduled operations
              </div>
            </div>

            {hasCarrierData ? (
              <div style={{ height: '280px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={carrierShareData} layout="vertical" margin={{ top: 10, right: 20, left: 30, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                    <XAxis type="number" stroke="#6B7280" fontSize={11} unit="%" />
                    <YAxis dataKey="carrier" type="category" stroke="#6B7280" fontSize={10} width={90} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#111827',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                      }}
                      formatter={(val, name, item) => [
                        `${val}% Share (Avg: ₹${item.payload.avgFare ? item.payload.avgFare.toLocaleString() : '--'})`,
                        'Capacity',
                      ]}
                    />
                    <Bar dataKey="share" name="Capacity Share (%)" fill="#0F172A" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div
                style={{
                  height: '240px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#F9FAFB',
                  borderRadius: '6px',
                  border: '1px dashed var(--border)',
                  color: 'var(--text-sub)',
                  fontSize: '13px',
                }}
              >
                No carrier market share data loaded.
              </div>
            )}
          </div>
        </div>

        {/* Head-to-Head Corridor Comparison Tool */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GitCompare size={18} color="#0F172A" />
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)' }}>
                  Corridor Head-to-Head Comparative Diagnostics
                </h3>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-sub)', marginTop: '2px' }}>
                Direct econometric comparison of traffic density, basket weights, and tariff regimes
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <select
                value={compareCode}
                onChange={(e) => setCompareCode(e.target.value)}
                style={{
                  backgroundColor: '#FFFFFF',
                  color: 'var(--text-main)',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                {routes
                  .filter((r) => r.routeCode !== selectedRouteCode)
                  .map((r) => (
                    <option key={r.routeCode} value={r.routeCode}>
                      {r.routeCode} &bull; {r.originCity} &harr; {r.destinationCity}
                    </option>
                  ))}
              </select>
              <button
                onClick={handleCompare}
                style={{
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '12px',
                }}
              >
                Compare Now
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginTop: '16px',
            }}
          >
            {/* Corridor A */}
            {currentRoute && (
              <div
                style={{
                  backgroundColor: '#F9FAFB',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  padding: '16px',
                }}
              >
                <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
                  {currentRoute.routeCode} &bull; {currentRoute.originCity} &harr; {currentRoute.destinationCity}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-sub)' }}>National Rank:</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>#{currentRoute.rank}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-sub)' }}>Annual Passenger Traffic:</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{typeof currentRoute.totalTwoWayTraffic === 'number' ? currentRoute.totalTwoWayTraffic.toLocaleString() : '--'} pax</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-sub)' }}>Network Share:</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{typeof currentRoute.networkSharePct === 'number' ? currentRoute.networkSharePct.toFixed(2) : '--'}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-sub)' }}>DGCA Basket Weight:</span>
                    <span style={{ fontWeight: 700, color: '#2563EB' }}>{typeof currentRoute.weightInBasket === 'number' ? (currentRoute.weightInBasket * 100).toFixed(2) : '--'}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Corridor B */}
            {(() => {
              const r2 = routes.find((r) => r.routeCode === compareCode);
              if (!r2) return null;
              return (
                <div
                  style={{
                    backgroundColor: '#F9FAFB',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    padding: '16px',
                  }}
                >
                  <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
                    {r2.routeCode} &bull; {r2.originCity} &harr; {r2.destinationCity}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-sub)' }}>National Rank:</span>
                      <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>#{r2.rank}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-sub)' }}>Annual Passenger Traffic:</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{typeof r2.totalTwoWayTraffic === 'number' ? r2.totalTwoWayTraffic.toLocaleString() : '--'} pax</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-sub)' }}>Network Share:</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{typeof r2.networkSharePct === 'number' ? r2.networkSharePct.toFixed(2) : '--'}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-sub)' }}>DGCA Basket Weight:</span>
                      <span style={{ fontWeight: 700, color: '#15803D' }}>{typeof r2.weightInBasket === 'number' ? (r2.weightInBasket * 100).toFixed(2) : '--'}%</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};
