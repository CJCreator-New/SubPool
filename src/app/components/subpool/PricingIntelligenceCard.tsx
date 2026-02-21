import React from 'react';
import { C, F } from '../../tokens';

interface PricingIntelligenceCardProps {
  platform: string;
  pricePerSlot: number;
}

export function PricingIntelligenceCard({ platform, pricePerSlot }: PricingIntelligenceCardProps) {
  // Mock market data for Figma (could be extended based on platform)
  const marketData = {
    low: 4.0,
    high: 9.0,
    avg: 6.2,
    minSweet: 5.0,
    maxSweet: 7.0,
    demand: '🔥 High',
    fastestFill: '$5-7 range',
  };

  const isOverpriced = pricePerSlot > marketData.avg;
  const isSweetSpot = pricePerSlot >= marketData.minSweet && pricePerSlot <= marketData.maxSweet;
  const isCompetitive = pricePerSlot <= marketData.avg;

  // Calculate percentage for position on the bar
  const range = marketData.high - marketData.low;
  const clampedPrice = Math.max(marketData.low, Math.min(marketData.high, pricePerSlot));
  const dotPosition = ((clampedPrice - marketData.low) / range) * 100;
  
  const sweetSpotLeft = ((marketData.minSweet - marketData.low) / range) * 100;
  const sweetSpotWidth = ((marketData.maxSweet - marketData.minSweet) / range) * 100;

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
      }}
    >
      {/* Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <h3
          style={{
            margin: 0,
            fontFamily: F.syne,
            fontWeight: 700,
            fontSize: 14,
            color: C.textPrimary,
          }}
        >
          📊 Market Pricing
        </h3>
        <span
          style={{
            padding: '2px 6px',
            borderRadius: 4,
            border: `1px solid ${C.accentLime}`,
            color: C.accentLime,
            fontFamily: F.mono,
            fontWeight: 700,
            fontSize: 9,
            letterSpacing: '0.5px',
          }}
        >
          BETA
        </span>
      </div>

      {/* Market Data Visualization */}
      <div style={{ position: 'relative', padding: '24px 0 12px' }}>
        {/* Label for "Your price" */}
        <div
          style={{
            position: 'absolute',
            left: `${dotPosition}%`,
            top: 0,
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            zIndex: 2,
          }}
        >
          <span
            style={{
              fontFamily: F.mono,
              fontSize: 10,
              color: C.accentLime,
              whiteSpace: 'nowrap',
              fontWeight: 600,
            }}
          >
            Your price
          </span>
        </div>

        {/* Range Bar Container */}
        <div style={{ position: 'relative', height: 4, backgroundColor: C.borderDefault, borderRadius: 10 }}>
          {/* Sweet Spot Zone */}
          <div
            style={{
              position: 'absolute',
              left: `${sweetSpotLeft}%`,
              width: `${sweetSpotWidth}%`,
              height: '100%',
              backgroundColor: C.accentLime,
              opacity: 0.15,
            }}
          />
          
          {/* Your Price Marker */}
          <div
            style={{
              position: 'absolute',
              left: `${dotPosition}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: C.accentLime,
              boxShadow: '0 0 10px rgba(200,241,53,0.5)',
              zIndex: 3,
            }}
          />
        </div>

        {/* Min/Max Labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ fontFamily: F.mono, fontSize: 10, color: C.textMuted }}>
            Low <span style={{ color: C.textPrimary }}>${marketData.low.toFixed(2)}</span>
          </span>
          <span style={{ fontFamily: F.mono, fontSize: 10, color: C.textMuted }}>
            High <span style={{ color: C.textPrimary }}>${marketData.high.toFixed(2)}</span>
          </span>
        </div>
      </div>

      {/* Stat Chips */}
      <div style={{ display: 'flex', gap: 12 }}>
        <StatChip label="Avg. slot price" value={`$${marketData.avg.toFixed(2)}`} />
        <StatChip label="Pools filled fastest" value={marketData.fastestFill} />
        <StatChip label="Market demand" value={marketData.demand} />
      </div>

      {/* Recommendation Callout */}
      {isOverpriced ? (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'rgba(245, 166, 35, 0.05)',
            borderLeft: `3px solid ${C.statusWarning}`,
            borderRadius: '0 4px 4px 0',
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: F.syne,
              fontSize: 13,
              color: C.textPrimary,
              lineHeight: 1.5,
            }}
          >
            ⚠️ <span style={{ fontWeight: 600 }}>${pricePerSlot.toFixed(2)}</span> is above market average (${marketData.avg.toFixed(2)}). Consider lowering to fill faster.
          </p>
        </div>
      ) : (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'rgba(200, 241, 53, 0.05)',
            borderLeft: `3px solid ${C.accentLime}`,
            borderRadius: '0 4px 4px 0',
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: F.syne,
              fontSize: 13,
              color: C.textPrimary,
              lineHeight: 1.5,
            }}
          >
            {isSweetSpot 
              ? `Your $${pricePerSlot.toFixed(2)}/slot is in the sweet spot! Pools in this range fill 40% faster than average.`
              : `Your $${pricePerSlot.toFixed(2)}/slot is competitive. Great choice for attracting members quickly.`}
          </p>
        </div>
      )}
    </div>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        padding: '10px 12px',
        backgroundColor: C.bgBase,
        border: `1px solid ${C.borderDefault}`,
        borderRadius: 4,
      }}
    >
      <span style={{ fontFamily: F.mono, fontSize: 9, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </span>
      <span style={{ fontFamily: F.mono, fontSize: 12, fontWeight: 600, color: C.textPrimary }}>
        {value}
      </span>
    </div>
  );
}
