import React, { useState } from 'react';
import { C, F } from '../../tokens';
import { StatusPill } from './StatusPill';
import { SlotFillBar } from './SlotFillBar';
import { Avatar } from './Avatar';
import { OverflowMenu } from './OverflowMenu';

interface PoolCardProps {
  status: 'open' | 'full';
  platformEmoji: string;
  platformName: string;
  planName: string;
  platformColor?: string;
  slotsTotal?: number;
  slotsFilled?: number;
  pricePerSlot: string;
  ownerInitials: string;
  ownerName: string;
  ownerColor?: string;
  isFlagged?: boolean;
  onReport?: () => void;
}

export function PoolCard({
  status,
  platformEmoji,
  platformName,
  planName,
  platformColor = 'rgba(200,241,53,0.15)',
  slotsTotal = 4,
  slotsFilled = 2,
  pricePerSlot,
  ownerInitials,
  ownerName,
  ownerColor = C.accentLime,
  isFlagged = false,
  onReport,
}: PoolCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const menuOptions = [
    {
      label: 'Share this pool',
      onClick: () => console.log('Share'),
    },
    {
      label: 'Save for later',
      onClick: () => console.log('Save'),
    },
    {
      isDivider: true,
      label: '',
      onClick: () => {},
    },
    {
      icon: '🚩',
      label: 'Report this pool',
      isDanger: true,
      onClick: () => onReport?.(),
    },
  ];

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: '100%',
        backgroundColor: C.bgSurface,
        border: `1px solid ${isHovered ? C.borderAccent : C.borderDefault}`,
        borderRadius: 6,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        position: 'relative',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: isHovered ? '0 8px 32px rgba(0,0,0,0.4)' : 'none',
        opacity: isFlagged ? 0.5 : 1,
      }}
    >
      {/* Flagged banner */}
      {isFlagged && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: '#FFB800',
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            borderTopLeftRadius: 6,
            borderTopRightRadius: 6,
          }}
        >
          <span style={{ fontSize: 12 }}>⚠️</span>
          <span
            style={{
              fontFamily: F.mono,
              fontWeight: 600,
              fontSize: 11,
              color: C.bgBase,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Under Review
          </span>
        </div>
      )}

      {/* Status pill — top right */}
      <div style={{ position: 'absolute', top: isFlagged ? 42 : 14, right: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
        {isHovered && !isFlagged && (
          <div onClick={(e) => e.stopPropagation()}>
            <OverflowMenu options={menuOptions} />
          </div>
        )}
        <StatusPill variant={status} />
      </div>

      {/* Content wrapper - add top padding if flagged */}
      <div style={{ paddingTop: isFlagged ? 28 : 0 }}>
        {/* Row 1: Platform */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 8,
              backgroundColor: platformColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              flexShrink: 0,
            }}
          >
            {platformEmoji}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontFamily: F.syne, fontWeight: 800, fontSize: 17, color: C.textPrimary }}>
              {platformName}
            </span>
            <span style={{ fontFamily: F.mono, fontWeight: 400, fontSize: 11, color: C.textMuted }}>
              {planName}
            </span>
          </div>
        </div>

        {/* Row 2: Slot fill bar */}
        <SlotFillBar filled={slotsFilled} total={slotsTotal} />

        {/* Row 3: Slots filled label */}
        <span style={{ fontFamily: F.mono, fontWeight: 400, fontSize: 11, color: C.textMuted, marginTop: -8 }}>
          {slotsFilled}/{slotsTotal} slots filled
        </span>

        {/* Row 4: Price + Owner */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontFamily: F.syne, fontWeight: 800, fontSize: 22, color: C.textPrimary }}>
              ${pricePerSlot}
            </span>
            <span style={{ fontFamily: F.mono, fontWeight: 400, fontSize: 11, color: C.textMuted }}>
              /mo per slot
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Avatar initials={ownerInitials} size="sm" color={ownerColor} />
            <span style={{ fontFamily: F.mono, fontWeight: 400, fontSize: 11, color: C.textMuted }}>
              {ownerName}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}