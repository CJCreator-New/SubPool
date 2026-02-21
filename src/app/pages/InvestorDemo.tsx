/**
 * INVESTOR DEMO FLOW
 * 
 * A linear 10-frame prototype showing the complete SubPool user journey.
 * Visit: /demo
 * 
 * Story: Sarah wants Netflix for cheap. She finds SubPool, joins a pool in 2 minutes,
 * and pays $4.99 instead of $15.99. Marcus, the pool owner, sees the payment land
 * in his ledger and collects $14.97 that month.
 * 
 * Features:
 * - 10 sequential screens at 1440×900px
 * - Demo mode banner (4px lime bar at top)
 * - Frame counter (bottom-right)
 * - Smooth transitions (300ms ease-out)
 * - Auto-play mode
 * - Navigation controls (← →)
 * 
 * Perfect for investor pitches, demos, and walkthroughs.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { C, F } from '../tokens';
import { Button } from '../components/subpool/Button';
import { PoolCard } from '../components/subpool/PoolCard';
import { SlotFillBar } from '../components/subpool/SlotFillBar';
import { StatusPill } from '../components/subpool/StatusPill';
import { Check, ChevronRight, ArrowLeft, ArrowRight, Play, Pause } from 'lucide-react';

type FrameId = 
  | '01_Landing'
  | '02_SignUp'
  | '03_Browse'
  | '04_PoolDetail'
  | '05_RequestSent'
  | '06_Approved_Notification'
  | '07_MyPools_Active'
  | '08_Ledger_Owed'
  | '09_Ledger_Paid'
  | '10_Owner_Analytics';

const frames: FrameId[] = [
  '01_Landing',
  '02_SignUp',
  '03_Browse',
  '04_PoolDetail',
  '05_RequestSent',
  '06_Approved_Notification',
  '07_MyPools_Active',
  '08_Ledger_Owed',
  '09_Ledger_Paid',
  '10_Owner_Analytics',
];

export function InvestorDemo() {
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);

  const currentFrame = frames[currentFrameIndex];
  const frameNumber = `${String(currentFrameIndex + 1).padStart(2, '0')} / 10`;

  const nextFrame = () => {
    if (currentFrameIndex < frames.length - 1) {
      setCurrentFrameIndex(prev => prev + 1);
    } else {
      setCurrentFrameIndex(0);
    }
  };

  const prevFrame = () => {
    if (currentFrameIndex > 0) {
      setCurrentFrameIndex(prev => prev - 1);
    }
  };

  React.useEffect(() => {
    if (autoPlay) {
      const interval = setInterval(() => {
        nextFrame();
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [autoPlay, currentFrameIndex]);

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      backgroundColor: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Demo controls */}
      <div style={{
        position: 'fixed',
        top: 20,
        left: 20,
        zIndex: 1000,
        display: 'flex',
        gap: 8,
      }}>
        <button
          onClick={prevFrame}
          disabled={currentFrameIndex === 0}
          style={{
            width: 36,
            height: 36,
            borderRadius: 6,
            border: `1px solid ${C.borderDefault}`,
            backgroundColor: C.bgBase,
            color: C.textPrimary,
            cursor: currentFrameIndex === 0 ? 'not-allowed' : 'pointer',
            opacity: currentFrameIndex === 0 ? 0.3 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ArrowLeft size={16} />
        </button>
        <button
          onClick={nextFrame}
          style={{
            width: 36,
            height: 36,
            borderRadius: 6,
            border: `1px solid ${C.borderDefault}`,
            backgroundColor: C.bgBase,
            color: C.textPrimary,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ArrowRight size={16} />
        </button>
        <button
          onClick={() => setAutoPlay(!autoPlay)}
          style={{
            width: 36,
            height: 36,
            borderRadius: 6,
            border: `1px solid ${C.borderDefault}`,
            backgroundColor: autoPlay ? C.accentLime : C.bgBase,
            color: autoPlay ? C.bgBase : C.textPrimary,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {autoPlay ? <Pause size={16} /> : <Play size={16} />}
        </button>
      </div>

      {/* Main frame container */}
      <div style={{
        width: 1440,
        height: 900,
        position: 'relative',
        backgroundColor: C.bgBase,
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}>
        {/* Demo banner */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          backgroundColor: C.accentLime,
          zIndex: 100,
        }} />

        {/* Frame counter */}
        <div style={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          fontFamily: F.mono,
          fontSize: 10,
          color: C.textMuted,
          zIndex: 100,
          backgroundColor: C.bgBase,
          padding: '4px 8px',
          borderRadius: 4,
        }}>
          {frameNumber}
        </div>

        {/* Animated frame content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentFrame}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{ width: '100%', height: '100%' }}
          >
            {currentFrame === '01_Landing' && <Frame01Landing onNext={nextFrame} />}
            {currentFrame === '02_SignUp' && <Frame02SignUp onNext={nextFrame} />}
            {currentFrame === '03_Browse' && <Frame03Browse onNext={nextFrame} />}
            {currentFrame === '04_PoolDetail' && <Frame04PoolDetail onNext={nextFrame} />}
            {currentFrame === '05_RequestSent' && <Frame05RequestSent onNext={nextFrame} />}
            {currentFrame === '06_Approved_Notification' && <Frame06ApprovedNotification onNext={nextFrame} />}
            {currentFrame === '07_MyPools_Active' && <Frame07MyPoolsActive onNext={nextFrame} />}
            {currentFrame === '08_Ledger_Owed' && <Frame08LedgerOwed onNext={nextFrame} />}
            {currentFrame === '09_Ledger_Paid' && <Frame09LedgerPaid onNext={nextFrame} />}
            {currentFrame === '10_Owner_Analytics' && <Frame10OwnerAnalytics onNext={nextFrame} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// Frame 01: Landing
function Frame01Landing({ onNext }: { onNext: () => void }) {
  return (
    <div style={{ 
      width: '100%', 
      height: '100%',
      display: 'flex',
      paddingTop: 4,
    }}>
      {/* Left side */}
      <div style={{
        flex: 1,
        padding: '80px 60px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ 
            margin: 0, 
            fontFamily: F.syne, 
            fontWeight: 800, 
            fontSize: 24 
          }}>
            <span style={{ color: C.textPrimary }}>Sub</span>
            <span style={{ color: C.accentLime }}>Pool</span>
          </h1>
        </div>

        <h2 style={{
          margin: '0 0 8px 0',
          fontFamily: F.syne,
          fontWeight: 800,
          fontSize: 52,
          lineHeight: 1.1,
          color: C.textPrimary,
        }}>
          Share subscriptions.
        </h2>
        <h2 style={{
          margin: '0 0 16px 0',
          fontFamily: F.syne,
          fontWeight: 800,
          fontSize: 52,
          lineHeight: 1.1,
          color: C.accentLime,
        }}>
          Split the cost.
        </h2>
        
        <p style={{
          margin: '0 0 32px 0',
          fontFamily: F.syne,
          fontSize: 18,
          color: C.textMuted,
        }}>
          No awkward group chats.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
          {[
            { emoji: '🎬', text: 'Access Netflix, Spotify, Figma & 25+ platforms' },
            { emoji: '💸', text: 'Save 40–75% vs solo pricing' },
            { emoji: '⭐', text: 'Rated, verified strangers only' },
          ].map((prop, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 20 }}>{prop.emoji}</span>
              <span style={{ fontFamily: F.syne, fontSize: 15, color: C.textPrimary }}>
                {prop.text}
              </span>
            </div>
          ))}
        </div>

        <Button
          variant="primary"
          onClick={onNext}
          style={{ width: 200, height: 48, fontSize: 15 }}
        >
          Get Started →
        </Button>

        <p style={{ 
          margin: '12px 0 0', 
          fontFamily: F.mono, 
          fontSize: 11, 
          color: C.textMuted 
        }}>
          Free to join · No credit card needed
        </p>

        {/* Story annotation */}
        <div style={{
          marginTop: 40,
          padding: 16,
          backgroundColor: C.bgSurface,
          borderLeft: `3px solid ${C.accentLime}`,
          borderRadius: 4,
        }}>
          <p style={{
            margin: 0,
            fontFamily: F.mono,
            fontSize: 11,
            color: C.textMuted,
            lineHeight: 1.6,
          }}>
            📖 <strong style={{ color: C.accentLime }}>Sarah</strong> discovers SubPool. She's tired of paying $15.99/mo for Netflix alone.
          </p>
        </div>
      </div>

      {/* Right side */}
      <div style={{
        flex: 1,
        backgroundColor: C.bgSurface,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div
          style={{
            position: 'absolute',
            width: 400,
            height: 400,
            borderRadius: '50%',
            backgroundColor: C.accentLime,
            opacity: 0.08,
            filter: 'blur(80px)',
          }}
        />
        
        <div style={{ position: 'relative', width: 300, height: 400 }}>
          <div style={{ 
            position: 'absolute', 
            top: -40, 
            left: -20, 
            transform: 'rotate(-2deg)',
            zIndex: 3,
          }}>
            <PoolCard
              status="open"
              platformEmoji="🎬"
              platformName="Netflix"
              planName="Standard 4K"
              platformColor="#1A0203"
              slotsTotal={4}
              slotsFilled={3}
              pricePerSlot="4.99"
              ownerInitials="MW"
              ownerName="Marcus W"
              ownerColor={C.accentLime}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Frame 02: SignUp
function Frame02SignUp({ onNext }: { onNext: () => void }) {
  return (
    <div style={{ 
      width: '100%', 
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 4,
    }}>
      <div style={{
        width: 420,
        padding: 40,
        backgroundColor: C.bgSurface,
        borderRadius: 8,
        border: `1px solid ${C.borderDefault}`,
      }}>
        <h2 style={{
          margin: '0 0 8px 0',
          fontFamily: F.syne,
          fontWeight: 800,
          fontSize: 28,
          color: C.textPrimary,
        }}>
          Create account
        </h2>
        <p style={{
          margin: '0 0 32px 0',
          fontFamily: F.syne,
          fontSize: 14,
          color: C.textMuted,
        }}>
          Join thousands splitting subscriptions
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: 6,
              fontFamily: F.mono,
              fontSize: 11,
              color: C.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '1.2px',
            }}>
              Full Name
            </label>
            <input
              type="text"
              value="Sarah Chen"
              readOnly
              style={{
                width: '100%',
                padding: '10px 12px',
                backgroundColor: C.bgBase,
                border: `1px solid ${C.borderDefault}`,
                borderRadius: 6,
                fontFamily: F.syne,
                fontSize: 14,
                color: C.textPrimary,
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: 6,
              fontFamily: F.mono,
              fontSize: 11,
              color: C.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '1.2px',
            }}>
              Email
            </label>
            <input
              type="email"
              value="sarah.chen@gmail.com"
              readOnly
              style={{
                width: '100%',
                padding: '10px 12px',
                backgroundColor: C.bgBase,
                border: `1px solid ${C.borderDefault}`,
                borderRadius: 6,
                fontFamily: F.syne,
                fontSize: 14,
                color: C.textPrimary,
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: 6,
              fontFamily: F.mono,
              fontSize: 11,
              color: C.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '1.2px',
            }}>
              Password
            </label>
            <input
              type="password"
              value="••••••••••"
              readOnly
              style={{
                width: '100%',
                padding: '10px 12px',
                backgroundColor: C.bgBase,
                border: `1px solid ${C.borderDefault}`,
                borderRadius: 6,
                fontFamily: F.syne,
                fontSize: 14,
                color: C.textPrimary,
                outline: 'none',
              }}
            />
          </div>

          <Button
            variant="primary"
            onClick={onNext}
            style={{ width: '100%', height: 48, marginTop: 8 }}
          >
            Create Account →
          </Button>

          <p style={{
            margin: '8px 0 0',
            textAlign: 'center',
            fontFamily: F.mono,
            fontSize: 10,
            color: C.textMuted,
          }}>
            By signing up you agree to our Terms & Privacy
          </p>
        </div>

        {/* Story annotation */}
        <div style={{
          marginTop: 24,
          padding: 12,
          backgroundColor: C.bgBase,
          borderLeft: `3px solid ${C.accentLime}`,
          borderRadius: 4,
        }}>
          <p style={{
            margin: 0,
            fontFamily: F.mono,
            fontSize: 10,
            color: C.textMuted,
            lineHeight: 1.6,
          }}>
            📖 Sarah creates an account in 30 seconds
          </p>
        </div>
      </div>
    </div>
  );
}

// Frame 03: Browse
function Frame03Browse({ onNext }: { onNext: () => void }) {
  return (
    <div style={{ 
      width: '100%', 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      paddingTop: 4,
    }}>
      {/* Header */}
      <div style={{
        padding: '24px 40px',
        borderBottom: `1px solid ${C.borderDefault}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <h1 style={{ 
            margin: 0, 
            fontFamily: F.syne, 
            fontWeight: 800, 
            fontSize: 20 
          }}>
            <span style={{ color: C.textPrimary }}>Sub</span>
            <span style={{ color: C.accentLime }}>Pool</span>
          </h1>
        </div>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          backgroundColor: C.accentLime,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: F.syne,
          fontWeight: 700,
          fontSize: 13,
          color: C.bgBase,
        }}>
          SC
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{
            margin: '0 0 4px 0',
            fontFamily: F.syne,
            fontWeight: 800,
            fontSize: 28,
            color: C.textPrimary,
          }}>
            Browse Pools
          </h2>
          <p style={{
            margin: 0,
            fontFamily: F.syne,
            fontSize: 14,
            color: C.textMuted,
          }}>
            Join verified pools & start saving
          </p>
        </div>

        {/* Search bar */}
        <div style={{ marginBottom: 24 }}>
          <input
            type="text"
            placeholder="Search platforms..."
            style={{
              width: '100%',
              maxWidth: 500,
              padding: '12px 16px',
              backgroundColor: C.bgSurface,
              border: `1px solid ${C.borderDefault}`,
              borderRadius: 6,
              fontFamily: F.syne,
              fontSize: 14,
              color: C.textPrimary,
              outline: 'none',
            }}
          />
        </div>

        {/* Pool grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: 16,
          maxWidth: 1200,
        }}>
          <div onClick={onNext} style={{ cursor: 'pointer' }}>
            <PoolCard
              status="open"
              platformEmoji="🎬"
              platformName="Netflix"
              planName="Standard 4K"
              platformColor="#1A0203"
              slotsTotal={4}
              slotsFilled={3}
              pricePerSlot="4.99"
              ownerInitials="MW"
              ownerName="Marcus W"
              ownerColor={C.accentLime}
            />
          </div>
          
          <PoolCard
            status="open"
            platformEmoji="🎵"
            platformName="Spotify"
            planName="Family"
            platformColor="#031A0A"
            slotsTotal={6}
            slotsFilled={4}
            pricePerSlot="2.99"
            ownerInitials="JD"
            ownerName="Jordan D"
            ownerColor="#00D1C1"
          />
          
          <PoolCard
            status="full"
            platformEmoji="🤖"
            platformName="ChatGPT"
            planName="Plus"
            platformColor="#031A14"
            slotsTotal={2}
            slotsFilled={2}
            pricePerSlot="9.99"
            ownerInitials="AK"
            ownerName="Alex K"
            ownerColor="#7B61FF"
          />
        </div>

        {/* Story annotation */}
        <div style={{
          marginTop: 24,
          maxWidth: 600,
          padding: 16,
          backgroundColor: C.bgSurface,
          borderLeft: `3px solid ${C.accentLime}`,
          borderRadius: 4,
        }}>
          <p style={{
            margin: 0,
            fontFamily: F.mono,
            fontSize: 11,
            color: C.textMuted,
            lineHeight: 1.6,
          }}>
            📖 Sarah browses available pools. She finds Marcus's Netflix pool at <strong style={{ color: C.accentLime }}>$4.99/mo</strong> (vs $15.99)
          </p>
        </div>
      </div>
    </div>
  );
}

// Frame 04: Pool Detail
function Frame04PoolDetail({ onNext }: { onNext: () => void }) {
  return (
    <div style={{ 
      width: '100%', 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      paddingTop: 4,
    }}>
      {/* Header */}
      <div style={{
        padding: '24px 40px',
        borderBottom: `1px solid ${C.borderDefault}`,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 6,
          backgroundColor: '#1A0203',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
        }}>
          🎬
        </div>
        <div>
          <h1 style={{ 
            margin: 0, 
            fontFamily: F.syne, 
            fontWeight: 800, 
            fontSize: 20,
            color: C.textPrimary,
          }}>
            Netflix · Standard 4K
          </h1>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '40px', display: 'flex', gap: 32 }}>
        {/* Left column */}
        <div style={{ flex: 1, maxWidth: 500 }}>
          <div style={{
            padding: 24,
            backgroundColor: C.bgSurface,
            border: `1px solid ${C.borderDefault}`,
            borderRadius: 8,
            marginBottom: 24,
          }}>
            <div style={{ marginBottom: 20 }}>
              <p style={{
                margin: '0 0 4px 0',
                fontFamily: F.mono,
                fontSize: 11,
                color: C.textMuted,
                textTransform: 'uppercase',
                letterSpacing: '1.2px',
              }}>
                Monthly cost
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{
                  fontFamily: F.syne,
                  fontWeight: 800,
                  fontSize: 36,
                  color: C.accentLime,
                }}>
                  $4.99
                </span>
                <span style={{
                  fontFamily: F.syne,
                  fontSize: 16,
                  color: C.textMuted,
                  textDecoration: 'line-through',
                }}>
                  $15.99
                </span>
              </div>
              <p style={{
                margin: '8px 0 0 0',
                fontFamily: F.syne,
                fontSize: 13,
                color: C.statusSuccess,
              }}>
                💰 You save $11/mo (69% off)
              </p>
            </div>

            <div style={{ marginBottom: 20 }}>
              <p style={{
                margin: '0 0 8px 0',
                fontFamily: F.mono,
                fontSize: 11,
                color: C.textMuted,
                textTransform: 'uppercase',
                letterSpacing: '1.2px',
              }}>
                Availability
              </p>
              <SlotFillBar filled={3} total={4} />
              <p style={{
                margin: '8px 0 0 0',
                fontFamily: F.syne,
                fontSize: 13,
                color: C.textPrimary,
              }}>
                1 slot remaining
              </p>
            </div>

            <div style={{ marginBottom: 24 }}>
              <p style={{
                margin: '0 0 8px 0',
                fontFamily: F.mono,
                fontSize: 11,
                color: C.textMuted,
                textTransform: 'uppercase',
                letterSpacing: '1.2px',
              }}>
                Pool owner
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: C.accentLime,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: F.syne,
                  fontWeight: 700,
                  fontSize: 14,
                  color: C.bgBase,
                }}>
                  MW
                </div>
                <div>
                  <p style={{
                    margin: 0,
                    fontFamily: F.syne,
                    fontSize: 15,
                    fontWeight: 600,
                    color: C.textPrimary,
                  }}>
                    Marcus W
                  </p>
                  <p style={{
                    margin: 0,
                    fontFamily: F.mono,
                    fontSize: 11,
                    color: C.textMuted,
                  }}>
                    ⭐ 4.9 · 12 pools
                  </p>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={onNext}
              style={{ width: '100%', height: 48 }}
            >
              Request to Join Pool →
            </Button>
          </div>

          {/* Story annotation */}
          <div style={{
            padding: 16,
            backgroundColor: C.bgSurface,
            borderLeft: `3px solid ${C.accentLime}`,
            borderRadius: 4,
          }}>
            <p style={{
              margin: 0,
              fontFamily: F.mono,
              fontSize: 11,
              color: C.textMuted,
              lineHeight: 1.6,
            }}>
              📖 Sarah reviews the pool details. <strong style={{ color: C.accentLime }}>Marcus</strong> is a verified host with great ratings. She clicks "Request to Join"
            </p>
          </div>
        </div>

        {/* Right column - Pool details */}
        <div style={{ flex: 1 }}>
          <h3 style={{
            margin: '0 0 16px 0',
            fontFamily: F.syne,
            fontWeight: 700,
            fontSize: 18,
            color: C.textPrimary,
          }}>
            What's included
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              'Full 4K Ultra HD streaming',
              'Watch on any device',
              'Download for offline viewing',
              'Auto-managed credentials',
              'Instant activation after approval',
            ].map((feature, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  backgroundColor: C.accentLime,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Check size={12} color={C.bgBase} strokeWidth={3} />
                </div>
                <span style={{
                  fontFamily: F.syne,
                  fontSize: 14,
                  color: C.textPrimary,
                }}>
                  {feature}
                </span>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: 32,
            padding: 16,
            backgroundColor: C.bgSurface,
            border: `1px solid ${C.borderDefault}`,
            borderRadius: 6,
          }}>
            <p style={{
              margin: '0 0 8px 0',
              fontFamily: F.syne,
              fontWeight: 600,
              fontSize: 13,
              color: C.textPrimary,
            }}>
              🛡️ Protected by SubPool
            </p>
            <p style={{
              margin: 0,
              fontFamily: F.syne,
              fontSize: 12,
              color: C.textMuted,
              lineHeight: 1.5,
            }}>
              Money-back guarantee · Verified owners only · Secure credential sharing
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Frame 05: Request Sent
function Frame05RequestSent({ onNext }: { onNext: () => void }) {
  React.useEffect(() => {
    const timer = setTimeout(onNext, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ 
      width: '100%', 
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 4,
    }}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{
          width: 480,
          padding: 48,
          backgroundColor: C.bgSurface,
          border: `1px solid ${C.borderDefault}`,
          borderRadius: 8,
          textAlign: 'center',
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.3, type: 'spring', stiffness: 200 }}
          style={{
            width: 80,
            height: 80,
            margin: '0 auto 24px',
            borderRadius: '50%',
            backgroundColor: C.accentLime,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Check size={40} color={C.bgBase} strokeWidth={3} />
        </motion.div>

        <h2 style={{
          margin: '0 0 12px 0',
          fontFamily: F.syne,
          fontWeight: 800,
          fontSize: 28,
          color: C.textPrimary,
        }}>
          Request Sent!
        </h2>

        <p style={{
          margin: '0 0 24px 0',
          fontFamily: F.syne,
          fontSize: 15,
          color: C.textMuted,
          lineHeight: 1.5,
        }}>
          Marcus will review your request. Most hosts approve within minutes.
        </p>

        <div style={{
          padding: 16,
          backgroundColor: C.bgBase,
          borderRadius: 6,
          marginBottom: 24,
        }}>
          <p style={{
            margin: 0,
            fontFamily: F.mono,
            fontSize: 12,
            color: C.textMuted,
          }}>
            We'll notify you as soon as Marcus approves 🔔
          </p>
        </div>

        {/* Story annotation */}
        <div style={{
          padding: 16,
          backgroundColor: C.bgBase,
          borderLeft: `3px solid ${C.accentLime}`,
          borderRadius: 4,
          textAlign: 'left',
        }}>
          <p style={{
            margin: 0,
            fontFamily: F.mono,
            fontSize: 11,
            color: C.textMuted,
            lineHeight: 1.6,
          }}>
            📖 Request submitted! Marcus gets an instant notification...
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// Frame 06: Approved Notification
function Frame06ApprovedNotification({ onNext }: { onNext: () => void }) {
  return (
    <div style={{ 
      width: '100%', 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      paddingTop: 4,
    }}>
      {/* Header */}
      <div style={{
        padding: '24px 40px',
        borderBottom: `1px solid ${C.borderDefault}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <h1 style={{ 
          margin: 0, 
          fontFamily: F.syne, 
          fontWeight: 800, 
          fontSize: 20 
        }}>
          <span style={{ color: C.textPrimary }}>Sub</span>
          <span style={{ color: C.accentLime }}>Pool</span>
        </h1>
        <div style={{
          position: 'relative',
        }}>
          <div style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: C.accentLime,
            position: 'absolute',
            top: -2,
            right: -2,
            border: `2px solid ${C.bgBase}`,
          }} />
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: C.accentLime,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: F.syne,
            fontWeight: 700,
            fontSize: 13,
            color: C.bgBase,
          }}>
            SC
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '40px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ maxWidth: 600, width: '100%' }}>
          <h2 style={{
            margin: '0 0 24px 0',
            fontFamily: F.syne,
            fontWeight: 800,
            fontSize: 28,
            color: C.textPrimary,
          }}>
            Notifications
          </h2>

          {/* New notification */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{
              padding: 20,
              backgroundColor: C.bgSurface,
              border: `2px solid ${C.accentLime}`,
              borderRadius: 8,
              marginBottom: 12,
              cursor: 'pointer',
            }}
            onClick={onNext}
          >
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                backgroundColor: C.accentLime,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Check size={24} color={C.bgBase} strokeWidth={3} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{
                  margin: '0 0 4px 0',
                  fontFamily: F.syne,
                  fontWeight: 600,
                  fontSize: 15,
                  color: C.textPrimary,
                }}>
                  You've been approved! 🎉
                </p>
                <p style={{
                  margin: '0 0 8px 0',
                  fontFamily: F.syne,
                  fontSize: 13,
                  color: C.textMuted,
                  lineHeight: 1.5,
                }}>
                  Marcus W approved your request to join the Netflix pool. Your first payment of $4.99 is due now.
                </p>
                <div style={{
                  display: 'inline-block',
                  padding: '6px 12px',
                  backgroundColor: C.accentLime,
                  borderRadius: 4,
                  fontFamily: F.syne,
                  fontWeight: 700,
                  fontSize: 12,
                  color: C.bgBase,
                }}>
                  View Pool →
                </div>
              </div>
              <div>
                <p style={{
                  margin: 0,
                  fontFamily: F.mono,
                  fontSize: 10,
                  color: C.textMuted,
                }}>
                  2 min ago
                </p>
              </div>
            </div>
          </motion.div>

          {/* Older notifications */}
          <div style={{
            padding: 20,
            backgroundColor: C.bgSurface,
            border: `1px solid ${C.borderDefault}`,
            borderRadius: 8,
            opacity: 0.5,
            marginBottom: 12,
          }}>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                backgroundColor: C.bgHover,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: 20,
              }}>
                👋
              </div>
              <div style={{ flex: 1 }}>
                <p style={{
                  margin: '0 0 4px 0',
                  fontFamily: F.syne,
                  fontWeight: 600,
                  fontSize: 15,
                  color: C.textPrimary,
                }}>
                  Welcome to SubPool!
                </p>
                <p style={{
                  margin: 0,
                  fontFamily: F.syne,
                  fontSize: 13,
                  color: C.textMuted,
                }}>
                  Thanks for joining. Browse pools and start saving.
                </p>
              </div>
              <div>
                <p style={{
                  margin: 0,
                  fontFamily: F.mono,
                  fontSize: 10,
                  color: C.textMuted,
                }}>
                  1h ago
                </p>
              </div>
            </div>
          </div>

          {/* Story annotation */}
          <div style={{
            marginTop: 24,
            padding: 16,
            backgroundColor: C.bgSurface,
            borderLeft: `3px solid ${C.accentLime}`,
            borderRadius: 4,
          }}>
            <p style={{
              margin: 0,
              fontFamily: F.mono,
              fontSize: 11,
              color: C.textMuted,
              lineHeight: 1.6,
            }}>
              📖 <strong style={{ color: C.accentLime }}>Approved in 2 minutes!</strong> Sarah gets instant access. Now she needs to pay her first month.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Frame 07: My Pools Active
