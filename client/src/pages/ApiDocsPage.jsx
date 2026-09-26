import React, { useState } from 'react';
import { Topbar } from '../components/Topbar';
import { useSystemMode } from '../context/ModeContext';
import {
  Code2,
  Copy,
  Check,
} from 'lucide-react';

const ENDPOINTS = [
  {
    method: 'GET',
    path: '/api/index/national',
    summary: 'National APIx Chained Price Index',
    description: 'Returns the high-frequency daily Short-Jevons chained airfare index across 5 advance horizons.',
    params: [
      { name: 'mode', type: 'string', required: false, description: 'LIVE or DEMO (default: DEMO)' },
      { name: 'timeframe', type: 'string', required: false, description: '7D, 30D, 90D, or 1Y (default: 30D)' },
    ],
    sampleResponse: JSON.stringify(
      {
        success: true,
        data: {
          currentNationalAPIx: 104.28,
          dailyChangePct: 0.35,
          weeklyChangePct: 1.12,
          monthlyChangePct: 3.42,
          asOfDate: '2026-09-19',
          methodology: 'Short-Jevons chained (Base 100.00)',
          timeSeries: [
            { date: '2026-09-18', indexValue: 103.92, shortJevonsFactor: 1.0035 },
            { date: '2026-09-19', indexValue: 104.28, shortJevonsFactor: 1.0034 },
          ],
        },
      },
      null,
      2
    ),
  },
  {
    method: 'GET',
    path: '/api/dgca/weights',
    summary: 'Dynamic DGCA Traffic-Derived Weights',
    description: 'Returns normalized basket weights dynamically calculated from the official 786 city-pair matrix (136.03M domestic pax).',
    params: [
      { name: 'topN', type: 'number', required: false, description: 'Number of top city-pairs (10, 20, 50, 100, 786). Default: 20' },
    ],
    sampleResponse: JSON.stringify(
      {
        success: true,
        data: {
          totalScheduledPax: 136028655,
          basketSize: 20,
          routes: [
            {
              rank: 1,
              routeCode: 'DEL-BOM',
              totalTwoWayTraffic: 5615919,
              weightInBasket: 0.1169,
              networkSharePct: 4.13,
              weightLabel: 'DGCA TRAFFIC-DERIVED WEIGHT',
            },
          ],
        },
      },
      null,
      2
    ),
  },
  {
    method: 'GET',
    path: '/api/cpi/compare',
    summary: 'MoSPI CPI vs APIx Comparative Analysis',
    description: 'Provides high-frequency daily APIx alongside official monthly MoSPI CPI Airfare (Item Code 07.3.3.1.2.01) with spread tracking.',
    sampleResponse: JSON.stringify(
      {
        success: true,
        data: [
          {
            month: '2026-08',
            monthName: 'August 2026',
            officialMoSPIIndex: 135.49,
            officialYoYInflationPct: 20.85,
            projectDerivedAPIx: 134.82,
            spread: -0.67,
          },
        ],
      },
      null,
      2
    ),
  },
  {
    method: 'GET',
    path: '/api/sources/health',
    summary: 'Scraper Adapter Status & Health',
    description: 'Reports live health status, average latency, and ethical scraping controls for all 11 sources (5 Airlines, 6 OTAs).',
    params: [
      { name: 'mode', type: 'string', required: false, description: 'LIVE or DEMO' },
    ],
    sampleResponse: JSON.stringify(
      {
        success: true,
        data: [
          {
            sourceName: 'IndiGo',
            sourceType: 'AIRLINE',
            currentStatus: 'LIVE',
            avgLatencyMs: 840,
            quotesCollected24h: 3840,
            ethicalControls: {
              rateLimiting: '1.5 req/s token bucket',
              robotsTxtCompliant: true,
              stealthEvasionUsed: false,
            },
          },
        ],
      },
      null,
      2
    ),
  },
  {
    method: 'GET',
    path: '/api/backtest',
    summary: 'Statutory Backtest Status',
    description: 'Returns current empirical accumulation status. Prominently reports BACKTEST DATA PENDING to prevent data fabrication.',
    sampleResponse: JSON.stringify(
      {
        success: true,
        data: {
          status: 'BACKTEST DATA PENDING',
          reason: 'Minimum 6 months continuous live scraping required for valid statistical correlation',
          criteriaRequired: {
            pearsonCorrelation: 'r >= 0.85',
            rSquared: 'R^2 >= 0.72',
            mape: 'MAPE <= 4.5%',
          },
        },
      },
      null,
      2
    ),
  },
];

