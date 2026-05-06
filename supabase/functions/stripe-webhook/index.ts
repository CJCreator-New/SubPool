// @ts-nocheck — This file runs in the Deno runtime (Supabase Edge Functions), not Node.js.
// supabase/functions/stripe-webhook/index.ts
// Handles Stripe webhook events to mark ledger entries as paid.
// Verifies the webhook signature before processing — this is CRITICAL security.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2024-04-10',
  httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '';

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 });
  }

  // 1. Verify webhook signature — rejects forged requests
  let event: Stripe.Event;
  try {
    const body = await req.text();
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response('Webhook signature invalid', { status: 400 });
  }

  // 2. Handle the event
  const adminClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const { ledger_id, member_id } = session.metadata ?? {};

    if (!ledger_id) {
      console.error('No ledger_id in session metadata', session.id);
      return new Response('Missing metadata', { status: 400 });
    }

    // 3. Mark ledger entry as paid
    const { error } = await adminClient
      .from('ledger')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
      })
      .eq('id', ledger_id);

    if (error) {
      console.error('Failed to mark ledger paid:', error);
      return new Response('DB update failed', { status: 500 });
    }

    // 4. Notify pool owner that payment was received
    if (member_id) {
      // Fetch the ledger entry to get pool info via membership join
      const { data: entry } = await adminClient
        .from('ledger')
        .select('amount, membership:memberships(pool:pools(owner_id, platform))')
        .eq('id', ledger_id)
        .single();

      const pool = (entry as any)?.membership?.pool;
      if (pool?.owner_id) {
        await adminClient.from('notifications').insert({
          user_id: pool.owner_id,
          type: 'success',
          icon: '💰',
          title: 'Payment received',
          body: `A member paid $${(Number(entry?.amount ?? 0) / 100).toFixed(2)} for your ${pool.platform} pool.`,
          action_url: '/ledger',
        });
      }
    }

    console.log(`✅ Ledger ${ledger_id} marked as paid (session ${session.id})`);
  }

  // Acknowledge receipt — always return 200 so Stripe doesn't retry
  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
