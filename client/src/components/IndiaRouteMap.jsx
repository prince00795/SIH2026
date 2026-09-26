import React from 'react';

const AIRPORTS = {
  DEL: { iata: 'DEL', name: 'Delhi', x: 230, y: 130 },
  BOM: { iata: 'BOM', name: 'Mumbai', x: 180, y: 260 },
  BLR: { iata: 'BLR', name: 'Bengaluru', x: 220, y: 360 },
  CCU: { iata: 'CCU', name: 'Kolkata', x: 370, y: 190 },
  HYD: { iata: 'HYD', name: 'Hyderabad', x: 240, y: 270 },
  MAA: { iata: 'MAA', name: 'Chennai', x: 260, y: 370 },
  GOI: { iata: 'GOI', name: 'Goa', x: 185, y: 320 },
  PNQ: { iata: 'PNQ', name: 'Pune', x: 195, y: 275 },
  SXR: { iata: 'SXR', name: 'Srinagar', x: 200, y: 60 },
  AMD: { iata: 'AMD', name: 'Ahmedabad', x: 170, y: 200 },
  PAT: { iata: 'PAT', name: 'Patna', x: 330, y: 160 },
  GAU: { iata: 'GAU', name: 'Guwahati', x: 420, y: 150 },
};

const TRUNK_ROUTES = [
  { from: 'DEL', to: 'BOM', weight: '11.69%', code: 'DEL-BOM' },
  { from: 'DEL', to: 'BLR', weight: '9.30%', code: 'BLR-DEL' },
  { from: 'BOM', to: 'BLR', weight: '7.62%', code: 'BOM-BLR' },
  { from: 'DEL', to: 'SXR', weight: '5.83%', code: 'DEL-SXR' },
  { from: 'DEL', to: 'CCU', weight: '5.63%', code: 'DEL-CCU' },
  { from: 'DEL', to: 'HYD', weight: '5.41%', code: 'DEL-HYD' },
  { from: 'DEL', to: 'PNQ', weight: '5.27%', code: 'DEL-PNQ' },
  { from: 'BOM', to: 'GOI', weight: '4.72%', code: 'BOM-GOI' },
  { from: 'BOM', to: 'MAA', weight: '4.38%', code: 'BOM-MAA' },
  { from: 'AMD', to: 'DEL', weight: '4.35%', code: 'AMD-DEL' },
  { from: 'MAA', to: 'DEL', weight: '4.26%', code: 'DEL-MAA' },
  { from: 'GOI', to: 'DEL', weight: '4.08%', code: 'DEL-GOI' },
  { from: 'AMD', to: 'BOM', weight: '3.82%', code: 'AMD-BOM' },
  { from: 'BLR', to: 'HYD', weight: '3.73%', code: 'BLR-HYD' },
  { from: 'BLR', to: 'CCU', weight: '3.63%', code: 'BLR-CCU' },
  { from: 'BOM', to: 'HYD', weight: '3.51%', code: 'BOM-HYD' },
  { from: 'BOM', to: 'CCU', weight: '3.33%', code: 'BOM-CCU' },
  { from: 'DEL', to: 'PAT', weight: '3.19%', code: 'DEL-PAT' },
  { from: 'BLR', to: 'PNQ', weight: '3.15%', code: 'BLR-PNQ' },
  { from: 'DEL', to: 'GAU', weight: '3.10%', code: 'DEL-GAU' },
];

export const IndiaRouteMap = ({
  selectedRoute,
  onSelectRoute,
}) => {
  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-sub)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
          DGCA Domestic Aviation Corridor Network (Top 20 City-Pairs)
        </span>
        <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
          136M Pax &bull; Geodesic Density
        </span>
      </div>

      <svg width="100%" height="340" viewBox="100 30 360 380" style={{ overflow: 'visible' }}>
        {/* Flight route curves */}
        {TRUNK_ROUTES.map((r, i) => {
          const a1 = AIRPORTS[r.from];
          const a2 = AIRPORTS[r.to];
          if (!a1 || !a2) return null;

          const isSelected = selectedRoute === r.code;

          // Midpoint curved control point
          const mx = (a1.x + a2.x) / 2 - (a2.y - a1.y) * 0.15;
          const my = (a1.y + a2.y) / 2 + (a2.x - a1.x) * 0.15;

          return (
            <g
              key={i}
              style={{ cursor: 'pointer' }}
              onClick={() => onSelectRoute && onSelectRoute(r.code)}
            >
              <path
                d={`M ${a1.x} ${a1.y} Q ${mx} ${my} ${a2.x} ${a2.y}`}
                fill="none"
                stroke={isSelected ? '#2563EB' : '#94A3B8'}
                strokeWidth={isSelected ? '2.5' : '1.2'}
                strokeDasharray={isSelected ? 'none' : (i % 3 === 0 ? '3 3' : 'none')}
                opacity={isSelected ? 1 : 0.6}
              />
            </g>
          );
        })}

        {/* Airport Hub Nodes */}
        {Object.values(AIRPORTS).map((a) => (
          <g key={a.iata}>
            <circle cx={a.x} cy={a.y} r="4" fill="#0F172A" />
            <circle cx={a.x} cy={a.y} r="1.8" fill="#FFFFFF" />
            <text
              x={a.x + 7}
              y={a.y + 4}
              fill="#374151"
              fontSize="9.5"
              fontFamily="var(--font-mono)"
              fontWeight="700"
            >
              {a.iata}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};
