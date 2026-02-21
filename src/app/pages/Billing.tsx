import React from 'react';
import { C, F } from '../tokens';

export function Billing() {
  const billingCycles = [
    {
      poolName: 'Netflix Standard',
      poolIcon: '🎬',
      billingDate: 'Feb 28',
      members: 3,
      collected: 9.98,
      outstanding: 4.99,
    },
    {
      poolName: 'YouTube Premium',
      poolIcon: '▶️',
      billingDate: 'Mar 1',
      members: 4,
      collected: 10.47,
      outstanding: 3.49,
    },
  ];

  const upcoming = [
    { date: 'Feb 28', pool: 'Netflix Standard', amount: 14.97 },
    { date: 'Mar 1', pool: 'YouTube Premium', amount: 13.96 },
    { date: 'Mar 15', pool: 'Figma Pro', amount: 18.0 },
  ];

  const daysElapsed = 19;
  const totalDays = 28;
  const progressPercent = (daysElapsed / totalDays) * 100;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* THIS CYCLE section */}
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
          This Cycle
        </h2>

        {/* Cycle info card */}
        <div
          style={{
            backgroundColor: C.bgSurface,
            border: `1px solid ${C.borderDefault}`,
            borderRadius: 6,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span
              style={{
                fontFamily: F.mono,
                fontSize: 13,
                color: C.textMuted,
              }}
            >
              Feb 1 – Feb 28, 2026
            </span>
            <span
              style={{
                fontFamily: F.mono,
                fontSize: 13,
                color: C.textPrimary,
              }}
            >
              {daysElapsed} of {totalDays} days
            </span>
          </div>

          {/* Progress bar */}
          <div
            style={{
              width: '100%',
              height: 8,
              backgroundColor: C.borderDefault,
              borderRadius: 100,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                backgroundColor: C.accentLime,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* Pool billing cards */}
        <div style={{ display: 'grid', gap: 16 }}>
          {billingCycles.map((cycle, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: C.bgSurface,
                border: `1px solid ${C.borderDefault}`,
                borderRadius: 6,
                padding: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 20,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 6,
                  backgroundColor: C.bgHover,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  flexShrink: 0,
                }}
              >
                {cycle.poolIcon}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: F.syne,
                    fontWeight: 600,
                    fontSize: 15,
                    color: C.textPrimary,
                    marginBottom: 4,
                  }}
                >
                  {cycle.poolName}
                </div>
                <div
                  style={{
                    fontFamily: F.mono,
                    fontSize: 11,
                    color: C.textMuted,
                  }}
                >
                  {cycle.members} members
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: 4,
                }}
              >
                <div
                  style={{
                    fontFamily: F.mono,
                    fontSize: 11,
                    color: C.textMuted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                  }}
                >
                  Billing Date
                </div>
                <div
                  style={{
                    fontFamily: F.mono,
                    fontWeight: 600,
                    fontSize: 14,
                    color: C.textPrimary,
                  }}
                >
                  {cycle.billingDate}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: 4,
                }}
              >
                <div
                  style={{
                    fontFamily: F.mono,
                    fontSize: 11,
                    color: C.statusSuccess,
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                  }}
                >
                  Collected
                </div>
                <div
                  style={{
                    fontFamily: F.mono,
                    fontWeight: 600,
                    fontSize: 14,
                    color: C.textPrimary,
                  }}
                >
                  ${cycle.collected.toFixed(2)}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: 4,
                }}
              >
                <div
                  style={{
                    fontFamily: F.mono,
                    fontSize: 11,
                    color: C.statusWarning,
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                  }}
                >
                  Outstanding
                </div>
                <div
                  style={{
                    fontFamily: F.mono,
                    fontWeight: 600,
                    fontSize: 14,
                    color: C.statusWarning,
                  }}
                >
                  ${cycle.outstanding.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* UPCOMING section */}
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
          Upcoming
        </h2>

        <div
          style={{
            backgroundColor: C.bgSurface,
            border: `1px solid ${C.borderDefault}`,
            borderRadius: 6,
            padding: 20,
          }}
        >
          {upcoming.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                paddingBottom: idx < upcoming.length - 1 ? 16 : 0,
                marginBottom: idx < upcoming.length - 1 ? 16 : 0,
                borderBottom: idx < upcoming.length - 1 ? `1px solid ${C.borderDefault}` : 'none',
              }}
            >
              <div
                style={{
                  padding: '6px 12px',
                  backgroundColor: C.bgBase,
                  border: `1px solid ${C.borderDefault}`,
                  borderRadius: 4,
                  fontFamily: F.mono,
                  fontSize: 12,
                  color: C.textPrimary,
                  fontWeight: 500,
                  flexShrink: 0,
                }}
              >
                {item.date}
              </div>

              <div style={{ flex: 1 }}>
                <span
                  style={{
                    fontFamily: F.syne,
                    fontWeight: 600,
                    fontSize: 14,
                    color: C.textPrimary,
                  }}
                >
                  {item.pool}
                </span>
              </div>

              <div
                style={{
                  fontFamily: F.mono,
                  fontWeight: 600,
                  fontSize: 14,
                  color: C.accentLime,
                }}
              >
                ${item.amount.toFixed(2)} total expected
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
