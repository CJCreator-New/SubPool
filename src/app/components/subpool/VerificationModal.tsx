import React, { useState } from 'react';
import { C, F } from '../../tokens';
import { Button } from './Button';

interface VerificationModalProps {
  step?: 1 | 2 | 3; // optional: if provided, forces that step (for external demos)
  onClose: () => void;
  onComplete?: () => void; // called when verification is successfully submitted
}

export function VerificationModal({ step: forcedStep, onClose, onComplete }: VerificationModalProps) {
  const [internalStep, setInternalStep] = useState<1 | 2 | 3>(1);
  const step = forcedStep ?? internalStep;

  const goNext = () => {
    if (forcedStep) return; // externally controlled
    if (internalStep < 3) {
      setInternalStep((s) => (s + 1) as 1 | 2 | 3);
    }
  };

  const handleComplete = () => {
    onComplete?.();
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 480,
          backgroundColor: C.bgSurface,
          border: `1px solid ${C.borderDefault}`,
          borderRadius: 10,
          padding: 32,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 32px 80px rgba(0,0,0,0.9)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 30,
            height: 30,
            borderRadius: '50%',
            backgroundColor: C.bgBase,
            border: `1px solid ${C.borderDefault}`,
            color: C.textMuted,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
          }}
        >
          ✕
        </button>

        {step === 1 && <Step1 onNext={goNext} onClose={onClose} />}
        {step === 2 && <Step2 onNext={goNext} />}
        {step === 3 && <Step3 onComplete={handleComplete} />}

        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
          {[1, 2, 3].map((dotStep) => (
            <div
              key={dotStep}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: dotStep === step ? C.accentLime : C.borderDefault,
                transition: 'background-color 0.2s ease',
              }}
            />
          ))}
        </div>
        <span
          style={{
            fontFamily: F.mono,
            fontWeight: 400,
            fontSize: 10,
            color: C.textMuted,
            textAlign: 'center',
            marginTop: 8,
          }}
        >
          Step {step} of 3
        </span>
      </div>
    </div>
  );
}

// ─── STEP 1: Intro ────────────────────────────────────────────────────────────

function Step1({ onNext, onClose }: { onNext: () => void; onClose: () => void }) {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <path
            d="M24 4L8 10V24C8 34 16 42 24 44C32 42 40 34 40 24V10L24 4Z"
            stroke={C.accentLime}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M18 24L22 28L30 20"
            stroke={C.accentLime}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h2
        style={{
          margin: '0 0 12px',
          fontFamily: F.syne,
          fontWeight: 800,
          fontSize: 22,
          color: C.textPrimary,
          textAlign: 'center',
        }}
      >
        Get Verified
      </h2>

      <p
        style={{
          margin: '0 0 24px',
          fontFamily: F.syne,
          fontWeight: 400,
          fontSize: 14,
          color: C.textMuted,
          textAlign: 'center',
          lineHeight: 1.6,
        }}
      >
        Verified members get 3× more join approvals and unlock higher-value pools.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
        {[
          'Verified badge on your profile',
          'Access to premium pools (Adobe CC, enterprise tools)',
          'Higher trust score = faster approvals',
        ].map((benefit, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <span
              style={{
                fontSize: 12,
                color: C.accentLime,
                flexShrink: 0,
                marginTop: 2,
                fontWeight: 700,
              }}
            >
              ✓
            </span>
            <span style={{ fontFamily: F.syne, fontWeight: 400, fontSize: 14, color: C.textPrimary }}>
              {benefit}
            </span>
          </div>
        ))}
      </div>

      <Button variant="primary" size="lg" style={{ width: '100%', marginBottom: 10 }} onClick={onNext}>
        Start Verification →
      </Button>
      <Button variant="ghost" style={{ width: '100%' }} onClick={onClose}>
        Maybe later
      </Button>
    </>
  );
}

// ─── STEP 2: Upload ID ────────────────────────────────────────────────────────

