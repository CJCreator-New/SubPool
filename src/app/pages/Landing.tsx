import React from 'react';
import { useNavigate } from 'react-router';
import { C, F } from '../tokens';
import { Button } from '../components/subpool/Button';
import { PoolCard } from '../components/subpool/PoolCard';

export function Landing() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: C.bgBase,
        display: 'flex',
        overflow: 'hidden',
      }}
    >
      {/* LEFT HALF */}
      <div
        style={{
          flex: 1,
          padding: 80,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* Top: Logo */}
        <div>
          <h1 style={{ margin: 0, fontFamily: F.syne, fontWeight: 800, fontSize: 24 }}>
            <span style={{ color: C.textPrimary }}>Sub</span>
            <span style={{ color: C.accentLime }}>Pool</span>
          </h1>
        </div>

        {/* Center content (vertically centered) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* Hero text */}
          <div style={{ marginBottom: 40 }}>
            <h2
              style={{
                margin: 0,
                fontFamily: F.syne,
                fontWeight: 800,
                fontSize: 58,
                lineHeight: 1.1,
                color: C.textPrimary,
              }}
            >
              Share subscriptions.
            </h2>
            <h2
              style={{
                margin: '8px 0 0',
                fontFamily: F.syne,
                fontWeight: 800,
                fontSize: 58,
                lineHeight: 1.1,
                color: C.accentLime,
              }}
            >
              Split the cost.
            </h2>
            <p
              style={{
                margin: '16px 0 0',
                fontFamily: F.syne,
                fontWeight: 400,
                fontSize: 20,
                color: C.textMuted,
              }}
            >
              No awkward group chats.
            </p>
          </div>

          {/* Value props */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 48 }}>
            {[
              { emoji: '🎬', text: 'Access Netflix, Spotify, Figma & 25+ platforms' },
              { emoji: '💸', text: 'Save 40–75% vs solo pricing' },
              { emoji: '⭐', text: 'Rated, verified strangers only' },
            ].map((prop, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 20 }}>{prop.emoji}</span>
                <span style={{ fontFamily: F.syne, fontWeight: 400, fontSize: 15, color: C.textPrimary }}>
                  {prop.text}
                </span>
              </div>
            ))}
          </div>

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <Button
              variant="primary"
              style={{ height: 48, padding: '0 32px', fontSize: 15 }}
              onClick={() => navigate('/')}
            >
              Get Started
            </Button>
            <Button
              variant="ghost"
              style={{ height: 48, padding: '0 32px', fontSize: 15 }}
              onClick={() => navigate('/')}
            >
              Sign In
            </Button>
          </div>

          {/* Footer text */}
          <p style={{ margin: 0, fontFamily: F.mono, fontWeight: 400, fontSize: 11, color: C.textMuted }}>
            Free to join · No credit card needed
          </p>
        </div>

        {/* Bottom spacer */}
        <div />
      </div>

      {/* RIGHT HALF */}
      <div
        style={{
          flex: 1,
          backgroundColor: C.bgSurface,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Lime glow ellipse */}
        <div
          style={{
            position: 'absolute',
            width: 400,
            height: 400,
            borderRadius: '50%',
            backgroundColor: C.accentLime,
            opacity: 0.08,
            filter: 'blur(80px)',
            pointerEvents: 'none',
          }}
        />

        {/* Staggered pool cards */}
        <div style={{ position: 'relative', width: 320 }}>
          {/* Card 1: Netflix (rotated -2deg) */}
          <div
            style={{
              position: 'absolute',
              top: -60,
              left: -40,
              width: 320,
              transform: 'rotate(-2deg)',
              zIndex: 3,
            }}
          >
            <PoolCard
              status="open"
              platformEmoji="🎬"
              platformName="Netflix"
              planName="Standard 4K"
              platformColor="#1A0203"
              slotsTotal={4}
              slotsFilled={3}
              pricePerSlot="4.99"
              ownerInitials="RK"
              ownerName="Riya K"
              ownerColor={C.accentLime}
            />
          </div>

          {/* Card 2: ChatGPT (0deg) */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 320,
              transform: 'rotate(0deg)',
              zIndex: 2,
            }}
          >
            <PoolCard
              status="open"
              platformEmoji="🤖"
              platformName="ChatGPT"
              planName="Plus"
              platformColor="#031A14"
              slotsTotal={2}
              slotsFilled={1}
              pricePerSlot="9.99"
              ownerInitials="MW"
              ownerName="Marcus W"
              ownerColor="#00D1C1"
            />
          </div>

          {/* Card 3: Figma (rotated 3deg) */}
          <div
            style={{
              position: 'absolute',
              top: 60,
              left: 40,
              width: 320,
              transform: 'rotate(3deg)',
              zIndex: 1,
            }}
          >
            <PoolCard
              status="full"
              platformEmoji="🎨"
              platformName="Figma"
              planName="Professional"
              platformColor="#140A24"
              slotsTotal={5}
              slotsFilled={5}
              pricePerSlot="6.00"
              ownerInitials="SD"
              ownerName="Sam D"
              ownerColor="#7B61FF"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
