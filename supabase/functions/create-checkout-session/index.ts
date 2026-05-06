// @ts-nocheck — This file runs in the Deno runtime (Supabase Edge Functions), not Node.js.
// supabase/functions/create-checkout-session/index.ts
// Creates a Stripe Checkout Session for a ledger payment.
// Called from the client — the session URL is returned and the browser redirects to Stripe.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2024-04-10',
  httpClient: Stripe.createFetchHttpClient(),
});

const allowedOrigins = [
  'https://subpool.app',
  'https://www.subpool.app',
  'http://localhost:5173',
  'http://localhost:4173',
];

serve(async (req) => {
  const origin = req.headers.get('origin') ?? '';
  const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  const corsHeaders = {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Authenticate the caller
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Parse body
    const { ledger_id } = await req.json() as { ledger_id: string };
    if (!ledger_id) {
      return new Response(JSON.stringify({ error: 'ledger_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Fetch the ledger entry (service role to bypass RLS)
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: entry, error: ledgerError } = await adminClient
      .from('ledger')
      .select('*, pools(platform, plan_name)')
      .eq('id', ledger_id)
      .eq('member_id', user.id)
      .single();

    if (ledgerError || !entry) {
      return new Response(JSON.stringify({ error: 'Ledger entry not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (entry.status === 'paid') {
      return new Response(JSON.stringify({ error: 'Already paid' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 4. Look up or create a Stripe customer
    const { data: profile } = await adminClient
      .from('profiles')
      .select('stripe_customer_id, display_name')
      .eq('id', user.id)
      .single();

    let customerId: string | undefined = profile?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: profile?.display_name ?? '',
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      // Save for next time
      await adminClient
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // 5. Create Checkout Session
    const origin = req.headers.get('origin') ?? 'https://subpool.vercel.app';
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: entry.amount,
            product_data: {
              name: `${entry.pools?.platform ?? 'Pool'} — ${entry.pools?.plan_name ?? 'Subscription'}`,
              description: `SubPool payment for ${entry.pools?.platform}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        ledger_id,
        member_id: user.id,
      },
      success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/ledger`,
    });

    // 6. Store the session ID on the ledger entry
    await adminClient
      .from('ledger')
      .update({ stripe_session_id: session.id, status: 'pending' })
      .eq('id', ledger_id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('create-checkout-session error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
