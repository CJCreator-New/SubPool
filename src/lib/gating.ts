import { UserPlan, getTierBenefits } from './monetization';
import type { Profile } from './types';

export type FeatureKey = 
  | 'MAX_ACTIVE_POOLS' 
  | 'MAX_JOINED_POOLS'
  | 'HAS_ANALYTICS' 
  | 'HAS_ARBITRAGE_SIGNALS' 
  | 'PRIORITY_SUPPORT' 
  | 'IS_VERIFIED' 
  | 'MAX_MEMBERS_PER_POOL';

/**
 * Checks if a user has access to a specific feature or if they've hit a limit.
 */
export function checkPlanAccess(profile: Profile | null, feature: FeatureKey, currentCount: number = 0) {
  const plan = (profile?.plan as UserPlan) || 'free';
  const benefits = getTierBenefits(plan);

  switch (feature) {
    case 'MAX_ACTIVE_POOLS':
      return {
        allowed: currentCount < benefits.maxActivePools,
        limit: benefits.maxActivePools,
        current: currentCount
      };
    case 'MAX_JOINED_POOLS':
      return {
        allowed: currentCount < benefits.maxJoinedPools,
        limit: benefits.maxJoinedPools,
        current: currentCount
      };
    case 'HAS_ANALYTICS':
      return { allowed: benefits.hasAnalytics };
    case 'HAS_ARBITRAGE_SIGNALS':
      return { allowed: benefits.hasArbitrageSignals };
    case 'PRIORITY_SUPPORT':
      return { allowed: benefits.prioritySupport };
    case 'IS_VERIFIED':
      return { allowed: benefits.isVerified };
    default:
      return { allowed: true };
  }
}

/**
 * Returns the upgrade message for a feature.
 */
export function getUpgradeMessage(feature: FeatureKey): string {
  switch (feature) {
    case 'MAX_ACTIVE_POOLS':
      return "You've reached your operational node limit. Upgrade to Pro to scale your subscription network.";
    case 'MAX_JOINED_POOLS':
      return "You've reached the join limit for Free accounts. Upgrade to Pro for unlimited subscription access.";
    case 'HAS_ANALYTICS':
      return "Node Analytics is a Pro feature. Upgrade to gain deep insights into your pool performance.";
    case 'HAS_ARBITRAGE_SIGNALS':
      return "Market Intelligence requires Host Plus. Unlock data-driven pricing signals and reseller tools.";
    default:
      return "This feature requires a premium uplink. Upgrade your plan to continue.";
  }
}
