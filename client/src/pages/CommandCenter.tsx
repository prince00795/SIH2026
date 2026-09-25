import React, { useEffect, useState } from 'react';
import { Topbar } from '../components/Topbar';
import { KPICard } from '../components/KPICard';
import { IndiaRouteMap } from '../components/IndiaRouteMap';
import { Badge } from '../components/Badge';
import { useSystemMode } from '../context/ModeContext';
import { api } from '../services/api';
import { INationalAPIxData, IBasketRoute } from '../types';
import {
  TrendingUp,
  Activity,
  Compass,
  Database,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Flame,
  RotateCcw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  AreaChart,
} from 'recharts';

export const CommandCenter: React.FC = () => {
  const { mode, toggleMode } = useSystemMode();
  const [nationalData, setNationalData] = useState<INationalAPIxData | null>(null);
  const [routes, setRoutes] = useState<IBasketRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string>('DEL-BOM');
  const [timeframe, setTimeframe] = useState<string>('30D');
  const [loading, setLoading] = useState<boolean>(true);

  // Macro Scenario Simulation States
  const [fuelShock, setFuelShock] = useState<number>(15);
  const [tariffShock, setTariffShock] = useState<number>(5);
  const [demandShock, setDemandShock] = useState<number>(8);
  const [capacityShock, setCapacityShock] = useState<number>(-3);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [idxRes, rtsRes] = await Promise.all([
        api.getNationalIndex(mode, timeframe),
        api.getRoutes(20),
      ]);
      if (idxRes.success) setNationalData(idxRes.data);
      if (rtsRes.success) {
        const list = rtsRes.data?.routes || (Array.isArray(rtsRes.data) ? rtsRes.data : []);
        setRoutes(list);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [mode, timeframe]);

  const timeSeries = nationalData?.timeSeries || [];

  return (
    <div style={{ paddingBottom: '40px' }}>
      <Topbar
        title="National Airfare Index Command Center"
        subtitle="Real-time Short-Jevons Chained Airfare Price Index (APIx) &bull; MoSPI CPI Augmentation"
        mode={mode}
        onModeToggle={toggleMode}
        badge={mode === 'DEMO' ? 'DEMO' : 'PROJECT_DERIVED'}
      />

      <div style={{ padding: '24px 28px' }}>
        {/* Mode Warning Banner if DEMO */}
        {mode === 'DEMO' && (
          <div
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              borderRadius: '10px',
              padding: '12px 18px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertTriangle size={20} color="#F59E0B" />
              <div>
                <span style={{ fontWeight: 800, color: '#FBBF24', fontSize: '13px' }}>
                  DEMO / SIMULATION MODE ACTIVE:
                </span>{' '}
                <span style={{ color: '#F8FAFC', fontSize: '12.5px' }}>
                  Displaying calibrated synthetic quotes based on official DGCA traffic & MoSPI parameters. To run real Playwright web scraping, switch to LIVE COLLECTION.
                </span>
              </div>
            </div>
            <button
              onClick={toggleMode}
              style={{
                backgroundColor: '#F59E0B',
                color: '#000',
                padding: '6px 14px',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '12px',
              }}
            >
              Switch to Live Mode
            </button>
          </div>
        )}

        {/* Live Ticker Bar */}
        <div
          style={{
            backgroundColor: '#0F172A',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '10px 16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            fontSize: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: 800 }}>
            <Activity size={14} />
            <span>CORRIDOR PULSE:</span>
          </div>
          {routes.slice(0, 6).map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{r.routeCode}</span>
              <span style={{ color: 'var(--text-muted)' }}>Wt: {typeof r.weightInBasket === 'number' ? (r.weightInBasket * 100).toFixed(1) : '0'}%</span>
              <span style={{ color: '#10B981', display: 'flex', alignItems: 'center' }}>
                <ArrowUpRight size={12} /> {typeof r.rank === 'number' ? (100 + (r.rank * 0.4)).toFixed(2) : '100.00'}
              </span>
              <span style={{ color: 'var(--border)', margin: '0 4px' }}>|</span>
            </div>
          ))}
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
            label="NATIONAL APIx INDEX"
            value={nationalData && typeof nationalData.currentNationalAPIx === 'number' ? nationalData.currentNationalAPIx.toFixed(2) : 'APIx unavailable'}
            change={nationalData && typeof nationalData.dailyChangePct === 'number' && nationalData.currentNationalAPIx !== null ? `${nationalData.dailyChangePct >= 0 ? '+' : ''}${nationalData.dailyChangePct.toFixed(2)}% (24h)` : undefined}
            changeType={nationalData && nationalData.dailyChangePct >= 0 ? 'positive' : 'negative'}
            badge={mode === 'DEMO' ? 'DEMO' : (nationalData?.badge || 'UNAVAILABLE')}
            icon={<TrendingUp size={18} color="var(--primary)" />}
            footnote={nationalData?.notice || "Base: 100.00 | Chained Short-Jevons"}
          />
          <KPICard
            label="MONITORED BASKET ROUTES"
            value={routes.length.toString()}
            change="Top 20 DGCA Corridors"
            changeType="neutral"
            badge="OFFICIAL_DERIVED"
            icon={<Compass size={18} color="#10B981" />}
            footnote="Accounts for 35.4% of total domestic pax"
          />
          <KPICard
            label="ADVANCE HORIZONS"
            value="5 Windows"
            change="T+1, T+7, T+15, T+30, T+45"
            changeType="neutral"
            badge="OFFICIAL"
            icon={<Layers size={18} color="#8B5CF6" />}
            footnote="Captures full dynamic pricing curve"
          />
          <KPICard
            label="OFFICIAL DOMESTIC PAX BASE"
            value="136.03M"
            change="Annual Scheduled Traffic"
            changeType="neutral"
            badge="OFFICIAL"
            icon={<Database size={18} color="#F59E0B" />}
            footnote="DGCA City-Pair Matrix 2022-23"
          />
        </div>

        {/* Main Grid: Chart & Geodesic Map */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.6fr 1fr',
            gap: '20px',
            marginBottom: '24px',
          }}
        >
          {/* Main Chart Section */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
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
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF' }}>
                    National Airfare Price Index (APIx) Progression
                  </h3>
                  <Badge type={mode === 'DEMO' ? 'DEMO' : 'PROJECT_DERIVED'} />
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Weighted geometric mean across DGCA Top 20 Corridors
                </div>
              </div>

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
                      padding: '5px 12px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: timeframe === tf ? '#FFFFFF' : 'var(--text-muted)',
                      backgroundColor: timeframe === tf ? 'var(--primary)' : 'transparent',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Recharts Area or Empty State */}
            {timeSeries.length > 0 ? (
              <div style={{ height: '320px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="apixGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(30, 45, 74, 0.6)" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="#64748B"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(val) => val.slice(5)}
                    />
                    <YAxis
                      stroke="#64748B"
                      fontSize={11}
                      domain={['dataMin - 2', 'dataMax + 2']}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0B132B',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                      labelStyle={{ color: '#94A3B8', fontWeight: 600 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="indexValue"
                      name="APIx Index"
                      stroke="#3B82F6"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#apixGradient)"
                    />
                  </AreaChart>
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
                  The national index is constructed strictly from validated chained price relatives. To initialize the index series in LIVE mode, execute the Playwright collection pipeline, or toggle to <strong>DEMO</strong> mode to preview the 30-day simulation.
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

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '12px',
                borderTop: '1px solid var(--border)',
                marginTop: '12px',
                fontSize: '11px',
                color: 'var(--text-sub)',
              }}
            >
              <span>Method: Short-Jevons Geometric Relatives [I(t) = I(t-1) &times; J(t)]</span>
              <span>Weights: DGCA Scheduled Domestic Passenger Traffic (2022-23)</span>
            </div>
          </div>

          {/* India Route Geodesic Map */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF' }}>
                  Corridor Topology & Traffic
                </h3>
                <Badge type="OFFICIAL_DERIVED" />
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Top 20 DGCA routes network. Click a corridor to focus.
              </div>
            </div>

            <div style={{ flex: 1, minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IndiaRouteMap
                routes={routes}
                selectedRoute={selectedRoute}
                onSelectRoute={(code) => setSelectedRoute(code)}
              />
            </div>
          </div>
        </div>

        {/* Macroeconomic Policy & ATF Shock Stress-Tester */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF' }}>
                  RBI / MoSPI Macroeconomic Policy Stress-Tester & Pass-Through Simulator
                </h3>
                <Badge type="PROJECT_DERIVED" />
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Simulate ATF aviation fuel price shocks, carrier base tariffs, and capacity shortages on headline retail inflation
              </div>
            </div>

            <button
              onClick={() => {
                setFuelShock(15);
                setTariffShock(5);
                setDemandShock(8);
                setCapacityShock(-3);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                backgroundColor: '#080D1D',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
                fontSize: '11.5px',
                fontWeight: 600,
              }}
            >
              <RotateCcw size={12} />
              <span>Reset Parameters</span>
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
              backgroundColor: '#080D1D',
              borderRadius: '10px',
              padding: '16px',
              marginBottom: '16px',
            }}
          >
            {/* Slider 1: ATF Shock */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Flame size={12} color="#F59E0B" /> ATF Fuel Price Shock:
                </span>
                <strong className="mono" style={{ color: fuelShock >= 0 ? '#F59E0B' : '#10B981' }}>
                  {fuelShock >= 0 ? '+' : ''}{fuelShock}%
                </strong>
              </div>
              <input
                type="range"
                min="-20"
                max="50"
                step="1"
                value={fuelShock}
                onChange={(e) => setFuelShock(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#F59E0B', cursor: 'pointer' }}
              />
              <div style={{ fontSize: '10px', color: 'var(--text-sub)', marginTop: '3px' }}>
                35% of airline operating costs; 75% structural pass-through
              </div>
            </div>

            {/* Slider 2: Tariff Shift */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Base Tariff Policy Shift:</span>
                <strong className="mono" style={{ color: tariffShock >= 0 ? '#3B82F6' : '#10B981' }}>
                  {tariffShock >= 0 ? '+' : ''}{tariffShock}%
                </strong>
              </div>
              <input
                type="range"
                min="-20"
                max="30"
                step="1"
                value={tariffShock}
                onChange={(e) => setTariffShock(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
              <div style={{ fontSize: '10px', color: 'var(--text-sub)', marginTop: '3px' }}>
                Carrier yield management strategy & base fare shifts
              </div>
            </div>

            {/* Slider 3: Demand Shift */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Seasonal Demand Surge:</span>
                <strong className="mono" style={{ color: demandShock >= 0 ? '#10B981' : '#EF4444' }}>
                  {demandShock >= 0 ? '+' : ''}{demandShock}%
                </strong>
              </div>
              <input
                type="range"
                min="-10"
                max="25"
                step="1"
                value={demandShock}
                onChange={(e) => setDemandShock(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#10B981', cursor: 'pointer' }}
              />
              <div style={{ fontSize: '10px', color: 'var(--text-sub)', marginTop: '3px' }}>
                Diwali, holiday travel, or corporate conference influx
              </div>
            </div>

            {/* Slider 4: Fleet Capacity Shock */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Fleet Supply Restraint:</span>
                <strong className="mono" style={{ color: capacityShock < 0 ? '#EF4444' : '#10B981' }}>
                  {capacityShock >= 0 ? '+' : ''}{capacityShock}%
                </strong>
              </div>
              <input
                type="range"
                min="-15"
                max="15"
                step="1"
                value={capacityShock}
                onChange={(e) => setCapacityShock(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#EF4444', cursor: 'pointer' }}
              />
              <div style={{ fontSize: '10px', color: 'var(--text-sub)', marginTop: '3px' }}>
                Aircraft groundings, engine supply chain issues, or slots
              </div>
            </div>
          </div>

          {/* Real-time Calculated Outcomes */}
          {(() => {
            const fuelPassThrough = fuelShock * 0.35 * 0.75;
            const tightness = (demandShock - capacityShock) * 0.45;
            const netAirfareShock = tariffShock + fuelPassThrough + tightness;
            const currentBase = (nationalData && typeof nationalData.currentNationalAPIx === 'number')
              ? nationalData.currentNationalAPIx
              : 100.0;
            const simulatedAPIx = parseFloat((currentBase * (1 + netAirfareShock / 100)).toFixed(2));
            const transportBps = parseFloat((netAirfareShock * 0.0385 * 100).toFixed(2));
            const headlineBps = parseFloat((transportBps * 0.0859).toFixed(3));

            return (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '12px',
                }}
              >
                <div style={{ backgroundColor: '#0B132B', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    SIMULATED APIx INDEX
                  </div>
                  <div className="mono" style={{ fontSize: '20px', fontWeight: 900, color: '#38BDF8', marginTop: '2px' }}>
                    {simulatedAPIx}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-sub)' }}>
                    Base: {currentBase.toFixed(2)} ({netAirfareShock >= 0 ? '+' : ''}{netAirfareShock.toFixed(1)}%)
                  </div>
                </div>

                <div style={{ backgroundColor: '#0B132B', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    NET AIRFARE VOLATILITY
                  </div>
                  <div className="mono" style={{ fontSize: '20px', fontWeight: 900, color: netAirfareShock >= 0 ? '#F59E0B' : '#10B981', marginTop: '2px' }}>
                    {netAirfareShock >= 0 ? '+' : ''}{netAirfareShock.toFixed(2)}%
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-sub)' }}>
                    Fuel: +{fuelPassThrough.toFixed(1)}% | Tightness: +{tightness.toFixed(1)}%
                  </div>
                </div>

                <div style={{ backgroundColor: '#0B132B', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    TRANSPORT CPI TRANSMISSION
                  </div>
                  <div className="mono" style={{ fontSize: '20px', fontWeight: 900, color: '#A78BFA', marginTop: '2px' }}>
                    {transportBps >= 0 ? '+' : ''}{transportBps} bps
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-sub)' }}>
                    3.85% Transport Division weight
                  </div>
                </div>

                <div style={{ backgroundColor: '#0B132B', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    ALL-INDIA HEADLINE CPI IMPACT
                  </div>
                  <div className="mono" style={{ fontSize: '20px', fontWeight: 900, color: headlineBps >= 0 ? '#EF4444' : '#10B981', marginTop: '2px' }}>
                    {headlineBps >= 0 ? '+' : ''}{headlineBps} bps
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-sub)' }}>
                    Direct pass-through into Headline CPI
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Bottom Section: Top 5 Basket Corridors Table */}
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
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF' }}>
                  High-Impact Corridors in Current APIx Basket
                </h3>
                <Badge type="OFFICIAL_DERIVED" />
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Corridors ranked by two-way annual passenger traffic with derived index weights
              </div>
            </div>
            <button
              onClick={fetchData}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                color: 'var(--primary)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              <RefreshCw size={12} />
              <span>Refresh Basket</span>
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Corridor</th>
                  <th>Origin &bull; Destination</th>
                  <th>Annual Pax (TO + FROM)</th>
                  <th>Network Share</th>
                  <th>DGCA Basket Weight</th>
                  <th>Index Base</th>
                  <th>Weight Label</th>
                </tr>
              </thead>
              <tbody>
                {routes.slice(0, 8).map((r) => (
                  <tr key={r.routeCode} style={{ cursor: 'pointer' }} onClick={() => setSelectedRoute(r.routeCode)}>
                    <td className="mono" style={{ fontWeight: 700, color: r.rank <= 3 ? '#F59E0B' : 'var(--text-muted)' }}>
                      #{r.rank}
                    </td>
                    <td style={{ fontWeight: 800, color: '#FFFFFF' }}>{r.routeCode}</td>
                    <td>{r.originCity} ({r.originIATA}) &harr; {r.destinationCity} ({r.destinationIATA})</td>
                    <td className="mono" style={{ fontWeight: 700 }}>
                      {typeof r.totalTwoWayTraffic === 'number' ? r.totalTwoWayTraffic.toLocaleString() : '0'} pax
                    </td>
                    <td className="mono">{typeof r.networkSharePct === 'number' ? r.networkSharePct.toFixed(2) : '--'}%</td>
                    <td className="mono" style={{ fontWeight: 800, color: 'var(--primary)' }}>
                      {typeof r.weightInBasket === 'number' ? (r.weightInBasket * 100).toFixed(2) : '--'}%
                    </td>
                    <td className="mono">100.00</td>
                    <td>
                      <span style={{ fontSize: '10.5px', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#1E293B', color: '#94A3B8' }}>
                        {r.weightLabel}
                      </span>
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