function Frame07MyPoolsActive({ onNext }: { onNext: () => void }) {
  return (
    <div style={{ 
      width: '100%', 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      paddingTop: 4,
    }}>
      {/* Header */}
      <div style={{
        padding: '24px 40px',
        borderBottom: `1px solid ${C.borderDefault}`,
      }}>
        <h1 style={{ 
          margin: 0, 
          fontFamily: F.syne, 
          fontWeight: 800, 
          fontSize: 20 
        }}>
          <span style={{ color: C.textPrimary }}>Sub</span>
          <span style={{ color: C.accentLime }}>Pool</span>
        </h1>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '40px' }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{
            margin: '0 0 4px 0',
            fontFamily: F.syne,
            fontWeight: 800,
            fontSize: 28,
            color: C.textPrimary,
          }}>
            My Pools
          </h2>
          <p style={{
            margin: 0,
            fontFamily: F.syne,
            fontSize: 14,
            color: C.textMuted,
          }}>
            Active subscriptions you're part of
          </p>
        </div>

        {/* Active pool */}
        <div style={{
          padding: 24,
          backgroundColor: C.bgSurface,
          border: `1px solid ${C.borderDefault}`,
          borderRadius: 8,
          marginBottom: 16,
          maxWidth: 700,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
            <div style={{
              width: 60,
              height: 60,
              borderRadius: 8,
              backgroundColor: '#1A0203',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              flexShrink: 0,
            }}>
              🎬
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <h3 style={{
                  margin: 0,
                  fontFamily: F.syne,
                  fontWeight: 700,
                  fontSize: 18,
                  color: C.textPrimary,
                }}>
                  Netflix · Standard 4K
                </h3>
                <StatusPill variant="success" />
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: 16,
                marginBottom: 16,
              }}>
                <div>
                  <p style={{
                    margin: '0 0 4px 0',
                    fontFamily: F.mono,
                    fontSize: 10,
                    color: C.textMuted,
                    textTransform: 'uppercase',
                    letterSpacing: '1.2px',
                  }}>
                    Your cost
                  </p>
                  <p style={{
                    margin: 0,
                    fontFamily: F.syne,
                    fontWeight: 700,
                    fontSize: 20,
                    color: C.accentLime,
                  }}>
                    $4.99/mo
                  </p>
                </div>

                <div>
                  <p style={{
                    margin: '0 0 4px 0',
                    fontFamily: F.mono,
                    fontSize: 10,
                    color: C.textMuted,
                    textTransform: 'uppercase',
                    letterSpacing: '1.2px',
                  }}>
                    Pool owner
                  </p>
                  <p style={{
                    margin: 0,
                    fontFamily: F.syne,
                    fontSize: 14,
                    color: C.textPrimary,
                  }}>
                    Marcus W
                  </p>
                </div>

                <div>
                  <p style={{
                    margin: '0 0 4px 0',
                    fontFamily: F.mono,
                    fontSize: 10,
                    color: C.textMuted,
                    textTransform: 'uppercase',
                    letterSpacing: '1.2px',
                  }}>
                    Next payment
                  </p>
                  <p style={{
                    margin: 0,
                    fontFamily: F.syne,
                    fontSize: 14,
                    color: C.textPrimary,
                  }}>
                    Mar 19, 2026
                  </p>
                </div>
              </div>

              <div style={{
                padding: 12,
                backgroundColor: C.bgBase,
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div>
                  <p style={{
                    margin: '0 0 2px 0',
                    fontFamily: F.mono,
                    fontSize: 10,
                    color: C.textMuted,
                    textTransform: 'uppercase',
                    letterSpacing: '1.2px',
                  }}>
                    Credentials
                  </p>
                  <p style={{
                    margin: 0,
                    fontFamily: F.mono,
                    fontSize: 12,
                    color: C.textPrimary,
                  }}>
                    sarah.subpool.slot3@netflix.com
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Copy
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={onNext}
          style={{ maxWidth: 200 }}
        >
          View Ledger →
        </Button>

        {/* Story annotation */}
        <div style={{
          marginTop: 24,
          maxWidth: 700,
          padding: 16,
          backgroundColor: C.bgSurface,
          borderLeft: `3px solid ${C.accentLime}`,
          borderRadius: 4,
        }}>
          <p style={{
            margin: 0,
            fontFamily: F.mono,
            fontSize: 11,
            color: C.textMuted,
            lineHeight: 1.6,
          }}>
            📖 Sarah is now <strong style={{ color: C.accentLime }}>active</strong> in the pool with her own credentials. Time to pay...
          </p>
        </div>
      </div>
    </div>
  );
}

