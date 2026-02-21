import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Check, Download, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { C, F } from '../../tokens';
import { Button } from '../../components/subpool/Button';

export function PaymentSuccess() {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: C.bgBase,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 20,
      }}
    >
      {/* Animation */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          backgroundColor: C.accentLime,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 32,
        }}
      >
        <Check size={40} color={C.bgBase} strokeWidth={3} />
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{ textAlign: 'center', width: '100%', maxWidth: 400 }}
      >
        <h1
          style={{
            fontFamily: F.syne,
            fontSize: 28,
            fontWeight: 800,
            color: C.textPrimary,
            marginBottom: 8,
          }}
        >
          $4.99 sent to Riya K
        </h1>
        <p
          style={{
            fontFamily: F.mono,
            fontSize: 14,
            color: C.textMuted,
            marginBottom: 40,
          }}
        >
          February 2026 · Netflix Standard 4K
        </p>

        {/* Receipt Card */}
        <div
          style={{
            backgroundColor: C.bgSurface,
            border: `1px solid ${C.borderDefault}`,
            borderRadius: 6,
            padding: 24,
            marginBottom: 32,
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontFamily: F.mono, fontSize: 12, color: C.textMuted }}>Transaction ID</span>
            <span style={{ fontFamily: F.mono, fontSize: 12, color: C.textPrimary }}>#TXN-2847364</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontFamily: F.mono, fontSize: 12, color: C.textMuted }}>Date</span>
            <span style={{ fontFamily: F.mono, fontSize: 12, color: C.textPrimary }}>Feb 18, 2026 · 2:34 PM</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: F.mono, fontSize: 12, color: C.textMuted }}>Method</span>
            <span style={{ fontFamily: F.mono, fontSize: 12, color: C.textPrimary }}>Visa •••• 4242</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Button
             variant="outline" 
             onClick={() => {}} // Download receipt logic
             style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <Download size={16} /> Download Receipt
          </Button>
          
          <Button
             variant="primary"
             onClick={() => navigate('/ledger')}
             style={{ width: '100%' }}
          >
             Back to Ledger
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
