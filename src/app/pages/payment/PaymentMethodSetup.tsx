import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { CreditCard, Calendar, Lock, Check, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { C, F } from '../../tokens';
import { Button } from '../../components/subpool/Button';

// Reusable input component for payment forms
const PaymentInput = ({
  label,
  placeholder,
  value,
  onChange,
  icon,
  maxLength,
  type = 'text',
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  maxLength?: number;
  type?: string;
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
      <label
        style={{
          fontFamily: F.mono,
          fontSize: 10,
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '1.2px',
          color: C.textMuted,
        }}
      >
        {label}
      </label>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          maxLength={maxLength}
          placeholder={placeholder}
          style={{
            width: '100%',
            height: 48,
            backgroundColor: C.bgSurface,
            border: `1px solid ${focused ? C.accentLime : C.borderDefault}`,
            borderRadius: 6,
            padding: icon ? '0 16px 0 44px' : '0 16px',
            fontFamily: F.mono,
            fontSize: 14,
            color: C.textPrimary,
            outline: 'none',
            transition: 'border-color 0.2s ease',
          }}
        />
        {icon && (
          <div
            style={{
              position: 'absolute',
              left: 14,
              color: focused ? C.accentLime : C.textMuted,
              transition: 'color 0.2s ease',
              pointerEvents: 'none',
            }}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export function PaymentMethodSetup() {
  const navigate = useNavigate();
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');
  const [showBilling, setShowBilling] = useState(false);

  const handleSave = () => {
    // Navigate to confirmation
    navigate('/payment/confirm');
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 40 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontFamily: F.syne, fontSize: 32, fontWeight: 800, color: C.textPrimary, marginBottom: 8 }}>
          Add Payment Method
        </h1>
        <p style={{ fontFamily: F.mono, fontSize: 14, color: C.textMuted }}>
          Securely save your card for future payments.
        </p>
      </div>

      {/* Main Card Input Form */}
      <div
        style={{
          backgroundColor: C.bgBase,
          border: `1px solid ${C.borderDefault}`,
          borderRadius: 6,
          padding: 32,
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        <PaymentInput
          label="Card Number"
          placeholder="0000 0000 0000 0000"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
          icon={<CreditCard size={18} />}
          maxLength={19}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <PaymentInput
            label="Expiry Date"
            placeholder="MM / YY"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            icon={<Calendar size={18} />}
            maxLength={5}
          />
          <PaymentInput
            label="CVV"
            placeholder="123"
            value={cvv}
            onChange={(e) => setCvv(e.target.value)}
            type="password"
            maxLength={4}
          />
        </div>

        <PaymentInput
          label="Name on Card"
          placeholder="J. Appleseed"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* Billing Address Toggle */}
        <div style={{ borderTop: `1px solid ${C.borderDefault}`, paddingTop: 24 }}>
          <button
            onClick={() => setShowBilling(!showBilling)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: 'pointer',
              color: C.textPrimary,
              width: '100%',
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                border: `1px solid ${C.textMuted}`,
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: showBilling ? C.accentLime : 'transparent',
                borderColor: showBilling ? C.accentLime : C.textMuted,
              }}
            >
              {showBilling && <Check size={12} color={C.bgBase} strokeWidth={4} />}
            </div>
            <span style={{ fontFamily: F.syne, fontSize: 14, fontWeight: 600 }}>
              Billing address is same as shipping
            </span>
            <div style={{ marginLeft: 'auto', color: C.textMuted }}>
              {showBilling ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </button>
          
          {!showBilling && (
            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                 <PaymentInput label="Address Line 1" placeholder="123 Main St" value="" onChange={()=>{}} />
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <PaymentInput label="City" placeholder="New York" value="" onChange={()=>{}} />
                    <PaymentInput label="Zip Code" placeholder="10001" value="" onChange={()=>{}} />
                 </div>
            </div>
          )}
        </div>
      </div>

      {/* Saved Cards */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontFamily: F.syne, fontSize: 18, fontWeight: 700, color: C.textPrimary }}>
            Saved Cards
          </h3>
          <button
             style={{
                 background: 'none',
                 border: 'none',
                 color: C.accentLime,
                 fontFamily: F.mono,
                 fontSize: 12,
                 cursor: 'pointer',
                 display: 'flex',
                 alignItems: 'center',
                 gap: 6
             }}
          >
              <Plus size={14} /> Add new card
          </button>
        </div>
        
        <div
          style={{
            backgroundColor: C.bgSurface,
            border: `1px solid ${C.borderDefault}`,
            borderRadius: 6,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div style={{ 
              width: 40, height: 28, backgroundColor: '#fff', borderRadius: 4, 
              display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}>
             {/* Simple Mastercard logo representation */}
             <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#EB001B', opacity: 0.8, marginRight: -8 }}></div>
             <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#F79E1B', opacity: 0.8 }}></div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: F.mono, fontSize: 14, color: C.textPrimary }}>
              •••• •••• •••• 4242
            </div>
            <div style={{ fontFamily: F.mono, fontSize: 11, color: C.textMuted }}>
              Expires 12/28
            </div>
          </div>
          <span
            style={{
              padding: '4px 8px',
              border: `1px solid ${C.borderDefault}`,
              borderRadius: 100,
              fontFamily: F.mono,
              fontSize: 10,
              color: C.textMuted,
              textTransform: 'uppercase',
            }}
          >
            Default
          </span>
        </div>
      </div>

      {/* Security Note & Action */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
          <Lock size={14} color={C.textMuted} />
          <span style={{ fontFamily: F.mono, fontSize: 12, color: C.textMuted }}>
            Payments secured by Stripe. SubPool never stores your card details.
          </span>
        </div>
        
        <Button variant="primary" size="lg" onClick={handleSave} style={{ width: '100%' }}>
          Save & Continue
        </Button>
      </div>
    </div>
  );
}