// Frame 08: Ledger Owed
function Frame08LedgerOwed({ onNext }: { onNext: () => void }) {
  return (
    <div style={{ 
      width: '100%', 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      paddingTop: 4,
    }}>
      {/* Header */}
      <div style={{
        padding: '24px 40px',
        borderBottom: `1px solid ${C.borderDefault}`,
      }}>
        <h1 style={{ 
          margin: 0, 
          fontFamily: F.syne, 
          fontWeight: 800, 
          fontSize: 20 
        }}>
          <span style={{ color: C.textPrimary }}>Sub</span>
          <span style={{ color: C.accentLime }}>Pool</span>
        </h1>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '40px' }}>
        <div style={{ marginBottom: 32 }}>
          <h2 style={{
            margin: '0 0 4px 0',
            fontFamily: F.syne,
            fontWeight: 800,
            fontSize: 28,
            color: C.textPrimary,
          }}>
            Payment Ledger
          </h2>
          <p style={{
            margin: 0,
            fontFamily: F.syne,
            fontSize: 14,
            color: C.textMuted,
          }}>
            Track your subscription payments
          </p>
        </div>

        {/* Balance due card */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            padding: 32,
            backgroundColor: C.bgSurface,
            border: `2px solid ${C.statusWarning}`,
            borderRadius: 8,
            marginBottom: 24,
            maxWidth: 600,
          }}
        >
          <p style={{
            margin: '0 0 8px 0',
            fontFamily: F.mono,
            fontSize: 11,
            color: C.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '1.2px',
          }}>
            Amount due
          </p>
          <h3 style={{
            margin: '0 0 16px 0',
            fontFamily: F.syne,
            fontWeight: 800,
            fontSize: 48,
            color: C.statusWarning,
          }}>
            $4.99
          </h3>
          <p style={{
            margin: '0 0 24px 0',
            fontFamily: F.syne,
            fontSize: 14,
            color: C.textMuted,
          }}>
            Netflix · February 2026 payment
          </p>

          <Button
            variant="primary"
            onClick={onNext}
            style={{ width: '100%', height: 48 }}
          >
            Pay Now with •••• 4242
          </Button>
        </motion.div>

        {/* Payment history */}
        <div style={{ maxWidth: 600 }}>
          <h3 style={{
            margin: '0 0 16px 0',
            fontFamily: F.syne,
            fontWeight: 700,
            fontSize: 18,
            color: C.textPrimary,
          }}>
            Payment History
          </h3>

          <div style={{
            padding: 16,
            backgroundColor: C.bgSurface,
            border: `1px solid ${C.borderDefault}`,
            borderRadius: 8,
            textAlign: 'center',
          }}>
            <p style={{
              margin: 0,
              fontFamily: F.syne,
              fontSize: 13,
              color: C.textMuted,
            }}>
              No previous payments yet
            </p>
          </div>
        </div>

        {/* Story annotation */}
        <div style={{
          marginTop: 24,
          maxWidth: 600,
          padding: 16,
          backgroundColor: C.bgSurface,
          borderLeft: `3px solid ${C.accentLime}`,
          borderRadius: 4,
        }}>
          <p style={{
            margin: 0,
            fontFamily: F.mono,
            fontSize: 11,
            color: C.textMuted,
            lineHeight: 1.6,
          }}>
            📖 Sarah owes <strong style={{ color: C.statusWarning }}>$4.99</strong> for her first month. She clicks Pay Now...
          </p>
        </div>
      </div>
    </div>
  );
}

