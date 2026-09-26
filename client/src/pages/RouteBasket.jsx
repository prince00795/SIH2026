import React, { useEffect, useState } from 'react';
import { Topbar } from '../components/Topbar';
import { Badge } from '../components/Badge';
import { useSystemMode } from '../context/ModeContext';
import { api } from '../services/api';
import {
  Database,
  Search,
  SlidersHorizontal,
  Info,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const RouteBasket = () => {
  const { mode, toggleMode } = useSystemMode();
  const [routes, setRoutes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [topN, setTopN] = useState(20);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Fetch weights based on topN or all
    api.getDGCAWeights(topN).then((res) => {
      if (res.success) {
        setRoutes(res.data.routes || []);
      }
      setLoading(false);
    });
  }, [topN]);

  const filteredRoutes = routes.filter(
    (r) =>
      r.routeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.originCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.destinationCity.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ paddingBottom: '40px' }}>
      <Topbar
        title="DGCA Route Basket & Weight Derivation"
        subtitle="786 City-Pair Domestic Scheduled Passenger Traffic Matrix (2022-23) &bull; Top N Dynamic Basket"
        mode={mode}
        onModeToggle={toggleMode}
        badge="OFFICIAL_DERIVED"
      />

      <div style={{ padding: '24px 28px' }}>
        {/* Statutory Attribution Banner */}
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
          <Info size={20} color="#1E40AF" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '12.5px', lineHeight: '1.6' }}>
            <div style={{ fontWeight: 800, color: '#1E3A8A', fontSize: '13px', marginBottom: '3px' }}>
              OFFICIAL STATUTORY WEIGHT DERIVATION METHODOLOGY
            </div>
            <div style={{ color: 'var(--text-muted)' }}>
              Weights in the APIx index are derived strictly from the official Directorate General of Civil Aviation (DGCA)
              Scheduled Domestic Passenger Traffic matrix (Document title: <em>CITY PAIR WISE SCHEDULED DOMESTIC PASSENGER TRAFFIC STATISTICS FOR THE YEAR 2022-23</em>).
              Total scheduled domestic passenger traffic in this statutory release is exactly <strong>136,028,655 passengers</strong> across <strong>786 city-pairs</strong>.
            </div>
            <div style={{ marginTop: '6px', color: '#1E40AF', fontWeight: 600 }}>
              Notice: These weights represent a <u>DGCA Traffic-Derived Weight</u> calculated as w_r = Pax_r / &Sigma; Pax_j.
              They are not official MoSPI CPI item basket weights, but a high-frequency passenger expenditure proxy.
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '14px 18px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          {/* Search Box */}
          <div style={{ position: 'relative', width: '320px' }}>
            <Search
              size={15}
              color="var(--text-sub)"
              style={{ position: 'absolute', left: '11px', top: '10px' }}
            />
            <input
              type="text"
              placeholder="Search by city (e.g. Mumbai, Delhi, Bengaluru)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="filter-input"
              style={{
                width: '100%',
                padding: '7px 12px 7px 34px',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                backgroundColor: '#FFFFFF',
                color: 'var(--text-main)',
                fontSize: '12.5px',
                outline: 'none',
              }}
            />
          </div>

          {/* Top N Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SlidersHorizontal size={15} color="var(--text-sub)" />
            <span style={{ fontSize: '12px', color: 'var(--text-sub)', fontWeight: 600 }}>
              Basket Size:
            </span>
            {[10, 20, 50, 100, 786].map((n) => (
              <button
                key={n}
                onClick={() => setTopN(n)}
                style={{
                  padding: '5px 11px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  color: topN === n ? '#111827' : 'var(--text-sub)',
                  backgroundColor: topN === n ? '#FFFFFF' : 'transparent',
                  border: `1px solid ${topN === n ? '#D1D5DB' : 'transparent'}`,
                  boxShadow: topN === n ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.1s ease',
                }}
              >
                {n === 786 ? 'All 786 Pairs' : `Top ${n}`}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: 'var(--card-shadow)',
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
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)' }}>
                Active Basket Corridors ({filteredRoutes.length} Shown)
              </h3>
              <div style={{ fontSize: '12px', color: 'var(--text-sub)', marginTop: '2px' }}>
                Sorted by descending annual two-way passenger traffic (TO + FROM)
              </div>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-sub)' }}>
              Sum of Active Basket Weights:{' '}
              <strong style={{ color: '#15803D' }}>
                {(filteredRoutes.reduce((acc, curr) => acc + curr.weightInBasket, 0) * 100).toFixed(1)}%
              </strong>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Corridor Code</th>
                  <th>Origin City (Station 1)</th>
                  <th>Destination City (Station 2)</th>
                  <th>Pax (1 &rarr; 2)</th>
                  <th>Pax (2 &rarr; 1)</th>
                  <th>Total Two-Way Pax</th>
                  <th>National Share</th>
                  <th>DGCA Basket Weight</th>
                  <th>Provenance Type</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoutes.map((r) => (
                  <tr key={r.routeCode}>
                    <td className="mono" style={{ fontWeight: 700, color: r.rank <= 3 ? '#B45309' : 'var(--text-sub)' }}>
                      #{r.rank}
                    </td>
                    <td style={{ fontWeight: 800, color: 'var(--text-main)' }}>{r.routeCode}</td>
                    <td>{r.originCity} ({r.originIATA})</td>
                    <td>{r.destinationCity} ({r.destinationIATA})</td>
                    <td className="mono">{typeof r.passengersTo === 'number' ? r.passengersTo.toLocaleString() : '--'}</td>
                    <td className="mono">{typeof r.passengersFrom === 'number' ? r.passengersFrom.toLocaleString() : '--'}</td>
                    <td className="mono" style={{ fontWeight: 600 }}>
                      {typeof r.totalTwoWayTraffic === 'number' ? r.totalTwoWayTraffic.toLocaleString() : '--'}
                    </td>
                    <td className="mono">{typeof r.networkSharePct === 'number' ? r.networkSharePct.toFixed(2) : '--'}%</td>
                    <td className="mono" style={{ fontWeight: 700, color: '#2563EB' }}>
                      {typeof r.weightInBasket === 'number' ? (r.weightInBasket * 100).toFixed(2) : '--'}%
                    </td>
                    <td>
                      <Badge type="OFFICIAL_DERIVED" />
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