export const ApiDocsPage = () => {
  const { mode, toggleMode } = useSystemMode();
  const [copiedPath, setCopiedPath] = useState(null);

  const getOrigin = () => {
    return typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000';
  };

  const copyCurl = (path) => {
    const curl = `curl -X GET "${getOrigin()}${path}" -H "Accept: application/json"`;
    navigator.clipboard.writeText(curl);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  return (
    <div style={{ paddingBottom: '50px' }}>
      <Topbar
        title="Public REST API Specification & Integration"
        subtitle="Standardized JSON Endpoints for MoSPI, RBI & Institutional Macroeconomic Models"
        mode={mode}
        onModeToggle={toggleMode}
        badge="PROJECT_DERIVED"
      />

      <div style={{ padding: '24px 28px', maxWidth: '1100px' }}>
        {/* Header Intro */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <Code2 size={20} color="#0F172A" />
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Institutional Integration API
            </h2>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>
            All Aerostat indices, DGCA passenger matrix weights, advance booking yield curves, and cryptographic quote audit trails are fully exposed via standard RESTful JSON endpoints.
            Built for direct integration into monetary policy models at the Reserve Bank of India (RBI) and high-frequency price nowcasting at MoSPI.
          </p>
          <div style={{ marginTop: '14px', fontSize: '12px', color: 'var(--text-sub)' }}>
            Base URL:{' '}
            <code style={{ color: '#0F172A', backgroundColor: '#F3F4F6', padding: '3px 8px', borderRadius: '4px', border: '1px solid #E5E7EB', fontFamily: 'var(--font-mono)' }}>
              {getOrigin()}/api
            </code>
          </div>
        </div>

        {/* Endpoints List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {ENDPOINTS.map((ep) => (
            <div
              key={ep.path}
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: 'var(--card-shadow)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      backgroundColor: '#EFF6FF',
                      color: '#1E40AF',
                      border: '1px solid #BFDBFE',
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {ep.method}
                  </span>
                  <span className="mono" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
                    {ep.path}
                  </span>
                </div>

                <button
                  onClick={() => copyCurl(ep.path)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #D1D5DB',
                    padding: '5px 12px',
                    borderRadius: '6px',
                    color: copiedPath === ep.path ? '#15803D' : 'var(--text-sub)',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {copiedPath === ep.path ? <Check size={13} color="#15803D" /> : <Copy size={13} />}
                  <span>{copiedPath === ep.path ? 'cURL Copied!' : 'Copy cURL'}</span>
                </button>
              </div>

              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                {ep.description}
              </div>

              {/* Params if any */}
              {ep.params && ep.params.length > 0 && (
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-sub)', marginBottom: '6px', textTransform: 'uppercase' }}>
                    QUERY PARAMETERS:
                  </div>
                  <div style={{ backgroundColor: '#F9FAFB', border: '1px solid var(--border)', borderRadius: '6px', padding: '8px 12px' }}>
                    {ep.params.map((p) => (
                      <div key={p.name} style={{ fontSize: '12px', display: 'flex', gap: '8px', margin: '4px 0', alignItems: 'baseline' }}>
                        <strong className="mono" style={{ color: '#0F172A' }}>{p.name}</strong>
                        <span style={{ color: 'var(--text-sub)', fontSize: '11px' }}>({p.type})</span>
                        <span style={{ color: 'var(--text-muted)' }}>&bull; {p.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sample Response */}
              <div>
                <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-sub)', marginBottom: '6px', textTransform: 'uppercase' }}>
                  EXAMPLE RESPONSE (JSON):
                </div>
                <pre
                  className="mono"
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    padding: '12px 16px',
                    fontSize: '11.5px',
                    color: '#0F172A',
                    overflowX: 'auto',
                    maxHeight: '220px',
                    lineHeight: '1.45',
                  }}
                >
                  {ep.sampleResponse}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
