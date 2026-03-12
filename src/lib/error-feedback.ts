export interface UserFacingError {
  message: string;
  raw: string;
  isRateLimited: boolean;
  retryAfterSec?: number;
}

function normalizeError(error: unknown): string {
  if (!error) return '';
  if (typeof error === 'string') return error.trim();
  if (error instanceof Error) return error.message.trim();
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const msg = (error as { message?: unknown }).message;
    if (typeof msg === 'string') return msg.trim();
  }
  return String(error).trim();
}

function parseRetryAfterSeconds(raw: string): number | undefined {
  const secondMatch = raw.match(/(\d+)\s*seconds?/i);
  if (secondMatch) return Number(secondMatch[1]);
  if (/per\s+minute/i.test(raw)) return 60;
  return undefined;
}

export function getUserFacingError(error: unknown, action = 'complete this action'): UserFacingError {
  const raw = normalizeError(error);
  const lowered = raw.toLowerCase();

  if (!raw) {
    return {
      raw,
      isRateLimited: false,
      message: `Could not ${action}. Please try again.`,
    };
  }

  if (
    lowered.includes('rate limit') ||
    lowered.includes('too many requests') ||
    lowered.includes('max 10 mutations per minute')
  ) {
    const retryAfterSec = parseRetryAfterSeconds(raw);
    const retryText = retryAfterSec ? ` Please wait ${retryAfterSec}s and try again.` : ' Please wait a moment and try again.';
    return {
      raw,
      isRateLimited: true,
      retryAfterSec,
      message: `You are doing that too quickly.${retryText}`,
    };
  }

  if (lowered.includes('request already in progress')) {
    return {
      raw,
      isRateLimited: true,
      retryAfterSec: 5,
      message: 'A previous request is still processing. Please wait a few seconds.',
    };
  }

  if (
    lowered.includes('not signed in') ||
    lowered.includes('jwt expired') ||
    lowered.includes('invalid jwt') ||
    lowered.includes('session')
  ) {
    return {
      raw,
      isRateLimited: false,
      message: 'Your session expired. Please sign in again and retry.',
    };
  }

  if (
    lowered.includes('permission denied') ||
    lowered.includes('row-level security') ||
    lowered.includes('not authorized')
  ) {
    return {
      raw,
      isRateLimited: false,
      message: `You do not have permission to ${action}.`,
    };
  }

  if (
    lowered.includes('network') ||
    lowered.includes('failed to fetch') ||
    lowered.includes('timeout')
  ) {
    return {
      raw,
      isRateLimited: false,
      message: `Network issue while trying to ${action}. Check your connection and retry.`,
    };
  }

  return {
    raw,
    isRateLimited: false,
    message: `Could not ${action}. ${raw}`,
  };
}

