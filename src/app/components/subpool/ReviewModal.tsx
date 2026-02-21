import React, { useState } from 'react';
import { C, F } from '../../tokens';
import { Button } from './Button';

interface ReviewModalProps {
  onClose: () => void;
}

export function ReviewModal({ onClose }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  const displayRating = hoverRating || rating;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 520,
          backgroundColor: C.bgSurface,
          border: `1px solid ${C.borderDefault}`,
          borderRadius: 6,
          padding: 32,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 64px rgba(0,0,0,0.8)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: 'transparent',
            border: 'none',
            color: C.textMuted,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
          }}
        >
          ✕
        </button>

        {/* Heading */}
        <h2
          style={{
            margin: '0 0 8px',
            fontFamily: F.syne,
            fontWeight: 800,
            fontSize: 22,
            color: C.textPrimary,
          }}
        >
          Leave a Review
        </h2>
        <p
          style={{
            margin: '0 0 24px',
            fontFamily: F.mono,
            fontWeight: 400,
            fontSize: 11,
            color: C.textMuted,
          }}
        >
          Help other members make informed decisions
        </p>

        {/* Star selector */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 8,
            marginBottom: 24,
          }}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 4,
                fontSize: 32,
                lineHeight: 1,
                transition: 'transform 0.15s ease',
                color: star <= displayRating ? C.accentLime : C.borderDefault,
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.9)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              ★
            </button>
          ))}
        </div>

        {rating > 0 && (
          <div
            style={{
              fontFamily: F.mono,
              fontWeight: 500,
              fontSize: 12,
              color: C.textMuted,
              textAlign: 'center',
              marginBottom: 20,
            }}
          >
            {rating === 5 && '⭐ Excellent'}
            {rating === 4 && '👍 Good'}
            {rating === 3 && '😐 Average'}
            {rating === 2 && '👎 Poor'}
            {rating === 1 && '❌ Terrible'}
          </div>
        )}

        {/* Text area */}
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Share your experience..."
          style={{
            width: '100%',
            minHeight: 120,
            padding: 16,
            fontFamily: F.syne,
            fontWeight: 400,
            fontSize: 14,
            color: C.textPrimary,
            backgroundColor: C.bgBase,
            border: `1px solid ${C.borderDefault}`,
            borderRadius: 6,
            resize: 'vertical',
            marginBottom: 20,
            outline: 'none',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = C.borderAccent;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = C.borderDefault;
          }}
        />

        {/* Submit button */}
        <Button
          variant="primary"
          style={{ width: '100%' }}
          forceState={rating > 0 && reviewText.trim().length > 0 ? 'default' : 'disabled'}
          onClick={() => {
            if (rating > 0 && reviewText.trim().length > 0) {
              onClose();
            }
          }}
        >
          Submit Review
        </Button>
      </div>
    </div>
  );
}
