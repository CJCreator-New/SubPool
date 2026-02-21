import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { C, F } from '../../tokens';
import { Avatar } from './Avatar';
import { Button } from './Button';

// ─── Nav config ──────────────────────────────────────────────────────────────

const navSections = [
  {
    label: 'DISCOVER',
    items: [
      { icon: '🌐', label: 'Browse',     path: '/' },
      { icon: '📈', label: 'Market',     path: '/market' },
      { icon: '🎯', label: 'Wishlist',   path: '/wishlist' },
      { icon: '🗂️', label: 'My Pools',  path: '/my-pools' },
      { icon: '➕', label: 'List a Pool', path: '/list' },
    ],
  },
  {
    label: 'MANAGE',
    items: [
      { icon: '💰', label: 'Ledger',         path: '/ledger',        badge: '3' },
      { icon: '💵', label: 'Payouts',        path: '/payouts' },
      { icon: '📅', label: 'Billing',        path: '/billing' },
      { icon: '💬', label: 'Messages',       path: '/messages',      badge: '4' },
      { icon: '🔔', label: 'Notifications',  path: '/notifications', badge: '2' },
    ],
  },
  {
    label: 'ACCOUNT',
    items: [
      { icon: '👤', label: 'Profile', path: '/profile' },
      { icon: '📊', label: 'Savings', path: '/savings' },
    ],
  },
  {
    label: 'DEV',
    items: [
      { icon: '🎨', label: 'Design System', path: '/design-system' },
      { icon: '🛠️', label: 'Empty States', path: '/empty-states' },
    ],
  },
];

const pageTitles: Record<string, string> = {
  '/':              'Browse Pools',
  '/market':        'Market Intelligence',
  '/wishlist':      'Wishlist',
  '/my-pools':      'My Pools',
  '/list':          'List a Pool',
  '/ledger':        'Ledger',
  '/payouts':       'Payouts',
  '/billing':       'Billing',
  '/messages':      'Messages',
  '/notifications': 'Notifications',
  '/profile':       'Profile',
  '/savings':       'Savings',
  '/payment/method':  'Payment Method',
  '/payment/confirm': 'Confirm Payment',
  '/empty-states':    'Empty States',
  '/design-system':   'Design System',
};

const bottomTabs = [
  { icon: '🌐', label: 'Browse',   path: '/' },
  { icon: '🗂️', label: 'My Pools', path: '/my-pools' },
  { icon: '➕', label: 'List',     path: '/list' },
  { icon: '💰', label: 'Ledger',   path: '/ledger' },
  { icon: '👤', label: 'Profile',  path: '/profile' },
];

// ─── Sidebar Nav Item ─────────────────────────────────────────────────────────

