import React from 'react';
import { useNavigate } from 'react-router';
import { C, F } from '../tokens';
import { Button } from '../components/subpool/Button';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 20,
        textAlign: 'center',
        padding: 40,
      }}
    >
      {/* Glitchy 404 */}
      <div style={{ position: 'relative', marginBottom: 8 }}>
        <span
          style={{
            fontFamily: F.syne,
            fontWeight: 800,
            fontSize: 96,
            color: C.textPrimary,
            lineHeight: 1,
            userSelect: 'none',
            opacity: 0.06,
          }}
        >
          404
        </span>
        <span
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: F.syne,
            fontWeight: 800,
            fontSize: 96,
            color: C.accentLime,
            lineHeight: 1,
          }}
        >
          404
        </span>
      </div>

      <div>
        <h1
          style={{
            margin: '0 0 10px',
            fontFamily: F.syne,
            fontWeight: 800,
            fontSize: 24,
            color: C.textPrimary,
          }}
        >
          Pool not found
        </h1>
        <p
          style={{
            margin: 0,
            fontFamily: F.mono,
            fontSize: 13,
            color: C.textMuted,
            maxWidth: 340,
            lineHeight: 1.6,
          }}
        >
          This page doesn't exist, or the pool has been closed. Head back to discover active pools.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <Button variant="primary" onClick={() => navigate('/')}>
          Browse Pools
        </Button>
        <Button variant="ghost" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>

      {/* Decorative grid lines */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(200,241,53,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(200,241,53,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
          zIndex: -1,
        }}
      />
    </div>
  );
}
