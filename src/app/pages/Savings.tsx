import React from 'react';
import { C, F } from '../tokens';

export function Savings() {
  const subscriptions = [
    { platform: '🎬 Netflix Standard', fullPrice: 19.99, yourPrice: 4.99 },
    { platform: '🎵 Spotify Duo', fullPrice: 6.99, yourPrice: 3.49 },
    { platform: '🎨 Figma Pro', fullPrice: 30.0, yourPrice: 6.0 },
  ];

  const totalFullPrice = subscriptions.reduce((sum, s) => sum + s.fullPrice, 0);
  const totalYourPrice = subscriptions.reduce((sum, s) => sum + s.yourPrice, 0);
  const totalSavings = totalFullPrice - totalYourPrice;
  const savingsPercent = ((totalSavings / totalFullPrice) * 100).toFixed(1);

  const monthlyData = [
    { month: 'Sep', full: 56.98, your: 14.48 },
    { month: 'Oct', full: 56.98, your: 14.48 },
    { month: 'Nov', full: 56.98, your: 14.48 },
    { month: 'Dec', full: 56.98, your: 14.48 },
    { month: 'Jan', full: 56.98, your: 14.48 },
    { month: 'Feb', full: 56.98, your: 14.48 },
  ];

  const maxValue = Math.max(...monthlyData.map(d => d.full));

  const badges = [
    { emoji: '🎯', label: 'First Pool', unlocked: true },
    { emoji: '💰', label: '$100 Saved', unlocked: true },
    { emoji: '🔥', label: '$500 Saved', unlocked: false },
    { emoji: '⭐', label: '6 Month Streak', unlocked: true },
    { emoji: '👑', label: 'Super Saver', unlocked: false },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Hero savings card */}
      <div
        style={{
          backgroundColor: C.bgSurface,
          border: `1px solid ${C.borderDefault}`,
          borderRadius: 6,
          padding: 32,
          marginBottom: 40,
          display: 'flex',
          alignItems: 'center',
          gap: 40,
        }}
      >
        {/* Left side */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: F.mono,
              fontSize: 10,
              color: C.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '1.2px',
              marginBottom: 12,
            }}
          >
            TOTAL SAVED TO DATE
          </div>

          <div
            style={{
              fontFamily: F.syne,
              fontWeight: 800,
              fontSize: 64,
              color: C.accentLime,
              lineHeight: 1,
              marginBottom: 12,
            }}
          >
            $341.20
          </div>

          <div
            style={{
              fontFamily: F.mono,
              fontSize: 12,
              color: C.textMuted,
            }}
          >
            since joining SubPool Jan 2025
          </div>

          {/* Bottom stats chips */}
          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            <div
              style={{
                padding: '8px 14px',
                backgroundColor: C.bgBase,
                border: `1px solid ${C.borderDefault}`,
                borderRadius: 6,
              }}
            >
              <span style={{ fontFamily: F.mono, fontSize: 11, color: C.textMuted }}>
                Pools active:{' '}
              </span>
              <span style={{ fontFamily: F.mono, fontSize: 11, color: C.textPrimary, fontWeight: 600 }}>
                3
              </span>
            </div>

            <div
              style={{
                padding: '8px 14px',
                backgroundColor: C.bgBase,
                border: `1px solid ${C.borderDefault}`,
                borderRadius: 6,
              }}
            >
              <span style={{ fontFamily: F.mono, fontSize: 11, color: C.textMuted }}>
                Monthly saving:{' '}
              </span>
              <span style={{ fontFamily: F.mono, fontSize: 11, color: C.accentLime, fontWeight: 600 }}>
                $31.47
              </span>
            </div>

            <div
              style={{
                padding: '8px 14px',
                backgroundColor: C.bgBase,
                border: `1px solid ${C.borderDefault}`,
                borderRadius: 6,
              }}
            >
              <span style={{ fontFamily: F.mono, fontSize: 11, color: C.textMuted }}>
                Best deal:{' '}
              </span>
              <span style={{ fontFamily: F.mono, fontSize: 11, color: C.textPrimary, fontWeight: 600 }}>
                Adobe CC (80% off)
              </span>
            </div>
          </div>
        </div>

        {/* Right side - Doughnut chart */}
        <div
          style={{
            position: 'relative',
            width: 200,
            height: 200,
            flexShrink: 0,
          }}
        >
          <svg width="200" height="200" viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)' }}>
            {/* Outer ring (full price) */}
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke={C.borderDefault}
              strokeWidth="24"
            />
            {/* Inner fill (your price) - 27% of full circle */}
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke={C.accentLime}
              strokeWidth="24"
              strokeDasharray={`${502 * 0.27} 502`}
              strokeLinecap="round"
            />
          </svg>

          {/* Center text */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontFamily: F.syne,
                fontWeight: 800,
                fontSize: 24,
                color: C.accentLime,
                lineHeight: 1,
              }}
            >
              73%
            </div>
            <div
              style={{
                fontFamily: F.mono,
                fontSize: 11,
                color: C.textMuted,
                marginTop: 4,
              }}
            >
              saved
            </div>
          </div>
        </div>
      </div>

      {/* Monthly breakdown */}
      <div style={{ marginBottom: 40 }}>
        <h2
          style={{
            fontFamily: F.syne,
            fontWeight: 700,
            fontSize: 22,
            color: C.textPrimary,
            marginBottom: 20,
          }}
        >
          Spending vs. Solo Pricing
        </h2>

        <div
          style={{
            backgroundColor: C.bgSurface,
            border: `1px solid ${C.borderDefault}`,
            borderRadius: 6,
            padding: 32,
          }}
        >
          {/* Chart */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 24,
              height: 240,
              marginBottom: 16,
            }}
          >
            {monthlyData.map((data, idx) => (
              <div
                key={idx}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  height: '100%',
                  justifyContent: 'flex-end',
                }}
              >
                {/* Bars container */}
                <div
                  style={{
                    display: 'flex',
                    gap: 6,
                    alignItems: 'flex-end',
                    height: '100%',
                  }}
                >
                  {/* Full price bar */}
                  <div
                    style={{
                      width: 24,
                      height: `${(data.full / maxValue) * 100}%`,
                      backgroundColor: C.borderDefault,
                      borderRadius: '4px 4px 0 0',
                    }}
                  />

                  {/* Your price bar */}
                  <div
                    style={{
                      width: 24,
                      height: `${(data.your / maxValue) * 100}%`,
                      backgroundColor: C.accentLime,
                      borderRadius: '4px 4px 0 0',
                    }}
                  />
                </div>

                {/* Month label */}
                <div
                  style={{
                    fontFamily: F.mono,
                    fontSize: 11,
                    color: C.textMuted,
                  }}
                >
                  {data.month}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: C.borderDefault,
                  borderRadius: 2,
                }}
              />
              <span style={{ fontFamily: F.mono, fontSize: 11, color: C.textMuted }}>
                Full price
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: C.accentLime,
                  borderRadius: 2,
                }}
              />
              <span style={{ fontFamily: F.mono, fontSize: 11, color: C.textMuted }}>
                Your price
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Per subscription breakdown */}
      <div style={{ marginBottom: 40 }}>
        <h2
          style={{
            fontFamily: F.syne,
            fontWeight: 700,
            fontSize: 22,
            color: C.textPrimary,
            marginBottom: 20,
          }}
        >
          Per Subscription Breakdown
        </h2>

        <div
          style={{
            backgroundColor: C.bgSurface,
            border: `1px solid ${C.borderDefault}`,
            borderRadius: 6,
            overflow: 'hidden',
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
              padding: '16px 20px',
              borderBottom: `1px solid ${C.borderDefault}`,
              backgroundColor: C.bgBase,
            }}
          >
            {['Platform', 'Full Price', 'Your Price', 'Savings', 'Savings %'].map((header) => (
              <div
                key={header}
                style={{
                  fontFamily: F.mono,
                  fontSize: 10,
                  color: C.textMuted,
                  textTransform: 'uppercase',
                  letterSpacing: '1.2px',
                  textAlign: header === 'Platform' ? 'left' : 'right',
                }}
              >
                {header}
              </div>
            ))}
          </div>

          {/* Table rows */}
          {subscriptions.map((sub, idx) => {
            const savings = sub.fullPrice - sub.yourPrice;
            const savingsPercent = ((savings / sub.fullPrice) * 100).toFixed(0);

            return (
              <div
                key={idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                  padding: '16px 20px',
                  borderBottom:
                    idx < subscriptions.length - 1 ? `1px solid ${C.borderDefault}` : 'none',
                }}
              >
                <div
                  style={{
                    fontFamily: F.syne,
                    fontSize: 14,
                    fontWeight: 600,
                    color: C.textPrimary,
                  }}
                >
                  {sub.platform}
                </div>

                <div
                  style={{
                    fontFamily: F.mono,
                    fontSize: 13,
                    color: C.textMuted,
                    textAlign: 'right',
                  }}
                >
                  ${sub.fullPrice.toFixed(2)}
                </div>

                <div
                  style={{
                    fontFamily: F.mono,
                    fontSize: 13,
                    fontWeight: 600,
                    color: C.textPrimary,
                    textAlign: 'right',
                  }}
                >
                  ${sub.yourPrice.toFixed(2)}
                </div>

                <div
                  style={{
                    fontFamily: F.mono,
                    fontSize: 13,
                    fontWeight: 600,
                    color: C.statusSuccess,
                    textAlign: 'right',
                  }}
                >
                  ${savings.toFixed(2)}
                </div>

                <div
                  style={{
                    fontFamily: F.mono,
                    fontSize: 13,
                    fontWeight: 600,
                    color: C.accentLime,
                    textAlign: 'right',
                  }}
                >
                  {savingsPercent}%
                </div>
              </div>
            );
          })}

          {/* Total row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
              padding: '16px 20px',
              borderTop: `2px solid ${C.borderDefault}`,
              backgroundColor: C.bgBase,
            }}
          >
            <div
              style={{
                fontFamily: F.syne,
                fontSize: 14,
                fontWeight: 700,
                color: C.textPrimary,
              }}
            >
              TOTAL
            </div>

            <div
              style={{
                fontFamily: F.mono,
                fontSize: 13,
                fontWeight: 600,
                color: C.textMuted,
                textAlign: 'right',
              }}
            >
              ${totalFullPrice.toFixed(2)}
            </div>

            <div
              style={{
                fontFamily: F.mono,
                fontSize: 13,
                fontWeight: 700,
                color: C.textPrimary,
                textAlign: 'right',
              }}
            >
              ${totalYourPrice.toFixed(2)}
            </div>

            <div
              style={{
                fontFamily: F.mono,
                fontSize: 13,
                fontWeight: 700,
                color: C.statusSuccess,
                textAlign: 'right',
              }}
            >
              ${totalSavings.toFixed(2)}
            </div>

            <div
              style={{
                fontFamily: F.mono,
                fontSize: 13,
                fontWeight: 700,
                color: C.accentLime,
                textAlign: 'right',
              }}
            >
              {savingsPercent}%
            </div>
          </div>
        </div>
      </div>

      {/* Savings milestones */}
      <div>
        <h2
          style={{
            fontFamily: F.syne,
            fontWeight: 700,
            fontSize: 22,
            color: C.textPrimary,
            marginBottom: 20,
          }}
        >
          Savings Milestones
        </h2>

        <div
          style={{
            display: 'flex',
            gap: 16,
            overflowX: 'auto',
            paddingBottom: 8,
          }}
        >
          {badges.map((badge, idx) => (
            <div
              key={idx}
              style={{
                minWidth: 140,
                padding: 20,
                backgroundColor: C.bgSurface,
                border: `1px solid ${badge.unlocked ? C.borderAccent : C.borderDefault}`,
                borderRadius: 6,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
                opacity: badge.unlocked ? 1 : 0.5,
                position: 'relative',
              }}
            >
              {!badge.unlocked && (
                <div
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    fontSize: 12,
                  }}
                >
                  🔒
                </div>
              )}

              <div style={{ fontSize: 40, lineHeight: 1 }}>
                {badge.emoji}
              </div>

              <div
                style={{
                  fontFamily: F.syne,
                  fontWeight: 600,
                  fontSize: 13,
                  color: badge.unlocked ? C.textPrimary : C.textMuted,
                  textAlign: 'center',
                }}
              >
                {badge.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
