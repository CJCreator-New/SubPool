import { z } from 'zod';

export const analyticsEventSchemas = {
    market_intelligence_expanded: z.object({}),
    pool_card_clicked: z.object({
        poolId: z.string().min(1),
        platformId: z.string().min(1),
    }),
    activation_checklist_viewed: z.object({
        source: z.enum(['onboarding', 'dashboard', 'manual']),
    }),
    activation_step_completed: z.object({
        step: z.enum(['profile_completed', 'first_join_request', 'notification_interaction']),
    }),
} as const;

export type AnalyticsEventName = keyof typeof analyticsEventSchemas;
export type AnalyticsProperties<N extends AnalyticsEventName> = z.infer<(typeof analyticsEventSchemas)[N]>;

const genericPropertiesSchema = z.record(
    z.string(),
    z.union([z.string(), z.number(), z.boolean(), z.null()]),
);

export function validateAnalyticsProperties(
    eventName: string,
    properties?: Record<string, unknown>,
): Record<string, unknown> {
    if (eventName in analyticsEventSchemas) {
        const schema = analyticsEventSchemas[eventName as AnalyticsEventName];
        return schema.parse(properties ?? {});
    }
    return genericPropertiesSchema.parse(properties ?? {});
}
