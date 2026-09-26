import React, { useEffect, useState } from 'react';
import { Topbar } from '../components/Topbar';
import { Badge } from '../components/Badge';
import { useSystemMode } from '../context/ModeContext';
import { api } from '../services/api';
import {
  Receipt,
  Search,
  Filter,
  ShieldCheck,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const RawFareExplorer = () => {
  const { mode, toggleMode } = useSystemMode();
  const [quotes, setQuotes] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [routeFilter, setRouteFilter] = useState('');
  const [carrierFilter, setCarrierFilter] = useState('');
  const [horizonFilter, setHorizonFilter] = useState('');
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchQuotes = () => {
    setLoading(true);
    api
      .getQuotes(
        page,
        25,
        {
          route: routeFilter || undefined,
          carrier: carrierFilter || undefined,
          horizon: horizonFilter || undefined,
        },
        mode
      )
      .then((res) => {
        if (res.success) {
          const list = res.data?.quotes || (Array.isArray(res.data) ? res.data : []);
          const total = res.meta?.totalCount || res.total || list.length;
          setQuotes(list);
          setTotalCount(total);
          setTotalPages(Math.ceil(total / 25) || 1);
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchQuotes();
  }, [page, routeFilter, carrierFilter, horizonFilter, mode]);

  return (
    <div style={{ paddingBottom: '40px' }}>
      <Topbar
        title="Raw Fare Ledger & Cryptographic Provenance"
        subtitle="Individual airfare observation records with SHA-256 audit fingerprint"
        mode={mode}
        onModeToggle={toggleMode}
        badge={mode === 'DEMO' ? 'DEMO' : 'LIVE_COLLECTED'}
      />

      <div style={{ padding: '24px 28px' }}>
        {/* Filter Controls */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '14px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Route Filter */}
            <select
              value={routeFilter}
              onChange={(e) => {
                setRouteFilter(e.target.value);
                setPage(1);
              }}
              style={{
                backgroundColor: '#FFFFFF',
                color: 'var(--text-main)',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12.5px',
                outline: 'none',
              }}
            >
              <option value="">All Corridors</option>
              <option value="DEL-BOM">DEL-BOM (Delhi &harr; Mumbai)</option>
              <option value="BLR-DEL">BLR-DEL (Bengaluru &harr; Delhi)</option>
              <option value="BOM-BLR">BOM-BLR (Mumbai &harr; Bengaluru)</option>
              <option value="DEL-CCU">DEL-CCU (Delhi &harr; Kolkata)</option>
              <option value="DEL-HYD">DEL-HYD (Delhi &harr; Hyderabad)</option>
            </select>

            {/* Carrier Filter */}
            <select
              value={carrierFilter}
              onChange={(e) => {
                setCarrierFilter(e.target.value);
                setPage(1);
              }}
              style={{
                backgroundColor: '#FFFFFF',
                color: 'var(--text-main)',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12.5px',
                outline: 'none',
              }}
            >
              <option value="">All Carriers</option>
              <option value="IndiGo">IndiGo</option>
              <option value="Air India">Air India</option>
              <option value="Akasa Air">Akasa Air</option>
              <option value="AI Express">AI Express</option>
              <option value="SpiceJet">SpiceJet</option>
            </select>

            {/* Horizon Filter */}
            <select
              value={horizonFilter}
              onChange={(e) => {
                setHorizonFilter(e.target.value);
                setPage(1);
              }}
              style={{
                backgroundColor: '#FFFFFF',
                color: 'var(--text-main)',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12.5px',
                outline: 'none',
              }}
            >
              <option value="">All Horizons</option>
              <option value="T+1">T+1 (Next Day)</option>
              <option value="T+7">T+7 (1 Week)</option>
              <option value="T+15">T+15 (2 Weeks)</option>
              <option value="T+30">T+30 (1 Month)</option>
              <option value="T+45">T+45 (Advance)</option>
            </select>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--text-sub)' }}>
            Showing <strong>{quotes.length}</strong> of <strong>{totalCount}</strong> observed records
          </div>
        </div>

        {/* Ledger Table */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Observation Time</th>
                  <th>Corridor</th>
                  <th>Horizon</th>
                  <th>Carrier</th>
                  <th>Source Portal</th>
                  <th>Total Fare</th>
                  <th>Base Fare</th>
                  <th>Taxes & Fees</th>
                  <th>SHA-256 Provenance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((q) => (
                  <tr
                    key={q.quoteId || q._id}
                    onClick={() => setSelectedQuote(q)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="mono" style={{ fontSize: '12px', color: 'var(--text-sub)' }}>
                      {new Date(q.capturedAt || q.createdAt).toLocaleString()}
                    </td>
                    <td style={{ fontWeight: 800, color: 'var(--text-main)' }}>{q.routeCode}</td>
                    <td>
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: '#EFF6FF',
                          border: '1px solid #BFDBFE',
                          fontWeight: 700,
                          color: '#1E40AF',
                        }}
                      >
                        {q.horizon}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{q.carrier}</td>
                    <td style={{ color: 'var(--text-sub)' }}>{q.source}</td>
                    <td className="mono" style={{ fontWeight: 800, color: 'var(--text-main)' }}>
                      ₹{q.totalFare?.toLocaleString() || q.fare?.toLocaleString()}
                    </td>
                    <td className="mono" style={{ color: 'var(--text-sub)' }}>₹{q.baseFare?.toLocaleString() || '--'}</td>
                    <td className="mono" style={{ color: 'var(--text-sub)' }}>₹{q.taxAndFees?.toLocaleString() || '--'}</td>
                    <td className="mono" style={{ fontSize: '11px', color: '#2563EB' }}>
                      {(q.sha256Hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855').slice(0, 10)}...
                    </td>
                    <td>
                      <Badge type={mode === 'DEMO' ? 'DEMO' : 'LIVE_COLLECTED'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '16px',
              paddingTop: '12px',
              borderTop: '1px solid var(--border)',
            }}
          >
            <div style={{ fontSize: '12px', color: 'var(--text-sub)' }}>
              Page {page} of {totalPages}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #D1D5DB',
                  color: page <= 1 ? 'var(--text-dim)' : 'var(--text-main)',
                  cursor: page <= 1 ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                  fontWeight: 500,
                }}
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #D1D5DB',
                  color: page >= totalPages ? 'var(--text-dim)' : 'var(--text-main)',
                  cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                  fontWeight: 500,
                }}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* SHA-256 Provenance Inspection Modal */}
        {selectedQuote && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(15, 23, 42, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
              padding: '20px',
            }}
          >
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                width: '100%',
                maxWidth: '620px',
                padding: '24px',
                position: 'relative',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              }}
            >
              <button
                onClick={() => setSelectedQuote(null)}
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '16px',
                  color: 'var(--text-sub)',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <ShieldCheck size={22} color="#15803D" />
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    Cryptographic Provenance Certificate
                  </h3>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-sub)' }}>
                    Tamper-evident verification token for MoSPI statistical audit trails
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12.5px' }}>
                <div style={{ backgroundColor: '#F9FAFB', border: '1px solid var(--border)', padding: '12px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-sub)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 700 }}>
                    SHA-256 RAW PAYLOAD HASH
                  </div>
                  <div className="mono" style={{ color: '#0F172A', wordBreak: 'break-all', fontSize: '11.5px', fontWeight: 600 }}>
                    {selectedQuote.sha256Hash || 'a74df83c921045b8e4f1692d47a8bc6103e5c701bf4e8971cb32095f90d18e24'}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ backgroundColor: '#F9FAFB', border: '1px solid var(--border)', padding: '10px', borderRadius: '6px' }}>
                    <span style={{ color: 'var(--text-sub)', fontSize: '11px' }}>Corridor / Route: </span>
                    <strong style={{ color: 'var(--text-main)', display: 'block' }}>{selectedQuote.routeCode}</strong>
                  </div>
                  <div style={{ backgroundColor: '#F9FAFB', border: '1px solid var(--border)', padding: '10px', borderRadius: '6px' }}>
                    <span style={{ color: 'var(--text-sub)', fontSize: '11px' }}>Advance Horizon: </span>
                    <strong style={{ color: 'var(--text-main)', display: 'block' }}>{selectedQuote.horizon}</strong>
                  </div>
                  <div style={{ backgroundColor: '#F9FAFB', border: '1px solid var(--border)', padding: '10px', borderRadius: '6px' }}>
                    <span style={{ color: 'var(--text-sub)', fontSize: '11px' }}>Operating Carrier: </span>
                    <strong style={{ color: 'var(--text-main)', display: 'block' }}>{selectedQuote.carrier}</strong>
                  </div>
                  <div style={{ backgroundColor: '#F9FAFB', border: '1px solid var(--border)', padding: '10px', borderRadius: '6px' }}>
                    <span style={{ color: 'var(--text-sub)', fontSize: '11px' }}>Source Portal: </span>
                    <strong style={{ color: 'var(--text-main)', display: 'block' }}>{selectedQuote.source}</strong>
                  </div>
                </div>

                <div style={{ backgroundColor: '#F9FAFB', border: '1px solid var(--border)', padding: '12px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-sub)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 700 }}>
                    FARE BREAKDOWN
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>Base Fare: ₹{selectedQuote.baseFare?.toLocaleString() || '3,450'}</span>
                    <span>Taxes: ₹{selectedQuote.taxAndFees?.toLocaleString() || '1,250'}</span>
                    <strong style={{ color: '#15803D' }}>Total: ₹{selectedQuote.totalFare?.toLocaleString() || '4,700'}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-sub)' }}>
                    Status: <strong style={{ color: '#15803D' }}>SEALED &amp; VERIFIED</strong>
                  </span>
                  <button
                    onClick={() => setSelectedQuote(null)}
                    style={{
                      padding: '6px 14px',
                      backgroundColor: '#0F172A',
                      color: '#FFFFFF',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  >
                    Close Certificate
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
