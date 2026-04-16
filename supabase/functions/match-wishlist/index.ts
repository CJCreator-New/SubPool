// @ts-nocheck — This file runs in the Deno runtime (Supabase Edge Functions), not Node.js.
/**
 * match-wishlist Edge Function
 * 
 * Triggered when a new pool is created or when manually called.
 * Finds wishlist requests that match the pool and creates notifications.
 * 
 * Matching criteria:
 * - Same platform
 * - Pool price per slot <= wishlist budget_max
 * - Wishlist status is 'open'
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PoolInfo {
    id: string;
    platform: string;
    price_per_slot: number;
    plan_name: string;
    owner_id: string;
}

interface WishlistMatch {
    id: string;
    user_id: string;
    platform: string;
    budget_max: number;
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Get pool info from request body
        const { pool_id } = await req.json()

        if (!pool_id) {
            throw new Error('Missing pool_id parameter')
        }

        // Fetch the pool details
        const { data: pool, error: poolError } = await supabaseClient
            .from('pools')
            .select('id, platform, price_per_slot, plan_name, owner_id')
            .eq('id', pool_id)
            .single()

        if (poolError || !pool) {
            throw new Error(`Pool not found: ${poolError?.message}`)
        }

        const poolInfo = pool as PoolInfo

        // Find matching wishlist requests
        // Match criteria: same platform, price within budget, status is open
        // Don't match the pool owner's own wishlist
        const { data: matches, error: matchError } = await supabaseClient
            .from('wishlist_requests')
            .select('id, user_id, platform, budget_max')
            .eq('platform', poolInfo.platform)
            .eq('status', 'open')
            .neq('user_id', poolInfo.owner_id)  // Don't notify the pool owner
            .gte('budget_max', poolInfo.price_per_slot)  // User's budget >= pool price

        if (matchError) {
            throw new Error(`Failed to find matches: ${matchError.message}`)
        }

        const wishlistMatches = matches as WishlistMatch[]

        if (wishlistMatches.length === 0) {
            return new Response(
                JSON.stringify({ matched: 0, notifications: 0 }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            )
        }

        // Create notifications for each matched user
        const notifications = wishlistMatches.map(match => ({
            user_id: match.user_id,
            type: 'info',
            icon: '🎯',
            title: 'New pool matches your wishlist!',
            body: `A new ${poolInfo.platform} pool (${poolInfo.plan_name}) is now available at $${poolInfo.price_per_slot}/slot - within your $${match.budget_max} budget!`,
            source_id: poolInfo.id,
            source_type: 'pool',
            read: false
        }))

        const { data: insertedNotifications, error: notificationError } = await supabaseClient
            .from('notifications')
            .insert(notifications)
            .select()

        if (notificationError) {
            throw new Error(`Failed to create notifications: ${notificationError.message}`)
        }

        console.log(`Matched ${wishlistMatches.length} wishlist requests for pool ${pool_id}`)

        return new Response(
            JSON.stringify({
                matched: wishlistMatches.length,
                notifications: insertedNotifications?.length ?? 0
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        })
    }
})
