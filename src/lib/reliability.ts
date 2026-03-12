import type { Profile } from './types';

export interface HostReliability {
  responseTimeMinutes: number;
  approvalRatePct: number;
  onTimeRatePct: number;
  tier: 'excellent' | 'good' | 'new';
  label: string;
}

function hash(input: string): number {
  let acc = 0;
  for (let i = 0; i < input.length; i += 1) acc += input.charCodeAt(i);
  return acc;
}

export function deriveHostReliability(profile: Profile | undefined, seed = ''): HostReliability {
  const base = hash(`${profile?.id ?? 'guest'}:${seed}`);
  const rating = profile?.rating ?? 0;
  const reviews = profile?.review_count ?? 0;

  const responseTimeMinutes = Math.max(8, 180 - Math.round(rating * 20) - (base % 35));
  const approvalRatePct = Math.min(99, Math.max(62, 72 + Math.round(rating * 4) + Math.min(12, reviews / 2)));
  const onTimeRatePct = Math.min(99, Math.max(70, 74 + Math.round(rating * 5) + Math.min(10, reviews / 3)));

  if (reviews < 3) {
    return {
      responseTimeMinutes,
      approvalRatePct: Math.max(60, approvalRatePct - 8),
      onTimeRatePct: Math.max(68, onTimeRatePct - 6),
      tier: 'new',
      label: 'New host',
    };
  }

  if (rating >= 4.7 && approvalRatePct >= 88) {
    return { responseTimeMinutes, approvalRatePct, onTimeRatePct, tier: 'excellent', label: 'Reliable host' };
  }

  return { responseTimeMinutes, approvalRatePct, onTimeRatePct, tier: 'good', label: 'Trusted host' };
}
