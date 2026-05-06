// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const allowedOrigins = [
  'https://subpool.app',
  'https://www.subpool.app',
  'http://localhost:5173',
  'http://localhost:4173',
];

const corsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-reminder-secret',
};

type PreferenceRow = {
  user_id: string;
  all_notifs: boolean;
  payment_reminders: boolean;
  weekly_digest: boolean;
  digest_day: number;
  digest_hour_utc: number;
};

function isoWeekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const admin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    const anon = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } },
    );

    const body = await req.json().catch(() => ({}));
    const targetUserId = body?.user_id as string | undefined;
    const dryRun = Boolean(body?.dry_run);
    const now = new Date();
    const currentDate = now.toISOString().slice(0, 10);
    const weekday = now.getUTCDay();
    const hour = now.getUTCHours();
    const runSecret = req.headers.get('x-reminder-secret') ?? '';
    const configuredSecret = Deno.env.get('REMINDER_ENGINE_SECRET') ?? '';

    let scopedUserId: string | null = null;

    if (targetUserId) {
      const { data: { user }, error } = await anon.auth.getUser();
      if (error || !user || user.id !== targetUserId) {
        return new Response(JSON.stringify({ error: 'Unauthorized user scope' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      scopedUserId = targetUserId;
    } else {
      if (!configuredSecret || runSecret !== configuredSecret) {
        return new Response(JSON.stringify({ error: 'Missing or invalid scheduler secret' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    let prefQuery = admin
      .from('notification_preferences')
      .select('user_id, all_notifs, payment_reminders, weekly_digest, digest_day, digest_hour_utc');

    if (scopedUserId) {
      prefQuery = prefQuery.eq('user_id', scopedUserId);
    }

    const { data: prefsRows, error: prefErr } = await prefQuery;
    if (prefErr) throw prefErr;

    let generatedCount = 0;
    const generated: Array<{ user_id: string; type: string; dedupe_key: string }> = [];

    for (const pref of (prefsRows ?? []) as PreferenceRow[]) {
      if (!pref.all_notifs) continue;

      if (pref.payment_reminders) {
        const { data: ledgerRows, error: ledgerErr } = await admin
          .from('ledger')
          .select(`
            id,
            due_date,
            amount,
            membership:memberships!inner(
              user_id,
              pool:pools(platform, plan_name)
            )
          `)
          .eq('status', 'owed')
          .eq('membership.user_id', pref.user_id)
          .lte('due_date', new Date(now.getTime() + 3 * 86400000).toISOString().slice(0, 10));

        if (ledgerErr) throw ledgerErr;

        for (const row of ledgerRows ?? []) {
          const dueDate = row.due_date as string;
          const isOverdue = dueDate < currentDate;
          const reminderType = isOverdue ? 'payment_overdue' : 'payment_due';
          const dedupeKey = `${reminderType}:${row.id}:${currentDate}`;
          const { data: existing } = await admin
            .from('reminder_dispatch_log')
            .select('id')
            .eq('dedupe_key', dedupeKey)
            .maybeSingle();

          if (existing) continue;

          const platform = (row as any).membership?.pool?.platform ?? 'your pool';
          const amount = (Number(row.amount ?? 0) / 100).toFixed(2);
          const title = isOverdue ? 'Payment overdue reminder' : 'Upcoming payment reminder';
          const bodyText = isOverdue
            ? `Your ${platform} share of $${amount} is overdue. Please settle to avoid host penalties.`
            : `Your ${platform} share of $${amount} is due by ${dueDate}.`;

          if (!dryRun) {
            const { error: notifErr } = await admin.from('notifications').insert({
              user_id: pref.user_id,
              type: 'warning',
              title,
              body: bodyText,
              action_url: '/ledger',
            });
            if (notifErr) throw notifErr;

            const { error: logErr } = await admin.from('reminder_dispatch_log').insert({
              user_id: pref.user_id,
              reminder_type: reminderType,
              dedupe_key: dedupeKey,
              payload: { ledger_id: row.id, due_date: dueDate, amount },
            });
            if (logErr) throw logErr;
          }

          generatedCount += 1;
          generated.push({ user_id: pref.user_id, type: reminderType, dedupe_key: dedupeKey });
        }
      }

      const shouldRunDigestWindow =
        pref.weekly_digest &&
        pref.digest_day === weekday &&
        hour >= pref.digest_hour_utc &&
        hour < pref.digest_hour_utc + 2;

      if (shouldRunDigestWindow) {
        const digestDedupe = `weekly_digest:${pref.user_id}:${isoWeekKey(now)}`;
        const { data: digestExisting } = await admin
          .from('reminder_dispatch_log')
          .select('id')
          .eq('dedupe_key', digestDedupe)
          .maybeSingle();

        if (!digestExisting) {
          const [{ count: outstandingCount }, { count: unreadCount }] = await Promise.all([
            admin
              .from('ledger')
              .select('id, membership:memberships!inner(user_id)', { count: 'exact', head: true })
              .eq('status', 'owed')
              .eq('membership.user_id', pref.user_id),
            admin
              .from('notifications')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', pref.user_id)
              .eq('read', false),
          ]);

          if (!dryRun) {
            const { error: digestNotifErr } = await admin.from('notifications').insert({
              user_id: pref.user_id,
              type: 'info',
              title: 'Your weekly SubPool digest',
              body: `You have ${outstandingCount ?? 0} pending ledger items and ${unreadCount ?? 0} unread updates.`,
              action_url: '/notifications',
            });
            if (digestNotifErr) throw digestNotifErr;

            const { error: digestLogErr } = await admin.from('reminder_dispatch_log').insert({
              user_id: pref.user_id,
              reminder_type: 'weekly_digest',
              dedupe_key: digestDedupe,
              payload: { outstanding_count: outstandingCount ?? 0, unread_count: unreadCount ?? 0 },
            });
            if (digestLogErr) throw digestLogErr;
          }

          generatedCount += 1;
          generated.push({ user_id: pref.user_id, type: 'weekly_digest', dedupe_key: digestDedupe });
        }
      }
    }

    return new Response(JSON.stringify({
      ok: true,
      dry_run: dryRun,
      generated_count: generatedCount,
      generated,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
