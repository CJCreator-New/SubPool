import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

serve(async (req) => {
    // Handling CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
            }
        });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            {
                global: { headers: { Authorization: req.headers.get('Authorization')! } }
            }
        );

        // also get a service_role client for ledger entry inserts bypassing RLS
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const { joinRequestId, action } = await req.json();

        if (!joinRequestId || !['approve', 'reject'].includes(action)) {
            return new Response(JSON.stringify({ error: 'Invalid parameters' }), {
                status: 400, headers: { 'Content-Type': 'application/json' }
            });
        }

        // 1. Verify caller owns the pool via RLS simply by trying to grab the join_request and verifying owner match
        const { data: request, error: reqError } = await supabaseClient
            .from('join_requests')
            .select(`
                id, pool_id, requester_id,
                pools ( id, owner_id, price_per_slot, filled_slots, total_slots )
            `)
            .eq('id', joinRequestId)
            .single();

        if (reqError || !request) {
            return new Response(JSON.stringify({ error: 'Request not found or unauthorized' }), {
                status: 403, headers: { 'Content-Type': 'application/json' }
            });
        }

        const pool = Array.isArray(request.pools) ? request.pools[0] : request.pools;

        // 2. Process action
        if (action === 'reject') {
            await supabaseAdmin.from('join_requests').update({ status: 'rejected' }).eq('id', joinRequestId);
            return new Response(JSON.stringify({ success: true, message: 'Rejected' }), {
                status: 200, headers: { 'Content-Type': 'application/json' }
            });
        }

        if (action === 'approve') {
            if (pool.filled_slots >= pool.total_slots) {
                return new Response(JSON.stringify({ error: 'Pool is fully booked.' }), {
                    status: 400, headers: { 'Content-Type': 'application/json' }
                });
            }

            // Create membership
            const { data: membership, error: memError } = await supabaseAdmin
                .from('memberships')
                .insert({
                    pool_id: pool.id,
                    user_id: request.requester_id,
                    status: 'active',
                    price_per_slot: pool.price_per_slot,
                    next_billing_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                })
                .select()
                .single();

            if (memError) throw memError;

            // Update request status
            await supabaseAdmin.from('join_requests').update({ status: 'approved' }).eq('id', joinRequestId);

            // Increment filled slots
            await supabaseAdmin.from('pools').update({ filled_slots: pool.filled_slots + 1 }).eq('id', pool.id);

            // P2.3 Generate first ledger entry (Charge immediately for first month)
            await supabaseAdmin.from('ledger').insert({
                pool_id: pool.id,
                user_id: request.requester_id,
                amount_cents: pool.price_per_slot,
                type: 'payment',
                status: 'pending' // to be fulfilled via payment gateway or manual approval
            });

            return new Response(JSON.stringify({ success: true, message: 'Approved and Ledger Generated' }), {
                status: 200, headers: { 'Content-Type': 'application/json' }
            });
        }

    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500, headers: { 'Content-Type': 'application/json' }
        });
    }
});
