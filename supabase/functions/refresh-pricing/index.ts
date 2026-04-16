// @ts-nocheck — This file runs in the Deno runtime (Supabase Edge Functions), not Node.js.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

        const { platform_id, country_codes } = await req.json()
        const apiKey = Deno.env.get('RETAILSCRAPE_KEY')

        if (!apiKey) throw new Error('Missing RETAILSCRAPE_KEY secret')
        if (!platform_id || !country_codes) throw new Error('Missing requested parameters')

        let updated = 0
        let errors: string[] = []

        const startMs = Date.now()

        for (const country of country_codes) {
            try {
                const url = `https://api.retailscrape.com/v1/pricing?platform=${platform_id}&country=${country}`
                const apiRes = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}` } })

                if (!apiRes.ok) throw new Error(`API returned ${apiRes.status}`)

                const raw = await apiRes.json()
                const records = raw.plans?.map((p: any) => ({
                    platform_id: raw.platform,
                    platform_name: raw.platform,
                    category: 'OTT',
                    plan_name: p.name,
                    billing_cycle: p.billing_cycle || 'monthly',
                    country_code: raw.country,
                    currency: raw.currency,
                    official_price: p.price,
                    source: 'retailscrape'
                })) || []

                if (records.length > 0) {
                    const { error: upsertErr } = await supabaseClient
                        .from('platform_pricing')
                        .upsert(records, { onConflict: 'platform_id, plan_name, billing_cycle, country_code' })

                    if (upsertErr) throw upsertErr
                    updated += records.length
                }
            } catch (e: any) {
                errors.push(`Failed for ${country}: ${e.message}`)
            }
        }

        const { error: logErr } = await supabaseClient
            .from('pricing_refresh_log')
            .insert({
                platform_id,
                source: 'retailscrape',
                status: errors.length > 0 ? (updated > 0 ? 'partial' : 'failed') : 'success',
                records_updated: updated,
                error_message: errors.join('; '),
                duration_ms: Date.now() - startMs
            })

        if (logErr) console.error("Could not write to pricing_refresh_log:", logErr)

        return new Response(
            JSON.stringify({ updated, errors }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        })
    }
})
