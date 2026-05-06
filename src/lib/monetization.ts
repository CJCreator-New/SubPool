/**
 * SubPool Monetization & Fee Protocol
 * Centralized logic for calculating platform fees, processing costs, and tier benefits.
 */

import { PLATFORM_FEE_BPS, PROCESSING_FEE_BPS, PROCESSING_FLAT_USD } from './constants';

export type UserPlan = 'free' | 'pro' | 'host_plus' | 'enterprise';

export interface FeeBreakdown {
    baseAmountCents: number;
    platformFeeCents: number;
    processingFeeCents: number;
    netAmountCents: number;
    totalDeductionsCents: number;
}

/**
 * Calculates a detailed fee breakdown for a transaction.
 */
export function calculateFeeBreakdown(amountCents: number, plan: UserPlan = 'free'): FeeBreakdown {
    // Basic Platform Fee (5%)
    let platformFeeBps = PLATFORM_FEE_BPS;
    
    // Pro/Host Plus tiers get reduced platform fees
    if (plan === 'pro') platformFeeBps = 350; // 3.5%
    if (plan === 'host_plus') platformFeeBps = 200; // 2.0%
    if (plan === 'enterprise') platformFeeBps = 100; // 1.0%

    const platformFeeCents = Math.round((amountCents * platformFeeBps) / 10000);
    
    // Processing fees (e.g. Stripe: 2.9% + 30c)
    const variableProcessingCents = Math.round((amountCents * PROCESSING_FEE_BPS) / 10000);
    const flatProcessingCents = Math.round(PROCESSING_FLAT_USD * 100);
    const processingFeeCents = variableProcessingCents + flatProcessingCents;

    const totalDeductionsCents = platformFeeCents + processingFeeCents;
    const netAmountCents = Math.max(0, amountCents - totalDeductionsCents);

    return {
        baseAmountCents: amountCents,
        platformFeeCents,
        processingFeeCents,
        netAmountCents,
        totalDeductionsCents,
    };
}

export interface TierBenefits {
    label: string;
    maxActivePools: number;
    maxJoinedPools: number;
    platformFeeBps: number;
    hasAnalytics: boolean;
    hasArbitrageSignals: boolean;
    prioritySupport: boolean;
    isVerified: boolean;
}

/**
 * Returns benefit configuration for a given user plan.
 */
export function getTierBenefits(plan: UserPlan): TierBenefits {
    switch (plan) {
        case 'host_plus':
            return {
                label: 'Host Plus',
                maxActivePools: 50,
                maxJoinedPools: 999,
                platformFeeBps: 200,
                hasAnalytics: true,
                hasArbitrageSignals: true,
                prioritySupport: true,
                isVerified: true
            };
        case 'pro':
            return {
                label: 'Pro Member',
                maxActivePools: 10,
                maxJoinedPools: 999,
                platformFeeBps: 350,
                hasAnalytics: true,
                hasArbitrageSignals: false,
                prioritySupport: false,
                isVerified: true
            };
        case 'enterprise':
            return {
                label: 'Enterprise',
                maxActivePools: 999,
                maxJoinedPools: 999,
                platformFeeBps: 100,
                hasAnalytics: true,
                hasArbitrageSignals: true,
                prioritySupport: true,
                isVerified: true
            };
        default:
            return {
                label: 'Free Tier',
                maxActivePools: 3,
                maxJoinedPools: 3,
                platformFeeBps: 500,
                hasAnalytics: false,
                hasArbitrageSignals: false,
                prioritySupport: false,
                isVerified: false
            };
    }
}
