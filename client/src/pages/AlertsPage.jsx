import React, { useEffect, useState } from 'react';
import { Topbar } from '../components/Topbar';
import { Badge } from '../components/Badge';
import { useSystemMode } from '../context/ModeContext';
import { api } from '../services/api';
import {
  Bell,
  AlertTriangle,
  ArrowRightLeft,
  Clock,
  TrendingUp,
  ShieldAlert,
  CheckCircle2,
  Filter,
} from 'lucide-react';

export const AlertsPage = () => {
  const { mode, toggleMode } = useSystemMode();
  const [anomalies, setAnomalies] = useState([]);
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getAnomalies(mode).then((res) => {
      if (res.success) {
        const list = res.data?.anomalies || (Array.isArray(res.data) ? res.data : []);
        setAnomalies(list);
      }
      setLoading(false);
    });
  }, [mode]);

  const filtered = anomalies.filter(
    (a) => severityFilter === 'ALL' || a.severity === severityFilter
  );

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B' };
      case 'HIGH':
        return { bg: '#FFFBEB', border: '#FDE68A', text: '#92400E' };
      case 'MEDIUM':
        return { bg: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF' };
      default:
        return { bg: '#F3F4F6', border: '#E5E7EB', text: '#4B5563' };
    }
  };

  return (
    <div style={{ paddingBottom: '50px' }}>
      <Topbar
        title="Market Pricing Anomalies & Volatility Alerts"
        subtitle="Automated detection of Horizon Inversions, Directional Asymmetries & Rate Surges"
        mode={mode}
        onModeToggle={toggleMode}
        badge={mode === 'DEMO' ? 'DEMO' : 'PROJECT_DERIVED'}
      />

      <div style={{ padding: '24px 28px', maxWidth: '1100px' }}>
        {/* Severity Count Banners */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: '#991B1B', fontWeight: 700 }}>CRITICAL SEVERITY</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#7F1D1D', marginTop: '2px' }}>
                {anomalies.filter((a) => a.severity === 'CRITICAL').length}
              </div>
            </div>
            <ShieldAlert size={22} color="#DC2626" />
          </div>

          <div
            style={{
              backgroundColor: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: '#92400E', fontWeight: 700 }}>HIGH SEVERITY</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#78350F', marginTop: '2px' }}>
                {anomalies.filter((a) => a.severity === 'HIGH').length}
              </div>
            </div>
            <AlertTriangle size={22} color="#D97706" />
          </div>

          <div
            style={{
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: '#1E40AF', fontWeight: 700 }}>MEDIUM SEVERITY</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#1E3A8A', marginTop: '2px' }}>
                {anomalies.filter((a) => a.severity === 'MEDIUM').length}
              </div>
            </div>
            <AlertTriangle size={22} color="#2563EB" />
          </div>

          <div
            style={{
              backgroundColor: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: '#166534', fontWeight: 700 }}>TOTAL DETECTIONS</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#14532D', marginTop: '2px' }}>
                {anomalies.length}
              </div>
            </div>
            <Bell size={22} color="#16A34A" />
          </div>
        </div>

        {/* Filter Bar */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '12px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={15} color="var(--text-sub)" />
            <span style={{ fontSize: '12px', color: 'var(--text-sub)', fontWeight: 600 }}>Filter Severity:</span>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: severityFilter === sev ? '#0F172A' : '#FFFFFF',
                  color: severityFilter === sev ? '#FFFFFF' : 'var(--text-sub)',
                  border: `1px solid ${severityFilter === sev ? '#0F172A' : '#D1D5DB'}`,
                  cursor: 'pointer',
                  transition: 'all 0.1s ease',
                }}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Anomalies List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filtered.map((item) => {
            const style = getSeverityStyle(item.severity);
            return (
              <div
                key={item.anomalyId}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '18px',
                  position: 'relative',
                  boxShadow: 'var(--card-shadow)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        backgroundColor: style.bg,
                        color: style.text,
                        border: `1px solid ${style.border}`,
                        fontSize: '10.5px',
                        fontWeight: 800,
                        padding: '2px 7px',
                        borderRadius: '4px',
                      }}
                    >
                      {item.severity}
                    </span>
                    <h3 style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                      {item.title}
                    </h3>
                  </div>
                  <span className="mono" style={{ fontSize: '11.5px', color: 'var(--text-sub)' }}>
                    Corridor: <strong style={{ color: 'var(--text-main)' }}>{item.routeCode}</strong>
                  </span>
                </div>

                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '12px' }}>
                  {item.description}
                </p>

                <div
                  style={{
                    backgroundColor: '#F9FAFB',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    padding: '9px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '11.5px',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--text-sub)' }}>Observed Metric: </span>
                    <strong style={{ color: 'var(--text-main)' }}>{item.observedMetric}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-sub)' }}>Value: </span>
                    <strong className="mono" style={{ color: style.text, fontWeight: 700 }}>
                      {typeof item.observedValue === 'number' && item.observedValue > 100
                        ? `₹${item.observedValue.toLocaleString()}`
                        : item.observedValue}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-sub)' }}>Standard Threshold: </span>
                    <strong className="mono" style={{ color: 'var(--text-main)' }}>
                      {typeof item.expectedThreshold === 'number' && item.expectedThreshold > 100
                        ? `₹${item.expectedThreshold.toLocaleString()}`
                        : item.expectedThreshold}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-sub)' }}>Detected: </span>
                    <span className="mono" style={{ color: 'var(--text-main)' }}>
                      {new Date(item.detectedAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
