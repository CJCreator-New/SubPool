// ─── Zod Validation Schemas ──────────────────────────────────────────────────
// Centralized form validation using Zod for full type-safety.
// Use with react-hook-form/zodResolver or manually via schema.safeParse().

import { z } from 'zod';

// ─── Pool Creation ───────────────────────────────────────────────────────────

export const CreatePoolSchema = z.object({
    platform: z.string().min(1, 'Select a platform'),
    plan_name: z.string().min(1, 'Plan name is required').max(80),
    category: z.enum(['OTT', 'AI_IDE', 'productivity', 'ai'], {
        required_error: 'Select a category',
    }),
    total_cost: z
        .number({ invalid_type_error: 'Enter a valid cost' })
        .positive('Cost must be greater than 0')
        .max(1000, 'Cost seems too high'),
    total_slots: z
        .number({ invalid_type_error: 'Enter a number' })
        .int()
        .min(2, 'Minimum 2 slots')
        .max(10, 'Maximum 10 slots'),
    billing_cycle: z.enum(['monthly', 'yearly']),
});

export type CreatePoolInput = z.infer<typeof CreatePoolSchema>;

// ─── Wishlist Request ────────────────────────────────────────────────────────

export const WishlistRequestSchema = z.object({
    platform: z.string().min(1, 'Select a platform'),
    plan_name: z.string().optional(),
    budget_max: z
        .number({ invalid_type_error: 'Enter a budget' })
        .positive('Budget must be positive')
        .max(500),
    urgency: z.enum(['low', 'medium', 'high']).default('medium'),
    notes: z.string().max(300).optional(),
});

export type WishlistRequestInput = z.infer<typeof WishlistRequestSchema>;

// ─── Profile Update ──────────────────────────────────────────────────────────

export const ProfileUpdateSchema = z.object({
    display_name: z.string().min(2, 'At least 2 characters').max(50).optional(),
    bio: z.string().max(200, 'Bio too long').optional(),
    avatar_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>;

// ─── Join Pool Message ───────────────────────────────────────────────────────

export const JoinPoolMessageSchema = z.object({
    message: z.string().max(300, 'Message too long — keep it under 300 chars').optional(),
});

// ─── Send Chat Message ───────────────────────────────────────────────────────

export const SendMessageSchema = z.object({
    body: z
        .string()
        .min(1, 'Message cannot be empty')
        .max(2000, 'Message is too long'),
});

// ─── Utility: form error to message string ───────────────────────────────────

export function zodErrorToString(error: z.ZodError): string {
    return error.errors.map(e => e.message).join(', ');
}

// ─── Utility: XSS String Sanitization (Level 5 SecOps) ───────────────────────

export function sanitizeInput(input: string): string {
    if (!input) return '';
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}
