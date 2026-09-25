import React, { useEffect, useState } from 'react';
import { Topbar } from '../components/Topbar';
import { Badge } from '../components/Badge';
import { useSystemMode } from '../context/ModeContext';
import { api } from '../services/api';
import { IMarketAnomalyItem } from '../types';
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

export const AlertsPage: React.FC = () => {
  const { mode, toggleMode } = useSystemMode();
  const [anomalies, setAnomalies] = useState<IMarketAnomalyItem[]>([]);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);

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

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return { bg: 'rgba(239, 68, 68, 0.15)', border: '#EF4444', text: '#FCA5A5' };
      case 'HIGH':
        return { bg: 'rgba(245, 158, 11, 0.15)', border: '#F59E0B', text: '#FCD34D' };
      case 'MEDIUM':
        return { bg: 'rgba(59, 130, 246, 0.15)', border: '#3B82F6', text: '#93C5FD' };
      default:
        return { bg: 'rgba(100, 116, 139, 0.15)', border: '#64748B', text: '#CBD5E1' };
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
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: '#FCA5A5', fontWeight: 800 }}>CRITICAL SEVERITY</div>
              <div style={{ fontSize: '22px', fontWeight: 900, color: '#FFFFFF', marginTop: '2px' }}>
                {anomalies.filter((a) => a.severity === 'CRITICAL').length}
              </div>
            </div>
            <ShieldAlert size={24} color="#EF4444" />
          </div>

          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: '#FCD34D', fontWeight: 800 }}>HIGH SEVERITY</div>
              <div style={{ fontSize: '22px', fontWeight: 900, color: '#FFFFFF', marginTop: '2px' }}>
                {anomalies.filter((a) => a.severity === 'HIGH').length}
              </div>
            </div>
            <AlertTriangle size={24} color="#F59E0B" />
          </div>

          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: '#93C5FD', fontWeight: 800 }}>MEDIUM SEVERITY</div>
              <div style={{ fontSize: '22px', fontWeight: 900, color: '#FFFFFF', marginTop: '2px' }}>
                {anomalies.filter((a) => a.severity === 'MEDIUM').length}
              </div>
            </div>
            <TrendingUp size={24} color="#3B82F6" />
          </div>

          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: '#6EE7B7', fontWeight: 800 }}>TOTAL DETECTIONS</div>
              <div style={{ fontSize: '22px', fontWeight: 900, color: '#FFFFFF', marginTop: '2px' }}>
                {anomalies.length}
              </div>
            </div>
            <Bell size={24} color="#10B981" />
          </div>
        </div>

        {/* Filter Bar */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '12px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Filter size={16} color="var(--text-muted)" />
            <span style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: 600 }}>Filter Severity:</span>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor: severityFilter === sev ? 'var(--primary)' : 'transparent',
                  color: severityFilter === sev ? '#FFFFFF' : 'var(--text-muted)',
                  border: `1px solid ${severityFilter === sev ? 'var(--primary)' : 'var(--border)'}`,
                }}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Anomalies List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filtered.map((item) => {
            const style = getSeverityStyle(item.severity);
            return (
              <div
                key={item.anomalyId}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: `1px solid ${style.border}`,
                  borderRadius: '12px',
                  padding: '20px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        backgroundColor: style.bg,
                        color: style.text,
                        border: `1px solid ${style.border}`,
                        fontSize: '11px',
                        fontWeight: 900,
                        padding: '2px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      {item.severity}
                    </span>
                    <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                      {item.title}
                    </h3>
                  </div>
                  <span className="mono" style={{ fontSize: '11.5px', color: 'var(--text-sub)' }}>
                    Corridor: <strong style={{ color: '#FFFFFF' }}>{item.routeCode}</strong>
                  </span>
                </div>

                <p style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.6', marginBottom: '12px' }}>
                  {item.description}
                </p>

                <div
                  style={{
                    backgroundColor: '#080D1D',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Observed Metric: </span>
                    <strong style={{ color: '#FFFFFF' }}>{item.observedMetric}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Value: </span>
                    <strong className="mono" style={{ color: style.text }}>
                      {typeof item.observedValue === 'number' && item.observedValue > 100
                        ? `₹${item.observedValue.toLocaleString()}`
                        : item.observedValue}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Standard Threshold: </span>
                    <strong className="mono" style={{ color: 'var(--text-sub)' }}>
                      {typeof item.expectedThreshold === 'number' && item.expectedThreshold > 100
                        ? `₹${item.expectedThreshold.toLocaleString()}`
                        : item.expectedThreshold}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Detected: </span>
                    <span className="mono" style={{ color: '#CBD5E1' }}>
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
