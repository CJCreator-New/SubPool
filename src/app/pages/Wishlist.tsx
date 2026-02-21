import React, { useState } from 'react';
import { C, F } from '../tokens';
import { Button } from '../components/subpool/Button';
import { Avatar } from '../components/subpool/Avatar';
import { StatusPill } from '../components/subpool/StatusPill';

interface WishlistRequest {
  id: string;
  platform: string;
  platformIcon: string;
  plan: string;
  budget: number;
  urgency: string;
  category: string;
  note: string;
  requester: {
    name: string;
    avatar: string;
    rating: number;
  };
  timeAgo: string;
}

export function Wishlist() {
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [budget, setBudget] = useState('');
  const [note, setNote] = useState('');
  const [urgency, setUrgency] = useState('ASAP');
  const [errors, setErrors] = useState<string[]>([]);

  const isFormValid = selectedPlatform && Number(budget) > 0 && note.length >= 10;

  const categories = ['All', 'Entertainment', 'Work', 'Creative', 'AI Tools'];

  const requests: WishlistRequest[] = [
    {
      id: '1',
      platform: 'Figma',
      platformIcon: '🎨',
      plan: 'Professional',
      budget: 8,
      urgency: 'ASAP',
      category: 'Creative',
      note: "I'm a designer using Figma daily for freelance work, looking for a reliable pool owner...",
      requester: { name: 'Maya K', avatar: 'M', rating: 4.9 },
      timeAgo: '2h ago',
    },
    {
      id: '2',
      platform: 'ChatGPT',
      platformIcon: '🤖',
      plan: 'Plus',
      budget: 12,
      urgency: 'Flexible',
      category: 'AI Tools',
      note: 'Developer, heavy API user. Have been in 3 pools before, always on time with payments...',
      requester: { name: 'Dev S', avatar: 'D', rating: 5.0 },
      timeAgo: '4h ago',
    },
    {
      id: '3',
      platform: 'Netflix',
      platformIcon: '🎬',
      plan: '4K',
      budget: 6,
      urgency: 'Within a week',
      category: 'Entertainment',
      note: 'Family of 2, reliable payer. Looking for a long-term pool arrangement...',
      requester: { name: 'Priya M', avatar: 'P', rating: 4.8 },
      timeAgo: '6h ago',
    },
    {
      id: '4',
      platform: 'Notion',
      platformIcon: '📋',
      plan: 'Team',
      budget: 5,
      urgency: 'ASAP',
      category: 'Work',
      note: 'Startup founder, need collaboration features. Will be a committed long-term member...',
      requester: { name: 'Alex R', avatar: 'A', rating: 4.7 },
      timeAgo: '1d ago',
    },
    {
      id: '5',
      platform: 'Spotify',
      platformIcon: '🎵',
      plan: 'Family',
      budget: 4,
      urgency: 'Flexible',
      category: 'Entertainment',
      note: 'Music producer, always on time. Have payment history of 100% across 2 pools...',
      requester: { name: 'Jordan L', avatar: 'J', rating: 5.0 },
      timeAgo: '1d ago',
    },
    {
      id: '6',
      platform: 'Adobe CC',
      platformIcon: '☁️',
      plan: 'All Apps',
      budget: 20,
      urgency: 'Within a week',
      category: 'Creative',
      note: 'Freelance photographer, verified identity. Need Photoshop and Lightroom daily...',
      requester: { name: 'Sam T', avatar: 'S', rating: 4.9 },
      timeAgo: '2d ago',
    },
  ];

  const platforms = [
    { icon: '🎬', name: 'Netflix' },
    { icon: '🎵', name: 'Spotify' },
    { icon: '🎨', name: 'Figma' },
    { icon: '▶️', name: 'YouTube' },
    { icon: '🤖', name: 'ChatGPT' },
    { icon: '📋', name: 'Notion' },
    { icon: '☁️', name: 'Adobe CC' },
    { icon: '🎮', name: 'Xbox' },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1
            style={{
              fontFamily: F.syne,
              fontWeight: 800,
              fontSize: 28,
              color: C.textPrimary,
              margin: '0 0 4px 0',
            }}
          >
            🎯 Wishlist
          </h1>
          <p
            style={{
              fontFamily: F.syne,
              fontSize: 14,
              color: C.textMuted,
              margin: 0,
            }}
          >
            See what members are looking for
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowPostModal(true)}>
          Post a Request
        </Button>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}
      >
        <div
          style={{
            backgroundColor: C.bgSurface,
            border: `1px solid ${C.borderDefault}`,
            borderRadius: 6,
            padding: 20,
          }}
        >
          <div
            style={{
              fontFamily: F.mono,
              fontSize: 10,
              color: C.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '1.2px',
              marginBottom: 8,
            }}
          >
            OPEN REQUESTS
          </div>
          <div
            style={{
              fontFamily: F.syne,
              fontWeight: 800,
              fontSize: 32,
              color: C.textPrimary,
              marginBottom: 4,
            }}
          >
            89
          </div>
          <div
            style={{
              fontFamily: F.syne,
              fontSize: 12,
              color: C.textMuted,
            }}
          >
            from 89 members
          </div>
        </div>

        <div
          style={{
            backgroundColor: C.bgSurface,
            border: `1px solid ${C.borderDefault}`,
            borderRadius: 6,
            padding: 20,
          }}
        >
          <div
            style={{
              fontFamily: F.mono,
              fontSize: 10,
              color: C.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '1.2px',
              marginBottom: 8,
            }}
          >
            FULFILLED THIS WEEK
          </div>
          <div
            style={{
              fontFamily: F.syne,
              fontWeight: 800,
              fontSize: 32,
              color: C.textPrimary,
              marginBottom: 4,
            }}
          >
            23
          </div>
          <div
            style={{
              fontFamily: F.syne,
              fontSize: 12,
              color: C.statusSuccess,
            }}
          >
            ↑ 40% vs last week
          </div>
        </div>

        <div
          style={{
            backgroundColor: C.bgSurface,
            border: `1px solid ${C.borderDefault}`,
            borderRadius: 6,
            padding: 20,
          }}
        >
          <div
            style={{
              fontFamily: F.mono,
              fontSize: 10,
              color: C.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '1.2px',
              marginBottom: 8,
            }}
          >
            AVG. MATCH TIME
          </div>
          <div
            style={{
              fontFamily: F.syne,
              fontWeight: 800,
              fontSize: 32,
              color: C.textPrimary,
              marginBottom: 4,
            }}
          >
            4.2h
          </div>
          <div
            style={{
              fontFamily: F.syne,
              fontSize: 12,
              color: C.textMuted,
            }}
          >
            from request to approval
          </div>
        </div>
      </div>

      {/* Filter row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 8, flex: 1, flexWrap: 'wrap' }}>
          {categories.map((cat) => {
            const isActive = cat === selectedCategory;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 100,
                  backgroundColor: isActive ? C.accentLime : 'transparent',
                  border: `1px solid ${isActive ? C.accentLime : C.borderDefault}`,
                  color: isActive ? C.bgBase : C.textPrimary,
                  fontFamily: F.syne,
                  fontWeight: isActive ? 700 : 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <select
          style={{
            padding: '8px 16px',
            backgroundColor: C.bgSurface,
            border: `1px solid ${C.borderDefault}`,
            borderRadius: 6,
            color: C.textPrimary,
            fontFamily: F.syne,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <option>Most Recent</option>
          <option>Highest Budget</option>
          <option>Urgent First</option>
        </select>
      </div>

      {/* Request cards grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))',
          gap: 16,
        }}
      >
        {requests.map((req) => (
          <div
            key={req.id}
            style={{
              backgroundColor: C.bgSurface,
              border: `1px solid ${C.borderDefault}`,
              borderRadius: 6,
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            {/* Top row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 6,
                  backgroundColor: C.bgHover,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                }}
              >
                {req.platformIcon}
              </div>

              <div style={{ flex: 1 }}>
                <span
                  style={{
                    fontFamily: F.syne,
                    fontWeight: 600,
                    fontSize: 14,
                    color: C.textPrimary,
                  }}
                >
                  {req.platform} {req.plan}
                </span>
              </div>

              <span
                style={{
                  fontFamily: F.mono,
                  fontSize: 11,
                  color: C.textMuted,
                }}
              >
                {req.timeAgo}
              </span>

              <StatusPill status={req.category === 'Creative' ? 'active' : 'pending'} label={req.category} />
            </div>

            {/* Main content */}
            <div>
              <h3
                style={{
                  fontFamily: F.syne,
                  fontWeight: 700,
                  fontSize: 16,
                  color: C.textPrimary,
                  margin: '0 0 8px 0',
                }}
              >
                Looking for {req.platform} {req.plan}
              </h3>

              <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                <span
                  style={{
                    fontFamily: F.mono,
                    fontSize: 12,
                    color: C.textMuted,
                  }}
                >
                  Budget: up to{' '}
                  <span style={{ color: C.accentLime, fontWeight: 600 }}>
                    ${req.budget}/mo
                  </span>
                </span>
                <span
                  style={{
                    fontFamily: F.mono,
                    fontSize: 12,
                    color: C.textMuted,
                  }}
                >
                  Need by: {req.urgency}
                </span>
              </div>

              <p
                style={{
                  fontFamily: F.syne,
                  fontSize: 13,
                  color: C.textMuted,
                  margin: 0,
                  lineHeight: 1.5,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {req.note}
              </p>
            </div>

            {/* Bottom row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar initials={req.requester.avatar} size="sm" color={C.accentLime} />
                <div>
                  <div
                    style={{
                      fontFamily: F.syne,
                      fontWeight: 600,
                      fontSize: 13,
                      color: C.textPrimary,
                    }}
                  >
                    {req.requester.name}
                  </div>
                  <div
                    style={{
                      fontFamily: F.mono,
                      fontSize: 11,
                      color: C.textMuted,
                    }}
                  >
                    ⭐ {req.requester.rating}
                  </div>
                </div>
              </div>

              <Button variant="outline" size="sm">
                Offer a Slot
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Post Request Modal */}
      {showPostModal && (
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
          onClick={() => setShowPostModal(false)}
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
            <div style={{ padding: 24, borderBottom: `1px solid ${C.borderDefault}` }}>
              <h2
                style={{
                  fontFamily: F.syne,
                  fontWeight: 700,
                  fontSize: 22,
                  color: C.textPrimary,
                  margin: 0,
                }}
              >
                What are you looking for?
              </h2>
            </div>

            <div style={{ padding: 24, flex: 1, overflowY: 'auto' }}>
              {/* Platform picker */}
              <div style={{ marginBottom: 24 }}>
                <label
                  style={{
                    display: 'block',
                    fontFamily: F.syne,
                    fontWeight: 600,
                    fontSize: 13,
                    color: C.textPrimary,
                    marginBottom: 12,
                  }}
                >
                  Platform
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                  {platforms.map((platform) => {
                    const isSelected = selectedPlatform === platform.name;
                    return (
                      <button
                        key={platform.name}
                        onClick={() => setSelectedPlatform(platform.name)}
                        style={{
                          padding: '16px 12px',
                          backgroundColor: isSelected ? 'rgba(200,241,53,0.15)' : C.bgBase,
                          border: `1px solid ${isSelected ? C.accentLime : C.borderDefault}`,
                          borderRadius: 6,
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 8,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <span style={{ fontSize: 24 }}>{platform.icon}</span>
                        <span
                          style={{
                            fontFamily: F.syne,
                            fontSize: 11,
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

              {/* Budget input */}
              <div style={{ marginBottom: 24 }}>
                <label
                  style={{
                    display: 'block',
                    fontFamily: F.syne,
                    fontWeight: 600,
                    fontSize: 13,
                    color: C.textPrimary,
                    marginBottom: 12,
                  }}
                >
                  Max budget per slot
                </label>
                <div style={{ display: 'flex', gap: 12 }}>
                  <input
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    type="number"
                    placeholder="0"
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      backgroundColor: C.bgBase,
                      border: `1px solid ${C.borderDefault}`,
                      borderRadius: 6,
                      color: C.textPrimary,
                      fontFamily: F.mono,
                      fontSize: 14,
                      outline: 'none',
                    }}
                  />
                  <select
                    style={{
                      padding: '12px 16px',
                      backgroundColor: C.bgBase,
                      border: `1px solid ${C.borderDefault}`,
                      borderRadius: 6,
                      color: C.textPrimary,
                      fontFamily: F.syne,
                      fontSize: 13,
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <option>/month</option>
                    <option>/year</option>
                  </select>
                </div>
              </div>

              {/* Urgency */}
              <div style={{ marginBottom: 24 }}>
                <label
                  style={{
                    display: 'block',
                    fontFamily: F.syne,
                    fontWeight: 600,
                    fontSize: 13,
                    color: C.textPrimary,
                    marginBottom: 12,
                  }}
                >
                  Urgency
                </label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: C.bgBase,
                    border: `1px solid ${C.borderDefault}`,
                    borderRadius: 6,
                    color: C.textPrimary,
                    fontFamily: F.syne,
                    fontSize: 13,
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="ASAP">ASAP</option>
                  <option value="Within a week">Within a week</option>
                  <option value="Flexible">Flexible</option>
                </select>
              </div>

              {/* Note */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: F.syne,
                    fontWeight: 600,
                    fontSize: 13,
                    color: C.textPrimary,
                    marginBottom: 12,
                  }}
                >
                  Tell owners about yourself...
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Why do you need this subscription? Share your payment history, reliability, etc. (min 10 chars)"
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: C.bgBase,
                    border: `1px solid ${note.length > 0 && note.length < 10 ? C.statusDanger : C.borderDefault}`,
                    borderRadius: 6,
                    color: C.textPrimary,
                    fontFamily: F.syne,
                    fontSize: 13,
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>

            <div
              style={{
                padding: 24,
                borderTop: `1px solid ${C.borderDefault}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span
                style={{
                  fontFamily: F.mono,
                  fontSize: 11,
                  color: C.textMuted,
                }}
              >
                Visible for 30 days
              </span>
              <div style={{ display: 'flex', gap: 12 }}>
                <Button variant="ghost" onClick={() => setShowPostModal(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  disabled={!isFormValid}
                  onClick={() => {
                    import('sonner').then(m => m.toast.success('Wishlist request posted! Owners will be notified.'));
                    setShowPostModal(false);
                    // Reset form
                    setSelectedPlatform('');
                    setBudget('');
                    setNote('');
                  }}
                >
                  Post Request
                </Button>
              </div>
            </div>
          </div>
        </div>
      )
      }
    </div >
  );
}