// Frame 09: Ledger Paid
function Frame09LedgerPaid({ onNext }: { onNext: () => void }) {
  React.useEffect(() => {
    const timer = setTimeout(onNext, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ 
      width: '100%', 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      paddingTop: 4,
    }}>
      {/* Header */}
      <div style={{
        padding: '24px 40px',
        borderBottom: `1px solid ${C.borderDefault}`,
      }}>
        <h1 style={{ 
          margin: 0, 
          fontFamily: F.syne, 
          fontWeight: 800, 
          fontSize: 20 
        }}>
          <span style={{ color: C.textPrimary }}>Sub</span>
          <span style={{ color: C.accentLime }}>Pool</span>
        </h1>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '40px' }}>
        <div style={{ marginBottom: 32 }}>
          <h2 style={{
            margin: '0 0 4px 0',
            fontFamily: F.syne,
            fontWeight: 800,
            fontSize: 28,
            color: C.textPrimary,
          }}>
            Payment Ledger
          </h2>
          <p style={{
            margin: 0,
            fontFamily: F.syne,
            fontSize: 14,
            color: C.textMuted,
          }}>
            Track your subscription payments
          </p>
        </div>

        {/* Balance card - paid */}
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            padding: 32,
            backgroundColor: C.bgSurface,
            border: `2px solid ${C.statusSuccess}`,
            borderRadius: 8,
            marginBottom: 24,
            maxWidth: 600,
          }}
        >
          <div style={{
            width: 60,
            height: 60,
            margin: '0 auto 16px',
            borderRadius: '50%',
            backgroundColor: C.statusSuccess,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Check size={32} color={C.bgBase} strokeWidth={3} />
          </div>

          <h3 style={{
            margin: '0 0 8px 0',
            fontFamily: F.syne,
            fontWeight: 800,
            fontSize: 28,
            color: C.textPrimary,
            textAlign: 'center',
          }}>
            All Paid Up!
          </h3>
          <p style={{
            margin: 0,
            fontFamily: F.syne,
            fontSize: 14,
            color: C.textMuted,
            textAlign: 'center',
          }}>
            You have no outstanding payments
          </p>
        </motion.div>

        {/* Payment history */}
        <div style={{ maxWidth: 600 }}>
          <h3 style={{
            margin: '0 0 16px 0',
            fontFamily: F.syne,
            fontWeight: 700,
            fontSize: 18,
            color: C.textPrimary,
          }}>
            Payment History
          </h3>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            style={{
              padding: 20,
              backgroundColor: C.bgSurface,
              border: `1px solid ${C.borderDefault}`,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                backgroundColor: '#1A0203',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
              }}>
                🎬
              </div>
              <div>
                <p style={{
                  margin: '0 0 2px 0',
                  fontFamily: F.syne,
                  fontWeight: 600,
                  fontSize: 15,
                  color: C.textPrimary,
                }}>
                  Netflix · February 2026
                </p>
                <p style={{
                  margin: 0,
                  fontFamily: F.mono,
                  fontSize: 11,
                  color: C.textMuted,
                }}>
                  Feb 19, 2026 · •••• 4242
                </p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{
                margin: '0 0 2px 0',
                fontFamily: F.syne,
                fontWeight: 700,
                fontSize: 16,
                color: C.textPrimary,
              }}>
                $4.99
              </p>
              <StatusPill variant="success" />
            </div>
          </motion.div>
        </div>

        {/* Story annotation */}
        <div style={{
          marginTop: 24,
          maxWidth: 600,
          padding: 16,
          backgroundColor: C.bgSurface,
          borderLeft: `3px solid ${C.accentLime}`,
          borderRadius: 4,
        }}>
          <p style={{
            margin: 0,
            fontFamily: F.mono,
            fontSize: 11,
            color: C.textMuted,
            lineHeight: 1.6,
          }}>
            📖 <strong style={{ color: C.statusSuccess }}>Payment complete!</strong> Sarah saved $11 this month. Now let's see Marcus's side...
          </p>
        </div>
      </div>
    </div>
  );
}

