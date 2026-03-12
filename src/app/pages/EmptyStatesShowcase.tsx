import React, { useState } from 'react';
import { C, F } from '../tokens';
import { EmptyState } from '../components/subpool/EmptyState';
import { Button } from '../components/subpool/Button';
import { PoolCard } from '../components/subpool/PoolCard';

// Layout wrapper for the showcase
const ShowcaseSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
    <h3 style={{ fontFamily: F.mono, fontSize: 14, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 1 }}>{title}</h3>
    <div style={{ 
      border: `1px solid ${C.borderDefault}`, 
      borderRadius: 12, 
      overflow: 'hidden',
      backgroundColor: C.bgBase,
      position: 'relative',
      minHeight: 300,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {children}
    </div>
  </div>
);

export function EmptyStatesShowcase() {
  const [chatMessage, setChatMessage] = useState('');

  return (
    <div style={{ 
      padding: 40, 
      backgroundColor: C.bgBase, 
      minHeight: '100vh',
      color: C.textPrimary 
    }}>
      <h1 style={{ fontFamily: F.syne, fontSize: 32, marginBottom: 40 }}>Empty States & Errors</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 40 }}>
        
        {/* 1. Browse — No results */}
        <ShowcaseSection title="1. Browse — No results">
          <EmptyState
            emoji="🔭"
            title="No pools found"
            body="Try removing some filters or search for a different platform"
            action={<Button variant="outline">Clear filters</Button>}
          />
        </ShowcaseSection>

        {/* 2. My Pools — First time */}
        <ShowcaseSection title="2. My Pools — First time">
          <EmptyState
            emoji="🏊"
            title="Your first pool awaits"
            body="List your first subscription slot and start splitting costs"
            action={<Button variant="primary">List a Pool</Button>}
          />
        </ShowcaseSection>

        {/* 3. My Pools — No memberships */}
        <ShowcaseSection title="3. My Pools — No memberships">
          <EmptyState
            emoji="🎯"
            title="You haven't joined any pools"
            body="Browse the marketplace to find your first shared subscription"
            action={<Button variant="primary">Browse Pools</Button>}
          />
        </ShowcaseSection>

        {/* 4. Ledger — No entries */}
        <ShowcaseSection title="4. Ledger — No entries">
          <EmptyState
            emoji="🎉"
            title="You're all caught up!"
            body="All payments for this cycle are settled. Nice work."
          />
        </ShowcaseSection>

        {/* 5. Notifications — All read */}
        <ShowcaseSection title="5. Notifications — All read">
          <EmptyState
            emoji="🔔"
            title="No new notifications"
            body="We'll let you know when something needs your attention"
          />
        </ShowcaseSection>

        {/* 6. Chat — No messages */}
        <ShowcaseSection title="6. Chat — No messages">
          <EmptyState
            emoji="💬"
            title="Start the conversation"
            body="Introduce yourself to the pool — owners and members appreciate a quick hello"
            action={
              <input
                autoFocus
                type="text"
                placeholder="Type a message..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                style={{
                  width: '100%',
                  maxWidth: 300,
                  padding: '12px 16px',
                  backgroundColor: C.bgSurface,
                  border: `1px solid ${C.borderDefault}`,
                  borderRadius: 8,
                  color: C.textPrimary,
                  fontFamily: F.syne,
                  marginTop: 16,
                  outline: 'none'
                }}
              />
            }
          />
        </ShowcaseSection>

        {/* 7. Wishlist — No requests */}
        <ShowcaseSection title="7. Wishlist — No requests">
          <EmptyState
            emoji="🎯"
            title="No requests for this category"
            body="Be the first to post a request"
            action={<Button variant="primary">Post Request</Button>}
          />
        </ShowcaseSection>

        {/* 8. Search — No platforms */}
        <ShowcaseSection title="8. Search — No platforms">
          <EmptyState
            emoji="🔍"
            title="Can't find 'Hulu'?"
            body=""
            action={
              <a href="#" style={{ color: C.accentLime, fontFamily: F.syne, textDecoration: 'none', borderBottom: `1px solid ${C.accentLime}` }}>
                Suggest a platform
              </a>
            }
          />
        </ShowcaseSection>

        {/* 9. Pool Full (on card) */}
        <ShowcaseSection title="9. Pool Full (on card)">
          <div style={{ width: 340, padding: 20 }}>
            <PoolCard
              status="full"
              platformEmoji="N"
              platformName="Netflix"
              planName="Premium 4K"
              slotsTotal={4}
              slotsFilled={4}
              pricePerSlot="5.50"
              ownerInitials="JD"
              ownerName="John D."
              platformColor="#E50914"
            />
            <div style={{ marginTop: 16 }}>
                <Button variant="outline" style={{ width: '100%', gap: 8, justifyContent: 'center' }}>
                   <span role="img" aria-label="icon">💌</span> Notify me when a slot opens
                </Button>
            </div>
          </div>
        </ShowcaseSection>

        {/* 10. Network Error / Offline */}
        <ShowcaseSection title="10. Network Error / Offline">
           <EmptyState
            emoji="📡"
            title="You're offline"
            body="Check your connection and try again"
            action={<Button variant="primary">Retry</Button>}
          />
        </ShowcaseSection>

        {/* 11. Payment Failed - Modal */}
        <ShowcaseSection title="11. Payment Failed">
          <div style={{ 
            width: '100%', 
            height: '100%', 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backdropFilter: 'blur(4px)',
            position: 'absolute',
            inset: 0
          }}>
            <div style={{ 
              width: 320, 
              backgroundColor: C.bgSurface, 
              border: `1px solid ${C.borderDefault}`, 
              borderRadius: 12, 
              padding: 32, 
              textAlign: 'center',
              boxShadow: '0 24px 48px rgba(0,0,0,0.5)'
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
              <h3 style={{ fontFamily: F.syne, fontWeight: 700, fontSize: 20, color: C.textPrimary, marginBottom: 8 }}>
                Payment didn't go through
              </h3>
              <p style={{ fontFamily: F.syne, fontSize: 14, color: C.textMuted, lineHeight: 1.5, marginBottom: 24 }}>
                Your card ending in 4242 was declined
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Button variant="primary" style={{ width: '100%' }}>Try another card</Button>
                <Button variant="ghost" style={{ width: '100%' }}>Contact support</Button>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        {/* 12. Pool Removed */}
        <ShowcaseSection title="12. Pool Removed">
          <div style={{ width: '100%', padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Mock Notification */}
            <div style={{ 
              backgroundColor: C.bgSurface, 
              border: `1px solid ${C.borderDefault}`, 
              borderRadius: 8, 
              padding: 16, 
              marginBottom: 32,
              display: 'flex',
              gap: 12,
              alignItems: 'start',
              width: '100%',
              maxWidth: 400
            }}>
               <div style={{ fontSize: 20 }}>⚠️</div>
               <div>
                 <div style={{ fontFamily: F.syne, fontWeight: 700, fontSize: 14, color: C.textPrimary }}>Pool Removed</div>
                 <div style={{ fontFamily: F.mono, fontSize: 12, color: C.textMuted }}>You were removed from Netflix Standard</div>
               </div>
            </div>

            <EmptyState
              emoji="🚫"
              title="You were removed from Netflix Standard"
              body="The pool owner removed you. Browse for a new pool."
              action={<Button variant="primary">Find Similar Pools</Button>}
              style={{ padding: 0 }}
            />
          </div>
        </ShowcaseSection>

      </div>
    </div>
  );
}
