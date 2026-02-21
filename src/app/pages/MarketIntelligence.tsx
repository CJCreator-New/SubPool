import React from 'react';
import { C, F } from '../tokens';
import { Button } from '../components/subpool/Button';

const platformMarketData = [
  { icon: '🎨', name: 'Figma', demand: '🔥 Hot', avgPrice: 6.20, fillTime: '1.2 days', activePools: 124 },
  { icon: '🎬', name: 'Netflix', demand: '📈 Rising', avgPrice: 3.50, fillTime: '0.8 days', activePools: 412 },
  { icon: '🎵', name: 'Spotify', demand: '➡️ Stable', avgPrice: 4.10, fillTime: '2.1 days', activePools: 189 },
  { icon: '▶️', name: 'YouTube', demand: '📈 Rising', avgPrice: 2.90, fillTime: '1.5 days', activePools: 256 },
  { icon: '🤖', name: 'ChatGPT+', demand: '🔥 Hot', avgPrice: 5.00, fillTime: '0.5 days', activePools: 86 },
  { icon: '🅰️', name: 'Adobe CC', demand: '➡️ Stable', avgPrice: 12.40, fillTime: '3.4 days', activePools: 67 },
  { icon: '📋', name: 'Notion', demand: '📈 Rising', avgPrice: 4.80, fillTime: '1.9 days', activePools: 143 },
  { icon: '🐙', name: 'GitHub', demand: '➡️ Stable', avgPrice: 4.00, fillTime: '2.5 days', activePools: 92 },
];

export function MarketIntelligence() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header section */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1
            style={{
              margin: '0 0 8px',
              fontFamily: F.syne,
              fontWeight: 800,
              fontSize: 28,
              color: C.textPrimary,
            }}
          >
            Market Intelligence
          </h1>
          <p
            style={{
              margin: 0,
              fontFamily: F.syne,
              fontWeight: 400,
              fontSize: 15,
              color: C.textMuted,
              maxWidth: 600,
            }}
          >
            Real-time supply and demand data across the SubPool ecosystem.
          </p>
        </div>
        <Button onClick={() => window.location.href = '/list'}>
          List a Pool
        </Button>
      </div>

      {/* Grid of Platform Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        {platformMarketData.map((platform) => (
          <MarketCard key={platform.name} {...platform} />
        ))}
      </div>

      {/* Beta Notice */}
      <div
        style={{
          padding: 24,
          backgroundColor: C.bgSurface,
          border: `1px dashed ${C.borderDefault}`,
          borderRadius: 6,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <span style={{ fontSize: 24 }}>📈</span>
        <h3 style={{ margin: 0, fontFamily: F.syne, fontWeight: 700, fontSize: 16, color: C.textPrimary }}>
          More data coming soon
        </h3>
        <p style={{ margin: 0, fontFamily: F.syne, fontSize: 13, color: C.textMuted, maxWidth: 400 }}>
          We're currently processing data for 40+ additional subscription services. Check back next week for deeper insights.
        </p>
      </div>
    </div>
  );
}

function MarketCard({
  icon,
  name,
  demand,
  avgPrice,
  fillTime,
  activePools
}: {
  icon: string;
  name: string;
  demand: string;
  avgPrice: number;
  fillTime: string;
  activePools: number;
}) {
  return (
    <div
      style={{
        backgroundColor: C.bgSurface,
        border: `1px solid ${C.borderDefault}`,
        borderRadius: 6,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        transition: 'border-color 0.2s ease',
      }}
    >
      {/* Top row: Icon + Name + Demand */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              backgroundColor: C.bgBase,
              border: `1px solid ${C.borderDefault}`,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
            }}
          >
            {icon}
          </div>
          <span style={{ fontFamily: F.syne, fontWeight: 700, fontSize: 16, color: C.textPrimary }}>
            {name}
          </span>
        </div>
        <div
          style={{
            padding: '3px 8px',
            borderRadius: 100,
            border: `1px solid ${demand.includes('Hot') ? C.accentLime : demand.includes('Rising') ? C.statusSuccess : C.textMuted}`,
            color: demand.includes('Hot') ? C.accentLime : demand.includes('Rising') ? C.statusSuccess : C.textMuted,
            fontFamily: F.mono,
            fontWeight: 500,
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {demand}
        </div>
      </div>

      {/* Stats Divider */}
      <div style={{ height: 1, backgroundColor: C.borderDefault }} />

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontFamily: F.mono, fontSize: 9, color: C.textMuted, textTransform: 'uppercase' }}>
            Avg. Slot Price
          </span>
          <span style={{ fontFamily: F.mono, fontSize: 15, fontWeight: 600, color: C.textPrimary }}>
            ${avgPrice.toFixed(2)}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontFamily: F.mono, fontSize: 9, color: C.textMuted, textTransform: 'uppercase' }}>
            Avg. Fill Time
          </span>
          <span style={{ fontFamily: F.mono, fontSize: 15, fontWeight: 600, color: C.textPrimary }}>
            {fillTime}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontFamily: F.mono, fontSize: 9, color: C.textMuted, textTransform: 'uppercase' }}>
            Active Pools
          </span>
          <span style={{ fontFamily: F.mono, fontSize: 15, fontWeight: 600, color: C.textPrimary }}>
            {activePools}
          </span>
        </div>
      </div>
    </div>
  );
}
