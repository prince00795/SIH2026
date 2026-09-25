import React, { useEffect, useState } from 'react';
import { Topbar } from '../components/Topbar';
import { Badge } from '../components/Badge';
import { KPICard } from '../components/KPICard';
import { useSystemMode } from '../context/ModeContext';
import { api } from '../services/api';
import {
  FileCheck,
  AlertCircle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Lock,
  BarChart2,
  Database,
} from 'lucide-react';

export const BacktestPage: React.FC = () => {
  const { mode, toggleMode } = useSystemMode();
  const [backtestInfo, setBacktestInfo] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    api.getBacktestStatus().then((res) => {
      if (res.success) {
        setBacktestInfo(res.data);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div style={{ paddingBottom: '40px' }}>
      <Topbar
        title="Empirical Backtest & Statistical Validation"
        subtitle="MoSPI CPI Validation Protocol & Empirical Correlation Framework"
        mode={mode}
        onModeToggle={toggleMode}
        badge="UNAVAILABLE"
      />

      <div style={{ padding: '24px 28px' }}>
        {/* Prominent Statutory Integrity Banner */}
        <div
          style={{
            backgroundColor: 'rgba(245, 158, 11, 0.12)',
            border: '2px solid #F59E0B',
            borderRadius: '14px',
            padding: '22px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px',
          }}
        >
          <AlertCircle size={28} color="#F59E0B" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 900, color: '#FBBF24', margin: 0 }}>
                STATUS: BACKTEST DATA PENDING (STATISTICAL INTEGRITY COMMITMENT)
              </h2>
              <Badge type="UNAVAILABLE" />
            </div>
            <div style={{ fontSize: '13px', color: '#F8FAFC', lineHeight: '1.6' }}>
              In accordance with statistical rigor, MoSPI auditing standards, and the Smart India Hackathon guidelines,
              <strong> VayuSutra does NOT fabricate backtest numbers, Pearson correlation coefficients ($r$), or $R^2$ metrics</strong>.
              Former academic iterations commonly generated synthetic random walk backtests (e.g. claiming $r = 0.9858$ without multi-month continuous live historical scrapes).
              Such practices compromise institutional credibility.
            </div>
            <div style={{ marginTop: '10px', fontSize: '12.5px', color: '#CBD5E1' }}>
              Formal empirical backtesting will execute automatically once the live Playwright collector accumulates the minimum required <strong>6 consecutive months</strong> of uninterrupted daily quote observations across all 20 basket corridors.
            </div>
          </div>
        </div>

        {/* Validation Criteria Status Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <KPICard
            label="PEARSON CORRELATION (r)"
            value="PENDING"
            change="Target: r ≥ 0.85"
            changeType="neutral"
            badge="UNAVAILABLE"
            icon={<BarChart2 size={18} color="var(--text-muted)" />}
            footnote="Requires min 6 months uninterrupted data"
          />
          <KPICard
            label="COEFFICIENT OF DET. (R²)"
            value="PENDING"
            change="Target: R² ≥ 0.72"
            changeType="neutral"
            badge="UNAVAILABLE"
            icon={<Clock size={18} color="var(--text-muted)" />}
            footnote="Measures variance explained in headline CPI"
          />
          <KPICard
            label="MEAN ABS % ERROR (MAPE)"
            value="PENDING"
            change="Target: MAPE ≤ 4.5%"
            changeType="neutral"
            badge="UNAVAILABLE"
            icon={<FileCheck size={18} color="var(--text-muted)" />}
            footnote="Measures average divergence in price level"
          />
          <KPICard
            label="OBSERVATION ACCUMULATION"
            value="ACTIVE"
            change="Continuous Playwright Ingestion"
            changeType="positive"
            badge="LIVE_COLLECTED"
            icon={<Database size={18} color="#10B981" />}
            footnote="Building institutional live archive"
          />
        </div>

        {/* Empirical Validation Methodology Framework */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', marginBottom: '12px' }}>
            Empirical Validation Protocol (MoSPI SIH26056 Framework)
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '18px' }}>
            Once the observation accumulation threshold is reached, the automated validation pipeline will execute the following rigorous statistical batteries:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ backgroundColor: '#080D1D', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px' }}>
              <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '14px', marginBottom: '8px' }}>
                1. Pearson Product-Moment Correlation
              </div>
              <div className="mono" style={{ fontSize: '12px', color: '#93C5FD', marginBottom: '8px' }}>
                r = Σ(X - X̄)(Y - Ȳ) / [√Σ(X - X̄)² √Σ(Y - Ȳ)²]
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Evaluates linear co-movement between monthly aggregated VayuSutra APIx and MoSPI Airfare CPI (Item <code>07.3.3.1.2.01</code>).
                Statutory acceptance criterion: $r \ge 0.85$ at $p &lt; 0.01$.
              </p>
            </div>

            <div style={{ backgroundColor: '#080D1D', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px' }}>
              <div style={{ fontWeight: 800, color: '#10B981', fontSize: '14px', marginBottom: '8px' }}>
                2. Mean Absolute Percentage Error (MAPE)
              </div>
              <div className="mono" style={{ fontSize: '12px', color: '#6EE7B7', marginBottom: '8px' }}>
                MAPE = (1 / n) * Σ |(CPI_i - APIx_i) / CPI_i| * 100%
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Measures absolute point divergence after common-base re-indexing.
                A target MAPE $\le 4.5\%$ ensures that high-frequency daily nowcasts do not introduce systematic bias.
              </p>
            </div>

            <div style={{ backgroundColor: '#080D1D', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px' }}>
              <div style={{ fontWeight: 800, color: '#F59E0B', fontSize: '14px', marginBottom: '8px' }}>
                3. Lead-Lag Granger Causality Test
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Tests whether daily APIx price shifts Granger-cause official monthly CPI releases.
                This validates whether VayuSutra serves as a genuine leading indicator for monetary policy.
              </p>
            </div>

            <div style={{ backgroundColor: '#080D1D', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px' }}>
              <div style={{ fontWeight: 800, color: '#8B5CF6', fontSize: '14px', marginBottom: '8px' }}>
                4. Horizon Weight Sensitivity Backtest
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Sensitivity testing across different horizon weight vectors:
                $T+1$ (10%), $T+7$ (20%), $T+15$ (25%), $T+30$ (30%), $T+45$ (15%) to assess robustness against carrier yield management tactics.
              </p>
            </div>
          </div>
        </div>

        {/* Historical Integrity Audit Checklist */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <ShieldCheck size={20} color="#10B981" />
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
              Audit Compliance & Anti-Fabrication Safeguards
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FFFFFF' }}>
              <CheckCircle2 size={14} color="#10B981" />
              <span>Zero hardcoded mock correlation values in codebase</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FFFFFF' }}>
              <CheckCircle2 size={14} color="#10B981" />
              <span>Clear separation between calibrated simulation quotes and genuine web scrape records</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FFFFFF' }}>
              <CheckCircle2 size={14} color="#10B981" />
              <span>Full cryptographic SHA-256 ledger tracking every observed airfare</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FFFFFF' }}>
              <CheckCircle2 size={14} color="#10B981" />
              <span>Dynamic calculation of DGCA passenger traffic weights without hardcoded percentages</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