function Step2({ onNext }: { onNext: () => void }) {
  const [uploaded, setUploaded] = useState(false);
  const [useCamera, setUseCamera] = useState(false);

  return (
    <>
      <h2
        style={{
          margin: '0 0 8px',
          fontFamily: F.syne,
          fontWeight: 800,
          fontSize: 22,
          color: C.textPrimary,
          textAlign: 'center',
        }}
      >
        Upload your ID
      </h2>
      <p
        style={{
          margin: '0 0 24px',
          fontFamily: F.syne,
          fontWeight: 400,
          fontSize: 13,
          color: C.textMuted,
          textAlign: 'center',
          lineHeight: 1.5,
        }}
      >
        We'll keep your information secure and private.
      </p>

      <div
        onClick={() => setUploaded(true)}
        style={{
          border: `2px dashed ${uploaded ? C.accentLime : C.borderDefault}`,
          borderRadius: 8,
          padding: 40,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          cursor: 'pointer',
          transition: 'border-color 0.2s ease',
          marginBottom: 16,
          backgroundColor: uploaded ? 'rgba(200,241,53,0.04)' : 'transparent',
        }}
        onMouseEnter={(e) => {
          if (!uploaded) e.currentTarget.style.borderColor = 'rgba(200,241,53,0.4)';
        }}
        onMouseLeave={(e) => {
          if (!uploaded) e.currentTarget.style.borderColor = C.borderDefault;
        }}
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path
            d="M16 22V10M16 10L12 14M16 10L20 14"
            stroke={uploaded ? C.accentLime : C.textMuted}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8 18V24C8 25.1 8.9 26 10 26H22C23.1 26 24 25.1 24 24V18"
            stroke={uploaded ? C.accentLime : C.textMuted}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {uploaded ? (
          <>
            <span style={{ fontFamily: F.syne, fontWeight: 600, fontSize: 14, color: C.accentLime }}>
              ✓ drivers_license.jpg uploaded
            </span>
            <span style={{ fontFamily: F.mono, fontWeight: 400, fontSize: 11, color: C.textMuted }}>
              Click to replace
            </span>
          </>
        ) : (
          <>
            <span style={{ fontFamily: F.syne, fontWeight: 400, fontSize: 14, color: C.textPrimary }}>
              Drag your ID here or click to browse
            </span>
            <span style={{ fontFamily: F.mono, fontWeight: 400, fontSize: 11, color: C.textMuted }}>
              Accepted: Passport, Driver's License, National ID
            </span>
          </>
        )}
      </div>

      <div
        onClick={() => setUseCamera(!useCamera)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, cursor: 'pointer' }}
      >
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: 3,
            border: `1px solid ${useCamera ? C.accentLime : C.borderDefault}`,
            backgroundColor: useCamera ? C.accentLime : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease',
            flexShrink: 0,
          }}
        >
          {useCamera && <span style={{ fontSize: 10, color: C.bgBase }}>✓</span>}
        </div>
        <span style={{ fontFamily: F.syne, fontWeight: 400, fontSize: 13, color: C.textPrimary }}>
          I'd rather use my camera instead
        </span>
      </div>

      <Button
        variant="primary"
        size="lg"
        style={{ width: '100%' }}
        forceState={uploaded ? 'default' : 'disabled'}
        onClick={uploaded ? onNext : undefined}
      >
        Continue →
      </Button>
    </>
  );
}

// ─── STEP 3: Success ──────────────────────────────────────────────────────────

function Step3({ onComplete }: { onComplete: () => void }) {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            backgroundColor: 'rgba(200,241,53,0.1)',
            border: `2px solid ${C.accentLime}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'pulse 2s ease-in-out infinite',
          }}
        >
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path
              d="M10 18L16 24L26 12"
              stroke={C.accentLime}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <h2
        style={{
          margin: '0 0 12px',
          fontFamily: F.syne,
          fontWeight: 800,
          fontSize: 22,
          color: C.textPrimary,
          textAlign: 'center',
        }}
      >
        Verification submitted
      </h2>

      <p
        style={{
          margin: '0 0 28px',
          fontFamily: F.syne,
          fontWeight: 400,
          fontSize: 14,
          color: C.textMuted,
          textAlign: 'center',
          lineHeight: 1.6,
        }}
      >
        We'll review within 24 hours. You'll get a notification when your badge is live.
      </p>

      <Button variant="primary" size="lg" style={{ width: '100%' }} onClick={onComplete}>
        Back to SubPool ✓
      </Button>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
      `}</style>
    </>
  );
}
