import React, { useState } from 'react';
import { C, F } from '../../tokens';
import { Button } from './Button';

type ReportReason =
  | 'fake'
  | 'wrong-details'
  | 'fraud'
  | 'pricing'
  | 'inappropriate'
  | 'other'
  | null;

interface ReportModalProps {
  targetType: 'pool' | 'user';
  targetName: string;
  onClose: () => void;
}

export function ReportModal({ targetType, targetName, onClose }: ReportModalProps) {
  const [step, setStep] = useState<'form' | 'confirmation'>('form');
  const [selectedReason, setSelectedReason] = useState<ReportReason>(null);
  const [details, setDetails] = useState('');

  const reasons = [
    { value: 'fake' as ReportReason, label: 'Fake or misleading listing' },
    { value: 'wrong-details' as ReportReason, label: "Platform doesn't exist / wrong details" },
    { value: 'fraud' as ReportReason, label: 'Suspected fraud or scam' },
    { value: 'pricing' as ReportReason, label: 'Pricing abuse (overcharging)' },
    { value: 'inappropriate' as ReportReason, label: 'Inappropriate content' },
    { value: 'other' as ReportReason, label: 'Other' },
  ];

  const handleSubmit = () => {
    if (selectedReason) {
      setStep('confirmation');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
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
          width: 520,
          backgroundColor: C.bgSurface,
          border: `1px solid ${C.borderDefault}`,
          borderRadius: 6,
          padding: 32,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 64px rgba(0,0,0,0.8)',
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
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: 'transparent',
            border: 'none',
            color: C.textMuted,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
          }}
        >
          ✕
        </button>

        {step === 'form' && (
          <>
            {/* Heading */}
            <h2
              style={{
                margin: '0 0 8px',
                fontFamily: F.syne,
                fontWeight: 800,
                fontSize: 22,
                color: C.textPrimary,
              }}
            >
              Report a {targetType === 'pool' ? 'Pool' : 'User'}
            </h2>
            <p
              style={{
                margin: '0 0 28px',
                fontFamily: F.mono,
                fontWeight: 400,
                fontSize: 12,
                color: C.textMuted,
                lineHeight: 1.5,
              }}
            >
              Help us keep SubPool safe. Reports are reviewed within 24 hours.
            </p>

            {/* Radio button group */}
            <div style={{ marginBottom: 24 }}>
              {reasons.map((reason) => (
                <label
                  key={reason.value}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 0',
                    cursor: 'pointer',
                  }}
                >
                  {/* Custom radio button */}
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      border: `2px solid ${selectedReason === reason.value ? C.accentLime : C.borderDefault}`,
                      backgroundColor: 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'border-color 0.15s ease',
                      flexShrink: 0,
                    }}
                  >
                    {selectedReason === reason.value && (
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          backgroundColor: C.accentLime,
                        }}
                      />
                    )}
                  </div>
                  <input
                    type="radio"
                    name="reason"
                    value={reason.value}
                    checked={selectedReason === reason.value}
                    onChange={() => setSelectedReason(reason.value)}
                    style={{ display: 'none' }}
                  />
                  <span
                    style={{
                      fontFamily: F.syne,
                      fontWeight: 500,
                      fontSize: 14,
                      color: C.textPrimary,
                    }}
                  >
                    {reason.label}
                  </span>
                </label>
              ))}
            </div>

            {/* Text area */}
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: 'block',
                  fontFamily: F.mono,
                  fontWeight: 500,
                  fontSize: 11,
                  color: C.textMuted,
                  marginBottom: 8,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Additional details (optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Tell us more about what you saw..."
                style={{
                  width: '100%',
                  minHeight: 100,
                  padding: 12,
                  fontFamily: F.syne,
                  fontWeight: 400,
                  fontSize: 14,
                  color: C.textPrimary,
                  backgroundColor: C.bgBase,
                  border: `1px solid ${C.borderDefault}`,
                  borderRadius: 6,
                  resize: 'vertical',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = C.borderAccent;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = C.borderDefault;
                }}
              />
            </div>

            {/* Anonymous notice */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginBottom: 24,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M6 1L2 2.5V6C2 8.5 4 10.5 6 11C8 10.5 10 8.5 10 6V2.5L6 1Z"
                  stroke={C.textMuted}
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span
                style={{
                  fontFamily: F.mono,
                  fontWeight: 400,
                  fontSize: 11,
                  color: C.textMuted,
                }}
              >
                Your report is anonymous
              </span>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 12 }}>
              <Button
                variant="primary"
                style={{ flex: 1 }}
                forceState={selectedReason ? 'default' : 'disabled'}
                onClick={handleSubmit}
              >
                Submit Report
              </Button>
              <Button variant="ghost" style={{ flex: 1 }} onClick={onClose}>
                Cancel
              </Button>
            </div>
          </>
        )}

        {step === 'confirmation' && (
          <>
            {/* Success checkmark circle */}
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

            {/* Heading */}
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
              Report submitted
            </h2>

            {/* Body */}
            <p
              style={{
                margin: '0 0 28px',
                fontFamily: F.syne,
                fontWeight: 400,
                fontSize: 14,
                color: C.textMuted,
                textAlign: 'center',
                lineHeight: 1.5,
              }}
            >
              We'll investigate within 24 hours. If we find a violation, the {targetType} will be removed and you'll be notified.
            </p>

            {/* Button */}
            <Button variant="primary" style={{ width: '100%' }} onClick={onClose}>
              Back to browsing
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
