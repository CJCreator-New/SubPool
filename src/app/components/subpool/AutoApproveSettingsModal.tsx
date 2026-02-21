import React, { useState } from 'react';
import { C, F } from '../../tokens';
import { Button } from './Button';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';

interface AutoApproveRule {
  id: string;
  enabled: boolean;
  label: string;
  description?: string;
  type: 'slider' | 'toggle' | 'input' | 'select';
  value?: number | string;
}

interface AutoApproveSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AutoApproveSettingsModal({ isOpen, onClose }: AutoApproveSettingsModalProps) {
  const [rules, setRules] = useState<AutoApproveRule[]>([
    {
      id: 'rating',
      enabled: true,
      label: 'Minimum rating',
      type: 'slider',
      value: 4.0,
    },
    {
      id: 'verified',
      enabled: true,
      label: 'Identity verified users only',
      description: 'Only approve users with the verified shield badge',
      type: 'toggle',
    },
    {
      id: 'account-age',
      enabled: false,
      label: 'Minimum account age',
      type: 'input',
      value: 30,
    },
    {
      id: 'payment-history',
      enabled: true,
      label: 'Payment reliability',
      type: 'select',
      value: '90%+ payment rate',
    },
    {
      id: 'prior-pools',
      enabled: false,
      label: 'Has been in at least',
      type: 'input',
      value: 1,
    },
  ]);

