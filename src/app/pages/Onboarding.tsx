import React, { useState } from 'react';
import { C, F } from '../tokens';
import { Button } from '../components/subpool/Button';
import { useNavigate } from 'react-router';

export function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const slides = [
    {
      emoji: '🌐',
      title: 'Find your pool',
      description: 'Browse 100+ open subscription slots from real people',
      illustration: (
        <div
          style={{
            width: '100%',
            height: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            position: 'relative',
          }}
        >
          {[
            { emoji: '🎬', top: '10%', left: '20%', rotation: -8 },
            { emoji: '🎵', top: '40%', left: '60%', rotation: 5 },
            { emoji: '🎨', top: '65%', left: '30%', rotation: -3 },
          ].map((card, idx) => (
            <div
              key={idx}
              style={{
                position: 'absolute',
                top: card.top,
                left: card.left,
                width: 80,
                height: 80,
                backgroundColor: C.bgSurface,
                border: `1px solid ${C.borderDefault}`,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32,
                transform: `rotate(${card.rotation}deg)`,
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              }}
            >
              {card.emoji}
            </div>
          ))}
        </div>
      ),
    },
    {
      emoji: '💸',
      title: 'Split the cost',
      description: 'Pay 40–75% less than solo pricing. Track it all here.',
      illustration: (
        <div
          style={{
            width: '100%',
            height: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 120,
              height: 120,
              position: 'relative',
            }}
          >
            {/* Coin split graphic */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: 60,
                height: 120,
                backgroundColor: C.accentLime,
                borderRadius: '120px 0 0 120px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                transform: 'translateX(-10px)',
              }}
            >
              💰
            </div>
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                width: 60,
                height: 120,
                backgroundColor: C.accentLime,
                borderRadius: '0 120px 120px 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                transform: 'translateX(10px)',
              }}
            >
              💰
            </div>
          </div>
        </div>
      ),
    },
    {
      emoji: '⭐',
      title: 'Trust built in',
      description: 'Verified members. Ratings. No more ghosting.',
      illustration: (
        <div
          style={{
            width: '100%',
            height: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <div
              key={star}
              style={{
                fontSize: 40,
                color: C.accentLime,
                animation: `starPulse ${0.5 + star * 0.1}s ease-in-out infinite`,
              }}
            >
              ⭐
            </div>
          ))}
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate('/');
    }
  };

  const handleSkip = () => {
    navigate('/');
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 375,
        minHeight: '100vh',
        margin: '0 auto',
        backgroundColor: C.bgBase,
        display: 'flex',
        flexDirection: 'column',
        padding: 24,
        boxSizing: 'border-box',
      }}
    >
      {/* Skip button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 40 }}>
        <Button variant="ghost" onClick={handleSkip} size="sm">
          Skip
        </Button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {/* Emoji */}
        <div
          style={{
            fontSize: 64,
            textAlign: 'center',
            marginBottom: 32,
          }}
        >
          {slides[currentSlide].emoji}
        </div>

        {/* Illustration */}
        <div style={{ marginBottom: 40 }}>
          {slides[currentSlide].illustration}
        </div>

        {/* Title */}
        <h1
          style={{
            fontFamily: F.syne,
            fontWeight: 800,
            fontSize: 32,
            color: C.textPrimary,
            textAlign: 'center',
            margin: '0 0 16px 0',
          }}
        >
          {slides[currentSlide].title}
        </h1>

        {/* Description */}
        <p
          style={{
            fontFamily: F.syne,
            fontSize: 16,
            color: C.textMuted,
            textAlign: 'center',
            margin: 0,
            lineHeight: 1.6,
            maxWidth: 300,
            alignSelf: 'center',
          }}
        >
          {slides[currentSlide].description}
        </p>
      </div>

      {/* Bottom section */}
      <div>
        {/* Dot indicator */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 8,
            marginBottom: 32,
          }}
        >
          {slides.map((_, idx) => (
            <div
              key={idx}
              style={{
                width: idx === currentSlide ? 24 : 8,
                height: 8,
                borderRadius: 100,
                backgroundColor: idx === currentSlide ? C.accentLime : C.borderDefault,
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>

        {/* Next button */}
        <Button
          variant="primary"
          onClick={handleNext}
          style={{ width: '100%', height: 52, fontSize: 15 }}
        >
          {currentSlide < slides.length - 1 ? 'Next' : 'Get Started'}
        </Button>
      </div>

      <style>
        {`
          @keyframes starPulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
          }
        `}
      </style>
    </div>
  );
}
