import React, { useState } from 'react';
import { C, F } from '../tokens';
import { Button } from '../components/subpool/Button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

export function MobileCreatePool() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [formData, setFormData] = useState({
    plan: '',
    totalCost: '',
    slots: '',
  });

  const platforms = [
    { icon: '🎬', name: 'Netflix' },
    { icon: '🎵', name: 'Spotify' },
    { icon: '🎨', name: 'Figma' },
    { icon: '▶️', name: 'YouTube' },
    { icon: '🤖', name: 'ChatGPT' },
    { icon: '📋', name: 'Notion' },
    { icon: '☁️', name: 'Adobe CC' },
    { icon: '🎮', name: 'Xbox' },
    { icon: '🎧', name: 'Apple Music' },
  ];

  const handleContinue = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Submit and navigate
      navigate('/my-pools');
    }
  };

  const canContinue = () => {
    if (step === 1) return selectedPlatform !== '';
    if (step === 2)
      return formData.plan && formData.totalCost && formData.slots;
    return true;
  };

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
          onClick={() => {
            if (step > 1) {
              setStep(step - 1);
            } else {
              navigate(-1);
            }
          }}
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
          Create a Pool
        </span>
      </div>

      {/* Step indicator */}
      <div
        style={{
          padding: '24px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
        }}
      >
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor:
                  s === step
                    ? C.accentLime
                    : s < step
                    ? C.accentLime
                    : C.bgSurface,
                border: `2px solid ${
                  s <= step ? C.accentLime : C.borderDefault
                }`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: F.mono,
                fontWeight: 700,
                fontSize: 14,
                color: s <= step ? C.bgBase : C.textMuted,
                transition: 'all 0.3s ease',
              }}
            >
              {s < step ? '✓' : s}
            </div>
            {s < 3 && (
              <div
                style={{
                  width: 40,
                  height: 2,
                  backgroundColor: s < step ? C.accentLime : C.borderDefault,
                  transition: 'all 0.3s ease',
                }}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: 20 }}>
        {/* Step 1: Platform picker */}
        {step === 1 && (
          <div>
            <h2
              style={{
                fontFamily: F.syne,
                fontWeight: 700,
                fontSize: 20,
                color: C.textPrimary,
                marginBottom: 8,
              }}
            >
              Choose Platform
            </h2>
            <p
              style={{
                fontFamily: F.syne,
                fontSize: 14,
                color: C.textMuted,
                marginBottom: 24,
              }}
            >
              Select the subscription you want to share
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 12,
              }}
            >
              {platforms.map((platform) => {
                const isSelected = selectedPlatform === platform.name;
                return (
                  <button
                    key={platform.name}
                    onClick={() => setSelectedPlatform(platform.name)}
                    style={{
                      padding: '20px 12px',
                      backgroundColor: isSelected
                        ? 'rgba(200,241,53,0.15)'
                        : C.bgSurface,
                      border: `1px solid ${
                        isSelected ? C.accentLime : C.borderDefault
                      }`,
                      borderRadius: 8,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 10,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{ fontSize: 32 }}>{platform.icon}</span>
                    <span
                      style={{
                        fontFamily: F.syne,
                        fontSize: 12,
                        fontWeight: 600,
                        color: isSelected ? C.textPrimary : C.textMuted,
                      }}
                    >
                      {platform.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Form */}
        {step === 2 && (
          <div>
            <h2
              style={{
                fontFamily: F.syne,
                fontWeight: 700,
                fontSize: 20,
                color: C.textPrimary,
                marginBottom: 8,
              }}
            >
              Pool Details
            </h2>
            <p
              style={{
                fontFamily: F.syne,
                fontSize: 14,
                color: C.textMuted,
                marginBottom: 24,
              }}
            >
              Tell us about your {selectedPlatform} subscription
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Plan name */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: F.syne,
                    fontWeight: 600,
                    fontSize: 13,
                    color: C.textPrimary,
                    marginBottom: 10,
                  }}
                >
                  Plan Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Standard, Premium, Pro"
                  value={formData.plan}
                  onChange={(e) =>
                    setFormData({ ...formData, plan: e.target.value })
                  }
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    backgroundColor: C.bgSurface,
                    border: `1px solid ${C.borderDefault}`,
                    borderRadius: 8,
                    color: C.textPrimary,
                    fontFamily: F.syne,
                    fontSize: 14,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Total cost */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: F.syne,
                    fontWeight: 600,
                    fontSize: 13,
                    color: C.textPrimary,
                    marginBottom: 10,
                  }}
                >
                  Total Monthly Cost
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={formData.totalCost}
                  onChange={(e) =>
                    setFormData({ ...formData, totalCost: e.target.value })
                  }
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    backgroundColor: C.bgSurface,
                    border: `1px solid ${C.borderDefault}`,
                    borderRadius: 8,
                    color: C.textPrimary,
                    fontFamily: F.mono,
                    fontSize: 14,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Total slots */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: F.syne,
                    fontWeight: 600,
                    fontSize: 13,
                    color: C.textPrimary,
                    marginBottom: 10,
                  }}
                >
                  Total Slots
                </label>
                <input
                  type="number"
                  placeholder="How many people can use this?"
                  value={formData.slots}
                  onChange={(e) =>
                    setFormData({ ...formData, slots: e.target.value })
                  }
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    backgroundColor: C.bgSurface,
                    border: `1px solid ${C.borderDefault}`,
                    borderRadius: 8,
                    color: C.textPrimary,
                    fontFamily: F.mono,
                    fontSize: 14,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Price per slot preview */}
              {formData.totalCost && formData.slots && (
                <div
                  style={{
                    padding: 16,
                    backgroundColor: 'rgba(200,241,53,0.1)',
                    border: `1px solid ${C.borderAccent}`,
                    borderRadius: 8,
                  }}
                >
                  <div
                    style={{
                      fontFamily: F.mono,
                      fontSize: 11,
                      color: C.textMuted,
                      marginBottom: 6,
                    }}
                  >
                    PRICE PER SLOT
                  </div>
                  <div
                    style={{
                      fontFamily: F.mono,
                      fontWeight: 700,
                      fontSize: 20,
                      color: C.accentLime,
                    }}
                  >
                    $
                    {(
                      parseFloat(formData.totalCost) /
                      parseInt(formData.slots)
                    ).toFixed(2)}
                    /month
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Preview */}
        {step === 3 && (
          <div>
            <h2
              style={{
                fontFamily: F.syne,
                fontWeight: 700,
                fontSize: 20,
                color: C.textPrimary,
                marginBottom: 8,
              }}
            >
              Preview & Publish
            </h2>
            <p
              style={{
                fontFamily: F.syne,
                fontSize: 14,
                color: C.textMuted,
                marginBottom: 24,
              }}
            >
              Review your pool before publishing
            </p>

            {/* Preview card */}
            <div
              style={{
                backgroundColor: C.bgSurface,
                border: `1px solid ${C.borderDefault}`,
                borderRadius: 8,
                padding: 20,
                marginBottom: 24,
              }}
            >
              <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 8,
                    backgroundColor: C.bgBase,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28,
                  }}
                >
                  {platforms.find((p) => p.name === selectedPlatform)?.icon}
                </div>

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: F.syne,
                      fontWeight: 700,
                      fontSize: 18,
                      color: C.textPrimary,
                      marginBottom: 4,
                    }}
                  >
                    {selectedPlatform}
                  </div>
                  <div
                    style={{
                      fontFamily: F.syne,
                      fontSize: 14,
                      color: C.textMuted,
                    }}
                  >
                    {formData.plan}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <DetailRow
                  label="Price per slot"
                  value={`$${(
                    parseFloat(formData.totalCost) / parseInt(formData.slots)
                  ).toFixed(2)}/month`}
                />
                <DetailRow label="Total cost" value={`$${formData.totalCost}`} />
                <DetailRow label="Total slots" value={formData.slots} />
                <DetailRow label="Status" value="Active" highlight />
              </div>
            </div>

            {/* Info message */}
            <div
              style={{
                padding: 16,
                backgroundColor: C.bgSurface,
                border: `1px solid ${C.borderDefault}`,
                borderRadius: 8,
                display: 'flex',
                gap: 12,
              }}
            >
              <span style={{ fontSize: 20 }}>ℹ️</span>
              <p
                style={{
                  fontFamily: F.syne,
                  fontSize: 13,
                  color: C.textMuted,
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                Your pool will be visible to all SubPool members. You'll review and
                approve requests before adding members.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Continue button (sticky) */}
      <div
        style={{
          padding: 20,
          backgroundColor: C.bgSurface,
          borderTop: `1px solid ${C.borderDefault}`,
          paddingBottom: 'calc(20px + env(safe-area-inset-bottom))',
        }}
      >
        <Button
          variant="primary"
          onClick={handleContinue}
          style={{
            width: '100%',
            height: 52,
            fontSize: 15,
            opacity: canContinue() ? 1 : 0.5,
          }}
        >
          {step === 3 ? 'Publish Pool' : 'Continue'}
        </Button>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <span
        style={{
          fontFamily: F.syne,
          fontSize: 13,
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
          color: highlight ? C.accentLime : C.textPrimary,
        }}
      >
        {value}
      </span>
    </div>
  );
}
