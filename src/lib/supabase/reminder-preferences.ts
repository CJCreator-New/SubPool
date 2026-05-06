import { supabase } from './client';

export interface ReminderPreferencesRecord {
  user_id: string;
  all_notifs: boolean;
  payment_reminders: boolean;
  weekly_digest: boolean;
  digest_day: number;
  digest_hour_utc: number;
}

const defaultPrefs = (userId: string): ReminderPreferencesRecord => ({
  user_id: userId,
  all_notifs: true,
  payment_reminders: true,
  weekly_digest: true,
  digest_day: 1,
  digest_hour_utc: 9,
});

export async function fetchReminderPreferences(userId: string): Promise<ReminderPreferencesRecord> {
  if (!supabase) return defaultPrefs(userId);
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('user_id, all_notifs, payment_reminders, weekly_digest, digest_day, digest_hour_utc')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return defaultPrefs(userId);
  return data as ReminderPreferencesRecord;
}

export async function upsertReminderPreferences(input: ReminderPreferencesRecord): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('notification_preferences').upsert(input as any, { onConflict: 'user_id' });
  if (error) throw error;
}
