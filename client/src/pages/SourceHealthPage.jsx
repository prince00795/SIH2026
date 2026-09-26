import React, { useEffect, useState } from 'react';
import { Topbar } from '../components/Topbar';
import { Badge } from '../components/Badge';
import { useSystemMode } from '../context/ModeContext';
import { api } from '../services/api';
import {
  Activity,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  RefreshCw,
  ExternalLink,
  Lock,
} from 'lucide-react';

export const SourceHealthPage = () => {
  const { mode, toggleMode } = useSystemMode();
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(null);

  const fetchHealth = () => {
    setLoading(true);
    api.getSourceHealth(mode).then((res) => {
      if (res.success) {
        const list = res.data?.sourceHealth || (Array.isArray(res.data) ? res.data : []);
        setSources(list);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchHealth();
  }, [mode]);

  const handleTriggerScrape = async (sourceName) => {
    setTriggering(sourceName);
    try {
      const res = await api.triggerScrapeSource(sourceName, 'DEL-BOM', 'T+7');
      alert(`Scraper Run Result for ${sourceName}:\n${res.meta?.message || res.data?.status || 'Run started'}\nRun ID: ${res.data?.scrapeRunId || 'N/A'}`);
      fetchHealth();
    } catch (err) {
      alert(`Scrape invocation error: ${err.message}`);
    } finally {
      setTriggering(null);
    }
  };

  const airlineSources = sources.filter((s) => s.sourceType === 'AIRLINE');
  const otaSources = sources.filter((s) => s.sourceType === 'OTA');

  return (
    <div style={{ paddingBottom: '40px' }}>
      <Topbar
        title="Airline & OTA Source Health Monitor"
        subtitle="11 Automated Playwright Browser Adapters &bull; Ethical Rate Limits & Robots.txt Compliance"
        mode={mode}
        onModeToggle={toggleMode}
        badge={mode === 'DEMO' ? 'DEMO' : 'LIVE_COLLECTED'}
      />

      <div style={{ padding: '24px 28px' }}>
        {/* Ethical Scraping Principles Callout */}
        <div
          style={{
            backgroundColor: '#F0FDF4',
            border: '1px solid #BBF7D0',
            borderRadius: '8px',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
          }}
        >
          <ShieldCheck size={22} color="#15803D" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '12.5px', lineHeight: '1.6' }}>
            <div style={{ fontWeight: 800, color: '#166534', fontSize: '13px', marginBottom: '3px' }}>
              STRICT STATUTORY & ETHICAL SCRAPING COMPLIANCE
            </div>
            <div style={{ color: 'var(--text-muted)' }}>
              Aerostat adheres strictly to MoSPI and public sector ethical data acquisition guidelines.
              All automated collectors enforce a <strong>1.5 requests/sec token bucket rate limit</strong>, respect portal <code>robots.txt</code> directives, identify with clear transparency headers, and <strong>do not engage in illegal CAPTCHA evasion, credential stuffing, or DDoS behavior</strong>.
              If a portal challenges an adapter, its status is transparently reported as <code>BLOCKED</code> or <code>UNAVAILABLE</code> rather than fabricating quotes.
            </div>
          </div>
        </div>

        {/* Action Header */}
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
              Carrier Direct Portals (5 Airlines)
            </h3>
            <div style={{ fontSize: '12px', color: 'var(--text-sub)' }}>
              Direct scheduled airline inventory interfaces
            </div>
          </div>
          <button
            onClick={fetchHealth}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: '6px',
              backgroundColor: '#FFFFFF',
              color: 'var(--text-muted)',
              border: '1px solid #D1D5DB',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            <RefreshCw size={12} />
            <span>Refresh Health</span>
          </button>
        </div>

        {/* Airlines Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          {airlineSources.map((source) => (
            <SourceCard
              key={source.sourceName}
              source={source}
              mode={mode}
              isTriggering={triggering === source.sourceName}
              onTrigger={() => handleTriggerScrape(source.sourceName)}
            />
          ))}
        </div>

        {/* OTAs Section */}
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)' }}>
            Online Travel Aggregators (6 OTAs)
          </h3>
          <div style={{ fontSize: '12px', color: 'var(--text-sub)' }}>
            Consolidated market price aggregation platforms
          </div>
        </div>

        {/* OTAs Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '16px',
          }}
        >
          {otaSources.map((source) => (
            <SourceCard
              key={source.sourceName}
              source={source}
              mode={mode}
              isTriggering={triggering === source.sourceName}
              onTrigger={() => handleTriggerScrape(source.sourceName)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const SourceCard = ({ source, mode, isTriggering, onTrigger }) => {
  const isHealthy = source.currentStatus === 'LIVE' || (mode === 'DEMO' && source.currentStatus === 'DEMO');

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: 'var(--card-shadow)',
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)' }}>
                {source.sourceName}
              </span>
              <span
                style={{
                  fontSize: '10px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: '#F3F4F6',
                  color: 'var(--text-sub)',
                  border: '1px solid var(--border)',
                  fontWeight: 600,
                }}
              >
                {source.sourceType}
              </span>
            </div>
            <a
              href={source.portalUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: '11px',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                marginTop: '3px',
              }}
            >
              <span>{source.portalUrl}</span>
              <ExternalLink size={10} />
            </a>
          </div>

          <Badge type={mode === 'DEMO' ? 'DEMO' : (source.currentStatus === 'LIVE' ? 'LIVE_COLLECTED' : 'UNAVAILABLE')} />
        </div>

        {/* Status Indicators */}
        <div
          style={{
            backgroundColor: '#F9FAFB',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            padding: '10px 12px',
            marginBottom: '14px',
            fontSize: '11.5px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
          }}
        >
          <div>
            <span style={{ color: 'var(--text-sub)' }}>Status: </span>
            <strong style={{ color: isHealthy ? '#15803D' : '#B91C1C' }}>
              {source.currentStatus}
            </strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-sub)' }}>Avg Latency: </span>
            <strong className="mono">{source.avgLatencyMs > 0 ? `${source.avgLatencyMs}ms` : '--'}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-sub)' }}>24h Quotes: </span>
            <strong className="mono">{source.quotesCollected24h.toLocaleString()}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-sub)' }}>Success Rate: </span>
            <strong className="mono">
              {source.successCount24h + source.failureCount24h > 0
                ? `${((source.successCount24h / (source.successCount24h + source.failureCount24h)) * 100).toFixed(0)}%`
                : '100%'}
            </strong>
          </div>
        </div>

        {/* Ethical Controls Checklist */}
        <div style={{ fontSize: '11px', color: 'var(--text-sub)', marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={12} color="#15803D" />
            <span>Rate limit: {source.ethicalControls.rateLimiting}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={12} color="#15803D" />
            <span>robots.txt: Respected</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Lock size={12} color="var(--text-dim)" />
            <span>Stealth evasion: Disabled (Statutory ethical mode)</span>
          </div>
        </div>
      </div>

      {/* Trigger Scrape Action */}
      <button
        onClick={onTrigger}
        disabled={isTriggering}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          width: '100%',
          padding: '8px',
          borderRadius: '6px',
          backgroundColor: isTriggering ? '#E5E7EB' : '#FFFFFF',
          border: '1px solid #D1D5DB',
          color: isTriggering ? 'var(--text-dim)' : 'var(--text-main)',
          fontSize: '12px',
          fontWeight: 600,
          cursor: isTriggering ? 'not-allowed' : 'pointer',
          transition: 'all 0.1s ease',
        }}
      >
        <Play size={12} />
        <span>{isTriggering ? 'Invoking Adapter...' : 'Run Scraper Probe (DEL-BOM T+7)'}</span>
      </button>
    </div>
  );
};
