import React from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { C, F } from '../../tokens';
import { Button } from '../../components/subpool/Button';
import { Avatar } from '../../components/subpool/Avatar';

export function PaymentConfirmation() {
  const navigate = useNavigate();

  const handlePay = () => {
    // Simulate payment processing
    setTimeout(() => {
      navigate('/payment/success');
    }, 1000);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div style={{ maxWidth: 480, margin: '40px auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={handleCancel}
          style={{
            background: 'none',
            border: 'none',
            color: C.textMuted,
            cursor: 'pointer',
            padding: 8,
          }}
        >
          <ArrowLeft size={24} />
        </button>
        <h1 style={{ fontFamily: F.syne, fontSize: 24, fontWeight: 700, color: C.textPrimary, margin: 0 }}>
          Confirm Payment
        </h1>
      </div>

      {/* Summary Card */}
      <div
        style={{
          backgroundColor: C.bgSurface,
          border: `1px solid ${C.borderDefault}`,
          borderRadius: 6,
          overflow: 'hidden',
        }}
      >
        {/* Pool Header */}
        <div style={{ padding: 24, borderBottom: `1px solid ${C.borderDefault}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div
              style={{
                width: 48,
                height: 48,
                backgroundColor: '#E50914', // Netflix Red
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
              }}
            >
              🎬
            </div>
            <div>
              <h3 style={{ fontFamily: F.syne, fontSize: 18, fontWeight: 700, color: C.textPrimary, margin: 0 }}>
                Netflix Standard 4K
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <span style={{ fontFamily: F.mono, fontSize: 12, color: C.textMuted }}>Hosted by</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Avatar initials="RK" size="sm" color="#FFD700" />
                  <span style={{ fontFamily: F.syne, fontSize: 12, fontWeight: 600, color: C.textPrimary }}>
                    Riya K
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ 
              backgroundColor: C.bgBase, 
              padding: '12px 16px', 
              borderRadius: 4,
              display: 'flex', 
              justifyContent: 'space-between',
              fontFamily: F.mono,
              fontSize: 12,
              color: C.textMuted
          }}>
            <span>Billing Period</span>
            <span style={{ color: C.textPrimary }}>February 2026</span>
          </div>
        </div>

        {/* Breakdown */}
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: F.mono, fontSize: 14 }}>
            <span style={{ color: C.textMuted }}>Subscription Share</span>
            <span style={{ color: C.textPrimary }}>$4.99</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: F.mono, fontSize: 14 }}>
            <span style={{ color: C.textMuted }}>SubPool Fee (5%)</span>
            <span style={{ color: C.textPrimary }}>$0.25</span>
          </div>
          
          <div style={{ height: 1, backgroundColor: C.borderDefault, margin: '12px 0' }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: F.syne, fontSize: 20, fontWeight: 700 }}>
            <span style={{ color: C.textPrimary }}>Total</span>
            <span style={{ color: C.accentLime }}>$5.24</span>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          border: `1px solid ${C.borderDefault}`,
          borderRadius: 6,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <CreditCard size={20} color={C.textPrimary} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontFamily: F.mono, fontSize: 14, color: C.textPrimary }}>
              Visa •••• 4242
            </span>
            <span style={{ fontFamily: F.mono, fontSize: 11, color: C.textMuted }}>
              Expires 12/28
            </span>
          </div>
        </div>
        <button
          style={{
            background: 'none',
            border: 'none',
            color: C.accentLime,
            fontFamily: F.mono,
            fontSize: 12,
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
          onClick={() => navigate('/payment/method')}
        >
          Change
        </button>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Button variant="primary" size="lg" onClick={handlePay} style={{ width: '100%', height: 56, fontSize: 16 }}>
          Pay $5.24 Now
        </Button>
        <Button variant="ghost" onClick={handleCancel} style={{ width: '100%' }}>
          Cancel
        </Button>
        
        <p style={{ fontFamily: F.mono, fontSize: 11, color: C.textMuted, textAlign: 'center', lineHeight: 1.5 }}>
          Payment goes directly to Riya K.<br />
          SubPool charges a 5% platform fee for trust & safety.
        </p>
      </div>
    </div>
  );
}
