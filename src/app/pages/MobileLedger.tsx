import React, { useState } from 'react';
import { C, F } from '../tokens';
import { Avatar } from '../components/subpool/Avatar';
import { Button } from '../components/subpool/Button';

export function MobileLedger() {
  const [filter, setFilter] = useState<'owed' | 'paid'>('owed');

  const ledgerItems = [
    {
      id: '1',
      name: 'Alex M',
      avatar: 'A',
      amount: 6.0,
      pool: 'Netflix Standard',
      status: 'owed' as const,
      dueDate: 'Feb 28',
    },
    {
      id: '2',
      name: 'Sam T',
      avatar: 'S',
      amount: 3.49,
      pool: 'Spotify Duo',
      status: 'owed' as const,
      dueDate: 'Mar 1',
    },
    {
      id: '3',
      name: 'Jordan K',
      avatar: 'J',
      amount: 9.43,
      pool: 'YouTube Premium',
      status: 'owed' as const,
      dueDate: 'Mar 5',
    },
    {
      id: '4',
      name: 'Priya R',
      avatar: 'P',
      amount: 4.99,
      pool: 'Netflix Standard',
      status: 'paid' as const,
      paidDate: 'Feb 15',
    },
    {
      id: '5',
      name: 'Dev S',
      avatar: 'D',
      amount: 10.0,
      pool: 'ChatGPT Plus',
      status: 'paid' as const,
      paidDate: 'Feb 10',
    },
  ];

  const filteredItems = ledgerItems.filter((item) => item.status === filter);
  const totalOwed = ledgerItems
    .filter((item) => item.status === 'owed')
    .reduce((sum, item) => sum + item.amount, 0);

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 375,
        minHeight: '100vh',
        margin: '0 auto',
        backgroundColor: C.bgBase,
      }}
    >
      {/* Balance hero */}
      <div
        style={{
          padding: 24,
          backgroundColor: C.bgSurface,
          borderBottom: `1px solid ${C.borderDefault}`,
        }}
      >
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 10,
            color: C.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '1.2px',
            marginBottom: 12,
          }}
        >
          YOU'RE OWED
        </div>

        <div
          style={{
            fontFamily: F.syne,
            fontWeight: 800,
            fontSize: 40,
            color: C.accentLime,
            lineHeight: 1,
            marginBottom: 16,
          }}
        >
          ${totalOwed.toFixed(2)}
        </div>

        <Button
          variant="primary"
          style={{ width: '100%' }}
        >
          Collect All
        </Button>
      </div>

      {/* Filter toggles */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          padding: '16px 20px',
          backgroundColor: C.bgBase,
          borderBottom: `1px solid ${C.borderDefault}`,
        }}
      >
        <button
          onClick={() => setFilter('owed')}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: 6,
            backgroundColor: filter === 'owed' ? C.accentLime : C.bgSurface,
            border: `1px solid ${filter === 'owed' ? C.accentLime : C.borderDefault}`,
            cursor: 'pointer',
            fontFamily: F.syne,
            fontWeight: 700,
            fontSize: 13,
            color: filter === 'owed' ? C.bgBase : C.textMuted,
            transition: 'all 0.2s ease',
          }}
        >
          Owed
        </button>

        <button
          onClick={() => setFilter('paid')}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: 6,
            backgroundColor: filter === 'paid' ? C.accentLime : C.bgSurface,
            border: `1px solid ${filter === 'paid' ? C.accentLime : C.borderDefault}`,
            cursor: 'pointer',
            fontFamily: F.syne,
            fontWeight: 700,
            fontSize: 13,
            color: filter === 'paid' ? C.bgBase : C.textMuted,
            transition: 'all 0.2s ease',
          }}
        >
          Paid
        </button>
      </div>

      {/* Ledger list items */}
      <div>
        {filteredItems.map((item) => (
          <LedgerItemCard key={item.id} item={item} />
        ))}
      </div>

      {/* Empty state */}
      {filteredItems.length === 0 && (
        <div
          style={{
            padding: 40,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>💰</div>
          <p
            style={{
              fontFamily: F.syne,
              fontSize: 14,
              color: C.textMuted,
              margin: 0,
            }}
          >
            No {filter} payments
          </p>
        </div>
      )}
    </div>
  );
}

function LedgerItemCard({
  item,
}: {
  item: {
    name: string;
    avatar: string;
    amount: number;
    pool: string;
    status: 'owed' | 'paid';
    dueDate?: string;
    paidDate?: string;
  };
}) {
  const [swiped, setSwiped] = useState(false);
  const [touchStart, setTouchStart] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchEnd - touchStart;

    if (item.status === 'owed' && diff > 50) {
      setSwiped(true);
    } else if (diff < -50) {
      setSwiped(false);
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderBottom: `1px solid ${C.borderDefault}`,
      }}
    >
      {/* Swipe reveal action (for owed items) */}
      {item.status === 'owed' && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: 100,
            backgroundColor: C.accentLime,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: F.syne,
            fontWeight: 700,
            fontSize: 13,
            color: C.bgBase,
          }}
        >
          Remind
        </div>
      )}

      {/* Main card content */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          position: 'relative',
          padding: '16px 20px',
          backgroundColor: C.bgBase,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          transform: swiped ? 'translateX(50px)' : 'translateX(0)',
          transition: 'transform 0.2s ease',
        }}
      >
        <Avatar initials={item.avatar} size="md" color={C.accentLime} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: F.syne,
              fontWeight: 600,
              fontSize: 14,
              color: C.textPrimary,
              marginBottom: 4,
            }}
          >
            {item.name}
          </div>

          <div
            style={{
              fontFamily: F.syne,
              fontSize: 12,
              color: C.textMuted,
              marginBottom: 2,
            }}
          >
            {item.pool}
          </div>

          {item.dueDate && (
            <div
              style={{
                fontFamily: F.mono,
                fontSize: 11,
                color: C.textMuted,
              }}
            >
              Due: {item.dueDate}
            </div>
          )}

          {item.paidDate && (
            <div
              style={{
                fontFamily: F.mono,
                fontSize: 11,
                color: C.statusSuccess,
              }}
            >
              Paid: {item.paidDate}
            </div>
          )}
        </div>

        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontFamily: F.mono,
              fontWeight: 700,
              fontSize: 16,
              color: item.status === 'owed' ? C.accentLime : C.statusSuccess,
              marginBottom: 4,
            }}
          >
            ${item.amount.toFixed(2)}
          </div>

          <div
            style={{
              padding: '3px 8px',
              border: `1px solid ${
                item.status === 'owed' ? C.statusWarning : C.statusSuccess
              }`,
              borderRadius: 100,
              fontFamily: F.mono,
              fontSize: 9,
              fontWeight: 600,
              color: item.status === 'owed' ? C.statusWarning : C.statusSuccess,
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
            }}
          >
            {item.status}
          </div>
        </div>
      </div>
    </div>
  );
}
