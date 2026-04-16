import { supabase } from './supabase/client';

const LAST_RUN_KEY = 'subpool:cadence:last-run';
const COOLDOWN_MS = 30 * 60 * 1000;

export async function triggerInAppReminderCadence(userId: string): Promise<void> {
  if (!supabase) return;
  const now = Date.now();
  const lastRunRaw = localStorage.getItem(LAST_RUN_KEY);
  const lastRun = lastRunRaw ? Number(lastRunRaw) : 0;

  if (now - lastRun < COOLDOWN_MS) return;

  try {
    await supabase.functions.invoke('generate-reminders', {
      body: { user_id: userId, dry_run: false },
    });
    localStorage.setItem(LAST_RUN_KEY, String(now));
  } catch (error) {
    console.warn('Reminder cadence invocation failed:', error);
  }
}