// Frame 10: Owner Analytics
function Frame10OwnerAnalytics({ onNext }: { onNext: () => void }) {
  return (
    <div style={{ 
      width: '100%', 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      paddingTop: 4,
    }}>
      {/* Header */}
      <div style={{
        padding: '24px 40px',
        borderBottom: `1px solid ${C.borderDefault}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <h1 style={{ 
          margin: 0, 
          fontFamily: F.syne, 
          fontWeight: 800, 
          fontSize: 20 
        }}>
          <span style={{ color: C.textPrimary }}>Sub</span>
          <span style={{ color: C.accentLime }}>Pool</span>
        </h1>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          backgroundColor: C.accentLime,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: F.syne,
          fontWeight: 700,
          fontSize: 13,
          color: C.bgBase,
        }}>
          MW
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '40px' }}>
        <div style={{ marginBottom: 32 }}>
          <h2 style={{
            margin: '0 0 4px 0',
            fontFamily: F.syne,
            fontWeight: 800,
            fontSize: 28,
            color: C.textPrimary,
          }}>
            Owner Dashboard
          </h2>
          <p style={{
            margin: 0,
            fontFamily: F.syne,
            fontSize: 14,
            color: C.textMuted,
          }}>
            Marcus's pool analytics
          </p>
        </div>

        {/* Revenue card */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          style={{
            padding: 32,
            background: `linear-gradient(135deg, ${C.bgSurface} 0%, ${C.bgHover} 100%)`,
            border: `2px solid ${C.accentLime}`,
            borderRadius: 8,
            marginBottom: 32,
            maxWidth: 700,
          }}
        >
          <p style={{
            margin: '0 0 8px 0',
            fontFamily: F.mono,
            fontSize: 11,
            color: C.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '1.2px',
          }}>
            February Revenue
          </p>
          <h3 style={{
            margin: '0 0 8px 0',
            fontFamily: F.syne,
            fontWeight: 800,
            fontSize: 56,
            color: C.accentLime,
          }}>
            $14.97
          </h3>
          <p style={{
            margin: '0 0 24px 0',
            fontFamily: F.syne,
            fontSize: 14,
            color: C.textMuted,
          }}>
            From Netflix pool (3 members paid)
          </p>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: 24,
            paddingTop: 24,
            borderTop: `1px solid ${C.borderDefault}`,
          }}>
            <div>
              <p style={{
                margin: '0 0 6px 0',
                fontFamily: F.mono,
                fontSize: 10,
                color: C.textMuted,
                textTransform: 'uppercase',
                letterSpacing: '1.2px',
              }}>
                Pool cost
              </p>
              <p style={{
                margin: 0,
                fontFamily: F.syne,
                fontWeight: 700,
                fontSize: 24,
                color: C.textPrimary,
              }}>
                $19.99
              </p>
            </div>

            <div>
              <p style={{
                margin: '0 0 6px 0',
                fontFamily: F.mono,
                fontSize: 10,
                color: C.textMuted,
                textTransform: 'uppercase',
                letterSpacing: '1.2px',
              }}>
                Marcus pays
              </p>
              <p style={{
                margin: 0,
                fontFamily: F.syne,
                fontWeight: 700,
                fontSize: 24,
                color: C.textPrimary,
              }}>
                $5.02
              </p>
            </div>

            <div>
              <p style={{
                margin: '0 0 6px 0',
                fontFamily: F.mono,
                fontSize: 10,
                color: C.textMuted,
                textTransform: 'uppercase',
                letterSpacing: '1.2px',
              }}>
                Net profit
              </p>
              <p style={{
                margin: 0,
                fontFamily: F.syne,
                fontWeight: 700,
                fontSize: 24,
                color: C.statusSuccess,
              }}>
                +$0.00
              </p>
            </div>
          </div>
        </motion.div>

        {/* Pool members */}
        <div style={{ maxWidth: 700 }}>
          <h3 style={{
            margin: '0 0 16px 0',
            fontFamily: F.syne,
            fontWeight: 700,
            fontSize: 18,
            color: C.textPrimary,
          }}>
            Pool Members (4/4)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { name: 'Marcus W (You)', initials: 'MW', status: 'Owner', paid: true },
              { name: 'Sarah Chen', initials: 'SC', status: 'Paid', paid: true },
              { name: 'Jake M', initials: 'JM', status: 'Paid', paid: true },
              { name: 'Rita P', initials: 'RP', status: 'Paid', paid: true },
            ].map((member, idx) => (
              <motion.div
                key={idx}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: idx * 0.1, duration: 0.3 }}
                style={{
                  padding: 16,
                  backgroundColor: C.bgSurface,
                  border: `1px solid ${C.borderDefault}`,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    backgroundColor: idx === 0 ? C.accentLime : C.bgHover,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: F.syne,
                    fontWeight: 700,
                    fontSize: 12,
                    color: idx === 0 ? C.bgBase : C.textPrimary,
                  }}>
                    {member.initials}
                  </div>
                  <div>
                    <p style={{
                      margin: 0,
                      fontFamily: F.syne,
                      fontWeight: 600,
                      fontSize: 14,
                      color: C.textPrimary,
                    }}>
                      {member.name}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <p style={{
                    margin: 0,
                    fontFamily: F.syne,
                    fontWeight: 600,
                    fontSize: 14,
                    color: C.textPrimary,
                  }}>
                    {idx === 0 ? '—' : '$4.99'}
                  </p>
                  <StatusPill variant={idx === 0 ? 'pending' : 'success'} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Story annotation */}
        <div style={{
          marginTop: 32,
          maxWidth: 700,
          padding: 20,
          background: `linear-gradient(135deg, ${C.accentLime}15 0%, ${C.accentLime}05 100%)`,
          border: `2px solid ${C.accentLime}`,
          borderRadius: 8,
        }}>
          <p style={{
            margin: '0 0 12px 0',
            fontFamily: F.syne,
            fontWeight: 700,
            fontSize: 16,
            color: C.accentLime,
          }}>
            🎯 Mission Complete
          </p>
          <p style={{
            margin: 0,
            fontFamily: F.mono,
            fontSize: 12,
            color: C.textPrimary,
            lineHeight: 1.7,
          }}>
            <strong>Sarah</strong> joined a pool in 2 minutes and now pays <strong>$4.99/mo</strong> instead of $15.99 (69% savings).
            <br />
            <strong>Marcus</strong> collected <strong>$14.97</strong> this month, covering his Netflix entirely for free.
            <br /><br />
            <span style={{ color: C.accentLime }}>▸</span> Everyone wins. No awkward chats. Pure automation.
          </p>
        </div>
      </div>
    </div>
  );
}
