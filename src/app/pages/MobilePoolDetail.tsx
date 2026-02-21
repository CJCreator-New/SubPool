import React from 'react';
import { C, F } from '../tokens';
import { Button } from '../components/subpool/Button';
import { StatusPill } from '../components/subpool/StatusPill';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

export function MobilePoolDetail() {
  const navigate = useNavigate();

  const pool = {
    platform: 'Netflix',
    plan: 'Standard 1080p',
    platformIcon: '🎬',
    status: 'active' as const,
    pricePerSlot: 4.99,
    billingCycle: 'monthly',
    totalSlots: 4,
    filledSlots: 3,
    owner: {
      name: 'Riya K',
      rating: 4.9,
      poolsHosted: 3,
      responseTime: '2h',
    },
    details: {
      region: 'North America',
      renewalDate: 'Feb 28, 2026',
      paymentMethod: 'Auto-pay via SubPool',
      lastUpdated: '2 days ago',
    },
  };

  const fillPercent = (pool.filledSlots / pool.totalSlots) * 100;

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 375,
        minHeight: '100vh',
        margin: '0 auto',
        backgroundColor: C.bgBase,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          backgroundColor: C.bgSurface,
          borderBottom: `1px solid ${C.borderDefault}`,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: C.textPrimary,
          }}
        >
          <ArrowLeft size={20} />
        </button>

        <span
          style={{
            fontFamily: F.syne,
            fontWeight: 700,
            fontSize: 15,
            color: C.textPrimary,
          }}
        >
          Pool Details
        </span>
      </div>

      {/* Platform header area */}
      <div
        style={{
          backgroundColor: '#E50914',
          padding: '32px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            backgroundColor: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(8px)',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 40,
          }}
        >
          {pool.platformIcon}
        </div>

        <h1
          style={{
            fontFamily: F.syne,
            fontWeight: 800,
            fontSize: 24,
            color: 'white',
            margin: 0,
          }}
        >
          {pool.platform}
        </h1>

        <p
          style={{
            fontFamily: F.syne,
            fontSize: 14,
            color: 'rgba(255,255,255,0.85)',
            margin: 0,
          }}
        >
          {pool.plan}
        </p>

        <StatusPill status={pool.status} label={pool.status.toUpperCase()} />
      </div>

      {/* Slot fill bar */}
      <div
        style={{
          padding: '20px',
          backgroundColor: C.bgSurface,
          borderBottom: `1px solid ${C.borderDefault}`,
        }}
      >
        <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span
            style={{
              fontFamily: F.mono,
              fontSize: 11,
              color: C.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '1.2px',
            }}
          >
            SLOTS FILLED
          </span>
          <span
            style={{
              fontFamily: F.mono,
              fontSize: 13,
              fontWeight: 600,
              color: C.textPrimary,
            }}
          >
            {pool.filledSlots}/{pool.totalSlots}
          </span>
        </div>

        <div
          style={{
            width: '100%',
            height: 12,
            backgroundColor: C.bgBase,
            borderRadius: 100,
            overflow: 'hidden',
            border: `1px solid ${C.borderDefault}`,
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

      {/* Detail list */}
      <div style={{ flex: 1, padding: 20 }}>
        <DetailRow label="Price per slot" value={`$${pool.pricePerSlot}/${pool.billingCycle}`} />
        <DetailRow label="Region" value={pool.details.region} />
        <DetailRow label="Renewal date" value={pool.details.renewalDate} />
        <DetailRow label="Payment method" value={pool.details.paymentMethod} />
        <DetailRow label="Last updated" value={pool.details.lastUpdated} />

        {/* Owner section */}
        <div
          style={{
            marginTop: 24,
            padding: 16,
            backgroundColor: C.bgSurface,
            border: `1px solid ${C.borderDefault}`,
            borderRadius: 6,
          }}
        >
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
            POOL OWNER
          </div>

          <div
            style={{
              fontFamily: F.syne,
              fontWeight: 600,
              fontSize: 15,
              color: C.textPrimary,
              marginBottom: 12,
            }}
          >
            {pool.owner.name}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div
              style={{
                fontFamily: F.mono,
                fontSize: 12,
                color: C.textMuted,
              }}
            >
              ⭐ {pool.owner.rating} rating · {pool.owner.poolsHosted} pools hosted
            </div>
            <div
              style={{
                fontFamily: F.mono,
                fontSize: 12,
                color: C.textMuted,
              }}
            >
              ⚡ Responds in ~{pool.owner.responseTime}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed bottom bar */}
      <div
        style={{
          padding: '16px 20px',
          backgroundColor: C.bgSurface,
          borderTop: `1px solid ${C.borderDefault}`,
          paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
        }}
      >
        <Button
          variant="primary"
          style={{ width: '100%', height: 52, fontSize: 15 }}
        >
          Request to Join ${pool.pricePerSlot}/{pool.billingCycle}
        </Button>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: '16px 0',
        borderBottom: `1px solid ${C.borderDefault}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <span
        style={{
          fontFamily: F.syne,
          fontSize: 14,
          color: C.textMuted,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: F.mono,
          fontSize: 13,
          fontWeight: 600,
          color: C.textPrimary,
          textAlign: 'right',
        }}
      >
        {value}
      </span>
    </div>
  );
}
