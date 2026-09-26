import React from 'react';
import { Topbar } from '../components/Topbar';
import { Badge } from '../components/Badge';
import { useSystemMode } from '../context/ModeContext';
import {
  BookOpen,
  Calculator,
  Database,
  Layers,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
} from 'lucide-react';

export const MethodologyPage = () => {
  const { mode, toggleMode } = useSystemMode();

  return (
    <div style={{ paddingBottom: '50px' }}>
      <Topbar
        title="Index Methodology & Mathematical Specifications"
        subtitle="Short-Jevons Chained Price Relatives &bull; DGCA Scheduled Traffic Weighting"
        mode={mode}
        onModeToggle={toggleMode}
        badge="PROJECT_DERIVED"
      />

      <div style={{ padding: '24px 28px', maxWidth: '1100px' }}>
        {/* Executive Abstract */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <BookOpen size={20} color="#0F172A" />
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Methodological Framework Summary
            </h2>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.7', margin: 0 }}>
            Aerostat APIx is designed for high-frequency augmentation of the official Consumer Price Index (CPI) compiled by the National Statistical Office (NSO), Ministry of Statistics &amp; Programme Implementation (MoSPI).
            Because airfares are subject to dynamic revenue management, algorithmic pricing, and extreme intra-month volatility, standard point-in-time sampling yields high variance.
            Aerostat resolves this using an unweighted geometric mean of price relatives at the elementary level (<strong>Short-Jevons Index</strong>), structured across <strong>5 standardized advance booking horizons</strong>, chained daily [I(t) = I(t-1) &times; J(t)], and weighted by empirical Directorate General of Civil Aviation (DGCA) scheduled passenger traffic.
          </p>
        </div>

        {/* Core Mathematical Formulations */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Calculator size={20} color="#15803D" />
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Mathematical Formulations
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* 1. Elementary Level */}
            <div style={{ backgroundColor: '#F9FAFB', border: '1px solid var(--border)', borderRadius: '6px', padding: '16px' }}>
              <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '13.5px', marginBottom: '6px' }}>
                1. Elementary Level: Short-Jevons Geometric Relatives [J(r,h,t)]
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '10px' }}>
                For corridor r, horizon h, on day t, the daily price relative J(r,h,t) is calculated as the geometric mean of price relatives for matched flight quotes between consecutive days:
              </p>
              <div
                className="mono"
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  color: '#0F172A',
                  border: '1px solid #E5E7EB',
                  overflowX: 'auto',
                }}
              >
                {'J_{r,h,t} = (∏ p_{i,r,h,t} / p_{i,r,h,t-1})^(1/n) = exp( 1/n * ∑ ln(p_{i,r,h,t} / p_{i,r,h,t-1}) )'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-sub)', marginTop: '8px' }}>
                *Satisfies the Time Reversal Test [J(t,t-1) = 1 / J(t-1,t)] and Circularity Test, eliminating the upward substitution bias inherent in Dutot or Carli arithmetic formulations.
              </div>
            </div>

            {/* 2. Advance Horizon Synthesis */}
            <div style={{ backgroundColor: '#F9FAFB', border: '1px solid var(--border)', borderRadius: '6px', padding: '16px' }}>
              <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '13.5px', marginBottom: '6px' }}>
                2. Advance Horizon Synthesis [J(r,t)]
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '10px' }}>
                The 5 advance horizons (T+1, T+7, T+15, T+30, T+45) are combined using fixed empirical booking lead-time weights:
              </p>
              <div
                className="mono"
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  color: '#0F172A',
                  border: '1px solid #E5E7EB',
                  overflowX: 'auto',
                }}
              >
                {'J_{r,t} = ∑ α_h * J_{r,h,t}   where ∑ α_h = 1.0'}
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '10px', fontSize: '11px', color: 'var(--text-sub)', flexWrap: 'wrap' }}>
                <span>&alpha;(T+1) = 0.10</span>
                <span>&alpha;(T+7) = 0.20</span>
                <span>&alpha;(T+15) = 0.25</span>
                <span>&alpha;(T+30) = 0.30</span>
                <span>&alpha;(T+45) = 0.15</span>
              </div>
            </div>

            {/* 3. National DGCA Passenger Traffic Weighting */}
            <div style={{ backgroundColor: '#F9FAFB', border: '1px solid var(--border)', borderRadius: '6px', padding: '16px' }}>
              <div style={{ fontWeight: 800, color: '#15803D', fontSize: '13.5px', marginBottom: '6px' }}>
                3. National Basket Aggregation with DGCA Weights [J(National,t)]
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '10px' }}>
                Corridor price relatives are weighted by their share of two-way annual passenger traffic from the statutory DGCA passenger matrix:
              </p>
              <div
                className="mono"
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  color: '#15803D',
                  border: '1px solid #E5E7EB',
                  overflowX: 'auto',
                }}
              >
                {'w_r = Pax_r / ∑ Pax_j  ===>  J_{National,t} = ∑ w_r * J_{r,t}'}
              </div>
            </div>

            {/* 4. Chaining */}
            <div style={{ backgroundColor: '#F9FAFB', border: '1px solid var(--border)', borderRadius: '6px', padding: '16px' }}>
              <div style={{ fontWeight: 800, color: '#B45309', fontSize: '13.5px', marginBottom: '6px' }}>
                4. Daily Cumulative Chaining [I(t)]
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '10px' }}>
                The cumulative index is initialized at 100.00 on Day 0 and chained forward daily:
              </p>
              <div
                className="mono"
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  color: '#B45309',
                  border: '1px solid #E5E7EB',
                  overflowX: 'auto',
                }}
              >
                {'I_0 = 100.00,   I_t = I_{t-1} * J_{National,t}'}
              </div>
            </div>
          </div>
        </div>

        {/* Data Quality & Cleaning Pipeline */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <ShieldCheck size={20} color="#0F172A" />
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Data Quality & Automated Cleansing Standards
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ backgroundColor: '#F9FAFB', border: '1px solid var(--border)', padding: '14px', borderRadius: '6px' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>Outlier Rejection (IQR &amp; Hampel)</div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
                Fares falling outside 3 standard deviations (3&sigma;) or beyond [Q1 - 1.5&times;IQR, Q3 + 1.5&times;IQR] within a corridor-horizon window are flagged as anomalies and excluded from elementary relative calculation.
              </p>
            </div>
            <div style={{ backgroundColor: '#F9FAFB', border: '1px solid var(--border)', padding: '14px', borderRadius: '6px' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>Seat Class Harmonization</div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
                Only Standard Economy non-stop fares are sampled. Premium Economy, Business Class, and multi-stop itineraries exceeding 4 hours layover are filtered to ensure item homogeneity.
              </p>
            </div>
            <div style={{ backgroundColor: '#F9FAFB', border: '1px solid var(--border)', padding: '14px', borderRadius: '6px' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>All-Inclusive Price Definition</div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
                In compliance with MoSPI CPI concepts, the target price is the total consumer checkout price including base fare, fuel surcharges, and statutory airport fees (UDF/PSF/GST).
              </p>
            </div>
            <div style={{ backgroundColor: '#F9FAFB', border: '1px solid var(--border)', padding: '14px', borderRadius: '6px' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>Cryptographic SHA-256 Immutability</div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
                Every raw HTML / JSON response is hashed with SHA-256 upon arrival, creating an unalterable forensic audit trail that guarantees data provenance.
              </p>
            </div>
          </div>
        </div>

        {/* Known Limitations & Statutory Disclaimers */}
        <div
          style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <AlertTriangle size={18} color="#B45309" />
            <h4 style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Methodological Limitations & Statutory Disclaimers
            </h4>
          </div>
          <ul style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.6', paddingLeft: '20px' }}>
            <li>
              <strong>Proxy Weights:</strong> DGCA traffic weights reflect passenger volume rather than monetary expenditure, serving as an operational proxy until official MoSPI Household Consumer Expenditure Survey (HCES) item weights for air travel are published.
            </li>
            <li>
              <strong>Ancillary Charges:</strong> Ancillary fees (checked baggage over 15kg, seat selection, meals) are excluded unless bundled in the base Economy ticket.
            </li>
            <li>
              <strong>Non-Endorsement:</strong> Aerostat is an independent technological research prototype developed for Smart India Hackathon 2026 and does not represent an official index released by the Government of India or MoSPI.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
