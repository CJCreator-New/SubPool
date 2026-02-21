import React, { useState } from 'react';
import { C, F } from '../tokens';
import { Button } from '../components/subpool/Button';

export function MobileMyPools() {
  const [activeTab, setActiveTab] = useState<'own' | 'in'>('own');

  const ownedPools = [
    {
      id: '1',
      platform: 'Netflix',
      icon: '🎬',
      plan: 'Standard',
      slots: { filled: 3, total: 4 },
      monthlyIncome: 14.97,
      status: 'active' as const,
    },
    {
      id: '2',
      platform: 'Spotify',
      icon: '🎵',
      plan: 'Duo',
      slots: { filled: 2, total: 2 },
      monthlyIncome: 6.98,
      status: 'full' as const,
    },
  ];

  const joinedPools = [
    {
      id: '3',
      platform: 'Figma',
      icon: '🎨',
      plan: 'Professional',
      owner: 'Sam K',
      monthlyCost: 6.0,
      nextPayment: 'Feb 28',
      status: 'active' as const,
    },
    {
      id: '4',
      platform: 'ChatGPT',
      icon: '🤖',
      plan: 'Plus',
      owner: 'Alex M',
      monthlyCost: 10.0,
      nextPayment: 'Mar 5',
      status: 'active' as const,
    },
  ];

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 375,
        minHeight: '100vh',
        margin: '0 auto',
        backgroundColor: C.bgBase,
        padding: 20,
        boxSizing: 'border-box',
      }}
    >
      {/* Segmented control tabs */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          padding: 4,
          backgroundColor: C.bgSurface,
          border: `1px solid ${C.borderDefault}`,
          borderRadius: 8,
          marginBottom: 20,
        }}
      >
        <button
          onClick={() => setActiveTab('own')}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: 6,
            backgroundColor: activeTab === 'own' ? C.accentLime : 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontFamily: F.syne,
            fontWeight: 700,
            fontSize: 14,
            color: activeTab === 'own' ? C.bgBase : C.textMuted,
            transition: 'all 0.2s ease',
          }}
        >
          I Own
        </button>

        <button
          onClick={() => setActiveTab('in')}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: 6,
            backgroundColor: activeTab === 'in' ? C.accentLime : 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontFamily: F.syne,
            fontWeight: 700,
            fontSize: 14,
            color: activeTab === 'in' ? C.bgBase : C.textMuted,
            transition: 'all 0.2s ease',
          }}
        >
          I'm In
        </button>
      </div>

      {/* Pool cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {activeTab === 'own' &&
          ownedPools.map((pool) => {
            const fillPercent = (pool.slots.filled / pool.slots.total) * 100;

            return (
              <div
                key={pool.id}
                style={{
                  backgroundColor: C.bgSurface,
                  border: `1px solid ${C.borderDefault}`,
                  borderRadius: 6,
                  padding: 16,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 6,
                      backgroundColor: C.bgBase,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 24,
                      flexShrink: 0,
                    }}
                  >
                    {pool.icon}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: F.syne,
                        fontWeight: 700,
                        fontSize: 16,
                        color: C.textPrimary,
                        marginBottom: 4,
                      }}
                    >
                      {pool.platform}
                    </div>
                    <div
                      style={{
                        fontFamily: F.syne,
                        fontSize: 13,
                        color: C.textMuted,
                      }}
                    >
                      {pool.plan}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '4px 10px',
                      border: `1px solid ${pool.status === 'full' ? C.accentLime : C.borderDefault}`,
                      borderRadius: 100,
                      fontFamily: F.mono,
                      fontSize: 10,
                      fontWeight: 600,
                      color: pool.status === 'full' ? C.accentLime : C.textMuted,
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px',
                    }}
                  >
                    {pool.status}
                  </div>
                </div>

                {/* Slot fill bar */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span
                      style={{
                        fontFamily: F.mono,
                        fontSize: 11,
                        color: C.textMuted,
                      }}
                    >
                      {pool.slots.filled}/{pool.slots.total} slots filled
                    </span>
                    <span
                      style={{
                        fontFamily: F.mono,
                        fontSize: 11,
                        fontWeight: 600,
                        color: C.accentLime,
                      }}
                    >
                      +${pool.monthlyIncome}/mo
                    </span>
                  </div>

                  <div
                    style={{
                      width: '100%',
                      height: 6,
                      backgroundColor: C.bgBase,
                      borderRadius: 100,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${fillPercent}%`,
                        height: '100%',
                        backgroundColor: C.accentLime,
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>

                {/* Action button */}
                <Button
                  variant="outline"
                  size="sm"
                  style={{ width: '100%' }}
                >
                  Manage
                </Button>
              </div>
            );
          })}

        {activeTab === 'in' &&
          joinedPools.map((pool) => (
            <div
              key={pool.id}
              style={{
                backgroundColor: C.bgSurface,
                border: `1px solid ${C.borderDefault}`,
                borderRadius: 6,
                padding: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 6,
                    backgroundColor: C.bgBase,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                    flexShrink: 0,
                  }}
                >
                  {pool.icon}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: F.syne,
                      fontWeight: 700,
                      fontSize: 16,
                      color: C.textPrimary,
                      marginBottom: 4,
                    }}
                  >
                    {pool.platform}
                  </div>
                  <div
                    style={{
                      fontFamily: F.syne,
                      fontSize: 13,
                      color: C.textMuted,
                    }}
                  >
                    {pool.plan}
                  </div>
                </div>

                <div
                  style={{
                    padding: '4px 10px',
                    border: `1px solid ${C.statusSuccess}`,
                    borderRadius: 100,
                    fontFamily: F.mono,
                    fontSize: 10,
                    fontWeight: 600,
                    color: C.statusSuccess,
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                  }}
                >
                  {pool.status}
                </div>
              </div>

              {/* Pool info */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                  padding: '12px 0',
                  borderTop: `1px solid ${C.borderDefault}`,
                  borderBottom: `1px solid ${C.borderDefault}`,
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: F.mono,
                      fontSize: 10,
                      color: C.textMuted,
                      marginBottom: 4,
                    }}
                  >
                    OWNER
                  </div>
                  <div
                    style={{
                      fontFamily: F.syne,
                      fontSize: 13,
                      fontWeight: 600,
                      color: C.textPrimary,
                    }}
                  >
                    {pool.owner}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      fontFamily: F.mono,
                      fontSize: 10,
                      color: C.textMuted,
                      marginBottom: 4,
                    }}
                  >
                    NEXT PAYMENT
                  </div>
                  <div
                    style={{
                      fontFamily: F.mono,
                      fontSize: 13,
                      fontWeight: 600,
                      color: C.textPrimary,
                    }}
                  >
                    {pool.nextPayment}
                  </div>
                </div>
              </div>

              {/* Action button */}
              <Button
                variant="primary"
                size="sm"
                style={{ width: '100%' }}
              >
                Pay ${pool.monthlyCost}
              </Button>
            </div>
          ))}
      </div>
    </div>
  );
}