  const toggleRule = (id: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const updateRuleValue = (id: string, value: number | string) => {
    setRules(rules.map(r => r.id === id ? { ...r, value } : r));
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 600,
          maxHeight: '90vh',
          backgroundColor: C.bgSurface,
          borderRadius: 8,
          border: `1px solid ${C.borderDefault}`,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px 24px 20px',
            borderBottom: `1px solid ${C.borderDefault}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <h2
              style={{
                fontFamily: F.syne,
                fontWeight: 700,
                fontSize: 22,
                color: C.textPrimary,
                margin: 0,
              }}
            >
              Auto-Approve Rules
            </h2>
            <div
              style={{
                padding: '3px 8px',
                borderRadius: 4,
                backgroundColor: C.accentLime,
                color: C.bgBase,
                fontFamily: F.mono,
                fontWeight: 700,
                fontSize: 9,
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
              }}
            >
              PRO
            </div>
          </div>
          <p
            style={{
              fontFamily: F.syne,
              fontSize: 14,
              color: C.textMuted,
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Set criteria for automatic approvals. Requests matching all rules get instantly approved.
          </p>
        </div>

        {/* Rule cards - scrollable */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {/* Rule 1 - Minimum Rating */}
          <div
            style={{
              backgroundColor: C.bgBase,
              border: `1px solid ${C.borderDefault}`,
              borderRadius: 6,
              padding: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <Switch
                checked={rules[0].enabled}
                onCheckedChange={() => toggleRule('rating')}
              />
              <span
                style={{
                  fontFamily: F.syne,
                  fontWeight: 600,
                  fontSize: 14,
                  color: rules[0].enabled ? C.textPrimary : C.textMuted,
                }}
              >
                {rules[0].label}
              </span>
            </div>
            {rules[0].enabled && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 16 }}>⭐⭐⭐⭐</span>
                  <span
                    style={{
                      fontFamily: F.mono,
                      fontWeight: 500,
                      fontSize: 13,
                      color: C.accentLime,
                    }}
                  >
                    {rules[0].value} or above
                  </span>
                </div>
                <Slider
                  value={[rules[0].value as number]}
                  onValueChange={([v]) => updateRuleValue('rating', v)}
                  min={1}
                  max={5}
                  step={0.5}
                  className="auto-approve-slider"
                />
              </div>
            )}
          </div>

          {/* Rule 2 - Verified users only */}
          <div
            style={{
              backgroundColor: C.bgBase,
              border: `1px solid ${C.borderDefault}`,
              borderRadius: 6,
              padding: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <Switch
                checked={rules[1].enabled}
                onCheckedChange={() => toggleRule('verified')}
              />
              <span
                style={{
                  fontFamily: F.syne,
                  fontWeight: 600,
                  fontSize: 14,
                  color: rules[1].enabled ? C.textPrimary : C.textMuted,
                }}
              >
                {rules[1].label}
              </span>
            </div>
            {rules[1].enabled && (
              <p
                style={{
                  fontFamily: F.syne,
                  fontSize: 12,
                  color: C.textMuted,
                  margin: '8px 0 0 0',
                  paddingLeft: 44,
                  lineHeight: 1.5,
                }}
              >
                {rules[1].description}
              </p>
            )}
          </div>

          {/* Rule 3 - Account age */}
          <div
            style={{
              backgroundColor: C.bgBase,
              border: `1px solid ${C.borderDefault}`,
              borderRadius: 6,
              padding: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <Switch
                checked={rules[2].enabled}
                onCheckedChange={() => toggleRule('account-age')}
              />
              <span
                style={{
                  fontFamily: F.syne,
                  fontWeight: 600,
                  fontSize: 14,
                  color: rules[2].enabled ? C.textPrimary : C.textMuted,
                }}
              >
                {rules[2].label}
              </span>
            </div>
            {rules[2].enabled && (
              <div style={{ paddingLeft: 44, display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="number"
                  value={rules[2].value as number}
                  onChange={(e) => updateRuleValue('account-age', parseInt(e.target.value))}
                  style={{
                    width: 80,
                    padding: '8px 12px',
                    backgroundColor: C.bgSurface,
                    border: `1px solid ${C.borderDefault}`,
                    borderRadius: 4,
                    color: C.textPrimary,
                    fontFamily: F.mono,
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
                <span
                  style={{
                    fontFamily: F.syne,
                    fontSize: 13,
                    color: C.textMuted,
                  }}
                >
                  days
                </span>
              </div>
            )}
          </div>

          {/* Rule 4 - Payment history */}
          <div
            style={{
              backgroundColor: C.bgBase,
              border: `1px solid ${C.borderDefault}`,
              borderRadius: 6,
              padding: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <Switch
                checked={rules[3].enabled}
                onCheckedChange={() => toggleRule('payment-history')}
              />
              <span
                style={{
                  fontFamily: F.syne,
                  fontWeight: 600,
                  fontSize: 14,
                  color: rules[3].enabled ? C.textPrimary : C.textMuted,
                }}
              >
                {rules[3].label}
              </span>
            </div>
            {rules[3].enabled && (
              <div style={{ paddingLeft: 44 }}>
                <select
                  value={rules[3].value as string}
                  onChange={(e) => updateRuleValue('payment-history', e.target.value)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: C.bgSurface,
                    border: `1px solid ${C.borderDefault}`,
                    borderRadius: 4,
                    color: C.textPrimary,
                    fontFamily: F.syne,
                    fontSize: 13,
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="90%+ payment rate">90%+ payment rate</option>
                  <option value="80%+ payment rate">80%+ payment rate</option>
                  <option value="70%+ payment rate">70%+ payment rate</option>
                  <option value="100% payment rate">100% payment rate</option>
                </select>
              </div>
            )}
          </div>

          {/* Rule 5 - Prior pools */}
          <div
            style={{
              backgroundColor: C.bgBase,
              border: `1px solid ${C.borderDefault}`,
              borderRadius: 6,
              padding: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <Switch
                checked={rules[4].enabled}
                onCheckedChange={() => toggleRule('prior-pools')}
              />
              <span
                style={{
                  fontFamily: F.syne,
                  fontWeight: 600,
                  fontSize: 14,
                  color: rules[4].enabled ? C.textPrimary : C.textMuted,
                }}
              >
                {rules[4].label}
              </span>
            </div>
            {rules[4].enabled && (
              <div style={{ paddingLeft: 44, display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="number"
                  value={rules[4].value as number}
                  onChange={(e) => updateRuleValue('prior-pools', parseInt(e.target.value))}
                  style={{
                    width: 80,
                    padding: '8px 12px',
                    backgroundColor: C.bgSurface,
                    border: `1px solid ${C.borderDefault}`,
                    borderRadius: 4,
                    color: C.textPrimary,
                    fontFamily: F.mono,
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
                <span
                  style={{
                    fontFamily: F.syne,
                    fontSize: 13,
                    color: C.textMuted,
                  }}
                >
                  previous pool(s)
                </span>
              </div>
            )}
          </div>

          {/* Preview section */}
          <div
            style={{
              backgroundColor: 'rgba(200,241,53,0.08)',
              border: `1px solid ${C.borderAccent}`,
              borderRadius: 6,
              padding: 20,
              marginTop: 12,
            }}
          >
            <p
              style={{
                fontFamily: F.syne,
                fontSize: 13,
                color: C.textMuted,
                margin: '0 0 12px 0',
              }}
            >
              Based on your rules, approximately:
            </p>
            <div
              style={{
                fontFamily: F.syne,
                fontWeight: 800,
                fontSize: 48,
                color: C.accentLime,
                lineHeight: 1,
                marginBottom: 8,
              }}
            >
              68%
            </div>
            <p
              style={{
                fontFamily: F.syne,
                fontSize: 14,
                color: C.textPrimary,
                margin: '0 0 12px 0',
              }}
            >
              of current requestors would auto-qualify
            </p>
            <p
              style={{
                fontFamily: F.mono,
                fontSize: 11,
                color: C.textMuted,
                margin: 0,
              }}
            >
              12 users in your request queue match · 4 would be auto-approved
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: 24,
            borderTop: `1px solid ${C.borderDefault}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <Button variant="ghost" onClick={onClose}>
            Reset to manual
          </Button>
          <Button variant="primary" onClick={onClose}>
            Save Rules
          </Button>
        </div>
      </div>
    </div>
  );
}
