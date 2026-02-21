import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { C, F } from '../tokens';
import { PoolCard } from '../components/subpool/PoolCard';

const categories = ['all', 'entertainment', 'work', 'open only'];

const pools = [
  {
    id: 1,
    status: 'open' as const,
    platformEmoji: '🎬',
    platformName: 'Netflix',
    planName: 'Standard 4K',
    platformColor: '#1A0203',
    slotsTotal: 4,
    slotsFilled: 3,
    pricePerSlot: '4.99',
    ownerInitials: 'RK',
    ownerName: 'Riya K',
    ownerColor: C.accentLime,
  },
  {
    id: 2,
    status: 'open' as const,
    platformEmoji: '🎵',
    platformName: 'Spotify',
    planName: 'Duo',
    platformColor: '#011B09',
    slotsTotal: 2,
    slotsFilled: 1,
    pricePerSlot: '3.49',
    ownerInitials: 'AT',
    ownerName: 'Alex T',
    ownerColor: '#4DFF91',
  },
  {
    id: 3,
    status: 'open' as const,
    platformEmoji: '🤖',
    platformName: 'ChatGPT',
    planName: 'Plus',
    platformColor: '#031A14',
    slotsTotal: 2,
    slotsFilled: 1,
    pricePerSlot: '9.99',
    ownerInitials: 'MW',
    ownerName: 'Marcus W',
    ownerColor: '#00D1C1',
  },
  {
    id: 4,
    status: 'open' as const,
    platformEmoji: '📋',
    platformName: 'Notion',
    planName: 'Team',
    platformColor: '#1A1A1A',
    slotsTotal: 4,
    slotsFilled: 2,
    pricePerSlot: '4.00',
    ownerInitials: 'JM',
    ownerName: 'Jay M',
    ownerColor: '#F5A623',
  },
];

export function MobileBrowse() {
  const [activeCategory, setActiveCategory] = useState('all');
  const navigate = useNavigate();

  return (
    <div
      style={{
        width: '100vw',
        minHeight: '100vh',
        backgroundColor: C.bgBase,
        display: 'flex',
        flexDirection: 'column',
        paddingBottom: 64, // bottom tab bar height
      }}
    >
      {/* TOP BAR */}
      <div
        style={{
          height: 56,
          backgroundColor: C.bgSurface,
          borderBottom: `1px solid ${C.borderDefault}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <h1 style={{ margin: 0, fontFamily: F.syne, fontWeight: 800, fontSize: 18 }}>
          <span style={{ color: C.textPrimary }}>Sub</span>
          <span style={{ color: C.accentLime }}>Pool</span>
        </h1>
        <div style={{ position: 'relative', fontSize: 20 }}>
          🔔
          {/* Orange unread dot */}
          <div
            style={{
              position: 'absolute',
              top: 2,
              right: 2,
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#FF6B42',
            }}
          />
        </div>
      </div>

      {/* SEARCH BAR */}
      <div style={{ padding: '16px 20px 12px' }}>
        <div
          style={{
            width: '100%',
            height: 44,
            backgroundColor: C.bgSurface,
            border: `1px solid ${C.borderDefault}`,
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            padding: '0 14px',
            gap: 10,
          }}
        >
          <span style={{ opacity: 0.4, fontSize: 16 }}>🔍</span>
          <input
            type="text"
            placeholder="Search platforms..."
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              color: C.textPrimary,
              fontFamily: F.mono,
              fontSize: 14,
            }}
          />
        </div>
      </div>

      {/* FILTER CHIPS */}
      <div
        style={{
          padding: '0 20px 16px',
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          whiteSpace: 'nowrap',
        }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '8px 16px',
              borderRadius: 100,
              border: `1px solid ${activeCategory === cat ? C.accentLime : C.borderDefault}`,
              backgroundColor: activeCategory === cat ? 'rgba(200,241,53,0.1)' : 'transparent',
              color: activeCategory === cat ? C.accentLime : C.textMuted,
              fontFamily: F.mono,
              fontSize: 12,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              textTransform: 'lowercase',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* STATS: 2×2 grid */}
      <div
        style={{
          padding: '0 20px 20px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
        }}
      >
        {[
          { label: 'Open Pools', value: '142' },
          { label: 'Avg Savings', value: '67%' },
          { label: 'Platforms', value: '28' },
          { label: 'Members', value: '3.2k' },
        ].map((stat, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: C.bgSurface,
              border: `1px solid ${C.borderDefault}`,
              borderRadius: 6,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <span style={{ fontFamily: F.syne, fontWeight: 800, fontSize: 24, color: C.textPrimary }}>
              {stat.value}
            </span>
            <span
              style={{
                fontFamily: F.mono,
                fontWeight: 500,
                fontSize: 10,
                color: C.textMuted,
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
              }}
            >
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* POOL CARDS: single column */}
      <div
        style={{
          padding: '0 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {pools.map((pool) => (
          <PoolCard
            key={pool.id}
            status={pool.status}
            platformEmoji={pool.platformEmoji}
            platformName={pool.platformName}
            planName={pool.planName}
            platformColor={pool.platformColor}
            slotsTotal={pool.slotsTotal}
            slotsFilled={pool.slotsFilled}
            pricePerSlot={pool.pricePerSlot}
            ownerInitials={pool.ownerInitials}
            ownerName={pool.ownerName}
            ownerColor={pool.ownerColor}
          />
        ))}
      </div>

      {/* BOTTOM TAB BAR */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 64,
          backgroundColor: C.bgSurface,
          borderTop: `1px solid ${C.borderDefault}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          zIndex: 100,
        }}
      >
        {[
          { icon: '🌐', label: 'Browse', path: '/', active: true },
          { icon: '🗂️', label: 'My Pools', path: '/my-pools', active: false },
          { icon: '➕', label: 'List', path: '/list', active: false },
          { icon: '💰', label: 'Ledger', path: '/ledger', active: false },
          { icon: '👤', label: 'Profile', path: '/profile', active: false },
        ].map((tab) => (
          <button
            key={tab.label}
            onClick={() => navigate(tab.path)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              padding: '8px 0',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 20, filter: tab.active ? 'none' : 'grayscale(100%) opacity(0.5)' }}>
              {tab.icon}
            </span>
            <span
              style={{
                fontFamily: F.syne,
                fontWeight: 400,
                fontSize: 10,
                color: tab.active ? C.accentLime : C.textMuted,
              }}
            >
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
