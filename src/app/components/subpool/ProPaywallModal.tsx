import React from 'react';
import { C, F } from '../../tokens';
import { Button } from './Button';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X } from 'lucide-react';

interface ProPaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

export function ProPaywallModal({ isOpen, onClose, onUpgrade }: ProPaywallModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(4px)',
            }}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 680,
              backgroundColor: C.bgBase,
              border: `1px solid ${C.borderDefault}`,
              borderRadius: 12,
              padding: '40px 32px 32px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
              overflow: 'hidden',
            }}
          >
            {/* Large Crown Emoji */}
            <div style={{ fontSize: 48, marginBottom: 16 }}>👑</div>

            <h2
              style={{
                fontFamily: F.syne,
                fontWeight: 800,
                fontSize: 22,
                color: C.textPrimary,
                margin: '0 0 8px',
                textAlign: 'center',
              }}
            >
              You've hit the free limit
            </h2>
            <p
              style={{
                fontFamily: F.syne,
                fontWeight: 400,
                fontSize: 14,
                color: C.textMuted,
                margin: '0 0 32px',
                textAlign: 'center',
                maxWidth: 400,
                lineHeight: 1.5,
              }}
            >
              Free accounts can list 1 pool. <br />
              Upgrade to Pro to list unlimited pools.
            </p>

            {/* Comparison Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, width: '100%', marginBottom: 32 }}>
              {/* Free Plan */}
              <div
                style={{
                  backgroundColor: C.bgSurface,
                  border: `1px solid ${C.borderDefault}`,
                  borderRadius: 6,
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ marginBottom: 20 }}>
                  <h3 style={{ margin: 0, fontFamily: F.syne, fontWeight: 700, fontSize: 16, color: C.textPrimary }}>Free</h3>
                  <div style={{ fontFamily: F.mono, fontSize: 14, color: C.textMuted }}>$0/mo</div>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                  <FeatureItem label="1 pool listed" included />
                  <FeatureItem label="Unlimited joining" included />
                  <FeatureItem label="Basic ledger" included />
                  <FeatureItem label="Priority placement" />
                  <FeatureItem label="Advanced analytics" />
                  <FeatureItem label="Auto-approve rules" />
                </div>

                <div
                  style={{
                    padding: '6px 12px',
                    border: `1px solid ${C.borderDefault}`,
                    borderRadius: 100,
                    color: C.textMuted,
                    fontFamily: F.mono,
                    fontSize: 10,
                    textTransform: 'uppercase',
                    textAlign: 'center',
                    width: 'fit-content',
                    margin: '0 auto',
                  }}
                >
                  Current plan
                </div>
              </div>

              {/* Pro Plan */}
              <div
                style={{
                  backgroundColor: 'rgba(200, 241, 53, 0.03)',
                  border: `1px solid ${C.accentLime}`,
                  borderRadius: 6,
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  boxShadow: '0 0 20px rgba(200, 241, 53, 0.1)',
                }}
              >
                <div style={{ marginBottom: 20 }}>
                  <h3 style={{ margin: 0, fontFamily: F.syne, fontWeight: 700, fontSize: 16, color: C.textPrimary }}>SubPool Pro</h3>
                  <div style={{ fontFamily: F.mono, fontSize: 18, color: C.accentLime, fontWeight: 600 }}>$4.99/mo</div>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                  <FeatureItem label="Unlimited pools" included pro />
                  <FeatureItem label="Priority marketplace" included pro />
                  <FeatureItem label="Advanced analytics" included pro />
                  <FeatureItem label="Auto-approve rules" included pro />
                  <FeatureItem label="CSV exports" included pro />
                  <FeatureItem label="Early access" included pro />
                </div>

                <Button variant="primary" onClick={onUpgrade} style={{ width: '100%' }}>
                  Upgrade Now
                </Button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <Button variant="ghost" onClick={onClose} style={{ fontSize: 13 }}>
                Maybe later
              </Button>
              <span style={{ fontFamily: F.mono, fontSize: 11, color: C.textMuted }}>
                14-day free trial, cancel anytime
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function FeatureItem({ label, included = false, pro = false }: { label: string; included?: boolean; pro?: boolean }) {
  const color = included ? (pro ? C.accentLime : C.textPrimary) : C.textMuted;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {included ? (
        <Check size={14} color={color} />
      ) : (
        <X size={14} color={C.textMuted} style={{ opacity: 0.5 }} />
      )}
      <span
        style={{
          fontFamily: F.syne,
          fontSize: 13,
          color: color,
          opacity: included ? 1 : 0.5,
        }}
      >
        {label}
      </span>
    </div>
  );
}
