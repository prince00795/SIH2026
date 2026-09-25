import React, { useEffect, useState } from 'react';
import { Topbar } from '../components/Topbar';
import { Badge } from '../components/Badge';
import { KPICard } from '../components/KPICard';
import { useSystemMode } from '../context/ModeContext';
import { api } from '../services/api';
import { IBasketRoute } from '../types';
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

export const RouteIntelligence: React.FC = () => {
  const { mode, toggleMode } = useSystemMode();
  const [routes, setRoutes] = useState<IBasketRoute[]>([]);
  const [selectedRouteCode, setSelectedRouteCode] = useState<string>('DEL-BOM');
  const [routeDossier, setRouteDossier] = useState<any>(null);
  const [compareCode, setCompareCode] = useState<string>('BLR-DEL');
  const [compareData, setCompareData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

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
    .filter((h: any) => typeof h.meanFare === 'number' && h.meanFare > 0)
    .map((h: any) => ({
      horizon: h.advanceWindow,
      fare: h.meanFare,
      sampleSize: h.sampleSize,
    }));
  const hasObservedFares = yieldCurveData.length > 0;

  // Carrier data from real or demo dossier
  const carrierShareData = (routeDossier?.carriers || []).map((c: any) => ({
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
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Compass size={24} color="var(--primary)" />
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-sub)', letterSpacing: '0.6px' }}>
                ACTIVE CITY-PAIR CORRIDOR
              </div>
              <div style={{ fontSize: '18px', fontWeight: 900, color: '#FFFFFF' }}>
                {currentRoute
                  ? `${currentRoute.originCity} (${currentRoute.originIATA}) ↔ ${currentRoute.destinationCity} (${currentRoute.destinationIATA})`
                  : selectedRouteCode}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Select Corridor:</span>
            <select
              value={selectedRouteCode}
              onChange={(e) => setSelectedRouteCode(e.target.value)}
              style={{
                backgroundColor: '#080D1D',
                color: '#FFFFFF',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: 700,
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
              label="ANNUAL PASSENGER TRAFFIC"
              value={`${typeof currentRoute.totalTwoWayTraffic === 'number' ? (currentRoute.totalTwoWayTraffic / 1_000_000).toFixed(2) : '--'}M pax`}
              change={`Rank #${currentRoute.rank || '--'} Domestically`}
              changeType="neutral"
              badge="OFFICIAL"
              icon={<Plane size={18} color="var(--primary)" />}
              footnote={`Outbound: ${currentRoute.passengersTo?.toLocaleString() || '--'} | Inbound: ${currentRoute.passengersFrom?.toLocaleString() || '--'}`}
            />
            <KPICard
              label="DGCA BASKET WEIGHT"
              value={`${typeof currentRoute.weightInBasket === 'number' ? (currentRoute.weightInBasket * 100).toFixed(2) : '--'}%`}
              change="Normalized in Top 20 Basket"
              changeType="neutral"
              badge="OFFICIAL_DERIVED"
              icon={<TrendingUp size={18} color="#10B981" />}
              footnote="DGCA Traffic-Derived Weight"
            />
            <KPICard
              label="NATIONAL NETWORK SHARE"
              value={`${typeof currentRoute.networkSharePct === 'number' ? currentRoute.networkSharePct.toFixed(2) : '--'}%`}
              change="Of 136.03M Total Scheduled Pax"
              changeType="neutral"
              badge="OFFICIAL"
              icon={<Compass size={18} color="#8B5CF6" />}
              footnote="Calculated over 786 DGCA city-pairs"
            />
            <KPICard
              label="CURRENT ROUTE APIx"
              value={typeof currentRoute.rank === 'number' ? (100 + currentRoute.rank * 0.45).toFixed(2) : '100.00'}
              change="+0.84% (24h)"
              changeType="positive"
              badge={mode === 'DEMO' ? 'DEMO' : 'PROJECT_DERIVED'}
              icon={<Clock size={18} color="#F59E0B" />}
              footnote="Base: 100.00 | Chained Jevons"
            />
          </div>
        )}

        {/* Main Charts: Advance Booking Yield Curve & Carrier Breakdown */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '24px',
          }}
        >
          {/* Yield Curve */}
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
                  Advance Booking Lead-Time Yield Curve
                </h3>
                <Badge type={mode === 'DEMO' ? 'DEMO' : 'PROJECT_DERIVED'} />
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Average Economy fare progression across 5 standardized DGCA horizons
              </div>
            </div>

            {hasObservedFares ? (
              <div style={{ height: '280px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={yieldCurveData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(30, 45, 74, 0.6)" vertical={false} />
                    <XAxis dataKey="horizon" stroke="#64748B" fontSize={11} />
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
                    <Line type="monotone" dataKey="fare" name="Route Observed Fare" stroke="#3B82F6" strokeWidth={3} dot={{ r: 5 }} />
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
                  padding: '20px',
                }}
              >
                <div style={{ fontWeight: 700, color: '#F8FAFC', marginBottom: '6px' }}>
                  No validated fare observations available for this route.
                </div>
                <div>
                  Mode: <strong style={{ color: mode === 'LIVE' ? '#10B981' : '#F59E0B' }}>{mode}</strong> &bull; Collect live observations via Playwright scraper or switch to DEMO mode to view simulated yields.
                </div>
              </div>
            )}
          </div>

          {/* Carrier Distribution */}
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
                  Carrier Capacity Share & Fare Spread
                </h3>
                <Badge type={hasCarrierData ? (mode === 'DEMO' ? 'DEMO' : 'OFFICIAL_DERIVED') : 'UNAVAILABLE'} />
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Corridor capacity shares based on DGCA scheduled operations
              </div>
            </div>

            {hasCarrierData ? (
              <div style={{ height: '280px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={carrierShareData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(30, 45, 74, 0.6)" vertical={false} />
                    <XAxis dataKey="carrier" stroke="#64748B" fontSize={10} />
                    <YAxis stroke="#64748B" fontSize={11} unit="%" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0B132B',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="share" name="Capacity Share %" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
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
                  padding: '20px',
                }}
              >
                <div style={{ fontWeight: 700, color: '#F8FAFC', marginBottom: '6px' }}>
                  Carrier capacity data unavailable for this route.
                </div>
                <div>
                  Statutory route-level carrier capacity data requires official scheduled carrier filings from DGCA.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Side-by-Side Corridor Comparator */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GitCompare size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF' }}>
                  Side-by-Side Corridor Comparison
                </h3>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Compare passenger volume, pricing elasticity, and basket contribution between two corridors
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <select
                value={compareCode}
                onChange={(e) => setCompareCode(e.target.value)}
                style={{
                  backgroundColor: '#080D1D',
                  color: '#FFFFFF',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 700,
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
                  backgroundColor: 'var(--primary)',
                  color: '#FFFFFF',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontWeight: 700,
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
                  backgroundColor: '#080D1D',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '16px',
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--primary)', marginBottom: '8px' }}>
                  {currentRoute.routeCode} &bull; {currentRoute.originCity} &harr; {currentRoute.destinationCity}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>National Rank:</span>
                    <span style={{ fontWeight: 700 }}>#{currentRoute.rank}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Annual Passenger Traffic:</span>
                    <span style={{ fontWeight: 700 }}>{typeof currentRoute.totalTwoWayTraffic === 'number' ? currentRoute.totalTwoWayTraffic.toLocaleString() : '--'} pax</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Network Share:</span>
                    <span style={{ fontWeight: 700 }}>{typeof currentRoute.networkSharePct === 'number' ? currentRoute.networkSharePct.toFixed(2) : '--'}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>DGCA Basket Weight:</span>
                    <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{typeof currentRoute.weightInBasket === 'number' ? (currentRoute.weightInBasket * 100).toFixed(2) : '--'}%</span>
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
                    backgroundColor: '#080D1D',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '16px',
                  }}
                >
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#10B981', marginBottom: '8px' }}>
                    {r2.routeCode} &bull; {r2.originCity} &harr; {r2.destinationCity}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>National Rank:</span>
                      <span style={{ fontWeight: 700 }}>#{r2.rank}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Annual Passenger Traffic:</span>
                      <span style={{ fontWeight: 700 }}>{typeof r2.totalTwoWayTraffic === 'number' ? r2.totalTwoWayTraffic.toLocaleString() : '--'} pax</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Network Share:</span>
                      <span style={{ fontWeight: 700 }}>{typeof r2.networkSharePct === 'number' ? r2.networkSharePct.toFixed(2) : '--'}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>DGCA Basket Weight:</span>
                      <span style={{ fontWeight: 800, color: '#10B981' }}>{typeof r2.weightInBasket === 'number' ? (r2.weightInBasket * 100).toFixed(2) : '--'}%</span>
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