function SideNavItem({
  icon,
  label,
  path,
  badge,
  active,
  onClick,
}: {
  icon: string;
  label: string;
  path: string;
  badge?: string;
  active: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const color = active ? C.accentLime : hovered ? C.textPrimary : C.textMuted;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        height: 40,
        padding: '0 20px',
        borderLeft: `3px solid ${active ? C.accentLime : 'transparent'}`,
        backgroundColor: active
          ? 'rgba(200,241,53,0.05)'
          : hovered
          ? C.bgHover
          : 'transparent',
        cursor: 'pointer',
        transition: 'all 0.14s ease',
        userSelect: 'none',
        boxSizing: 'border-box',
      }}
    >
      <span style={{ fontSize: 15, flexShrink: 0, lineHeight: 1 }}>{icon}</span>
      <span
        style={{
          fontFamily: F.syne,
          fontWeight: 600,
          fontSize: 14,
          color,
          flex: 1,
          transition: 'color 0.14s ease',
        }}
      >
        {label}
      </span>
      {badge && (
        <span
          style={{
            padding: '2px 7px',
            borderRadius: 100,
            backgroundColor: C.accentLime,
            color: C.bgBase,
            fontFamily: F.mono,
            fontWeight: 500,
            fontSize: 10,
          }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({
  pathname,
  navigate,
}: {
  pathname: string;
  navigate: (p: string) => void;
}) {
  return (
    <aside
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 220,
        height: '100vh',
        backgroundColor: C.bgSurface,
        borderRight: `1px solid ${C.borderDefault}`,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 20,
        overflowY: 'auto',
      }}
    >
      {/* Logo area */}
      <div
        style={{
          padding: '24px 20px',
          borderBottom: `1px solid ${C.borderDefault}`,
          flexShrink: 0,
        }}
      >
        {/* Wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 4 }}>
          <span
            style={{
              fontFamily: F.syne,
              fontWeight: 800,
              fontSize: 20,
              color: C.textPrimary,
              letterSpacing: '-0.5px',
            }}
          >
            Sub
          </span>
          <span
            style={{
              fontFamily: F.syne,
              fontWeight: 800,
              fontSize: 20,
              color: C.accentLime,
              letterSpacing: '-0.5px',
            }}
          >
            Pool
          </span>
        </div>
        <span
          style={{
            fontFamily: F.mono,
            fontWeight: 400,
            fontSize: 10,
            color: C.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '1.2px',
          }}
        >
          Subscription marketplace
        </span>
      </div>

      {/* Nav sections */}
      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
        {navSections.map((section) => (
          <div key={section.label}>
            <div
              style={{
                padding: '16px 20px 6px',
              }}
            >
              <span
                style={{
                  fontFamily: F.mono,
                  fontWeight: 500,
                  fontSize: 9,
                  textTransform: 'uppercase',
                  letterSpacing: '1.4px',
                  color: C.textMuted,
                }}
              >
                {section.label}
              </span>
            </div>
            {section.items.map((item) => (
              <SideNavItem
                key={item.path}
                icon={item.icon}
                label={item.label}
                path={item.path}
                badge={'badge' in item ? (item as { badge?: string }).badge : undefined}
                active={pathname === item.path}
                onClick={() => navigate(item.path)}
              />
            ))}
          </div>
        ))}
      </nav>

      {/* User chip */}
      <div
        style={{
          padding: '16px 20px',
          borderTop: `1px solid ${C.borderDefault}`,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexShrink: 0,
        }}
      >
        <Avatar initials="Y" size="md" color={C.accentLime} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
          <span
            style={{
              fontFamily: F.syne,
              fontWeight: 600,
              fontSize: 13,
              color: C.textPrimary,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            You
          </span>
          <span
            style={{
              fontFamily: F.mono,
              fontWeight: 400,
              fontSize: 11,
              color: C.textMuted,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            @yourusername
          </span>
        </div>
        {/* Settings dot menu */}
        <div
          style={{
            width: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            opacity: 0.4,
            fontSize: 16,
          }}
        >
          ···
        </div>
      </div>
    </aside>
  );
}

// ─── Topbar ───────────────────────────────────────────────────────────────────

function Topbar({
  title,
  isMobile,
  onListPool,
}: {
  title: string;
  isMobile: boolean;
  onListPool: () => void;
}) {
  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: isMobile ? 0 : 220,
        right: 0,
        height: 60,
        backgroundColor: 'rgba(14,14,14,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${C.borderDefault}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '0 20px' : '0 32px',
        zIndex: 15,
        boxSizing: 'border-box',
      }}
    >
      {/* Left: title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginRight: 8 }}>
            <span style={{ fontFamily: F.syne, fontWeight: 800, fontSize: 17, color: C.textPrimary }}>Sub</span>
            <span style={{ fontFamily: F.syne, fontWeight: 800, fontSize: 17, color: C.accentLime }}>Pool</span>
          </div>
        )}
        <span
          style={{
            fontFamily: F.syne,
            fontWeight: 700,
            fontSize: 15,
            color: C.textPrimary,
          }}
        >
          {title}
        </span>
      </div>

      {/* Right: actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {!isMobile && (
          <Button variant="primary" onClick={onListPool}>
            ➕ List a Pool
          </Button>
        )}
        {/* Notification bell on mobile */}
        {isMobile && (
          <div
            style={{
              position: 'relative',
              cursor: 'pointer',
              fontSize: 18,
              lineHeight: 1,
            }}
          >
            🔔
            <span
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                width: 14,
                height: 14,
                borderRadius: 100,
                backgroundColor: C.accentLime,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: F.mono,
                fontWeight: 500,
                fontSize: 8,
                color: C.bgBase,
              }}
            >
              2
            </span>
          </div>
        )}
      </div>
    </header>
  );
}

// ─── Bottom Tab Bar (mobile) ──────────────────────────────────────────────────

function BottomTabBar({
  pathname,
  navigate,
}: {
  pathname: string;
  navigate: (p: string) => void;
}) {
  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 68,
        backgroundColor: C.bgSurface,
        borderTop: `1px solid ${C.borderDefault}`,
        display: 'flex',
        alignItems: 'stretch',
        zIndex: 20,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {bottomTabs.map((tab) => {
        const isActive = pathname === tab.path;
        const color = isActive ? C.accentLime : C.textMuted;
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px 0',
              position: 'relative',
            }}
          >
            {/* Active indicator dot */}
            {isActive && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 20,
                  height: 2,
                  backgroundColor: C.accentLime,
                  borderRadius: '0 0 2px 2px',
                }}
              />
            )}
            <span style={{ fontSize: tab.label === 'List' ? 18 : 17, lineHeight: 1 }}>
              {tab.icon}
            </span>
            <span
              style={{
                fontFamily: F.syne,
                fontWeight: isActive ? 700 : 400,
                fontSize: 10,
                color,
                transition: 'color 0.14s ease',
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

// ─── AppShell (root layout) ───────────────────────────────────────────────────

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const pageTitle = pageTitles[location.pathname] ?? 'SubPool';

  return (
    <div
      style={{
        backgroundColor: C.bgBase,
        minHeight: '100vh',
        fontFamily: F.syne,
      }}
    >
      {/* Sidebar — desktop only */}
      {!isMobile && (
        <Sidebar pathname={location.pathname} navigate={navigate} />
      )}

      {/* Topbar */}
      <Topbar
        title={pageTitle}
        isMobile={isMobile}
        onListPool={() => navigate('/list')}
      />

      {/* Main content area */}
      <main
        style={{
          marginLeft: isMobile ? 0 : 220,
          paddingTop: 60,
          paddingBottom: isMobile ? 80 : 0,
          minHeight: '100vh',
          backgroundColor: C.bgBase,
          boxSizing: 'border-box',
        }}
      >
        <div style={{ padding: isMobile ? 20 : 32 }}>
          <Outlet />
        </div>
      </main>

      {/* Bottom tab bar — mobile only */}
      {isMobile && (
        <BottomTabBar pathname={location.pathname} navigate={navigate} />
      )}
    </div>
  );
}